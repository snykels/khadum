import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sseStream } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return sseStream("admin:conv");
}
