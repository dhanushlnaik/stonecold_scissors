import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Redis from 'ioredis';
import { determineWinner } from '@stonecold/game-engine';
import { Move } from '@stonecold/types';
import { prisma } from '@stonecold/db';
import * as dotenv from 'dotenv';
import path from 'path';

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function startCountdown(matchId: string) {
  const roomKey = `match:${matchId}`;
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

function winsNeededForFormat(format: string): number {
  return format === 'BEST_OF_5' ? 3 : 2;
}

function totalRoundsForFormat(format: string): number {
  return format === 'BEST_OF_5' ? 5 : 3;
}

async function handleMatchComplete(matchId: string, winnerId: string, loserId: string) {
  try {
    const [winner, loser] = await Promise.all([
      prisma.user.findUnique({ where: { id: winnerId } }),
      prisma.user.findUnique({ where: { id: loserId } }),
    ]);

    if (!winner || !loser) return;

    const k = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const expectedLoser  = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
    const newWinnerElo   = Math.round(winner.elo + k * (1 - expectedWinner));
    const newLoserElo    = Math.round(loser.elo  + k * (0 - expectedLoser));

    await prisma.$transaction([
      prisma.match.update({
        where: { id: matchId },
        data: { status: 'COMPLETED', winnerId, completedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: winnerId },
        data: { elo: newWinnerElo, wins: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: { elo: newLoserElo, losses: { increment: 1 } },
      }),
    ]);

    // Tournament auto-progression
    const completedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      select: { tournamentId: true, round: true },
    });

    if (completedMatch?.tournamentId) {
      const roundMatches = await prisma.match.findMany({
        where: { tournamentId: completedMatch.tournamentId, round: completedMatch.round },
        orderBy: { id: 'asc' },
      });

      const matchIndex    = roundMatches.findIndex((m: any) => m.id === matchId);
      const nextRound     = completedMatch.round + 1;
      const nextMatchIdx  = Math.floor(matchIndex / 2);
      const isP1Slot      = matchIndex % 2 === 0;

      const nextRoundMatches = await prisma.match.findMany({
        where: { tournamentId: completedMatch.tournamentId, round: nextRound },
        orderBy: { id: 'asc' },
      });

      let nextMatch = nextRoundMatches[nextMatchIdx];

      if (!nextMatch) {
        const totalParticipants = await prisma.tournamentParticipant.count({
          where: { tournamentId: completedMatch.tournamentId },
        });
        const maxRounds = Math.ceil(Math.log2(totalParticipants));

        if (nextRound <= maxRounds) {
          const tournamentRecord = await prisma.tournament.findUnique({
            where: { id: completedMatch.tournamentId },
            select: { matchFormat: true },
          });
          nextMatch = await prisma.match.create({
            data: {
              tournamentId: completedMatch.tournamentId,
              round: nextRound,
              player1Id: isP1Slot ? winnerId : 'TBD',
              player2Id: isP1Slot ? 'TBD' : winnerId,
              status: 'WAITING',
              format: tournamentRecord?.matchFormat ?? 'BEST_OF_3',
            },
          });
        }
      } else {
        await prisma.match.update({
          where: { id: nextMatch.id },
          data: { [isP1Slot ? 'player1Id' : 'player2Id']: winnerId },
        });
      }

      io.to(`tournament:${completedMatch.tournamentId}`).emit('tournament_refresh');
    }

    io.emit('rankings_refresh');
  } catch (err) {
    console.error('handleMatchComplete error:', err);
  }
}

