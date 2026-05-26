'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="pixel-border bg-zinc-800 hover:bg-zinc-700 transition-colors p-2 px-4 flex items-center gap-2"
    >
      {copied ? <Check size={12} className="text-secondary" /> : <Link2 size={12} className="text-white" />}
      <span className="font-press-start text-[10px] text-white">
        {copied ? 'LINK COPIED!' : 'SHARE'}
      </span>
    </button>
  );
}
