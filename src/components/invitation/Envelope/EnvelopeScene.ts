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
  private cardPage2ArtworkTexture: THREE.Texture | null = null;
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

  // 3D vertical scrolling and interactive horizontal tilt state when card is unfolded into 3 pages
  private targetScrollY = 0;
  private currentScrollY = 0;
  private targetTiltY = 0;
  private currentTiltY = 0;
  private targetTiltZ = 0;
  private currentTiltZ = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartScrollY = 0;
  private isTouchScrolling = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartScrollY = 0;
  private isPointerScrolling = false;

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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

    this.cardPage2ArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.cardPage2TexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (this.materials.cardPage2Paper) {
          this.materials.cardPage2Paper.map = tex;
          this.materials.cardPage2Paper.needsUpdate = true;
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
      this.cardBackArtworkTexture,
      this.cardPage2ArtworkTexture
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

    // 3D vertical scrolling event listeners when card is unfolded into 3 pages
    const dom = this.renderer.domElement;
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    dom.addEventListener('touchstart', this.onTouchStart, { passive: true });
    dom.addEventListener('touchmove', this.onTouchMove, { passive: false });
    dom.addEventListener('touchend', this.onTouchEnd);
    dom.addEventListener('touchcancel', this.onTouchEnd);
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

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
      this.modelParts.middlePanelHinge.rotation.x = Math.PI;
      this.modelParts.bottomPanelHinge.rotation.x = -Math.PI;
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
          this.setCardRenderOrder(4);                  // Paper card inside pocket
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

      // Step 1: If card was unfolded, fold panels back immediately
      if (this.isUnfolded) {
        this.isUnfolded = false;
        this.targetScrollY = 0;
        this.currentScrollY = 0;
        tl.to(this.modelParts.bottomPanelHinge.rotation, {
          x: -Math.PI,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 0);
        tl.to(this.modelParts.middlePanelHinge.rotation, {
          x: Math.PI,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 0);
        tl.to(this.modelParts.envelopeGroup.position, {
          y: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 0);
        tl.to(this.modelParts.root.position, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 0);
      }

      // Step 2: Paper slides all the way back down into the envelope
      tl.to(this.modelParts.cardGroup.position, {
        y: 0,
        z: 0.005,
        duration: 0.75,
        ease: 'power2.inOut',
      }, this.isUnfolded ? '+=0.1' : 0);

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
          this.setCardRenderOrder(3);
        },
      }, '<');

      // Step 3: THEN AND ONLY THEN (after closing is 100% complete and sealed),
      // smoothly rotate the envelope back to the front face (personalized guest name & couple artwork)!
      const spherical = new THREE.Spherical().setFromVector3(this.camera.position);
      const deltaTheta = Math.atan2(Math.sin(0 - spherical.theta), Math.cos(0 - spherical.theta));
      const endTheta = spherical.theta + deltaTheta;

      const deltaRootY = Math.atan2(Math.sin(Math.PI - this.modelParts.root.rotation.y), Math.cos(Math.PI - this.modelParts.root.rotation.y));
      const endRootY = this.modelParts.root.rotation.y + deltaRootY;

      const closeAnimState = {
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

      tl.to(closeAnimState, {
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
          const tempSpherical = new THREE.Spherical(closeAnimState.radius, closeAnimState.phi, closeAnimState.theta);
          tempSpherical.makeSafe();
          this.camera.position.setFromSpherical(tempSpherical);
          this.camera.lookAt(0, 0, 0);
          this.modelParts.root.rotation.set(closeAnimState.rotX, closeAnimState.rotY, closeAnimState.rotZ);
          this.modelParts.root.position.set(closeAnimState.posX, closeAnimState.posY, closeAnimState.posZ);
        },
        onComplete: () => {
          this.modelParts.root.rotation.set(0, Math.PI, 0);
          this.modelParts.root.position.set(0, 0, 0);
          this.camera.position.set(0, 0, targetZ);
          this.camera.lookAt(0, 0, 0);
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
          }
        },
      }, '+=0.08');
    }

    return this.isOpen;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Sets the renderOrder for all meshes inside the card assembly (top, middle, bottom panels, rims, backs).
   */
  private setCardRenderOrder(order: number): void {
    if (!this.modelParts?.cardGroup) return;
    this.modelParts.cardGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.renderOrder = order;
      }
    });
  }

  // 3D vertical scrolling handlers for unfolded card
  private onWheel = (e: WheelEvent): void => {
    if (!this.isUnfolded || this.unfoldTimeline) return;
    e.preventDefault();
    const visibleHeightIn3D = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const wheelSensitivity = (visibleHeightIn3D / window.innerHeight) * 0.9;
    this.targetScrollY = Math.max(0, Math.min(6.0, this.targetScrollY + e.deltaY * wheelSensitivity));
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (!this.isUnfolded || this.unfoldTimeline || e.touches.length === 0) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartScrollY = this.targetScrollY;
    this.isTouchScrolling = true;
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (!this.isTouchScrolling || !this.isUnfolded || e.touches.length === 0) return;
    if (e.cancelable) e.preventDefault();
    const deltaX = e.touches[0].clientX - this.touchStartX;
    const deltaY = e.touches[0].clientY - this.touchStartY;
    const visibleHeightIn3D = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const sensitivity = (visibleHeightIn3D / window.innerHeight) * 1.0;
    const rawTarget = this.touchStartScrollY - deltaY * sensitivity;
    this.targetScrollY = Math.max(-0.35, Math.min(6.35, rawTarget));

    // Subtle 3D tilt on horizontal drag (max ~7.5 degrees) to show realistic physical depth
    const tiltSensitivity = (Math.PI / 180) * (14.0 / Math.max(300, window.innerWidth));
    this.targetTiltY = Math.max(-0.13, Math.min(0.13, deltaX * tiltSensitivity));
    this.targetTiltZ = Math.max(-0.02, Math.min(0.02, -deltaX * tiltSensitivity * 0.15));
  };

  private onTouchEnd = (): void => {
    this.isTouchScrolling = false;
    this.targetScrollY = Math.max(0, Math.min(6.0, this.targetScrollY));
    this.targetTiltY = 0.0;
    this.targetTiltZ = 0.0;
  };

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.isUnfolded || this.unfoldTimeline || e.button !== 0) return;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    this.pointerStartScrollY = this.targetScrollY;
    this.isPointerScrolling = true;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isPointerScrolling || !this.isUnfolded) return;
    const deltaX = e.clientX - this.pointerStartX;
    const deltaY = e.clientY - this.pointerStartY;
    const visibleHeightIn3D = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const sensitivity = (visibleHeightIn3D / window.innerHeight) * 1.0;
    const rawTarget = this.pointerStartScrollY - deltaY * sensitivity;
    this.targetScrollY = Math.max(-0.35, Math.min(6.35, rawTarget));

    // Subtle 3D tilt on horizontal drag (max ~7.5 degrees) to show realistic physical depth
    const tiltSensitivity = (Math.PI / 180) * (14.0 / Math.max(300, window.innerWidth));
    this.targetTiltY = Math.max(-0.13, Math.min(0.13, deltaX * tiltSensitivity));
    this.targetTiltZ = Math.max(-0.02, Math.min(0.02, -deltaX * tiltSensitivity * 0.15));
  };

  private onPointerUp = (): void => {
    this.isPointerScrolling = false;
    this.targetScrollY = Math.max(0, Math.min(6.0, this.targetScrollY));
    this.targetTiltY = 0.0;
    this.targetTiltZ = 0.0;
  };

  public getScrollProgress(): number {
    return Math.max(0, Math.min(1, this.currentScrollY / 6.0));
  }

  public getScrollPage(): number {
    const progress = this.getScrollProgress();
    if (progress < 0.25) return 1;
    if (progress < 0.75) return 2;
    return 3;
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
      // Uses calculateUnfoldCameraDistance so card takes 95.5% width on mobile, leaving minimal side margins
      const targetUnfoldZ = this.calculateUnfoldCameraDistance(width, height);

      // Disable orbit rotation immediately so user touches cannot rotate the scene
      if (this.controls) {
        this.controls.enableRotate = false;
        this.controls.enableZoom = false;
        this.controls.enabled = false;
      }

      this.targetScrollY = 0.0;
      this.currentScrollY = 0.0;
      this.targetTiltY = 0.0;
      this.currentTiltY = 0.0;
      this.targetTiltZ = 0.0;
      this.currentTiltZ = 0.0;

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            // In unfolded mode, controls remain disabled so dragging/swiping scrolls the card, NOT rotate!
            this.controls.enabled = false;
            this.controls.enableRotate = false;
            this.controls.enableZoom = false;
          }
          this.unfoldTimeline = null;
        },
      });
      this.unfoldTimeline = tl;

      // PHASE 1: Card pulls UP completely out of the envelope pocket first!
      // (Shows the user clearly that the card has emerged fully before unfolding)
      tl.to(this.modelParts.cardGroup.position, {
        y: 3.35,
        duration: 0.50,
        ease: 'power2.out',
      }, 0);

      // Align root rotation flat facing front
      tl.to(this.modelParts.root.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.65,
        ease: 'power2.inOut',
      }, 0);

      tl.to(this.modelParts.root.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.65,
        ease: 'power2.inOut',
      }, 0);

      // As the card clears the pocket rim, shift Z forward and elevate renderOrder
      tl.to(this.modelParts.cardGroup.position, {
        z: 0.45,
        duration: 0.25,
        ease: 'power2.out',
      }, 0.25);

      tl.add(() => {
        // Entire card is now 100% in front of envelope and pocket: renderOrder = 6
        this.setCardRenderOrder(6);
      }, 0.30);

      // PHASE 2: Envelope moves down into background
      tl.to(this.modelParts.envelopeGroup.position, {
        y: -5.0,
        duration: 0.95,
        ease: 'power2.inOut',
      }, 0.35);

      // Camera glides to frame reading distance looking at (0, 0, 0)
      tl.to(this.camera.position, {
        x: 0,
        y: 0,
        z: targetUnfoldZ,
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        },
      }, 0.30);

      // PHASE 3: Card glides down to center (y = 0.00) while unfolding downwards
      tl.to(this.modelParts.cardGroup.position, {
        keyframes: [
          { y: 1.60, z: 0.45, duration: 0.35, ease: 'sine.inOut' },
          { y: -0.06, z: 0.38, duration: 0.35, ease: 'sine.inOut' },
          { y: 0.00, z: 0.35, duration: 0.25, ease: 'power2.out' },
        ],
      }, 0.50);

      // Organic paper tilt flutter settling completely flat
      tl.to(this.modelParts.cardGroup.rotation, {
        keyframes: [
          { x: -0.045, y: -0.035, z: 0.028, duration: 0.40, ease: 'sine.out' },
          { x: 0.015, y: 0.020, z: -0.014, duration: 0.40, ease: 'sine.inOut' },
          { x: 0.0, y: 0.0, z: 0.0, duration: 0.30, ease: 'sine.out' },
        ],
      }, 0.50);

      // PHASE 4: Middle panel drops downward under gravity, swinging through flat
      tl.to(this.modelParts.middlePanelHinge.rotation, {
        keyframes: [
          { x: Math.PI * 0.65, z: 0.016, duration: 0.35, ease: 'power1.in' },
          { x: -0.095, z: -0.008, duration: 0.40, ease: 'power2.out' },
          { x: 0.025, z: 0.003, duration: 0.25, ease: 'sine.inOut' },
          { x: 0.0, z: 0.0, duration: 0.20, ease: 'sine.out' },
        ],
      }, 0.52);

      // Bottom panel cascading whip & unfurl
      tl.to(this.modelParts.bottomPanelHinge.rotation, {
        keyframes: [
          { x: -Math.PI * 0.92, z: -0.015, duration: 0.25, ease: 'power1.in' },
          { x: -Math.PI * 0.35, z: 0.022, duration: 0.35, ease: 'power2.in' },
          { x: 0.120, z: -0.012, duration: 0.35, ease: 'power2.out' },
          { x: -0.035, z: 0.004, duration: 0.22, ease: 'sine.inOut' },
          { x: 0.0, z: 0.0, duration: 0.18, ease: 'sine.out' },
        ],
      }, 0.62);
    } else {
      // 2. FOLD BACK INTO NESTLED ENVELOPE:
      this.targetScrollY = 0;
      this.currentScrollY = 0;
      this.targetTiltY = 0;
      this.currentTiltY = 0;
      this.targetTiltZ = 0;
      this.currentTiltZ = 0;

      const targetZ = this.calculateCameraDistance(width, height);

      const tl = gsap.timeline({
        onComplete: () => {
          if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            this.controls.enableRotate = true;
            this.controls.enableZoom = true;
            this.controls.enabled = true;
          }
          this.unfoldTimeline = null;
        },
      });
      this.unfoldTimeline = tl;

      // PHASE 1: Card folds up while rising to hover above the envelope opening
      tl.to(this.modelParts.cardGroup.position, {
        y: 3.35,
        z: 0.45,
        duration: 0.50,
        ease: 'power2.out',
      }, 0);

      tl.to(this.modelParts.cardGroup.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.50,
        ease: 'power2.out',
      }, 0);

      // Step 1a: Bottom panel flips up first with natural paper snap
      tl.to(this.modelParts.bottomPanelHinge.rotation, {
        keyframes: [
          { x: -Math.PI * 0.40, z: 0.015, duration: 0.28, ease: 'power1.in' },
          { x: -Math.PI * 1.04, z: -0.005, duration: 0.25, ease: 'power2.out' },
          { x: -Math.PI, z: 0.0, duration: 0.15, ease: 'sine.inOut' },
        ],
      }, 0);

      // Step 1b: Middle panel folds up behind top panel
      tl.to(this.modelParts.middlePanelHinge.rotation, {
        keyframes: [
          { x: Math.PI * 0.45, z: -0.015, duration: 0.30, ease: 'power1.in' },
          { x: Math.PI * 1.03, z: 0.005, duration: 0.28, ease: 'power2.out' },
          { x: Math.PI, z: 0.0, duration: 0.15, ease: 'sine.inOut' },
        ],
      }, 0.15);

      // Envelope moves back to center & camera returns
      tl.to(this.modelParts.envelopeGroup.position, {
        y: 0,
        duration: 0.70,
        ease: 'power2.inOut',
      }, 0.10);

      tl.to(this.modelParts.root.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.70,
        ease: 'power2.inOut',
      }, 0.10);

      tl.to(this.camera.position, {
        x: 0,
        y: 0,
        z: targetZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        },
      }, 0.10);

      // PHASE 2: Once folded into 1 panel hovering directly above envelope opening,
      // align with the pocket slot, switch renderOrder to 4, and slide DOWN into pocket!
      tl.to(this.modelParts.cardGroup.position, {
        z: 0.010,
        duration: 0.20,
        ease: 'sine.inOut',
      }, 0.50);

      tl.add(() => {
        // Entering pocket: switch back to renderOrder 4 so backPocketMesh (5) occludes lower portion
        this.setCardRenderOrder(4);
      }, 0.58);

      // Slides smoothly down inside the pocket to nestled position (y = 0.88)
      tl.to(this.modelParts.cardGroup.position, {
        y: 0.88,
        duration: 0.65,
        ease: 'power2.inOut',
      }, 0.50);

      tl.to(this.camera.position, {
        x: 0,
        y: 0,
        z: targetZ,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        },
      }, 0.35);
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
   * Calculates the exact camera Z distance when the card is unfolded into 3 panels.
   * On portrait/mobile displays, the card occupies ~95.5% of the visible screen width,
   * leaving very little margins on the left and right sides so the invitation is prominent and easy to read.
   */
  public calculateUnfoldCameraDistance(width: number, height: number): number {
    const aspect = width / height;
    const fovInRad = (this.camera.fov * Math.PI) / 180;
    const halfFovTan = Math.tan(fovInRad / 2);
    const cardW = 4.0;
    const cardZ = 0.35; // cardGroup is at z = 0.35 when unfolded

    // On portrait / mobile displays (aspect < 0.92):
    // Target: Card occupies 95.5% (0.955) of screen width (very minimal side margins)
    const desiredPortraitWidthRatio = 0.955;
    const zForCardWidth = cardZ + cardW / (desiredPortraitWidthRatio * 2 * halfFovTan * aspect);

    // On landscape / desktop displays (aspect >= 0.92):
    // Single page height takes ~88% of screen height so it fits comfortably without vertical clipping
    const cardH = 3.0;
    const desiredDesktopHeightRatio = 0.88;
    const zForPanelHeight = cardZ + cardH / (desiredDesktopHeightRatio * 2 * halfFovTan);

    if (aspect < 0.92) {
      return zForCardWidth;
    }
    return Math.max(zForCardWidth, zForPanelHeight);
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

    // 3D vertical scrolling & subtle interactive 3D tilt when card is unfolded into 3 pages:
    if (this.isUnfolded && !this.unfoldTimeline) {
      if (!this.isTouchScrolling && !this.isPointerScrolling) {
        this.targetScrollY = Math.max(0, Math.min(6.0, this.targetScrollY));
        this.targetTiltY = 0;
        this.targetTiltZ = 0;
      }
      this.currentScrollY += (this.targetScrollY - this.currentScrollY) * 0.12;
      this.modelParts.cardGroup.position.y = this.currentScrollY;

      // Smooth damping / spring-back for subtle 3D tilt on horizontal drag
      this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.10;
      this.currentTiltZ += (this.targetTiltZ - this.currentTiltZ) * 0.10;
      this.modelParts.cardGroup.rotation.y = this.currentTiltY;
      this.modelParts.cardGroup.rotation.z = this.currentTiltZ;
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
    this.camera.updateProjectionMatrix();

    if (this.isUnfolded) {
      const targetUnfoldZ = this.calculateUnfoldCameraDistance(width, height);
      this.camera.position.set(0, 0, targetUnfoldZ);
      this.camera.lookAt(0, 0, 0);
    } else {
      const newTargetZ = this.calculateCameraDistance(width, height);
      if (this.controls) {
        this.camera.position.setLength(newTargetZ);
        this.controls.minDistance = Math.min(3.5, newTargetZ * 0.4);
        this.controls.maxDistance = Math.max(26.0, newTargetZ * 2.0);
        this.controls.update();
      } else {
        this.camera.position.z = newTargetZ;
      }
    }

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public dispose(): void {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

    const dom = this.renderer.domElement;
    dom.removeEventListener('wheel', this.onWheel);
    dom.removeEventListener('touchstart', this.onTouchStart);
    dom.removeEventListener('touchmove', this.onTouchMove);
    dom.removeEventListener('touchend', this.onTouchEnd);
    dom.removeEventListener('touchcancel', this.onTouchEnd);
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

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
    if (this.cardPage2ArtworkTexture) this.cardPage2ArtworkTexture.dispose();
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
