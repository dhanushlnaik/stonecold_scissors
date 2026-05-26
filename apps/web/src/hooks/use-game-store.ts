import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Move, MatchResult } from '@stonecold/types';

export type MatchFormat = 'BEST_OF_3' | 'BEST_OF_5';

export interface RoundResult {
  p1: { id: string; move: Move };
  p2: { id: string; move: Move };
  result: MatchResult;
  player1Score: number;
  player2Score: number;
  roundNumber: number;
  totalRounds: number;
  matchComplete: boolean;
  format: MatchFormat;
}

interface GameState {
  socket: Socket | null;
  matchId: string | null;
  userId: string | null;
  countdown: number | null;
  matchStarted: boolean;
  moveSubmitted: boolean;
  opponentMoved: boolean;
  participantCount: number;
  // Round state
  result: RoundResult | null;
  player1Score: number;
  player2Score: number;
  roundNumber: number;
  totalRounds: number;
  matchComplete: boolean;
  format: MatchFormat;
  // Actions
  connect: (url: string) => void;
  joinMatch: (matchId: string, userId: string) => void;
  submitMove: (move: Move) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  matchId: null,
  userId: null,
  countdown: null,
  matchStarted: false,
  moveSubmitted: false,
  opponentMoved: false,
  participantCount: 0,
  result: null,
  player1Score: 0,
  player2Score: 0,
  roundNumber: 1,
  totalRounds: 3,
  matchComplete: false,
  format: 'BEST_OF_3',

  connect: (url) => {
    if (get().socket) return;
    const socket = io(url);

    // When a new countdown fires, the server is starting a new round —
    // clear per-round UI state but preserve the running score.
    socket.on('countdown', (count: number) => {
      if (count === 3) {
        set({
          countdown: count,
          result: null,
          moveSubmitted: false,
          opponentMoved: false,
          matchStarted: false,
        });
      } else {
        set({ countdown: count });
      }
    });

    socket.on('match_start', () => {
      set({ matchStarted: true, countdown: null });
    });

    socket.on('room_status', ({ participantCount }: { participantCount: number }) => {
      set({ participantCount });
    });

    socket.on('opponent_moved', () => {
      set({ opponentMoved: true });
    });

    socket.on('reveal_results', (data: RoundResult) => {
      set({
        result: data,
        player1Score: data.player1Score ?? 0,
        player2Score: data.player2Score ?? 0,
        roundNumber:  data.roundNumber  ?? 1,
        totalRounds:  data.totalRounds  ?? 3,
        matchComplete: data.matchComplete ?? false,
        format: data.format ?? 'BEST_OF_3',
      });
    });

    set({ socket });
  },

  joinMatch: (matchId, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join_match', matchId);
      set({ matchId, userId });
    }
  },

  submitMove: (move) => {
    const { socket, matchId, userId } = get();
    if (socket && matchId && userId) {
      socket.emit('submit_move', { matchId, userId, move });
      set({ moveSubmitted: true });
    }
  },

  reset: () => {
    set({
      moveSubmitted: false,
      opponentMoved: false,
      result: null,
      matchStarted: false,
      countdown: null,
      player1Score: 0,
      player2Score: 0,
      roundNumber: 1,
      totalRounds: 3,
      matchComplete: false,
    });
  },
}));
