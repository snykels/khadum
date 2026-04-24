import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { loadAndValidate, logEvent } from "@/lib/paymentSession";
import { PAYMENT_METHODS } from "@/lib/tap";
import PayClient from "./PayClient";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const h = await headers();
  const result = await loadAndValidate(token);

  if (!result.ok) {
    return (
      <ExpiredOrInvalid reason={result.reason} />
    );
  }

  const s = result.session;
  if (s.status === "pending") {
    await logEvent(s.id, "viewed", {
      ip: h.get("x-forwarded-for")?.split(",")[0] || "",
      userAgent: h.get("user-agent") || "",
    });
  }

  return (
    <PayClient
      token={token}
      amount={Number(s.amount)}
      currency={s.currency}
      description={s.description}
      expiresAt={s.expiresAt.toString()}
      phoneMasked={maskPhone(s.clientPhone)}
      methods={PAYMENT_METHODS}
    />
  );
}

function maskPhone(p: string): string {
  if (p.length < 6) return "****";
  return "+" + p.slice(0, 3) + " " + p.slice(3, 5) + "•••••" + p.slice(-2);
}

function ExpiredOrInvalid({ reason }: { reason: string }) {
  const map: Record<string, { title: string; sub: string }> = {
    not_found: { title: "الرابط غير صحيح", sub: "تأكد من نسخه كاملاً، أو تواصل معنا في واتساب." },
    expired: { title: "انتهت صلاحية الرابط", sub: "اطلب من البوت رابط دفع جديد." },
    already_paid: { title: "تم الدفع مسبقاً ✅", sub: "شكراً لك. عملية الدفع لهذا الطلب تمت." },
    cancelled: { title: "تم إلغاء الطلب", sub: "هذا الرابط لم يعد فعّال." },
    phone_mismatch: { title: "رقم الجوال غير مطابق", sub: "هذا الرابط مخصص لرقم آخر." },
  };
  const info = map[reason] || { title: "تعذّر فتح الصفحة", sub: "حاول مرة أخرى لاحقاً." };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">!</div>
        <h1 className="text-xl font-bold text-[#485869] mb-2">{info.title}</h1>
        <p className="text-gray-500 text-sm">{info.sub}</p>
      </div>
    </div>
  );
}
