'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle, Ban, Lock, Star, MessageSquare, ExternalLink, Edit, Save,
  TrendingUp, Wallet, ShoppingBag, AlertTriangle, Clock, Award,
  Phone, Mail, MapPin, Calendar, Activity, FileText, Send, Image, Briefcase,
  Link2, CreditCard, User, ChevronDown, ChevronUp,
} from "lucide-react";
import { fmt, dateAr, timeAgo, patchJson } from "../_helpers";
import { openWhatsAppChat } from "../_whatsapp";
import UserEditModal from "../UserEditModal";

interface Props {
  userId: number | null;
  onClose: () => void;
  onChanged: () => void;
  show: (msg: string, ok?: boolean) => void;
}

export default function FreelancerDrawer({ userId, onClose, onChanged, show }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "orders" | "wallet" | "reviews" | "application" | "actions">("overview");
  const [actionReason, setActionReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const [appEditing, setAppEditing] = useState(false);
  const [appForm, setAppForm] = useState<any>({});
  const [appSaving, setAppSaving] = useState(false);

  async function reloadDetails() {
    if (!userId) return;
    const r = await fetch(`/api/admin/users/${userId}/details`);
    const d = await r.json();
    setData(d);
    setAppForm(d.application || {});
  }

  useEffect(() => {
    if (!userId) { setData(null); setAppForm({}); return; }
    setLoading(true);
    fetch(`/api/admin/users/${userId}/details`)
      .then(r => r.json())
      .then(d => { setData(d); setAppForm(d.application || {}); })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    function esc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [userId, onClose]);

  async function doAction(action: "verify" | "unverify" | "suspend" | "unsuspend" | "block" | "unblock") {
    if (!userId) return;
    const payload: any = {};
    if (action === "verify") payload.isVerified = true;
    if (action === "unverify") payload.isVerified = false;
    if (action === "suspend") { payload.isSuspended = true; payload.reason = actionReason || "مخالفة شروط الخدمة"; }
    if (action === "unsuspend") payload.isSuspended = false;
    if (action === "block") { payload.isBlocked = true; payload.reason = actionReason || "حظر إداري"; }
    if (action === "unblock") payload.isBlocked = false;
    const { ok, data: res } = await patchJson(`/api/admin/users/${userId}`, payload);
    show(ok ? "تم التحديث" : (res?.error || "فشل الإجراء"), ok);
    if (ok) {
      setActionReason("");
      onChanged();
      const r = await fetch(`/api/admin/users/${userId}/details`);
      const d = await r.json();
      setData(d);
      setAppForm(d.application || {});
    }
  }

  async function saveApplication() {
    if (!data?.application?.id) return;
    setAppSaving(true);
    try {
      const r = await fetch(`/api/admin/applications/${data.application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm),
      });
      const res = await r.json();
      if (r.ok) {
        show("تم حفظ بيانات التقديم", true);
        setAppEditing(false);
        setData((prev: any) => ({ ...prev, application: res.application }));
      } else {
        show(res.error || "فشل الحفظ", false);
      }
    } finally {
      setAppSaving(false);
    }
  }

  function openWhatsApp() {
    if (!data?.user?.phone) { show("لا يوجد رقم جوال", false); return; }
    openWhatsAppChat(data.user.phone);
  }

  const u = data?.user;
  const stats = data?.stats || {};
  const wallet = data?.wallet;
  const orders: any[] = data?.recentOrders || [];
  const withdrawals: any[] = data?.withdrawals || [];
  const reviews: any[] = data?.reviews || [];
  const application = data?.application;

  function af(key: string) { return appForm[key] || ""; }
  function setAf(key: string, val: string) { setAppForm((p: any) => ({ ...p, [key]: val })); }

  return (
    <AnimatePresence>
      {userId && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[580px] bg-white dark:bg-[#15171c] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-[#1f2229] to-[#2a2e38] text-white p-5 z-10">
              <div className="flex items-start justify-between gap-3">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
                <div className="flex-1 text-right">
                  <div className="text-xs text-white/60">تفاصيل المستخدم</div>
                  <div className="text-sm text-white/80">#{userId}</div>
                </div>
              </div>
              {loading && <div className="text-center text-white/70 text-sm mt-4">جاري التحميل...</div>}
              {u && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/10">
                      {u.avatar
                        ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        : u.name?.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1f2229] ${
                      u.isOnline ? "bg-emerald-500" : "bg-gray-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold truncate">{u.name}</h2>
                      {u.isVerified && <CheckCircle size={16} className="text-[#34cc30]" />}
                      {u.isLocked && <span title="حساب محمي"><Lock size={14} className="text-amber-400" /></span>}
                    </div>
                    <div className="text-xs text-white/60 truncate">{u.email}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {u.isSuspended && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">موقوف</span>}
                      {u.isBlocked && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">محظور</span>}
                      {!u.isSuspended && !u.isBlocked && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">نشط</span>}
                      {u.isOnline && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">متصل الآن</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Bar */}
            {u && (
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 flex-wrap">
                <button onClick={openWhatsApp} className="flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                  <MessageSquare size={14} /> محادثة واتساب
                </button>
                {u.email && (
                  <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
                    <Mail size={14} /> إيميل
                  </a>
                )}
                {u.phone && (
                  <a href={`tel:${u.phone}`} className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    <Phone size={14} /> اتصال
                  </a>
                )}
                <button onClick={() => setEditOpen(true)} disabled={u.isLocked}
                  className="flex items-center gap-1.5 text-xs bg-[#34cc30]/10 hover:bg-[#34cc30]/20 text-[#34cc30] px-3 py-1.5 rounded-lg mr-auto disabled:opacity-40">
                  <Edit size={14} /> تعديل البيانات
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="px-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "نظرة عامة", icon: Activity },
                { id: "application", label: "ملف التقديم", icon: FileText },
                { id: "orders", label: "الطلبات", icon: ShoppingBag },
                { id: "wallet", label: "المالية", icon: Wallet },
                { id: "reviews", label: "التقييمات", icon: Star },
                { id: "actions", label: "إجراءات", icon: AlertTriangle },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? "border-[#34cc30] text-[#34cc30]"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {tab === "overview" && u && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox icon={ShoppingBag} label="المشاريع المكتملة" value={fmt(stats.completed || 0)} color="text-emerald-600" />
                    <StatBox icon={Clock} label="نشطة الآن" value={fmt(stats.active || 0)} color="text-blue-600" />
                    <StatBox icon={AlertTriangle} label="ملغاة" value={fmt(stats.cancelled || 0)} color="text-amber-600" />
                    <StatBox icon={AlertTriangle} label="نزاعات" value={fmt(stats.disputed || 0)} color="text-red-600" />
                    <StatBox icon={TrendingUp} label="إجمالي الأرباح" value={`${fmt(stats.earned || 0)} ر.س`} color="text-[#34cc30]" />
                    <StatBox icon={Star} label="التقييم" value={Number(u.rating || 0).toFixed(1)} color="text-amber-600" />
                  </div>

                  <Section title="بيانات الحساب">
                    <Row icon={Phone} label="الجوال" value={u.phone || "—"} dir="ltr" />
                    <Row icon={Mail} label="البريد" value={u.email} />
                    <Row icon={MapPin} label="المدينة" value={u.location || "—"} />
                    <Row icon={Calendar} label="تاريخ التسجيل" value={dateAr(u.createdAt)} />
                    <Row icon={Activity} label="آخر دخول" value={u.lastLoginAt ? timeAgo(u.lastLoginAt) : "لم يدخل بعد"} />
                  </Section>

                  {u.bio && (
                    <Section title="نبذة">
                      <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed">{u.bio}</p>
                    </Section>
                  )}
                </>
              )}

              {/* ========== ملف التقديم ========== */}
              {tab === "application" && (
                <>
                  {!application ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                      <FileText size={32} className="mx-auto mb-3 opacity-30" />
                      لا يوجد ملف تقديم مرتبط بهذا الحساب
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Header + edit toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-400">رقم التقديم #{application.id}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            الحالة: <span className={`font-semibold ${
                              application.status === "approved" ? "text-emerald-600"
                              : application.status === "rejected" ? "text-red-600"
                              : "text-amber-600"
                            }`}>
                              {{ approved: "مقبول", rejected: "مرفوض", pending: "قيد المراجعة" }[application.status as string] || application.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => appEditing ? saveApplication() : setAppEditing(true)}
                          disabled={appSaving}
                          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                            appEditing
                              ? "bg-[#34cc30] text-white hover:bg-[#2eb829] disabled:opacity-50"
                              : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10"
                          }`}
                        >
                          {appEditing ? <><Save size={14} />{appSaving ? "جاري الحفظ..." : "حفظ التعديلات"}</> : <><Edit size={14} />تعديل</>}
                        </button>
                        {appEditing && (
                          <button onClick={() => { setAppEditing(false); setAppForm(application); }}
                            className="text-xs text-gray-400 hover:text-gray-700 px-2 py-2 mr-1">إلغاء</button>
                        )}
                      </div>

                      {/* Personal */}
                      <AppSection title="البيانات الشخصية" icon={User}>
                        <AppGrid>
                          <AppField label="الاسم الكامل" value={application.name} editing={appEditing} formKey="name" af={af} setAf={setAf} />
                          <AppField label="الجوال" value={application.phone} editing={appEditing} formKey="phone" af={af} setAf={setAf} dir="ltr" />
                          <AppField label="البريد الإلكتروني" value={application.email} editing={appEditing} formKey="email" af={af} setAf={setAf} dir="ltr" />
                          <AppField label="الجنس" value={application.gender} editing={appEditing} formKey="gender" af={af} setAf={setAf}
                            select={[{ value: "male", label: "ذكر" }, { value: "female", label: "أنثى" }]} />
                          <AppField label="تاريخ الميلاد" value={application.dateOfBirth} editing={appEditing} formKey="dateOfBirth" af={af} setAf={setAf} dir="ltr" />
                          <AppField label="الدولة" value={application.country} editing={appEditing} formKey="country" af={af} setAf={setAf} />
                          <AppField label="المدينة" value={application.city} editing={appEditing} formKey="city" af={af} setAf={setAf} />
                        </AppGrid>
                      </AppSection>

                      {/* Professional */}
                      <AppSection title="البيانات المهنية" icon={Briefcase}>
                        <AppGrid>
                          <AppField label="التخصص الرئيسي" value={application.mainCategory} editing={appEditing} formKey="mainCategory" af={af} setAf={setAf} fullWidth />
                          <AppField label="التخصص الفرعي" value={application.subCategory} editing={appEditing} formKey="subCategory" af={af} setAf={setAf} fullWidth />
                          <AppField label="سنوات الخبرة" value={application.yearsExperience} editing={appEditing} formKey="yearsExperience" af={af} setAf={setAf}
                            select={[
                              { value: "less_than_1", label: "أقل من سنة" },
                              { value: "1_to_3", label: "1-3 سنوات" },
                              { value: "3_to_5", label: "3-5 سنوات" },
                              { value: "5_to_10", label: "5-10 سنوات" },
                              { value: "more_than_10", label: "أكثر من 10 سنوات" },
                            ]} />
                          <AppField label="اللغات" value={application.languages} editing={appEditing} formKey="languages" af={af} setAf={setAf} />
                        </AppGrid>
                        <div className="mt-3">
                          <AppField label="المهارات" value={application.skills} editing={appEditing} formKey="skills" af={af} setAf={setAf} fullWidth textarea />
                        </div>
                        <div className="mt-3">
                          <AppField label="نبذة / سيرة ذاتية" value={application.bio} editing={appEditing} formKey="bio" af={af} setAf={setAf} fullWidth textarea rows={4} />
                        </div>
                        <div className="mt-3">
                          <AppField label="دوافع الانضمام" value={application.motivation} editing={appEditing} formKey="motivation" af={af} setAf={setAf} fullWidth textarea rows={3} />
                        </div>
                      </AppSection>

                      {/* Portfolio */}
                      <AppSection title="روابط المحفظة" icon={Link2}>
                        <AppGrid>
                          <AppField label="رابط المحفظة" value={application.portfolioUrl} editing={appEditing} formKey="portfolioUrl" af={af} setAf={setAf} fullWidth dir="ltr" isUrl />
                          <AppField label="رابط LinkedIn" value={application.linkedinUrl} editing={appEditing} formKey="linkedinUrl" af={af} setAf={setAf} fullWidth dir="ltr" isUrl />
                        </AppGrid>
                        {application.portfolioFiles && (
                          <div className="mt-3">
                            <AppField label="ملفات المحفظة (روابط مفصولة بفاصلة)" value={application.portfolioFiles} editing={appEditing} formKey="portfolioFiles" af={af} setAf={setAf} fullWidth textarea rows={3} dir="ltr" />
                            {!appEditing && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {application.portfolioFiles.split(/[,\n]+/).filter(Boolean).map((url: string, i: number) => (
                                  <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                    <ExternalLink size={10} /> ملف {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </AppSection>

                      {/* Identity Documents */}
                      <AppSection title="وثائق الهوية" icon={Image}>
                        <AppGrid>
                          <AppField label="نوع الهوية" value={application.idType} editing={appEditing} formKey="idType" af={af} setAf={setAf}
                            select={[{ value: "national_id", label: "هوية وطنية" }, { value: "passport", label: "جواز سفر" }, { value: "iqama", label: "إقامة" }]} />
                          <AppField label="رقم الهوية" value={application.nationalIdNumber} editing={appEditing} formKey="nationalIdNumber" af={af} setAf={setAf} dir="ltr" />
                          <AppField label="رقم جواز السفر" value={application.passportNumber} editing={appEditing} formKey="passportNumber" af={af} setAf={setAf} dir="ltr" />
                        </AppGrid>
                        <div className="mt-3 space-y-2">
                          <AppField label="رابط الهوية (صورة)" value={application.nationalIdImage} editing={appEditing} formKey="nationalIdImage" af={af} setAf={setAf} fullWidth dir="ltr" isDocImage />
                          <AppField label="رابط الهوية (وجه)" value={application.nationalIdFrontImage} editing={appEditing} formKey="nationalIdFrontImage" af={af} setAf={setAf} fullWidth dir="ltr" isDocImage />
                          <AppField label="رابط الهوية (ظهر)" value={application.nationalIdBackImage} editing={appEditing} formKey="nationalIdBackImage" af={af} setAf={setAf} fullWidth dir="ltr" isDocImage />
                          <AppField label="وثائق إضافية" value={application.verificationDocuments} editing={appEditing} formKey="verificationDocuments" af={af} setAf={setAf} fullWidth dir="ltr" isDocImage />
                        </div>
                      </AppSection>

                      {/* Bank */}
                      <AppSection title="البيانات البنكية" icon={CreditCard}>
                        <AppGrid>
                          <AppField label="اسم البنك" value={application.bankName} editing={appEditing} formKey="bankName" af={af} setAf={setAf} />
                          <AppField label="اسم صاحب الحساب" value={application.accountHolderName} editing={appEditing} formKey="accountHolderName" af={af} setAf={setAf} />
                          <AppField label="رقم الآيبان (IBAN)" value={application.iban} editing={appEditing} formKey="iban" af={af} setAf={setAf} fullWidth dir="ltr" />
                        </AppGrid>
                        <div className="mt-3">
                          <AppField label="وثيقة الآيبان (رابط)" value={application.ibanDocument} editing={appEditing} formKey="ibanDocument" af={af} setAf={setAf} fullWidth dir="ltr" isDocImage />
                        </div>
                      </AppSection>

                      {/* Save footer */}
                      {appEditing && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                          <button onClick={saveApplication} disabled={appSaving}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#34cc30] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#2eb829] disabled:opacity-50 transition-colors">
                            <Save size={16} />{appSaving ? "جاري الحفظ..." : "حفظ جميع التعديلات"}
                          </button>
                          <button onClick={() => { setAppEditing(false); setAppForm(application); }}
                            className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {tab === "orders" && (
                <Section title={`آخر الطلبات (${orders.length})`}>
                  {orders.length === 0 ? <Empty text="لا توجد طلبات" /> : (
                    <div className="space-y-2">
                      {orders.map(o => (
                        <div key={o.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-bold text-sm text-[#485869] dark:text-white">
                              #{o.publicCode || `ORD-${String(o.id).padStart(4, "0")}`}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                              {statusLabel(o.status)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-white/60 truncate">{o.serviceTitle || "—"}</div>
                          <div className="flex items-center justify-between mt-1.5 text-xs">
                            <span className="text-gray-500">{dateAr(o.createdAt)}</span>
                            <span className="font-bold text-[#485869] dark:text-white">{fmt(o.amount)} ر.س</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {tab === "wallet" && (
                <>
                  <Section title="المحفظة">
                    {wallet ? (
                      <div className="grid grid-cols-3 gap-2">
                        <StatBox icon={Wallet} label="الرصيد" value={`${fmt(wallet.balance)}`} color="text-emerald-600" small />
                        <StatBox icon={Clock} label="معلّق" value={`${fmt(wallet.pending)}`} color="text-amber-600" small />
                        <StatBox icon={TrendingUp} label="إجمالي" value={`${fmt(wallet.totalEarned)}`} color="text-blue-600" small />
                      </div>
                    ) : <Empty text="لا توجد محفظة" />}
                  </Section>
                  <Section title={`السحوبات (${withdrawals.length})`}>
                    {withdrawals.length === 0 ? <Empty text="لا سحوبات" /> : (
                      <div className="space-y-2">
                        {withdrawals.map(w => (
                          <div key={w.id} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-sm">
                            <div>
                              <div className="font-bold text-[#485869] dark:text-white">{fmt(w.amount)} ر.س</div>
                              <div className="text-xs text-gray-500">{dateAr(w.createdAt)}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${withdrawalStatusColor(w.status)}`}>
                              {withdrawalStatusLabel(w.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </>
              )}

              {tab === "reviews" && (
                <Section title={`التقييمات (${reviews.length})`}>
                  {reviews.length === 0 ? <Empty text="لا توجد تقييمات" /> : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-sm text-[#485869] dark:text-white">{r.reviewerName || "عميل"}</div>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-xs text-gray-700 dark:text-white/70">{r.comment}</p>}
                          <div className="text-[10px] text-gray-400 mt-1">{dateAr(r.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {tab === "actions" && u && (
                <div className="space-y-4">
                  {u.isLocked && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 text-xs p-3 rounded-xl flex items-center gap-2">
                      <Lock size={14} /> هذا الحساب محمي ولا يمكن تعديله من خلال هذه الواجهة.
                    </div>
                  )}
                  <Section title="سبب الإجراء (اختياري)">
                    <textarea
                      value={actionReason}
                      onChange={e => setActionReason(e.target.value)}
                      placeholder="اكتب السبب هنا..."
                      rows={2}
                      className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1f26] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                    />
                  </Section>
                  <Section title="التوثيق">
                    <div className="grid grid-cols-2 gap-2">
                      <ActionBtn onClick={() => doAction("verify")} disabled={u.isVerified || u.isLocked} icon={CheckCircle} variant="success">توثيق</ActionBtn>
                      <ActionBtn onClick={() => doAction("unverify")} disabled={!u.isVerified || u.isLocked} icon={X}>إلغاء التوثيق</ActionBtn>
                    </div>
                  </Section>
                  <Section title="الإيقاف المؤقت">
                    <div className="grid grid-cols-2 gap-2">
                      <ActionBtn onClick={() => doAction("suspend")} disabled={u.isSuspended || u.isLocked} icon={Ban} variant="warn">إيقاف</ActionBtn>
                      <ActionBtn onClick={() => doAction("unsuspend")} disabled={!u.isSuspended || u.isLocked} icon={CheckCircle}>إلغاء الإيقاف</ActionBtn>
                    </div>
                  </Section>
                  <Section title="الحظر الكامل">
                    <div className="grid grid-cols-2 gap-2">
                      <ActionBtn onClick={() => doAction("block")} disabled={u.isBlocked || u.isLocked} icon={Lock} variant="danger">حظر</ActionBtn>
                      <ActionBtn onClick={() => doAction("unblock")} disabled={!u.isBlocked || u.isLocked} icon={CheckCircle}>إلغاء الحظر</ActionBtn>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          </motion.div>
          <UserEditModal open={editOpen} userId={userId} mode="freelancer"
            onClose={() => setEditOpen(false)} onSaved={() => { onChanged(); reloadDetails(); }} show={show} />
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Application Section components ---------- */
function AppSection({ title, icon: Icon, children }: any) {
  return (
    <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-white/60 uppercase tracking-wide">
        <Icon size={13} /> {title}
      </div>
      <div className="p-4 space-y-1">{children}</div>
    </div>
  );
}

function AppGrid({ children }: any) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function AppField({ label, value, editing, formKey, af, setAf, fullWidth, textarea, rows = 3, dir, select, isUrl, isDocImage }: any) {
  const displayVal = value || "—";
  const inputCls = "w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1f26] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 text-[#485869] dark:text-white";

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 mb-1">{label}</div>
      {editing ? (
        select ? (
          <select value={af(formKey) || ""} onChange={e => setAf(formKey, e.target.value)} className={inputCls}>
            <option value="">— اختر —</option>
            {select.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : textarea ? (
          <textarea
            value={af(formKey) || ""}
            onChange={e => setAf(formKey, e.target.value)}
            rows={rows}
            dir={dir || "rtl"}
            className={`${inputCls} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={af(formKey) || ""}
            onChange={e => setAf(formKey, e.target.value)}
            dir={dir || "rtl"}
            className={inputCls}
          />
        )
      ) : (
        <div className={`text-sm text-[#485869] dark:text-white break-all ${dir === "ltr" ? "font-mono text-xs" : ""}`} dir={dir || "rtl"}>
          {isUrl && value ? (
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1">
              <ExternalLink size={11} /> {value}
            </a>
          ) : isDocImage && value ? (
            <div className="space-y-1">
              <a href={value} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                <ExternalLink size={11} /> عرض الوثيقة
              </a>
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(value) && (
                <img src={value} alt={label} className="max-h-28 rounded-lg border border-gray-200 dark:border-white/10 object-contain mt-1" />
              )}
            </div>
          ) : (
            displayVal
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function StatBox({ icon: Icon, label, value, color, small }: any) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-xs text-gray-500 dark:text-white/50">{label}</span>
      </div>
      <div className={`${small ? "text-base" : "text-lg"} font-bold text-[#485869] dark:text-white tabular-nums`}>{value}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-500 dark:text-white/50 mb-2 uppercase tracking-wide">{title}</div>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value, dir }: any) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <Icon size={14} className="text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 dark:text-white/50 w-24 flex-shrink-0">{label}</span>
      <span className={`text-[#485869] dark:text-white truncate ${dir === "ltr" ? "font-mono text-xs" : ""}`} dir={dir || "rtl"}>{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-xs text-gray-400">{text}</div>;
}

function ActionBtn({ icon: Icon, children, onClick, disabled, variant }: any) {
  const colors: any = {
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${colors[variant || "default"]}`}
    >
      <Icon size={14} /> {children}
    </button>
  );
}

function statusLabel(s: string) {
  return ({ pending: "بانتظار", active: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى", disputed: "نزاع" } as any)[s] || s;
}
function statusColor(s: string) {
  return ({
    pending: "bg-amber-100 text-amber-700",
    active: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-gray-100 text-gray-600",
    disputed: "bg-red-100 text-red-700",
  } as any)[s] || "bg-gray-100 text-gray-600";
}
function withdrawalStatusLabel(s: string) {
  return ({ pending: "قيد المعالجة", approved: "مقبول", rejected: "مرفوض", paid: "تم الصرف" } as any)[s] || s;
}
function withdrawalStatusColor(s: string) {
  return ({
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  } as any)[s] || "bg-gray-100 text-gray-600";
}
