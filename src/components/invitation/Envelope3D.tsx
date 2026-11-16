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
  scrollNext: () => void;
}

interface Envelope3DProps {
  guestName: string;
  category: string;
  className?: string;
  onReady?: () => void;
  onAnimationChange?: (isAnimating: boolean) => void;
  onUnfoldChange?: (isUnfolded: boolean) => void;
  onScrollChange?: (progress: number, page: number) => void;
}

export const Envelope3D = forwardRef<Envelope3DRef, Envelope3DProps>(
  (
    {
      guestName,
      category,
      className = '',
      onReady,
      onAnimationChange,
      onUnfoldChange,
      onScrollChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<EnvelopeScene | null>(null);
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    // Keep latest callbacks in ref so scene callbacks never trigger re-instantiation
    const callbacksRef = useRef({
      onAnimationChange,
      onUnfoldChange,
      onScrollChange,
    });
    callbacksRef.current = {
      onAnimationChange,
      onUnfoldChange,
      onScrollChange,
    };

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
        scrollNext: () => {
          sceneRef.current?.scrollNext();
        },
      }),
      []
    );

    // Initialize 3D Scene once on mount
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new EnvelopeScene({
        container,
        guestName,
        category,
        interactiveRotation: true,
        onAnimationChange: (animating) => {
          callbacksRef.current.onAnimationChange?.(animating);
        },
        onUnfoldChange: (unfolded) => {
          callbacksRef.current.onUnfoldChange?.(unfolded);
        },
        onScrollChange: (progress, page) => {
          callbacksRef.current.onScrollChange?.(progress, page);
        },
      });
      sceneRef.current = scene;

      onReadyRef.current?.();

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dynamically update guest name and category without re-creating scene
    useEffect(() => {
      if (sceneRef.current) {
        sceneRef.current.updateGuest(guestName, category);
      }
    }, [guestName, category]);

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
