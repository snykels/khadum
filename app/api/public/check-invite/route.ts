import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false, error: "missing" });
  try {
    const rows: any = await db.execute(sql`SELECT id, email, used_at, expires_at FROM application_invites WHERE token=${token} LIMIT 1`);
    if (!rows.length) return NextResponse.json({ valid: false, error: "not_found" });
    const inv = rows[0];
    if (inv.used_at) return NextResponse.json({ valid: false, error: "used" });
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) return NextResponse.json({ valid: false, error: "expired" });
    return NextResponse.json({ valid: true, email: inv.email || null });
  } catch {
    return NextResponse.json({ valid: false, error: "error" });
  }
}
