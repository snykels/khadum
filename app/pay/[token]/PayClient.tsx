"use client";

import { useEffect, useMemo, useState } from "react";
import type { TapSource } from "@/lib/tap";

interface Props {
  token: string;
  amount: number;
  currency: string;
  description: string;
  expiresAt: string;
  phoneMasked: string;
  methods: Array<{ id: TapSource; nameAr: string; badge?: string }>;
}

const methodIcon: Record<string, string> = {
  "src_sa.mada": "💳",
  src_card: "🪪",
  src_apple_pay: "",
  "src_sa.stcpay": "📱",
};

export default function PayClient({ token, amount, currency, description, expiresAt, phoneMasked, methods }: Props) {
  const [selected, setSelected] = useState<TapSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const formattedAmount = useMemo(
    () => amount.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [amount],
  );

  async function handlePay() {
    if (!selected) {
      setError("اختر طريقة دفع أولاً");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذّر إتمام العملية");
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("لم يتم استلام رابط الدفع");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-8 px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#34cc30] text-white flex items-center justify-center font-bold">خ</div>
            <div className="font-bold text-[#485869] text-lg">خدوم</div>
          </div>
          <div className="text-xs text-gray-500">khadum.app</div>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-l from-[#485869] to-[#5a6b7c] text-white p-5">
            <div className="text-xs opacity-80 mb-1">المبلغ المطلوب</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{formattedAmount}</span>
              <span className="text-sm opacity-90">{currency === "SAR" ? "ريال" : currency}</span>
            </div>
            <div className="mt-3 text-sm opacity-90 line-clamp-2">{description}</div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
            <span>الجوال: {phoneMasked}</span>
            <span className={remaining < 60 ? "text-red-500 font-bold" : ""}>
              ينتهي خلال {mm}:{ss}
            </span>
          </div>
        </div>

        {/* Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="text-sm font-bold text-[#485869] mb-3">اختر طريقة الدفع</div>
          <div className="space-y-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                disabled={loading || remaining === 0}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  selected === m.id
                    ? "border-[#34cc30] bg-green-50"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                    {methodIcon[m.id] || "💳"}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#485869] text-sm">{m.nameAr}</div>
                    {m.badge && <div className="text-[10px] text-[#34cc30] font-bold mt-0.5">{m.badge}</div>}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === m.id ? "border-[#34cc30] bg-[#34cc30]" : "border-gray-300"
                  }`}
                >
                  {selected === m.id && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-3 text-center">{error}</div>
        )}

        <button
          onClick={handlePay}
          disabled={!selected || loading || remaining === 0}
          className="w-full bg-[#34cc30] hover:bg-[#2bb028] text-white font-bold py-4 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "جاري التحويل..." : remaining === 0 ? "انتهت الصلاحية" : `ادفع ${formattedAmount} ${currency === "SAR" ? "ريال" : currency}`}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>🔒</span>
          <span>الدفع آمن ومشفّر عبر Tap Payments</span>
        </div>
        <div className="text-center text-[11px] text-gray-400 mt-2">
          المبلغ محجوز كأمانة حتى يكتمل العمل
        </div>
      </div>
    </div>
  );
}
