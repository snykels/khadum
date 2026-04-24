import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const rows: any = await db.execute(sql`SELECT id, slug, name, subject, blocks, is_active AS "isActive", variables, updated_at AS "updatedAt" FROM email_templates WHERE slug=${slug} LIMIT 1`);
    if (!rows.length) return NextResponse.json({ template: null });
    const t = rows[0];
    return NextResponse.json({ template: { ...t, blocks: typeof t.blocks === "string" ? JSON.parse(t.blocks) : t.blocks, variables: typeof t.variables === "string" ? JSON.parse(t.variables) : t.variables } });
  }
  const rows: any = await db.execute(sql`SELECT id, slug, name, subject, is_active AS "isActive", updated_at AS "updatedAt" FROM email_templates ORDER BY id`);
  return NextResponse.json({ templates: rows });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  if (!b.slug || !b.name || !b.subject) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const blocks = JSON.stringify(Array.isArray(b.blocks) ? b.blocks : []);
  const variables = JSON.stringify(Array.isArray(b.variables) ? b.variables : []);
  await db.execute(sql`INSERT INTO email_templates(slug, name, subject, blocks, variables, is_active, updated_by_id) VALUES(${b.slug}, ${b.name}, ${b.subject}, ${blocks}::jsonb, ${variables}::jsonb, ${!!b.isActive}, ${s.userId}) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name, subject=EXCLUDED.subject, blocks=EXCLUDED.blocks, variables=EXCLUDED.variables, is_active=EXCLUDED.is_active, updated_at=NOW(), updated_by_id=${s.userId}`);
  return NextResponse.json({ ok: true });
}
