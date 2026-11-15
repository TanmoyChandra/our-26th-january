import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import { EnvelopeMaterialsMap } from './EnvelopeMaterials';

export interface EnvelopeModelParts {
  root: THREE.Group;
  frontPlain: THREE.Mesh;
  interiorBack: THREE.Mesh;
  cardGroup: THREE.Group;
  cardMesh: THREE.Mesh;
  backPocketMesh: THREE.Mesh;
  topFlapHinge: THREE.Group;
  topFlapMesh: THREE.Mesh;
  nameMesh: THREE.Mesh;
}

/**
 * Accurately models the physical envelope matching both uploaded artworks:
 * - Front side: couple artwork with flowers and personalized guest calligraphy.
 * - Back side: embossed gold corners, floral lotus emblem, and realistic openable flap.
 * - Layering:
 *   1. Front Plain Face: z = -depth/2 (-0.02)
 *   2. Interior Back Lining: z = -0.005
 *   3. Inner Invitation Card: z = 0.01 (emerges to sit in front of the opened top flap)
 *   4. Top Flap Hinge: pivots up and back to -Z so the card is clearly IN FRONT of the flap
 *   5. Back Pocket: z = +depth/2 (+0.02)
 */
/**
 * Helper to construct a crisp rounded rectangle shape for die-cut luxury cards.
 */
function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

export function createEnvelopeModel(materials: EnvelopeMaterialsMap): EnvelopeModelParts {
  const root = new THREE.Group();
  root.name = 'EnvelopeRoot';

  const { width, height, depth } = ENVELOPE_CONFIG.dimensions;
  const halfH = height / 2;
  const zFront = -depth / 2;
  const zBack = depth / 2;

  // 1. FRONT SIDE: Plain face with couple artwork (faces negative Z)
  const frontGeo = new THREE.PlaneGeometry(width, height);
  const frontPlain = new THREE.Mesh(frontGeo, materials.paperFrontArt);
  frontPlain.name = 'EnvelopeFrontPlain';
  frontPlain.position.set(0, 0, zFront);
  frontPlain.rotation.y = Math.PI;
  frontPlain.renderOrder = 0;
  frontPlain.castShadow = true;
  frontPlain.receiveShadow = true;
  root.add(frontPlain);

  // 1b. Personalized Guest Name on the Front Face
  const nameGeo = new THREE.PlaneGeometry(width, height);
  const nameMesh = new THREE.Mesh(nameGeo, materials.nameSurface);
  nameMesh.name = 'GuestNameSurface';
  nameMesh.position.set(0, 0, zFront - 0.002);
  nameMesh.rotation.y = Math.PI;
  nameMesh.renderOrder = 1;
  root.add(nameMesh);

  // 2. INNER POCKET LINING (Visible inside when top flap opens)
  const interiorGeo = new THREE.PlaneGeometry(width - 0.04, height - 0.04);
  const interiorBack = new THREE.Mesh(interiorGeo, materials.paperInterior);
  interiorBack.name = 'EnvelopeInteriorBack';
  interiorBack.position.set(0, 0, -0.005);
  interiorBack.renderOrder = 2;
  root.add(interiorBack);

  // 3. TOP FLAP WITH HINGE (at top fold line y = halfH)
  // Initially at z = zBack + 0.003 (in front of back pocket when closed)
  const topFlapHinge = new THREE.Group();
  topFlapHinge.name = 'TopFlapHinge';
  topFlapHinge.position.set(0, halfH, zBack + 0.003);
  root.add(topFlapHinge);

  const flapGeo = new THREE.PlaneGeometry(width, height);
  flapGeo.translate(0, -halfH, 0); // pivots around top edge

  const topFlapMesh = new THREE.Mesh(flapGeo, materials.flapArt);
  topFlapMesh.name = 'TopFlapMesh';
  topFlapMesh.renderOrder = 5; // Starts in front of pocket when closed
  topFlapMesh.castShadow = true;
  topFlapMesh.receiveShadow = true;
  topFlapHinge.add(topFlapMesh);

  // 4. INNER INVITATION CARD (3D thick cardstock with subtle rounded corners)
  const cardGroup = new THREE.Group();
  cardGroup.name = 'InnerCardGroup';
  cardGroup.position.set(0, 0, 0.007);
  root.add(cardGroup);

  const cardW = width * 0.86;
  const cardH = height * 0.96;
  const cornerRadius = 0.07; // subtle elegant rounded corners
  const cardShape = createRoundedRectShape(cardW, cardH, cornerRadius);

  const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    curveSegments: 16,
  });
  cardGeo.center(); // center geometry around (0, 0, 0)

  const cardMesh = new THREE.Mesh(cardGeo, materials.cardPaper);
  cardMesh.name = 'InnerCardMesh';
  cardMesh.renderOrder = 3;
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  cardGroup.add(cardMesh);

  // 5. BACK POCKET: The lower/side flaps textured with the back image
  const pocketGeo = new THREE.PlaneGeometry(width, height);
  const backPocketMesh = new THREE.Mesh(pocketGeo, materials.pocketArt);
  backPocketMesh.name = 'BackPocketMesh';
  backPocketMesh.position.set(0, 0, zBack);
  backPocketMesh.renderOrder = 4;
  backPocketMesh.castShadow = true;
  backPocketMesh.receiveShadow = true;
  root.add(backPocketMesh);

  // Start with back side showing
  root.rotation.y = 0;

  return {
    root,
    frontPlain,
    interiorBack,
    cardGroup,
    cardMesh,
    backPocketMesh,
    topFlapHinge,
    topFlapMesh,
    nameMesh,
  };
}
