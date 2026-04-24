import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = (await db.execute(
      sql`SELECT value FROM settings WHERE ns='landing_content' AND key='blocks_json' LIMIT 1`
    )) as Array<{ value: string }>;
    return NextResponse.json({ content: rows[0]?.value || "" });
  } catch {
    return NextResponse.json({ content: "" });
  }
}
