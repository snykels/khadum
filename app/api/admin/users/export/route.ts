import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function csvEscape(v: any) {
  if (v == null) return "";
  let s = String(v);
  // Neutralize CSV/Excel formula injection (=, +, -, @, tab, CR)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  s = s.replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const role = sp.get("role") || undefined;
  const idsParam = sp.get("ids");

  const conds: any[] = [];
  if (role) conds.push(eq(users.role, role as any));
  if (idsParam) {
    const ids = idsParam.split(",").map(x => parseInt(x)).filter(Boolean);
    if (ids.length) conds.push(inArray(users.id, ids));
  }

  const rows = await db.select().from(users).where(conds.length ? and(...conds) : undefined);

  let aggMap = new Map<number, { completed: number; earned: string }>();
  if (role === "freelancer" && rows.length) {
    const ids = rows.map(r => r.id);
    const aggs = await db.select({
      fid: orders.freelancerId,
      completed: sql<number>`count(*) FILTER (WHERE ${orders.status}='completed')::int`,
      earned: sql<string>`coalesce(sum(${orders.amount}) FILTER (WHERE ${orders.status}='completed'),0)::text`,
    }).from(orders).where(inArray(orders.freelancerId, ids)).groupBy(orders.freelancerId);
    aggMap = new Map(aggs.map(a => [a.fid!, { completed: a.completed, earned: a.earned }]));
  }

  const headers = [
    "ID", "الاسم", "البريد", "الجوال", "الدور", "موثّق", "موقوف", "محظور",
    "التقييم", "المشاريع المكتملة", "إجمالي الأرباح", "المدينة", "تاريخ التسجيل", "آخر دخول"
  ];

  const lines = [headers.join(",")];
  for (const u of rows) {
    const a = aggMap.get(u.id);
    lines.push([
      u.id,
      csvEscape(u.name),
      csvEscape(u.email),
      csvEscape(u.phone),
      u.role,
      u.isVerified ? "نعم" : "لا",
      u.isSuspended ? "نعم" : "لا",
      u.isBlocked ? "نعم" : "لا",
      u.rating || "0",
      a?.completed ?? u.completedProjects ?? 0,
      a?.earned ?? "0",
      csvEscape(u.location),
      u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "",
      u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
    ].join(","));
  }

  const csv = "\uFEFF" + lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${role || "all"}-${Date.now()}.csv"`,
    },
  });
}
