import { TournamentService } from '@stonecold/db';
import Link from 'next/link';
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react';
import { CreateTournamentModal } from './create-modal';

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  const tournaments = await TournamentService.getActiveTournaments();

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="scanlines" />
      
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-30 relative">
        <div>
          <h1 className="font-press-start text-3xl md:text-4xl text-primary drop-shadow-[4px_4px_0px_rgba(255,255,255,0.1)] mb-4">
            LIVE EVENTS
          </h1>
          <p className="font-press-start text-xs text-secondary tracking-widest">
            ACTIVE CHAMPIONSHIPS & REGISTRATIONS
          </p>
        </div>
        
        <CreateTournamentModal />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 relative">
        {tournaments.length > 0 ? (
          tournaments.map((t) => (
            <div 
              key={t.id}
              className="pixel-border bg-zinc-900 hover:bg-zinc-800 transition-colors group overflow-hidden"
            >
              <div className="p-6 border-b-2 border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 pixel-border">
                    <Trophy size={20} className="text-white" />
                  </div>
                  <h2 className="font-press-start text-lg group-hover:text-primary transition-colors">
                    {t.name.toUpperCase()}
                  </h2>
                </div>
                <div className={`px-3 py-1 pixel-border text-[10px] font-press-start ${
                  t.status === 'REGISTRATION' ? 'bg-secondary text-black' : 'bg-accent text-white'
                }`}>
                  {t.status}
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-zinc-500" />
                  <div>
                    <p className="text-[10px] font-press-start text-zinc-500 mb-1">PARTICIPANTS</p>
                    <p className="font-press-start text-sm">{t._count.participants} / 64</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-zinc-500" />
                  <div>
                    <p className="text-[10px] font-press-start text-zinc-500 mb-1">STARTS AT</p>
                    <p className="font-press-start text-[10px]">
                      {t.startsAt ? new Date(t.startsAt).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-black/40 border-t-2 border-zinc-800 flex justify-between items-center">
                <div className="text-[10px] font-press-start text-zinc-500 uppercase">
                  HOSTED BY <span className="text-white">{t.host.username || 'ANONYMOUS'}</span>
                </div>
                <Link 
                  href={`/tournaments/${t.id}`}
                  className="flex items-center gap-2 font-press-start text-xs text-primary group-hover:translate-x-1 transition-transform"
                >
                  DETAILS <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 pixel-border border-dashed border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Trophy size={64} className="text-zinc-800 mb-6 relative z-10" />
            <p className="font-press-start text-lg text-zinc-500 mb-2 relative z-10">NO ACTIVE TOURNAMENTS</p>
            <p className="font-press-start text-[10px] text-zinc-600 relative z-10">THE ARENA IS SILENT... FOR NOW.</p>
          </div>
        )}
      </div>

      {/* Decorative Sidebar Info */}
      <div className="fixed bottom-10 right-10 z-0 pointer-events-none hidden xl:block opacity-20">
        <div className="pixel-border bg-white p-4 max-w-[200px] rotate-2">
          <p className="font-press-start text-[8px] text-black leading-relaxed">
            NOTICE: ALL COMPETITORS MUST ADHERE TO THE ARCADE CODE OF CONDUCT. NO LATE REGISTRATIONS.
          </p>
        </div>
      </div>
    </div>
  );
}
