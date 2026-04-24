import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders, wallets, reviews } from "@/lib/schema";
import { and, desc, asc, eq, sql, or, ilike, gte, lte, inArray } from "drizzle-orm";
import { getSession, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}

const SORTABLE: Record<string, any> = {
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
  rating: users.rating,
  completedProjects: users.completedProjects,
  lastLoginAt: users.lastLoginAt,
};

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const role = sp.get("role");
  const adminRole = sp.get("adminRole");
  const status = sp.get("status"); // legacy "suspended"
  const statuses = sp.getAll("statusIn"); // multi: active|suspended|verified|unverified|blocked|pending
  const q = (sp.get("q") || "").trim();
  const verified = sp.get("verified"); // "yes" | "no"
  const ratingMin = parseFloat(sp.get("ratingMin") || "");
  const ratingMax = parseFloat(sp.get("ratingMax") || "");
  const ordersMin = parseInt(sp.get("ordersMin") || "");
  const ordersMax = parseInt(sp.get("ordersMax") || "");
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");
  const location = (sp.get("location") || "").trim();
  const onlineOnly = sp.get("onlineOnly") === "1";
  const sort = sp.get("sort") || "createdAt";
  const order = sp.get("order") || "desc";
  const safeInt = (v: string | null, def: number) => {
    const n = parseInt(v || "");
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const safeDate = (v: string | null) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  const page = Math.max(1, safeInt(sp.get("page"), 1));
  const limit = Math.min(200, Math.max(1, safeInt(sp.get("limit"), 50)));
  const offset = (page - 1) * limit;
  const noPaginate = sp.get("all") === "1";

  const conds: any[] = [];
  if (role) conds.push(eq(users.role, role as any));
  if (adminRole === "any") conds.push(sql`${users.adminRole} IS NOT NULL`);
  if (status === "suspended") conds.push(eq(users.isSuspended, true));

  if (statuses.length) {
    const ors: any[] = [];
    if (statuses.includes("active")) ors.push(and(eq(users.isSuspended, false), eq(users.isBlocked, false)));
    if (statuses.includes("suspended")) ors.push(eq(users.isSuspended, true));
    if (statuses.includes("blocked")) ors.push(eq(users.isBlocked, true));
    if (statuses.includes("verified")) ors.push(eq(users.isVerified, true));
    if (statuses.includes("unverified")) ors.push(eq(users.isVerified, false));
    if (statuses.includes("pending_activation")) ors.push(and(eq(users.activationStatus, "pending"), eq(users.isSuspended, false), eq(users.isBlocked, false)));
    if (statuses.includes("activated")) ors.push(eq(users.activationStatus, "active"));
    if (ors.length) conds.push(or(...ors));
  }
  if (q) {
    conds.push(or(
      ilike(users.name, `%${q}%`),
      ilike(users.email, `%${q}%`),
      ilike(users.phone, `%${q}%`),
      ilike(users.username, `%${q}%`),
      sql`CAST(${users.id} AS TEXT) ILIKE ${`%${q}%`}`,
    ));
  }
  if (verified === "yes") conds.push(eq(users.isVerified, true));
  if (verified === "no") conds.push(eq(users.isVerified, false));
  if (!isNaN(ratingMin)) conds.push(gte(users.rating, String(ratingMin) as any));
  if (!isNaN(ratingMax)) conds.push(lte(users.rating, String(ratingMax) as any));
  if (!isNaN(ordersMin)) conds.push(gte(users.completedProjects, ordersMin));
  if (!isNaN(ordersMax)) conds.push(lte(users.completedProjects, ordersMax));
  const df = safeDate(dateFrom);
  const dt = safeDate(dateTo ? dateTo + "T23:59:59" : null);
  if (df) conds.push(gte(users.createdAt, df));
  if (dt) conds.push(lte(users.createdAt, dt));
  if (location) conds.push(ilike(users.location, `%${location}%`));
  if (onlineOnly) conds.push(sql`${users.lastLoginAt} >= NOW() - INTERVAL '15 minutes'`);

  const whereExp = conds.length ? and(...conds) : undefined;
  const sortCol = SORTABLE[sort] || users.createdAt;
  const orderExp = order === "asc" ? asc(sortCol) : desc(sortCol);

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(users).where(whereExp);

  const baseQuery = db.select().from(users).where(whereExp).orderBy(orderExp);
  const rows = noPaginate ? await baseQuery : await baseQuery.limit(limit).offset(offset);

  if (role === "freelancer" && rows.length) {
    const ids = rows.map(r => r.id);
    const aggs = await db.select({
      fid: orders.freelancerId,
      ordersCount: sql<number>`count(*) FILTER (WHERE ${orders.status}='completed')::int`,
      activeOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('active','pending'))::int`,
      earned: sql<string>`coalesce(sum(${orders.amount}) FILTER (WHERE ${orders.status}='completed'),0)::text`,
      lastOrderAt: sql<string>`max(${orders.createdAt})`,
    }).from(orders).where(inArray(orders.freelancerId, ids)).groupBy(orders.freelancerId);
    const aggMap = new Map(aggs.map(a => [a.fid, a]));

    const wal = await db.select({ uid: wallets.userId, balance: wallets.balance, totalEarned: wallets.totalEarned })
      .from(wallets).where(inArray(wallets.userId, ids));
    const walMap = new Map(wal.map(w => [w.uid, w]));

    const enriched = rows.map(u => {
      const a = aggMap.get(u.id);
      const w = walMap.get(u.id);
      const onlineThreshold = 15 * 60 * 1000;
      const isOnline = u.lastLoginAt ? (Date.now() - new Date(u.lastLoginAt).getTime() < onlineThreshold) : false;
      return {
        ...u,
        ordersCount: a?.ordersCount || 0,
        activeOrders: a?.activeOrders || 0,
        earned: a?.earned || w?.totalEarned || "0",
        balance: w?.balance || "0",
        lastOrderAt: a?.lastOrderAt || null,
        isOnline,
      };
    });
    return NextResponse.json({ users: enriched, total, page, limit });
  }

  if (role === "client" && rows.length) {
    const ids = rows.map(r => r.id);
    const aggs = await db.select({
      cid: orders.clientId,
      ordersCount: sql<number>`count(*)::int`,
      spent: sql<string>`coalesce(sum(${orders.amount}),0)::text`,
      last: sql<string>`max(${orders.createdAt})`,
    }).from(orders).where(inArray(orders.clientId, ids)).groupBy(orders.clientId);
    const m = new Map(aggs.map(a => [a.cid, a]));
    const enriched = rows.map(u => {
      const a = m.get(u.id);
      return { ...u, ordersCount: a?.ordersCount || 0, spent: a?.spent || "0", lastOrder: a?.last || null };
    });
    return NextResponse.json({ users: enriched, total, page, limit });
  }

  return NextResponse.json({ users: rows, total, page, limit });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const { name, email, username, password, adminRole, role } = body;
  if (!name || !email || !password) return NextResponse.json({ error: "الحقول مطلوبة" }, { status: 400 });
  const passwordHash = await hashPassword(password);
  const [u] = await db.insert(users).values({
    name, email, username, passwordHash,
    role: role || "admin",
    adminRole: adminRole || "support",
    isVerified: true,
  }).returning();
  return NextResponse.json({ user: u });
}
