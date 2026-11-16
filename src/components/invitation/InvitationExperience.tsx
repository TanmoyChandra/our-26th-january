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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return; // Prevent any interaction while animation is playing
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
    if (isAnimating) return; // Prevent any interaction while animation is playing
    if (envelope3DRef.current) {
      const state = envelope3DRef.current.toggleUnfold();
      setIsUnfolded(state);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c0a09] select-none">
      {/* 1. Overall space luxury banquet backdrop (Optimized WebP & Progressive JPEG for instant loading) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <picture>
          <source srcSet="/images/space_background.webp" type="image/webp" />
          <img
            src="/images/space_background.jpg"
            alt="Wedding venue ambience"
            className="w-full h-full object-cover object-center brightness-105 contrast-[1.02]"
            loading="eager"
            decoding="async"
          />
        </picture>
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
            onAnimationChange={setIsAnimating}
          />
        </div>
      </section>

      {/* 3b. Romantic Falling Pink Rose Petals Overlay */}
      <RosePetalsOverlay />

      {/* 4. Bottom Floating Action Controls (Fades out smoothly during 3D animations and locks interaction) */}
      <footer
        className={`absolute bottom-14 sm:bottom-16 left-0 right-0 z-30 flex flex-col items-center justify-center gap-3 text-center px-4 transition-all duration-400 ease-in-out ${
          isAnimating
            ? 'opacity-0 pointer-events-none translate-y-3'
            : 'opacity-100 pointer-events-auto translate-y-0'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* OPEN / CLOSE BUTTON (Shown when card is nestled in envelope) */}
          {!isUnfolded && (
            <button
              onClick={handleToggle}
              className="group relative inline-flex flex-col items-center justify-center bg-transparent border-none cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
              aria-label={isOpen ? 'Close' : 'Open'}
            >
              <div className="relative flex flex-col items-center justify-center w-36 sm:w-48">
                {/* Top parallel line blending with background gradually */}
                <span
                  aria-hidden="true"
                  className="relative z-10 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300"
                />

                {/* Modern animated shining golden "OPEN" / "CLOSE" text */}
                <span className="relative z-10 my-2 text-base sm:text-lg font-normal tracking-[0.42em] uppercase animate-text-shine select-none drop-shadow-[0_0_14px_rgba(234,179,8,0.6)] drop-shadow-[0_0_2px_rgba(254,240,138,0.8)]">
                  {isOpen ? 'Close' : 'Open'}
                </span>

                {/* Bottom parallel line blending with background gradually */}
                <span
                  aria-hidden="true"
                  className="relative z-10 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300"
                />
              </div>
            </button>
          )}

          {/* READ / FOLD BUTTON (Identical modern luxury aesthetic; black horizontal fade strictly bounded between golden lines for FOLD) */}
          {isOpen && (
            <button
              onClick={handleToggleUnfold}
              className="group relative inline-flex flex-col items-center justify-center bg-transparent border-none cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
              aria-label={isUnfolded ? 'Fold' : 'Read'}
            >
              <div className="relative flex flex-col items-center justify-center w-36 sm:w-48">
                {/* Horizontal black gradient strictly bounded between top & bottom lines, fading left & right */}
                {isUnfolded && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/95 to-transparent pointer-events-none"
                  />
                )}

                {/* Top parallel line blending with background gradually */}
                <span
                  aria-hidden="true"
                  className="relative z-10 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300"
                />

                {/* Modern animated shining golden "READ" / "FOLD" text */}
                <span className="relative z-10 my-2 text-base sm:text-lg font-normal tracking-[0.42em] uppercase animate-text-shine select-none drop-shadow-[0_0_14px_rgba(234,179,8,0.6)] drop-shadow-[0_0_2px_rgba(254,240,138,0.8)]">
                  {isUnfolded ? 'Fold' : 'Read'}
                </span>

                {/* Bottom parallel line blending with background gradually */}
                <span
                  aria-hidden="true"
                  className="relative z-10 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 group-hover:via-amber-300"
                />
              </div>
            </button>
          )}
        </div>


      </footer>

      {/* 5. Google Maps Venue Location Shortcut (Bottom Right when unfolded: circular icon button) */}
      <AnimatePresence>
        {isUnfolded && !isAnimating && (
          <m.aside
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed bottom-6 right-5 sm:right-7 z-40"
            aria-label="Venue Google Maps link"
          >
            <a
              href={VENUE_MAPS_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-xl shadow-black/70 hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 p-1 border border-white/80 focus:outline-none"
              title={`Open venue in Google Maps: ${VENUE_MAPS_CONFIG.venueName}`}
            >
              <img
                src="/images/google_maps_pin.png"
                alt="Google Maps Venue Location"
                className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </m.aside>
        )}
      </AnimatePresence>
    </main>
  );
}
