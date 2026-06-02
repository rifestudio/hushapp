"use client";

import { useEffect, useRef, useState } from "react";
import { AtmosphericLayer } from "@/components/AtmosphericLayer";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PartnersSection } from "@/components/PartnersSection";
import { useEntranceSequence } from "@/hooks/useEntranceSequence";
import { createClient } from "@/lib/supabase/client";
import type { Partner } from "@/types";

import female from "./assets/female.jpg";
import male from "./assets/male.jpg";
import nonbinary from "./assets/nonbinary.jpg";

const levels = ["Stranger", "Familiar", "Friend", "Deeply Related"] as const;

export default function DashboardClient() {
  const entrance = useEntranceSequence();
  const mousePos = useRef({ x: 0, y: 0 });
  const [mouseState, setMouseState] = useState({ x: 0, y: 0 });

  const [user, setUser] = useState({
    name: "",
    avatarUrl: "/assets/user-avatar.jpg",
    plan: "free" as "free" | "premium",
    enthusiasmBalance: 0,
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  // загрузка профиля + партнёров
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, plan, enthusiasm")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser((u) => ({
          ...u,
          name: profile.display_name ?? "there",
          plan: (profile.plan as "free" | "premium") ?? "free",
          enthusiasmBalance: profile.enthusiasm ?? 0,
        }));
      }

      const { data: rows } = await supabase
        .from("partners")
        .select(
          "id, name, personality, interest_level, portrait_url, created_at, gender",
        )
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      const genderPortrait: Record<string, string> = {
        female: "/assets/female.jpg",
        male: "/assets/male.jpg",
        nonbinary: "/assets/nonbinary.jpg",
      };

      const mapped: Partner[] = (rows ?? []).map((p) => {
        const lvl = Math.min(3, Math.floor((p.interest_level ?? 0) / 25));
        return {
          id: p.id,
          name: p.name,
          personality: p.personality ?? "",
          interestLevel: p.interest_level ?? 0,
          interestLabel: levels[lvl],
          portraitUrl:
            p.portrait_url ??
            genderPortrait[p.gender ?? "female"] ??
            "/assets/partner-1.jpg",
          lastInteraction: new Date(p.created_at),
        };
      });

      setPartners(mapped);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    let lastUpdate = 0;
    const throttledUpdate = (e: MouseEvent) => {
      handleMouseMove(e);
      const now = performance.now();
      if (now - lastUpdate > 16) {
        setMouseState({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };

    window.addEventListener("mousemove", throttledUpdate);
    return () => window.removeEventListener("mousemove", throttledUpdate);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
      }}
    >
      <AtmosphericLayer entranceComplete={entrance.isComplete} />

      <Navbar user={user} entranceReady={entrance.navbarReady} />

      <main>
        <HeroSection
          userName={user.name}
          greetingReady={entrance.greetingReady}
          subtitleReady={entrance.subtitleReady}
          buttonReady={entrance.buttonReady}
        />

        {loaded && partners.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              padding: "0 1.5rem 4rem",
            }}
          >
            No one here yet. Create your first partner above.
          </p>
        ) : (
          <PartnersSection
            partners={partners}
            mouseX={mouseState.x}
            mouseY={mouseState.y}
            entranceReady={entrance.cardsReady}
          />
        )}
      </main>
    </div>
  );
}
