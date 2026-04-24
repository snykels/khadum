import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import OpenAI from "openai";

export async function POST(_req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const cfg = await loadSettings("ai").catch(() => ({}));
  const key = (cfg as Record<string, string>).openaiApiKey || process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "مفتاح OpenAI غير مضبوط" }, { status: 400 });
  try {
    const client = new OpenAI({ apiKey: key });
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 20,
      messages: [{ role: "user", content: "قل مرحبا بكلمة واحدة" }],
    });
    const reply = res.choices[0]?.message?.content?.trim() || "ok";
    return NextResponse.json({ ok: true, model: "gpt-4o-mini", reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
