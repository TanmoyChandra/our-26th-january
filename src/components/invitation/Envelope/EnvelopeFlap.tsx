import React from 'react';
import styles from './Envelope.module.css';

interface EnvelopeFlapProps {
  initials?: string;
}

export const EnvelopeFlap = React.forwardRef<HTMLDivElement, EnvelopeFlapProps>(
  ({ initials = '26' }, ref) => {
    return (
      <div ref={ref} className={styles.topFlap} data-envelope-flap>
        {/* Exterior front face of flap */}
        <div className={styles.topFlapFront}>
          <div className={styles.sealMark}>
            <span>{initials}</span>
          </div>
        </div>
        {/* Interior back face of flap revealed as it hinges upwards */}
        <div className={styles.topFlapBack} />
      </div>
    );
  }
);

EnvelopeFlap.displayName = 'EnvelopeFlap';

