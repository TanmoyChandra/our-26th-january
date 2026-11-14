import React from 'react';
import styles from './Envelope.module.css';

interface EnvelopeBackProps {
  children?: React.ReactNode;
}

export function EnvelopeBack({ children }: EnvelopeBackProps) {
  return (
    <div className={styles.backPanel}>
      <div className={styles.innerLining} />
      {children}
    </div>
  );
}

