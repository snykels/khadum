import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin")
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  interface EscalationListRow {
    id: number;
    phone: string;
    reason: string;
    priority: string;
    summary: string;
    conversationSnapshot: unknown;
    status: string;
    assignedTo: number | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
    createdAt: string;
    assignedToName: string | null;
  }

  const rawRows = await (status
    ? db.execute(sql`
        SELECT e.id, e.phone, e.reason, e.priority, e.summary,
               e.conversation_snapshot AS "conversationSnapshot",
               e.status, e.assigned_to AS "assignedTo",
               e.resolution_note AS "resolutionNote",
               e.resolved_at AS "resolvedAt",
               e.created_at AS "createdAt",
               u.name AS "assignedToName"
        FROM escalations e
        LEFT JOIN users u ON u.id = e.assigned_to
        WHERE e.status = ${status}
        ORDER BY
          CASE e.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1
                         WHEN 'normal' THEN 2 ELSE 3 END,
          e.created_at DESC
        LIMIT 200
      `)
    : db.execute(sql`
        SELECT e.id, e.phone, e.reason, e.priority, e.summary,
               e.conversation_snapshot AS "conversationSnapshot",
               e.status, e.assigned_to AS "assignedTo",
               e.resolution_note AS "resolutionNote",
               e.resolved_at AS "resolvedAt",
               e.created_at AS "createdAt",
               u.name AS "assignedToName"
        FROM escalations e
        LEFT JOIN users u ON u.id = e.assigned_to
        ORDER BY
          CASE e.status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
          CASE e.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1
                         WHEN 'normal' THEN 2 ELSE 3 END,
          e.created_at DESC
        LIMIT 200
      `));
  const rows = rawRows as unknown as EscalationListRow[];

  const counts = (await db.execute(sql`
    SELECT status, COUNT(*)::int AS n FROM escalations GROUP BY status
  `)) as unknown as Array<{ status: string; n: number }>;
  const summary: Record<string, number> = { new: 0, in_progress: 0, resolved: 0 };
  for (const c of counts) summary[c.status] = c.n;

  return NextResponse.json({ items: rows, summary });
}
