import React from 'react';
import type { EventDetails, GuestInfo, InvitationConfig } from '@/types/invitation';
import { InvitationCover } from './InvitationCover';
import { InvitationInner } from './InvitationInner';
import styles from './Card.module.css';

interface InvitationCardProps {
  guestInfo: GuestInfo;
  events: EventDetails[];
  config: InvitationConfig;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  coverRef?: React.RefObject<HTMLDivElement | null>;
  innerContentRef?: React.RefObject<HTMLDivElement | null>;
}

export const InvitationCard = React.forwardRef<HTMLDivElement, InvitationCardProps>(
  ({ guestInfo, events, config, cardRef, coverRef, innerContentRef }, ref) => {
    return (
      <div
        ref={ref || cardRef}
        className={styles.cardContainer}
        data-invitation-card
      >
        <div className={styles.cardRoot}>
          {/* Folded booklet representation */}
          <div className={styles.cardBook} data-card-book>
            {/* Left page interior base */}
            <div className={styles.cardInnerPage}>
              <span className="text-[10px] tracking-widest uppercase text-amber-800/60 font-mono">
                January 2027
              </span>
              <h4 className="font-serif text-3xl font-light text-neutral-800 my-2">
                26
              </h4>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-sans">
                Tuesday
              </p>
              <div className="w-6 h-[1px] bg-neutral-300 my-3" />
              <p className="font-serif italic text-xs text-neutral-500">
                Save the date
              </p>
            </div>

            {/* Right page base details (events) */}
            <InvitationInner
              guestInfo={guestInfo}
              events={events}
              config={config}
              contentRef={innerContentRef}
            />

            {/* Fold line shadow effect */}
            <div className={styles.spineShadow} />

            {/* Hinged Cover that physically unfolds */}
            <InvitationCover
              ref={coverRef}
              guestInfo={guestInfo}
              config={config}
            />
          </div>
        </div>
      </div>
    );
  }
);

InvitationCard.displayName = 'InvitationCard';

