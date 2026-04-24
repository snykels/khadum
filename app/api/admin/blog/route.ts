import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
<<<<<<< HEAD
  const r: any = await db.execute(sql`SELECT id, title, content, author, views, status, slug, excerpt, cover_image AS "coverImage", meta_title AS "metaTitle", meta_description AS "metaDescription", meta_keywords AS "metaKeywords", og_image AS "ogImage", created_at AS "createdAt", updated_at AS "updatedAt" FROM blog_posts ORDER BY created_at DESC`);
=======
  const r: any = await db.execute(sql`SELECT id, title, content, author, views, status, created_at AS "createdAt" FROM blog_posts ORDER BY created_at DESC`);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json({ posts: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
<<<<<<< HEAD
  const b = await req.json();
  const { title, content, author, status, slug, excerpt, coverImage, metaTitle, metaDescription, metaKeywords, ogImage } = b;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const r: any = await db.execute(sql`
    INSERT INTO blog_posts(title, content, author, status, slug, excerpt, cover_image, meta_title, meta_description, meta_keywords, og_image)
    VALUES(${title}, ${content || ''}, ${author || 'فريق خدوم'}, ${status || 'draft'}, ${slug || ''}, ${excerpt || ''}, ${coverImage || ''}, ${metaTitle || ''}, ${metaDescription || ''}, ${metaKeywords || ''}, ${ogImage || ''})
    RETURNING id`);
  const newId = Array.isArray(r) && r[0] ? r[0].id : null;
  await db.execute(sql`INSERT INTO audit_log(user_id, user_name, action, target, type) VALUES(${s.userId || null}, ${s.name}, 'إنشاء مقال', ${title}, 'create')`);
  return NextResponse.json({ ok: true, id: newId });
=======
  const { title, content, author, status } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  await db.execute(sql`INSERT INTO blog_posts(title,content,author,status) VALUES(${title},${content||''},${author||'فريق خدوم'},${status||'draft'})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء مقال',${title},'create')`);
  return NextResponse.json({ ok: true });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}
