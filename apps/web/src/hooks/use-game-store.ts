import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Move, MatchResult } from '@stonecold/types';

interface GameState {
  socket: Socket | null;
  matchId: string | null;
  userId: string | null;
  countdown: number | null;
  matchStarted: boolean;
  moveSubmitted: boolean;
  opponentMoved: boolean;
  participantCount: number;
  result: {
    p1: { id: string; move: Move };
    p2: { id: string; move: Move };
    result: MatchResult;
  } | null;
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

  connect: (url) => {
    if (get().socket) return;
    const socket = io(url);

    socket.on('countdown', (count: number) => {
      set({ countdown: count });
    });

    socket.on('match_start', () => {
      set({ matchStarted: true, countdown: null });
    });

    socket.on('room_status', ({ participantCount }) => {
      set({ participantCount });
    });

    socket.on('opponent_moved', () => {
      set({ opponentMoved: true });
    });

    socket.on('reveal_results', (data) => {
      set({ result: data });
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
    });
  },
}));
