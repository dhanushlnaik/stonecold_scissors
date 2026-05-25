import { TournamentService } from '@stonecold/db';
import { Trophy, Medal, Star, ArrowLeft } from 'lucide-react';
import { RealtimeSync } from '@/components/realtime-sync';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RankingsPage() {
  const players = await TournamentService.getLeaderboard();

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <RealtimeSync mode="rankings" />
      <div className="scanlines" />
      
      <div className="max-w-4xl mx-auto z-10 relative">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-press-start text-[10px] text-zinc-500 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} /> BACK TO HUB
        </Link>

        <header className="mb-16 text-center">
          <div className="inline-block p-4 bg-primary pixel-border transform -rotate-1 mb-6">
            <h1 className="font-press-start text-3xl md:text-5xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              WORLD RANKINGS
            </h1>
          </div>
          <p className="font-press-start text-xs text-secondary tracking-[0.2em] uppercase">
            Official Arcade Division Standings
          </p>
        </header>

        <div className="space-y-4">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`pixel-border p-6 flex items-center justify-between transition-all hover:scale-[1.01] ${
                index === 0 ? 'bg-zinc-800 border-accent shadow-[0_0_20px_rgba(41,173,255,0.2)]' : 
                index === 1 ? 'bg-zinc-900 border-secondary' :
                index === 2 ? 'bg-zinc-900 border-primary' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="w-12 font-press-start text-xl text-zinc-700">
                  {index === 0 ? <Trophy className="text-accent" size={32} /> : 
                   index === 1 ? <Medal className="text-secondary" size={28} /> :
                   index === 2 ? <Medal className="text-primary" size={24} /> : 
                   `#${index + 1}`}
                </div>
                
                <div className="w-12 h-12 bg-black pixel-border border-zinc-700 flex items-center justify-center overflow-hidden">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.username} className="w-full h-full pixelated" />
                  ) : (
                    <Star size={20} className="text-zinc-800" />
                  )}
                </div>

                <div>
                  <h3 className="font-press-start text-sm uppercase mb-1">
                    {player.username}
                  </h3>
                  <div className="flex gap-4 font-press-start text-[8px] text-zinc-500">
                    <span>W: <span className="text-secondary">{player.wins}</span></span>
                    <span>L: <span className="text-primary">{player.losses}</span></span>
                    <span>RATIO: {player.losses === 0 ? player.wins : (player.wins / player.losses).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-press-start text-zinc-500 mb-1">ELO RATING</p>
                <p className={`font-press-start text-xl ${
                  index === 0 ? 'text-accent animate-pulse' : 'text-white'
                }`}>
                  {player.elo}
                </p>
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div className="py-20 text-center opacity-30">
              <p className="font-press-start text-sm italic">NO COMBATANTS RECORDED</p>
            </div>
          )}
        </div>

        <footer className="mt-20 p-8 border-t-2 border-zinc-900 text-center">
          <p className="font-press-start text-[8px] text-zinc-600 leading-loose">
            RANKINGS ARE UPDATED IN REALTIME AFTER EVERY SANCTIONED MATCH.<br />
            UNAUTHORIZED DATA MANIPULATION WILL RESULT IN PERMANENT BAN.
          </p>
        </footer>
      </div>
    </div>
  );
}
