"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AtmosphericLayer } from "@/components/AtmosphericLayer";
import { createClient } from "@/lib/supabase/client";
import "@/components/CreatePartnerClient.css";

export function CreatePartnerClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "nonbinary">(
    "female",
  );
  const [personality, setPersonality] = useState("");
  const [speakingStyle, setSpeakingStyle] = useState("");
  const [mood, setMood] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleCreate = async () => {
    if (loading) return;
    setError(null);

    if (!name.trim()) {
      setError("Give them a name.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("partners")
      .insert({
        user_id: user.id,
        name: name.trim(),
        personality: personality.trim() || null,
        speaking_style: speakingStyle.trim() || null,
        mood: mood.trim() || null,
        gender,
        interest_level: 0,
      })
      .select("id")
      .single();

    setLoading(false);

    if (error || !data) {
      setError(error?.message ?? "Could not create. Try again.");
      return;
    }

    // сразу в чат с новым партнёром
    router.push(`/intro/${data.id}`);
  };

  return (
    <div className="create-screen">
      <AtmosphericLayer entranceComplete={entranceComplete} />

      <Link href="/" className="create-back" aria-label="Back">
        <ArrowLeft />
      </Link>

      <div className="create-card-wrapper">
        <div className="create-card-ambient" />

        <div className="create-card create-entrance">
          <div className="create-header">
            <h1 className="create-title">Bring someone to life</h1>
            <p className="create-subtitle">
              A few words, and they begin to breathe.
            </p>
          </div>

          <div className="create-form create-entrance create-entrance-delay-1">
            <div className="create-field">
              <label className="create-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="create-input"
                type="text"
                placeholder="Seraphina"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-label">Gender</label>
              <div className="create-gender-selector">
                {(["female", "male", "nonbinary"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`create-gender-btn ${gender === g ? "active" : ""}`}
                    onClick={() => setGender(g)}
                  >
                    {g === "female"
                      ? "She / Her"
                      : g === "male"
                        ? "He / Him"
                        : "They / Them"}
                  </button>
                ))}
              </div>
            </div>

            <div className="create-field">
              <label className="create-label" htmlFor="personality">
                Personality
              </label>
              <textarea
                id="personality"
                className="create-input create-textarea"
                rows={2}
                placeholder="Warm, curious, a little teasing..."
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-label" htmlFor="style">
                Speaking style
              </label>
              <textarea
                id="style"
                className="create-input create-textarea"
                rows={2}
                placeholder="Short sentences, playful, lowercase..."
                value={speakingStyle}
                onChange={(e) => setSpeakingStyle(e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-label" htmlFor="mood">
                Current mood
              </label>
              <input
                id="mood"
                className="create-input"
                type="text"
                placeholder="Relaxed and interested"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
            </div>

            {error && <p className="create-error">{error}</p>}

            <button
              className="create-submit"
              onClick={handleCreate}
              disabled={loading}
            >
              <Sparkles className="btn-icon" />
              {loading ? "Awakening…" : "Create partner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
