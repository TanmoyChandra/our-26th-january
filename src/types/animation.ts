import type { Variants, Transition } from 'framer-motion';

export type AnimationPresetKey =
  | 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight'
  | 'scaleIn' | 'slideIn' | 'staggerContainer' | 'reveal';

export interface AnimationPreset {
  variants: Variants;
  transition?: Transition;
}

export interface StaggerConfig {
  staggerChildren: number;
  delayChildren?: number;
}

export interface ScrollAnimationConfig {
  threshold?: number;      // 0–1, fraction of element visible to trigger
  triggerOnce?: boolean;
  rootMargin?: string;
}

export interface AnimationConfig {
  defaultDuration: number;
  defaultEase: string | number[];
  stagger: { fast: number; normal: number; slow: number };
  reducedMotion: {
    duration: number;
    enabled: boolean;
  };
}
