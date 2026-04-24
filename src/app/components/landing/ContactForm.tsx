'use client';

import { useState } from "react";
import { Send, MessageCircle, Phone, User, Mail, FileText, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.message) {
      setError("الاسم ورقم الجوال والرسالة مطلوبة");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "خطأ");
      setDone(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      setTimeout(() => setDone(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الإرسال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-[#34cc30]/5 via-white to-white dark:from-[#34cc30]/10 dark:via-[#0f1115] dark:to-[#0f1115]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#34cc30]/10 text-[#34cc30] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageCircle size={16} /> تواصل معنا
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] dark:text-white mb-3">
            عندك سؤال أو اقتراح؟
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            أرسل لنا رسالتك وسنعاود التواصل معك خلال ساعات قليلة عبر واتساب.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Info side */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-[#2a2d36]">
              <div className="w-12 h-12 rounded-xl bg-[#34cc30]/10 text-[#34cc30] flex items-center justify-center mb-4">
                <MessageCircle size={22} />
              </div>
              <div className="font-bold text-[#485869] dark:text-white mb-1">واتساب الدعم</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">رد سريع خلال دقائق</div>
              <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer" className="text-[#34cc30] text-sm font-medium hover:underline" dir="ltr">
                +966 51 180 9878
              </a>
            </div>
            <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-[#2a2d36]">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4">
                <Mail size={22} />
              </div>
              <div className="font-bold text-[#485869] dark:text-white mb-1">البريد الإلكتروني</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">للاستفسارات الرسمية</div>
              <a href="mailto:help@khadum.app" className="text-blue-600 text-sm font-medium hover:underline" dir="ltr">
                help@khadum.app
              </a>
            </div>
          </div>

          {/* Form side */}
          <form onSubmit={submit} className="md:col-span-3 bg-white dark:bg-[#1a1d24] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-[#2a2d36] shadow-sm">
            {done && (
              <div className="bg-[#34cc30]/10 border border-[#34cc30]/30 text-[#34cc30] rounded-xl p-4 mb-5 flex items-center gap-3">
                <CheckCircle2 size={20} />
                <div>
                  <div className="font-bold">تم استلام رسالتك بنجاح!</div>
                  <div className="text-sm opacity-90">سنتواصل معك قريباً عبر واتساب.</div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field icon={User} label="الاسم الكامل" required>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="khadom-input" placeholder="مثال: أحمد محمد" />
              </Field>
              <Field icon={Phone} label="رقم الجوال (واتساب)" required>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="khadom-input" placeholder="+966 5x xxx xxxx" dir="ltr" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field icon={Mail} label="البريد الإلكتروني (اختياري)">
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="khadom-input" placeholder="email@example.com" dir="ltr" />
              </Field>
              <Field icon={FileText} label="الموضوع">
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="khadom-input" placeholder="مثال: استفسار عن الخدمات" />
              </Field>
            </div>

            <Field icon={MessageCircle} label="رسالتك" required>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} className="khadom-input resize-none" placeholder="اكتب رسالتك هنا..." />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-[#34cc30] hover:bg-[#2eb829] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? "جاري الإرسال..." : <><Send size={18} /> إرسال الرسالة</>}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .khadom-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          background: white;
          color: #485869;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .khadom-input:focus {
          outline: none;
          border-color: #34cc30;
          box-shadow: 0 0 0 3px rgba(52,204,48,0.15);
        }
        .dark .khadom-input {
          background: #252830;
          border-color: #2a2d36;
          color: #e5e7eb;
        }
      `}</style>
    </section>
  );
}

function Field({ icon: Icon, label, required, children }: { icon: typeof User; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#485869] dark:text-gray-200 mb-1.5">
        <Icon size={14} className="text-[#34cc30]" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
