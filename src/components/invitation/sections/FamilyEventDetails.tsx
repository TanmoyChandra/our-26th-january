import React from 'react';
import type { EventDetails } from '@/types/invitation';

interface FamilyEventDetailsProps {
  event: EventDetails;
}

/**
 * Rendered EXCLUSIVELY for family category guests.
 * General guests never see or render this component.
 */
export function FamilyEventDetails({ event }: FamilyEventDetailsProps) {
  return (
    <article
      className="p-6 rounded-xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-white border border-amber-200/60 shadow-sm relative overflow-hidden"
      aria-label="Family Ceremony: Ashirbad"
    >
      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />

      <header className="flex justify-between items-baseline mb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold">
            Morning Auspicious Ceremony &bull; Family Only
          </span>
          <h3 className="font-serif text-xl font-medium text-neutral-900 mt-1">
            {event.title}
          </h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium text-amber-900 bg-amber-100/80 rounded border border-amber-300/50">
          {event.time}
        </span>
      </header>

      {event.subtitle && (
        <p className="text-xs font-serif italic text-amber-900/70 mb-3">
          {event.subtitle}
        </p>
      )}

      <p className="text-sm text-neutral-700 leading-relaxed mb-4">
        {event.description}
      </p>

      <footer className="pt-3 border-t border-amber-900/10 text-xs text-neutral-600 space-y-1">
        <p className="font-medium text-neutral-800">{event.venue}</p>
        <p className="text-neutral-500">{event.venueAddress}</p>
      </footer>
    </article>
  );
}

