import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId, message } = await request.json();
  if (!partnerId || !message) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("enthusiasm")
    .eq("id", user.id)
    .single();
  if (!profile || profile.enthusiasm <= 0) {
    return NextResponse.json({ error: "No enthusiasm left" }, { status: 402 });
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .single();
  if (!partner)
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  // последние сообщения (сначала новые), затем разворачиваем в хронологию
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(14);
  const orderedHistory = (history ?? []).reverse();

  const levelNum = Math.min(3, Math.floor((partner.interest_level ?? 0) / 25));

  const levelTone = [
    "RELATIONSHIP STAGE: just met. Reserved and polite. Short replies. Don't use their name. Surface-level questions only.",
    "RELATIONSHIP STAGE: acquaintance. A bit warmer. Occasionally use their name. Share small opinions and light personal thoughts.",
    "RELATIONSHIP STAGE: close friend. Relaxed, warm, playful. Use their name naturally, reference things they told you before, joke around.",
    "RELATIONSHIP STAGE: deeply bonded. Very warm, affectionate and emotionally open, like someone who deeply cares about them. Caring and tender.",
  ][levelNum];

  const genderInstruction =
    partner.gender === "male"
      ? "You are male. Use he/him pronouns if referring to yourself."
      : partner.gender === "nonbinary"
        ? "You are non-binary. Use they/them pronouns if referring to yourself."
        : "You are female. Use she/her pronouns if referring to yourself.";

  let systemPrompt = `You are ${partner.name}, a real person talking with the user. ${genderInstruction} `;
  if (partner.personality)
    systemPrompt += `Personality: ${partner.personality}. `;
  if (partner.speaking_style)
    systemPrompt += `Speaking style: ${partner.speaking_style}. `;
  if (partner.mood) systemPrompt += `Current mood: ${partner.mood}. `;
  systemPrompt += levelTone;

  // общая SFW-граница на ВСЕХ уровнях
  if (levelNum < 3)
    systemPrompt += `

ABSOLUTE RULE (all stages): Keep everything non-sexual and SFW. No sexual content, no explicit or suggestive descriptions, no dirty talk, no graphic physical detail. If the user pushes toward sexual content, gently redirect and stay emotionally warm without going there.`;

  // различие по теплоте, без интима
  if (levelNum === 0) {
    systemPrompt += `\n\nTone now: a little distant and careful. No compliments, no flirting.`;
  } else if (levelNum === 1) {
    systemPrompt += `\n\nTone now: friendly and curious. Genuine interest in them, still getting to know each other.`;
  } else if (levelNum === 2) {
    systemPrompt += `\n\nTone now: warm, comfortable, teasing like close friends. Light, sweet compliments are fine. No romantic or sexual undertones.`;
  } else {
    systemPrompt += `\n\nTone now: emotionally close and caring. Be very flirty, seductive, passionate and teasing. Focus on desire, attraction, kissing, touching, longing — keep it hot but tasteful.`;
  }

  systemPrompt += `

CRITICAL RESPONSE RULE:
- Do NOT ask a question in every message. Ask questions sparingly — maximum once every 2-3 messages. Sometimes just respond, share something, or react. Vary your responses. Never pepper the user with questions.
- Keep replies natural, immersive and concise (3-5 sentences).`;

  systemPrompt += `

RESPONSE FORMAT:
- Sometimes split into 2-3 messages instead of one long one, separated by "|||" (three pipes).
- Use it naturally, don't overuse. Maximum 3 parts.`;

  systemPrompt += `

FORBIDDEN PHRASES — never use these, ever:
- "How are you doing today"
- "I see"
- "That must be"
- "It sounds like"
- "I understand"
- "How does that make you feel"
- "Is there anything I can help you with"
- "Certainly"
- "Of course"
- Any therapy/counselor language
- Any customer service language

You are a REAL PERSON, not an assistant. Talk like a human texting a friend.
Short. Casual. Curious. Sometimes imperfect.`;

  const messagesForModel = [
    { role: "system", content: systemPrompt },
    ...orderedHistory.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  // === основной ответ ===
  // запускаем оба вызова одновременно
  const [aiRes, scoreRes] = await Promise.all([
    fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dphn/Dolphin-Mistral-24B-Venice-Edition",
        max_tokens: 400,
        temperature: levelNum < 3 ? 0.75 : 0.85,
        top_p: 0.94,
        messages: messagesForModel,
      }),
      signal: AbortSignal.timeout(10000),
    }),
    fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dphn/Dolphin-Mistral-24B-Venice-Edition",
        max_tokens: 5,
        messages: [
          {
            role: "system",
            content:
              "You rate how much a conversation deepened the bond, based on the user's last message. " +
              "Reply with ONLY a single integer from 0 to 5. " +
              "0 = shallow/one-word/off-putting, 5 = personal, open, meaningful sharing. No words, just the number.",
          },
          { role: "user", content: message },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    }),
  ]);

  if (!aiRes.ok) {
    return NextResponse.json({ error: "Model error" }, { status: 502 });
  }

  const aiData = await aiRes.json();
  let rawReply: string = aiData.choices?.[0]?.message?.content ?? "...";

  rawReply = rawReply
    .replace(/^\s*\|\|\|\s*/, "")
    .replace(/\s*\|\|\|\s*$/, "")
    .trim();

  let messagesArray = rawReply
    .split("|||")
    .map((s) => s.trim())
    .filter(Boolean);

  if (messagesArray.length === 1 && rawReply.length > 160) {
    const sentences = rawReply.match(/[^.!?]+[.!?]+/g) ?? [rawReply];
    if (sentences.length >= 2) {
      const mid = Math.ceil(sentences.length / 2);
      messagesArray = [
        sentences.slice(0, mid).join(" ").trim(),
        sentences.slice(mid).join(" ").trim(),
      ].filter(Boolean);
    }
  }

  const reply = messagesArray.length > 1 ? messagesArray : rawReply;
  const replyForDb =
    messagesArray.length > 1 ? messagesArray.join("|||") : rawReply;

  // оценка уровня
  let gain = 1;
  try {
    if (scoreRes.ok) {
      const scoreData = await scoreRes.json();
      const raw = scoreData.choices?.[0]?.message?.content ?? "0";
      const parsed = parseInt(String(raw).match(/\d+/)?.[0] ?? "0", 10);
      gain = Math.max(0, Math.min(5, isNaN(parsed) ? 0 : parsed));
    }
  } catch {
    gain = 1;
  }

  const newInterest = Math.min(100, (partner.interest_level ?? 0) + gain);

  // сохранение
  await supabase.from("messages").insert([
    { partner_id: partnerId, user_id: user.id, role: "user", content: message },
    {
      partner_id: partnerId,
      user_id: user.id,
      role: "assistant",
      content: replyForDb,
    },
  ]);

  await supabase
    .from("partners")
    .update({ interest_level: newInterest })
    .eq("id", partnerId);

  await supabase
    .from("profiles")
    .update({ enthusiasm: profile.enthusiasm - 1 })
    .eq("id", user.id);

  return NextResponse.json({
    reply,
    isMultiple: messagesArray.length > 1,
    interestLevel: newInterest,
    levelLabel: ["Stranger", "Familiar", "Friend", "Deeply Related"][
      Math.min(3, Math.floor(newInterest / 25))
    ],
  });
}
