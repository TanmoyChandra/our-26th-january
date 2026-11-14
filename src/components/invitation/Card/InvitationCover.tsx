import React from 'react';
import type { GuestInfo, InvitationConfig } from '@/types/invitation';
import styles from './Card.module.css';

interface InvitationCoverProps {
  guestInfo: GuestInfo;
  config: InvitationConfig;
}

export const InvitationCover = React.forwardRef<HTMLDivElement, InvitationCoverProps>(
  ({ guestInfo, config }, ref) => {
    return (
      <div ref={ref} className={styles.cardCoverHinged} data-card-cover>
        {/* Exterior cover facing recipient */}
        <div className={styles.coverFront}>
          <div className="w-full flex justify-between items-center text-[10px] tracking-widest uppercase text-neutral-400">
            <span>26.01.2027</span>
            <span>Invitation</span>
          </div>

          <div className="my-auto space-y-3">
            <p className="font-serif italic text-sm text-neutral-500">
              Personal Invitation for
            </p>
            <h2 className="font-serif text-2xl tracking-wide text-neutral-800">
              {guestInfo.displayName}
            </h2>
            <div className="w-8 h-[1px] bg-amber-700/30 mx-auto" />
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              {config.coupleName.person1} &amp; {config.coupleName.person2}
            </p>
          </div>

          <div className="text-[10px] tracking-widest uppercase text-neutral-400">
            Scroll to open
          </div>
        </div>

        {/* Back face of cover (visible inside on the left once opened) */}
        <div className={styles.coverBack}>
          <div className="space-y-2">
            <p className="font-serif italic text-xs text-neutral-400">
              Together with our families
            </p>
            <h3 className="font-serif text-lg tracking-wide text-neutral-700">
              {config.coupleName.person1}
            </h3>
            <span className="text-xs text-neutral-400">&amp;</span>
            <h3 className="font-serif text-lg tracking-wide text-neutral-700">
              {config.coupleName.person2}
            </h3>
            <p className="text-[11px] text-neutral-500 max-w-[160px] mx-auto mt-2">
              Request the honour of your presence to celebrate their union
            </p>
          </div>
        </div>
      </div>
    );
  }
);

InvitationCover.displayName = 'InvitationCover';

