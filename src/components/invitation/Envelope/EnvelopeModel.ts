import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import { EnvelopeMaterialsMap } from './EnvelopeMaterials';

export interface EnvelopeModelParts {
  root: THREE.Group;
  body: THREE.Mesh;
  pocket: THREE.Mesh;
  flapHinge: THREE.Group;
  flapMesh: THREE.Mesh;
  sealMesh: THREE.Mesh;
  frontPlain: THREE.Mesh;
  backLeftFlap: THREE.Mesh;
  backRightFlap: THREE.Mesh;
  backBottomFlap: THREE.Mesh;
  topFlapHinge: THREE.Group;
  topFlapMesh: THREE.Mesh;
  nameMesh: THREE.Mesh;
}

/**
 * Procedurally constructs the multi-part 3D envelope hierarchy.
 * All parts are modular and replaceable with GLTF models if needed.
 * Accurately models the physical envelope based on the provided reference:
 * - Front side: completely plain, smooth surface (holding the optional guest name stamp).
 * - Back side: classic 4-triangular folded envelope flaps (Left, Right, Bottom, and Top opening flap overlapping).
 */
export function createEnvelopeModel(materials: EnvelopeMaterialsMap): EnvelopeModelParts {
  const root = new THREE.Group();
  root.name = 'EnvelopeRoot';

  const { width, height, depth, flapHeightRatio } = ENVELOPE_CONFIG.dimensions;
  const flapHeight = height * flapHeightRatio;

  // 1. Back panel (the rear backing of the envelope)
  const bodyGeo = new THREE.BoxGeometry(width, height, depth * 0.4);
  const body = new THREE.Mesh(bodyGeo, materials.paperExterior);
  body.name = 'EnvelopeBody';
  body.position.set(0, 0, -depth * 0.3);
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // 2. Front pocket (folded bottom and side flaps forming the pocket opening)
  // Modeled as a thin front panel with a shallow V-notch opening at the top
  const pocketShape = new THREE.Shape();
  const { width, height, depth } = ENVELOPE_CONFIG.dimensions;
  const halfW = width / 2;
  const halfH = height / 2;
  const notchDepth = height * 0.22;
  const zPlane = depth / 2;

  pocketShape.moveTo(-halfW, -halfH);
  pocketShape.lineTo(halfW, -halfH);
  pocketShape.lineTo(halfW, halfH * 0.6);
  pocketShape.lineTo(0, halfH * 0.6 - notchDepth);
  pocketShape.lineTo(-halfW, halfH * 0.6);
  pocketShape.closePath();
  // 1. FRONT SIDE: Plain flat rectangular paper face
  const frontGeo = new THREE.PlaneGeometry(width, height);
  const frontPlain = new THREE.Mesh(frontGeo, materials.paperExterior);
  frontPlain.name = 'EnvelopeFrontPlain';
  // Faces negative Z (or user rotates around to see plain side)
  frontPlain.position.set(0, 0, -zPlane);
  frontPlain.rotation.y = Math.PI; // Look from opposite direction
  frontPlain.castShadow = true;
  frontPlain.receiveShadow = true;
  root.add(frontPlain);

  const pocketGeo = new THREE.ShapeGeometry(pocketShape);
  const pocket = new THREE.Mesh(pocketGeo, materials.paperExterior);
  pocket.name = 'EnvelopeFrontPocket';
  pocket.position.set(0, 0, depth * 0.5);
  pocket.castShadow = true;
  pocket.receiveShadow = true;
  root.add(pocket);

  // 3. Guest name surface attached directly to the front pocket
  // 1b. Personalized Guest Name on the Plain Front Face
  const [nameW, nameH] = ENVELOPE_CONFIG.guestName.size;
  const nameGeo = new THREE.PlaneGeometry(nameW, nameH);
  const nameMesh = new THREE.Mesh(nameGeo, materials.nameSurface);
  nameMesh.name = 'GuestNameSurface';
  nameMesh.position.set(
    ENVELOPE_CONFIG.guestName.position[0],
    ENVELOPE_CONFIG.guestName.position[1],
    depth * 0.52
  );
  nameMesh.position.set(0, 0, -zPlane - 0.002);
  nameMesh.rotation.y = Math.PI;
  root.add(nameMesh);

  // 4. Opening flap with separate Hinge group
  // The hinge sits precisely along the top fold line (y = halfH)
  const flapHinge = new THREE.Group();
  flapHinge.name = 'FlapHinge';
  flapHinge.position.set(0, halfH, depth * 0.48);
  root.add(flapHinge);
  // 2. BACK SIDE: 4 Triangular Flaps meeting at center (as in image)
  // Center meeting point is slightly above dead center: (0, -0.05, zPlane)
  const centerFoldY = -0.05;

  // Triangular flap geometry pointing downwards when closed
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-halfW, 0);
  flapShape.lineTo(halfW, 0);
  flapShape.lineTo(0, -flapHeight);
  flapShape.closePath();
  // 2a. Left Flap (Triangle from (-halfW, halfH) to (-halfW, -halfH) to center fold point)
  const leftShape = new THREE.Shape();
  leftShape.moveTo(-halfW, halfH);
  leftShape.lineTo(-halfW, -halfH);
  leftShape.lineTo(0.08, centerFoldY);
  leftShape.closePath();

  const flapGeo = new THREE.ShapeGeometry(flapShape);
  // Double-sided flap using exterior on front and interior on back
  const flapMesh = new THREE.Mesh(flapGeo, materials.paperExterior);
  flapMesh.name = 'EnvelopeFlap';
  flapMesh.castShadow = true;
  flapHinge.add(flapMesh);
  const leftGeo = new THREE.ShapeGeometry(leftShape);
  const backLeftFlap = new THREE.Mesh(leftGeo, materials.paperExterior);
  backLeftFlap.name = 'BackLeftFlap';
  backLeftFlap.position.set(0, 0, zPlane);
  backLeftFlap.castShadow = true;
  backLeftFlap.receiveShadow = true;
  root.add(backLeftFlap);

  // 5. Wax Seal monogram located near the flap tip
  const sealGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32);
  sealGeo.rotateX(Math.PI / 2);
  const sealMesh = new THREE.Mesh(sealGeo, materials.seal);
  sealMesh.name = 'EnvelopeSeal';
  sealMesh.position.set(0, -flapHeight + 0.18, 0.02);
  flapHinge.add(sealMesh);
  // 2b. Right Flap (Triangle from (halfW, halfH) to (halfW, -halfH) to center fold point)
  const rightShape = new THREE.Shape();
  rightShape.moveTo(halfW, halfH);
  rightShape.lineTo(halfW, -halfH);
  rightShape.lineTo(-0.08, centerFoldY);
  rightShape.closePath();

  const rightGeo = new THREE.ShapeGeometry(rightShape);
  const backRightFlap = new THREE.Mesh(rightGeo, materials.paperExterior);
  backRightFlap.name = 'BackRightFlap';
  backRightFlap.position.set(0, 0, zPlane + 0.001); // Layered slightly over left
  backRightFlap.castShadow = true;
  backRightFlap.receiveShadow = true;
  root.add(backRightFlap);

  // 2c. Bottom Flap (Triangle from bottom edge (-halfW, -halfH) to (halfW, -halfH) pointing up to center)
  // Reaches slightly higher than center fold point
  const bottomShape = new THREE.Shape();
  bottomShape.moveTo(-halfW, -halfH);
  bottomShape.lineTo(halfW, -halfH);
  bottomShape.lineTo(0, centerFoldY + 0.32);
  bottomShape.closePath();

  const bottomGeo = new THREE.ShapeGeometry(bottomShape);
  const backBottomFlap = new THREE.Mesh(bottomGeo, materials.paperFlap);
  backBottomFlap.name = 'BackBottomFlap';
  backBottomFlap.position.set(0, 0, zPlane + 0.002); // Overlaps left and right flaps
  backBottomFlap.castShadow = true;
  backBottomFlap.receiveShadow = true;
  root.add(backBottomFlap);

  // 2d. Top Flap with Hinge (Triangle from top edge pointing down, overlapping the bottom flap)
  const topFlapHinge = new THREE.Group();
  topFlapHinge.name = 'TopFlapHinge';
  topFlapHinge.position.set(0, halfH, zPlane + 0.003); // Top fold line
  root.add(topFlapHinge);

  const topShape = new THREE.Shape();
  topShape.moveTo(-halfW, 0);
  topShape.lineTo(halfW, 0);
  // Extends downwards past center to overlap bottom flap tip
  const topTipY = -(halfH - centerFoldY + 0.22);
  topShape.lineTo(0, topTipY);
  topShape.closePath();

  const topGeo = new THREE.ShapeGeometry(topShape);
  const topFlapMesh = new THREE.Mesh(topGeo, materials.paperFlap);
  topFlapMesh.name = 'TopFlapMesh';
  topFlapMesh.castShadow = true;
  topFlapMesh.receiveShadow = true;
  topFlapHinge.add(topFlapMesh);

  // Initial presentation: Start showing the back fold side (as in photo)
  root.rotation.y = 0;

  return {
    root,
    body,
    pocket,
    flapHinge,
    flapMesh,
    sealMesh,
    frontPlain,
    backLeftFlap,
    backRightFlap,
    backBottomFlap,
    topFlapHinge,
    topFlapMesh,
    nameMesh,
  };
}

