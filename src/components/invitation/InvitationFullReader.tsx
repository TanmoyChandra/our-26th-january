'use client';

import React from 'react';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';

interface InvitationFullReaderProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function InvitationFullReader({
  guestInfo,
  events,
  config,
  isOpen,
  onClose,
}: InvitationFullReaderProps) {
  if (!isOpen) return null;

  // Generate an iCalendar (.ics) download for seamless Add to Calendar
  const handleAddToCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Our 26th January//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'SUMMARY:Engagement Ceremony: Tanmoy Chandra & Parnasha Sen',
      'DESCRIPTION:We cordially invite you to celebrate the Engagement Ceremony of Tanmoy and Parnasha.',
      'DTSTART:20270126T130000Z',
      'DTEND:20270126T173000Z',
      'LOCATION:ITC Royal Bengal, Kolkata, West Bengal, India',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Engagement_Tanmoy_Parnasha.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleMapsUrl = 'https://maps.google.com/?q=ITC+Royal+Bengal+Kolkata';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain transition-opacity duration-300 ease-out animate-fadeIn select-text"
      aria-label="Full Invitation Card Reader"
    >
      {/* 1. Backdrop ambience matching banquet space with subtle vignette */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black/75 backdrop-blur-md">
        <img
          src="/images/space_background.jpg"
          alt="Wedding backdrop"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
      </div>

      {/* 2. Top Navigation Bar with Quick Close & Guest Badge */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-stone-950/70 backdrop-blur-lg border-b border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-serif tracking-widest uppercase text-xs text-amber-200/90 font-medium">
            Wedding Invitation
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-wider text-amber-400/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-950/40">
            For: {guestInfo.displayName}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-950/60 text-amber-200 text-xs font-serif tracking-wider hover:bg-amber-900/60 transition-colors"
            aria-label="Close Full Card"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
          </button>
        </div>
      </nav>

      {/* 3. Main 3-Fold Card Container (Scrollable end-to-end) */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-6 pb-28 flex flex-col items-center">
        <article className="w-full bg-[#faf6ee] text-stone-900 rounded-3xl shadow-2xl shadow-amber-950/90 border border-amber-300/80 overflow-hidden relative">
          {/* Subtle paper gold inner trim */}
          <div className="absolute inset-2 sm:inset-3 pointer-events-none rounded-2xl border border-amber-600/30" />

          {/* ======================================================== */}
          {/* PANEL 1: AUSPICIOUS INVOCATION & ENGAGEMENT CEREMONY     */}
          {/* ======================================================== */}
          <section className="relative px-6 py-10 sm:p-12 text-center flex flex-col items-center border-b border-amber-700/20">
            {/* Auspicious Vedic Inscription */}
            <div className="text-amber-700 font-serif text-sm tracking-widest uppercase mb-1">
              ॥ श्री गणेशाय नमः ॥
            </div>
            <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-amber-800/80 mb-6">
              With the blessings of Almighty & Ancestors
            </div>

            {/* High-Resolution Artwork Presentation */}
            <div className="w-full max-w-md mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-500/50 relative bg-amber-950">
              <img
                src="/textures/envelope/card_engagement.png"
                alt="Engagement Ceremony Announcement"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Typography Header */}
            <h1 className="font-serif text-2xl sm:text-3xl text-amber-900 tracking-wide uppercase font-semibold mb-2">
              Engagement Ceremony
            </h1>
            <p className="font-serif italic text-stone-600 text-sm mb-6">
              celebrating the union of two souls and two families
            </p>

            {/* Couple Announcement Box */}
            <div className="w-full max-w-lg bg-amber-50/70 border border-amber-300/60 rounded-2xl p-6 sm:p-8 my-2 shadow-sm">
              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold tracking-tight">
                Tanmoy Chandra
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm font-serif mt-1">
                Son of Smt. Tapati Chandra &amp; Sri Tapas Chandra
              </p>

              <div className="my-3 flex items-center justify-center gap-3">
                <span className="h-[1px] w-12 bg-amber-400" />
                <span className="font-serif italic text-amber-800 text-lg">&amp;</span>
                <span className="h-[1px] w-12 bg-amber-400" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold tracking-tight">
                Parnasha Sen
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm font-serif mt-1">
                Daughter of Smt. Swapna Sen &amp; Sri Krishna Sen
              </p>
            </div>
          </section>

          {/* ======================================================== */}
          {/* PANEL 2: CEREMONY DETAILS, VENUE & INTERACTIVE ACTIONS   */}
          {/* ======================================================== */}
          <section className="relative px-6 py-10 sm:p-12 text-center flex flex-col items-center bg-gradient-to-b from-[#faf6ee] via-amber-50/40 to-[#faf6ee] border-b border-amber-700/20">
            {/* Section Motif */}
            <div className="flex items-center gap-3 mb-3 text-amber-700">
              <span className="h-[1px] w-8 bg-amber-400/80" />
              <span className="text-xs font-mono tracking-widest uppercase font-semibold">
                Event Program
              </span>
              <span className="h-[1px] w-8 bg-amber-400/80" />
            </div>

            {/* Auspicious Date Callout */}
            <div className="inline-flex flex-col items-center justify-center px-8 py-4 rounded-2xl bg-amber-900/10 border border-amber-700/30 mb-8">
              <span className="font-serif text-xs uppercase tracking-widest text-amber-800 font-medium">
                Tuesday
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-900 my-0.5">
                26 January 2027
              </span>
              <span className="text-xs font-mono tracking-wider text-stone-600">
                12 Magh 1433 • Shubha Muhurat
              </span>
            </div>

            {/* Itinerary Schedule */}
            <div className="w-full max-w-lg space-y-4 text-left mb-8">
              {/* Event 1: Ashirbad (If family) */}
              {guestInfo.category === 'family' && (
                <div className="p-4 rounded-xl border border-amber-400/40 bg-white/70 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-sm shrink-0">
                    10:30
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Ashirbad Ceremony
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Morning auspicious blessings with elders and family members.
                    </p>
                  </div>
                </div>
              )}

              {/* Event 2: Ring Ceremony */}
              <div className="p-4 rounded-xl border border-amber-400/40 bg-white/70 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-sm shrink-0">
                  18:30
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Ring Exchange Ceremony
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Formal exchange of rings followed by floral greetings.
                  </p>
                </div>
              </div>

              {/* Event 3: Banquet & Dinner */}
              <div className="p-4 rounded-xl border border-amber-400/40 bg-white/70 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-sm shrink-0">
                  20:00
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Gala Dinner &amp; Celebrations
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Feast, music, and joyful memories together.
                  </p>
                </div>
              </div>
            </div>

            {/* Venue Location Block */}
            <div className="w-full max-w-lg p-5 rounded-2xl bg-amber-900/5 border border-amber-300/80 mb-6 text-center">
              <span className="text-[11px] font-mono tracking-widest uppercase text-amber-800 font-semibold block mb-1">
                Venue
              </span>
              <h4 className="font-serif text-xl font-bold text-stone-900 mb-1">
                ITC Royal Bengal, Kolkata
              </h4>
              <p className="text-xs sm:text-sm text-stone-600">
                1, JBS Haldane Avenue, Tangra, Kolkata, West Bengal 700046
              </p>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-amber-100 font-serif text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Add to Calendar</span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-700/60 text-amber-900 font-serif text-xs uppercase tracking-widest hover:bg-amber-100/60 transition-colors shadow-sm hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Get Directions</span>
              </a>
            </div>
          </section>

          {/* ======================================================== */}
          {/* PANEL 3: FAMILIES' WELCOME, DRESS CODE & COMPLIMENTS     */}
          {/* ======================================================== */}
          <section className="relative px-6 py-10 sm:p-12 text-center flex flex-col items-center bg-[#faf6ee]">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mb-4 text-amber-800 text-xl">
              ❦
            </div>

            <p className="font-serif italic text-base sm:text-lg text-stone-700 max-w-md mx-auto leading-relaxed mb-6">
              &ldquo;Your presence, love, and heartfelt blessings are the most cherished gifts as we step into this beautiful new chapter of our lives.&rdquo;
            </p>

            {/* Dress code & Note */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider text-stone-600 mb-8 pb-8 border-b border-amber-300/40 w-full max-w-md">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Dress Code: Festive / Traditional
              </span>
              <span className="hidden sm:inline text-amber-400">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Blessings Only
              </span>
            </div>

            {/* Family Compliments */}
            <div className="space-y-1">
              <h5 className="font-serif text-sm uppercase tracking-widest text-amber-900 font-semibold">
                With Best Compliments From
              </h5>
              <p className="font-serif text-sm text-stone-700">
                Chandra &amp; Sen Families
              </p>
              <p className="text-xs text-stone-500 font-mono tracking-wider">
                Relatives &amp; Friends
              </p>
            </div>

            {/* Personalized Guest Badge */}
            <div className="mt-8 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono tracking-wider">
              Specially Invited: <span className="font-semibold">{guestInfo.displayName}</span>
            </div>
          </section>
        </article>
      </div>

      {/* 4. Floating Luxury Bottom Control: Fold Card & Return to 3D Envelope */}
      <aside className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-amber-400/80 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-serif tracking-widest uppercase text-xs font-bold shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110"
          aria-label="Fold Card and Return to Envelope"
        >
          <svg className="w-4 h-4 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>✕ Fold Card &amp; Return to Envelope</span>
        </button>
      </aside>
    </div>
  );
}
