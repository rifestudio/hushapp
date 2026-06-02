'use client';

import { PartnerCard } from '@/components/PartnerCard';
import type { Partner } from '@/types';
import '@/components/PartnersSection.css';

interface PartnersSectionProps {
  partners: Partner[];
  mouseX: number;
  mouseY: number;
  entranceReady: boolean;
}

export function PartnersSection({ partners, mouseX, mouseY, entranceReady }: PartnersSectionProps) {
  return (
    <section className="partners-section">
      <div className={`partners-header ${entranceReady ? 'entrance-section-header' : 'entrance-hidden'}`}>
        <h2 className="partners-title">Your Companions</h2>
        <p className="partners-subtitle">Waiting in the quiet.</p>
      </div>

      <div className="partners-grid">
        {partners.map((partner, index) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            mouseX={mouseX}
            mouseY={mouseY}
            index={index}
            entranceReady={entranceReady}
          />
        ))}
      </div>
    </section>
  );
}
