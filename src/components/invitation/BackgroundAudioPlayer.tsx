'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BackgroundAudioPlayerProps {
  src?: string;
  volume?: number;
}

/**
 * BackgroundAudioPlayer
 *
 * Automatically begins playing background music on the first user interaction
 * (any touch, tap, or click anywhere on the screen), respecting browser autoplay policies.
 * Includes a discreet, matching golden floating sound toggle button in the top-right corner.
 */
export function BackgroundAudioPlayer({
  src = '/audio/satranga-short.mp3',
  volume = 0.8,
}: BackgroundAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handleFirstInteraction = () => {
      if (hasInteracted) return;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
          cleanupListeners();
        })
        .catch((err) => {
          // Some browsers require repeated touch or user gesture on certain elements
          console.warn('Autoplay waiting for direct user gesture:', err);
        });
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      cleanupListeners();
      audio.pause();
    };
  }, [src, volume, hasInteracted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => console.warn('Could not resume audio:', err));
    }
  };

  return (
    <>
      {/* Hidden audio element with looping enabled */}
      <audio ref={audioRef} src={src} preload="auto" loop />

      {/* Floating royal music toggle in the top-right corner */}
      <aside className="fixed top-5 right-5 sm:top-6 sm:right-7 z-40 pointer-events-auto select-none pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)]">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          title={isPlaying ? 'Pause background music' : 'Play background music'}
          className="group relative inline-flex items-center justify-center cursor-pointer select-none border-none bg-transparent p-0 focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          {/* Outer ambient golden underglow */}
          <div
            aria-hidden="true"
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-400/50 to-amber-600/30 blur-md opacity-85 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Main outer golden metallic beveled bezel */}
          <div className="relative flex items-center justify-center rounded-full p-[2.5px] sm:p-[3px] bg-gradient-to-b from-[#fff0a8] via-[#ca8214] to-[#78350f] shadow-[0_8px_24px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-[#5c2e0b]/80">
            {/* Top Center Specular Lens Flare */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="w-8 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#fffde6] to-transparent shadow-[0_0_6px_#ffffff,0_0_12px_#f59e0b]" />
              <div className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_5px_#ffffff,0_0_10px_#f59e0b] blur-[0.2px]" />
            </div>

            {/* Bottom Center Specular Lens Flare */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="w-8 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#fff6c2] to-transparent shadow-[0_0_6px_#ffffff,0_0_12px_#f59e0b]" />
              <div className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_5px_#ffffff,0_0_10px_#f59e0b] blur-[0.2px]" />
            </div>

            {/* Inner velvet crimson fill container */}
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[radial-gradient(ellipse_at_center,_#6c1117_0%,_#4d080f_55%,_#2a0306_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Delicate inset golden hairline stroke */}
              <div
                aria-hidden="true"
                className="absolute inset-[2.5px] rounded-full border border-amber-400/60 shadow-[inset_0_0_6px_rgba(0,0,0,0.65)] pointer-events-none"
              />

              {/* Soft top-half satin highlight sheen */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 via-white/5 to-transparent rounded-t-full pointer-events-none"
              />

              {/* Icon Content */}
              <div className="relative z-10 flex items-center justify-center">
                {isPlaying ? (
                  /* Animated golden equalizer wave bars */
                  <div className="flex items-center gap-[3px] h-4">
                    <span
                      className="w-[2.5px] h-3 rounded-full bg-gradient-to-t from-amber-400 to-[#fff4d1] shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse"
                      style={{ animationDuration: '0.8s' }}
                    />
                    <span
                      className="w-[2.5px] h-4 rounded-full bg-gradient-to-t from-amber-400 to-[#fff4d1] shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse"
                      style={{ animationDuration: '0.5s' }}
                    />
                    <span
                      className="w-[2.5px] h-2.5 rounded-full bg-gradient-to-t from-amber-400 to-[#fff4d1] shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse"
                      style={{ animationDuration: '0.9s' }}
                    />
                    <span
                      className="w-[2.5px] h-3.5 rounded-full bg-gradient-to-t from-amber-400 to-[#fff4d1] shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse"
                      style={{ animationDuration: '0.6s' }}
                    />
                  </div>
                ) : (
                  /* Muted musical note with golden slash */
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-105"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
                    />
                    <line x1="3" y1="3" x2="21" y2="21" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </button>
      </aside>
    </>
  );
}
