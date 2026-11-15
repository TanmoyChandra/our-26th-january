import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import { GuestNameTexture } from './GuestNameTexture';
import { createEnvelopeMaterials, EnvelopeMaterialsMap } from './EnvelopeMaterials';
import { createEnvelopeModel, EnvelopeModelParts } from './EnvelopeModel';

export interface EnvelopeSceneOptions {
  container: HTMLElement;
  guestName: string;
  category: string;
  interactiveRotation?: boolean;
}

export class EnvelopeScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private guestTexture: GuestNameTexture;
  private frontArtworkTexture: THREE.Texture | null = null;
  private pocketArtworkTexture: THREE.Texture | null = null;
  private flapArtworkTexture: THREE.Texture | null = null;
  private cardArtworkTexture: THREE.Texture | null = null;
  private cardBackArtworkTexture: THREE.Texture | null = null;
  private materials: EnvelopeMaterialsMap;
  private modelParts: EnvelopeModelParts;
  private isDisposed = false;
  private animationFrameId: number | null = null;
  private isOpen = false;
  private isUserInteracting = false;
  private giggleTimeline: gsap.core.Timeline | null = null;
  private entranceGiggleDone = false;
  private startTime = performance.now();

  constructor(options: EnvelopeSceneOptions) {
    this.container = options.container;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera tailored for 90% screen width and zero overflow
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const { fov, near, far } = ENVELOPE_CONFIG.camera;

    this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    const initialZ = this.calculateCameraDistance(width, height);
    this.camera.position.set(0, 0, initialZ);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with high DPI support & soft shadow mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting setup
    this.setupLighting();

    // 5. Guest Name Texture mapped to envelope front
    this.guestTexture = new GuestNameTexture({
      displayName: options.guestName,
      category: options.category,
    });

    // 6. Load textures for Front, Flap, and Pocket
    const textureLoader = new THREE.TextureLoader();

    this.frontArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.frontTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.paperFrontArt) {
          this.materials.paperFrontArt.map = tex;
          this.materials.paperFrontArt.needsUpdate = true;
        }
      }
    );

    this.pocketArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.pocketTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.pocketArt) {
          this.materials.pocketArt.map = tex;
          this.materials.pocketArt.needsUpdate = true;
        }
      }
    );

    this.flapArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.flapTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.flapArt) {
          this.materials.flapArt.map = tex;
          this.materials.flapArt.needsUpdate = true;
        }
      }
    );

    this.cardArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.cardTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.cardPaper) {
          this.materials.cardPaper.map = tex;
          this.materials.cardPaper.needsUpdate = true;
        }
      }
    );

    this.cardBackArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.cardBackTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.cardBackPaper) {
          this.materials.cardBackPaper.map = tex;
          this.materials.cardBackPaper.needsUpdate = true;
        }
      }
    );

    // 7. Materials & 3D Model
    this.materials = createEnvelopeMaterials(
      this.guestTexture.getTexture(),
      this.frontArtworkTexture,
      this.pocketArtworkTexture,
      this.flapArtworkTexture,
      this.cardArtworkTexture,
      this.cardBackArtworkTexture
    );
    this.modelParts = createEnvelopeModel(this.materials);
    this.scene.add(this.modelParts.root);

    // 8. Full 360 degree interactive rotation & zoom (touch & mouse)
    if (options.interactiveRotation !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.enableZoom = true;
      this.controls.zoomSpeed = 1.2;
      this.controls.minDistance = Math.min(3.5, initialZ * 0.4);
      this.controls.maxDistance = Math.max(26.0, initialZ * 2.0);
      this.controls.enablePan = false;
      this.controls.rotateSpeed = 0.95;

      this.controls.minPolarAngle = Math.PI / 4;
      this.controls.maxPolarAngle = (3 * Math.PI) / 4;
      this.controls.minAzimuthAngle = -Infinity;
      this.controls.maxAzimuthAngle = Infinity;

      this.controls.addEventListener('start', () => {
        this.isUserInteracting = true;
      });
      this.controls.addEventListener('end', () => {
        this.isUserInteracting = false;
      });
    }

    // 9. Event listeners
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 10. Start render loop
    this.animate = this.animate.bind(this);
    this.animate();

    // 11. Trigger entrance 3D giggle / teaser rotation so users immediately perceive 3D depth
    this.playEntranceGiggle();
  }

  private setupLighting(): void {
    const { lighting } = ENVELOPE_CONFIG;

    const ambientLight = new THREE.AmbientLight(
      lighting.ambientColor,
      lighting.ambientIntensity
    );
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
      lighting.directionalColor,
      lighting.directionalIntensity
    );
    mainLight.position.set(2, 4, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0002;
    this.scene.add(mainLight);

    const frontFillLight = new THREE.DirectionalLight('#fff5ea', 1.1);
    frontFillLight.position.set(0, 0, -6);
    this.scene.add(frontFillLight);

    const rimLight = new THREE.DirectionalLight('#fef3c7', 0.6);
    rimLight.position.set(-2, -3, 5);
    this.scene.add(rimLight);
  }

  /**
   * Smoothly animates the flap open/closed and slides the card out.
   * Flap flips back behind the card, and the emerging card stays in the TOP layer.
   */
  public toggleOpen(): boolean {
    if (this.isDisposed) return this.isOpen;
    this.isOpen = !this.isOpen;

    // Stop any entrance teaser or idle animation immediately
    if (this.giggleTimeline) {
      this.giggleTimeline.kill();
      this.giggleTimeline = null;
    }
    this.entranceGiggleDone = true;

    // Smoothly orient to the back face where the opening action happens
    gsap.to(this.modelParts.root.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(this.modelParts.root.position, {
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    });

    const zBack = ENVELOPE_CONFIG.dimensions.depth / 2;
    const closedFlapZ = zBack + 0.003;

    if (this.isOpen) {
      // 1. OPENING SEQUENCE:
      // STRICT ORDER: First the envelope opens completely. THEN the paper comes out.
      const targetFlapAngle = -Math.PI * 1.06;
      const targetFlapZ = -0.020;
      const targetCardY = 1.82;
      const targetCardZ = 0.022;

      const tl = gsap.timeline();

      // Step 1: Flap lifts up-forward and folds back behind the envelope
      tl.to(this.modelParts.topFlapHinge.rotation, {
        x: targetFlapAngle,
        duration: 0.95,
        ease: 'power2.inOut',
      }, 0);

      tl.to(this.modelParts.topFlapHinge.position, {
        z: targetFlapZ,
        duration: 0.95,
        ease: 'power2.inOut',
      }, 0);

      // Layering: flap goes behind once it crosses the top fold
      tl.add(() => {
        if (this.isOpen) {
          this.modelParts.topFlapMesh.renderOrder = 2; // Triangle flap in back layer
          if (this.modelParts.topFlapBackMesh) this.modelParts.topFlapBackMesh.renderOrder = 2;
          if (this.modelParts.topFlapEdgeMesh) this.modelParts.topFlapEdgeMesh.renderOrder = 2;
          this.modelParts.cardMesh.renderOrder = 4;    // Paper card on top layer
          this.modelParts.backPocketMesh.renderOrder = 5;
        }
      }, 0.5);

      // Step 2: ONLY after the flap is fully open, the paper card comes out!
      tl.to(this.modelParts.cardGroup.position, {
        y: targetCardY,
        z: targetCardZ,
        duration: 1.15,
        ease: 'power2.out',
      }, '+=0.1');

      // Subtle 3D tilt as the card emerges to show its physical rim and catch specular light
      tl.to(this.modelParts.cardGroup.rotation, {
        x: -0.04,
        duration: 1.15,
        ease: 'power2.out',
      }, '<');
    } else {
      // 2. CLOSING SEQUENCE:
      // STRICT ORDER: First paper card slides completely inside, THEN flap closes over it.
      const tl = gsap.timeline();

      // Step 1: Paper slides all the way back down into the envelope first
      tl.to(this.modelParts.cardGroup.position, {
        y: 0,
        z: 0.005,
        duration: 0.75,
        ease: 'power2.inOut',
      }, 0);

      tl.to(this.modelParts.cardGroup.rotation, {
        x: 0,
        duration: 0.75,
        ease: 'power2.inOut',
      }, 0);

      // Step 2: ONLY after paper is back inside, flap folds down and seals over pocket
      tl.to(this.modelParts.topFlapHinge.rotation, {
        x: 0,
        duration: 0.85,
        ease: 'power2.inOut',
      }, '+=0.08');

      tl.to(this.modelParts.topFlapHinge.position, {
        z: closedFlapZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          this.startTime = performance.now();
          // Flap is now closed over the pocket on top
          this.modelParts.topFlapMesh.renderOrder = 5;
          if (this.modelParts.topFlapBackMesh) this.modelParts.topFlapBackMesh.renderOrder = 5;
          if (this.modelParts.topFlapEdgeMesh) this.modelParts.topFlapEdgeMesh.renderOrder = 5;
          this.modelParts.backPocketMesh.renderOrder = 4;
          this.modelParts.cardMesh.renderOrder = 3;
        },
      }, '<');
    }

    return this.isOpen;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public updateGuest(name: string, category: string): void {
    if (this.isDisposed) return;
    this.guestTexture.update({ displayName: name, category });
  }

  /**
   * Calculates the exact camera Z distance so that the invitation
   * takes precisely 90% (0.90) of the visible screen width on portrait / mobile screens,
   * while never overflowing vertically on landscape / desktop screens.
   */
  public calculateCameraDistance(width: number, height: number): number {
    const aspect = width / height;
    const fovInRad = (this.camera.fov * Math.PI) / 180;
    const halfFovTan = Math.tan(fovInRad / 2);

    // Envelope width is 4.8 world units (widest part of the invitation assembly).
    // Target: envelope width occupies exactly 90% (0.90) of the visible screen width.
    const envelopeWidth = ENVELOPE_CONFIG.dimensions.width; // 4.8
    const desiredWidthRatio = 0.90;
    const zForWidth = envelopeWidth / (desiredWidthRatio * 2 * halfFovTan * aspect);

    // On landscape / desktop displays, ensure the open envelope + emerged card (~4.85 units total height)
    // takes at most 72% of the viewport height so top header and bottom buttons are never covered.
    const totalOpenHeight = 4.85;
    const desiredMaxHeightRatio = 0.72;
    const zForHeight = totalOpenHeight / (desiredMaxHeightRatio * 2 * halfFovTan);

    // On portrait mobile (aspect < 1), zForWidth dominates, giving exactly 90% screen width.
    // On wide desktop screens, zForHeight prevents any vertical clipping.
    return Math.max(zForWidth, zForHeight);
  }

  /**
   * Plays a 3D entrance giggle/rotate teaser when the page opens,
   * gently tilting the envelope left & right to reveal its 3D depth,
   * golden rim thickness (#D2B789), and dynamic lighting so users
   * immediately recognize that it is a 3D interactive card.
   */
  private playEntranceGiggle(): void {
    if (this.isDisposed || this.isOpen) return;

    this.giggleTimeline = gsap.timeline({
      delay: 0.35,
      onComplete: () => {
        this.entranceGiggleDone = true;
        this.giggleTimeline = null;
        this.startTime = performance.now();
      },
    });

    // 1. Tilt smoothly to the right and slightly forward
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: 0.28, // ~16 deg
      x: 0.08, // ~4.5 deg
      z: 0.02,
      duration: 0.75,
      ease: 'power2.out',
    });

    // 2. Sway smoothly across to the left, revealing the opposite 3D edge
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: -0.24, // ~-13.8 deg
      x: -0.05,
      z: -0.015,
      duration: 0.9,
      ease: 'power2.inOut',
    });

    // 3. Gentle rebound back towards center
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: 0.08,
      x: 0.02,
      z: 0.005,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    // 4. Settle softly to center
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: 0,
      x: 0,
      z: 0,
      duration: 0.55,
      ease: 'power2.out',
    });
  }

  private animate(): void {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    // Gentle ambient floating wobble / giggle when idle and closed,
    // subtly breathing so the card always feels alive and 3D.
    if (
      this.entranceGiggleDone &&
      !this.isOpen &&
      !this.isUserInteracting &&
      !this.giggleTimeline
    ) {
      const elapsed = (performance.now() - this.startTime) * 0.001;
      const targetRotY = Math.sin(elapsed * 1.5) * 0.055; // +/- 3.1 degrees subtle sway
      const targetRotX = Math.cos(elapsed * 1.1) * 0.03;  // +/- 1.7 degrees subtle nod
      const targetPosY = Math.sin(elapsed * 1.8) * 0.035; // gentle vertical float

      // Smooth interpolation so it never snaps
      this.modelParts.root.rotation.y += (targetRotY - this.modelParts.root.rotation.y) * 0.04;
      this.modelParts.root.rotation.x += (targetRotX - this.modelParts.root.rotation.x) * 0.04;
      this.modelParts.root.position.y += (targetPosY - this.modelParts.root.position.y) * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    const newTargetZ = this.calculateCameraDistance(width, height);
    this.camera.updateProjectionMatrix();

    if (this.controls) {
      this.camera.position.setLength(newTargetZ);
      this.controls.minDistance = Math.min(3.5, newTargetZ * 0.4);
      this.controls.maxDistance = Math.max(26.0, newTargetZ * 2.0);
      this.controls.update();
    } else {
      this.camera.position.z = newTargetZ;
    }

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public dispose(): void {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.giggleTimeline) {
      this.giggleTimeline.kill();
      this.giggleTimeline = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.controls) {
      this.controls.dispose();
    }

    this.guestTexture.dispose();
    if (this.frontArtworkTexture) this.frontArtworkTexture.dispose();
    if (this.pocketArtworkTexture) this.pocketArtworkTexture.dispose();
    if (this.flapArtworkTexture) this.flapArtworkTexture.dispose();
    if (this.cardArtworkTexture) this.cardArtworkTexture.dispose();
    if (this.cardBackArtworkTexture) this.cardBackArtworkTexture.dispose();

    Object.values(this.materials).forEach((mat) => mat.dispose());

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
