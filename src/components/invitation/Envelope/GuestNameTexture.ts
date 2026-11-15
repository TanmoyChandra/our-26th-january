import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';

export interface GuestNameTextureOptions {
  displayName: string;
  category: string;
}

/**
 * Creates and updates a high-resolution CanvasTexture containing:
 * - "To.." written in elegant cursive / serif script, left-aligned at the top of the names block.
 * - The guest names rendered below in cursive script.
 * - "To.." in a clean, elegant normal serif font (non-cursive), left-aligned.
 * - The guest names in flowing cursive script below.
 * - Entire block positioned nicely to the left in the open envelope area.
 */
export class GuestNameTexture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;

  constructor(options: GuestNameTextureOptions) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 2048;
    this.canvas.height = 1286;

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

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        this.update(options);
      });
    }

    this.update(options);
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  private parseLines(displayName: string): string[] {
    const rawSegments = displayName
      .split(/\s*(?:&|\band\b|\bwith\b|\+|\n|,)\s*/i)
      .map((s) => s.trim())
      .filter(Boolean);

    return rawSegments.length > 0 ? rawSegments : [displayName];
  }

  public update({ displayName }: GuestNameTextureOptions): void {
    const { width, height } = this.canvas;

    this.ctx.clearRect(0, 0, width, height);

    const lines = this.parseLines(displayName);

    this.ctx.save();

    // Soft warm crimson red ink
    this.ctx.fillStyle = '#8a2b34';

    // Shifted slightly to the left: 48% across the width
    const targetCenterX = width * 0.50;
    const targetCenterY = height * 0.50;

    let fontSize = 104;
    if (lines.length === 1) {
      fontSize = 120;
    } else if (lines.length > 2) {
      fontSize = 86;
    }

    for (const line of lines) {
      if (line.length > 18) {
        fontSize = Math.min(fontSize, 82);
      } else if (line.length > 14) {
        fontSize = Math.min(fontSize, 94);
      }
    }

    const cursiveFont = '"Great Vibes", "Alex Brush", "Snell Roundhand", "Apple Chancery", cursive';
    this.ctx.font = `normal ${fontSize}px ${cursiveFont}`;

    const lineHeight = fontSize * 1.16;
    const totalNamesHeight = (lines.length - 1) * lineHeight;

    // Measure maximum name width to accurately determine the left edge of the block
    // Measure maximum name width to find the left boundary
    let maxNameWidth = 0;
    lines.forEach((line) => {
      const metrics = this.ctx.measureText(line);
      if (metrics.width > maxNameWidth) {
        maxNameWidth = metrics.width;
      }
    });

    const blockLeftX = targetCenterX - maxNameWidth / 2;
    const namesStartY = targetCenterY - totalNamesHeight / 2 + 20;

    // 1. "To.." in clean, normal serif font (non-cursive, left-aligned)
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    const toFontSize = Math.round(fontSize * 0.48);
    this.ctx.font = `normal 500 ${toFontSize}px "Cinzel", "Playfair Display", "Georgia", "Times New Roman", serif`;
    // Generous breathing space (gap) between "To.." and the first name
    const toY = namesStartY - fontSize * 0.85;
    this.ctx.fillText('To..', blockLeftX, toY);

    // 2. Guest Names rendered below in cursive script
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `normal ${fontSize}px ${cursiveFont}`;

    lines.forEach((line, index) => {
      const y = namesStartY + index * lineHeight;
      this.ctx.fillText(line, targetCenterX, y);
    });

    this.ctx.restore();

    this.texture.needsUpdate = true;
  }

  public dispose(): void {
    this.texture.dispose();
  }
}
