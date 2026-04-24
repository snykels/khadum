"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MessageCircle, Send, CheckCircle, ArrowRight, MapPin, Clock } from "lucide-react";

const KHADOM_WHATSAPP = "+966 51 180 9878";
const KHADOM_EMAIL = "help@khadum.app";

function validateTextOnly(v: string) { return /^[\u0600-\u06FFa-zA-Z\s\-\.]+$/.test(v.trim()); }
function validatePhone(v: string) { return /^(9665|05|\+9665)[0-9]{8}$/.test(v.replace(/\s/g, "")); }

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function set(k: string, v: string) {
    // منع إدخال أرقام في حقل الاسم والموضوع والرسالة
    if (k === "name" && /\d/.test(v)) return;
    if (k === "subject" && /\d/.test(v)) return;
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    else if (!validateTextOnly(form.name)) e.name = "الاسم يجب أن يحتوي على حروف فقط";
    if (!form.phone.trim()) e.phone = "رقم الجوال مطلوب";
    else if (!validatePhone(form.phone)) e.phone = "رقم الجوال السعودي غير صحيح (مثال: 0512345678)";
    if (!form.subject.trim()) e.subject = "الموضوع مطلوب";
    if (!form.message.trim()) e.message = "الرسالة مطلوبة";
    else if (form.message.trim().length < 20) e.message = "الرسالة يجب أن تكون 20 حرف على الأقل";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
      else setErrors({ submit: "حدث خطأ، حاول مرة أخرى" });
    } catch {
      setErrors({ submit: "حدث خطأ، حاول مرة أخرى" });
    } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#34cc30]" />
          </div>
          <h2 className="text-xl font-bold text-[#485869] mb-2">تم إرسال رسالتك</h2>
          <p className="text-gray-500 mb-6">سيتواصل معك فريقنا خلال 24 ساعة عمل على رقم جوالك.</p>
          <Link href="/" className="bg-[#34cc30] text-white px-6 py-3 rounded-xl inline-block hover:bg-[#2bb028] transition">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 3000 3000"><path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47Z" /></svg>
            <span className="text-lg font-bold text-[#485869]">خدوم</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#34cc30]">
            <ArrowRight size={16} />
            <span>العودة</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#485869] mb-3">تواصل معنا</h1>
          <p className="text-gray-500">فريقنا يرد خلال أوقات العمل. أسرع طريقة هي واتساب.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            <a
              href={`https://wa.me/${KHADOM_WHATSAPP.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-[#34cc30] transition group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#34cc30] transition">
                <MessageCircle size={20} className="text-[#34cc30] group-hover:text-white transition" />
              </div>
              <div className="font-bold text-[#485869] text-sm mb-1">واتساب</div>
              <div className="text-gray-500 text-xs dir-ltr">{KHADOM_WHATSAPP}</div>
              <div className="text-[10px] text-[#34cc30] mt-1">الأسرع • متاح 24/7</div>
            </a>
            <a
              href={`mailto:${KHADOM_EMAIL}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-[#34cc30] transition group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#34cc30] transition">
                <Mail size={20} className="text-blue-500 group-hover:text-white transition" />
              </div>
              <div className="font-bold text-[#485869] text-sm mb-1">البريد الإلكتروني</div>
              <div className="text-gray-500 text-xs">{KHADOM_EMAIL}</div>
              <div className="text-[10px] text-gray-400 mt-1">رد خلال يوم عمل</div>
            </a>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Clock size={20} className="text-orange-500" />
              </div>
              <div className="font-bold text-[#485869] text-sm mb-1">أوقات العمل</div>
              <div className="text-gray-500 text-xs">الأحد — الخميس</div>
              <div className="text-gray-500 text-xs">9 صباحاً — 10 مساءً</div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#485869] mb-5">أرسل رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="أحمد محمد العمري"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="0512345678"
                    dir="ltr"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">موضوع الرسالة <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => set("subject", e.target.value)}
                  placeholder="استفسار عن... / مشكلة في... / اقتراح..."
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 ${errors.subject ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تفاصيل رسالتك <span className="text-red-500">*</span></label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                  placeholder="اكتب تفاصيل استفسارك أو مشكلتك بشكل واضح..."
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-none ${errors.message ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#34cc30] hover:bg-[#2bb028] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "جاري الإرسال..." : <><Send size={16} /> إرسال الرسالة</>}
              </button>
              <p className="text-xs text-gray-400 text-center">لمشاكل الدفع العاجلة، تواصل مباشرة عبر واتساب</p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
