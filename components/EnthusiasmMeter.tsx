'use client';

import { useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';

interface EnthusiasmMeterProps {
  balance: number;
}

export function EnthusiasmMeter({ balance }: EnthusiasmMeterProps) {
  const flameRef = useRef<HTMLDivElement>(null);
  const isLow = balance < 30;
  const isHealthy = balance >= 50;

  useEffect(() => {
    const flameEl = flameRef.current;
    if (!flameEl) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = flameEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      const proximity = Math.max(0, 1 - distance / 80);
      const scale = 1 + proximity * 0.1;
      const glowSize = 6 + proximity * 8;
      const glowOpacity = 0.4 + proximity * 0.3;

      const icon = flameEl.querySelector('.flame-icon') as HTMLElement;
      if (icon) {
        icon.style.filter = `drop-shadow(0 0 ${glowSize}px rgba(255, 107, 53, ${glowOpacity}))`;
        icon.style.transform = `scale(${scale})`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="enthusiasm-meter">
      <div ref={flameRef} className="flame-wrapper">
        <Flame
          className={`flame-icon ${isHealthy ? 'healthy' : ''} ${isLow ? 'low' : ''}`}
        />
      </div>
      <span className="enthusiasm-balance enthusiasm-balance-text">{balance}</span>
      {isLow && (
        <span className="enthusiasm-replenish">Replenish</span>
      )}
    </div>
  );
}
