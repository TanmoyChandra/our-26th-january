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

    // Adjust camera distance for mobile portrait view so envelope fills screen nicely
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
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    // 4. Lights positioned to create authentic paper shadow creases
    this.setupLighting();

    // 5. Guest Name Texture mapped to envelope front
    this.guestTexture = new GuestNameTexture({
      displayName: options.guestName,
      category: options.category,
    });

    // 6. Materials & 3D Model
    // 6. Materials & 3D Model matching reference photo
    this.materials = createEnvelopeMaterials(this.guestTexture.getTexture());
    this.modelParts = createEnvelopeModel(this.materials);
    this.scene.add(this.modelParts.root);

    // 7. Interactive touch/drag rotation with OrbitControls
    // 7. Full 360 degree interactive touch/drag rotation with OrbitControls
    if (options.interactiveRotation !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.enableZoom = false; // keep mobile viewport stable
      this.controls.enablePan = false;  // keep envelope centered
      this.controls.rotateSpeed = 0.85;
      this.controls.rotateSpeed = 0.95;

      // Restrict vertical polar angle so it stays aesthetically upright
      this.controls.minPolarAngle = Math.PI / 4;      // ~45 deg
      // Allow rotating up/down moderately
      this.controls.minPolarAngle = Math.PI / 4;        // ~45 deg
      this.controls.maxPolarAngle = (3 * Math.PI) / 4;  // ~135 deg

      // Restrict horizontal azimuth angle so user doesn't flip it upside down
      this.controls.minAzimuthAngle = -Math.PI / 1.8;
      this.controls.maxAzimuthAngle = Math.PI / 1.8;
      // Allow full 360° horizontal rotation so user can view both the folded back and the plain front!
      this.controls.minAzimuthAngle = -Infinity;
      this.controls.maxAzimuthAngle = Infinity;
    }

    // 8. Event listeners
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 9. Start continuous loop for smooth damping rotation
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting(): void {
    const { lighting } = ENVELOPE_CONFIG;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      lighting.ambientColor,
      lighting.ambientIntensity
    );
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
    // Main directional light casting subtle crease shadows over flaps
    const mainLight = new THREE.DirectionalLight(
      lighting.directionalColor,
      lighting.directionalIntensity
    );
    dirLight.position.set(...lighting.directionalPosition);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);
    mainLight.position.set(2, 4, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0002;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(
      lighting.fillColor,
      lighting.fillIntensity
    );
    fillLight.position.set(...lighting.fillPosition);
    this.scene.add(fillLight);
    // Secondary rim/fill light for the plain front side when rotated
    const rimLight = new THREE.DirectionalLight('#fef3c7', 0.9);
    rimLight.position.set(-2, -3, -5);
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
