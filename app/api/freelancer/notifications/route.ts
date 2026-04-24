import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
  const onlyUnread = searchParams.get("unread") === "1";

  const conds = [
    or(eq(notifications.userId, s.userId), isNull(notifications.userId))!,
  ];
  if (onlyUnread) conds.push(eq(notifications.isRead, false));

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conds))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ids, all } = body;

  if (all === true) {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, s.userId), eq(notifications.isRead, false)));
    return NextResponse.json({ ok: true });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids مطلوبة" }, { status: 400 });
  }

  for (const id of ids) {
    const n = Number(id);
    if (!Number.isFinite(n)) continue;
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, n), eq(notifications.userId, s.userId)));
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, s.userId)));
  return NextResponse.json({ ok: true });
}
