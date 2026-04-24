import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, title, position, image_url AS "imageUrl", link, impressions, clicks, is_active AS "isActive", expires_at AS "expiresAt", created_at AS "createdAt" FROM banners ORDER BY id DESC`);
  return NextResponse.json({ banners: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  if (!b.title) return NextResponse.json({ error: "title required" }, { status: 400 });
  await db.execute(sql`INSERT INTO banners(title,position,image_url,link,is_active,expires_at) VALUES(${b.title},${b.position||'home'},${b.imageUrl||''},${b.link||''},${b.isActive!==false},${b.expiresAt||null})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء بانر',${b.title},'create')`);
  return NextResponse.json({ ok: true });
}
