import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const r: any = await db.execute(sql`SELECT id, name, price, features, is_popular AS "isPopular", sort_order AS "sortOrder" FROM subscription_plans ORDER BY sort_order, id`);
    const plans = r.map((p: any) => ({
      ...p,
      features: typeof p.features === "string" ? JSON.parse(p.features) : (p.features || []),
    }));
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}