// ── Socket handlers ───────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_match', async (matchId: string) => {
    socket.join(`match:${matchId}`);

    const roomKey = `match:${matchId}`;
    const room = io.sockets.adapter.rooms.get(roomKey);
    const participantCount = room ? room.size : 0;

    io.to(roomKey).emit('room_status', { participantCount });

    if (participantCount === 2) {
      // For formal matches, initialise per-match state in Redis
      if (!matchId.startsWith('global-')) {
        const stateKey = `match:${matchId}:state`;
        const stateExists = await redis.exists(stateKey);
        if (!stateExists) {
          const match = await prisma.match.findUnique({
            where: { id: matchId },
            select: { player1Id: true, player2Id: true, format: true },
          });
          if (match) {
            await redis.hset(stateKey, {
              p1Id: match.player1Id,
              p2Id: match.player2Id,
              p1Score: '0',
              p2Score: '0',
              round: '1',
              format: match.format,
            });
            await redis.expire(stateKey, 7200);
          }
        }
      }

      startCountdown(matchId);
    }
  });

  socket.on('join_tournament', (tournamentId: string) => {
    socket.join(`tournament:${tournamentId}`);
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room.startsWith('match:')) {
        const remaining = io.sockets.adapter.rooms.get(room)?.size ?? 1;
        io.to(room).emit('room_status', { participantCount: remaining - 1 });
      }
    }
  });

  socket.on('submit_move', async ({ matchId, userId, move }: { matchId: string; userId: string; move: Move }) => {
    const isFormal  = !matchId.startsWith('global-');
    const movesKey  = `match:${matchId}:moves`;
    const stateKey  = `match:${matchId}:state`;

    await redis.hset(movesKey, userId, move);
    await redis.expire(movesKey, 3600);

    // Auth check + status bump for formal matches
    if (isFormal) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { player1Id: true, player2Id: true, status: true },
      });
      if (!match || (userId !== match.player1Id && userId !== match.player2Id)) {
        console.warn(`Unauthorized move by ${userId} for match ${matchId}`);
        return;
      }
      if (match.status === 'WAITING') {
        await prisma.match.update({ where: { id: matchId }, data: { status: 'IN_PROGRESS' } });
      }
    }

    const moves = await redis.hgetall(movesKey);

    if (Object.keys(moves).length < 2) {
      socket.to(`match:${matchId}`).emit('opponent_moved');
      return;
    }

    // ── Both moves in — resolve round ────────────────────────────────────────

    let p1Id: string, p2Id: string;
    let p1Score: number, p2Score: number;
    let roundNumber: number;
    let format: string;

    if (isFormal) {
      const state = await redis.hgetall(stateKey);
      p1Id        = state.p1Id;
      p2Id        = state.p2Id;
      p1Score     = parseInt(state.p1Score ?? '0', 10);
      p2Score     = parseInt(state.p2Score ?? '0', 10);
      roundNumber = parseInt(state.round    ?? '1', 10);
      format      = state.format ?? 'BEST_OF_3';
    } else {
      [p1Id, p2Id] = Object.keys(moves);
      p1Score      = 0;
      p2Score      = 0;
      roundNumber  = 1;
      format       = 'BEST_OF_3';
    }

    const p1Move      = moves[p1Id] as Move;
    const p2Move      = moves[p2Id] as Move;
    const roundResult = determineWinner(p1Move, p2Move);

    if (roundResult === 'PLAYER1_WIN') p1Score++;
    else if (roundResult === 'PLAYER2_WIN') p2Score++;

    const needed       = winsNeededForFormat(format);
    const totalRounds  = totalRoundsForFormat(format);
    const matchComplete = isFormal && (p1Score >= needed || p2Score >= needed);

    // Persist the round record
    if (isFormal) {
      try {
        await prisma.matchRound.create({
          data: {
            matchId,
            roundNumber,
            player1Move: p1Move,
            player2Move: p2Move,
            result: roundResult === 'PLAYER1_WIN' ? 'P1_WIN'
                  : roundResult === 'PLAYER2_WIN' ? 'P2_WIN'
                  : 'DRAW',
          },
        });

        // Keep running score on the Match row too
        await prisma.match.update({
          where: { id: matchId },
          data: { player1Score: p1Score, player2Score: p2Score },
        });
      } catch (err) {
        console.error('Failed to persist round:', err);
      }
    }

    // Reveal to both players
    io.to(`match:${matchId}`).emit('reveal_results', {
      p1: { id: p1Id, move: p1Move },
      p2: { id: p2Id, move: p2Move },
      result: roundResult,
      player1Score:  p1Score,
      player2Score:  p2Score,
      roundNumber,
      totalRounds,
      matchComplete,
      format,
    });

    await redis.del(movesKey);

    if (matchComplete) {
      const winnerId = p1Score >= needed ? p1Id : p2Id;
      const loserId  = winnerId === p1Id  ? p2Id  : p1Id;
      await redis.del(stateKey);
      await handleMatchComplete(matchId, winnerId, loserId);
    } else {
      if (isFormal) {
        await redis.hset(stateKey, {
          p1Score: String(p1Score),
          p2Score: String(p2Score),
          round:   String(roundNumber + 1),
        });
        // 2-second breather, then next round countdown
        setTimeout(() => startCountdown(matchId), 2000);
      }
      // Global matches: client drives reset via "NEXT ROUND" button
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
