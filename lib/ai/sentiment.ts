/**
 * Lightweight sentiment / intent classifier.
 * Uses GPT-4o-mini to classify a single inbound text in one short call.
 * Falls back to neutral when no API key is configured.
 */

import OpenAI from "openai";

export type Emotion =
  | "neutral"
  | "happy"
  | "frustrated"
  | "angry"
  | "confused"
  | "urgent";

export type Action = "continue" | "soothe" | "escalate";

export interface SentimentResult {
  emotion: Emotion;
  score: number; // 0–10
  action: Action;
}

let client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  client = new OpenAI({ apiKey: key });
  return client;
}

const SYSTEM = `أنت مصنّف مشاعر باللغة العربية.
أرجع JSON فقط بالشكل:
{"emotion":"neutral|happy|frustrated|angry|confused|urgent","score":0-10,"action":"continue|soothe|escalate"}
- score يقيس شدة الشعور (0 = هادئ تماماً، 10 = أقصى).
- action = escalate إذا كان emotion=angry وscore>=7 أو في حالة تهديد/شتيمة/نزاع واضح.
- action = soothe إذا frustrated/confused/urgent مع score>=5.
- وإلا continue.`;

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const c = getClient();
  if (!c) {
    return { emotion: "neutral", score: 0, action: "continue" };
  }
  try {
    const res = await c.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 60,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text.slice(0, 1000) },
      ],
    });
    const raw = res.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as Partial<SentimentResult>;
    return {
      emotion: (parsed.emotion as Emotion) || "neutral",
      score: Math.max(0, Math.min(10, Number(parsed.score) || 0)),
      action: (parsed.action as Action) || "continue",
    };
  } catch {
    return { emotion: "neutral", score: 0, action: "continue" };
  }
}
