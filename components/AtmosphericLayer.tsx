'use client';

import { useEffect, useRef } from 'react';
import { useMousePositionRef } from '@/hooks/useMousePosition';
import '@/components/AtmosphericLayer.css';

interface AtmosphericLayerProps {
  entranceComplete: boolean;
}

export function AtmosphericLayer({ entranceComplete }: AtmosphericLayerProps) {
  const { smoothRef, isTouchDevice } = useMousePositionRef();
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouchDevice) return;

    let rafId: number;
    const updateGlow = () => {
      if (glowRef.current) {
        glowRef.current.style.left = `${smoothRef.current.x}px`;
        glowRef.current.style.top = `${smoothRef.current.y}px`;
      }
      rafId = requestAnimationFrame(updateGlow);
    };

    rafId = requestAnimationFrame(updateGlow);
    return () => cancelAnimationFrame(rafId);
  }, [isTouchDevice, smoothRef]);

  return (
    <>
      <div className="ambient-bg" />
      <div
        ref={glowRef}
        className={`cursor-glow ${entranceComplete ? 'active' : ''}`}
        style={{ display: isTouchDevice ? 'none' : 'block' }}
      />
      <div className="vignette-overlay" />
      <div className="grain-overlay" />
    </>
  );
}
