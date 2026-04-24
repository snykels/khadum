import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const ns = req.nextUrl.searchParams.get("ns");
  const r: any = ns
    ? await db.execute(sql`SELECT key, value FROM settings WHERE ns=${ns}`)
    : await db.execute(sql`SELECT ns, key, value FROM settings`);
  if (ns) {
    const obj: Record<string, string> = {};
    r.forEach((row: any) => { obj[row.key] = row.value; });
    return NextResponse.json({ settings: obj });
  }
  const out: Record<string, Record<string, string>> = {};
  r.forEach((row: any) => { (out[row.ns] ??= {})[row.key] = row.value; });
  return NextResponse.json({ settings: out });
}

export async function PATCH(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const { ns, values } = body as { ns: string; values: Record<string, any> };
  if (!ns || !values) return NextResponse.json({ error: "ns/values required" }, { status: 400 });
  for (const [key, val] of Object.entries(values)) {
    const v = val == null ? "" : String(val);
    await db.execute(sql`
      INSERT INTO settings(ns,key,value) VALUES(${ns},${key},${v})
      ON CONFLICT (ns,key) DO UPDATE SET value=EXCLUDED.value
    `);
  }
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'تعديل إعدادات',${'تحديث ' + ns},'settings')`);
  return NextResponse.json({ ok: true });
}
