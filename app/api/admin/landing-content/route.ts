import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NS = "landing_content";
const KEY = "blocks_json";

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const rows = (await db.execute(sql`SELECT value FROM settings WHERE ns=${NS} AND key=${KEY} LIMIT 1`)) as Array<{ value: string }>;
    const content = rows[0]?.value || "";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "" });
  }
}

export async function PUT(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const content = typeof body.content === "string" ? body.content : JSON.stringify(body.content);

  try {
    await db.execute(sql`
      INSERT INTO settings (ns, key, value) VALUES (${NS}, ${KEY}, ${content})
      ON CONFLICT (ns, key) DO UPDATE SET value = EXCLUDED.value
    `);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ في الحفظ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
