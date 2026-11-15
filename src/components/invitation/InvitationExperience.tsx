'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';

const Envelope3D = dynamic(
  () => import('./Envelope3D').then((mod) => mod.Envelope3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-600/30 border-t-amber-700 animate-spin" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
          Loading 3D Envelope...
        </span>
      </div>
    ),
  }
);

interface InvitationExperienceProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
}

export function InvitationExperience({
  guestInfo,
}: InvitationExperienceProps) {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c0a09] select-none">
      {/* 1. Deep blurred ambient luxury backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm amber/gold bokeh glow behind the envelope */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full bg-gradient-to-tr from-amber-600/25 via-amber-700/15 to-stone-500/10 blur-[90px]" />
        {/* Soft cool vignette */}
        <div className="absolute inset-0 bg-radial-vignette opacity-70" />
      </div>

      {/* 2. Top Bar (Mobile-first discreet header) */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 flex justify-between items-center pointer-events-none">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-500/80">
            26 &bull; 01 &bull; 2027
          </span>
          <span className="font-serif italic text-xs text-neutral-400 mt-0.5">
            Wedding Celebration
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-950/40 backdrop-blur-md text-[10px] font-mono uppercase tracking-widest text-amber-300/80">
          {guestInfo.category}
        </div>
      </header>

      {/* 3. Interactive 3D Envelope Viewport */}
      <section
        className="relative z-10 w-full h-full flex items-center justify-center p-2"
        aria-label="3D Envelope Experience"
      >
        <div className="w-full max-w-[420px] h-[75vh] max-h-[580px] flex items-center justify-center">
          <Envelope3D
            guestName={guestInfo.displayName}
            category={guestInfo.category}
          />
        </div>
      </section>

      {/* 4. Bottom Hint (Touch/Drag to rotate prompt) */}
      <footer className="absolute bottom-7 left-0 right-0 z-20 flex flex-col items-center justify-center gap-1.5 pointer-events-none text-center px-4">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400/80">
          <svg
            className="w-4 h-4 text-amber-500/70 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <span>Drag or Swipe to Rotate</span>
        </div>
        <p className="text-[10px] text-neutral-500 font-sans tracking-wide">
          Tap and rotate to inspect the physical envelope
        </p>
      </footer>
    </main>
  );
}
