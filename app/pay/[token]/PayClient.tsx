"use client";

import React, { useEffect, useMemo, useState } from "react";
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

const methodIcon: Record<string, React.ReactNode> = {
  "src_sa.mada": <img src="/mada-logo.svg" alt="mada" className="w-8 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />,
  src_card: <span className="text-xl">💳</span>,
  src_apple_pay: (
    <svg viewBox="0 0 24 24" className="w-8 h-6 fill-current text-gray-800" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  ),
  src_google_pay: (
    <svg viewBox="0 0 24 24" className="w-8 h-6" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.24 9.6v1.68h3.6a3.12 3.12 0 0 1-.81 1.81 3.69 3.69 0 0 1-2.79 1.1 4.01 4.01 0 0 1 0-8.02 3.84 3.84 0 0 1 2.72 1.06l1.19-1.19A5.53 5.53 0 0 0 11.24 4a5.69 5.69 0 1 0 0 11.38 5.21 5.21 0 0 0 3.97-1.6 5.14 5.14 0 0 0 1.35-3.63 5.07 5.07 0 0 0-.08-.95H11.24z" fill="#4285F4"/>
      <path d="M16.28 9.13h-1.51v1.51h-1.51v1.51h1.51v1.51h1.51v-1.51h1.51v-1.51h-1.51z" fill="#34A853"/>
    </svg>
  ),
  "src_sa.stcpay": <span className="text-xl">📱</span>,
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
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    {methodIcon[m.id] || <span className="text-xl">💳</span>}
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
