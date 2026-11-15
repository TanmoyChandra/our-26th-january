'use client';

import React, { forwardRef } from 'react';
import type { EventDetails as EventDetailsType, GuestInfo, InvitationConfig } from '@/types/invitation';
import { InvitationCoverSection } from './sections/InvitationCover';
import { EventDetails } from './sections/EventDetails';
import { VenueDetails } from './sections/VenueDetails';

interface InvitationCardProps {
  guestInfo: GuestInfo;
  events: EventDetailsType[];
  config: InvitationConfig;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Pure HTML/CSS/React Invitation Card component.
 * Rendered with normal DOM elements for 100% text selectability, accessibility,
 * responsive layouts and independent styling.
 */
export const InvitationCard = forwardRef<HTMLDivElement, InvitationCardProps>(
  ({ guestInfo, events, config, className = '', style }, ref) => {
    return (
      <article
        ref={ref}
        className={`relative z-10 w-full max-w-2xl mx-auto bg-[#fcfbf7] text-neutral-800 rounded-2xl shadow-2xl border border-amber-900/10 p-6 md:p-10 backdrop-blur-sm ${className}`}
        style={style}
        aria-label="Personalized Wedding Invitation Card"
        data-invitation-card-html
      >
        {/* Subtle decorative gold perimeter */}
        <div className="absolute inset-3 rounded-xl border border-amber-800/15 pointer-events-none" />

        {/* 1. Header / Cover section */}
        <InvitationCoverSection
          displayName={guestInfo.displayName}
          category={guestInfo.category}
          config={config}
        />

        {/* 2. Events & Ceremony Details (strict family vs general filtering) */}
        <EventDetails
          events={events}
          category={guestInfo.category}
        />

        {/* 3. Venue & RSVP details */}
        <VenueDetails config={config} />
      </article>
    );
  }
);

InvitationCard.displayName = 'InvitationCard';

