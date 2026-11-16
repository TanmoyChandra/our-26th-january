'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';
import type { Envelope3DRef } from './Envelope3D';

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
  const envelope3DRef = useRef<Envelope3DRef | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUnfolded, setIsUnfolded] = useState(false);

  const handleToggle = () => {
    if (envelope3DRef.current) {
      if (isUnfolded) {
        envelope3DRef.current.toggleUnfold();
        setIsUnfolded(false);
      }
      const state = envelope3DRef.current.toggleOpen();
      setIsOpen(state);
    }
  };

  const handleToggleUnfold = () => {
    if (envelope3DRef.current) {
      const state = envelope3DRef.current.toggleUnfold();
      setIsUnfolded(state);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c0a09] select-none">
      {/* 1. Overall space luxury banquet backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/space_background.jpg"
          alt="Wedding venue ambience"
          className="w-full h-full object-cover object-center"
        />
        {/* Ambient lighting & subtle vignette overlay to give depth and maintain contrast for envelope & UI */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* 2. Top Bar (Header) */}
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

      {/* 3. Interactive 3D Envelope Viewport: Full Screen Viewport */}
      <section
        className="absolute inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden"
        aria-label="3D Envelope Experience"
      >
        <div className="w-full h-full flex items-center justify-center">
          <Envelope3D
            ref={envelope3DRef}
            guestName={guestInfo.displayName}
            category={guestInfo.category}
          />
        </div>
      </section>

      {/* 4. Bottom Floating Action Controls */}
      <footer className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="flex items-center gap-3">
          {/* OPEN / CLOSE BUTTON (Shown when card is nestled in envelope) */}
          {!isUnfolded && (
            <button
              onClick={handleToggle}
              className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-900/60 via-amber-800/70 to-amber-900/60 text-amber-100 shadow-lg shadow-amber-950/50 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:border-amber-400/70"
              aria-label={isOpen ? 'Close Envelope' : 'Open Envelope'}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-serif tracking-widest uppercase text-xs font-medium">
                {isOpen ? 'Close Envelope' : 'Open Envelope'}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-amber-300/90 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}

          {/* READ FULL / FOLD CARD button */}
          {isOpen && (
            <button
              onClick={handleToggleUnfold}
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-amber-400/70 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif tracking-widest uppercase text-xs font-semibold shadow-xl shadow-amber-950/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110"
              aria-label={isUnfolded ? 'Fold Card' : 'Read Full'}
            >
              <svg className="w-3.5 h-3.5 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isUnfolded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                )}
              </svg>
              <span>{isUnfolded ? 'Fold Card' : 'Read Full'}</span>
            </button>
          )}
        </div>

        {/* Rotate / Scroll Helper Hint */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-amber-500/30 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-amber-300/90 shadow-lg">
          {isUnfolded ? (
            <>
              <svg className="w-3.5 h-3.5 text-amber-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span>Scroll to read • Drag left / right to tilt 3D</span>
            </>
          ) : (
            <span>Swipe to rotate • Pinch to zoom</span>
          )}
        </div>
      </footer>
    </main>
  );
}
