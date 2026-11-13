'use client';

import { m } from 'framer-motion';
import { useMotionContext } from '@/components/providers/MotionProvider';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { getPreset } from '@/lib/animation';
import type { AnimationPresetKey } from '@/types/animation';

interface AnimateInProps {
  children: React.ReactNode;
  preset?: AnimationPresetKey;
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
  threshold?: number;
}

export function AnimateIn({
  children,
  preset = 'fadeInUp',
  delay = 0,
  duration,
  className,
  triggerOnce = true,
  threshold = 0.1,
}: AnimateInProps) {
  const { reducedMotion } = useMotionContext();
  const { ref, hasTriggered } = useScrollProgress({ threshold, triggerOnce });
  const { variants, transition } = getPreset(preset);

  const resolvedTransition = reducedMotion
    ? { duration: 0.01 }
    : { ...transition, delay, ...(duration ? { duration } : {}) };

  return (
    <m.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={variants}
      initial="hidden"
      animate={hasTriggered ? 'visible' : 'hidden'}
      transition={resolvedTransition}
      className={className}
    >
      {children}
    </m.div>
  );
}
