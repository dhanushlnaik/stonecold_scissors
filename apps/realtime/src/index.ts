import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Redis from 'ioredis';
import { determineWinner } from '@stonecold/game-engine';
import { Move } from '@stonecold/types';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('error', (err) => console.error('Redis Error:', err));
redis.on('connect', () => console.log('Connected to Redis'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_match', async (matchId: string) => {
    socket.join(`match:${matchId}`);
    console.log(`Socket ${socket.id} joined match ${matchId}`);

    const roomKey = `match:${matchId}`;
    const room = io.sockets.adapter.rooms.get(roomKey);
    const participantCount = room ? room.size : 0;

    io.to(roomKey).emit('room_status', { participantCount });

    if (participantCount === 2) {
      // Start countdown
      let count = 3;
      const interval = setInterval(() => {
        io.to(roomKey).emit('countdown', count);
        if (count === 0) {
          clearInterval(interval);
          io.to(roomKey).emit('match_start');
        }
        count--;
      }, 1000);
    }
  });

  socket.on('join_tournament', (tournamentId: string) => {
    socket.join(`tournament:${tournamentId}`);
    console.log(`Socket ${socket.id} joined tournament ${tournamentId}`);
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room.startsWith('match:')) {
        const remainingCount = io.sockets.adapter.rooms.get(room)?.size || 1;
        io.to(room).emit('room_status', { participantCount: remainingCount - 1 });
      }
    }
  });

  socket.on('submit_move', async ({ matchId, userId, move }: { matchId: string, userId: string, move: Move }) => {
    console.log(`User ${userId} submitted ${move} for match ${matchId}`);
    
    const movesKey = `match:${matchId}:moves`;
    await redis.hset(movesKey, userId, move);
    await redis.expire(movesKey, 3600); // 1 hour expiry

    const moves = await redis.hgetall(movesKey);
    const playerIds = Object.keys(moves);

    if (playerIds.length === 2) {
      const p1Id = playerIds[0];
      const p2Id = playerIds[1];
      const p1Move = moves[p1Id] as Move;
      const p2Move = moves[p2Id] as Move;

      const result = determineWinner(p1Move, p2Move);

      // Persist results to DB if it's a formal match
      if (!matchId.startsWith('global-')) {
        try {
          await prisma.matchRound.create({
            data: {
              matchId,
              player1Move: p1Move,
              player2Move: p2Move,
              winnerId: result === 'PLAYER1_WIN' ? p1Id : (result === 'PLAYER2_WIN' ? p2Id : null),
            }
          });

          // Check if match is finished (simplest: 1 round for now)
          if (result !== 'DRAW') {
            const winnerId = result === 'PLAYER1_WIN' ? p1Id : p2Id;
            const loserId = result === 'PLAYER1_WIN' ? p2Id : p1Id;

            const [winner, loser] = await Promise.all([
              prisma.user.findUnique({ where: { id: winnerId } }),
              prisma.user.findUnique({ where: { id: loserId } }),
            ]);

            if (winner && loser) {
              const k = 32;
              const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
              const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));

              const newWinnerElo = Math.round(winner.elo + k * (1 - expectedWinner));
              const newLoserElo = Math.round(loser.elo + k * (0 - expectedLoser));

              await prisma.$transaction([
                prisma.match.update({
                  where: { id: matchId },
                  data: {
                    status: 'COMPLETED',
                    winnerId: winnerId,
                  }
                }),
                prisma.user.update({
                  where: { id: winnerId },
                  data: { 
                    elo: newWinnerElo,
                    wins: { increment: 1 }
                  }
                }),
                prisma.user.update({
                  where: { id: loserId },
                  data: { 
                    elo: newLoserElo,
                    losses: { increment: 1 }
                  }
                })
              ]);

              // --- Tournament Progression Logic ---
              const completedMatch = await prisma.match.findUnique({
                where: { id: matchId },
                select: { 
                  tournamentId: true,
                  round: true,
                }
              });

              if (completedMatch?.tournamentId) {
                // Find all matches in this tournament and round to determine position
                const roundMatches = await prisma.match.findMany({
                  where: { 
                    tournamentId: completedMatch.tournamentId,
                    round: completedMatch.round,
                  },
                  orderBy: { id: 'asc' }
                });

                const matchIndex = roundMatches.findIndex(m => m.id === matchId);
                const nextRound = completedMatch.round + 1;
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const isP1Slot = matchIndex % 2 === 0;

                // Find or create the next match
                const nextRoundMatches = await prisma.match.findMany({
                  where: {
                    tournamentId: completedMatch.tournamentId,
                    round: nextRound,
                  },
                  orderBy: { id: 'asc' }
                });

                let nextMatch = nextRoundMatches[nextMatchIndex];

                if (!nextMatch) {
                  // If it's the final round, don't create more
                  const totalParticipants = await prisma.tournamentParticipant.count({
                    where: { tournamentId: completedMatch.tournamentId }
                  });
                  const maxRounds = Math.ceil(Math.log2(totalParticipants));
                  
                  if (nextRound <= maxRounds) {
                    nextMatch = await prisma.match.create({
                      data: {
                        tournamentId: completedMatch.tournamentId,
                        round: nextRound,
                        player1Id: isP1Slot ? winnerId : 'TBD',
                        player2Id: isP1Slot ? 'TBD' : winnerId,
                        status: 'WAITING'
                      }
                    });
                  }
                } else {
                  // Update existing match slot
                  await prisma.match.update({
                    where: { id: nextMatch.id },
                    data: {
                      [isP1Slot ? 'player1Id' : 'player2Id']: winnerId,
                      // If both players are now ready, set to WAITING (or READY)
                      status: (isP1Slot ? nextMatch.player2Id : nextMatch.player1Id) !== 'TBD' ? 'WAITING' : 'WAITING'
                    }
                  });
                }

                io.to(`tournament:${completedMatch.tournamentId}`).emit('tournament_refresh');
              }

              // Broadcast globally for rankings update
              io.emit('rankings_refresh');
            }
          }
        } catch (dbErr) {
          console.error('Failed to persist match results:', dbErr);
        }
      }

      io.to(`match:${matchId}`).emit('reveal_results', {
        p1: { id: p1Id, move: p1Move },
        p2: { id: p2Id, move: p2Move },
        result,
      });

      // Clear moves after reveal
      await redis.del(movesKey);
    } else {
      // Notify the other player that a move has been made (without revealing what it is)
      socket.to(`match:${matchId}`).emit('opponent_moved');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Realtime server running on port ${PORT}`);
});
