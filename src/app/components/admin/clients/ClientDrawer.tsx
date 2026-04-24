'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle, Ban, Lock, MessageSquare, Mail, Phone, MapPin, Calendar, Activity,
  ShoppingBag, AlertTriangle, Clock, TrendingUp, RefreshCw, LifeBuoy, Edit, FileText
} from "lucide-react";
import { fmt, dateAr, timeAgo, patchJson } from "../_helpers";
import { openWhatsAppChat } from "../_whatsapp";

interface Props {
  userId: number | null;
  onClose: () => void;
  onChanged: () => void;
  show: (msg: string, ok?: boolean) => void;
  onEdit?: (id: number) => void;
}

export default function ClientDrawer({ userId, onClose, onChanged, show, onEdit }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "orders" | "refunds" | "tickets" | "actions">("overview");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    if (!userId) { setData(null); return; }
    setLoading(true);
    fetch(`/api/admin/users/${userId}/details`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    function esc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [userId, onClose]);

  async function doAction(action: "suspend" | "block" | "activate") {
    if (!userId) return;
    const payload: any = {};
    if (action === "suspend") { payload.isSuspended = true; payload.isBlocked = false; payload.reason = actionReason || "مخالفة شروط الخدمة"; }
    if (action === "block") { payload.isBlocked = true; payload.isSuspended = false; payload.reason = actionReason || "حظر إداري"; }
    if (action === "activate") { payload.isSuspended = false; payload.isBlocked = false; }
    const { ok, data: res } = await patchJson(`/api/admin/users/${userId}`, payload);
    show(ok ? "تم التحديث" : (res?.error || "فشل"), ok);
    if (ok) {
      setActionReason("");
      onChanged();
      const r = await fetch(`/api/admin/users/${userId}/details`);
      setData(await r.json());
    }
  }

  function openWhatsApp() {
    if (!data?.user?.phone) { show("لا يوجد رقم جوال", false); return; }
    openWhatsAppChat(data.user.phone);
  }

  const u = data?.user;
  const stats = data?.stats || {};
  const orders: any[] = data?.recentOrders || [];
  const refunds: any[] = data?.refunds || [];
  const tickets: any[] = data?.tickets || [];

  return (
    <AnimatePresence>
      {userId && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[560px] bg-white dark:bg-[#15171c] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-[#1f2229] to-[#2a2e38] text-white p-5 z-10">
              <div className="flex items-start justify-between gap-3">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={18} /></button>
                <div className="flex-1 text-right">
                  <div className="text-xs text-white/60">تفاصيل العميل</div>
                  <div className="text-sm text-white/80">#{userId}</div>
                </div>
              </div>
              {loading && <div className="text-center text-white/70 text-sm mt-4">جاري التحميل...</div>}
              {u && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative">
                    {u.avatar
                      ? <img src={u.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-white/10" />
                      : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/10">
                          {u.name?.charAt(0)}
                        </div>}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1f2229] ${u.isOnline ? "bg-emerald-500" : "bg-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold truncate">{u.name}</h2>
                      {u.isLocked && <Lock size={14} className="text-amber-400" />}
                    </div>
                    <div className="text-sm text-white/80 font-mono truncate" dir="ltr">{u.phone || "—"}</div>
                    <div className="text-[11px] text-white/50 truncate" dir="ltr">{u.email}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {u.isSuspended && <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">موقوف</span>}
                      {u.isBlocked && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">محظور</span>}
                      {!u.isSuspended && !u.isBlocked && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">نشط</span>}
                      {u.isOnline && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">متصل الآن</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {u && (
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 flex-wrap">
                <button onClick={openWhatsApp} className="flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                  <MessageSquare size={14} /> محادثة واتساب
                </button>
                {u.email && <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg"><Mail size={14} /> إيميل</a>}
                {u.phone && <a href={`tel:${u.phone}`} className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg"><Phone size={14} /> اتصال</a>}
                {onEdit && (
                  <button onClick={() => onEdit(userId!)} disabled={u.isLocked}
                    className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg mr-auto disabled:opacity-40">
                    <Edit size={14} /> تعديل البيانات
                  </button>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="px-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "نظرة عامة", icon: Activity },
                { id: "orders", label: "الطلبات", icon: ShoppingBag },
                { id: "refunds", label: "الاسترداد", icon: RefreshCw },
                { id: "tickets", label: "الدعم", icon: LifeBuoy },
                { id: "actions", label: "إجراءات", icon: AlertTriangle },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white"
                  }`}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {tab === "overview" && u && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox icon={ShoppingBag} label="إجمالي الطلبات" value={fmt(stats.total || 0)} color="text-blue-600" />
                    <StatBox icon={CheckCircle} label="مكتملة" value={fmt(stats.completed || 0)} color="text-emerald-600" />
                    <StatBox icon={Clock} label="نشطة" value={fmt(stats.active || 0)} color="text-amber-600" />
                    <StatBox icon={AlertTriangle} label="ملغاة" value={fmt(stats.cancelled || 0)} color="text-gray-600" />
                    <StatBox icon={AlertTriangle} label="نزاعات" value={fmt(stats.disputed || 0)} color="text-red-600" />
                    <StatBox icon={TrendingUp} label="إجمالي الإنفاق" value={`${fmt(stats.spent || 0)} ر.س`} color="text-[#34cc30]" />
                  </div>

                  <Section title="بيانات الحساب">
                    <Row icon={Phone} label="الجوال" value={u.phone || "—"} dir="ltr" />
                    <Row icon={Mail} label="البريد" value={u.email} />
                    <Row icon={MapPin} label="المدينة" value={u.location || "—"} />
                    <Row icon={Calendar} label="تاريخ التسجيل" value={dateAr(u.createdAt)} />
                    <Row icon={Activity} label="آخر دخول" value={u.lastLoginAt ? timeAgo(u.lastLoginAt) : "لم يدخل بعد"} />
                  </Section>

                  <Section title={(<span className="flex items-center gap-1.5"><FileText size={11} /> ملاحظات خدمة العملاء</span>) as any}>
                    {u.bio
                      ? <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-xl p-3 whitespace-pre-wrap">{u.bio}</p>
                      : <div className="text-xs text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                          لا توجد ملاحظات بعد · {onEdit && <button onClick={() => onEdit(userId!)} className="text-blue-600 hover:underline">إضافة ملاحظة</button>}
                        </div>}
                  </Section>
                </>
              )}

              {tab === "orders" && (
                <Section title={`آخر الطلبات (${orders.length})`}>
                  {orders.length === 0 ? <Empty text="لا توجد طلبات" /> : (
                    <div className="space-y-2">
                      {orders.map(o => (
                        <div key={o.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-white/10">
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-bold text-sm text-[#485869] dark:text-white">#{o.publicCode || `ORD-${String(o.id).padStart(4, "0")}`}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
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

              {tab === "refunds" && (
                <Section title={`طلبات الاسترداد (${refunds.length})`}>
                  {refunds.length === 0 ? <Empty text="لا طلبات استرداد" /> : (
                    <div className="space-y-2">
                      {refunds.map(r => (
                        <div key={r.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-sm text-[#485869] dark:text-white">{fmt(r.refundAmount || r.amount)} ر.س</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${refundStatusColor(r.status)}`}>{refundStatusLabel(r.status)}</span>
                          </div>
                          {r.reason && <div className="text-xs text-gray-600 dark:text-white/60">{r.reason}</div>}
                          <div className="text-[10px] text-gray-400 mt-1">{dateAr(r.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {tab === "tickets" && (
                <Section title={`تذاكر الدعم (${tickets.length})`}>
                  {tickets.length === 0 ? <Empty text="لا تذاكر دعم" /> : (
                    <div className="space-y-2">
                      {tickets.map(t => (
                        <div key={t.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm text-[#485869] dark:text-white truncate flex-1">{t.subject}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticketStatusColor(t.status)}`}>{ticketStatusLabel(t.status)}</span>
                          </div>
                          <div className="text-[10px] text-gray-400">{dateAr(t.createdAt)} · أولوية: {t.priority}</div>
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
                  <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 text-xs p-3 rounded-xl">
                    <strong>ملاحظة:</strong> العميل يمكن أن يكون في حالة واحدة فقط: نشط، موقوف مؤقتاً، أو محظور. التوثيق غير متاح للعملاء.
                  </div>
                  <Section title="سبب الإجراء (اختياري)">
                    <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="اكتب السبب هنا..." rows={2}
                      className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1f26] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </Section>
                  <Section title="حالة الحساب">
                    <div className="grid grid-cols-3 gap-2">
                      <ActionBtn onClick={() => doAction("activate")} disabled={(!u.isSuspended && !u.isBlocked) || u.isLocked} icon={CheckCircle} variant="success">تفعيل</ActionBtn>
                      <ActionBtn onClick={() => doAction("suspend")} disabled={u.isSuspended || u.isLocked} icon={Ban} variant="warn">إيقاف مؤقت</ActionBtn>
                      <ActionBtn onClick={() => doAction("block")} disabled={u.isBlocked || u.isLocked} icon={Lock} variant="danger">حظر دائم</ActionBtn>
                    </div>
                  </Section>
                  {onEdit && (
                    <Section title="تعديل البيانات">
                      <ActionBtn onClick={() => onEdit(userId!)} disabled={u.isLocked} icon={Edit} variant="default">تعديل الاسم/الجوال/البريد/الملاحظات</ActionBtn>
                    </Section>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBox({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-xs text-gray-500 dark:text-white/50">{label}</span>
      </div>
      <div className="text-lg font-bold text-[#485869] dark:text-white tabular-nums">{value}</div>
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
function Empty({ text }: { text: string }) { return <div className="py-6 text-center text-xs text-gray-400">{text}</div>; }
function ActionBtn({ icon: Icon, children, onClick, disabled, variant }: any) {
  const colors: any = {
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${colors[variant || "default"]}`}>
      <Icon size={14} /> {children}
    </button>
  );
}
function statusLabel(s: string) { return ({ pending: "بانتظار", active: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى", disputed: "نزاع" } as any)[s] || s; }
function statusColor(s: string) {
  return ({ pending: "bg-amber-100 text-amber-700", active: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-gray-100 text-gray-600",
    disputed: "bg-red-100 text-red-700" } as any)[s] || "bg-gray-100 text-gray-600";
}
function refundStatusLabel(s: string) {
  return ({ new: "جديد", in_review: "قيد المراجعة", approved: "موافق", rejected: "مرفوض", paid: "تم الصرف" } as any)[s] || s;
}
function refundStatusColor(s: string) {
  return ({ new: "bg-amber-100 text-amber-700", in_review: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700", paid: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700" } as any)[s] || "bg-gray-100 text-gray-600";
}
function ticketStatusLabel(s: string) {
  return ({ open: "مفتوحة", in_progress: "قيد المعالجة", resolved: "محلولة", closed: "مغلقة" } as any)[s] || s;
}
function ticketStatusColor(s: string) {
  return ({ open: "bg-blue-100 text-blue-700", in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700", closed: "bg-gray-100 text-gray-600" } as any)[s] || "bg-gray-100 text-gray-600";
}
