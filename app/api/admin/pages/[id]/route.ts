import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

<<<<<<< HEAD
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const r: any = await db.execute(sql`SELECT id, title, slug, content, status, excerpt, cover_image AS "coverImage", meta_title AS "metaTitle", meta_description AS "metaDescription", meta_keywords AS "metaKeywords", og_image AS "ogImage", updated_at AS "updatedAt" FROM pages WHERE id=${Number(id)} LIMIT 1`);
  const page = Array.isArray(r) && r[0] ? r[0] : null;
  if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ page });
}

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
<<<<<<< HEAD
  if (b.title !== undefined) await db.execute(sql`UPDATE pages SET title=${b.title}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.slug !== undefined) await db.execute(sql`UPDATE pages SET slug=${b.slug}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.content !== undefined) await db.execute(sql`UPDATE pages SET content=${b.content}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.status !== undefined) await db.execute(sql`UPDATE pages SET status=${b.status}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.excerpt !== undefined) await db.execute(sql`UPDATE pages SET excerpt=${b.excerpt}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.coverImage !== undefined) await db.execute(sql`UPDATE pages SET cover_image=${b.coverImage}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaTitle !== undefined) await db.execute(sql`UPDATE pages SET meta_title=${b.metaTitle}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaDescription !== undefined) await db.execute(sql`UPDATE pages SET meta_description=${b.metaDescription}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.metaKeywords !== undefined) await db.execute(sql`UPDATE pages SET meta_keywords=${b.metaKeywords}, updated_at=NOW() WHERE id=${Number(id)}`);
  if (b.ogImage !== undefined) await db.execute(sql`UPDATE pages SET og_image=${b.ogImage}, updated_at=NOW() WHERE id=${Number(id)}`);
=======
  const fields = ['title','slug','content','status'].filter(f => b[f] !== undefined);
  if (!fields.length) return NextResponse.json({ ok: true });
  for (const f of fields) {
    const col = f === 'title' ? sql`title` : f === 'slug' ? sql`slug` : f === 'content' ? sql`content` : sql`status`;
    await db.execute(sql`UPDATE pages SET ${col}=${b[f]}, updated_at=NOW() WHERE id=${Number(id)}`);
  }
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM pages WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}
