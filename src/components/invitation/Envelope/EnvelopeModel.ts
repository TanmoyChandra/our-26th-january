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
  topFlapBackMesh: THREE.Mesh;
  topFlapEdgeMesh: THREE.Mesh;
  nameMesh: THREE.Mesh;
  rimMesh: THREE.Mesh;
}

/**
 * Creates a plane geometry with subtle rounded corners and 1:1 normalized UV coordinates.
 */
function createRoundedPlaneGeometry(w: number, h: number, r: number, segments: number = 8): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = w / 2;
  const halfH = h / 2;

  shape.moveTo(-halfW + r, -halfH);
  shape.lineTo(halfW - r, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
  shape.lineTo(halfW, halfH - r);
  shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
  shape.lineTo(-halfW + r, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
  shape.lineTo(-halfW, -halfH + r);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);

  const geo = new THREE.ShapeGeometry(shape, segments);

  // Normalize UV coordinates to [0, 1] for 1:1 texture mapping
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) + halfW) / w;
    uvs[i * 2 + 1] = (pos.getY(i) + halfH) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();

  return geo;
}

/**
 * Creates a 3D rim wall connecting the front and back faces along the left, bottom,
 * and right sides, including all rounded corners, giving the envelope realistic physical thickness.
 */
function createEnvelopeRimGeometry(w: number, h: number, depth: number, r: number, segments: number = 8): THREE.BufferGeometry {
  const halfW = w / 2;
  const halfH = h / 2;
  const halfD = depth / 2;

  const path: THREE.Vector2[] = [];

  // 1. Top-left arc: from (-halfW + r, halfH) around to (-halfW, halfH - r)
  for (let i = 0; i <= segments; i++) {
    const theta = (Math.PI / 2) + (Math.PI / 2) * (i / segments);
    path.push(new THREE.Vector2(-halfW + r + r * Math.cos(theta), halfH - r + r * Math.sin(theta)));
  }

  // 2. Left edge down
  path.push(new THREE.Vector2(-halfW, -halfH + r));

  // 3. Bottom-left arc
  for (let i = 1; i <= segments; i++) {
    const theta = Math.PI + (Math.PI / 2) * (i / segments);
    path.push(new THREE.Vector2(-halfW + r + r * Math.cos(theta), -halfH + r + r * Math.sin(theta)));
  }

  // 4. Bottom edge across
  path.push(new THREE.Vector2(halfW - r, -halfH));

  // 5. Bottom-right arc
  for (let i = 1; i <= segments; i++) {
    const theta = (3 * Math.PI) / 2 + (Math.PI / 2) * (i / segments);
    path.push(new THREE.Vector2(halfW - r + r * Math.cos(theta), -halfH + r + r * Math.sin(theta)));
  }

  // 6. Right edge up
  path.push(new THREE.Vector2(halfW, halfH - r));

  // 7. Top-right arc: around to (halfW - r, halfH)
  for (let i = 1; i <= segments; i++) {
    const theta = (Math.PI / 2) * (i / segments);
    path.push(new THREE.Vector2(halfW - r + r * Math.cos(theta), halfH - r + r * Math.sin(theta)));
  }

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    vertices.push(p.x, p.y, -halfD);
    uvs.push(i / (path.length - 1), 0);
    vertices.push(p.x, p.y, +halfD);
    uvs.push(i / (path.length - 1), 1);
  }

  for (let i = 0; i < path.length - 1; i++) {
    const i0 = i * 2;
    const i1 = i0 + 1;
    const i2 = (i + 1) * 2;
    const i3 = i2 + 1;

    indices.push(i0, i1, i2);
    indices.push(i1, i3, i2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

/**
 * Creates a 3D rim edge along the V-shape contour of the opening flap,
 * giving the flap genuine physical cardstock thickness.
 */
function createFlapEdgeGeometry(w: number, tipY: number, thickness: number): THREE.BufferGeometry {
  const halfW = w / 2;
  const halfT = thickness / 2;

  // Path along the V-edge: (-halfW, 0) -> (0, tipY) -> (halfW, 0)
  const path = [
    new THREE.Vector2(-halfW, 0),
    new THREE.Vector2(0, tipY),
    new THREE.Vector2(halfW, 0),
  ];

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    vertices.push(p.x, p.y, -halfT);
    uvs.push(i / (path.length - 1), 0);
    vertices.push(p.x, p.y, +halfT);
    uvs.push(i / (path.length - 1), 1);
  }

  for (let i = 0; i < path.length - 1; i++) {
    const i0 = i * 2;
    const i1 = i0 + 1;
    const i2 = (i + 1) * 2;
    const i3 = i2 + 1;

    indices.push(i0, i2, i1);
    indices.push(i1, i2, i3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

/**
 * Accurately models the physical envelope matching both uploaded artworks:
 * - Subtle rounded corners on all edges.
 * - Solid physical thickness along all sides (rim wall).
 * - Layering:
 *   1. Front Plain Face: z = -depth/2
 *   2. Interior Back Lining: z = -0.02
 *   3. Inner Invitation Card: z = 0.00 inside pocket, emerges to sit in front of the flap
 *   4. Top Flap Hinge: pivots up and back to -Z so the card is clearly IN FRONT of the flap
 *   5. Back Pocket: z = +depth/2
 */
export function createEnvelopeModel(materials: EnvelopeMaterialsMap): EnvelopeModelParts {
  const root = new THREE.Group();
  root.name = 'EnvelopeRoot';

  const { width, height, depth } = ENVELOPE_CONFIG.dimensions;
  const halfH = height / 2;
  const zFront = -depth / 2;
  const zBack = depth / 2;
  const cornerRadius = 0.055; // Subtle, elegant stationery rounded corners

  // 1. FRONT SIDE: Plain face with couple artwork (faces negative Z)
  const frontGeo = createRoundedPlaneGeometry(width, height, cornerRadius);
  const frontPlain = new THREE.Mesh(frontGeo, materials.paperFrontArt);
  frontPlain.name = 'EnvelopeFrontPlain';
  frontPlain.position.set(0, 0, zFront);
  frontPlain.rotation.y = Math.PI;
  frontPlain.renderOrder = 0;
  frontPlain.castShadow = true;
  frontPlain.receiveShadow = true;
  root.add(frontPlain);

  // 1b. Personalized Guest Name on the Front Face
  const nameGeo = createRoundedPlaneGeometry(width, height, cornerRadius);
  const nameMesh = new THREE.Mesh(nameGeo, materials.nameSurface);
  nameMesh.name = 'GuestNameSurface';
  nameMesh.position.set(0, 0, zFront - 0.002);
  nameMesh.rotation.y = Math.PI;
  nameMesh.renderOrder = 1;
  root.add(nameMesh);

  // 1c. PHYSICAL THICKNESS RIM: connects front and back around all rounded edges
  const rimGeo = createEnvelopeRimGeometry(width, height, depth, cornerRadius);
  const rimMesh = new THREE.Mesh(rimGeo, materials.paperExterior);
  rimMesh.name = 'EnvelopeRimThickness';
  rimMesh.renderOrder = 2;
  rimMesh.castShadow = true;
  rimMesh.receiveShadow = true;
  root.add(rimMesh);

  // 2. INNER POCKET LINING (Visible inside when top flap opens)
  const interiorGeo = createRoundedPlaneGeometry(width - 0.04, height - 0.04, cornerRadius * 0.8);
  const interiorBack = new THREE.Mesh(interiorGeo, materials.paperInterior);
  interiorBack.name = 'EnvelopeInteriorBack';
  interiorBack.position.set(0, 0, -0.02);
  interiorBack.renderOrder = 2;
  root.add(interiorBack);

  // 3. TOP FLAP WITH HINGE (at top fold line y = halfH)
  const topFlapHinge = new THREE.Group();
  topFlapHinge.name = 'TopFlapHinge';
  topFlapHinge.position.set(0, halfH, zBack + 0.003);
  root.add(topFlapHinge);

  const flapThickness = 0.008; // Physical luxury cardstock thickness
  const halfFlapT = flapThickness / 2;
  const flapTipY = -height * (420 / 643); // Matches the exact lotus triangle tip

  // 3a. Front Face of Flap (facing viewer when closed)
  const flapGeo = new THREE.PlaneGeometry(width, height);
  flapGeo.translate(0, -halfH, 0); // pivots around top edge

  const topFlapMesh = new THREE.Mesh(flapGeo, materials.flapArt);
  topFlapMesh.name = 'TopFlapMesh';
  topFlapMesh.position.set(0, 0, halfFlapT);
  topFlapMesh.renderOrder = 5; // Starts in front of pocket when closed
  topFlapMesh.castShadow = true;
  topFlapMesh.receiveShadow = true;
  topFlapHinge.add(topFlapMesh);

  // 3b. Back Face of Flap (separated by thickness, facing viewer when open)
  const flapBackGeo = new THREE.PlaneGeometry(width, height);
  flapBackGeo.translate(0, -halfH, 0);

  const topFlapBackMesh = new THREE.Mesh(flapBackGeo, materials.flapArt);
  topFlapBackMesh.name = 'TopFlapBackMesh';
  topFlapBackMesh.position.set(0, 0, -halfFlapT);
  topFlapBackMesh.renderOrder = 5;
  topFlapBackMesh.castShadow = true;
  topFlapBackMesh.receiveShadow = true;
  topFlapHinge.add(topFlapBackMesh);

  // 3c. 3D Edge Wall along the V-shape contour of the opening flap
  const flapEdgeGeo = createFlapEdgeGeometry(width, flapTipY, flapThickness);
  const topFlapEdgeMesh = new THREE.Mesh(flapEdgeGeo, materials.paperExterior);
  topFlapEdgeMesh.name = 'TopFlapEdgeMesh';
  topFlapEdgeMesh.renderOrder = 5;
  topFlapEdgeMesh.castShadow = true;
  topFlapEdgeMesh.receiveShadow = true;
  topFlapHinge.add(topFlapEdgeMesh);

  // 4. INNER INVITATION CARD: realistic thick stationery board with subtle rounded corners
  const cardGroup = new THREE.Group();
  cardGroup.name = 'InnerCardGroup';
  cardGroup.position.set(0, 0, 0.005);
  root.add(cardGroup);

  const cardW = width * 0.86;
  const cardH = height * 0.96;
  const cardRadius = 0.04;
  const cardShape = new THREE.Shape();
  const cHalfW = cardW / 2;
  const cHalfH = cardH / 2;
  cardShape.moveTo(-cHalfW + cardRadius, -cHalfH);
  cardShape.lineTo(cHalfW - cardRadius, -cHalfH);
  cardShape.quadraticCurveTo(cHalfW, -cHalfH, cHalfW, -cHalfH + cardRadius);
  cardShape.lineTo(cHalfW, cHalfH - cardRadius);
  cardShape.quadraticCurveTo(cHalfW, cHalfH, cHalfW - cardRadius, cHalfH);
  cardShape.lineTo(-cHalfW + cardRadius, cHalfH);
  cardShape.quadraticCurveTo(-cHalfW, cHalfH, -cHalfW, cHalfH - cardRadius);
  cardShape.lineTo(-cHalfW, -cHalfH + cardRadius);
  cardShape.quadraticCurveTo(-cHalfW, -cHalfH, -cHalfW + cardRadius, -cHalfH);

  const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.0015,
    bevelThickness: 0.0015,
  });
  cardGeo.center();

  const cardMesh = new THREE.Mesh(cardGeo, materials.cardPaper);
  cardMesh.name = 'InnerCardMesh';
  cardMesh.renderOrder = 3;
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  cardGroup.add(cardMesh);

  // 5. BACK POCKET: The lower/side flaps textured with the back image, subtle rounded corners
  const pocketGeo = createRoundedPlaneGeometry(width, height, cornerRadius);
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
    topFlapBackMesh,
    topFlapEdgeMesh,
    nameMesh,
    rimMesh,
  };
}
