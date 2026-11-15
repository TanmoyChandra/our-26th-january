import React from 'react';
import type { InvitationConfig } from '@/types/invitation';

interface InvitationCoverSectionProps {
  displayName: string;
  category: string;
  config: InvitationConfig;
}

export function InvitationCoverSection({
  displayName,
  category,
  config,
}: InvitationCoverSectionProps) {
  return (
    <div className="text-center space-y-4 py-8 px-6 border-b border-amber-900/10">
      <div className="inline-block px-3 py-1 text-[10px] uppercase font-mono tracking-[0.25em] text-amber-800/80 bg-amber-50/80 rounded-full border border-amber-200/50">
        26 January 2027 &bull; {category === 'family' ? 'Family Invitation' : 'Formal Invitation'}
      </div>

      <p className="font-serif italic text-neutral-500 text-sm">
        With the blessings of our elders
      </p>

      <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 tracking-wide font-normal">
        {config.coupleName.person1}
        <span className="block text-xl text-amber-700/60 my-1 font-serif">&amp;</span>
        {config.coupleName.person2}
      </h1>

      <p className="text-xs uppercase tracking-widest text-neutral-400 font-sans">
        Cordially request the company of
      </p>

      <div className="py-2">
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-800 tracking-wider">
          {displayName}
        </h2>
      </div>

      <p className="font-serif italic text-xs text-neutral-500 max-w-sm mx-auto">
        To celebrate our engagement, exchange vows and celebrate together
      </p>
    </div>
  );
}

