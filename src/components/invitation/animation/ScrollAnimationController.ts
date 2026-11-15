import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HYBRID_ANIMATION_CONFIG } from './AnimationConfig';
import type { Envelope3DRef } from '../Envelope3D';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollControllerElements {
  pinContainer: HTMLElement;
  envelope3DRef: Envelope3DRef | null;
  cardContainer: HTMLElement;
  envelopeWrapper: HTMLElement;
}

export interface ScrollControllerOptions {
  isReducedMotion?: boolean;
}

/**
 * Orchestrates the hybrid scroll experience:
 * Maps viewport scroll progress smoothly to:
 * 1. 3D Envelope state (rotation, flap opening) via Envelope3D.setProgress()
 * 2. HTML Invitation Card emergence, scale, and reveal via direct CSS transforms
 */
export function createScrollAnimationController(
  elements: ScrollControllerElements,
  options?: ScrollControllerOptions
): gsap.core.Timeline {
  const { pinContainer, envelope3DRef, cardContainer, envelopeWrapper } = elements;
  const isReduced = options?.isReducedMotion ?? false;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinContainer,
      start: 'top top',
      end: `+=${isReduced ? 600 : HYBRID_ANIMATION_CONFIG.totalScrollDistance}`,
      pin: true,
      scrub: 1, // Smooth responsive scrub
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: {
      ease: 'power2.inOut',
    },
  });

  if (isReduced) {
    // Non-disorienting fallback for reduced-motion users
    envelope3DRef?.setProgress?.(1);
    tl.to(envelopeWrapper, { opacity: 0.1, duration: 0.2 })
      .to(cardContainer, { y: 0, opacity: 1, duration: 0.3 });
    return tl;
  }

  // 1. Progress driver proxy object for the 3D Envelope
  const proxy = { progress: 0 };

  tl.to(proxy, {
    progress: 1,
    duration: 4,
    ease: 'none',
    onUpdate: () => {
      envelope3DRef?.setProgress?.(proxy.progress);
    },
  }, 0);

  // 2. HTML Card emergence:
  // Starts tucked at bottom, slides upwards out from envelope position as flap reaches full open
  tl.fromTo(
    cardContainer,
    {
      y: '75vh',
      scale: 0.72,
      opacity: 0,
      pointerEvents: 'none',
    },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      pointerEvents: 'auto',
      duration: 2.2,
      ease: 'power2.out',
    },
    1.8 // Begins at timeline second 1.8 (around progress 0.45)
  );

  // 3. Envelope wrapper sinking/fading as card takes focus
  tl.to(
    envelopeWrapper,
    {
      opacity: 0.25,
      scale: 0.88,
      y: 80,
      duration: 1.6,
      ease: 'power2.inOut',
    },
    2.2
  );

  return tl;
}

