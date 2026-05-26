import Link from 'next/link';
import { auth, signIn, signOut } from "@/auth";
import { TournamentService } from '@stonecold/db';
import { MatchTicker } from '@/components/match-ticker';
import { RealtimeSync } from '@/components/realtime-sync';

export default async function Home() {
  const session = await auth();
  const recentMatches = await TournamentService.getRecentMatches(10);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      <RealtimeSync mode="rankings" /> {/* Also refreshes home ticker */}
      
      {/* CRT Scanlines Effect */}
      <div className="scanlines" />

      {/* Social Ticker */}
      <div className="fixed top-0 left-0 w-full z-20">
        <MatchTicker initialMatches={recentMatches} />
      </div>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center text-center px-4 max-w-4xl pt-16">
        <div className="mb-8 p-4 bg-primary pixel-border transform -rotate-2">
          <h1 className="text-2xl md:text-5xl font-press-start leading-tight text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            STONE COLD<br />SCISSORS
          </h1>
        </div>

        <p className="mb-12 text-lg md:text-xl font-press-start text-secondary uppercase tracking-widest animate-pulse">
          World Championship RPS
        </p>

        <div className="grid gap-6 w-full max-w-md">
          {session ? (
            <div className="flex flex-col gap-4">
              <p className="font-press-start text-sm text-white mb-2 uppercase tracking-tighter">
                WELCOME BACK, {session.user?.name?.split(' ')[0] || 'COMPETITOR'}
              </p>
              <Link 
                href="/arena" 
                className="pixel-button px-8 py-6 text-xl font-press-start text-white text-center"
              >
                ENTER THE ARENA
              </Link>
              
              <Link 
                href="/arena/bot" 
                className="pixel-button bg-zinc-800 px-8 py-6 text-xl font-press-start text-white text-center"
              >
                PRACTICE VS BOT
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="text-xs font-press-start text-white/40 hover:text-primary transition-colors">
                  [ ABANDON RANKED SESSION ]
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
            >
              <button className="pixel-button w-full px-8 py-6 text-xl font-press-start text-white text-center">
                INITIALIZE ES-ID
              </button>
            </form>
          )}
          
          <Link 
            href="/tournaments" 
            className="pixel-button bg-accent px-8 py-6 text-xl font-press-start text-white text-center"
          >
            LIVE TOURNAMENTS
          </Link>

          <Link 
            href="/rankings" 
            className="pixel-button bg-secondary px-8 py-6 text-xl font-press-start text-black text-center"
          >
            GLOBAL RANKINGS
          </Link>
        </div>

        <div className="mt-16 p-6 border-t-4 border-white w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-press-start text-white/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-secondary rounded-full animate-ping" />
              ELITE DIVISION ACTIVE
            </div>
            <div>EST. 2026 | ARCADE PROTOCOL</div>
          </div>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-4 border-accent/20 -rotate-12 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-primary/20 rotate-12 pointer-events-none" />
    </div>
  );
}
