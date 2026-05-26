'use client';

import { Trophy, Swords } from 'lucide-react';
import Link from 'next/link';

export function BracketView({
  matches,
  participants,
  currentUserId,
}: {
  matches: any[];
  participants: { id: string; username: string | null }[];
  currentUserId?: string;
}) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-20 opacity-20">
        <p className="font-press-start text-sm mb-2">BRACKET DATA NOT INITIALIZED</p>
        <p className="font-press-start text-[8px]">WAITING FOR COMMENCEMENT...</p>
      </div>
    );
  }

  const userMap = new Map(participants.map(p => [p.id, p.username]));

  const rounds: Record<number, any[]> = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  const getPlayerName = (id: string) => {
    if (id === 'BYE') return '--- BYE ---';
    if (id === 'TBD') return 'WAITING...';
    return userMap.get(id) || `ID:${id.substring(0, 4)}`;
  };

  const isMyMatch = (match: any) =>
    currentUserId &&
    (match.player1Id === currentUserId || match.player2Id === currentUserId) &&
    !match.winnerId &&
    match.status !== 'COMPLETED' &&
    match.player1Id !== 'TBD' &&
    match.player2Id !== 'TBD';

  const isActive = (match: any) =>
    (match.status === 'IN_PROGRESS' || match.status === 'WAITING') &&
    match.player1Id !== 'TBD' &&
    match.player2Id !== 'TBD';

  return (
    <div className="flex gap-12 overflow-x-auto pb-8 min-h-[500px]">
      {roundNumbers.map(roundNum => (
        <div key={roundNum} className="flex-shrink-0 w-64 space-y-8">
          <div className="border-b-2 border-primary/30 pb-2 mb-8">
            <h3 className="font-press-start text-[10px] text-primary">ROUND {roundNum}</h3>
          </div>

          <div className="space-y-6">
            {rounds[roundNum].map(match => {
              const mine   = isMyMatch(match);
              const active = isActive(match);

              return (
                <div key={match.id} className="relative">
                  {/* "YOUR MATCH IS LIVE" label above the card */}
                  {mine && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="font-press-start text-[8px] text-secondary animate-pulse tracking-widest">
                        ⚔ YOUR MATCH
                      </span>
                    </div>
                  )}

                  <div className={`pixel-border bg-zinc-900 overflow-hidden transition-all ${
                    mine
                      ? 'border-secondary shadow-[0_0_20px_rgba(255,230,0,0.4)]'
                      : match.status === 'IN_PROGRESS'
                      ? 'border-primary shadow-[0_0_15px_rgba(255,0,77,0.3)]'
                      : ''
                  }`}>
                    {/* Player 1 row */}
                    <div className={`p-3 border-b-2 border-zinc-800 flex justify-between items-center ${
                      match.winnerId === match.player1Id ? 'bg-secondary/10' : ''
                    } ${mine && match.player1Id === currentUserId ? 'bg-secondary/5' : ''}`}>
                      <span className="font-press-start text-[10px] truncate max-w-[120px]">
                        {getPlayerName(match.player1Id)}
                      </span>
                      {match.winnerId === match.player1Id && <Trophy size={10} className="text-secondary" />}
                    </div>

                    {/* Player 2 row */}
                    <div className={`p-3 flex justify-between items-center ${
                      match.winnerId === match.player2Id ? 'bg-secondary/10' : ''
                    } ${mine && match.player2Id === currentUserId ? 'bg-secondary/5' : ''}`}>
                      <span className="font-press-start text-[10px] truncate max-w-[120px]">
                        {getPlayerName(match.player2Id)}
                      </span>
                      {match.winnerId === match.player2Id && <Trophy size={10} className="text-secondary" />}
                    </div>

                    {/* Footer / action */}
                    <div className="bg-black/40 p-2 border-t-2 border-zinc-800">
                      {match.status === 'COMPLETED' ? (
                        <div className="text-center font-press-start text-[8px] text-zinc-600 italic">FINALIZED</div>
                      ) : mine ? (
                        /* Fix 4 — primary CTA for the user's own live match */
                        <Link
                          href={`/arena?matchId=${match.id}`}
                          className="flex items-center justify-center gap-1 font-press-start text-[8px] text-black bg-secondary px-2 py-1 pixel-border hover:opacity-90 transition-opacity"
                        >
                          <Swords size={10} /> ENTER BATTLE
                        </Link>
                      ) : active ? (
                        <Link
                          href={`/arena?matchId=${match.id}`}
                          className="block text-center font-press-start text-[8px] text-primary hover:shadow-[0_0_10px_rgba(255,0,77,0.5)] transition-all"
                        >
                          JOIN BATTLE
                        </Link>
                      ) : (
                        <div className="text-center font-press-start text-[8px] text-zinc-700">QUEUED</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
