'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EnvelopeScene } from './Envelope/EnvelopeScene';

export interface Envelope3DRef {
  setProgress?: (progress: number) => void;
  updateGuest: (name: string, category: string) => void;
}

interface Envelope3DProps {
  guestName: string;
  category: string;
  className?: string;
  onReady?: () => void;
}

export const Envelope3D = forwardRef<Envelope3DRef, Envelope3DProps>(
  ({ guestName, category, className = '', onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<EnvelopeScene | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        updateGuest: (name: string, cat: string) => {
          sceneRef.current?.updateGuest(name, cat);
        },
      }),
      []
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new EnvelopeScene({
        container,
        guestName,
        category,
        interactiveRotation: true,
      });
      sceneRef.current = scene;

      onReady?.();

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
    }, [guestName, category, onReady]);

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
        style={{ touchAction: 'none' }}
        data-envelope-3d
      />
    );
  }
);

Envelope3D.displayName = 'Envelope3D';
