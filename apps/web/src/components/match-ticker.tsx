'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sword } from 'lucide-react';

interface MatchInfo {
  id: string;
  player1: { username: string };
  player2: { username: string };
  winner: { username: string } | null;
  tournament?: { name: string } | null;
}

export function MatchTicker({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);

  return (
    <div className="w-full bg-zinc-900/50 border-y-2 border-zinc-800 py-3 overflow-hidden whitespace-nowrap relative group">
      <div className="flex animate-marquee gap-12 items-center">
        {matches.length > 0 ? (
          // Duplicate for infinite scroll effect
          [...matches, ...matches].map((match, i) => (
            <div key={`${match.id}-${i}`} className="inline-flex items-center gap-4">
              <span className="font-press-start text-[8px] text-zinc-500 uppercase tracking-tighter">
                {match.tournament?.name || 'ARENA'}
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-press-start text-[10px] ${match.winner?.username === match.player1.username ? 'text-secondary' : 'text-white'}`}>
                  {match.player1.username}
                </span>
                <Sword size={12} className="text-primary" />
                <span className={`font-press-start text-[10px] ${match.winner?.username === match.player2.username ? 'text-secondary' : 'text-white'}`}>
                  {match.player2.username}
                </span>
              </div>
              <span className="font-press-start text-[10px] text-primary">
                WINNER: {match.winner?.username || 'DRAW'}
              </span>
              <span className="text-zinc-800 mx-4">|</span>
            </div>
          ))
        ) : (
          <div className="w-full text-center">
             <p className="font-press-start text-[10px] text-zinc-600">WAITING FOR SANCTIONED COMBAT RESULTS...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
