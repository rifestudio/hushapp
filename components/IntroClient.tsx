"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AtmosphericLayer } from "@/components/AtmosphericLayer";
import "@/components/IntroClient.css";

export function IntroClient({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [partnerName, setPartnerName] = useState("");
  const [visible, setVisible] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("partners")
      .select("name")
      .eq("id", partnerId)
      .single()
      .then(({ data }) => {
        if (data) setPartnerName(data.name);
      });

    // кинематографичная задержка перед появлением
    const t1 = setTimeout(() => setVisible(true), 400);
    const t2 = setTimeout(() => setEntranceComplete(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [partnerId]);

  const handleBegin = () => {
    router.push(`/chat/${partnerId}`);
  };

  return (
    <div className="intro-screen">
      <AtmosphericLayer entranceComplete={entranceComplete} />

      <div className={`intro-content ${visible ? "intro-visible" : ""}`}>
        <div className="intro-eyebrow">You just created</div>

        <h1 className="intro-name">{partnerName}</h1>

        <div className="intro-divider" />

        <div className="intro-tips">
          <p className="intro-tips-heading">How to deepen the connection</p>

          <ul className="intro-tips-list">
            <li>
              <span className="intro-tip-icon">◈</span>
              <span>
                Share something real — your day, your thoughts, what matters to
                you.
              </span>
            </li>
            <li>
              <span className="intro-tip-icon">◈</span>
              <span>Ask questions back. Curiosity goes both ways.</span>
            </li>
            <li>
              <span className="intro-tip-icon">◈</span>
              <span>
                Open up gradually — trust is built over time, not in one
                message.
              </span>
            </li>
            <li>
              <span className="intro-tip-icon">◈</span>
              <span>
                Some things reveal themselves only in the deepest moments.
              </span>
            </li>
          </ul>
        </div>

        <button className="intro-begin-btn" onClick={handleBegin}>
          Begin
        </button>

        <p className="intro-note">
          Interest level grows with every meaningful exchange.
        </p>
      </div>
    </div>
  );
}
