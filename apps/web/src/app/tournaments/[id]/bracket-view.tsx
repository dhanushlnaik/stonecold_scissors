'use client';

import { Match, MatchStatus } from '@stonecold/types';
import { Sword, Trophy } from 'lucide-react';
import Link from 'next/link';

interface MatchWithRounds extends Match {
  rounds: any[];
}

export function BracketView({ 
  matches, 
  participants 
}: { 
  matches: any[], 
  participants: { id: string; username: string }[] 
}) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-20 opacity-20">
        <p className="font-press-start text-sm mb-2">BRACKET DATA NOT INITIALIZED</p>
        <p className="font-press-start text-[8px]">WAITING FOR COMMENCEMENT...</p>
      </div>
    );
  }

  // Create a map for quick lookup
  const userMap = new Map(participants.map(p => [p.id, p.username]));

  // Group matches by round
  const rounds: Record<number, any[]> = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  const getPlayerName = (id: string) => {
    if (id === 'BYE') return '--- BYE ---';
    return userMap.get(id) || id.substring(0, 8);
  };

  return (
    <div className="flex gap-12 overflow-x-auto pb-8 min-h-[500px]">
      {roundNumbers.map(roundNum => (
        <div key={roundNum} className="flex-shrink-0 w-64 space-y-8">
          <div className="border-b-2 border-primary/30 pb-2 mb-8">
            <h3 className="font-press-start text-[10px] text-primary">ROUND {roundNum}</h3>
          </div>
          
          <div className="space-y-6">
            {rounds[roundNum].map(match => (
              <div key={match.id} className="relative">
                <div className={`pixel-border bg-zinc-900 overflow-hidden ${
                  match.status === 'IN_PROGRESS' ? 'border-primary shadow-[0_0_15px_rgba(255,0,77,0.3)]' : ''
                }`}>
                  {/* Player 1 */}
                  <div className={`p-3 border-b-2 border-zinc-800 flex justify-between items-center ${
                    match.winnerId === match.player1Id ? 'bg-secondary/10' : ''
                  }`}>
                    <span className="font-press-start text-[10px] truncate max-w-[120px]">
                      {getPlayerName(match.player1Id)}
                    </span>
                    {match.winnerId === match.player1Id && <Trophy size={10} className="text-secondary" />}
                  </div>

                  {/* Player 2 */}
                  <div className={`p-3 flex justify-between items-center ${
                    match.winnerId === match.player2Id ? 'bg-secondary/10' : ''
                  }`}>
                    <span className="font-press-start text-[10px] truncate max-w-[120px]">
                      {getPlayerName(match.player2Id)}
                    </span>
                    {match.winnerId === match.player2Id && <Trophy size={10} className="text-secondary" />}
                  </div>

                  {/* Match Footer/Action */}
                  <div className="bg-black/40 p-2 border-t-2 border-zinc-800">
                    {match.status === 'COMPLETED' ? (
                      <div className="text-center font-press-start text-[8px] text-zinc-600 italic">FINALIZED</div>
                    ) : match.status === 'IN_PROGRESS' ? (
                      <Link 
                        href={`/arena?matchId=${match.id}`}
                        className="block text-center font-press-start text-[8px] text-primary hover:underline"
                      >
                        JOIN BATTLE
                      </Link>
                    ) : (
                      <div className="text-center font-press-start text-[8px] text-zinc-700">QUEUED</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
