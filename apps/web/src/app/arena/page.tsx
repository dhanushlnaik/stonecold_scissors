'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useGameStore } from '@/hooks/use-game-store';
import { Move } from '@stonecold/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Square, Circle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSoundFX } from '@/hooks/use-sound-fx';

export default function ArenaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center font-press-start text-white">
        INITIALIZING ARENA...
      </div>
    }>
      <ArenaContent />
    </Suspense>
  );
}

function ArenaContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId') || 'global-arena';

  const { 
    connect, 
    joinMatch, 
    submitMove, 
    moveSubmitted, 
    opponentMoved, 
    result,
    reset,
    countdown,
    matchStarted,
    participantCount
  } = useGameStore();

  const { playSound } = useSoundFX();

  useEffect(() => {
    if (countdown !== null) {
      playSound('countdown');
    }
  }, [countdown, playSound]);

  useEffect(() => {
    if (result) {
      playSound('reveal');
      setTimeout(() => {
        const isWin = getWinMessage(result.result, result.p1.id === session?.user?.id) === 'VICTORY!';
        const isStalemate = result.result === 'DRAW';
        if (!isStalemate) {
          playSound(isWin ? 'victory' : 'defeat');
        }
      }, 500);
    }
  }, [result, playSound, session?.user?.id]);

  useEffect(() => {
    connect(process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:4000');
  }, [connect]);

  useEffect(() => {
    if (session?.user?.id) {
      joinMatch(matchId, session.user.id);
    }
  }, [session, joinMatch, matchId]);

  const handleMove = (move: Move) => {
    if (moveSubmitted || !matchStarted || result) return;
    playSound('lock');
    submitMove(move);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="scanlines" />
      
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
        <div className="pixel-border bg-primary p-2 px-4 -rotate-1">
          <p className="font-press-start text-xs text-white">PLAYER: {session?.user?.name?.toUpperCase() || 'ANONYMOUS'}</p>
        </div>
        <div className="pixel-border bg-accent p-2 px-4 rotate-1">
          <p className="font-press-start text-xs text-white uppercase tracking-tighter">
            MATCH: {matchId.substring(0, 8)} | {participantCount}/2 PLAYERS
          </p>
        </div>
      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute z-50 font-press-start text-8xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            {countdown === 0 ? 'GO!' : countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Field */}
      <div className="flex-1 w-full max-w-6xl flex items-center justify-around relative">
        {/* Opponent Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            {opponentMoved && !result && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary p-1 px-2 pixel-border">
                <p className="font-press-start text-[10px] text-black">LOCKED</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(result.p2.id === session?.user?.id ? result.p1.move : result.p2.move)}
                </motion.div>
              ) : (
                <div className="text-zinc-700 font-press-start text-4xl">?</div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-press-start text-xs text-white/40 uppercase">Opponent</p>
        </div>

        {/* VS Divider */}
        <div className="font-press-start text-4xl text-primary animate-bounce">VS</div>

        {/* Player Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            {moveSubmitted && !result && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary p-1 px-2 pixel-border">
                <p className="font-press-start text-[10px] text-black">LOCKED</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(result.p1.id === session?.user?.id ? result.p1.move : result.p2.move)}
                </motion.div>
              ) : (
                <div className="text-zinc-700 font-press-start text-4xl">?</div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-press-start text-xs text-white/40 uppercase">You</p>
        </div>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="bg-white p-8 pixel-border shadow-[8px_8px_0px_0px_rgba(255,0,77,1)]">
              <h2 className="font-press-start text-2xl text-black mb-6">
                {getWinMessage(result.result, result.p1.id === session?.user?.id)}
              </h2>
              <button 
                onClick={reset}
                className="pixel-button w-full py-4 text-white font-press-start text-sm"
              >
                NEXT ROUND
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {!moveSubmitted && !result && matchStarted && (
        <div className="mb-12 grid grid-cols-3 gap-6">
          <button 
            onClick={() => handleMove('ROCK')}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button flex items-center justify-center text-white">
              <Circle size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-primary transition-colors">ROCK</span>
          </button>
          
          <button 
            onClick={() => handleMove('PAPER')}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button bg-accent flex items-center justify-center text-white">
              <Square size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-accent transition-colors">PAPER</span>
          </button>

          <button 
            onClick={() => handleMove('SCISSORS')}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button bg-secondary flex items-center justify-center text-white">
              <Scissors size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-secondary transition-colors">SCISSORS</span>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 w-full border-t-2 border-zinc-900 flex justify-center">
        <p className="font-press-start text-[8px] text-white/20 tracking-widest uppercase">
          {participantCount < 2 ? 'WAITING FOR COMBATANTS...' : matchStarted ? 'BATTLE IN PROGRESS' : 'GET READY!'}
        </p>
      </div>
    </div>
  );
}

function renderMoveIcon(move: Move) {
  switch (move) {
    case 'ROCK': return <Circle size={64} />;
    case 'PAPER': return <Square size={64} />;
    case 'SCISSORS': return <Scissors size={64} />;
  }
}

function getWinMessage(result: string, isP1: boolean) {
  if (result === 'DRAW') return 'STALEMATE!';
  if (result === 'PLAYER1_WIN') return isP1 ? 'VICTORY!' : 'DEFEAT!';
  return isP1 ? 'DEFEAT!' : 'VICTORY!';
}
