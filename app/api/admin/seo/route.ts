import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const NS = "seo";
const DEFAULTS: Record<string, string> = {
  siteTitle: "خدوم — منصة الخدمات الموثوقة",
  siteDescription: "منصة وسيطة بين العملاء والمستقلين بكل ثقة وأمان",
  keywords: "خدمات, مستقلين, خدوم, السعودية",
  ogImage: "",
  twitterHandle: "",
  googleVerification: "",
  canonicalDomain: "",
  robotsAllowAll: "true",
  sitemapEnabled: "true",
};

export async function GET() {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "supervisor")) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT key, value FROM settings WHERE ns = ${NS}`);
  const obj: Record<string, string> = { ...DEFAULTS };
  r.forEach((row: any) => { obj[row.key] = row.value; });
  return NextResponse.json({ seo: obj });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  for (const [key, val] of Object.entries(body)) {
    const v = val == null ? "" : String(val);
    await db.execute(sql`INSERT INTO settings(ns,key,value) VALUES(${NS},${key},${v}) ON CONFLICT (ns,key) DO UPDATE SET value=EXCLUDED.value`);
  }
  await logAudit(s, "تحديث إعدادات SEO", "", "update");
  return NextResponse.json({ ok: true });
}
