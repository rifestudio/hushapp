"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { AtmosphericLayer } from "@/components/AtmosphericLayer";
import { createClient } from "@/lib/supabase/client";
import "@/components/ChatClient.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Partner {
  id: string;
  name: string;
  personality: string | null;
  portrait_url: string | null;
  interest_level: number;
  gender: string | null;
}

export function ChatClient({ partnerId }: { partnerId: string }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // загрузка партнёра + истории
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: p } = await supabase
        .from("partners")
        .select("id, name, personality, portrait_url, interest_level, gender")
        .eq("id", partnerId)
        .single();
      setPartner(p);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, role, content")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: true });
      const raw = (msgs as Message[]) ?? [];
      const expanded: Message[] = [];
      for (const msg of raw) {
        if (msg.role === "assistant" && msg.content.includes("|||")) {
          msg.content
            .split("|||")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((part, i) =>
              expanded.push({
                id: `${msg.id}-${i}`,
                role: "assistant",
                content: part,
              }),
            );
        } else {
          expanded.push(msg);
        }
      }
      setMessages(expanded);
    })();

    const t = setTimeout(() => setEntranceComplete(true), 600);
    return () => clearTimeout(t);
  }, [partnerId]);

  // автоскролл вниз
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    // оптимистично показываем сообщение пользователя
    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const note =
          res.status === 402
            ? "Ahh... I'm exhausted now. I don't have any enthusiasm left for today 💕 Let's continue when I have more energy, okay?"
            : err.error || "Something went wrong. Try again.";
        setMessages((m) => [
          ...m,
          { id: `sys-${Date.now()}`, role: "assistant", content: note },
        ]);
        return;
      }

      const data = await res.json();

      const parts: string[] = Array.isArray(data.reply)
        ? data.reply
        : [data.reply];

      // каждую часть — отдельным пузырём, с паузой, будто партнёр печатает по очереди
      for (let i = 0; i < parts.length; i++) {
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}-${i}`, role: "assistant", content: parts[i] },
        ]);
        if (i < parts.length - 1) {
          await new Promise((r) => setTimeout(r, 700));
        }
      }

      if (typeof data.interestLevel === "number") {
        setPartner((p) =>
          p ? { ...p, interest_level: data.interestLevel } : p,
        );
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "Connection lost. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const levels = ["Stranger", "Familiar", "Friend", "Deeply Related"];
  const level = partner
    ? Math.min(3, Math.floor((partner.interest_level ?? 0) / 25))
    : 0;
  const levelLabel = levels[level];
  const progress = partner ? (partner.interest_level ?? 0) % 25 : 0; // 0..24 внутри уровня

  return (
    <div className="chat-screen">
      <AtmosphericLayer entranceComplete={entranceComplete} />

      {/* header */}
      <header className="chat-header">
        <Link href="/" className="chat-back" aria-label="Back">
          <ArrowLeft />
        </Link>
        <div className="chat-partner">
          {partner?.portrait_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.portrait_url}
              alt={partner.name}
              className="chat-partner-avatar"
            />
          )}
          <div>
            <div className="chat-partner-name">{partner?.name ?? "..."}</div>
            <div className="chat-level">
              <span className="chat-level-label">{levelLabel}</span>
              <span className="chat-level-track">
                <span
                  className="chat-level-fill"
                  style={{ width: `${(progress / 25) * 100}%` }}
                />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* messages */}
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="chat-empty">The room is quiet. Say something.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="chat-bubble assistant typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>

      {/* composer */}
      <div className="chat-composer">
        <textarea
          className="chat-input"
          placeholder="Write something..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="chat-send"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          aria-label="Send"
        >
          <Send />
        </button>
      </div>
    </div>
  );
}
