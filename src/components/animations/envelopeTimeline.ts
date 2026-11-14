import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ENVELOPE_ANIMATION_CONFIG } from './animationConfig';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface EnvelopeTimelineElements {
  pinContainer: HTMLElement;
  envelopeRoot: HTMLElement;
  flap: HTMLElement;
  frontPocket: HTMLElement;
  card: HTMLElement;
  cover: HTMLElement;
  content: HTMLElement;
  websiteContent?: HTMLElement | null;
}

/**
 * Builds the master GSAP scroll-driven timeline.
 * Synchronised with ScrollTrigger's scrub for reversible opening on scroll up/down.
 */
export function buildEnvelopeTimeline(
  elements: EnvelopeTimelineElements,
  options?: { isReducedMotion?: boolean }
): gsap.core.Timeline {
  const {
    pinContainer,
    envelopeRoot,
    flap,
    frontPocket,
    card,
    cover,
    content,
    websiteContent,
  } = elements;

  const isReduced = options?.isReducedMotion ?? false;

  // Master timeline pinned to the viewport
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinContainer,
      start: 'top top',
      end: `+=${isReduced ? 600 : ENVELOPE_ANIMATION_CONFIG.scrollDistance}`,
      pin: true,
      scrub: 1, // Smooth scrub response
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: {
      ease: 'power2.inOut',
    },
  });

  if (isReduced) {
    // Graceful fallback: instantly unfold without heavy 3D motion
    tl.to(flap, { rotateX: -180, duration: 0.1, zIndex: 1 })
      .to(card, { y: '-100%', zIndex: 7, duration: 0.2 })
      .to(cover, { rotateY: -180, duration: 0.2 })
      .to(content, { opacity: 1, y: 0, duration: 0.1 });
    return tl;
  }

  /* -------------------------------------------------------------
   * Timeline Sequencing & Labels
   * ------------------------------------------------------------- */

  // Stage 01: Initial state is already rendered closed in CSS/DOM.
  tl.addLabel('stage-closed', 0);

  // Stage 02: Flap Opening (rotates 180deg backwards around its top fold line)
  tl.addLabel('stage-flap-opening', 0.1);
  tl.to(
    flap,
    {
      rotateX: -180,
      duration: 1.2,
      ease: 'power1.inOut',
      onUpdate: function () {
        // Once the flap passes 90 degrees, adjust z-index behind the card and back
        const progress = this.progress();
        if (progress > 0.5) {
          flap.style.zIndex = '1';
        } else {
          flap.style.zIndex = '6';
        }
      },
    },
    'stage-flap-opening'
  );

  // Stage 03: Invitation Card Emergence
  // Slides out vertically from the pocket behind the front pocket
  tl.addLabel('stage-card-emergence', 0.9);
  tl.to(
    card,
    {
      y: '-105%',
      scale: 1.05,
      duration: 1.8,
      ease: 'power1.out',
      onUpdate: function () {
        const p = this.progress();
        // Once emerged out of the pocket envelope, elevate z-index above front pocket
        if (p > 0.65) {
          card.style.zIndex = '7';
        } else {
          card.style.zIndex = '2';
        }
      },
    },
    'stage-card-emergence'
  );

  // Sinks/fades the stationary envelope slightly to focus attention on the emerging card
  tl.to(
    envelopeRoot,
    {
      scale: 0.92,
      y: 40,
      opacity: 0.45,
      duration: 1.8,
      ease: 'power1.out',
    },
    'stage-card-emergence'
  );

  // Stage 04: Invitation Cover Opening (Booklet unfolding right-to-left)
  tl.addLabel('stage-cover-opening', 2.3);
  tl.to(
    cover,
    {
      rotateY: -180,
      duration: 1.8,
      ease: 'power2.inOut',
    },
    'stage-cover-opening'
  );

  // Card center alignment during opening so the opened booklet stays centered in viewport
  tl.to(
    card,
    {
      x: '-25%', // Adjust for the open double-page spread
      duration: 1.8,
      ease: 'power2.inOut',
    },
    'stage-cover-opening'
  );

  // Stage 05: Inner Invitation Reveal (Coordinated typography reveal)
  tl.addLabel('stage-content-reveal', 3.4);
  tl.to(
    content,
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power2.out',
    },
    'stage-content-reveal'
  );

  // Stage 06: Smooth Transition into full website content
  tl.addLabel('stage-transition', 4.2);
  if (websiteContent) {
    tl.to(
      websiteContent,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power1.out',
      },
      'stage-transition'
    );
  }

  return tl;
}

