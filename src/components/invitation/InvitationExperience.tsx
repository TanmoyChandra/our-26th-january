'use client';

import React, { useRef } from 'react';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';
import { Envelope } from './Envelope/Envelope';
import { InvitationCard } from './Card/InvitationCard';
import { InvitationContent } from './content/InvitationContent';
import { useEnvelopeTimeline } from '../animations/useEnvelopeTimeline';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface InvitationExperienceProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
}

export function InvitationExperience({
  guestInfo,
  events,
  config,
}: InvitationExperienceProps) {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const flapRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const innerContentRef = useRef<HTMLDivElement | null>(null);
  const websiteContentRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = useReducedMotion();

  // Initialize GSAP scroll-triggered master timeline
  useEnvelopeTimeline({
    pinRef,
    envelopeRef,
    flapRef,
    frontRef,
    cardRef,
    coverRef,
    innerContentRef,
    websiteContentRef,
    reducedMotion,
  });

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-neutral-800 selection:bg-amber-100 selection:text-amber-900">
      {/* ─────────────────────────────────────────────────────────────
          STAGE CONTAINER (PINNED SECTION FOR SCROLL ANIMATION)
         ───────────────────────────────────────────────────────────── */}
      <section
        ref={pinRef}
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-4"
        aria-label="Invitation Envelope Experience"
      >
        {/* Subtle background luxury ambient glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50/40 via-transparent to-neutral-200/30" />

        {/* Scroll indicator prompt */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-xs tracking-widest uppercase font-mono pointer-events-none">
          <span>Scroll to Open</span>
          <div className="w-4 h-7 border border-neutral-400 rounded-full flex justify-center p-1">
            <div className="w-1 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
          </div>
        </div>

        {/* Physical 3D Envelope */}
        <Envelope
          ref={envelopeRef}
          recipientName={guestInfo.displayName}
          category={guestInfo.category}
          flapRef={flapRef}
          frontRef={frontRef}
        >
          {/* Card placed physically inside between Back and Front */}
          <InvitationCard
            cardRef={cardRef}
            coverRef={coverRef}
            innerContentRef={innerContentRef}
            guestInfo={guestInfo}
            events={events}
            config={config}
          />
        </Envelope>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TRANSITION SECTION: FULL DETAILS INVITATION EXPERIENCE
         ───────────────────────────────────────────────────────────── */}
      <div ref={websiteContentRef} className="relative z-10 opacity-95">
        <InvitationContent
          guestInfo={guestInfo}
          events={events}
          config={config}
        />
      </div>
    </div>
  );
}

