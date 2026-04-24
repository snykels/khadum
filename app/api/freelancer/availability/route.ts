import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const [row]: any = await db.execute(sql`
    SELECT activation_status AS "activationStatus" FROM users WHERE id = ${s.userId}
  `);
  const status = row?.activationStatus || "active";
  return NextResponse.json({ vacationMode: status === "vacation", status });
}

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const vacation = body?.vacationMode === true;
  const newStatus = vacation ? "vacation" : "active";
  await db.execute(sql`
    UPDATE users SET activation_status = ${newStatus}
    WHERE id = ${s.userId} AND activation_status IN ('active', 'vacation')
  `);
  return NextResponse.json({ ok: true, vacationMode: vacation, status: newStatus });
}
