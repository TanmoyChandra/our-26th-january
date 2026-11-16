'use client';

import React from 'react';

interface LuxuryActionButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

/**
 * LuxuryActionButton
 *
 * Pixel-accurate, high-fidelity recreation of the royal banquet button UI:
 * - Deep velvet crimson / ruby maroon gradient fill
 * - Double metallic 3D golden beveled frame with ambient underglow
 * - Ornate royal ogee / diamond cartouche tips on the horizontal apexes
 * - Luminous specular lens flares / star shimmers on the top and bottom center edges
 * - Delicate inset golden hairline stroke
 * - Embossed metallic champagne gold serif typography (prominent, clear, without chevrons)
 */
export function LuxuryActionButton({
  onClick,
  label,
  className = '',
  disabled = false,
}: LuxuryActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`group relative inline-flex items-center justify-center cursor-pointer select-none border-none bg-transparent p-0 focus:outline-none transition-transform duration-300 hover:scale-[1.04] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {/* Outer ambient golden underglow */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-400/50 to-amber-600/30 blur-md opacity-85 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Main outer golden metallic beveled bezel */}
      <div className="relative flex items-center justify-center w-full rounded-full p-[2.5px] sm:p-[3px] bg-gradient-to-b from-[#fff0a8] via-[#ca8214] to-[#78350f] shadow-[0_8px_24px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-[#5c2e0b]/80">
        {/* Left Ornate Ogee Tip (Royal Cartouche Point) */}
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
              fill="url(#goldBezelGradLeft)"
              stroke="#5c2e0b"
              strokeWidth="0.6"
            />
            {/* Inner jewel accent */}
            <circle cx="4.5" cy="7" r="1" fill="#3b0509" />
            <defs>
              <linearGradient id="goldBezelGradLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff0a8" />
                <stop offset="50%" stopColor="#ca8214" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right Ornate Ogee Tip (Royal Cartouche Point) */}
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
              fill="url(#goldBezelGradRight)"
              stroke="#5c2e0b"
              strokeWidth="0.6"
            />
            {/* Inner jewel accent */}
            <circle cx="3.5" cy="7" r="1" fill="#3b0509" />
            <defs>
              <linearGradient id="goldBezelGradRight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff0a8" />
                <stop offset="50%" stopColor="#ca8214" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Center Specular Lens Flare / Soft Shimmer Beam */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
        >
          {/* Horizontal flare line */}
          <div className="w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#fffde6] to-transparent shadow-[0_0_6px_#ffffff,0_0_14px_#f59e0b]" />
          {/* Soft luminous center spark */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff,0_0_12px_#f59e0b] blur-[0.2px]" />
        </div>

        {/* Bottom Center Specular Lens Flare / Soft Shimmer Beam */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
        >
          {/* Horizontal flare line */}
          <div className="w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#fff6c2] to-transparent shadow-[0_0_6px_#ffffff,0_0_14px_#f59e0b]" />
          {/* Soft luminous center spark */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff,0_0_12px_#f59e0b] blur-[0.2px]" />
        </div>

        {/* Inner velvet crimson fill container */}
        <div className="relative w-full rounded-full px-6 sm:px-8 py-2.5 sm:py-3 min-w-[135px] sm:min-w-[165px] bg-[radial-gradient(ellipse_at_center,_#6c1117_0%,_#4d080f_55%,_#2a0306_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Delicate inset golden hairline stroke */}
          <div
            aria-hidden="true"
            className="absolute inset-[2.5px] sm:inset-[3px] rounded-full border border-amber-400/60 shadow-[inset_0_0_6px_rgba(0,0,0,0.65)] pointer-events-none"
          />

          {/* Soft top-half satin highlight sheen */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 via-white/5 to-transparent rounded-t-full pointer-events-none"
          />

          {/* Button Content: Larger Golden Serif Text (Clean, no arrow) */}
          <div className="relative z-10 flex items-center justify-center px-1">
            <span className="font-serif font-medium text-sm sm:text-base md:text-[17px] tracking-[0.22em] uppercase select-none text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] via-[#f7df94] to-[#d4a03e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
