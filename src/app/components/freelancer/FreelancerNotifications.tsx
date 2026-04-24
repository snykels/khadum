'use client';

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import {
  Bell, ShoppingBag, Star, DollarSign, AlertTriangle, CheckCircle, Clock,
  MessageCircle, Shield, X, Loader2,
} from "lucide-react";

type Notif = {
  id: number;
  userId: number | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data: string | null;
  channel: string;
  priority: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

const TYPE_META: Record<string, { icon: any; color: string }> = {
  order:    { icon: ShoppingBag,    color: "bg-blue-100 text-blue-600" },
  message:  { icon: MessageCircle,  color: "bg-[#34cc30]/10 text-[#34cc30]" },
  review:   { icon: Star,           color: "bg-yellow-100 text-yellow-600" },
  payment:  { icon: DollarSign,     color: "bg-green-100 text-green-600" },
  warning:  { icon: AlertTriangle,  color: "bg-red-100 text-red-600" },
  success:  { icon: CheckCircle,    color: "bg-green-100 text-green-600" },
  reminder: { icon: Clock,          color: "bg-orange-100 text-orange-600" },
  system:   { icon: Shield,         color: "bg-purple-100 text-purple-600" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return "أمس";
  if (d < 30) return `قبل ${d} أيام`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

export function FreelancerNotificationsPage() {
  const [filter, setFilter] = useState("الكل");
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ["الكل", "طلبات", "رسائل", "مالية", "تنبيهات", "نظام"];
  const typeMap: Record<string,string> = {
    "طلبات": "order",
    "رسائل": "message",
    "مالية": "payment",
    "تنبيهات": "warning",
    "نظام": "system",
    "تقييمات": "review",
  };

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/freelancer/notifications", { cache: "no-store" });
      if (r.ok) setNotifications(await r.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filter === "الكل") return notifications;
    const t = typeMap[filter];
    return notifications.filter(n => n.type === t || (filter === "تنبيهات" && (n.type === "warning" || n.type === "review")));
  }, [filter, notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch("/api/freelancer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  };

  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/freelancer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  };

  const dismiss = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch(`/api/freelancer/notifications?id=${id}`, { method: "DELETE" }).catch(() => {});
  };
=======
import { useState } from "react";
import { Bell, ShoppingBag, Star, DollarSign, AlertTriangle, CheckCircle, Clock, MessageCircle, Shield, X } from "lucide-react";

const allNotifications = [
  { id: 1, type: "order", title: "طلب جديد!", desc: "أحمد السالم طلب خدمة تصميم هوية بصرية كاملة - 850 ر.س", time: "قبل 5 دقائق", read: false, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
  { id: 2, type: "message", title: "رسالة جديدة", desc: "سارة محمد: هل يمكنك تعديل الألوان؟", time: "قبل 15 دقيقة", read: false, icon: MessageCircle, color: "bg-[#34cc30]/10 text-[#34cc30]" },
  { id: 3, type: "review", title: "تقييم جديد ★★★★★", desc: "خالد العتيبي قيّمك 5 نجوم على خدمة تصميم شعار", time: "قبل ساعة", read: false, icon: Star, color: "bg-yellow-100 text-yellow-600" },
  { id: 4, type: "payment", title: "تم إيداع أرباح", desc: "تم إيداع 450 ر.س في محفظتك من طلب #ORD-2449", time: "قبل ساعتين", read: true, icon: DollarSign, color: "bg-green-100 text-green-600" },
  { id: 5, type: "warning", title: "تنبيه مهم", desc: "يرجى عدم مشاركة معلومات التواصل الشخصية مع العملاء. المخالفة قد تؤدي لإيقاف حسابك.", time: "قبل 3 ساعات", read: false, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
  { id: 6, type: "order", title: "تم اكتمال الطلب", desc: "تم تأكيد اكتمال الطلب #ORD-2447 - غلاف كتاب", time: "قبل 5 ساعات", read: true, icon: CheckCircle, color: "bg-green-100 text-green-600" },
  { id: 7, type: "system", title: "تحديث الشروط", desc: "تم تحديث شروط وأحكام المنصة. يرجى الاطلاع عليها.", time: "أمس", read: true, icon: Shield, color: "bg-purple-100 text-purple-600" },
  { id: 8, type: "order", title: "تذكير بموعد التسليم", desc: "الطلب #ORD-2451 يجب تسليمه خلال 24 ساعة", time: "أمس", read: true, icon: Clock, color: "bg-orange-100 text-orange-600" },
  { id: 9, type: "payment", title: "تم تحويل السحب", desc: "تم تحويل 2,000 ر.س إلى حسابك في مصرف الراجحي", time: "قبل يومين", read: true, icon: DollarSign, color: "bg-green-100 text-green-600" },
  { id: 10, type: "warning", title: "تحذير: رسالة مشبوهة", desc: "تم اكتشاف محاولة مشاركة رقم هاتف في محادثة مع العميل. يرجى الالتزام بسياسة المنصة.", time: "قبل 3 أيام", read: true, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
];

export function FreelancerNotificationsPage() {
  const [filter, setFilter] = useState("الكل");
  const [notifications, setNotifications] = useState(allNotifications);
  const filters = ["الكل", "طلبات", "رسائل", "مالية", "تنبيهات", "نظام"];
  const typeMap: Record<string,string> = { "طلبات": "order", "رسائل": "message", "مالية": "payment", "تنبيهات": "warning", "نظام": "system", "تقييمات": "review" };

  const filtered = filter === "الكل" ? notifications : notifications.filter(n => n.type === typeMap[filter] || (filter === "تنبيهات" && (n.type === "warning" || n.type === "review")));
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">التنبيهات</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full">{unreadCount} جديد</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#34cc30] hover:text-[#2eb829]">
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filter === f
                ? "bg-[#34cc30] text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#34cc30]" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            const Icon = meta.icon;
            const Body = (
              <>
                <div className={`p-2.5 rounded-xl shrink-0 ${meta.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-medium ${!n.isRead ? "text-[#485869] dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                      {n.title}
                    </span>
                    {!n.isRead && <div className="w-2 h-2 bg-[#34cc30] rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{n.message}</p>
                  <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="text-gray-300 hover:text-red-400 p-1"
                >
                  <X size={16} />
                </button>
              </>
            );
            const cls = `bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${
              !n.isRead ? "border-r-4 border-r-[#34cc30]" : ""
            }`;
            return n.link ? (
              <a key={n.id} href={n.link} onClick={() => markRead(n.id)} className={cls}>
                {Body}
              </a>
            ) : (
              <div key={n.id} onClick={() => markRead(n.id)} className={cls}>
                {Body}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
              <Bell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد تنبيهات</p>
            </div>
          )}
        </div>
      )}
=======
          <h1 className="text-2xl font-bold text-[#485869]">التنبيهات</h1>
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full">{unreadCount} جديد</span>}
        </div>
        {unreadCount > 0 && <button onClick={markAllRead} className="text-sm text-[#34cc30] hover:text-[#2eb829]">تحديد الكل كمقروء</button>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? "bg-[#34cc30] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{f}</button>)}
      </div>

      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)} className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? "border-r-4 border-r-[#34cc30]" : ""}`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${n.color}`}><n.icon size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-medium ${!n.read ? "text-[#485869]" : "text-gray-600"}`}>{n.title}</span>
                {!n.read && <div className="w-2 h-2 bg-[#34cc30] rounded-full" />}
              </div>
              <p className="text-sm text-gray-600 mb-1">{n.desc}</p>
              <span className="text-xs text-gray-400">{n.time}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="text-gray-300 hover:text-red-400 p-1"><X size={16} /></button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد تنبيهات في هذا التصنيف</p>
          </div>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}
