"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 أحرف على الأقل", ok: password.length >= 8 },
    { label: "حرف كبير (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "حرف صغير (a-z)", ok: /[a-z]/.test(password) },
    { label: "رقم (0-9)", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#34cc30]", "bg-[#34cc30]"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colors[score] : "bg-gray-200"} transition-colors`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-[#34cc30]" : "text-gray-400"}`}>
            <span>{c.ok ? "✓" : "○"}</span> {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("رابط غير صالح");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "حدث خطأ"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#485869]">تعيين كلمة مرور جديدة</h1>
          <p className="text-gray-500 mt-2 text-sm">أدخل كلمة مرور قوية لحماية حسابك</p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#34cc30" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#485869] mb-3">تم تحديث كلمة المرور!</h2>
            <p className="text-gray-500 text-sm mb-4">سيتم توجيهك لصفحة الدخول خلال ثوانٍ...</p>
            <Link href="/login" className="text-[#34cc30] hover:underline text-sm font-medium">الدخول الآن ←</Link>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            {!token ? null : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#485869] mb-1">كلمة المرور الجديدة</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none" dir="ltr" />
                  {password && <PasswordStrength password={password} />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#485869] mb-1">تأكيد كلمة المرور</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none" dir="ltr" />
                  {confirm && password !== confirm && <p className="text-red-500 text-xs mt-1">كلمتا المرور غير متطابقتين</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] transition-colors disabled:opacity-60 font-medium">
                  {loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور الجديدة"}
                </button>
              </form>
            )}
            <p className="text-center mt-4 text-sm">
              <Link href="/forgot-password" className="text-gray-400 hover:underline text-xs">طلب رابط جديد</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جارٍ التحميل...</div>}>
      <ResetForm />
    </Suspense>
  );
}
