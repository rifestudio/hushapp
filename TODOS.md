# HUSH — TODOs

Deferred work from the CEO review (2026-06-05). Full context:
`~/.gstack/projects/hush-next/ceo-plans/2026-06-05-hush-earned-intimacy.md`.

## Post-launch (deferred from scope cherry-pick)

- [ ] **Persistent long-term per-partner memory** — P1 (TOP) — Today the partner only sees the last 14 messages, so it forgets shared history. This delivers *continuity* — the thing that makes the earned relationship feel real once users return. Promote the moment returning users report the partner feels forgetful (validation-gate rule). Depends on: a per-partner summarization store.
- [ ] **Proactive "missed you" re-engagement messages** — P2 — Partner texts first after inactivity (push/email), with consent + frequency caps. Strongest retention lever in the market. Promote if D7 retention is the constraint.
- [ ] **Voice-note replies** — P2 — Premium microtransaction (ElevenLabs/PlayHT); proven high-margin add. Phase-2 once the text loop + payments are proven.

## Resilience / architecture

- [ ] **Model-provider abstraction layer** — P1 — HUSH runs entirely on one model (Dolphin-Mistral-Venice) at one vendor (Featherless), which can ban a paid NSFW app like a payment processor can. Abstraction lets you swap host/model. Identify a backup host as part of the M2 feasibility spike.
- [ ] **DB migrations in the repo** — P2 — Schema (`profiles.approved/enthusiasm`, `partners.interest_level/gender/speaking_style/mood`) lives only in Supabase. No version control = drift risk, no reproducible staging.
- [ ] **Bond-scoring cost optimization** — P2 — Currently 2 LLM calls per message (main + a second call for one integer). Fold scoring into the main call's structured output or use a cheaper scorer. Directly affects per-message margin.

## Code quality

- [ ] **Refactor `app/api/chat/route.ts`** — P3 — ~250-line handler; extract `buildSystemPrompt()`, `splitReply()`, `scoreBond()`. Right-sized cleanup, not a rewrite.
- [ ] **Zero-partner / zero-enthusiasm empty states** — P3 — Design + implement the empty states on `/home` and the chat surface.

## Available on request (not yet decided)

- [ ] Mood-drift over time (partner's mood evolves with how it's treated).
- [ ] Daily enthusiasm trickle (free top-up for habit-forming returns).
