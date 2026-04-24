'use client';

import Link from "next/link";
import { motion } from "motion/react";
import { DollarSign, ShoppingBag, Star, TrendingUp, Clock, Eye, MessageSquare, Bell } from "lucide-react";
import BannerCarousel from "./BannerCarousel";

const kpiCards = [
  { title: "الأرباح هذا الشهر", value: "12,450", unit: "ر.س", change: "+15.3%", trend: "up", icon: DollarSign, color: "from-[#34cc30] to-[#2eb829]" },
  { title: "الطلبات النشطة", value: "8", unit: "طلب", change: "+2", trend: "up", icon: ShoppingBag, color: "from-blue-500 to-blue-600" },
  { title: "متوسط التقييم", value: "4.9", unit: "★", change: "+0.1", trend: "up", icon: Star, color: "from-yellow-500 to-orange-500" },
  { title: "معدل الإنجاز", value: "98", unit: "%", change: "+3%", trend: "up", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
];

const earningsData = [
  { month: "يناير", earnings: 8500 },
  { month: "فبراير", earnings: 9200 },
  { month: "مارس", earnings: 10500 },
  { month: "أبريل", earnings: 9800 },
  { month: "مايو", earnings: 11200 },
  { month: "يونيو", earnings: 12450 },
];

const servicesData = [
  { name: "تصميم الهويات", value: 45, color: "#34cc30" },
  { name: "تصميم سوشيال ميديا", value: 30, color: "#485869" },
  { name: "تصميم شعارات", value: 15, color: "#3b82f6" },
  { name: "أخرى", value: 10, color: "#f59e0b" },
];

const recentOrders = [
  { id: "#ORD-2451", service: "تصميم هوية بصرية كاملة", client: "أحمد السالم", amount: "850 ر.س", status: "قيد التنفيذ", deadline: "غداً", statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "#ORD-2450", service: "تصميم منشورات سوشيال ميديا", client: "سارة محمد", amount: "320 ر.س", status: "بانتظار المراجعة", deadline: "اليوم", statusColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { id: "#ORD-2449", service: "تصميم شعار احترافي", client: "خالد العتيبي", amount: "450 ر.س", status: "مكتمل", deadline: "-", statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { id: "#ORD-2448", service: "تصميم بطاقة عمل", client: "نورة الدوسري", amount: "180 ر.س", status: "قيد التنفيذ", deadline: "بعد 3 أيام", statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
];

const notifications = [
  { icon: ShoppingBag, message: "طلب جديد من أحمد السالم", time: "قبل 5 دقائق", type: "order" },
  { icon: MessageSquare, message: "رسالة جديدة من سارة محمد", time: "قبل 15 دقيقة", type: "message" },
  { icon: DollarSign, message: "تم إيداع 320 ر.س في محفظتك", time: "قبل ساعة", type: "payment" },
  { icon: Star, message: "تقييم جديد: 5 نجوم من خالد", time: "قبل ساعتين", type: "review" },
];

export default function FreelancerOverview() {
  return (
    <div className="space-y-6">
      <BannerCarousel />
      {/* Welcome */}
      <div className="bg-gradient-to-br from-[#485869] to-[#3a4655] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">مرحباً، محمد!</h1>
            <p className="text-white/70">إليك ملخص نشاطك اليوم</p>
          </div>
          <div className="text-left">
            <div className="text-sm text-white/60">آخر تسجيل دخول</div>
            <div className="font-medium text-sm">اليوم، 9:23 صباحاً</div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`bg-gradient-to-br ${card.color} w-11 h-11 rounded-lg flex items-center justify-center`}>
                <card.icon className="text-white" size={22} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${card.trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700"}`}>
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#485869] dark:text-white mb-0.5">
              {card.value} <span className="text-base text-gray-400">{card.unit}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.32 }}
          className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#485869] dark:text-white">الأرباح الشهرية</h3>
            <select className="text-sm border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-gray-300 rounded-lg px-3 py-1">
              <option>آخر 6 أشهر</option><option>آخر سنة</option>
            </select>
          </div>
          <div className="h-[280px] flex flex-col">
            <div className="flex-1 relative">
              <svg viewBox="0 0 500 250" className="w-full h-full" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`g-${i}`} x1="50" y1={i * 50 + 20} x2="480" y2={i * 50 + 20} stroke="currentColor" className="text-gray-100 dark:text-[#2a2d36]" strokeWidth="1" />
                ))}
                <path d={`M80,${220 - (8500/13000)*180} L160,${220 - (9200/13000)*180} L240,${220 - (10500/13000)*180} L320,${220 - (9800/13000)*180} L400,${220 - (11200/13000)*180} L480,${220 - (12450/13000)*180} L480,220 L80,220 Z`} fill="url(#greenGrad)" />
                <defs><linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34cc30" stopOpacity="0.25" /><stop offset="100%" stopColor="#34cc30" stopOpacity="0.02" /></linearGradient></defs>
                <polyline points={`80,${220 - (8500/13000)*180} 160,${220 - (9200/13000)*180} 240,${220 - (10500/13000)*180} 320,${220 - (9800/13000)*180} 400,${220 - (11200/13000)*180} 480,${220 - (12450/13000)*180}`} fill="none" stroke="#34cc30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {earningsData.map((d, i) => (
                  <circle key={d.month} cx={80 + i * 80} cy={220 - (d.earnings/13000)*180} r="4.5" fill="#34cc30" stroke="white" strokeWidth="2" />
                ))}
                {[0, 5000, 10000].map(val => (
                  <text key={`y-${val}`} x="45" y={220 - (val/13000)*180 + 4} textAnchor="end" fill="#9ca3af" fontSize="10">{(val/1000).toFixed(0)}k</text>
                ))}
              </svg>
            </div>
            <div className="flex justify-between px-[50px] mt-1">
              {earningsData.map(d => <span key={d.month} className="text-xs text-gray-400">{d.month}</span>)}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}
          className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-6">توزيع الخدمات</h3>
          <div className="flex flex-col items-center justify-center h-[280px]">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const total = servicesData.reduce((s, d) => s + d.value, 0);
                  let cumulative = 0;
                  return servicesData.map(item => {
                    const pct = item.value / total * 100;
                    const offset = cumulative;
                    cumulative += pct;
                    return <circle key={item.name} cx="18" cy="18" r="15.9155" fill="transparent" stroke={item.color} strokeWidth="3.5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={`${-offset}`} />;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-[#485869] dark:text-white">100</div>
                <div className="text-xs text-gray-400">طلب</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5">
              {servicesData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders & Notifications */}
      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.48 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#485869] dark:text-white">الطلبات الأخيرة</h3>
            <Link href="/freelancer/orders" className="text-sm text-[#34cc30] hover:text-[#2eb829]">عرض الكل</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#252830] text-sm text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-right p-3.5">رقم الطلب</th>
                  <th className="text-right p-3.5">الخدمة</th>
                  <th className="text-right p-3.5">العميل</th>
                  <th className="text-right p-3.5">المبلغ</th>
                  <th className="text-right p-3.5">الحالة</th>
                  <th className="text-right p-3.5">الموعد</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-50 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 font-medium text-[#485869] dark:text-white">{order.id}</td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300">{order.service}</td>
                    <td className="p-3.5 text-gray-500 dark:text-gray-400">{order.client}</td>
                    <td className="p-3.5 font-medium text-[#485869] dark:text-white">{order.amount}</td>
                    <td className="p-3.5"><span className={`${order.statusColor} px-2.5 py-1 rounded-full text-xs font-medium`}>{order.status}</span></td>
                    <td className="p-3.5 text-gray-500 dark:text-gray-400">{order.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.56 }}
          className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#2a2d36]">
            <h3 className="text-lg font-bold text-[#485869] dark:text-white">الإشعارات</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#2a2d36]">
            {notifications.map((notif, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${
                    notif.type === "order" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                    notif.type === "message" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                    notif.type === "payment" ? "bg-[#34cc30]/10 text-[#34cc30]" :
                    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  }`}>
                    <notif.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#485869] dark:text-gray-200">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
