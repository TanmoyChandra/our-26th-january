import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface EnvelopeMaterialsMap {
  paperExterior: THREE.MeshStandardMaterial;
  paperFrontArt: THREE.MeshStandardMaterial;
  paperFlap: THREE.MeshStandardMaterial;
  paperBacking: THREE.MeshStandardMaterial;
  nameSurface: THREE.MeshStandardMaterial;
}

export function createEnvelopeMaterials(
  guestTexture: THREE.CanvasTexture,
  frontTexture?: THREE.Texture | null
): EnvelopeMaterialsMap {
  const { materials } = ENVELOPE_CONFIG;
  const baseColor = new THREE.Color(materials.paperColor);

  // Exterior paper for back & sides
  const paperExterior = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: materials.roughness,
    metalness: materials.metalness,
    side: THREE.DoubleSide,
  });

  // Plain side front face with custom artwork texture
  const paperFrontArt = new THREE.MeshStandardMaterial({
    map: frontTexture || null,
    color: frontTexture ? 0xffffff : baseColor,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.FrontSide,
  });

  // Flaps on back side
  const paperFlap = new THREE.MeshStandardMaterial({
    color: baseColor.clone().multiplyScalar(0.98),
    roughness: materials.roughness,
    metalness: materials.metalness,
    side: THREE.DoubleSide,
  });

  const paperBacking = new THREE.MeshStandardMaterial({
    color: new THREE.Color(materials.innerColor),
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  // Personalized guest name mapped right next to "প্রতি,"
  const nameSurface = new THREE.MeshStandardMaterial({
    map: guestTexture,
    transparent: true,
    roughness: 0.8,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });

  return {
    paperExterior,
    paperFrontArt,
    paperFlap,
    paperBacking,
    nameSurface,
  };
}
