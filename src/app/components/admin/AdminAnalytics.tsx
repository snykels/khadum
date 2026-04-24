'use client';
import { useEffect, useState, useMemo } from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Activity, Calendar, Filter, RefreshCw, Download } from "lucide-react";
import { DataTable, Column } from "../ui/DataTable";

type Period = "today" | "7d" | "30d" | "90d" | "all";

interface Overview {
  totals: { users: number; freelancers: number; clients: number; orders: number; revenue: number; activeServices: number; tickets: number };
  daily?: { date: string; orders: number; revenue: number; signups: number }[];
  topCategories?: { name: string; orders: number; revenue: number }[];
  topFreelancers?: { id: number; name: string; orders: number; revenue: number; rating: number }[];
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const [tab, setTab] = useState<"overview" | "users" | "revenue" | "services" | "support">("overview");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/overview?period=${period}`);
      const d = await r.json();
      if (r.ok) setData(d);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [period]);

  const periods: { k: Period; l: string }[] = [
    { k: "today", l: "اليوم" }, { k: "7d", l: "7 أيام" },
    { k: "30d", l: "30 يوم" }, { k: "90d", l: "90 يوم" }, { k: "all", l: "الكل" }
  ];
  const tabs: { k: typeof tab; l: string; Icon: any }[] = [
    { k: "overview", l: "نظرة عامة", Icon: BarChart3 },
    { k: "users", l: "المستخدمون", Icon: Users },
    { k: "revenue", l: "الإيرادات", Icon: DollarSign },
    { k: "services", l: "الخدمات", Icon: ShoppingBag },
    { k: "support", l: "الدعم", Icon: Activity },
  ];

  const t = data?.totals || { users: 0, freelancers: 0, clients: 0, orders: 0, revenue: 0, activeServices: 0, tickets: 0 };

  const fmt = (n: number) => Number(n || 0).toLocaleString("en-US");
  const sar = (n: number) => fmt(n) + " ر.س";

  function exportFullCsv() {
    const sections: string[] = [];
    sections.push("الفئة,القيمة");
    sections.push(`المستخدمون,${t.users}`);
    sections.push(`المستقلون,${t.freelancers}`);
    sections.push(`العملاء,${t.clients}`);
    sections.push(`الطلبات,${t.orders}`);
    sections.push(`الإيرادات,${t.revenue}`);
    sections.push(`الخدمات النشطة,${t.activeServices}`);
    sections.push(`التذاكر,${t.tickets}`);
    const csv = "\uFEFF" + sections.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const dailyCols: Column<any>[] = [
    { key: "date", label: "التاريخ", filterable: true, filterType: "date-range" },
    { key: "orders", label: "الطلبات", filterable: true, filterType: "number-range" },
    { key: "revenue", label: "الإيرادات (ر.س)", filterable: true, filterType: "number-range", render: r => fmt(r.revenue) },
    { key: "signups", label: "تسجيلات جديدة", filterable: true, filterType: "number-range" },
  ];
  const catCols: Column<any>[] = [
    { key: "name", label: "التصنيف", filterable: true },
    { key: "orders", label: "الطلبات", filterable: true, filterType: "number-range" },
    { key: "revenue", label: "الإيرادات", filterable: true, filterType: "number-range", render: r => sar(r.revenue) },
  ];
  const flCols: Column<any>[] = [
    { key: "id", label: "#", width: "60px" },
    { key: "name", label: "المستقل", filterable: true },
    { key: "orders", label: "الطلبات", filterable: true, filterType: "number-range" },
    { key: "revenue", label: "الإيرادات", filterable: true, filterType: "number-range", render: r => sar(r.revenue) },
    { key: "rating", label: "التقييم", filterable: true, filterType: "number-range", render: r => `${(r.rating || 0).toFixed(1)} ★` },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-gradient-to-l from-[#34cc30]/10 via-white to-white dark:from-[#34cc30]/5 dark:via-[#1a1d24] dark:to-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-[#2a2d36]">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#485869] dark:text-white flex items-center gap-2">
              <BarChart3 className="text-[#34cc30]" /> مركز التحليلات
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إحصاءات تفصيلية، رسوم بيانية، وتصدير لأي جدول.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white dark:bg-[#252830] border border-gray-200 dark:border-[#2a2d36] rounded-lg p-1">
              {periods.map(p => (
                <button key={p.k} onClick={() => setPeriod(p.k)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p.k ? "bg-[#34cc30] text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}>{p.l}</button>
              ))}
            </div>
            <button onClick={load} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2d36] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> تحديث</button>
            <button onClick={exportFullCsv} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#34cc30] text-white hover:bg-[#2eb829]"><Download size={14} /> تصدير الإجمالي</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { l: "إجمالي المستخدمين", v: fmt(t.users), c: "text-[#485869] dark:text-white", Icon: Users },
          { l: "المستقلين",          v: fmt(t.freelancers), c: "text-blue-600", Icon: Users },
          { l: "العملاء",            v: fmt(t.clients), c: "text-purple-600", Icon: Users },
          { l: "الطلبات",            v: fmt(t.orders), c: "text-orange-600", Icon: ShoppingBag },
          { l: "الإيرادات",          v: sar(t.revenue), c: "text-[#34cc30]", Icon: DollarSign },
          { l: "خدمات نشطة",         v: fmt(t.activeServices), c: "text-cyan-600", Icon: Activity },
          { l: "تذاكر دعم",         v: fmt(t.tickets), c: "text-red-500", Icon: Activity },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-xl p-4 border border-gray-100 dark:border-[#2a2d36] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <s.Icon size={16} className="text-gray-400" />
              <TrendingUp size={12} className="text-[#34cc30]" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.l}</div>
            <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] p-1.5 flex flex-wrap gap-1">
        {tabs.map(({ k, l, Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-[#34cc30] text-white shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
            <Icon size={15} /> {l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[#485869] dark:text-white mb-2 flex items-center gap-2"><Calendar size={16} className="text-[#34cc30]" /> النشاط اليومي</h3>
            <DataTable<any>
              columns={dailyCols}
              rows={data?.daily || []}
              rowKey={r => r.date}
              empty="لا توجد بيانات يومية بعد"
              exportFilename={`daily-${period}`}
              pageSize={31}
            />
          </div>
        </div>
      )}

      {tab === "services" && (
        <div className="space-y-4">
          <h3 className="font-bold text-[#485869] dark:text-white">أعلى التصنيفات أداءً</h3>
          <DataTable<any> columns={catCols} rows={data?.topCategories || []} rowKey={r => r.name} empty="لا توجد بيانات" exportFilename={`top-categories-${period}`} />
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <h3 className="font-bold text-[#485869] dark:text-white">أعلى المستقلين أداءً</h3>
          <DataTable<any> columns={flCols} rows={data?.topFreelancers || []} rowKey={r => r.id} empty="لا توجد بيانات" exportFilename={`top-freelancers-${period}`} />
        </div>
      )}

      {tab === "revenue" && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] p-6">
          <h3 className="font-bold text-[#485869] dark:text-white mb-4">تفاصيل الإيرادات</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#34cc30]/10 rounded-lg p-4"><div className="text-xs text-gray-500 mb-1">إجمالي الإيرادات</div><div className="text-2xl font-bold text-[#34cc30]">{sar(t.revenue)}</div></div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4"><div className="text-xs text-gray-500 mb-1">متوسط قيمة الطلب</div><div className="text-2xl font-bold text-blue-600">{sar(t.orders ? Math.round(t.revenue / t.orders) : 0)}</div></div>
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4"><div className="text-xs text-gray-500 mb-1">عدد الطلبات</div><div className="text-2xl font-bold text-purple-600">{fmt(t.orders)}</div></div>
          </div>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg p-4 leading-relaxed">
            للحصول على تقارير الإيرادات اليومية والأسبوعية والشهرية بالتفصيل، استخدم تبويب <strong>نظرة عامة</strong> أعلاه ثم اضغط على زر <strong>CSV</strong> لتصدير الأرقام.
          </div>
        </div>
      )}

      {tab === "support" && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] p-6">
          <h3 className="font-bold text-[#485869] dark:text-white mb-4">إحصاءات الدعم</h3>
          <div className="text-3xl font-bold text-[#485869] dark:text-white">{fmt(t.tickets)} <span className="text-sm font-normal text-gray-500">تذكرة دعم في المجموع</span></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">للنزاعات والتحويلات والاستردادات، انتقل إلى <strong>مركز الدعم الموحّد</strong>.</p>
        </div>
      )}
    </div>
  );
}
