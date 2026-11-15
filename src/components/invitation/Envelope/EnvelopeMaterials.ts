import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface EnvelopeMaterialsMap {
  paperExterior: THREE.MeshStandardMaterial;
  paperFrontArt: THREE.MeshStandardMaterial;
  pocketArt: THREE.MeshStandardMaterial;
  flapArt: THREE.MeshStandardMaterial;
  paperInterior: THREE.MeshStandardMaterial;
  cardPaper: THREE.MeshStandardMaterial;
  cardBackPaper: THREE.MeshStandardMaterial;
  nameSurface: THREE.MeshStandardMaterial;
}

export function createEnvelopeMaterials(
  guestTexture: THREE.CanvasTexture,
  frontTexture?: THREE.Texture | null,
  pocketTexture?: THREE.Texture | null,
  flapTexture?: THREE.Texture | null,
  cardTexture?: THREE.Texture | null,
  cardBackTexture?: THREE.Texture | null
): EnvelopeMaterialsMap {
  const { materials } = ENVELOPE_CONFIG;
  const baseColor = new THREE.Color(materials.paperColor);

  // Envelope thickness rim color: requested #d3bb90
  const edgeThicknessColor = new THREE.Color(materials.shadowEdgeColor || '#d3bb90');

  // Exterior paper for edges / envelope thickness
  const paperExterior = new THREE.MeshStandardMaterial({
    color: edgeThicknessColor,
    roughness: 0.72,
    metalness: 0.08,
    side: THREE.DoubleSide,
    depthWrite: true,
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

  // Clean warm cream interior paper lining visible inside when envelope opens: #e1d2b0
  const paperInterior = new THREE.MeshStandardMaterial({
    color: new THREE.Color(materials.innerColor || '#e1d2b0'),
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Invitation card emerging from inside with custom Engagement Ceremony artwork
  const cardPaper = new THREE.MeshStandardMaterial({
    map: cardTexture || null,
    color: cardTexture ? 0xffffff : new THREE.Color('#faf6ee'),
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.72,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  // Luxury textured parchment for the card back and beveled edge
  const cardBackPaper = new THREE.MeshStandardMaterial({
    map: cardBackTexture || null,
    color: cardBackTexture ? 0xffffff : new THREE.Color('#faf6ee'),
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.78,
    metalness: 0.04,
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
    cardBackPaper,
    nameSurface,
  };
}
