'use client';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
    </div>
  );
}
