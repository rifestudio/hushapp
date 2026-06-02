import { useEffect, useRef } from 'react';

// Hook that returns live-updating mouse position via refs.
// Components use this in their own rAF loops for smooth effects.
// SSR-safe: all window access happens inside effects, refs start at 0.
export function useMousePositionRef() {
  const posRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const isTouchRef = useRef(false);

  useEffect(() => {
    isTouchRef.current = window.matchMedia('(pointer: coarse)').matches;

    // initialize to viewport center on mount (client only)
    posRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    smoothRef.current = { ...posRef.current };

    if (isTouchRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const animate = () => {
      smoothRef.current.x += (posRef.current.x - smoothRef.current.x) * 0.06;
      smoothRef.current.y += (posRef.current.y - smoothRef.current.y) * 0.06;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { posRef, smoothRef, isTouchDevice: isTouchRef.current };
}
