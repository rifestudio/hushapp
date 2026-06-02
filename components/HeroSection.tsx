"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import "@/components/HeroSection.css";

interface HeroSectionProps {
  userName: string;
  greetingReady: boolean;
  subtitleReady: boolean;
  buttonReady: boolean;
}

export function HeroSection({
  userName,
  greetingReady,
  subtitleReady,
  buttonReady,
}: HeroSectionProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  // Magnetic pull effect — button + inner content (iOS-style depth)
  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const button = btnRef.current;
    const content = contentRef.current;
    if (!button) return;

    let btnX = 0;
    let btnY = 0;
    let innerX = 0;
    let innerY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // расстояние от КРАЯ кнопки, а не от центра — зона повторяет форму
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const edgeDistance = Math.sqrt(dx * dx + dy * dy);

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const magneticRadius = 110; // толщина зоны притяжения от края кнопки
      const maxOffset = 14;

      if (edgeDistance < magneticRadius) {
        const force = 1 - edgeDistance / magneticRadius;
        targetX =
          deltaX * force * (maxOffset / Math.max(rect.width, rect.height));
        targetY =
          deltaY * force * (maxOffset / Math.max(rect.width, rect.height));
      } else {
        targetX = 0;
        targetY = 0;
      }
    };

    const animate = () => {
      // button eases toward target
      btnX += (targetX - btnX) * 0.15;
      btnY += (targetY - btnY) * 0.15;
      // inner content pulls further (×1.4) and slightly slower → depth
      innerX += (targetX * 1.4 - innerX) * 0.12;
      innerY += (targetY * 1.4 - innerY) * 0.12;

      button.style.transform = `translate(${btnX.toFixed(2)}px, ${btnY.toFixed(2)}px)`;
      if (content) {
        content.style.transform = `translate(${innerX.toFixed(2)}px, ${innerY.toFixed(2)}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-section">
      <h1
        className={`hero-greeting ${greetingReady ? "entrance-greeting" : "entrance-hidden"}`}
      >
        Welcome back, <span className="name-highlight">{userName}</span>
      </h1>

      <p
        className={`hero-subtitle ${subtitleReady ? "entrance-subtitle" : "entrance-hidden"}`}
      >
        Your sanctuary awaits.
      </p>

      <div
        className={`create-btn-wrapper ${buttonReady ? "entrance-hero-btn" : "entrance-hidden"}`}
      >
        <div className="create-btn-ambient" />
        <button
          ref={btnRef}
          className="create-btn"
          onClick={() => router.push("/create")}
        >
          <span ref={contentRef} className="create-btn-inner">
            <Sparkles className="btn-icon" />
            Create New Partner
          </span>
        </button>
      </div>
    </section>
  );
}
