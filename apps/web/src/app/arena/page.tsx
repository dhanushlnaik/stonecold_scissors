'use client';

import { useEffect, Suspense } from 'react';
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
  const isGlobal = matchId.startsWith('global-');

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
    participantCount,
    player1Score,
    player2Score,
    roundNumber,
    totalRounds,
    matchComplete,
    format,
  } = useGameStore();

  const { playSound } = useSoundFX();

  const winsNeeded = format === 'BEST_OF_5' ? 3 : 2;
  const myId = session?.user?.id;
  const isP1 = result ? result.p1.id === myId : false;
  const myScore    = isP1 ? player1Score : player2Score;
  const theirScore = isP1 ? player2Score : player1Score;
  const atChampionshipPoint = !matchComplete && (myScore === winsNeeded - 1 || theirScore === winsNeeded - 1);

  useEffect(() => {
    if (countdown !== null) playSound('countdown');
  }, [countdown, playSound]);

  useEffect(() => {
    if (result) {
      playSound('reveal');
      if (matchComplete) {
        setTimeout(() => {
          const won = isP1
            ? result.result === 'PLAYER1_WIN'
            : result.result === 'PLAYER2_WIN';
          playSound(result.result === 'DRAW' ? 'reveal' : won ? 'victory' : 'defeat');
        }, 500);
      }
    }
  }, [result, matchComplete, playSound, isP1]);

  useEffect(() => {
    connect(process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:4000');
  }, [connect]);

  useEffect(() => {
    if (session?.user?.id) joinMatch(matchId, session.user.id);
  }, [session, joinMatch, matchId]);

  const handleMove = (move: Move) => {
    if (moveSubmitted || !matchStarted || result) return;
    playSound('lock');
    submitMove(move);
  };

  const myMove   = result ? (isP1 ? result.p1.move : result.p2.move) : null;
  const theirMove = result ? (isP1 ? result.p2.move : result.p1.move) : null;

  const roundWinner = result
    ? result.result === 'DRAW'
      ? 'DRAW'
      : (isP1 ? result.result === 'PLAYER1_WIN' : result.result === 'PLAYER2_WIN')
        ? 'YOU'
        : 'OPPONENT'
    : null;

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="scanlines" />

      {/* ── Top HUD ── */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
        <div className="pixel-border bg-primary p-2 px-4 -rotate-1">
          <p className="font-press-start text-xs text-white">
            {session?.user?.name?.toUpperCase() || 'ANONYMOUS'}
          </p>
        </div>

        {/* Score + round counter */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <span className="font-press-start text-2xl text-secondary">{myScore}</span>
            <span className="font-press-start text-xs text-white/40">VS</span>
            <span className="font-press-start text-2xl text-primary">{theirScore}</span>
          </div>
          {!isGlobal && (
            <p className="font-press-start text-[8px] text-white/40 uppercase tracking-widest">
              ROUND {roundNumber} OF {totalRounds}
            </p>
          )}
        </div>

        <div className="pixel-border bg-accent p-2 px-4 rotate-1">
          <p className="font-press-start text-xs text-white uppercase tracking-tighter">
            {participantCount}/2 PLAYERS
          </p>
        </div>
      </div>

      {/* ── Championship Point Banner ── */}
      <AnimatePresence>
        {atChampionshipPoint && !result && matchStarted && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="absolute top-20 z-30 w-full flex justify-center"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="bg-secondary px-6 py-2 pixel-border"
            >
              <p className="font-press-start text-xs text-black tracking-widest">
                ⚡ CHAMPIONSHIP POINT ⚡
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Countdown Overlay ── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute z-50 font-press-start text-8xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            {countdown === 0 ? 'GO!' : countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Battle Field ── */}
      <div className="flex-1 w-full max-w-6xl flex items-center justify-around relative mt-16">
        {/* Opponent */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 md:h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            {opponentMoved && !result && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary p-1 px-2 pixel-border">
                <p className="font-press-start text-[10px] text-black">LOCKED</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {theirMove ? (
                <motion.div
                  key="their-move"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(theirMove)}
                </motion.div>
              ) : (
                <motion.div key="their-unknown" className="text-zinc-700 font-press-start text-4xl">?</motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-press-start text-xs text-white/40 uppercase">Opponent</p>
        </div>

        {/* VS */}
        <div className="font-press-start text-4xl text-primary animate-bounce">VS</div>

        {/* You */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-48 md:h-48 pixel-border bg-zinc-900 flex items-center justify-center relative">
            {moveSubmitted && !result && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary p-1 px-2 pixel-border">
                <p className="font-press-start text-[10px] text-black">LOCKED</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {myMove ? (
                <motion.div
                  key="my-move"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-white"
                >
                  {renderMoveIcon(myMove)}
                </motion.div>
              ) : (
                <motion.div key="my-unknown" className="text-zinc-700 font-press-start text-4xl">?</motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-press-start text-xs text-white/40 uppercase">You</p>
        </div>
      </div>

      {/* ── Result Overlay ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 min-w-[280px]"
          >
            {matchComplete ? (
              /* ── Final result ── */
              <div className="bg-white p-8 pixel-border shadow-[8px_8px_0px_0px_rgba(255,0,77,1)]">
                <h2 className="font-press-start text-2xl text-black mb-2 text-center">
                  {getFinalMessage(result.result, isP1)}
                </h2>
                <p className="font-press-start text-xs text-black/50 text-center mb-6">
                  FINAL SCORE {myScore} — {theirScore}
                </p>
                <button onClick={reset} className="pixel-button w-full py-4 text-white font-press-start text-sm">
                  BACK TO LOBBY
                </button>
              </div>
            ) : (
              /* ── Round result (auto-dismissed when server sends next countdown) ── */
              <div className="bg-black/90 border-2 border-white p-6 pixel-border text-center">
                <p className="font-press-start text-[10px] text-white/50 mb-1 uppercase tracking-widest">
                  ROUND {result.roundNumber}
                </p>
                <h2 className={`font-press-start text-xl mb-3 ${
                  roundWinner === 'DRAW'     ? 'text-white' :
                  roundWinner === 'YOU'      ? 'text-secondary' : 'text-primary'
                }`}>
                  {roundWinner === 'DRAW' ? 'STALEMATE' : roundWinner === 'YOU' ? 'ROUND WIN' : 'ROUND LOSS'}
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-press-start text-2xl text-secondary">{myScore}</span>
                  <span className="font-press-start text-xs text-white/30">—</span>
                  <span className="font-press-start text-2xl text-primary">{theirScore}</span>
                </div>
                <p className="font-press-start text-[8px] text-white/30 mt-3 animate-pulse">
                  NEXT ROUND STARTING...
                </p>
                {/* Show button only for global single-throw matches */}
                {isGlobal && (
                  <button onClick={reset} className="pixel-button mt-4 w-full py-3 text-white font-press-start text-xs">
                    PLAY AGAIN
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Move Controls ── */}
      {!moveSubmitted && !result && matchStarted && (
        <div className="mb-12 grid grid-cols-3 gap-6">
          <button onClick={() => handleMove('ROCK')} className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button flex items-center justify-center text-white">
              <Circle size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-primary transition-colors">ROCK</span>
          </button>

          <button onClick={() => handleMove('PAPER')} className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button bg-accent flex items-center justify-center text-white">
              <Square size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-accent transition-colors">PAPER</span>
          </button>

          <button onClick={() => handleMove('SCISSORS')} className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-button bg-secondary flex items-center justify-center text-white">
              <Scissors size={48} />
            </div>
            <span className="font-press-start text-xs text-white group-hover:text-secondary transition-colors">SCISSORS</span>
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="p-4 w-full border-t-2 border-zinc-900 flex justify-center">
        <p className="font-press-start text-[8px] text-white/20 tracking-widest uppercase">
          {participantCount < 2
            ? 'WAITING FOR COMBATANTS...'
            : matchStarted
            ? `${format.replace('_', ' ')} · BATTLE IN PROGRESS`
            : 'GET READY!'}
        </p>
      </div>
    </div>
  );
}

function renderMoveIcon(move: Move) {
  switch (move) {
    case 'ROCK':     return <Circle    size={64} />;
    case 'PAPER':    return <Square    size={64} />;
    case 'SCISSORS': return <Scissors  size={64} />;
  }
}

function getFinalMessage(result: string, isP1: boolean) {
  if (result === 'DRAW') return 'STALEMATE!';
  if (result === 'PLAYER1_WIN') return isP1 ? 'VICTORY!' : 'DEFEAT!';
  return isP1 ? 'DEFEAT!' : 'VICTORY!';
}
