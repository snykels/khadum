import { NextResponse } from "next/server";
import { loadSettings } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await loadSettings("landing");
  return NextResponse.json({
    heroFreelancers: s.heroFreelancers || "+50,000",
    heroServices: s.heroServices || "+120,000",
    heroOrders: s.heroOrders || "+300,000",
    heroRating: s.heroRating || "4.9",
    heroTagline: s.heroTagline || "منصة المستقلين السعودية الأولى",
    heroCta: s.heroCta || "اطلب خدمة الآن عبر واتساب",
  });
}
