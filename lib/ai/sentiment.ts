/**
 * Lightweight sentiment / intent classifier.
 * Uses GPT-4o-mini to classify a single inbound text in one short call.
 * Falls back to neutral when no API key is configured.
 */

import OpenAI from "openai";
<<<<<<< HEAD
import { loadSettings } from "@/lib/settings";
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

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
<<<<<<< HEAD
let clientKey: string | null = null;

async function getClient(): Promise<OpenAI | null> {
  const cfg = await loadSettings("ai").catch(() => ({}));
  const key =
    (cfg as Record<string, string>).openaiApiKey ||
    process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (client && clientKey === key) return client;
  client = new OpenAI({ apiKey: key });
  clientKey = key;
=======
function getClient(): OpenAI | null {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  client = new OpenAI({ apiKey: key });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
<<<<<<< HEAD
  const c = await getClient();
=======
  const c = getClient();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
