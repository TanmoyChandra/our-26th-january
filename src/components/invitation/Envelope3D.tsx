'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EnvelopeScene } from './Envelope/EnvelopeScene';

export interface Envelope3DRef {
  setProgress?: (progress: number) => void;
  updateGuest: (name: string, category: string) => void;
  toggleOpen: () => boolean;
  getIsOpen: () => boolean;
  toggleUnfold: () => boolean;
  getIsUnfolded: () => boolean;
  isAnimating: () => boolean;
  getScrollProgress?: () => number;
  getScrollPage?: () => number;
}

interface Envelope3DProps {
  guestName: string;
  category: string;
  className?: string;
  onReady?: () => void;
  onAnimationChange?: (isAnimating: boolean) => void;
}

export const Envelope3D = forwardRef<Envelope3DRef, Envelope3DProps>(
  ({ guestName, category, className = '', onReady, onAnimationChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<EnvelopeScene | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        updateGuest: (name: string, cat: string) => {
          sceneRef.current?.updateGuest(name, cat);
        },
        toggleOpen: () => {
          return sceneRef.current ? sceneRef.current.toggleOpen() : false;
        },
        getIsOpen: () => {
          return sceneRef.current ? sceneRef.current.getIsOpen() : false;
        },
        toggleUnfold: () => {
          return sceneRef.current ? sceneRef.current.toggleUnfold() : false;
        },
        getIsUnfolded: () => {
          return sceneRef.current ? sceneRef.current.getIsUnfolded() : false;
        },
        isAnimating: () => {
          return sceneRef.current ? sceneRef.current.getIsAnimating() : false;
        },
        getScrollProgress: () => {
          return sceneRef.current ? sceneRef.current.getScrollProgress() : 0;
        },
        getScrollPage: () => {
          return sceneRef.current ? sceneRef.current.getScrollPage() : 1;
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
        onAnimationChange,
      });
      sceneRef.current = scene;

      onReady?.();

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
    }, [guestName, category, onReady, onAnimationChange]);

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
