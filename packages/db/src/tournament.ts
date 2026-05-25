import { prisma, Tournament, User } from './index';
import { generateSingleEliminationBracket } from '@stonecold/game-engine';

export class TournamentService {
  static async createTournament(data: {
    name: string;
    hostId: string;
    format?: string;
    startsAt?: Date;
  }) {
    return prisma.tournament.create({
      data: {
        name: data.name,
        hostId: data.hostId,
        format: data.format || 'SINGLE_ELIMINATION',
        status: 'REGISTRATION',
        startsAt: data.startsAt,
      },
    });
  }

  static async getActiveTournaments() {
    return prisma.tournament.findMany({
      where: {
        status: {
          in: ['REGISTRATION', 'IN_PROGRESS'],
        },
      },
      include: {
        host: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });
  }

  static async joinTournament(tournamentId: string, userId: string) {
    return prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
      },
    });
  }

  static async getTournamentDetails(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        host: true,
        participants: {
          include: {
            user: true,
          },
          orderBy: {
            wins: 'desc',
          }
        },
        matches: {
          include: {
            rounds: true,
            player1: { select: { username: true } },
            player2: { select: { username: true } },
            winner: { select: { username: true } },
          },
          orderBy: [
            { round: 'asc' },
            { id: 'asc' }
          ]
        },
      },
    });
  }

  static async getLeaderboard(limit = 100) {
    return prisma.user.findMany({
      orderBy: {
        elo: 'desc',
      },
      take: limit,
      select: {
        id: true,
        username: true,
        avatar: true,
        elo: true,
        wins: true,
        losses: true,
      }
    });
  }

  static async getRecentMatches(limit = 10) {
    return prisma.match.findMany({
      where: {
        status: 'COMPLETED',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        winner: { select: { username: true } },
        tournament: { select: { name: true } },
      }
    });
  }

  static async commenceTournament(id: string) {
    const tournament = await this.getTournamentDetails(id);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'REGISTRATION') throw new Error('Tournament is already started or completed');
    if (tournament.participants.length < 2) throw new Error('At least 2 participants required');

    const participantIds = tournament.participants.map(p => p.userId);
    const initialMatches = generateSingleEliminationBracket(participantIds, id);

    // Create matches in transaction
    await prisma.$transaction([
      prisma.tournament.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      }),
      prisma.match.createMany({
        data: initialMatches.map(m => ({
          tournamentId: id,
          round: m.round!,
          player1Id: m.player1Id!,
          player2Id: m.player2Id!,
          status: m.status!,
          winnerId: m.winnerId,
        })),
      }),
    ]);

    return this.getTournamentDetails(id);
  }
}
