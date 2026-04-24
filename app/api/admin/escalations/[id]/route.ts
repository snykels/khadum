import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const s = await getSession();
  if (!s || s.role !== "admin")
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const escalationId = Number(id);
  if (!escalationId)
    return NextResponse.json({ error: "id غير صالح" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "").trim();
  const note = body.note ? String(body.note) : null;

  const adminId = s.userId ?? null;

  const existing = (await db.execute(sql`
    SELECT id, status FROM escalations WHERE id = ${escalationId} LIMIT 1
  `)) as unknown as Array<{ id: number; status: string }>;
  if (!existing.length) {
    return NextResponse.json({ error: "التصعيد غير موجود" }, { status: 404 });
  }

  if (action === "claim") {
    await db.execute(sql`
      UPDATE escalations
      SET status='in_progress', assigned_to=${adminId}
      WHERE id=${escalationId}
    `);
  } else if (action === "resolve") {
    await db.execute(sql`
      UPDATE escalations
      SET status='resolved', resolution_note=${note},
          resolved_at=NOW(), assigned_to=COALESCE(assigned_to, ${adminId})
      WHERE id=${escalationId}
    `);
  } else if (action === "reopen") {
    await db.execute(sql`
      UPDATE escalations
      SET status='new', resolution_note=NULL, resolved_at=NULL
      WHERE id=${escalationId}
    `);
  } else {
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  }

  interface EscalationRow {
    id: number;
    status: string;
    assignedTo: number | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
  }
  const rows = (await db.execute(sql`
    SELECT id, status, assigned_to AS "assignedTo",
           resolution_note AS "resolutionNote",
           resolved_at AS "resolvedAt"
    FROM escalations WHERE id=${escalationId}
  `)) as unknown as EscalationRow[];
  return NextResponse.json({ ok: true, item: rows[0] });
}
