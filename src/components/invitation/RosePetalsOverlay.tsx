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

const PETAL_COUNT = 45;

/**
 * RosePetalsOverlay
 * Renders a slow, dreamy cascade of delicate pink rose petals gently drifting
 * down from the top across the entire invitation screen.
 */
export function RosePetalsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Rich, romantic pink rose color palettes
    const petalColors = [
      {
        inner: '#fff1f2',
        mid: '#fbcfe8',
        outer: '#f472b6',
        edge: '#db2777',
      },
      {
        inner: '#ffe4e6',
        mid: '#fda4af',
        outer: '#fb7185',
        edge: '#e11d48',
      },
      {
        inner: '#ffffff',
        mid: '#fce7f3',
        outer: '#f43f5e',
        edge: '#be123c',
      },
      {
        inner: '#fff5f7',
        mid: '#f9a8d4',
        outer: '#ec4899',
        edge: '#9d174d',
      },
      {
        inner: '#ffeef2',
        mid: '#fecdd3',
        outer: '#f43f5e',
        edge: '#881337',
      },
    ];

    // Helper to generate a single petal
    const createPetal = (initialY?: number): Petal => ({
      x: Math.random() * width,
      y: initialY !== undefined ? initialY : -40 - Math.random() * 80,
      size: 16 + Math.random() * 16, // 16px to 32px: clearly visible and identifiable
      speedY: 0.45 + Math.random() * 0.55, // Very slow, peaceful fall speed
      speedX: (Math.random() - 0.5) * 0.4,
      swaySpeed: 0.01 + Math.random() * 0.015,
      swayAmplitude: 0.8 + Math.random() * 1.5,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.015 + Math.random() * 0.025,
      opacity: 0.75 + Math.random() * 0.22,
      variant: Math.floor(Math.random() * petalColors.length),
    });

    // Distribute petals across the viewport initially so petals are visible immediately
    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () =>
      createPetal(Math.random() * height)
    );

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Motion physics: slow gentle downward drift with lateral breeze sway
        p.swayPhase += p.swaySpeed;
        p.x += Math.sin(p.swayPhase) * p.swayAmplitude + p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Recycle when drifted past bottom or sides
        if (p.y > height + 45) {
          petals[i] = createPetal(-35);
          continue;
        }
        if (p.x < -50) p.x = width + 30;
        else if (p.x > width + 50) p.x = -30;

        // 3D tumbling perspective
        const scaleX = Math.max(0.18, Math.abs(Math.cos(p.flip)));
        const s = p.size;
        const col = petalColors[p.variant];

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(scaleX, 1);
        ctx.globalAlpha = p.opacity;

        // Subtle drop shadow for depth against 3D envelope and background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        // Organic curved rose petal silhouette
        ctx.beginPath();
        ctx.moveTo(0, s * 0.85); // Stem base
        ctx.bezierCurveTo(-s * 0.75, s * 0.45, -s * 0.85, -s * 0.35, -s * 0.35, -s * 0.85);
        ctx.bezierCurveTo(-s * 0.1, -s * 0.98, s * 0.1, -s * 0.98, s * 0.35, -s * 0.85);
        ctx.bezierCurveTo(s * 0.85, -s * 0.35, s * 0.75, s * 0.45, 0, s * 0.85);
        ctx.closePath();

        // Radial shading with luminous creamy center and velvet pink/rose edges
        const grad = ctx.createRadialGradient(
          -s * 0.12,
          -s * 0.25,
          s * 0.05,
          0,
          0,
          s * 0.95
        );
        grad.addColorStop(0, col.inner);
        grad.addColorStop(0.35, col.mid);
        grad.addColorStop(0.8, col.outer);
        grad.addColorStop(1, col.edge);

        ctx.fillStyle = grad;
        ctx.fill();

        // Soft delicate petal vein highlight
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.moveTo(0, s * 0.75);
        ctx.quadraticCurveTo(-s * 0.05, 0, 0, -s * 0.65);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full select-none"
      style={{ zIndex: 25 }}
      aria-hidden="true"
    />
  );
}
