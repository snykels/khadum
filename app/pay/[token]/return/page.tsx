import Link from "next/link";
import { loadAndValidate } from "@/lib/paymentSession";

export const dynamic = "force-dynamic";

export default async function PayReturn({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const result = await loadAndValidate(token);

  let status: "paid" | "pending" | "failed" | "expired" = "pending";
  if (!result.ok) {
    status = result.reason === "already_paid" ? "paid" : "expired";
  } else if (result.session.status === "paid") {
    status = "paid";
  } else if (result.session.status === "failed") {
    status = "failed";
  } else if (sp.tap_id) {
    status = "pending";
  }

  const ui = {
    paid: { color: "#34cc30", icon: "✓", title: "تم الدفع بنجاح", sub: "المبلغ محجوز كأمانة. أرسلنا تأكيد للواتساب." },
    pending: { color: "#f59e0b", icon: "⏳", title: "جاري التأكيد", sub: "نتحقق من العملية الآن، راح يوصلك تأكيد للواتساب خلال دقائق." },
    failed: { color: "#ef4444", icon: "✕", title: "فشلت العملية", sub: "ما تم خصم المبلغ. ارجع للواتساب وجرّب مرة ثانية." },
    expired: { color: "#9ca3af", icon: "—", title: "الجلسة منتهية", sub: "اطلب من البوت رابط دفع جديد." },
  }[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white"
          style={{ background: ui.color }}
        >
          {ui.icon}
        </div>
        <h1 className="text-xl font-bold text-[#485869] mb-2">{ui.title}</h1>
        <p className="text-gray-500 text-sm mb-6">{ui.sub}</p>
        <Link
          href="https://wa.me/966511809878"
          className="inline-block bg-[#34cc30] hover:bg-[#2bb028] text-white font-bold py-3 px-6 rounded-xl transition"
        >
          الرجوع للواتساب
        </Link>
      </div>
    </div>
  );
}
