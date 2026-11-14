import React from 'react';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';
import styles from './Card.module.css';

interface InvitationInnerProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}

export const InvitationInner = React.forwardRef<HTMLDivElement, InvitationInnerProps>(
  ({ guestInfo, events, config, contentRef }, ref) => {
    return (
      <div ref={ref} className={styles.cardRightBase} data-card-inner>
        <div ref={contentRef} className={styles.contentReveal} data-card-content>
          <div className="space-y-4 text-left">
            <header className="border-b border-neutral-200 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800/70">
                Programme &bull; {guestInfo.category}
              </span>
              <h3 className="font-serif text-lg tracking-wide text-neutral-800 mt-1">
                Celebration Details
              </h3>
            </header>

            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-2.5 rounded bg-neutral-50/70 border border-neutral-200/60"
                >
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif font-medium text-sm text-neutral-800">
                      {event.title}
                    </h4>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {event.time}
                    </span>
                  </div>
                  {event.subtitle && (
                    <p className="text-[11px] text-neutral-400 italic">
                      {event.subtitle}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-600 mt-1 font-sans">
                    {event.venue}
                  </p>
                </div>
              ))}
            </div>

            <footer className="pt-2 text-center border-t border-neutral-200">
              <p className="text-[10px] tracking-wider uppercase text-neutral-400">
                26th January 2027 &bull; Kolkata
              </p>
            </footer>
          </div>
        </div>
      </div>
    );
  }
);

InvitationInner.displayName = 'InvitationInner';

