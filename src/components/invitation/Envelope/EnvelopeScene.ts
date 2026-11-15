import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  private materials: EnvelopeMaterialsMap;
  private modelParts: EnvelopeModelParts;
  private isDisposed = false;
  private animationFrameId: number | null = null;

  constructor(options: EnvelopeSceneOptions) {
    this.container = options.container;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera tailored for mobile screen aspect ratios
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const { fov, near, far } = ENVELOPE_CONFIG.camera;

    const isMobile = width < 640;
    const initialZ = isMobile ? 7.6 : 6.8;

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

    // 4. Lights positioned for realistic warm paper reflection
    this.setupLighting();

    // 5. Guest Name Texture mapped to envelope front
    this.guestTexture = new GuestNameTexture({
      displayName: options.guestName,
      category: options.category,
    });

    // 6. Load front envelope artwork texture
    const textureLoader = new THREE.TextureLoader();
    this.frontArtworkTexture = textureLoader.load(
      ENVELOPE_CONFIG.materials.frontTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        if (this.materials.paperFrontArt) {
          this.materials.paperFrontArt.map = tex;
          this.materials.paperFrontArt.needsUpdate = true;
        }
      }
    );

    // 7. Materials & 3D Model
    this.materials = createEnvelopeMaterials(
      this.guestTexture.getTexture(),
      this.frontArtworkTexture
    );
    this.modelParts = createEnvelopeModel(this.materials);
    this.scene.add(this.modelParts.root);

    // 8. Interactive rotation & zoom (mouse wheel scroll + mobile pinch-to-zoom)
    if (options.interactiveRotation !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;

      // Enable zoom for both mouse wheel and touch-screen pinch
      this.controls.enableZoom = true;
      this.controls.zoomSpeed = 1.2;
      this.controls.minDistance = 3.5; // Closest zoom in
      this.controls.maxDistance = 14.0; // Furthest zoom out

      this.controls.enablePan = false; // keep envelope centered
      this.controls.rotateSpeed = 0.95;

      // Allow rotating up/down moderately
      this.controls.minPolarAngle = Math.PI / 4;        // ~45 deg
      this.controls.maxPolarAngle = (3 * Math.PI) / 4;  // ~135 deg

      // Allow full 360° horizontal rotation
      this.controls.minAzimuthAngle = -Infinity;
      this.controls.maxAzimuthAngle = Infinity;
    }

    // 9. Event listeners
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 10. Start continuous loop for smooth damping rotation & zooming
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

    // Direct front lighting to illuminate the artwork vibrantly
    const frontFillLight = new THREE.DirectionalLight('#fff5ea', 1.1);
    frontFillLight.position.set(0, 0, -6);
    this.scene.add(frontFillLight);

    const rimLight = new THREE.DirectionalLight('#fef3c7', 0.6);
    rimLight.position.set(-2, -3, 5);
    this.scene.add(rimLight);
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
    this.camera.position.z = isMobile ? 7.6 : 6.8;
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
    if (this.frontArtworkTexture) {
      this.frontArtworkTexture.dispose();
    }
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
