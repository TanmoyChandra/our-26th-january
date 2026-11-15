import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface EnvelopeMaterialsMap {
  paperExterior: THREE.MeshStandardMaterial;
  paperFrontArt: THREE.MeshStandardMaterial;
  pocketArt: THREE.MeshStandardMaterial;
  flapArt: THREE.MeshStandardMaterial;
  paperInterior: THREE.MeshStandardMaterial;
  cardPaper: THREE.MeshStandardMaterial;
  nameSurface: THREE.MeshStandardMaterial;
}

export function createEnvelopeMaterials(
  guestTexture: THREE.CanvasTexture,
  frontTexture?: THREE.Texture | null,
  pocketTexture?: THREE.Texture | null,
  flapTexture?: THREE.Texture | null
): EnvelopeMaterialsMap {
  const { materials } = ENVELOPE_CONFIG;
  const baseColor = new THREE.Color(materials.paperColor);

  // Exterior paper for back & edges
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
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.FrontSide,
    depthWrite: true,
  });

  // Back Pocket surface with the bottom & side flaps texture from the uploaded image
  const pocketArt = new THREE.MeshStandardMaterial({
    map: pocketTexture || null,
    color: pocketTexture ? 0xffffff : baseColor,
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Top Flap with the embossed gold filigree & lotus artwork from the uploaded image
  const flapArt = new THREE.MeshStandardMaterial({
    map: flapTexture || null,
    color: flapTexture ? 0xffffff : baseColor,
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Warm interior paper lining visible inside when envelope opens
  const paperInterior = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#9c7b52'),
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Invitation card emerging from inside
  const cardPaper = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#faf6ee'),
    roughness: 0.88,
    metalness: 0.03,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Personalized guest name mapped on front
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
    pocketArt,
    flapArt,
    paperInterior,
    cardPaper,
    nameSurface,
  };
}
