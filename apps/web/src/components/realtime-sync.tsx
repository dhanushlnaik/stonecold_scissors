'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/use-game-store';

export function RealtimeSync({ 
  tournamentId, 
  mode 
}: { 
  tournamentId?: string, 
  mode: 'tournament' | 'rankings' 
}) {
  const router = useRouter();
  const { socket, connect } = useGameStore();

  useEffect(() => {
    connect(process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:4000');
  }, [connect]);

  useEffect(() => {
    if (!socket) return;

    if (mode === 'tournament' && tournamentId) {
      socket.emit('join_tournament', tournamentId);
      
      socket.on('tournament_refresh', () => {
        console.log('Realtime update: Refreshing tournament data...');
        router.refresh();
      });
    }

    if (mode === 'rankings') {
      socket.on('rankings_refresh', () => {
        console.log('Realtime update: Refreshing global rankings...');
        router.refresh();
      });
    }

    return () => {
      socket.off('tournament_refresh');
      socket.off('rankings_refresh');
    };
  }, [socket, mode, tournamentId, router]);

  return null;
}
