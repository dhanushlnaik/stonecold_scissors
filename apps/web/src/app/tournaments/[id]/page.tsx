import { TournamentService } from '@stonecold/db';
import { auth } from '@/auth';
import { joinTournament, commenceTournament } from '../actions';
import { Trophy, Users, Sword, Shield, ArrowLeft } from 'lucide-react';
import { BracketView } from './bracket-view';
import { RealtimeSync } from '@/components/realtime-sync';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const tournament = await TournamentService.getTournamentDetails(id);

  if (!tournament) {
    notFound();
  }

  const isParticipant = tournament.participants.some(p => p.userId === session?.user?.id);
  const isHost = tournament.hostId === session?.user?.id;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <RealtimeSync mode="tournament" tournamentId={id} />
      <div className="scanlines" />
      
      <div className="max-w-7xl mx-auto z-10 relative">
        <Link 
          href="/tournaments" 
          className="inline-flex items-center gap-2 font-press-start text-[10px] text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} /> BACK TO EVENTS
        </Link>

        {/* Header Section */}
        <div className="pixel-border bg-zinc-900 p-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-primary p-4 pixel-border rotate-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <Trophy size={40} className="text-white" />
            </div>
            <div>
              <h1 className="font-press-start text-2xl md:text-4xl text-white mb-2 uppercase">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="bg-secondary text-black font-press-start text-[10px] px-3 py-1 pixel-border">
                  {tournament.status}
                </span>
                <span className="font-press-start text-[10px] text-zinc-500 uppercase">
                  HOSTED BY <span className="text-white">{tournament.host.username || 'ANONYMOUS'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {tournament.status === 'REGISTRATION' && !isParticipant && session && (
              <form action={joinTournament.bind(null, tournament.id)}>
                <button className="pixel-button w-full px-8 py-4 bg-accent text-white font-press-start text-sm">
                  REGISTER ES-ID
                </button>
              </form>
            )}
            
            {isParticipant && (
              <div className="pixel-border bg-zinc-800 p-4 border-dashed border-zinc-700 text-center">
                <p className="font-press-start text-[10px] text-secondary">REGISTRATION VERIFIED</p>
              </div>
            )}

            {isHost && tournament.status === 'REGISTRATION' && tournament.participants.length >= 2 && (
              <form action={commenceTournament.bind(null, tournament.id)}>
                <button className="pixel-button w-full px-8 py-4 bg-primary text-white font-press-start text-sm">
                  COMMENCE TOURNAMENT
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Bracket/Match Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Sword className="text-primary" size={24} />
              <h2 className="font-press-start text-xl">CHAMPIONSHIP BRACKET</h2>
            </div>
            
            <BracketView 
              matches={tournament.matches} 
              participants={tournament.participants.map(p => ({ id: p.userId, username: p.user.username }))} 
            />
          </div>

          {/* Sidebar: Participants */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-secondary" size={24} />
              <h2 className="font-press-start text-xl uppercase">Roster</h2>
            </div>
            
            <div className="space-y-4">
              {tournament.participants.map((p, idx) => (
                <div key={p.id} className="pixel-border bg-zinc-900 p-4 flex items-center justify-between group hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-press-start text-[10px] text-zinc-600">#{idx + 1}</span>
                    <div className="w-8 h-8 bg-zinc-800 pixel-border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {p.user.avatar ? (
                        <img src={p.user.avatar} alt={p.user.username} className="w-full h-full pixelated" />
                      ) : (
                        <Users size={16} className="text-zinc-500" />
                      )}
                    </div>
                    <span className="font-press-start text-xs uppercase group-hover:text-primary transition-colors">
                      {p.user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-zinc-600" />
                    <span className="font-press-start text-[10px] text-zinc-500">{p.user.elo}</span>
                  </div>
                </div>
              ))}
              
              {tournament.participants.length === 0 && (
                <p className="font-press-start text-[10px] text-zinc-600 italic text-center py-8">
                  NO COMPETITORS REGISTERED
                </p>
              )}
            </div>

            <div className="p-6 bg-primary/5 pixel-border border-zinc-800 border-dashed">
              <h3 className="font-press-start text-[10px] text-primary mb-4 uppercase">Championship Rules</h3>
              <ul className="space-y-2 font-press-start text-[8px] text-zinc-500 leading-relaxed list-disc pl-4">
                <li>Best of 3 rounds per match.</li>
                <li>Simultaneous reveals only.</li>
                <li>Tie-breakers decided by sudden death.</li>
                <li>Unsportsmanlike conduct results in DQ.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
