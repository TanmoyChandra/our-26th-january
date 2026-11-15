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
  private openTimeline: gsap.core.Timeline | null = null;
  private unfoldTimeline: gsap.core.Timeline | null = null;
  private isUnfolded = false;
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
   * Whatever angle the card/camera is currently at, it first smoothly brings
   * the view to the back side of the envelope squarely in front of the camera,
   * AND THEN ONLY does the flap open, followed by the card sliding out.
   */
  public toggleOpen(): boolean {
    if (this.isDisposed) return this.isOpen;
    this.isOpen = !this.isOpen;

    // Stop any entrance teaser or previous transition timeline immediately
    if (this.giggleTimeline) {
      this.giggleTimeline.kill();
      this.giggleTimeline = null;
    }

    if (this.openTimeline) {
      this.openTimeline.kill();
      this.openTimeline = null;
    }

    if (this.unfoldTimeline) {
      this.unfoldTimeline.kill();
      this.unfoldTimeline = null;
    }
    if (!this.isOpen && this.isUnfolded) {
      this.isUnfolded = false;
      this.modelParts.topPanelHinge.rotation.x = -Math.PI;
      this.modelParts.bottomPanelHinge.rotation.x = Math.PI;
      this.modelParts.root.position.y = 0;
    }
    this.entranceGiggleDone = true;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const targetZ = this.calculateCameraDistance(width, height);

    const zBack = ENVELOPE_CONFIG.dimensions.depth / 2;
    const closedFlapZ = zBack + 0.003;

    if (this.isOpen) {
      // 1. OPENING SEQUENCE:
      // STRICT ORDER:
      // Phase 1: Whatever angle it is at, smoothly bring the back side of the envelope directly to face the camera
      // Phase 2: THEN AND ONLY THEN, the flap opens
      // Phase 3: THEN AND ONLY THEN, the card slides out

      if (this.controls) this.controls.enabled = false;

      const spherical = new THREE.Spherical().setFromVector3(this.camera.position);
      // Shortest angular path around spherical theta to 0 (front-facing on Z axis)
      const deltaTheta = Math.atan2(Math.sin(0 - spherical.theta), Math.cos(0 - spherical.theta));
      const endTheta = spherical.theta + deltaTheta;

      // Shortest angular path for root.rotation.y to 0 (back face pointing directly to +Z)
      const deltaRootY = Math.atan2(Math.sin(0 - this.modelParts.root.rotation.y), Math.cos(0 - this.modelParts.root.rotation.y));
      const endRootY = this.modelParts.root.rotation.y + deltaRootY;

      const animState = {
        radius: spherical.radius,
        phi: spherical.phi,
        theta: spherical.theta,
        rotX: this.modelParts.root.rotation.x,
        rotY: this.modelParts.root.rotation.y,
        rotZ: this.modelParts.root.rotation.z,
        posX: this.modelParts.root.position.x,
        posY: this.modelParts.root.position.y,
        posZ: this.modelParts.root.position.z,
      };

      const targetFlapAngle = -Math.PI * 1.06;
      const targetFlapZ = -0.020;
      const targetCardY = 0.88;
      const targetCardZ = 0.010;

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) this.controls.enabled = true;
          this.openTimeline = null;
        },
      });
      this.openTimeline = tl;

      // Phase 1: Smoothly orient envelope & camera so back side faces viewer squarely
      tl.to(animState, {
        radius: targetZ,
        phi: Math.PI / 2,
        theta: endTheta,
        rotX: 0,
        rotY: endRootY,
        rotZ: 0,
        posX: 0,
        posY: 0,
        posZ: 0,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          const tempSpherical = new THREE.Spherical(animState.radius, animState.phi, animState.theta);
          tempSpherical.makeSafe();
          this.camera.position.setFromSpherical(tempSpherical);
          this.camera.lookAt(0, 0, 0);
          this.modelParts.root.rotation.set(animState.rotX, animState.rotY, animState.rotZ);
          this.modelParts.root.position.set(animState.posX, animState.posY, animState.posZ);
        },
        onComplete: () => {
          this.modelParts.root.rotation.set(0, 0, 0);
          this.modelParts.root.position.set(0, 0, 0);
          this.camera.position.set(0, 0, targetZ);
          this.camera.lookAt(0, 0, 0);
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
          }
        },
      });

      // Phase 2: THEN AND ONLY THEN (after Phase 1 is 100% finished), the flap begins opening!
      tl.to(this.modelParts.topFlapHinge.rotation, {
        x: targetFlapAngle,
        duration: 0.95,
        ease: 'power2.inOut',
      });

      tl.to(this.modelParts.topFlapHinge.position, {
        z: targetFlapZ,
        duration: 0.95,
        ease: 'power2.inOut',
      }, '<');

      // Layering: flap goes behind once it crosses the top fold, while card stays nestled inside pocket
      tl.add(() => {
        if (this.isOpen) {
          this.modelParts.topFlapMesh.renderOrder = 2; // Triangle flap in back layer
          if (this.modelParts.topFlapBackMesh) this.modelParts.topFlapBackMesh.renderOrder = 2;
          if (this.modelParts.topFlapEdgeMesh) this.modelParts.topFlapEdgeMesh.renderOrder = 2;
          this.modelParts.cardMesh.renderOrder = 4;    // Paper card inside pocket
          if (this.modelParts.cardBackMesh) this.modelParts.cardBackMesh.renderOrder = 4;
          if (this.modelParts.cardRimMesh) this.modelParts.cardRimMesh.renderOrder = 4;
          this.modelParts.backPocketMesh.renderOrder = 5; // Pocket front occludes lower part of card
        }
      }, '-=0.45');

      // Phase 3: THEN AND ONLY THEN (after flap is fully opened), the paper card slides out partially,
      // keeping its lower portion neatly tucked inside the envelope pocket!
      tl.to(this.modelParts.cardGroup.position, {
        y: targetCardY,
        z: targetCardZ,
        duration: 1.15,
        ease: 'power2.out',
      }, '+=0.08');

      tl.to(this.modelParts.cardGroup.rotation, {
        x: 0,
        duration: 1.15,
        ease: 'power2.out',
      }, '<');
    } else {
      // 2. CLOSING SEQUENCE:
      // STRICT ORDER: First paper card slides completely inside, THEN flap closes over it and seals.
      // (No rotation: remains facing the back side).
      if (this.controls) this.controls.enabled = false;

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) this.controls.enabled = true;
          this.openTimeline = null;
          this.startTime = performance.now();
        },
      });
      this.openTimeline = tl;

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
      }, '+=0.05');

      tl.to(this.modelParts.topFlapHinge.position, {
        z: closedFlapZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          // Flap is now closed over the pocket on top
          this.modelParts.topFlapMesh.renderOrder = 5;
          if (this.modelParts.topFlapBackMesh) this.modelParts.topFlapBackMesh.renderOrder = 5;
          if (this.modelParts.topFlapEdgeMesh) this.modelParts.topFlapEdgeMesh.renderOrder = 5;
          this.modelParts.backPocketMesh.renderOrder = 4;
          this.modelParts.cardMesh.renderOrder = 3;
          if (this.modelParts.cardBackMesh) this.modelParts.cardBackMesh.renderOrder = 3;
          if (this.modelParts.cardRimMesh) this.modelParts.cardRimMesh.renderOrder = 3;
        },
      }, '<');
    }

    return this.isOpen;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Smoothly unfolds the 3-fold card out of the envelope to full screen width.
   * Clicking toggles between the unfolded reading view and the nestled envelope view.
   */
  public toggleUnfold(): boolean {
    if (this.isDisposed || !this.isOpen) return this.isUnfolded;
    this.isUnfolded = !this.isUnfolded;

    if (this.unfoldTimeline) {
      this.unfoldTimeline.kill();
      this.unfoldTimeline = null;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;
    const fovInRad = (this.camera.fov * Math.PI) / 180;
    const halfFovTan = Math.tan(fovInRad / 2);

    if (this.isUnfolded) {
      // 1. UNFOLD TO FULL READING VIEW:
      // The 3-fold card is 4.0 wide x 9.0 tall.
      // Width at 90% screen width:
      const zForCardWidth = 4.0 / (0.90 * 2 * halfFovTan * aspect);
      // Height at 88% screen height:
      const zForCardHeight = 9.0 / (0.88 * 2 * halfFovTan);
      const targetUnfoldZ = Math.max(zForCardWidth, zForCardHeight);

      if (this.controls) this.controls.enabled = false;

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            this.controls.enabled = true;
          }
          this.unfoldTimeline = null;
        },
      });
      this.unfoldTimeline = tl;

      // Card glides up to dead center of viewport
      tl.to(this.modelParts.cardGroup.position, {
        x: 0,
        y: 0,
        z: 0.35,
        duration: 0.85,
        ease: 'power2.inOut',
      }, 0);

      // Envelope lowers slightly to give full focus to the 3-fold card
      tl.to(this.modelParts.root.position, {
        y: -3.0,
        duration: 0.85,
        ease: 'power2.inOut',
      }, 0);

      // Camera glides to frame the 3-fold card at full width
      tl.to(this.camera.position, {
        x: 0,
        y: 0,
        z: targetUnfoldZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        },
      }, 0);

      // Step 2: Top fold lifts and unfolds upward (rotation.x from -Math.PI to 0)
      tl.to(this.modelParts.topPanelHinge.rotation, {
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
      }, '+=0.05');

      // Step 3: Bottom fold drops and unfolds downward (rotation.x from Math.PI to 0)
      tl.to(this.modelParts.bottomPanelHinge.rotation, {
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
      }, '-=0.65');
    } else {
      // 2. FOLD BACK INTO NESTLED ENVELOPE:
      if (this.controls) this.controls.enabled = false;

      const targetZ = this.calculateCameraDistance(width, height);

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            this.controls.enabled = true;
          }
          this.unfoldTimeline = null;
        },
      });
      this.unfoldTimeline = tl;

      // Step 1: Panels fold back
      tl.to(this.modelParts.bottomPanelHinge.rotation, {
        x: Math.PI,
        duration: 0.75,
        ease: 'power2.inOut',
      }, 0);

      tl.to(this.modelParts.topPanelHinge.rotation, {
        x: -Math.PI,
        duration: 0.75,
        ease: 'power2.inOut',
      }, '+=0.05');

      // Step 2: Card glides back into envelope pocket
      tl.to(this.modelParts.cardGroup.position, {
        x: 0,
        y: 0.88,
        z: 0.010,
        duration: 0.85,
        ease: 'power2.inOut',
      }, '+=0.08');

      // Envelope moves back to center
      tl.to(this.modelParts.root.position, {
        y: 0,
        duration: 0.85,
        ease: 'power2.inOut',
      }, '<');

      // Camera returns to standard envelope distance
      tl.to(this.camera.position, {
        x: 0,
        y: 0,
        z: targetZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        },
      }, '<');
    }

    return this.isUnfolded;
  }

  public getIsUnfolded(): boolean {
    return this.isUnfolded;
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

    const baseRotY = Math.PI;

    // 1. Tilt smoothly to the right and slightly forward
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: baseRotY + 0.28, // ~16 deg
      x: 0.08, // ~4.5 deg
      z: 0.02,
      duration: 0.75,
      ease: 'power2.out',
    });

    // 2. Sway smoothly across to the left, revealing the opposite 3D edge
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: baseRotY - 0.24, // ~-13.8 deg
      x: -0.05,
      z: -0.015,
      duration: 0.9,
      ease: 'power2.inOut',
    });

    // 3. Gentle rebound back towards center
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: baseRotY + 0.08,
      x: 0.02,
      z: 0.005,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    // 4. Settle softly to center
    this.giggleTimeline.to(this.modelParts.root.rotation, {
      y: baseRotY,
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
      !this.isUnfolded &&
      !this.isUserInteracting &&
      !this.giggleTimeline &&
      !this.openTimeline &&
      !this.unfoldTimeline
    ) {
      const elapsed = (performance.now() - this.startTime) * 0.001;
      const baseRotY = Math.abs(this.modelParts.root.rotation.y) > Math.PI / 2 ? Math.PI : 0;
      const targetRotY = baseRotY + Math.sin(elapsed * 1.5) * 0.055;
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

    if (this.openTimeline) {
      this.openTimeline.kill();
      this.openTimeline = null;
    }

    if (this.unfoldTimeline) {
      this.unfoldTimeline.kill();
      this.unfoldTimeline = null;
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
