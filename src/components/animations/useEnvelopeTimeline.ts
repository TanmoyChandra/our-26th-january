'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  buildEnvelopeTimeline,
  type EnvelopeTimelineElements,
} from './envelopeTimeline';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseEnvelopeTimelineProps {
  pinRef: React.RefObject<HTMLDivElement | null>;
  envelopeRef: React.RefObject<HTMLDivElement | null>;
  flapRef: React.RefObject<HTMLDivElement | null>;
  frontRef: React.RefObject<HTMLDivElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  coverRef: React.RefObject<HTMLDivElement | null>;
  innerContentRef: React.RefObject<HTMLDivElement | null>;
  websiteContentRef?: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
}

export function useEnvelopeTimeline({
  pinRef,
  envelopeRef,
  flapRef,
  frontRef,
  cardRef,
  coverRef,
  innerContentRef,
  websiteContentRef,
  reducedMotion = false,
}: UseEnvelopeTimelineProps) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return;

    const pin = pinRef.current;
    const envelope = envelopeRef.current;
    const flap = flapRef.current;
    const front = frontRef.current;
    const card = cardRef.current;
    const cover = coverRef.current;
    const content = innerContentRef.current;

    if (!pin || !envelope || !flap || !front || !card || !cover || !content) {
      return;
    }

    // Wrap in gsap.context for React StrictMode cleanup safety
    const ctx = gsap.context(() => {
      const elements: EnvelopeTimelineElements = {
        pinContainer: pin,
        envelopeRoot: envelope,
        flap,
        frontPocket: front,
        card,
        cover,
        content,
        websiteContent: websiteContentRef?.current,
      };

      timelineRef.current = buildEnvelopeTimeline(elements, {
        isReducedMotion: reducedMotion,
      });
    }, pin);

    return () => {
      ctx.revert(); // Automatically kills timeline, ScrollTriggers & reverts inline styles
      timelineRef.current = null;
    };
  }, [
    pinRef,
    envelopeRef,
    flapRef,
    frontRef,
    cardRef,
    coverRef,
    innerContentRef,
    websiteContentRef,
    reducedMotion,
  ]);

  return { timelineRef };
}

