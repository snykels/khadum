'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, User, Mail, Phone, MapPin, FileText, Loader2 } from "lucide-react";
import { patchJson } from "./_helpers";

type Mode = "freelancer" | "client" | "admin";

interface Props {
  open: boolean;
  userId: number | null;
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
  show: (msg: string, ok?: boolean) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  username: string;
  adminRole: string;
}

const ADMIN_ROLES = [
  { id: "owner", label: "مالك" },
  { id: "general", label: "مدير عام" },
  { id: "support", label: "دعم فني" },
  { id: "finance", label: "مالية" },
  { id: "moderator", label: "مشرف محتوى" },
];

export default function UserEditModal({ open, userId, mode, onClose, onSaved, show }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", location: "", bio: "", username: "", adminRole: "",
  });
  const [original, setOriginal] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setErrors({});
    fetch(`/api/admin/users/${userId}/details`)
      .then(r => r.json())
      .then(d => {
        const u = d.user || {};
        const f: FormState = {
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          location: u.location || "",
          bio: u.bio || "",
          username: u.username || "",
          adminRole: u.adminRole || "support",
        };
        setForm(f);
        setOriginal(f);
      })
      .finally(() => setLoading(false));
  }, [open, userId]);

  useEffect(() => {
    if (!open) return;
    function esc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.email.trim()) e.email = "البريد مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "بريد غير صالح";
    if (mode === "client" && !form.phone.trim()) e.phone = "رقم الجوال مطلوب للعميل";
    if (form.phone && !/^\+?\d{8,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "رقم جوال غير صالح";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate() || !userId || !original) return;
    setSaving(true);
    const payload: any = {};
    (Object.keys(form) as (keyof FormState)[]).forEach(k => {
      if (form[k] !== original[k]) {
        if (k === "adminRole" && mode !== "admin") return;
        payload[k] = form[k];
      }
    });
    if (Object.keys(payload).length === 0) {
      show("لا توجد تغييرات للحفظ", false);
      setSaving(false);
      return;
    }
    const { ok, data } = await patchJson(`/api/admin/users/${userId}`, payload);
    setSaving(false);
    if (ok) {
      show("تم حفظ التعديلات بنجاح", true);
      onSaved();
      onClose();
    } else {
      show(data?.error || "فشل الحفظ", false);
    }
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  const accent = mode === "freelancer" ? "#34cc30" : mode === "client" ? "#2563eb" : "#7c3aed";
  const title = mode === "freelancer" ? "تعديل المستقل" : mode === "client" ? "تعديل العميل" : "تعديل المشرف";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-[#1c1f26] rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto pointer-events-auto">
              <div className="sticky top-0 bg-white dark:bg-[#1c1f26] border-b border-gray-100 dark:border-white/5 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#485869] dark:text-white">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">#{userId}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-400">
                  <Loader2 size={28} className="mx-auto mb-2 animate-spin" />
                  <p className="text-sm">جاري التحميل...</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <Field label="الاسم الكامل" icon={User} required error={errors.name}>
                    <input value={form.name} onChange={e => setField("name", e.target.value)}
                      className={inputCls(!!errors.name)} placeholder="مثلاً: محمد العتيبي" />
                  </Field>

                  <Field label="البريد الإلكتروني" icon={Mail} required error={errors.email}>
                    <input type="email" dir="ltr" value={form.email} onChange={e => setField("email", e.target.value)}
                      className={inputCls(!!errors.email) + " text-left"} placeholder="name@example.com" />
                  </Field>

                  <Field label="رقم الجوال" icon={Phone} required={mode === "client"} error={errors.phone}>
                    <input type="tel" dir="ltr" value={form.phone} onChange={e => setField("phone", e.target.value)}
                      className={inputCls(!!errors.phone) + " text-left font-mono"} placeholder="966512345678" />
                  </Field>

                  <Field label="المدينة" icon={MapPin}>
                    <input value={form.location} onChange={e => setField("location", e.target.value)}
                      className={inputCls()} placeholder="مثلاً: الرياض" />
                  </Field>

                  {mode === "admin" && (
                    <>
                      <Field label="اسم المستخدم">
                        <input value={form.username} onChange={e => setField("username", e.target.value)}
                          className={inputCls()} dir="ltr" placeholder="username" />
                      </Field>
                      <Field label="الدور الإداري">
                        <select value={form.adminRole} onChange={e => setField("adminRole", e.target.value)}
                          className={inputCls()}>
                          {ADMIN_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      </Field>
                    </>
                  )}

                  <Field label={mode === "client" ? "ملاحظات/تفاصيل من خدمة العملاء" : "نبذة"} icon={FileText}>
                    <textarea value={form.bio} onChange={e => setField("bio", e.target.value)}
                      rows={3} className={inputCls()} placeholder={mode === "client" ? "اكتب أي تفاصيل أو ملاحظات عن هذا العميل..." : "نبذة موجزة..."} />
                  </Field>
                </div>
              )}

              <div className="sticky bottom-0 bg-white dark:bg-[#1c1f26] border-t border-gray-100 dark:border-white/5 p-4 flex items-center justify-end gap-2">
                <button onClick={onClose} disabled={saving}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                  إلغاء
                </button>
                <button onClick={save} disabled={saving || loading}
                  style={{ backgroundColor: accent }}
                  className="flex items-center gap-2 px-5 py-2 text-sm text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon: Icon, required, error, children }: any) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">
        {Icon && <Icon size={12} />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(err: boolean = false) {
  return `w-full text-sm border ${err ? "border-red-300 focus:ring-red-500/30" : "border-gray-200 dark:border-white/10 focus:ring-[#34cc30]/30"} bg-white dark:bg-[#15171c] rounded-lg px-3 py-2 focus:outline-none focus:ring-2`;
}
