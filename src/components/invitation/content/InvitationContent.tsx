import React from 'react';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';

interface InvitationContentProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
}

export function InvitationContent({ guestInfo, events, config }: InvitationContentProps) {
  return (
    <section className="relative z-20 max-w-3xl mx-auto px-6 py-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 my-16">
      {/* Editorial Header */}
      <div className="text-center space-y-4 pb-12 border-b border-neutral-100">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Celebration &bull; 26 January 2027
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-normal text-neutral-900 tracking-tight">
          {config.coupleName.person1} &amp; {config.coupleName.person2}
        </h1>
        <p className="font-serif italic text-base text-neutral-500 max-w-md mx-auto">
          Honoured to welcome {guestInfo.displayName} to celebrate this milestone together.
        </p>
        <div className="inline-block mt-2 px-3 py-1 text-[11px] font-mono tracking-widest uppercase bg-neutral-100 text-neutral-600 rounded-full">
          {guestInfo.category === 'family' ? 'Family Access & Events' : 'General Invitation'}
        </div>
      </div>

      {/* Events Itinerary */}
      <div className="py-12 space-y-8">
        <h2 className="font-serif text-xl md:text-2xl text-center text-neutral-800 tracking-wide">
          Event Schedule
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/60 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-lg text-neutral-900">
                    {event.title}
                  </h3>
                  <span className="text-xs font-mono font-medium text-amber-800/80 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/40">
                    {event.time}
                  </span>
                </div>
                {event.subtitle && (
                  <p className="text-xs font-serif italic text-neutral-500 mb-3">
                    {event.subtitle}
                  </p>
                )}
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  {event.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200/50 text-xs text-neutral-500 space-y-1">
                <p className="font-medium text-neutral-700">{event.venue}</p>
                <p className="text-neutral-400">{event.venueAddress}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Contact & RSVP Info */}
      <footer className="pt-10 border-t border-neutral-100 text-center space-y-4">
        <h3 className="font-serif text-lg text-neutral-800">RSVP &amp; Enquiries</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Kindly respond by {config.rsvpDeadline || 'the requested date'}. For queries, please reach out to{' '}
          {config.contact.name} at {config.contact.phone}.
        </p>
        {config.contact.email && (
          <p className="text-xs font-mono text-neutral-400">
            {config.contact.email}
          </p>
        )}
      </footer>
    </section>
  );
}

