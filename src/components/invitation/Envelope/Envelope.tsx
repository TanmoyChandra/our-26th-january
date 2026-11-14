import React from 'react';
import { EnvelopeBack } from './EnvelopeBack';
import { EnvelopeFlap } from './EnvelopeFlap';
import { EnvelopeFront } from './EnvelopeFront';
import styles from './Envelope.module.css';

interface EnvelopeProps {
  children?: React.ReactNode;
  recipientName?: string;
  category?: string;
  flapRef?: React.RefObject<HTMLDivElement | null>;
  frontRef?: React.RefObject<HTMLDivElement | null>;
}

export const Envelope = React.forwardRef<HTMLDivElement, EnvelopeProps>(
  ({ children, recipientName, category, flapRef, frontRef }, ref) => {
    return (
      <div ref={ref} className={styles.envelopeContainer} data-envelope-root>
        <div className={styles.envelope}>
          {/* Back panel + inner lining */}
          <EnvelopeBack />

          {/* Invitation Card is placed here between Back and Front layers */}
          {children}

          {/* Front folded pocket (left, right, bottom flaps) */}
          <EnvelopeFront
            ref={frontRef}
            recipientName={recipientName}
            category={category}
          />

          {/* Top hinged opening flap */}
          <EnvelopeFlap ref={flapRef} />
        </div>
      </div>
    );
  }
);

Envelope.displayName = 'Envelope';

