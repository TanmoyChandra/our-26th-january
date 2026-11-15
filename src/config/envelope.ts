export interface EnvelopeConfig {
  dimensions: {
    width: number;
    height: number;
    depth: number;
    flapOverlap: number;
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    initialPosition: [number, number, number];
  };
  lighting: {
    ambientColor: string;
    ambientIntensity: number;
    directionalColor: string;
    directionalIntensity: number;
    directionalPosition: [number, number, number];
    fillColor: string;
    fillIntensity: number;
    fillPosition: [number, number, number];
  };
  materials: {
    paperColor: string;
    roughness: number;
    metalness: number;
    innerColor: string;
    shadowEdgeColor: string;
  };
  guestName: {
    canvasWidth: number;
    canvasHeight: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    textColor: string;
    subtextColor: string;
    subfontSize: number;
    letterSpacing: string;
    position: [number, number, number];
    size: [number, number];
  };
  animation: {
    maxFlapAngle: number;
    maxEnvelopeTiltY: number;
    maxEnvelopeTiltX: number;
    emergenceDistance: number;
  };
}

export const ENVELOPE_CONFIG: EnvelopeConfig = {
  dimensions: {
    width: 5.0,
    height: 3.3,
    depth: 0.04,
    flapOverlap: 0.12,
  },
  camera: {
    fov: 42,
    near: 0.1,
    far: 100,
    initialPosition: [0, 0, 7.5],
  },
  lighting: {
    ambientColor: '#ffffff',
    ambientIntensity: 0.85,
    directionalColor: '#fff8ea',
    directionalIntensity: 1.5,
    directionalPosition: [3.5, 6, 6],
    fillColor: '#f1f5f9',
    fillIntensity: 0.45,
    fillPosition: [-4, -3, 3],
  },
  materials: {
    paperColor: '#c8b493', // Warm kraft/natural paper tone exactly like the photo
    roughness: 0.88,
    metalness: 0.03,
    innerColor: '#ba9f79',
    shadowEdgeColor: '#a78b64',
  },
  guestName: {
    canvasWidth: 1024,
    canvasHeight: 512,
    fontFamily: '"Cinzel", "Playfair Display", "Noto Serif", "Georgia", serif',
    fontSize: 52,
    fontWeight: '400',
    textColor: '#2e251a',
    subtextColor: '#70604b',
    subfontSize: 22,
    letterSpacing: '0.12em',
    position: [0, 0, -0.021], // Plain front face center
    size: [3.8, 1.9],
  },
  animation: {
    maxFlapAngle: Math.PI * 0.98,
    maxEnvelopeTiltY: 0.18,
    maxEnvelopeTiltX: -0.12,
    emergenceDistance: 3.6,
  },
};
