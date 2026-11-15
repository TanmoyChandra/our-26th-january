import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface GuestNameTextureOptions {
  displayName: string;
  category: string;
}

/**
 * Creates and updates a high-resolution CanvasTexture containing the personalized guest name.
 * Supports Indian script / Unicode fonts with high crispness and correct anisotropic filtering.
 */
export class GuestNameTexture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;

  constructor(options: GuestNameTextureOptions) {
    const { canvasWidth, canvasHeight } = ENVELOPE_CONFIG.guestName;
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire 2D canvas context for GuestNameTexture');
    }
    this.ctx = context;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.update(options);
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  /**
   * Redraws the guest name on the canvas and triggers texture update.
   */
  public update({ displayName, category }: GuestNameTextureOptions): void {
    const { width, height } = this.canvas;
    const cfg = ENVELOPE_CONFIG.guestName;

    this.ctx.clearRect(0, 0, width, height);

    // Subtle fine border frame on envelope front
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(191, 160, 104, 0.35)'; // gold trim
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(30, 30, width - 60, height - 60);

    // Corner decorative accents
    const cornerSize = 18;
    this.ctx.fillStyle = 'rgba(191, 160, 104, 0.6)';
    // Top-left
    this.ctx.fillRect(26, 26, cornerSize, 3);
    this.ctx.fillRect(26, 26, 3, cornerSize);
    // Top-right
    this.ctx.fillRect(width - 26 - cornerSize, 26, cornerSize, 3);
    this.ctx.fillRect(width - 29, 26, 3, cornerSize);
    // Bottom-left
    this.ctx.fillRect(26, height - 29, cornerSize, 3);
    this.ctx.fillRect(26, height - 26 - cornerSize, 3, cornerSize);
    // Bottom-right
    this.ctx.fillRect(width - 26 - cornerSize, height - 29, cornerSize, 3);
    this.ctx.fillRect(width - 29, height - 26 - cornerSize, 3, cornerSize);

    // Center alignment
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Subtitle / Label
    this.ctx.font = `italic ${cfg.subfontSize}px "Georgia", serif`;
    this.ctx.fillStyle = cfg.subtextColor;
    this.ctx.fillText('Personal Invitation For', width / 2, height / 2 - 50);

    // Primary Guest Name (handles Unicode / long names)
    let fontSize = cfg.fontSize;
    if (displayName.length > 22) {
      fontSize = Math.floor(cfg.fontSize * 0.75);
    } else if (displayName.length > 15) {
      fontSize = Math.floor(cfg.fontSize * 0.88);
    }

    this.ctx.font = `${cfg.fontWeight} ${fontSize}px ${cfg.fontFamily}`;
    this.ctx.fillStyle = cfg.textColor;
    this.ctx.fillText(displayName, width / 2, height / 2 + 10);

    // Category / Tag
    const categoryLabel = category === 'family' ? '— FAMILY INVITATION —' : '— CORDIAL INVITATION —';
    this.ctx.font = `500 16px "Inter", "Helvetica", sans-serif`;
    this.ctx.fillStyle = 'rgba(143, 131, 119, 0.85)';
    this.ctx.letterSpacing = '0.18em';
    this.ctx.fillText(categoryLabel, width / 2, height / 2 + 65);

    this.ctx.restore();

    this.texture.needsUpdate = true;
  }

  public dispose(): void {
    this.texture.dispose();
  }
}

