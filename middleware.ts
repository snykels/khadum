import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session-options";

async function hashUA(ua: string): Promise<string> {
  const encoded = new TextEncoder().encode(ua);
  const buf = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

function getIpPrefix(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0].trim() || (req as unknown as { ip?: string }).ip || "unknown";
  const parts = ip.split(".");
  if (parts.length >= 3) return parts.slice(0, 3).join(".");
  const v6parts = ip.split(":");
  if (v6parts.length >= 3) return v6parts.slice(0, 3).join(":");
  return ip;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPrefixes = ["/admin", "/freelancer"];
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const ua = req.headers.get("user-agent") ?? "";
  const currentUaHash = await hashUA(ua);
  const currentIpPrefix = getIpPrefix(req);

  if (
    session.uaHash &&
    session.ipPrefix &&
    (session.uaHash !== currentUaHash || session.ipPrefix !== currentIpPrefix)
  ) {
    await session.destroy();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    url.searchParams.set("reason", "security");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/freelancer") &&
    session.role !== "freelancer" &&
    session.role !== "admin"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/freelancer/:path*"],
};
