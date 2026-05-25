'use client';

import { useState } from 'react';
import { createTournament } from './actions';
import { Trophy, X } from 'lucide-react';

export function CreateTournamentModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="pixel-button px-6 py-4 font-press-start text-sm text-white bg-accent"
      >
        HOST TOURNAMENT
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 pixel-border w-full max-w-md overflow-hidden relative">
        <div className="bg-primary p-4 pixel-border m-1 flex justify-between items-center">
          <h2 className="font-press-start text-sm text-white flex items-center gap-2">
            <Trophy size={16} /> HOST NEW CHAMPIONSHIP
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-white hover:rotate-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        <form action={createTournament} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block font-press-start text-[10px] text-zinc-500 uppercase">
              Tournament Name
            </label>
            <input 
              name="name"
              required
              placeholder="e.g. THE IRON FIST CLASSIC"
              className="w-full bg-black pixel-border p-4 font-press-start text-xs text-white outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-press-start text-[10px] text-zinc-500 uppercase">
              Start Date (Optional)
            </label>
            <input 
              name="startsAt"
              type="datetime-local"
              className="w-full bg-black pixel-border p-4 font-press-start text-xs text-white outline-none focus:border-primary transition-colors invert"
            />
          </div>

          <div className="p-4 bg-zinc-800/50 pixel-border border-dashed border-zinc-700">
            <p className="font-press-start text-[8px] text-zinc-500 leading-relaxed">
              BY INITIALIZING THIS TOURNAMENT, YOU AGREE TO UPHOLD THE INTEGRITY OF THE ARCADE DIVISION.
            </p>
          </div>

          <button 
            type="submit"
            className="pixel-button w-full py-4 bg-secondary text-black font-press-start text-sm"
          >
            COMMENCE REGISTRATION
          </button>
        </form>
      </div>
    </div>
  );
}
