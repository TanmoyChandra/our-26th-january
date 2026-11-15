export interface HybridScrollAnimationConfig {
  /** Total scroll distance in pixels to complete the opening experience */
  totalScrollDistance: number;
  /** Phase ranges in normalized progress [0..1] */
  phases: {
    envelopeInspect: [number, number];   // 0.00 - 0.20: Closed envelope 3D tilt & inspection
    flapOpening: [number, number];       // 0.20 - 0.50: 3D flap rotates open
    cardEmergence: [number, number];     // 0.50 - 0.80: HTML Card slides out of envelope
    envelopeFadeSettle: [number, number];// 0.75 - 1.00: 3D envelope sinks & HTML card takes full focus
  };
}

export const HYBRID_ANIMATION_CONFIG: HybridScrollAnimationConfig = {
  totalScrollDistance: 2800,
  phases: {
    envelopeInspect: [0, 0.2],
    flapOpening: [0.2, 0.5],
    cardEmergence: [0.5, 0.8],
    envelopeFadeSettle: [0.75, 1.0],
  },
};

