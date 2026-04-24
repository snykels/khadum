import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
<<<<<<< HEAD
  const r: any = await db.execute(sql`SELECT id, title, slug, content, status, excerpt, cover_image AS "coverImage", meta_title AS "metaTitle", meta_description AS "metaDescription", meta_keywords AS "metaKeywords", og_image AS "ogImage", updated_at AS "updatedAt" FROM pages ORDER BY id DESC`);
=======
  const r: any = await db.execute(sql`SELECT id, title, slug, content, status, updated_at AS "updatedAt" FROM pages ORDER BY id DESC`);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json({ pages: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
<<<<<<< HEAD
  const b = await req.json();
  const { title, slug, content, status, excerpt, coverImage, metaTitle, metaDescription, metaKeywords, ogImage } = b;
  if (!title || !slug) return NextResponse.json({ error: "title/slug required" }, { status: 400 });
  const r: any = await db.execute(sql`
    INSERT INTO pages(title, slug, content, status, excerpt, cover_image, meta_title, meta_description, meta_keywords, og_image)
    VALUES(${title}, ${slug}, ${content || ''}, ${status || 'draft'}, ${excerpt || ''}, ${coverImage || ''}, ${metaTitle || ''}, ${metaDescription || ''}, ${metaKeywords || ''}, ${ogImage || ''})
    RETURNING id`);
  const newId = Array.isArray(r) && r[0] ? r[0].id : null;
  await db.execute(sql`INSERT INTO audit_log(user_id, user_name, action, target, type) VALUES(${s.userId || null}, ${s.name}, 'إنشاء صفحة', ${title}, 'create')`);
  return NextResponse.json({ ok: true, id: newId });
=======
  const { title, slug, content, status } = await req.json();
  if (!title || !slug) return NextResponse.json({ error: "title/slug required" }, { status: 400 });
  await db.execute(sql`INSERT INTO pages(title,slug,content,status) VALUES(${title},${slug},${content || ''},${status || 'draft'})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء صفحة',${title},'create')`);
  return NextResponse.json({ ok: true });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}
