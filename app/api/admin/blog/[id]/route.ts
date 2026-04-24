import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

<<<<<<< HEAD
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const r: any = await db.execute(sql`SELECT id, title, content, author, views, status, slug, excerpt, cover_image AS "coverImage", meta_title AS "metaTitle", meta_description AS "metaDescription", meta_keywords AS "metaKeywords", og_image AS "ogImage", created_at AS "createdAt", updated_at AS "updatedAt" FROM blog_posts WHERE id=${Number(id)} LIMIT 1`);
  const post = Array.isArray(r) && r[0] ? r[0] : null;
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ post });
}

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
<<<<<<< HEAD
  if (b.title !== undefined) await db.execute(sql`UPDATE blog_posts SET title=${b.title}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.content !== undefined) await db.execute(sql`UPDATE blog_posts SET content=${b.content}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.author !== undefined) await db.execute(sql`UPDATE blog_posts SET author=${b.author}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.status !== undefined) await db.execute(sql`UPDATE blog_posts SET status=${b.status}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.slug !== undefined) await db.execute(sql`UPDATE blog_posts SET slug=${b.slug}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.excerpt !== undefined) await db.execute(sql`UPDATE blog_posts SET excerpt=${b.excerpt}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.coverImage !== undefined) await db.execute(sql`UPDATE blog_posts SET cover_image=${b.coverImage}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaTitle !== undefined) await db.execute(sql`UPDATE blog_posts SET meta_title=${b.metaTitle}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaDescription !== undefined) await db.execute(sql`UPDATE blog_posts SET meta_description=${b.metaDescription}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaKeywords !== undefined) await db.execute(sql`UPDATE blog_posts SET meta_keywords=${b.metaKeywords}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.ogImage !== undefined) await db.execute(sql`UPDATE blog_posts SET og_image=${b.ogImage}, updated_at=NOW() WHERE id=${Number(id)}`);
=======
  if (b.title !== undefined) await db.execute(sql`UPDATE blog_posts SET title=${b.title} WHERE id=${Number(id)}`);
  if (b.content !== undefined) await db.execute(sql`UPDATE blog_posts SET content=${b.content} WHERE id=${Number(id)}`);
  if (b.author !== undefined) await db.execute(sql`UPDATE blog_posts SET author=${b.author} WHERE id=${Number(id)}`);
  if (b.status !== undefined) await db.execute(sql`UPDATE blog_posts SET status=${b.status} WHERE id=${Number(id)}`);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM blog_posts WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}
