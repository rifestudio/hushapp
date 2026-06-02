'use client';

interface PlanBadgeProps {
  plan: 'free' | 'premium';
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <span className={`plan-badge ${plan}`}>
      {plan}
    </span>
  );
}
