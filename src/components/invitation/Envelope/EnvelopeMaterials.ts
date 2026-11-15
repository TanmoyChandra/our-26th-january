import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface EnvelopeMaterialsMap {
  paperExterior: THREE.MeshStandardMaterial;
  paperInterior: THREE.MeshStandardMaterial;
  seal: THREE.MeshStandardMaterial;
  paperFlap: THREE.MeshStandardMaterial;
  paperBacking: THREE.MeshStandardMaterial;
  nameSurface: THREE.MeshStandardMaterial;
}

/**
 * Creates and configures physical PBR materials for the 3D envelope.
 * These materials can be swapped or modified with custom textures later.
 */
export function createEnvelopeMaterials(guestTexture: THREE.CanvasTexture): EnvelopeMaterialsMap {
  const { materials } = ENVELOPE_CONFIG;
  const baseColor = new THREE.Color(materials.paperColor);

  // Exterior paper with subtle natural matte kraft feel
  const paperExterior = new THREE.MeshStandardMaterial({
    color: new THREE.Color(materials.paperColor),
    color: baseColor,
    roughness: materials.roughness,
    metalness: materials.metalness,
    side: THREE.FrontSide,
    side: THREE.DoubleSide,
  });

  const paperInterior = new THREE.MeshStandardMaterial({
    // Slightly contrasted material for flaps to create realistic paper bevel creases
    const paperFlap = new THREE.MeshStandardMaterial({
      color: baseColor.clone().multiplyScalar(0.98),
      roughness: materials.roughness,
      metalness: materials.metalness,
      side: THREE.DoubleSide,
    });

    const paperBacking = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materials.innerColor),
      roughness: 0.9,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.BackSide,
      side: THREE.DoubleSide,
    });

    const seal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materials.sealColor),
      roughness: 0.35,
      metalness: 0.65,
    });

    // Dedicated surface for the personalized guest name CanvasTexture
    // Personalized guest name mapped on the plain front face
    const nameSurface = new THREE.MeshStandardMaterial({
      map: guestTexture,
      transparent: true,
      roughness: 0.8,
      metalness: 0.05,
      roughness: 0.85,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      side: THREE.DoubleSide,
    });

    return {
      paperExterior,
      paperInterior,
      seal,
      paperFlap,
      paperBacking,
      nameSurface,
    };
  }

