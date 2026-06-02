"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InterestLevelBar } from "@/components/InterestLevelBar";
import { useInView } from "@/hooks/useInView";
import type { Partner } from "@/types";
import "@/components/PartnerCard.css";

interface PartnerCardProps {
  partner: Partner;
  mouseX: number;
  mouseY: number;
  index: number;
  entranceReady: boolean;
}

export function PartnerCard({
  partner,
  mouseX,
  mouseY,
  index,
  entranceReady,
}: PartnerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const portraitOverlayRef = useRef<HTMLDivElement>(null);
  const [inViewRef, isInView] = useInView(0.2);
  const tiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  // SSR-safe: resolve touch device inside effect, default false on server
  const isTouchDevice = useRef(false);

  // Merge refs for the card container
  const setCardRef = useCallback(
    (el: HTMLDivElement | null) => {
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [inViewRef],
  );

  // Proximity-based awakening + parallax tilt
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice.current) return;

    const card = cardRef.current;
    if (!card) return;

    const animate = () => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - cardCenterX, 2) + Math.pow(mouseY - cardCenterY, 2),
      );

      const activationRadius = 180;
      const intensity = Math.max(0, 1 - distance / activationRadius);

      // Portrait overlay opacity: 0.35 dormant → 0 awake
      if (portraitOverlayRef.current) {
        portraitOverlayRef.current.style.opacity = String(
          0.35 * (1 - intensity),
        );
      }

      // Card border and glow
      const borderAlpha = 0.05 + 0.15 * intensity;
      card.style.borderColor = `rgba(196, 30, 58, ${borderAlpha})`;
      card.style.boxShadow = `0 ${4 + 4 * intensity}px ${30 + 10 * intensity}px rgba(196, 30, 58, ${0.05 + 0.08 * intensity})`;

      // Parallax tilt when cursor is directly over card
      const isOverCard =
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      let targetTiltX = 0;
      let targetTiltY = 0;

      if (isOverCard) {
        const nx = (mouseX - rect.left) / rect.width;
        const ny = (mouseY - rect.top) / rect.height;
        targetTiltY = (nx - 0.5) * 6; // rotateY
        targetTiltX = (ny - 0.5) * -6; // rotateX
      }

      // Lerp smoothing for tilt
      tiltRef.current.x += (targetTiltX - tiltRef.current.x) * 0.1;
      tiltRef.current.y += (targetTiltY - tiltRef.current.y) * 0.1;

      const liftY = -4 * intensity;
      card.style.transform = `perspective(800px) rotateX(${tiltRef.current.x.toFixed(2)}deg) rotateY(${tiltRef.current.y.toFixed(2)}deg) translateY(${liftY.toFixed(2)}px)`;

      // Glow behind card
      if (glowRef.current) {
        glowRef.current.style.opacity = String(intensity * 0.8);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [mouseX, mouseY]);

  const animationDelay = entranceReady ? `${index * 150}ms` : "0ms";

  return (
    <div
      ref={setCardRef}
      className={`partner-card ${entranceReady ? "entrance-card" : "entrance-hidden"}`}
      style={entranceReady ? { animationDelay } : undefined}
    >
      <div ref={glowRef} className="partner-card-glow" />

      <div className="partner-portrait">
        {/* plain img keeps the existing object-fit/scale hover styling intact */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={partner.portraitUrl} alt={partner.name} loading="lazy" />
        <div className="portrait-gradient" />
        <div ref={portraitOverlayRef} className="portrait-overlay" />
      </div>

      <div className="partner-body">
        <h3 className="partner-name">{partner.name}</h3>
        <span className="partner-personality">{partner.personality}</span>

        <InterestLevelBar
          level={partner.interestLevel}
          label={partner.interestLabel}
          isInView={isInView}
        />

        <Link href={`/chat/${partner.id}`} className="partner-continue-btn">
          <span>Continue</span>
          <ArrowRight className="arrow-icon" />
        </Link>
      </div>
    </div>
  );
}
