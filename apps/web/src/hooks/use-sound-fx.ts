'use client';

import { useCallback } from 'react';

const SOUNDS = {
  countdown: '/sounds/countdown.mp3',
  lock: '/sounds/lock.mp3',
  reveal: '/sounds/reveal.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  click: '/sounds/click.mp3',
};

export function useSoundFX() {
  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[soundName]);
    audio.volume = 0.5;
    audio.play().catch(err => console.warn('Audio play blocked:', err));
  }, []);

  return { playSound };
}
