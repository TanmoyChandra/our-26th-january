'use client';

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayPhase: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  variant: number;
}

const PETAL_COUNT = 32;

/**
 * RosePetalsOverlay
 * Renders a slow, romantic cascade of delicate pink rose petals drifting down across the screen.
 * Respects reduced-motion preferences, has zero layout shift, and pointer-events: none.
 */
export function RosePetalsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color definitions for rose petal variants
    const petalColors = [
      {
        inner: '#fff1f2',
        mid: '#fbcfe8',
        outer: '#f472b6',
        shadow: '#e11d48',
      },
      {
        inner: '#ffe4e6',
        mid: '#fda4af',
        outer: '#fb7185',
        shadow: '#be123c',
      },
      {
        inner: '#ffffff',
        mid: '#fce7f3',
        outer: '#f43f5e',
        shadow: '#9f1239',
      },
      {
        inner: '#fff0f3',
        mid: '#f9a8d4',
        outer: '#ec4899',
        shadow: '#db2777',
      },
    ];

    // Helper to generate a petal
    const createPetal = (initialY?: number): Petal => ({
      x: Math.random() * width,
      y: initialY !== undefined ? initialY : -30 - Math.random() * 50,
      size: 10 + Math.random() * 11, // 10px to 21px
      speedY: 0.35 + Math.random() * 0.45, // Serene slow fall (0.35 to 0.80 px/frame)
      speedX: (Math.random() - 0.5) * 0.3,
      swaySpeed: 0.008 + Math.random() * 0.012,
      swayAmplitude: 0.8 + Math.random() * 1.4,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.01 + Math.random() * 0.02,
      opacity: 0.65 + Math.random() * 0.28,
      variant: Math.floor(Math.random() * petalColors.length),
    });

    // Populate petals distributed across the screen initially so they don't all appear from the top at once
    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () =>
      createPetal(Math.random() * height)
    );

    let animationFrameId: number;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Motion update
        p.swayPhase += p.swaySpeed;
        p.x += Math.sin(p.swayPhase) * p.swayAmplitude + p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Reset if drifted past bottom or sides
        if (p.y > height + 35) {
          petals[i] = createPetal(-25);
          continue;
        }
        if (p.x < -40) p.x = width + 20;
        else if (p.x > width + 40) p.x = -20;

        // 3D Tumbling projection: flip determines scaleX
        const scaleX = Math.cos(p.flip);
        const scaleY = 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = p.opacity * Math.max(0.25, Math.abs(scaleX));

        const s = p.size;
        const col = petalColors[p.variant];

        // Draw organic curved rose petal path
        ctx.beginPath();
        ctx.moveTo(0, s * 0.85); // Stem base
        ctx.bezierCurveTo(-s * 0.75, s * 0.45, -s * 0.85, -s * 0.35, -s * 0.35, -s * 0.85);
        ctx.bezierCurveTo(-s * 0.1, -s * 0.98, s * 0.1, -s * 0.98, s * 0.35, -s * 0.85);
        ctx.bezierCurveTo(s * 0.85, -s * 0.35, s * 0.75, s * 0.45, 0, s * 0.85);
        ctx.closePath();

        // Shading: Radial soft gradient with glowing center and deeper rose edge
        const grad = ctx.createRadialGradient(
          -s * 0.12,
          -s * 0.25,
          s * 0.08,
          0,
          0,
          s * 0.95
        );
        grad.addColorStop(0, col.inner);
        grad.addColorStop(0.35, col.mid);
        grad.addColorStop(0.85, col.outer);
        grad.addColorStop(1, col.shadow);

        ctx.fillStyle = grad;
        ctx.fill();

        // Delicate spine / vein highlight
        ctx.beginPath();
        ctx.moveTo(0, s * 0.75);
        ctx.quadraticCurveTo(-s * 0.05, 0, 0, -s * 0.65);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-25 w-full h-full select-none"
      aria-hidden="true"
    />
  );
}
