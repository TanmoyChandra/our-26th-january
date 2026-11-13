'use client';

import React from 'react';
import { m } from 'framer-motion';
import { useMotionContext } from '@/components/providers/MotionProvider';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { makeStaggerContainer } from '@/lib/animation';
import type { StaggerConfig } from '@/types/animation';

interface StaggerGroupProps {
  children: React.ReactNode;
  stagger?: Partial<StaggerConfig>;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  as?: keyof typeof m;
}

export function StaggerGroup({
  children,
  stagger,
  className,
  threshold = 0.1,
  triggerOnce = true,
  as = 'div',
}: StaggerGroupProps) {
  const { reducedMotion } = useMotionContext();
  const { ref, hasTriggered } = useScrollProgress({ threshold, triggerOnce });
  const variants = makeStaggerContainer(reducedMotion ? { staggerChildren: 0 } : stagger);

  // Use m.div as the default motion element regardless of `as` for type safety.
  // In Phase 2 this can be extended to support arbitrary HTML tags.
  const MotionEl = (m[as] ?? m.div) as typeof m.div;

  return (
    <MotionEl
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={variants}
      initial="hidden"
      animate={hasTriggered ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </MotionEl>
  );
}
