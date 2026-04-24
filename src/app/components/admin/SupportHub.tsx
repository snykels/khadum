'use client';

import { useEffect, useState } from "react";
import { HelpCircle, AlertCircle, ArrowLeftRight, RotateCcw, Mail, Phone, MessageSquare, RefreshCw, Eye, CheckCircle, X } from "lucide-react";
import { AdminSupportTicketsPage, OrderTransferPage, RefundRequestsPage } from "./AdminPagesNew";
import { DisputesPage } from "./AdminPages";
import FilterPanel, { FilterGroup, FilterChip } from "./FilterPanel";

type TabKey = "tickets" | "disputes" | "transfers" | "refunds" | "contact";

const tabs: { key: TabKey; label: string; icon: typeof HelpCircle; color: string }[] = [
  { key: "tickets",   label: "تذاكر الدعم",     icon: HelpCircle,    color: "text-blue-600" },
  { key: "disputes",  label: "النزاعات",         icon: AlertCircle,   color: "text-red-600" },
  { key: "transfers", label: "تحويل الطلبات",    icon: ArrowLeftRight, color: "text-purple-600" },
  { key: "refunds",   label: "طلبات الاسترداد", icon: RotateCcw,     color: "text-orange-600" },
  { key: "contact",   label: "رسائل تواصل معنا", icon: Mail,          color: "text-[#34cc30]" },
];

interface ContactMsg {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: string | null;
  createdAt: string | null;
}

function ContactMessagesTab() {
  const [items, setItems] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("الكل");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/contact-messages");
      const d = await r.json();
      if (r.ok) setItems(d.messages || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const statuses = ["الكل", "new", "in_progress", "closed"];
  const statusLabel: Record<string, string> = { new: "جديد", in_progress: "قيد المراجعة", closed: "مغلق", "الكل": "الكل" };
  const statusColor: Record<string, string> = { new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", closed: "bg-gray-100 text-gray-600" };

  const filtered = items.filter(m => {
    const okStatus = statusFilter === "الكل" || m.status === statusFilter;
    const okSearch = !search || m.name.includes(search) || m.phone.includes(search) || (m.message || "").includes(search);
    return okStatus && okSearch;
  });

  const activeCount = (statusFilter !== "الكل" ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الجوال أو الرسالة..."
            className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
          />
          <FilterPanel active={activeCount} onReset={() => { setStatusFilter("الكل"); setSearch(""); }}>
            <FilterGroup label="الحالة">
              {statuses.map(s => (
                <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {statusLabel[s] || s}
                </FilterChip>
              ))}
            </FilterGroup>
          </FilterPanel>
        </div>
        <button onClick={load} className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2a2d36] px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-12 text-center text-gray-400">
          <RefreshCw size={28} className="mx-auto mb-3 animate-spin" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-12 text-center text-gray-400">
          <Mail size={36} className="mx-auto mb-3 opacity-40" />
          لا توجد رسائل
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 border border-gray-100 dark:border-[#2a2d36] hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#485869] dark:text-white">{m.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status || "new"] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[m.status || "new"] || m.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Phone size={11} /> {m.phone}</span>
                      {m.email && <span>· {m.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">{m.createdAt ? new Date(m.createdAt).toLocaleString("ar-SA") : ""}</div>
              </div>
              {m.subject && <div className="font-medium text-sm text-[#485869] dark:text-gray-200 mb-1">{m.subject}</div>}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{m.message}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#2a2d36]">
                <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="bg-[#34cc30] text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-[#2eb829]">
                  <MessageSquare size={12} /> رد عبر واتساب
                </a>
                <button className="border border-gray-200 dark:border-[#2a2d36] text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-white/5">
                  <CheckCircle size={12} /> إغلاق التذكرة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SupportHub() {
  const [tab, setTab] = useState<TabKey>("tickets");

  const renderTab = () => {
    switch (tab) {
      case "tickets":   return <AdminSupportTicketsPage />;
      case "disputes":  return <DisputesPage />;
      case "transfers": return <OrderTransferPage />;
      case "refunds":   return <RefundRequestsPage />;
      case "contact":   return <ContactMessagesTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#34cc30]/10 via-white to-white dark:from-[#34cc30]/5 dark:via-[#1a1d24] dark:to-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-[#2a2d36]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#485869] dark:text-white flex items-center gap-2">
              <HelpCircle className="text-[#34cc30]" /> مركز الدعم الموحّد
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              تذاكر، نزاعات، تحويل طلبات، استردادات، ورسائل تواصل العملاء — كل شيء في مكان واحد
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                active
                  ? "bg-[#34cc30] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={16} className={active ? "" : t.color} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div>{renderTab()}</div>
    </div>
  );
}
