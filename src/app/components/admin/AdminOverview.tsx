'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Users, DollarSign, ShoppingBag, UserCheck, AlertTriangle,
  MessageSquare, Clock, TrendingUp, Wallet, Package,
  ArrowUpRight, RefreshCw, ChevronLeft, Sparkles, Activity,
  CreditCard, FileText, Award, Briefcase
} from "lucide-react";
import { fmt, dateAr, timeAgo } from "./_helpers";

type Period = "today" | "7d" | "30d" | "90d" | "all";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "اليوم" },
  { id: "7d", label: "7 أيام" },
  { id: "30d", label: "30 يوم" },
  { id: "90d", label: "90 يوم" },
  { id: "all", label: "الكل" },
];

const orderStatusLabel: Record<string, string> = {
  pending: "بانتظار الدفع",
  active: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغى",
  disputed: "في نزاع",
};

const orderStatusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  disputed: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");
  const [updated, setUpdated] = useState<Date>(new Date());

  async function load(p: Period = period) {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/overview?period=${p}`);
      if (r.ok) { setData(await r.json()); setUpdated(new Date()); }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(period); /* eslint-disable-next-line */ }, [period]);
  useEffect(() => {
    const t = setInterval(() => load(period), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [period]);

  const s = data?.stats || {};
  const recent: any[] = data?.recentOrders || [];
  const disputes: any[] = data?.disputes || [];
  const daily: any[] = data?.daily || [];
  const topCategories: any[] = data?.topCategories || [];
  const topFreelancers: any[] = data?.topFreelancers || [];

  const kpiCards = [
    {
      title: "إيرادات المنصة",
      value: fmt(s.platformRevenue || 0),
      unit: "ر.س",
      icon: DollarSign,
      gradient: "from-[#34cc30] via-[#2eb829] to-[#1f9a1c]",
      iconBg: "bg-emerald-500/20",
      sub: `من ${fmt(s.paidOrders || 0)} طلب مدفوع`,
    },
    {
      title: "إجمالي المبيعات (GMV)",
      value: fmt(s.gmv || 0),
      unit: "ر.س",
      icon: TrendingUp,
      gradient: "from-indigo-500 via-violet-500 to-purple-600",
      iconBg: "bg-indigo-500/20",
      sub: `${fmt(s.totalOrders || 0)} طلب إجمالي`,
    },
    {
      title: "المستخدمون",
      value: fmt(s.totalUsers || 0),
      icon: Users,
      gradient: "from-sky-500 via-cyan-500 to-blue-600",
      iconBg: "bg-cyan-500/20",
      sub: `${fmt(s.activeFreelancers || 0)} مستقل · ${fmt(s.totalClients || 0)} عميل`,
    },
    {
      title: "الطلبات النشطة",
      value: fmt(s.activeOrders || 0),
      icon: ShoppingBag,
      gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
      iconBg: "bg-pink-500/20",
      sub: `${fmt(s.activeServices || 0)} خدمة منشورة`,
    },
  ];

  const alertCards = [
    { label: "طلبات انضمام", value: s.pendingApplications || 0, icon: UserCheck, href: "/admin/applications", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
    { label: "طلبات سحب", value: s.pendingWithdrawals || 0, icon: Wallet, href: "/admin/withdrawals", color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" },
    { label: "نزاعات مفتوحة", value: s.disputes || 0, icon: AlertTriangle, href: "/admin/disputes", color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
    { label: "تذاكر دعم", value: s.openTickets || 0, icon: MessageSquare, href: "/admin/support", color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1d24] via-[#252932] to-[#1a1d24] p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#34cc30] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[#34cc30]" size={18} />
              <span className="text-xs uppercase tracking-widest text-white/60">لوحة التحكم</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">أهلاً بك في لوحة خدوم</h1>
            <p className="text-white/70 text-sm">نظرة شاملة في الوقت الفعلي على كل ما يحدث في المنصة</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    period === p.id
                      ? "bg-[#34cc30] text-white shadow-lg shadow-[#34cc30]/30"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => load(period)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="تحديث"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <div className="relative mt-4 text-xs text-white/50 flex items-center gap-2">
          <Activity size={12} />
          <span>آخر تحديث: {timeAgo(updated)}</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1c1f26] shadow-sm hover:shadow-xl border border-gray-100 dark:border-white/5 transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`bg-gradient-to-br ${card.gradient} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg`}>
                  <card.icon className="text-white" size={20} />
                </div>
                <div className="text-xs text-gray-400 dark:text-white/40 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  {PERIODS.find(p => p.id === period)?.label}
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-[#485869] dark:text-white tabular-nums leading-tight">
                {card.value}
                {card.unit && <span className="text-base font-medium text-gray-400 dark:text-white/40 mr-1">{card.unit}</span>}
              </div>
              <div className="text-sm text-gray-700 dark:text-white/70 mt-1 font-medium">{card.title}</div>
              <div className="text-xs text-gray-400 dark:text-white/40 mt-1">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert Action Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {alertCards.map((a, i) => (
          <Link
            key={i}
            href={a.href}
            className={`group relative ${a.bg} dark:bg-white/5 rounded-xl p-4 ring-1 ${a.ring} dark:ring-white/10 hover:scale-[1.02] hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <a.icon className={a.color} size={20} />
              {a.value > 0 && (
                <span className="bg-white dark:bg-[#1c1f26] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  جديد
                </span>
              )}
            </div>
            <div className={`text-2xl font-bold ${a.color} tabular-nums`}>{fmt(a.value)}</div>
            <div className="text-xs text-gray-700 dark:text-white/70 mt-0.5 flex items-center justify-between">
              <span>{a.label}</span>
              <ChevronLeft size={14} className="opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#1c1f26] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#485869] dark:text-white">حركة المبيعات اليومية</h3>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">الإيرادات المدفوعة وعدد الطلبات</p>
            </div>
            <div className="text-xs text-gray-400 dark:text-white/40">
              {daily.length} يوم
            </div>
          </div>
          <RevenueChart data={daily} />
        </div>

        <div className="space-y-4">
          <SecondaryStat
            icon={CreditCard}
            label="إجمالي المدفوع"
            value={fmt(s.totalPaid || 0)}
            unit="ر.س"
            color="text-emerald-600"
            bg="bg-emerald-50 dark:bg-emerald-500/10"
          />
          <SecondaryStat
            icon={Package}
            label="خدمات منشورة"
            value={fmt(s.activeServices || 0)}
            color="text-indigo-600"
            bg="bg-indigo-50 dark:bg-indigo-500/10"
          />
          <SecondaryStat
            icon={Briefcase}
            label="إجمالي الطلبات"
            value={fmt(s.totalOrders || 0)}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-500/10"
          />
        </div>
      </div>

      {/* Top Categories + Top Freelancers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RankList
          title="أفضل التصنيفات"
          subtitle="حسب الإيرادات"
          icon={Award}
          items={topCategories.map((c: any) => ({
            primary: c.name,
            secondary: `${fmt(c.orders)} طلب`,
            value: `${fmt(c.revenue)} ر.س`,
          }))}
          emptyText="لا توجد بيانات في هذه الفترة"
        />
        <RankList
          title="أفضل المستقلين"
          subtitle="حسب الأرباح الصافية"
          icon={UserCheck}
          items={topFreelancers.map((f: any) => ({
            primary: f.name || `مستقل #${f.id}`,
            secondary: `${fmt(f.orders)} طلب`,
            value: `${fmt(f.revenue)} ر.س`,
          }))}
          emptyText="لا توجد بيانات في هذه الفترة"
        />
      </div>

      {/* Disputes + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel
          title="النزاعات النشطة"
          subtitle="تتطلب مراجعة فورية"
          badge={disputes.length > 0 ? { text: `${disputes.length} نزاع`, color: "bg-red-50 text-red-700 border-red-200" } : null}
          href="/admin/disputes"
        >
          {disputes.length === 0 ? (
            <Empty text="لا توجد نزاعات حالياً" />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {disputes.map((d: any) => (
                <div key={d.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-[#485869] dark:text-white text-sm">#ORD-{String(d.id).padStart(4, "0")}</div>
                      <div className="text-xs text-gray-500 dark:text-white/50 max-w-[220px] truncate">{d.serviceTitle}</div>
                    </div>
                    <div className="font-bold text-[#485869] dark:text-white text-sm tabular-nums">{fmt(d.amount)} ر.س</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-white/50">
                    <span>المستقل: <span className="text-gray-700 dark:text-white/70">{d.freelancerName || "—"}</span></span>
                    <span>•</span>
                    <span>العميل: <span className="text-gray-700 dark:text-white/70">{d.clientName || "—"}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="آخر الطلبات"
          subtitle="أحدث 5 طلبات"
          href="/admin/orders"
        >
          {recent.length === 0 ? (
            <Empty text="لا توجد طلبات بعد" />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recent.map((o: any) => (
                <div key={o.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-[#485869] dark:text-white text-sm">#ORD-{String(o.id).padStart(4, "0")}</div>
                      <div className="text-xs text-gray-500 dark:text-white/50 max-w-[220px] truncate">{o.serviceTitle}</div>
                    </div>
                    <span className={`${orderStatusColor[o.status] || orderStatusColor.pending} px-2 py-0.5 rounded-full text-[10px] font-medium border`}>
                      {orderStatusLabel[o.status] || o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/50">
                    <span className="truncate">{o.freelancerName || "—"} ← {o.clientName || "—"}</span>
                    <span className="font-bold text-[#485869] dark:text-white tabular-nums">{fmt(o.amount)} ر.س</span>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1">{dateAr(o.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl p-5 border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[#485869] dark:text-white/70" />
          <h3 className="text-sm font-bold text-[#485869] dark:text-white">روابط سريعة</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: "التحليلات", href: "/admin/analytics" },
            { label: "الخدمات", href: "/admin/services" },
            { label: "المالية", href: "/admin/transactions" },
            { label: "المستقلون", href: "/admin/freelancers" },
            { label: "العملاء", href: "/admin/clients" },
            { label: "الإعدادات", href: "/admin/general-settings" },
          ].map((q, i) => (
            <Link
              key={i}
              href={q.href}
              className="flex items-center justify-between bg-white dark:bg-[#1c1f26] hover:bg-[#34cc30] hover:text-white dark:hover:bg-[#34cc30] px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-white/80 border border-gray-100 dark:border-white/5 transition-all group"
            >
              <span>{q.label}</span>
              <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SecondaryStat({ icon: Icon, label, value, unit, color, bg }: any) {
  return (
    <div className={`${bg} rounded-2xl p-4 border border-gray-100 dark:border-white/5`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-[#1c1f26] shadow-sm flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-white/60">{label}</div>
          <div className="text-xl font-bold text-[#485869] dark:text-white tabular-nums">
            {value} {unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, badge, href, children }: any) {
  return (
    <div className="bg-white dark:bg-[#1c1f26] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#485869] dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.color}`}>
              {badge.text}
            </span>
          )}
          {href && (
            <Link href={href} className="text-[#34cc30] hover:underline text-xs flex items-center gap-1">
              عرض الكل <ChevronLeft size={12} />
            </Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-sm text-gray-400 dark:text-white/40">
      {text}
    </div>
  );
}

function RankList({ title, subtitle, icon: Icon, items, emptyText }: any) {
  return (
    <div className="bg-white dark:bg-[#1c1f26] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
        <Icon size={16} className="text-[#34cc30]" />
        <div>
          <h3 className="text-base font-bold text-[#485869] dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <Empty text={emptyText} />
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {items.map((it: any, i: number) => (
            <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                i === 0 ? "bg-amber-100 text-amber-700"
                : i === 1 ? "bg-gray-100 text-gray-700"
                : i === 2 ? "bg-orange-100 text-orange-700"
                : "bg-gray-50 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-[#485869] dark:text-white truncate">{it.primary}</div>
                <div className="text-[11px] text-gray-500 dark:text-white/50">{it.secondary}</div>
              </div>
              <div className="font-bold text-sm text-[#485869] dark:text-white tabular-nums">{it.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  const sorted = useMemo(() => [...data].sort((a, b) => (a.date < b.date ? -1 : 1)), [data]);

  if (sorted.length === 0) {
    return <Empty text="لا توجد بيانات لعرضها" />;
  }

  const maxRev = Math.max(...sorted.map(d => d.revenue || 0), 1);
  const maxOrd = Math.max(...sorted.map(d => d.orders || 0), 1);

  const W = 600;
  const H = 220;
  const padX = 30;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const xStep = sorted.length > 1 ? innerW / (sorted.length - 1) : 0;

  const linePath = sorted
    .map((d, i) => {
      const x = padX + i * xStep;
      const y = padY + innerH - (d.revenue / maxRev) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${padX + (sorted.length - 1) * xStep} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <div className="p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34cc30" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34cc30" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(t => (
          <line
            key={t}
            x1={padX} x2={W - padX}
            y1={padY + innerH * t} y2={padY + innerH * t}
            stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3"
          />
        ))}
        <path d={areaPath} fill="url(#revFill)" />
        <path d={linePath} fill="none" stroke="#34cc30" strokeWidth="2" />
        {sorted.map((d, i) => {
          const x = padX + i * xStep;
          const y = padY + innerH - (d.revenue / maxRev) * innerH;
          const ordH = (d.orders / maxOrd) * (innerH * 0.5);
          return (
            <g key={i}>
              <rect
                x={x - 3} y={padY + innerH - ordH} width="6" height={ordH}
                fill="#485869" fillOpacity="0.15" rx="1"
              />
              <circle cx={x} cy={y} r="3" fill="#34cc30" />
              <title>{`${d.date}\nالإيرادات: ${fmt(d.revenue)} ر.س\nالطلبات: ${fmt(d.orders)}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500 dark:text-white/50">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#34cc30]" />
          <span>الإيرادات (ر.س)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#485869]/30" />
          <span>عدد الطلبات</span>
        </div>
      </div>
    </div>
  );
}
