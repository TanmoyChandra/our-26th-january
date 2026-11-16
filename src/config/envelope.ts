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
    frontTexturePath: string;
    backTexturePath: string;
    flapTexturePath: string;
    pocketTexturePath: string;
    cardTexturePath: string;
    cardPage2TexturePath: string;
    cardBackTexturePath: string;
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
    width: 4.8,
    height: 3.014, // Exactly 1024:643 aspect ratio
    depth: 0.07,   // Physical thickness for luxury envelope
    flapOverlap: 0.12,
  },
  camera: {
    fov: 44,
    near: 0.1,
    far: 100,
    initialPosition: [0, 0, 7.2],
  },
  lighting: {
    ambientColor: '#ffffff',
    ambientIntensity: 0.95,
    directionalColor: '#fff8ea',
    directionalIntensity: 1.4,
    directionalPosition: [3.5, 6, 6],
    fillColor: '#f1f5f9',
    fillIntensity: 0.45,
    fillPosition: [-4, -3, 3],
  },
  materials: {
    paperColor: '#ebd7b2',
    roughness: 0.82,
    metalness: 0.04,
    innerColor: '#e1d2b0', // Warm cream interior lining
    shadowEdgeColor: '#d3bb90',
    frontTexturePath: '/textures/envelope/envelope_front.png',
    backTexturePath: '/textures/envelope/envelope_back.png',
    flapTexturePath: '/textures/envelope/flap.png',
    pocketTexturePath: '/textures/envelope/pocket.png',
    cardTexturePath: '/textures/envelope/card_engagement.png',
    cardPage2TexturePath: '/textures/envelope/card_page_2.jpg',
    cardBackTexturePath: '/textures/envelope/card_back.png',
  },
  guestName: {
    canvasWidth: 2048,
    canvasHeight: 1286,
    fontFamily: '"Great Vibes", "Alex Brush", "Snell Roundhand", "Apple Chancery", cursive',
    fontSize: 98,
    fontWeight: '400',
    textColor: '#8a2b34',
    subtextColor: 'rgba(110, 40, 30, 0.75)',
    subfontSize: 24,
    letterSpacing: '0.02em',
    position: [0, 0, -0.021],
    size: [4.8, 3.014],
  },
  animation: {
    maxFlapAngle: Math.PI * 0.98,
    maxEnvelopeTiltY: 0.18,
    maxEnvelopeTiltX: -0.12,
    emergenceDistance: 3.6,
  },
};
