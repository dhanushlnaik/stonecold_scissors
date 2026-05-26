import { Move, MatchResult } from '@stonecold/types';

export function determineWinner(move1: Move, move2: Move): MatchResult {
  if (move1 === move2) {
    return 'DRAW';
  }

  if (
    (move1 === 'ROCK' && move2 === 'SCISSORS') ||
    (move1 === 'PAPER' && move2 === 'ROCK') ||
    (move1 === 'SCISSORS' && move2 === 'PAPER')
  ) {
    return 'PLAYER1_WIN';
  }

  return 'PLAYER2_WIN';
}

export function getRandomMove(): Move {
  const moves: Move[] = ['ROCK', 'PAPER', 'SCISSORS'];
  return moves[Math.floor(Math.random() * moves.length)];
}

export * from './bracket';
