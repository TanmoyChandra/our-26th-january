'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';

/**
 * A hook that creates and manages a GSAP timeline scoped to a container element.
 * The timeline is killed on component unmount (proper cleanup).
 *
 * Usage:
 *   const { containerRef, timelineRef } = useGsapTimeline((tl, container) => {
 *     tl.from(container.querySelectorAll('.item'), { opacity: 0, y: 20, stagger: 0.1 });
 *   });
 *
 * GSAP is loaded lazily (dynamic import) so it does not add to the initial bundle.
 */
export function useGsapTimeline<T extends HTMLElement>(
  build: (tl: gsap.core.Timeline, container: T) => void,
  deps: React.DependencyList = []
): { containerRef: RefObject<T | null> } {
  const containerRef = useRef<T | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let cancelled = false;

    import('gsap').then(({ gsap: g }) => {
      if (cancelled) return;
      const tl = g.timeline();
      timelineRef.current = tl;
      build(tl, container);
    });

    return () => {
      cancelled = true;
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef };
}
