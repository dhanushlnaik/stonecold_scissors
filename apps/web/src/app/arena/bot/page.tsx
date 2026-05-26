'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Move, MatchResult } from '@stonecold/types';
import { determineWinner, getRandomMove } from '@stonecold/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Square, Circle, ArrowLeft, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useSoundFX } from '@/hooks/use-sound-fx';

export default function BotArenaPage() {
  const { data: session } = useSession();
  const { playSound } = useSoundFX();

  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [botMove, setBotMove] = useState<Move | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleMove = (move: Move) => {
    if (playerMove || isRevealing) return;
    
    playSound('lock');
    setPlayerMove(move);
    setIsRevealing(true);

    // Simulate "Bot thinking" for tension
    setTimeout(() => {
      const bMove = getRandomMove();
      const matchResult = determineWinner(move, bMove);
      
      setBotMove(bMove);
      setResult(matchResult);
      playSound('reveal');

      setTimeout(() => {
        if (matchResult !== 'DRAW') {
          playSound(matchResult === 'PLAYER1_WIN' ? 'victory' : 'defeat');
        }
      }, 500);
    }, 1500);
  };

  const reset = () => {
    setPlayerMove(null);
    setBotMove(null);
    setResult(null);
    setIsRevealing(false);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="scanlines" />
      
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
        <Link href="/" className="pixel-border bg-zinc-800 p-2 px-4 -rotate-1 hover:bg-zinc-700 transition-colors flex items-center gap-2">
           <ArrowLeft size={14} className="text-white" />
           <p className="font-press-start text-[10px] text-white">EXIT TRAINING</p>
        </Link>
        <div className="pixel-border bg-primary p-2 px-4 rotate-1">
          <p className="font-press-start text-xs text-white uppercase">TRAINING MODE: ES-AI_v1.0</p>
        </div>
      </div>

      {/* Battle Field */}
      <div className="flex-1 w-full max-w-6xl flex items-center justify-around relative">
        {/* Bot Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {botMove ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(botMove)}
                </motion.div>
              ) : (
                <motion.div 
                  animate={{ opacity: isRevealing ? [0.2, 1, 0.2] : 0.2 }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                   <Cpu size={64} className="text-zinc-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-press-start text-xs text-white/40 uppercase tracking-widest italic">CPU OPPONENT</p>
        </div>

        {/* VS Divider */}
        <div className="font-press-start text-4xl text-primary animate-bounce">VS</div>

        {/* Player Side */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            {playerMove && !result && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary p-1 px-2 pixel-border">
                <p className="font-press-start text-[10px] text-black">LOCKED</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {playerMove && result ? (
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(playerMove)}
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
                {result === 'DRAW' ? 'STALEMATE!' : result === 'PLAYER1_WIN' ? 'VICTORY!' : 'DEFEAT!'}
              </h2>
              <button 
                onClick={reset}
                className="pixel-button w-full py-4 text-white font-press-start text-sm"
              >
                TRAIN AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {!playerMove && (
        <div className="mb-12 grid grid-cols-3 gap-6 z-10">
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
        <p className="font-press-start text-[8px] text-white/20 tracking-widest uppercase animate-pulse">
          Simulator Active: Combat practice only. No ELO recorded.
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
