/**
 * صفحة النتيجة — يصل إليها العميل بعد إتمام / إلغاء الدفع من Tap.
 * Tap يُضيف: ?tap_id=chg_xxx&status=CAPTURED (أو FAILED إلخ)
 *
 * النمط الصحيح:
 *  1. نسجّل returned_from_gateway فور الوصول
 *  2. نقرأ حالة الجلسة من DB (الـ webhook يحدّثها قبل أن يعيد Tap العميل)
 *  3. إن كانت لا تزال pending (الـ webhook لم يصل بعد) → نعرض "جاري التأكيد"
 */
import Link from "next/link";
import { loadAndValidate, logEvent } from "@/lib/paymentSession";

export const dynamic = "force-dynamic";

const WA_LINK = "https://wa.me/966511809878";

export default async function PayReturn({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  const tapStatus = sp.tap_status || sp.status || "";
  const tapId = sp.tap_id || "";

  const result = await loadAndValidate(token);

  // Log returned_from_gateway (best-effort, don't block the page)
  if (result.ok) {
    logEvent(Number(result.session.id), "returned_from_gateway", {
      paymentMethod: tapId ? "tap" : undefined,
      gatewayCode: tapStatus || undefined,
    }).catch(() => undefined);
  }

  // Determine display status
  type DisplayStatus = "paid" | "pending" | "failed" | "expired";
  let displayStatus: DisplayStatus = "pending";

  if (!result.ok) {
    if (result.reason === "already_paid") displayStatus = "paid";
    else displayStatus = "expired";
  } else {
    const sessionStatus = result.session.status;
    if (sessionStatus === "paid") {
      displayStatus = "paid";
    } else if (sessionStatus === "failed" || sessionStatus === "cancelled") {
      displayStatus = "failed";
    } else if (
      tapStatus &&
      ["FAILED", "DECLINED", "CANCELLED", "TIMEDOUT", "VOID", "RESTRICTED"].includes(
        tapStatus.toUpperCase(),
      )
    ) {
      displayStatus = "failed";
    } else if (tapId) {
      // Has tap_id → payment was submitted, webhook pending
      displayStatus = "pending";
    } else {
      displayStatus = "failed";
    }
  }

  // Can the user retry? (session still active and not paid/expired)
  const canRetry =
    displayStatus === "failed" &&
    result.ok &&
    result.session.status !== "paid" &&
    result.session.status !== "expired" &&
    result.session.status !== "cancelled";

  const ui: Record<DisplayStatus, { color: string; bg: string; icon: string; title: string; sub: string }> = {
    paid: {
      color: "#34cc30",
      bg: "bg-green-50",
      icon: "✓",
      title: "تم الدفع بنجاح",
      sub: "المبلغ محجوز كأمانة حتى اكتمال العمل وموافقتك. تم إرسال تأكيد للواتساب.",
    },
    pending: {
      color: "#f59e0b",
      bg: "bg-amber-50",
      icon: "⏳",
      title: "جاري التأكيد",
      sub: "نتحقق من العملية الآن. ستصلك رسالة تأكيد على الواتساب خلال دقائق.",
    },
    failed: {
      color: "#ef4444",
      bg: "bg-red-50",
      icon: "✕",
      title: "لم تكتمل عملية الدفع",
      sub: "لم يُخصم أي مبلغ من حسابك. يمكنك إعادة المحاولة أو الرجوع للواتساب.",
    },
    expired: {
      color: "#9ca3af",
      bg: "bg-gray-50",
      icon: "—",
      title: "انتهت صلاحية الجلسة",
      sub: "اطلب من البوت رابط دفع جديد.",
    },
  };

  const { color, bg, icon, title, sub } = ui[displayStatus];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white`}
          style={{ background: color }}
        >
          {icon}
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-[#485869] mb-2">{title}</h1>
        <p className="text-gray-500 text-sm mb-6">{sub}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {canRetry && (
            <Link
              href={`/pay/${token}`}
              className="w-full inline-block bg-[#34cc30] hover:bg-[#2bb028] text-white font-bold py-3 px-6 rounded-xl transition"
            >
              إعادة المحاولة
            </Link>
          )}

          <Link
            href={WA_LINK}
            className={`w-full inline-block font-semibold py-3 px-6 rounded-xl transition border ${
              canRetry
                ? "border-gray-200 text-[#485869] hover:bg-gray-50"
                : "bg-[#34cc30] hover:bg-[#2bb028] text-white border-transparent"
            }`}
          >
            الرجوع للواتساب
          </Link>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <span>🔒</span>
          <span>الدفع آمن عبر Tap Payments — khadum.app</span>
        </div>
      </div>
    </div>
  );
}
