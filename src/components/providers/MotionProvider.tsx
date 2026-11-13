'use client';

import React, { createContext, useContext } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface MotionContextValue {
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextValue>({ reducedMotion: false });

export function useMotionContext() {
  return useContext(MotionContext);
}

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const reducedMotion = useReducedMotion();

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionContext.Provider>
  );
}
