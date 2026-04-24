import { NextResponse } from "next/server";
import { loadSettings } from "@/lib/notify";

export async function GET() {
  const g = await loadSettings("general");
  return NextResponse.json({
    siteName: g.platformName || "خدوم",
    siteLogoUrl: g.siteLogoUrl || "",
    description: g.description || "",
    email: g.email || "",
    phone: g.phone || "",
    registrationMode: (g.registrationMode || "open") as "open" | "invite" | "closed",
    maintenanceMode: g.maintenanceMode === "true",
  });
}
