import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ banners: [] });
  const rows: any = await db.execute(sql`
    SELECT id, title, image_url AS "imageUrl", link
    FROM banners
    WHERE is_active = true
      AND (position = 'freelancer-dashboard' OR position = 'all')
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY id DESC LIMIT 10
  `);
  return NextResponse.json({ banners: rows });
}
