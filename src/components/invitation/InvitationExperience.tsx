'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { m, AnimatePresence } from 'framer-motion';
import { VENUE_MAPS_CONFIG } from '@/config/invitation';
import { RosePetalsOverlay } from './RosePetalsOverlay';
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
          className="w-full h-full object-cover object-center brightness-105 contrast-[1.02]"
        />
        {/* Soft, light vignette solely at the bottom edge for button contrast, keeping the background bright & luminous */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Top-Left Floral Corner Ornament (Rendered with vintage ambient warmth behind 3D envelope) */}
      <div className="fixed top-0 left-0 z-[2] pointer-events-none select-none">
        <img
          src="/images/floral_top_left.png"
          alt=""
          className="w-36 sm:w-48 md:w-60 lg:w-72 max-w-[45vw] h-auto object-contain object-left-top drop-shadow-lg"
          style={{
            filter: 'sepia(18%) brightness(96%) contrast(98%) saturate(94%)',
            opacity: 0.94,
          }}
        />
      </div>


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

      {/* 3b. Romantic Falling Pink Rose Petals Overlay */}
      <RosePetalsOverlay />

      {/* 4. Bottom Floating Action Controls (Elevated position for elegant prominence) */}
      <footer className="absolute bottom-14 sm:bottom-16 left-0 right-0 z-30 flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="flex items-center gap-3">
          {/* OPEN / CLOSE BUTTON (Shown when card is nestled in envelope) */}
          {!isUnfolded && (
            <button
              onClick={handleToggle}
              className="group relative inline-flex flex-col items-center justify-center py-2 px-6 bg-transparent border-none cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
              aria-label={isOpen ? 'Close' : 'Open'}
            >
              {/* Top parallel line blending with background gradually */}
              <span
                aria-hidden="true"
                className="w-36 sm:w-48 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300 group-hover:w-48 sm:group-hover:w-56"
              />

              {/* Modern animated shining golden "OPEN" / "CLOSE" text */}
              <span className="my-2 text-base sm:text-lg font-normal tracking-[0.42em] uppercase animate-text-shine select-none drop-shadow-[0_0_14px_rgba(234,179,8,0.6)] drop-shadow-[0_0_2px_rgba(254,240,138,0.8)]">
                {isOpen ? 'Close' : 'Open'}
              </span>

              {/* Bottom parallel line blending with background gradually */}
              <span
                aria-hidden="true"
                className="w-36 sm:w-48 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300 group-hover:w-48 sm:group-hover:w-56"
              />
            </button>
          )}

          {/* READ / FOLD BUTTON (Identical modern luxury aesthetic; black background when FOLD is active) */}
          {isOpen && (
            <button
              onClick={handleToggleUnfold}
              className={`group relative inline-flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none ${
                isUnfolded
                  ? 'bg-black/90 backdrop-blur-md rounded-2xl py-2 px-7 border border-amber-500/30 shadow-2xl shadow-black/80'
                  : 'bg-transparent border-none py-2 px-6'
              }`}
              aria-label={isUnfolded ? 'Fold' : 'Read'}
            >
              {/* Top parallel line blending with background gradually */}
              <span
                aria-hidden="true"
                className="w-36 sm:w-48 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300 group-hover:w-48 sm:group-hover:w-56"
              />

              {/* Modern animated shining golden "READ" / "FOLD" text */}
              <span className="my-2 text-base sm:text-lg font-normal tracking-[0.42em] uppercase animate-text-shine select-none drop-shadow-[0_0_14px_rgba(234,179,8,0.6)] drop-shadow-[0_0_2px_rgba(254,240,138,0.8)]">
                {isUnfolded ? 'Fold' : 'Read'}
              </span>

              {/* Bottom parallel line blending with background gradually */}
              <span
                aria-hidden="true"
                className="w-36 sm:w-48 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300 group-hover:w-48 sm:group-hover:w-56"
              />
            </button>
          )}
        </div>


      </footer>

      {/* 5. Google Maps Venue Location Shortcut (Bottom Right when unfolded) */}
      <AnimatePresence>
        {isUnfolded && (
          <m.aside
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-40"
            aria-label="Venue Google Maps link"
          >
            <a
              href={VENUE_MAPS_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-amber-400/50 bg-stone-950/85 hover:bg-stone-900 text-amber-200 hover:text-amber-100 shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:border-amber-300 hover:shadow-amber-500/20"
              title={`Open venue in Google Maps: ${VENUE_MAPS_CONFIG.venueName}`}
            >
              {/* Google Maps Pin Emblem */}
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-md p-1 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  {/* Google Maps Pin Shape */}
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="#EA4335"
                  />
                  <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84L12 22l5.59-8.16C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7z"
                    fill="url(#gmaps-grad)"
                    fillOpacity="0.2"
                  />
                  <defs>
                    <linearGradient id="gmaps-grad" x1="5" y1="2" x2="19" y2="22">
                      <stop stopColor="#4285F4" />
                      <stop offset="0.5" stopColor="#FBBC04" />
                      <stop offset="1" stopColor="#34A853" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Label: shows icon + text */}
              <span className="font-serif text-xs tracking-wider uppercase font-medium pr-1">
                Venue Location
              </span>
            </a>
          </m.aside>
        )}
      </AnimatePresence>
    </main>
  );
}
