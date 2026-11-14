import React from 'react';
import styles from './Envelope.module.css';

interface EnvelopeFrontProps {
  recipientName?: string;
  category?: string;
}

export const EnvelopeFront = React.forwardRef<HTMLDivElement, EnvelopeFrontProps>(
  ({ recipientName, category }, ref) => {
    return (
      <div ref={ref} className={styles.frontPocket} data-envelope-front>
        <div className={styles.leftFlap} />
        <div className={styles.rightFlap} />
        <div className={styles.bottomFlap} />

        {recipientName && (
          <div className={styles.envelopeRecipient}>
            <p className="font-serif text-sm tracking-wider uppercase text-neutral-600">
              {recipientName}
            </p>
            {category && (
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mt-0.5">
                {category}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

EnvelopeFront.displayName = 'EnvelopeFront';

