import type { AnimationConfig, AnimationPreset, AnimationPresetKey } from '@/types/animation';

export const ANIMATION_CONFIG: AnimationConfig = {
  defaultDuration: 0.6,
  defaultEase: [0.25, 0.46, 0.45, 0.94],
  stagger: { fast: 0.05, normal: 0.1, slow: 0.2 },
  reducedMotion: { duration: 0.01, enabled: false },
};

export const ANIMATION_PRESETS: Record<AnimationPresetKey, AnimationPreset> = {
  fadeIn: {
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fadeInUp: {
    variants: {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
    },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fadeInDown: {
    variants: {
      hidden: { opacity: 0, y: -24 },
      visible: { opacity: 1, y: 0 },
    },
  },
  fadeInLeft: {
    variants: {
      hidden: { opacity: 0, x: -24 },
      visible: { opacity: 1, x: 0 },
    },
  },
  fadeInRight: {
    variants: {
      hidden: { opacity: 0, x: 24 },
      visible: { opacity: 1, x: 0 },
    },
  },
  scaleIn: {
    variants: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  slideIn: {
    variants: {
      hidden: { opacity: 0, x: '-100%' },
      visible: { opacity: 1, x: 0 },
    },
  },
  staggerContainer: {
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    },
  },
  reveal: {
    variants: {
      hidden: { clipPath: 'inset(0 100% 0 0)' },
      visible: { clipPath: 'inset(0 0% 0 0)' },
    },
  },
};
