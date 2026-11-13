'use client';

import { useEffect, useRef, useState } from 'react';

export interface ScrollProgressOptions {
  threshold?: number;      // 0–1, fraction of element in viewport to trigger
  triggerOnce?: boolean;   // stop observing after first trigger
  rootMargin?: string;     // IntersectionObserver rootMargin
}

export interface ScrollProgress {
  ref: React.RefObject<HTMLElement | null>;
  isInView: boolean;
  hasTriggered: boolean;
}

/**
 * Tracks whether a DOM element is in the viewport.
 * Returns a ref to attach to the element, an isInView boolean,
 * and a hasTriggered boolean (true once it has entered view).
 *
 * Uses IntersectionObserver — no scroll event listeners.
 * Cleans up the observer on unmount.
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): ScrollProgress {
  const { threshold = 0.1, triggerOnce = false, rootMargin = '0px' } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        if (inView && !hasTriggered) {
          setHasTriggered(true);
          if (triggerOnce) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isInView, hasTriggered };
}
