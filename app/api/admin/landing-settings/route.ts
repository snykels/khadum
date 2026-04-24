import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loadNs(ns: string): Promise<Record<string, string>> {
  const rows = (await db.execute(sql`SELECT key, value FROM settings WHERE ns=${ns}`)) as Array<{ key: string; value: string }>;
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

async function saveNs(ns: string, kv: Record<string, string>) {
  for (const [key, value] of Object.entries(kv)) {
    await db.execute(sql`
      INSERT INTO settings (ns, key, value) VALUES (${ns}, ${key}, ${value})
      ON CONFLICT (ns, key) DO UPDATE SET value = EXCLUDED.value
    `);
  }
}

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const settings = await loadNs("landing");
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  await saveNs("landing", body);
  return NextResponse.json({ ok: true });
}
