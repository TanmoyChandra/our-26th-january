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

      {/* Floating golden music toggle in the top-right corner */}
      <aside className="fixed top-5 right-5 sm:top-6 sm:right-7 z-40 pointer-events-auto select-none pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)]">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          title={isPlaying ? 'Pause background music' : 'Play background music'}
          className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 backdrop-blur-md border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all duration-300 hover:scale-110 active:scale-95 hover:border-amber-300 hover:shadow-[0_0_22px_rgba(251,191,36,0.55)] focus:outline-none"
        >
          {/* Subtle spinning amber ring when playing */}
          {isPlaying && (
            <span
              aria-hidden="true"
              className="absolute -inset-[3px] rounded-full border border-amber-400/40 border-t-amber-300 animate-spin"
              style={{ animationDuration: '4s' }}
            />
          )}

          {isPlaying ? (
            /* Animated music wave bars / sound icon */
            <div className="flex items-center gap-[2.5px] h-4">
              <span className="w-[2.5px] h-3 bg-amber-300 rounded-full animate-pulse" style={{ animationDuration: '0.8s' }} />
              <span className="w-[2.5px] h-4 bg-amber-200 rounded-full animate-pulse" style={{ animationDuration: '0.5s' }} />
              <span className="w-[2.5px] h-2.5 bg-amber-300 rounded-full animate-pulse" style={{ animationDuration: '0.9s' }} />
              <span className="w-[2.5px] h-3.5 bg-amber-200 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }} />
            </div>
          ) : (
            /* Muted / play musical note icon */
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200/75 transition-colors group-hover:text-amber-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
              />
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </aside>
    </>
  );
}
