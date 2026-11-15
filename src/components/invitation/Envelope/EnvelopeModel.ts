import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import { EnvelopeMaterialsMap } from './EnvelopeMaterials';

export interface EnvelopeModelParts {
  root: THREE.Group;
  frontPlain: THREE.Mesh;
  backLeftFlap: THREE.Mesh;
  backRightFlap: THREE.Mesh;
  backBottomFlap: THREE.Mesh;
  topFlapHinge: THREE.Group;
  topFlapMesh: THREE.Mesh;
  nameMesh: THREE.Mesh;
}

/**
 * Accurately models the physical envelope based on the provided artwork:
 * - Front side: features the wedding couple artwork texture + 1:1 overlay of the personalized names.
 * - Back side: classic 4-triangular folded envelope flaps.
 */
export function createEnvelopeModel(materials: EnvelopeMaterialsMap): EnvelopeModelParts {
  const root = new THREE.Group();
  root.name = 'EnvelopeRoot';

  const { width, height, depth } = ENVELOPE_CONFIG.dimensions;
  const halfW = width / 2;
  const halfH = height / 2;
  const zPlane = depth / 2;

  // 1. FRONT SIDE: Rectangular paper face with artwork texture
  const frontGeo = new THREE.PlaneGeometry(width, height);
  const frontPlain = new THREE.Mesh(frontGeo, materials.paperFrontArt);
  frontPlain.name = 'EnvelopeFrontPlain';
  frontPlain.position.set(0, 0, -zPlane);
  frontPlain.rotation.y = Math.PI;
  frontPlain.castShadow = true;
  frontPlain.receiveShadow = true;
  root.add(frontPlain);

  // 1b. Personalized Guest Name Surface:
  // EXACTLY matching the full front face width and height (width, height)
  // mapped with 1:1 UV coordinates directly over the front artwork
  const nameGeo = new THREE.PlaneGeometry(width, height);
  const nameMesh = new THREE.Mesh(nameGeo, materials.nameSurface);
  nameMesh.name = 'GuestNameSurface';
  nameMesh.position.set(0, 0, -zPlane - 0.002);
  nameMesh.rotation.y = Math.PI;
  root.add(nameMesh);

  // 2. BACK SIDE: 4 Triangular Flaps meeting at center
  const centerFoldY = -0.05;

  // 2a. Left Flap
  const leftShape = new THREE.Shape();
  leftShape.moveTo(-halfW, halfH);
  leftShape.lineTo(-halfW, -halfH);
  leftShape.lineTo(0.08, centerFoldY);
  leftShape.closePath();

  const leftGeo = new THREE.ShapeGeometry(leftShape);
  const backLeftFlap = new THREE.Mesh(leftGeo, materials.paperExterior);
  backLeftFlap.name = 'BackLeftFlap';
  backLeftFlap.position.set(0, 0, zPlane);
  backLeftFlap.castShadow = true;
  backLeftFlap.receiveShadow = true;
  root.add(backLeftFlap);

  // 2b. Right Flap
  const rightShape = new THREE.Shape();
  rightShape.moveTo(halfW, halfH);
  rightShape.lineTo(halfW, -halfH);
  rightShape.lineTo(-0.08, centerFoldY);
  rightShape.closePath();

  const rightGeo = new THREE.ShapeGeometry(rightShape);
  const backRightFlap = new THREE.Mesh(rightGeo, materials.paperExterior);
  backRightFlap.name = 'BackRightFlap';
  backRightFlap.position.set(0, 0, zPlane + 0.001);
  backRightFlap.castShadow = true;
  backRightFlap.receiveShadow = true;
  root.add(backRightFlap);

  // 2c. Bottom Flap
  const bottomShape = new THREE.Shape();
  bottomShape.moveTo(-halfW, -halfH);
  bottomShape.lineTo(halfW, -halfH);
  bottomShape.lineTo(0, centerFoldY + 0.32);
  bottomShape.closePath();

  const bottomGeo = new THREE.ShapeGeometry(bottomShape);
  const backBottomFlap = new THREE.Mesh(bottomGeo, materials.paperFlap);
  backBottomFlap.name = 'BackBottomFlap';
  backBottomFlap.position.set(0, 0, zPlane + 0.002);
  backBottomFlap.castShadow = true;
  backBottomFlap.receiveShadow = true;
  root.add(backBottomFlap);

  // 2d. Top Flap with Hinge
  const topFlapHinge = new THREE.Group();
  topFlapHinge.name = 'TopFlapHinge';
  topFlapHinge.position.set(0, halfH, zPlane + 0.003);
  root.add(topFlapHinge);

  const topShape = new THREE.Shape();
  topShape.moveTo(-halfW, 0);
  topShape.lineTo(halfW, 0);
  const topTipY = -(halfH - centerFoldY + 0.22);
  topShape.lineTo(0, topTipY);
  topShape.closePath();

  const topGeo = new THREE.ShapeGeometry(topShape);
  const topFlapMesh = new THREE.Mesh(topGeo, materials.paperFlap);
  topFlapMesh.name = 'TopFlapMesh';
  topFlapMesh.castShadow = true;
  topFlapMesh.receiveShadow = true;
  topFlapHinge.add(topFlapMesh);

  // Start with the front face facing the viewer
  root.rotation.y = Math.PI;

  return {
    root,
    frontPlain,
    backLeftFlap,
    backRightFlap,
    backBottomFlap,
    topFlapHinge,
    topFlapMesh,
    nameMesh,
  };
}
