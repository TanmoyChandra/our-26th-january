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
  private materials: EnvelopeMaterialsMap;
  private modelParts: EnvelopeModelParts;
  private isDisposed = false;
  private animationFrameId: number | null = null;
  private isOpen = false;

  constructor(options: EnvelopeSceneOptions) {
    this.container = options.container;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera tailored for mobile screen aspect ratios
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const { fov, near, far } = ENVELOPE_CONFIG.camera;

    const isMobile = width < 640;
    const initialZ = isMobile ? 8.2 : 7.2;

    this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
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

    // 7. Materials & 3D Model
    this.materials = createEnvelopeMaterials(
      this.guestTexture.getTexture(),
      this.frontArtworkTexture,
      this.pocketArtworkTexture,
      this.flapArtworkTexture
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
      this.controls.minDistance = 3.5;
      this.controls.maxDistance = 14.0;
      this.controls.enablePan = false;
      this.controls.rotateSpeed = 0.95;

      this.controls.minPolarAngle = Math.PI / 4;
      this.controls.maxPolarAngle = (3 * Math.PI) / 4;
      this.controls.minAzimuthAngle = -Infinity;
      this.controls.maxAzimuthAngle = Infinity;
    }

    // 9. Event listeners
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 10. Start render loop
    this.animate = this.animate.bind(this);
    this.animate();
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

    // Smoothly orient to the back face where the opening action happens
    gsap.to(this.modelParts.root.rotation, {
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });

    if (this.isOpen) {
      // 1. OPENING SEQUENCE:
      // STRICT ORDER: First the envelope opens completely. THEN the paper comes out.
      const targetFlapAngle = -Math.PI * 1.06;
      const targetFlapZ = -0.012;
      const targetCardY = 1.75;
      const targetCardZ = 0.015;

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
    } else {
      // 2. CLOSING SEQUENCE:
      // STRICT ORDER: First paper card slides completely inside, THEN flap closes over it.
      const tl = gsap.timeline();

      // Step 1: Paper slides all the way back down into the envelope first
      tl.to(this.modelParts.cardGroup.position, {
        y: 0,
        z: 0.010,
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
        z: 0.023,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          // Flap is now closed over the pocket on top
          this.modelParts.topFlapMesh.renderOrder = 5;
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

  private animate(): void {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    const isMobile = width < 640;
    this.camera.position.z = isMobile ? 8.2 : 7.2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public dispose(): void {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

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
