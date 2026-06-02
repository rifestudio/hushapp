'use client';

import { EnthusiasmMeter } from '@/components/EnthusiasmMeter';
import { PlanBadge } from '@/components/PlanBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { useScrolled } from '@/hooks/useScrolled';
import '@/components/Navbar.css';

interface NavbarProps {
  user: {
    name: string;
    avatarUrl: string;
    plan: 'free' | 'premium';
    enthusiasmBalance: number;
  };
  entranceReady: boolean;
}

export function Navbar({ user, entranceReady }: NavbarProps) {
  const scrolled = useScrolled();

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${entranceReady ? 'entrance-navbar' : 'entrance-hidden'}`}>
      <div className="navbar-brand">
        HUSH
        <span className="brand-ember" />
      </div>

      <EnthusiasmMeter balance={user.enthusiasmBalance} />

      <div className="navbar-right">
        <PlanBadge plan={user.plan} />
        <UserAvatar src={user.avatarUrl} alt={`${user.name}'s avatar`} />
      </div>
    </nav>
  );
}
