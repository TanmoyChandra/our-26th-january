export interface EnvelopeAnimationConfig {
  /** Total scroll distance in pixels to complete the opening experience */
  scrollDistance: number;
  /** Progress ranges for timeline stages */
  stages: {
    closed: [number, number];       // 0 - 0.12
    flapOpen: [number, number];     // 0.12 - 0.32
    cardEmerge: [number, number];   // 0.32 - 0.58
    cardOpen: [number, number];     // 0.58 - 0.78
    contentReveal: [number, number];// 0.78 - 0.92
    transitionOut: [number, number];// 0.92 - 1.00
  };
}

export const ENVELOPE_ANIMATION_CONFIG: EnvelopeAnimationConfig = {
  scrollDistance: 3000,
  stages: {
    closed: [0, 0.12],
    flapOpen: [0.12, 0.32],
    cardEmerge: [0.32, 0.58],
    cardOpen: [0.58, 0.78],
    contentReveal: [0.78, 0.92],
    transitionOut: [0.92, 1.0],
  },
};

