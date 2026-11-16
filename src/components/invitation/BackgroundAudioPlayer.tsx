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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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
            {/* Left Ornate Ogee Tip (Royal Cartouche Spike) */}
            <div
              aria-hidden="true"
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
            >
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                className="drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]"
              >
                <path
                  d="M 8 0 C 6 3 0 7 0 7 C 0 7 6 11 8 14 Z"
                  fill="url(#musicSpikeGradLeft)"
                  stroke="#5c2e0b"
                  strokeWidth="0.6"
                />
                {/* Inner rivet / jewel accent */}
                <circle cx="4.5" cy="7" r="1" fill="#3b0509" />
                <defs>
                  <linearGradient id="musicSpikeGradLeft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff0a8" />
                    <stop offset="50%" stopColor="#ca8214" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Right Ornate Ogee Tip (Royal Cartouche Spike) */}
            <div
              aria-hidden="true"
              className="absolute -right-[5px] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
            >
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                className="drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]"
              >
                <path
                  d="M 0 0 C 2 3 8 7 8 7 C 8 7 2 11 0 14 Z"
                  fill="url(#musicSpikeGradRight)"
                  stroke="#5c2e0b"
                  strokeWidth="0.6"
                />
                {/* Inner rivet / jewel accent */}
                <circle cx="3.5" cy="7" r="1" fill="#3b0509" />
                <defs>
                  <linearGradient id="musicSpikeGradRight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff0a8" />
                    <stop offset="50%" stopColor="#ca8214" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>
              </svg>
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
                  /* Muted musical note with clean negative-space clearance slash */
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-105"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                  >
                    <defs>
                      <mask id="musicSlashMask">
                        <rect x="0" y="0" width="512" height="512" fill="white" />
                        {/* Cutout band providing clean negative space clearance around slash */}
                        <line
                          x1="55"
                          y1="55"
                          x2="457"
                          y2="457"
                          stroke="black"
                          strokeWidth="70"
                          strokeLinecap="round"
                        />
                      </mask>
                    </defs>
                    {/* Solid double musical note with mask applied */}
                    <path
                      mask="url(#musicSlashMask)"
                      d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8 192 432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"
                    />
                    {/* Golden diagonal slash line sitting centered in the negative space gap */}
                    <line
                      x1="55"
                      y1="55"
                      x2="457"
                      y2="457"
                      stroke="currentColor"
                      strokeWidth="42"
                      strokeLinecap="round"
                    />
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
