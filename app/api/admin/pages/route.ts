import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, title, slug, content, status, updated_at AS "updatedAt" FROM pages ORDER BY id DESC`);
  return NextResponse.json({ pages: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { title, slug, content, status } = await req.json();
  if (!title || !slug) return NextResponse.json({ error: "title/slug required" }, { status: 400 });
  await db.execute(sql`INSERT INTO pages(title,slug,content,status) VALUES(${title},${slug},${content || ''},${status || 'draft'})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء صفحة',${title},'create')`);
  return NextResponse.json({ ok: true });
}
