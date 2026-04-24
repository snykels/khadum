import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, title, content, author, views, status, created_at AS "createdAt" FROM blog_posts ORDER BY created_at DESC`);
  return NextResponse.json({ posts: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { title, content, author, status } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  await db.execute(sql`INSERT INTO blog_posts(title,content,author,status) VALUES(${title},${content||''},${author||'فريق خدوم'},${status||'draft'})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء مقال',${title},'create')`);
  return NextResponse.json({ ok: true });
}
