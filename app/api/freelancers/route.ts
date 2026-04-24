import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const freelancers = await db
      .select()
      .from(users)
      .where(eq(users.role, "freelancer"))
      .orderBy(desc(users.createdAt))
      .limit(50);
    return NextResponse.json(freelancers);
  } catch {
    return NextResponse.json({ error: "Database not connected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [newFreelancer] = await db
      .insert(users)
      .values({ ...body, role: "freelancer" })
      .returning();
    return NextResponse.json(newFreelancer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create freelancer" }, { status: 500 });
  }
}
