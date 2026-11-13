'use client';

import type { GuestInfo, EventDetails, InvitationConfig } from '@/types/invitation';

interface InvitationViewProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
}

export function InvitationView({ guestInfo, events, config }: InvitationViewProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      {/* Personalised greeting */}
      <section aria-label="Greeting" className="text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500">
          Dear {guestInfo.displayName},
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          {config.coupleName.person1} &amp; {config.coupleName.person2}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          invite you to join their celebration
        </p>
      </section>

      {/* Category badge (dev helper — remove in design phase) */}
      <div
        role="status"
        aria-label={`Invitation category: ${guestInfo.category}`}
        className="rounded-full border px-3 py-1 text-xs"
      >
        Category: <strong>{guestInfo.category}</strong>
      </div>

      {/* Events list */}
      <section aria-label="Events" className="w-full max-w-md space-y-4">
        {events.map((event) => (
          <article
            key={event.id}
            aria-label={event.title}
            className="rounded-lg border p-4"
          >
            <h2 className="font-semibold">{event.title}</h2>
            {event.subtitle && (
              <p className="text-sm text-gray-500">{event.subtitle}</p>
            )}
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium">Date:</dt>
                <dd>{event.date}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">Time:</dt>
                <dd>{event.time}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">Venue:</dt>
                <dd>{event.venue}</dd>
              </div>
            </dl>
            <p className="mt-2 text-sm text-gray-600">{event.description}</p>
          </article>
        ))}
      </section>

      {/* Architecture note */}
      <p className="max-w-sm text-center text-xs text-gray-400">
        Visual design and animation will be added in a later phase. This placeholder
        confirms routing, personalisation, and event-category logic are working.
      </p>
    </main>
  );
}
