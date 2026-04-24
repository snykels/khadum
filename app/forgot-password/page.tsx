"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "حدث خطأ"); return; }
      setSent(true);
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#34cc30]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#34cc30" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#485869]">نسيت كلمة المرور؟</h1>
          <p className="text-gray-500 mt-2 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#34cc30" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#485869] mb-3">تم إرسال الرابط!</h2>
            <p className="text-gray-600 text-sm mb-2">
              إذا كان البريد <span className="font-medium">{email}</span> مسجّلاً في خدوم، ستصل رسالة بها رابط إعادة التعيين.
            </p>
            <p className="text-gray-400 text-xs mb-6">الرابط صالح لمدة ساعة واحدة. تحقق من مجلد الرسائل غير المرغوب فيها (Spam).</p>
            <Link href="/login" className="text-[#34cc30] hover:underline text-sm font-medium">← العودة لتسجيل الدخول</Link>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#485869] mb-1">البريد الإلكتروني</label>
                <input
                  type="email" required dir="ltr" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none text-right"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] transition-colors disabled:opacity-60 font-medium">
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
            <p className="text-center mt-6 text-sm">
              <Link href="/login" className="text-gray-500 hover:underline">← العودة لتسجيل الدخول</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
