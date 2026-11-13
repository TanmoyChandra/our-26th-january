'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useMotionContext } from '@/components/providers/MotionProvider';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const { reducedMotion } = useMotionContext();

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

  return (
    <AnimatePresence mode="wait">
      <m.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        className={className}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
