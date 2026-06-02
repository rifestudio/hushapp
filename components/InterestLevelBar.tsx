'use client';

import '@/components/InterestLevelBar.css';

interface InterestLevelBarProps {
  level: number;
  label: string;
  isInView: boolean;
}

export function InterestLevelBar({ level, label, isInView }: InterestLevelBarProps) {
  const isWarm = level >= 70;

  return (
    <div className="warmth-container">
      <div className="warmth-label">Connection</div>
      <div className="warmth-track">
        <div
          className="warmth-fill"
          style={{ width: isInView ? `${level}%` : '0%' }}
        />
      </div>
      <div className={`warmth-level-label ${isWarm ? 'warm' : ''}`}>{label}</div>
    </div>
  );
}
