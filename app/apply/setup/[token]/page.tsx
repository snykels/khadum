'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, X } from "lucide-react";

export default function SetupPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{ email: string; name: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/apply/setup/${token}`).then(r => r.json()).then(d => {
      if (d.error) setError(d.error);
      else setInfo({ email: d.email, name: d.name });
      setLoading(false);
    });
  }, [token]);

  async function submit() {
    setError("");
    if (password.length < 8) return setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين");
    setSubmitting(true);
    const r = await fetch(`/api/apply/setup/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const d = await r.json();
    setSubmitting(false);
    if (!r.ok) return setError(d.error || "حدث خطأ");
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        {loading ? (
          <p className="text-center text-gray-500">جارٍ التحقق من الرابط...</p>
        ) : error && !done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
            <h1 className="text-xl font-bold text-[#485869] mb-2">{error}</h1>
            <Link href="/" className="text-[#34cc30] hover:underline text-sm">العودة للرئيسية</Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#34cc30] rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-white" /></div>
            <h1 className="text-xl font-bold text-[#485869] mb-2">تم تأكيد البريد وتعيين كلمة المرور</h1>
            <p className="text-gray-500 text-sm mb-6">سيتم مراجعة طلبك خلال 24-48 ساعة وسيصلك إشعار بالنتيجة.</p>
            <Link href="/" className="inline-block bg-[#34cc30] text-white px-5 py-2 rounded-lg hover:bg-[#2eb829]">العودة للرئيسية</Link>
          </div>
        ) : info && (
          <div>
            <h1 className="text-xl font-bold text-[#485869] mb-1">مرحباً {info.name}</h1>
            <p className="text-sm text-gray-500 mb-6">قم بتعيين كلمة مرور خاصة بحسابك على البريد <span dir="ltr">{info.email}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} dir="ltr" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" placeholder="8 أحرف على الأقل" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} dir="ltr" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={submit} disabled={submitting} className="w-full bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] disabled:opacity-50">{submitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
