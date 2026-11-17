import * as THREE from 'three';
import { ENVELOPE_CONFIG } from '@/config/envelope';
import type { InvitationLanguage } from '@/types/invitation';

export interface GuestNameTextureOptions {
  displayName: string;
  category: string;
  language?: InvitationLanguage;
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

    if (typeof document !== 'undefined') {
      // Explicitly load the user's custom Bengali font for Canvas 2D
      try {
        const shobujFont = new FontFace(
          'Li Shobuj Nolua Unicode',
          'url("/fonts/Li%20Shobuj%20Nolua%20Unicode.ttf")'
        );
        shobujFont
          .load()
          .then((loaded) => {
            document.fonts.add(loaded);
            this.update(options);
          })
          .catch(() => {});
      } catch {
        // Fallback if FontFace constructor is unavailable
      }

      if (document.fonts) {
        Promise.all([
          document.fonts.load('600 120px "Dancing Script"'),
          document.fonts.load('600 120px "Caveat"'),
          document.fonts.load('600 120px "Li Shobuj Nolua Unicode"'),
          document.fonts.load('600 120px "Noto Serif Bengali"'),
          document.fonts.ready,
        ])
          .then(() => {
            this.update(options);
          })
          .catch(() => {
            this.update(options);
          });
      }
    }

    this.update(options);
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  private parseLines(displayName: string): string[] {
    const rawSegments = displayName
      .split(/\s*(?:&|\band\b|\bwith\b|\+|\n|,|(?<=\s)ও(?=\s))\s*/i)
      .map((s) => s.trim())
      .filter(Boolean);

    return rawSegments.length > 0 ? rawSegments : [displayName];
  }

  public update({ displayName, category = 'general', language = 'en' }: GuestNameTextureOptions): void {
    const { width, height } = this.canvas;
    const isBengali = language === 'bn';

    this.ctx.clearRect(0, 0, width, height);

    const lines = this.parseLines(displayName);

    this.ctx.save();

    // Soft warm crimson red ink
    this.ctx.fillStyle = '#8a2b34';

    // Shifted slightly to the left: 50% across the width
    const targetCenterX = width * 0.50;
    const targetCenterY = height * 0.50;

    let fontSize = 118;
    if (lines.length === 1) {
      fontSize = 134;
    } else if (lines.length > 2) {
      fontSize = 98;
    }

    for (const line of lines) {
      if (line.length > 18) {
        fontSize = Math.min(fontSize, 92);
      } else if (line.length > 14) {
        fontSize = Math.min(fontSize, 106);
      }
    }

    // Custom Li Shobuj Nolua font for Bengali envelope names, handwriting script for English
    const handwritingFont = isBengali
      ? '"Li Shobuj Nolua Unicode", "Li Shobuj Nolua", "Noto Serif Bengali", serif'
      : '"Dancing Script", "Caveat", "Marck Script", "Segoe Script", cursive';
    this.ctx.font = `600 ${fontSize}px ${handwritingFont}`;

    const lineHeight = fontSize * 1.25;
    const totalNamesHeight = (lines.length - 1) * lineHeight;

    // Measure maximum name width to accurately determine the left edge of the block
    let maxNameWidth = 0;
    lines.forEach((line) => {
      const metrics = this.ctx.measureText(line);
      if (metrics.width > maxNameWidth) {
        maxNameWidth = metrics.width;
      }
    });

    const blockLeftX = targetCenterX - maxNameWidth / 2;
    const namesStartY = targetCenterY - totalNamesHeight / 2 + 20;

    // 1. "To.." or "প্রতি.." label
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    const toFontSize = Math.round(fontSize * 0.44);
    const toLabel = isBengali ? 'প্রতি..' : 'To..';
    const toFont = isBengali
      ? `normal 600 ${toFontSize}px "Li Shobuj Nolua Unicode", "Li Shobuj Nolua", "Noto Serif Bengali", serif`
      : `normal 500 ${toFontSize}px "Cinzel", "Playfair Display", "Georgia", "Times New Roman", serif`;
    this.ctx.font = toFont;
    // Generous breathing space (gap) between "To.." and the first name
    const toY = namesStartY - fontSize * 0.85;
    this.ctx.fillText(toLabel, blockLeftX, toY);

    // 2. Guest Names rendered below
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `600 ${fontSize}px ${handwritingFont}`;

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
