import React from 'react';
import type { EventDetails as EventDetailsType, GuestInfo } from '@/types/invitation';
import { FamilyEventDetails } from './FamilyEventDetails';
import { EngagementDetails } from './EngagementDetails';

interface EventDetailsProps {
  events: EventDetailsType[];
  category: GuestInfo['category'];
}

export function EventDetails({ events, category }: EventDetailsProps) {
  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl text-neutral-800 tracking-wide">
          Programme of Events
        </h2>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
          Tuesday, 26th January 2027
        </p>
      </div>

      <div className="grid gap-5">
        {events.map((event) => {
          if (event.id === 'ashirbad') {
            // Strict check: Only render Ashirbad for family guests
            if (category !== 'family') return null;
            return <FamilyEventDetails key={event.id} event={event} />;
          }
          return <EngagementDetails key={event.id} event={event} />;
        })}
      </div>
    </div>
  );
}

