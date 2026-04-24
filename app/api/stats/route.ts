import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders, services, wallets } from "@/lib/schema";
import { count, sum, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [ordersCount] = await db.select({ count: count() }).from(orders);
    const [servicesCount] = await db.select({ count: count() }).from(services);

    return NextResponse.json({
      users: usersCount.count,
      orders: ordersCount.count,
      services: servicesCount.count,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Database not connected" }, { status: 500 });
  }
}
