import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import { EnvelopeModelParts } from './EnvelopeModel';

/**
 * Controller managing the physical 3D state of the envelope based on normalized progress (0 to 1).
 */
export class EnvelopeAnimationController {
  private parts: EnvelopeModelParts;

  constructor(parts: EnvelopeModelParts) {
    this.parts = parts;
  }

  /**
   * Applies animation state based on progress [0..1].
   * 0.0 - 0.20: Closed state + subtle 3D hover/tilt
   * 0.20 - 0.55: Flap opens smoothly around hinge
   * 0.55 - 0.85: Envelope sinks/translates down as card emerges in HTML
   * 0.85 - 1.00: Envelope fades/rests out of active view
   */
  public setProgress(progress: number): void {
    const p = Math.max(0, Math.min(1, progress));
    const { maxFlapAngle, maxEnvelopeTiltY, maxEnvelopeTiltX } = ENVELOPE_CONFIG.animation;

    // 1. Envelope root 3D rotation / orientation
    // Tilts slightly to showcase depth and lighting
    if (p < 0.3) {
      const tiltProg = p / 0.3;
      this.parts.root.rotation.y = THREE.MathUtils.lerp(0, maxEnvelopeTiltY, tiltProg);
      this.parts.root.rotation.x = THREE.MathUtils.lerp(0, maxEnvelopeTiltX, tiltProg);
    } else {
      const settleProg = (p - 0.3) / 0.7;
      this.parts.root.rotation.y = THREE.MathUtils.lerp(maxEnvelopeTiltY, 0, settleProg);
      this.parts.root.rotation.x = THREE.MathUtils.lerp(maxEnvelopeTiltX, 0.05, settleProg);
    }

    // 2. Flap opening rotation around the top hinge
    // Opens between progress 0.15 and 0.50
    let flapAngle = 0;
    if (p >= 0.15 && p <= 0.55) {
      const flapProg = (p - 0.15) / 0.40;
      // Smooth cubic ease for natural paper flex
      const easedFlap = flapProg * flapProg * (3 - 2 * flapProg);
      flapAngle = THREE.MathUtils.lerp(0, maxFlapAngle, easedFlap);
    } else if (p > 0.55) {
      flapAngle = maxFlapAngle;
    }
    this.parts.topFlapHinge.rotation.x = flapAngle;

    // 3. Envelope body movement when card emerges
    // Between 0.50 and 0.90, envelope sinks down and scales subtly
    if (p >= 0.50) {
      const sinkProg = (p - 0.50) / 0.40;
      const easedSink = Math.min(1, sinkProg);
      this.parts.root.position.y = THREE.MathUtils.lerp(0, -2.2, easedSink);
      this.parts.root.scale.setScalar(THREE.MathUtils.lerp(1, 0.85, easedSink));
    } else {
      this.parts.root.position.y = 0;
      this.parts.root.scale.setScalar(1);
    }
  }

  public getRoot(): THREE.Group {
    return this.parts.root;
  }
}

