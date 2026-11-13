import type { AnimationPresetKey, AnimationPreset, StaggerConfig } from '@/types/animation';
import { ANIMATION_PRESETS, ANIMATION_CONFIG } from '@/config/animation';

/**
 * Get a named animation preset.
 */
export function getPreset(key: AnimationPresetKey): AnimationPreset {
  return ANIMATION_PRESETS[key];
}

/**
 * Build a stagger container variant.
 */
export function makeStaggerContainer(config?: Partial<StaggerConfig>) {
  const stagger = config?.staggerChildren ?? ANIMATION_CONFIG.stagger.normal;
  const delay = config?.delayChildren ?? 0;
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

/**
 * When reduced motion is active, collapse all durations.
 * Returns a transition object to spread into motion components.
 */
export function getReducedMotionTransition() {
  return { duration: ANIMATION_CONFIG.reducedMotion.duration };
}
