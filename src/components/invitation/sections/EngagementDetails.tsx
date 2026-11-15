import React from 'react';
import type { EventDetails } from '@/types/invitation';

interface EngagementDetailsProps {
  event: EventDetails;
}

export function EngagementDetails({ event }: EngagementDetailsProps) {
  return (
    <article
      className="p-6 rounded-xl bg-white/90 border border-neutral-200/80 shadow-sm relative overflow-hidden"
      aria-label="Celebration: Engagement & Registry"
    >
      <header className="flex justify-between items-baseline mb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Evening Reception &amp; Registry
          </span>
          <h3 className="font-serif text-xl font-medium text-neutral-900 mt-1">
            {event.title}
          </h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium text-neutral-800 bg-neutral-100 rounded border border-neutral-200">
          {event.time}
        </span>
      </header>

      {event.subtitle && (
        <p className="text-xs font-serif italic text-neutral-500 mb-3">
          {event.subtitle}
        </p>
      )}

      <p className="text-sm text-neutral-700 leading-relaxed mb-4">
        {event.description}
      </p>

      <footer className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
        <p className="font-medium text-neutral-800">{event.venue}</p>
        <p className="text-neutral-500">{event.venueAddress}</p>
      </footer>
    </article>
  );
}

