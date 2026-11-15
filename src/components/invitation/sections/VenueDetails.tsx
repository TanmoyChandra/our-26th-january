import React from 'react';
import type { InvitationConfig } from '@/types/invitation';

interface VenueDetailsProps {
  config: InvitationConfig;
}

export function VenueDetails({ config }: VenueDetailsProps) {
  return (
    <footer className="pt-8 border-t border-neutral-100 text-center space-y-4">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-neutral-800">RSVP &amp; Enquiries</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Kindly confirm your presence by {config.rsvpDeadline || 'the requested date'}.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/50 inline-block text-xs text-neutral-600 space-y-1">
        <p className="font-semibold text-neutral-800">{config.contact.name}</p>
        <p>{config.contact.phone}</p>
        {config.contact.email && <p className="font-mono text-neutral-400">{config.contact.email}</p>}
      </div>
    </footer>
  );
}

