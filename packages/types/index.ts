export type Move = 'ROCK' | 'PAPER' | 'SCISSORS';

export type MatchResult = 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW';

export type TournamentStatus = 'DRAFT' | 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type MatchStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  username: string;
  avatar: string;
  elo: number;
  wins: number;
  losses: number;
}

export interface Tournament {
  id: string;
  name: string;
  format: string;
  status: TournamentStatus;
  hostId: string;
  startsAt: Date;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  seed?: number;
  wins: number;
  losses: number;
  points: number;
}

export interface Match {
  id: string;
  tournamentId?: string;
  round: number;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  status: MatchStatus;
}
