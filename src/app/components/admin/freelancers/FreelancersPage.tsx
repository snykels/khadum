'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Search, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle, Ban, Star, Eye, Edit, MoreVertical, MessageSquare, Download,
  LayoutGrid, List, RefreshCw, Trash2, Send, Lock, Save, Users, UserCheck,
  Clock, TrendingUp, AlertTriangle, Bookmark, FilterX, Mail, Phone
} from "lucide-react";
import { fmt, dateAr, timeAgo, useToast, patchJson, postJson } from "../_helpers";
import FreelancerDrawer from "./FreelancerDrawer";
import { openWhatsAppChat } from "../_whatsapp";
import UserEditModal from "../UserEditModal";

type ViewMode = "table" | "cards";
type SortKey = "createdAt" | "name" | "rating" | "completedProjects" | "lastLoginAt";
type Order = "asc" | "desc";

interface Filters {
  q: string;
  statuses: string[]; // active|suspended|verified|unverified|blocked
  ratingMin: string;
  ratingMax: string;
  ordersMin: string;
  ordersMax: string;
  dateFrom: string;
  dateTo: string;
  location: string;
  onlineOnly: boolean;
  verified: string; // "" | "yes" | "no"
}

const EMPTY_FILTERS: Filters = {
  q: "", statuses: [], ratingMin: "", ratingMax: "",
  ordersMin: "", ordersMax: "", dateFrom: "", dateTo: "",
  location: "", onlineOnly: false, verified: "",
};

const STATUS_OPTIONS = [
  { id: "active", label: "نشط" },
  { id: "suspended", label: "موقوف" },
  { id: "blocked", label: "محظور" },
  { id: "verified", label: "موثّق" },
  { id: "unverified", label: "غير موثّق" },
  { id: "pending_activation", label: "بانتظار التفعيل" },
  { id: "activated", label: "مفعّل" },
];

const SORT_PRESETS: { id: string; label: string; sort: SortKey; order: Order }[] = [
  { id: "newest", label: "الأحدث تسجيلاً", sort: "createdAt", order: "desc" },
  { id: "oldest", label: "الأقدم تسجيلاً", sort: "createdAt", order: "asc" },
  { id: "name_asc", label: "أبجدياً (أ-ي)", sort: "name", order: "asc" },
  { id: "name_desc", label: "أبجدياً (ي-أ)", sort: "name", order: "desc" },
  { id: "rating_desc", label: "الأعلى تقييماً", sort: "rating", order: "desc" },
  { id: "rating_asc", label: "الأقل تقييماً", sort: "rating", order: "asc" },
  { id: "projects_desc", label: "الأكثر مشاريع", sort: "completedProjects", order: "desc" },
  { id: "active_recent", label: "آخر نشاط", sort: "lastLoginAt", order: "desc" },
];

export default function FreelancersPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { show, node } = useToast();

  const [filters, setFilters] = useState<Filters>(() => parseFiltersFromURL(sp));
  const [sort, setSort] = useState<SortKey>(() => (sp.get("sort") as SortKey) || "createdAt");
  const [order, setOrder] = useState<Order>(() => (sp.get("order") as Order) || "desc");
  const [page, setPage] = useState<number>(() => parseInt(sp.get("page") || "1"));
  const [limit, setLimit] = useState<number>(() => parseInt(sp.get("limit") || "20"));
  const [view, setView] = useState<ViewMode>(() => (sp.get("view") as ViewMode) || "table");

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [savedViews, setSavedViews] = useState<{ name: string; filters: Filters; sort: SortKey; order: Order }[]>([]);
  const [showSaveView, setShowSaveView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const [showBulkNotify, setShowBulkNotify] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);

  // Load saved views from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("khadom_freelancer_saved_views");
      if (raw) setSavedViews(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Sync URL
  useEffect(() => {
    const qs = new URLSearchParams();
    if (filters.q) qs.set("q", filters.q);
    filters.statuses.forEach(s => qs.append("statusIn", s));
    if (filters.verified) qs.set("verified", filters.verified);
    if (filters.ratingMin) qs.set("ratingMin", filters.ratingMin);
    if (filters.ratingMax) qs.set("ratingMax", filters.ratingMax);
    if (filters.ordersMin) qs.set("ordersMin", filters.ordersMin);
    if (filters.ordersMax) qs.set("ordersMax", filters.ordersMax);
    if (filters.dateFrom) qs.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) qs.set("dateTo", filters.dateTo);
    if (filters.location) qs.set("location", filters.location);
    if (filters.onlineOnly) qs.set("onlineOnly", "1");
    if (sort !== "createdAt") qs.set("sort", sort);
    if (order !== "desc") qs.set("order", order);
    if (page !== 1) qs.set("page", String(page));
    if (limit !== 20) qs.set("limit", String(limit));
    if (view !== "table") qs.set("view", view);
    const url = `/admin/freelancers${qs.toString() ? "?" + qs.toString() : ""}`;
    router.replace(url, { scroll: false });
    // eslint-disable-next-line
  }, [filters, sort, order, page, limit, view]);

  // Fetch
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("role", "freelancer");
      if (filters.q) qs.set("q", filters.q);
      filters.statuses.forEach(s => qs.append("statusIn", s));
      if (filters.verified) qs.set("verified", filters.verified);
      if (filters.ratingMin) qs.set("ratingMin", filters.ratingMin);
      if (filters.ratingMax) qs.set("ratingMax", filters.ratingMax);
      if (filters.ordersMin) qs.set("ordersMin", filters.ordersMin);
      if (filters.ordersMax) qs.set("ordersMax", filters.ordersMax);
      if (filters.dateFrom) qs.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) qs.set("dateTo", filters.dateTo);
      if (filters.location) qs.set("location", filters.location);
      if (filters.onlineOnly) qs.set("onlineOnly", "1");
      qs.set("sort", sort);
      qs.set("order", order);
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      const r = await fetch(`/api/admin/users?${qs.toString()}`);
      if (!r.ok) throw new Error("فشل تحميل البيانات");
      const j = await r.json();
      setData(j.users || []);
      setTotal(j.total || 0);
    } catch (e: any) {
      setError(e?.message || "خطأ");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, order, page, limit]);

  useEffect(() => { load(); }, [load]);

  // Real-time refresh every 60s
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && !inField) {
        e.preventDefault();
        setSelected(new Set(data.map(d => d.id)));
      }
      if (e.key === "Delete" && selected.size > 0 && !inField) {
        e.preventDefault();
        bulkDelete();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [data, selected]);

  // KPIs from current page (estimate)
  const stats = useMemo(() => {
    const onlineCount = data.filter(d => d.isOnline).length;
    const suspendedCount = data.filter(d => d.isSuspended).length;
    const verifiedCount = data.filter(d => d.isVerified).length;
    const avgRating = data.length ? data.reduce((s, d) => s + Number(d.rating || 0), 0) / data.length : 0;
    return { onlineCount, suspendedCount, verifiedCount, avgRating };
  }, [data]);

  function updateFilter<K extends keyof Filters>(k: K, v: Filters[K]) {
    setPage(1);
    setFilters(f => ({ ...f, [k]: v }));
  }
  function toggleStatus(id: string) {
    setPage(1);
    setFilters(f => ({
      ...f,
      statuses: f.statuses.includes(id) ? f.statuses.filter(x => x !== id) : [...f.statuses, id],
    }));
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS); setPage(1);
  }
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.q) n++;
    if (filters.statuses.length) n++;
    if (filters.verified) n++;
    if (filters.ratingMin || filters.ratingMax) n++;
    if (filters.ordersMin || filters.ordersMax) n++;
    if (filters.dateFrom || filters.dateTo) n++;
    if (filters.location) n++;
    if (filters.onlineOnly) n++;
    return n;
  }, [filters]);

  function applySortPreset(presetId: string) {
    const p = SORT_PRESETS.find(x => x.id === presetId);
    if (p) { setSort(p.sort); setOrder(p.order); setPage(1); }
  }
  function changeSortColumn(col: SortKey) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("desc"); }
    setPage(1);
  }

  // Bulk actions
  function toggleSelect(id: number) {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function toggleSelectAll() {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map(d => d.id)));
  }
  async function bulkSuspend(on: boolean) {
    if (!selected.size) return;
    const reason = on ? prompt("سبب الإيقاف؟ (اختياري)") || "" : "";
    const { ok, data: res } = await patchJson("/api/admin/users/bulk", {
      ids: Array.from(selected), isSuspended: on, reason
    });
    show(ok ? `تم تحديث ${res.count} مستقل` : (res?.error || "فشل"), ok);
    if (ok) { setSelected(new Set()); load(); }
  }
  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`هل أنت متأكد من حذف ${selected.size} مستقل؟`)) return;
    const r = await fetch("/api/admin/users/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    const res = await r.json().catch(() => ({}));
    show(r.ok ? `تم حذف ${res.count} مستقل` : (res?.error || "فشل"), r.ok);
    if (r.ok) { setSelected(new Set()); load(); }
  }
  async function bulkNotify() {
    if (!selected.size || !notifyTitle.trim() || !notifyMsg.trim()) {
      show("اكتب عنوان ورسالة", false); return;
    }
    const { ok, data: res } = await postJson("/api/admin/users/bulk", {
      ids: Array.from(selected), title: notifyTitle, message: notifyMsg, channel: "inapp"
    });
    show(ok ? `تم الإرسال إلى ${res.count} مستلم` : "فشل", ok);
    if (ok) { setShowBulkNotify(false); setNotifyTitle(""); setNotifyMsg(""); setSelected(new Set()); }
  }
  function exportCSV() {
    const ids = selected.size ? Array.from(selected).join(",") : "";
    const url = ids ? `/api/admin/users/export?role=freelancer&ids=${ids}` : `/api/admin/users/export?role=freelancer`;
    window.open(url, "_blank");
  }
  function bulkWhatsApp() {
    const phones = data.filter(d => selected.has(d.id) && d.phone).map(d => d.phone);
    if (!phones.length) { show("لا توجد أرقام للتواصل", false); return; }
    show(`جاري فتح ${Math.min(5, phones.length)} محادثة واتساب`, true);
    phones.slice(0, 5).forEach((p, i) => setTimeout(() => openWhatsAppChat(p, { uniqueWindow: true }), i * 250));
    if (phones.length > 5) show(`فُتحت أول 5 من أصل ${phones.length}. اختر دفعات أصغر للباقي.`, true);
  }

  // Saved views
  function saveCurrentView() {
    if (!newViewName.trim()) { show("اكتب اسم العرض", false); return; }
    const next = [...savedViews, { name: newViewName.trim(), filters, sort, order }];
    setSavedViews(next);
    localStorage.setItem("khadom_freelancer_saved_views", JSON.stringify(next));
    setNewViewName(""); setShowSaveView(false);
    show("تم حفظ العرض", true);
  }
  function loadView(idx: number) {
    const v = savedViews[idx];
    if (!v) return;
    setFilters(v.filters); setSort(v.sort); setOrder(v.order); setPage(1);
  }
  function deleteView(idx: number) {
    const next = savedViews.filter((_, i) => i !== idx);
    setSavedViews(next);
    localStorage.setItem("khadom_freelancer_saved_views", JSON.stringify(next));
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      {node}

      {/* Bulk Notify Modal */}
      {showBulkNotify && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBulkNotify(false)}>
          <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-1">إرسال إشعار جماعي</h3>
            <p className="text-xs text-gray-500 mb-4">إلى {selected.size} مستقل</p>
            <input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder="عنوان الإشعار" className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
            <textarea value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} placeholder="نص الرسالة..." rows={4} className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
            <div className="flex gap-2 mt-4">
              <button onClick={bulkNotify} className="flex-1 bg-[#34cc30] hover:bg-[#2eb829] text-white text-sm font-medium py-2 rounded-lg">إرسال</button>
              <button onClick={() => setShowBulkNotify(false)} className="px-4 text-sm text-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Header + KPIs */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إدارة المستقلين</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fmt(total)} مستقل · صفحة {page} من {totalPages}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === "table" ? "cards" : "table")} className="p-2 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50" title={view === "table" ? "عرض كبطاقات" : "عرض كجدول"}>
            {view === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          <button onClick={load} className="p-2 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50" title="تحديث">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Users} label="إجمالي المستقلين" value={fmt(total)} color="from-blue-500 to-blue-600" />
        <KPI icon={UserCheck} label="موثّقون" value={fmt(stats.verifiedCount)} sub="في الصفحة" color="from-emerald-500 to-emerald-600" />
        <KPI icon={Clock} label="متصل الآن" value={fmt(stats.onlineCount)} sub="في الصفحة" color="from-amber-500 to-orange-500" />
        <KPI icon={Star} label="متوسط التقييم" value={stats.avgRating.toFixed(1)} sub="في الصفحة" color="from-purple-500 to-pink-500" />
      </div>

      {/* Search + Filter Toggle */}
      <div className="bg-white dark:bg-[#1c1f26] rounded-2xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              value={filters.q}
              onChange={e => updateFilter("q", e.target.value)}
              placeholder="ابحث بالاسم، البريد، الجوال أو الـ ID... (Ctrl+K)"
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] text-sm rounded-lg pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
            />
          </div>

          <select value={`${sort}_${order}`} onChange={e => {
            const preset = SORT_PRESETS.find(p => `${p.sort}_${p.order}` === e.target.value);
            if (preset) applySortPreset(preset.id);
          }} className="text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2.5 focus:outline-none">
            {SORT_PRESETS.map(p => <option key={p.id} value={`${p.sort}_${p.order}`}>{p.label}</option>)}
          </select>

          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg border transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-[#34cc30] text-white border-[#34cc30]"
              : "bg-white dark:bg-[#15171c] border-gray-200 dark:border-white/10 hover:bg-gray-50"
          }`}>
            <Filter size={14} /> فلاتر {activeFilterCount > 0 && <span className="bg-white/30 px-1.5 rounded-full text-[10px]">{activeFilterCount}</span>}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-red-500 hover:underline">
              <FilterX size={12} /> مسح الكل
            </button>
          )}
        </div>

        {/* Saved views chips */}
        {savedViews.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500"><Bookmark size={12} className="inline mb-0.5" /> العروض المحفوظة:</span>
            {savedViews.map((v, i) => (
              <span key={i} className="group flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-xs">
                <button onClick={() => loadView(i)} className="hover:text-[#34cc30]">{v.name}</button>
                <button onClick={() => deleteView(i)} className="opacity-0 group-hover:opacity-100 text-red-500"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-4"
          >
            <FilterSection label="الحالة (يمكن اختيار أكثر من واحد)">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.id} onClick={() => toggleStatus(s.id)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filters.statuses.includes(s.id)
                      ? "bg-[#34cc30] text-white border-[#34cc30]"
                      : "bg-white dark:bg-[#15171c] border-gray-200 dark:border-white/10 hover:bg-gray-50"
                  }`}>{s.label}</button>
                ))}
              </div>
            </FilterSection>

            <div className="grid sm:grid-cols-2 gap-4">
              <FilterSection label="نطاق التقييم (من - إلى)">
                <div className="flex gap-2">
                  <input type="number" min="0" max="5" step="0.1" value={filters.ratingMin} onChange={e => updateFilter("ratingMin", e.target.value)} placeholder="من" className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                  <input type="number" min="0" max="5" step="0.1" value={filters.ratingMax} onChange={e => updateFilter("ratingMax", e.target.value)} placeholder="إلى" className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                </div>
              </FilterSection>

              <FilterSection label="عدد المشاريع (من - إلى)">
                <div className="flex gap-2">
                  <input type="number" min="0" value={filters.ordersMin} onChange={e => updateFilter("ordersMin", e.target.value)} placeholder="من" className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                  <input type="number" min="0" value={filters.ordersMax} onChange={e => updateFilter("ordersMax", e.target.value)} placeholder="إلى" className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                </div>
              </FilterSection>

              <FilterSection label="نطاق تاريخ التسجيل">
                <div className="flex gap-2">
                  <input type="date" value={filters.dateFrom} onChange={e => updateFilter("dateFrom", e.target.value)} className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5" />
                  <input type="date" value={filters.dateTo} onChange={e => updateFilter("dateTo", e.target.value)} className="flex-1 text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5" />
                </div>
              </FilterSection>

              <FilterSection label="المدينة">
                <input value={filters.location} onChange={e => updateFilter("location", e.target.value)} placeholder="مثلاً: الرياض" className="w-full text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
              </FilterSection>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={filters.onlineOnly} onChange={e => updateFilter("onlineOnly", e.target.checked)} className="accent-[#34cc30]" />
                <span>متصل الآن فقط</span>
              </label>
              <button onClick={() => setShowSaveView(true)} className="text-xs text-[#34cc30] hover:underline flex items-center gap-1">
                <Save size={12} /> حفظ كعرض
              </button>
              {showSaveView && (
                <div className="flex items-center gap-2">
                  <input value={newViewName} onChange={e => setNewViewName(e.target.value)} placeholder="اسم العرض" className="text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                  <button onClick={saveCurrentView} className="text-xs bg-[#34cc30] text-white px-2 py-1.5 rounded-lg">حفظ</button>
                  <button onClick={() => setShowSaveView(false)} className="text-xs text-gray-500">إلغاء</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-l from-[#34cc30] to-[#2eb829] text-white rounded-2xl p-3 flex items-center gap-2 flex-wrap shadow-lg"
        >
          <span className="font-bold px-2">{selected.size} محدد</span>
          <span className="text-white/40">|</span>
          <BulkBtn onClick={() => bulkSuspend(true)} icon={Ban}>إيقاف</BulkBtn>
          <BulkBtn onClick={() => bulkSuspend(false)} icon={CheckCircle}>إلغاء الإيقاف</BulkBtn>
          <BulkBtn onClick={() => setShowBulkNotify(true)} icon={Send}>إشعار جماعي</BulkBtn>
          <BulkBtn onClick={bulkWhatsApp} icon={MessageSquare}>واتساب</BulkBtn>
          <BulkBtn onClick={exportCSV} icon={Download}>تصدير CSV</BulkBtn>
          <BulkBtn onClick={bulkDelete} icon={Trash2} danger>حذف</BulkBtn>
          <button onClick={() => setSelected(new Set())} className="mr-auto text-xs underline">إلغاء التحديد</button>
        </motion.div>
      )}

      {/* Error / Loading / Empty / Content */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 rounded-2xl p-8 text-center">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p className="font-medium">{error}</p>
          <button onClick={load} className="mt-3 text-sm underline">إعادة المحاولة</button>
        </div>
      ) : loading && data.length === 0 ? (
        <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-12 text-center text-gray-400">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
          <p>جاري التحميل...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-12 text-center text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>لا توجد نتائج بهذه المعايير</p>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="mt-3 text-sm text-[#34cc30] hover:underline">مسح الفلاتر</button>
          )}
        </div>
      ) : view === "table" ? (
        <TableView
          data={data}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          sort={sort}
          order={order}
          changeSort={changeSortColumn}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onOpen={setOpenId}
          onEdit={setEditId}
          onChanged={load}
          show={show}
        />
      ) : (
        <CardsView
          data={data}
          selected={selected}
          toggleSelect={toggleSelect}
          onOpen={setOpenId}
        />
      )}

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-[#1c1f26] rounded-2xl p-3 border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>الصف:</span>
            <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} className="text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1 focus:outline-none">
              {[20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>· {fmt(total)} نتيجة</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
              <ChevronRight size={16} />
            </button>
            <span className="text-sm px-3">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      <FreelancerDrawer userId={openId} onClose={() => setOpenId(null)} onChanged={load} show={show} />
      <UserEditModal open={editId !== null} userId={editId} mode="freelancer"
        onClose={() => setEditId(null)} onSaved={load} show={show} />
    </div>
  );
}

/* ---------- helpers ---------- */
function parseFiltersFromURL(sp: URLSearchParams): Filters {
  return {
    q: sp.get("q") || "",
    statuses: sp.getAll("statusIn"),
    verified: sp.get("verified") || "",
    ratingMin: sp.get("ratingMin") || "",
    ratingMax: sp.get("ratingMax") || "",
    ordersMin: sp.get("ordersMin") || "",
    ordersMax: sp.get("ordersMax") || "",
    dateFrom: sp.get("dateFrom") || "",
    dateTo: sp.get("dateTo") || "",
    location: sp.get("location") || "",
    onlineOnly: sp.get("onlineOnly") === "1",
  };
}

function KPI({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`bg-gradient-to-br ${color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 dark:text-white/50">{label}</div>
          <div className="text-xl font-bold text-[#485869] dark:text-white tabular-nums">{value}</div>
          {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: any) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-500 dark:text-white/50 mb-1.5 uppercase">{label}</div>
      {children}
    </div>
  );
}

function BulkBtn({ icon: Icon, children, onClick, danger }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors ${danger ? "bg-red-600/30 hover:bg-red-600/50" : ""}`}>
      <Icon size={13} /> {children}
    </button>
  );
}

function StatusBadge({ user }: { user: any }) {
  if (user.isLocked) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 w-fit"><Lock size={10} /> محمي</span>;
  if (user.isBlocked) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium">محظور</span>;
  if (user.isSuspended) return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-medium">موقوف</span>;
  if (user.activationStatus === "pending") return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-medium">بانتظار التفعيل</span>;
  if (!user.isVerified) return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-medium">قيد المراجعة</span>;
  return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-medium">نشط</span>;
}

function OnlineDot({ online }: { online: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${online ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-gray-300"}`} title={online ? "متصل" : "غير متصل"} />;
}

function SortHeader({ label, col, sort, order, changeSort }: any) {
  const active = sort === col;
  return (
    <th className="text-right p-3">
      <button onClick={() => changeSort(col)} className={`flex items-center gap-1 hover:text-[#34cc30] transition-colors ${active ? "text-[#34cc30]" : ""}`}>
        {label}
        {active ? (order === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} className="opacity-20" />}
      </button>
    </th>
  );
}

function TableView({ data, selected, toggleSelect, toggleSelectAll, sort, order, changeSort, openMenu, setOpenMenu, onOpen, onEdit, onChanged, show }: any) {
  async function quickAction(id: number, action: string) {
    setOpenMenu(null);
    if (action === "suspend") {
      const reason = prompt("سبب الإيقاف؟") || "";
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: true, reason });
      show(ok ? "تم الإيقاف" : "فشل", ok); if (ok) onChanged();
    }
    if (action === "unsuspend") {
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: false });
      show(ok ? "تم إلغاء الإيقاف" : "فشل", ok); if (ok) onChanged();
    }
    if (action === "verify") {
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isVerified: true });
      show(ok ? "تم التوثيق" : "فشل", ok); if (ok) onChanged();
    }
    if (action === "unverify") {
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isVerified: false });
      show(ok ? "تم إلغاء التوثيق" : "فشل", ok); if (ok) onChanged();
    }
  }

  return (
    <div className="bg-white dark:bg-[#1c1f26] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#15171c] text-xs text-gray-600 dark:text-gray-400">
            <tr>
              <th className="p-3 w-10">
                <input type="checkbox" checked={data.length > 0 && selected.size === data.length} onChange={toggleSelectAll} className="accent-[#34cc30]" />
              </th>
              <SortHeader label="المستقل" col="name" sort={sort} order={order} changeSort={changeSort} />
              <th className="text-right p-3">الجوال</th>
              <SortHeader label="التقييم" col="rating" sort={sort} order={order} changeSort={changeSort} />
              <SortHeader label="مشاريع مكتملة" col="completedProjects" sort={sort} order={order} changeSort={changeSort} />
              <th className="text-right p-3">الأرباح</th>
              <th className="text-right p-3">الحالة</th>
              <SortHeader label="آخر نشاط" col="lastLoginAt" sort={sort} order={order} changeSort={changeSort} />
              <th className="text-right p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((f: any) => (
              <tr key={f.id} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 ${selected.has(f.id) ? "bg-[#34cc30]/5" : ""}`}>
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleSelect(f.id)} className="accent-[#34cc30]" />
                </td>
                <td className="p-3">
                  <button onClick={() => onOpen(f.id)} className="flex items-center gap-3 text-right">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold text-sm">{f.name?.charAt(0)}</div>
                      <span className="absolute -bottom-0.5 -left-0.5"><OnlineDot online={f.isOnline} /></span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-medium text-[#485869] dark:text-white">
                        <span className="truncate max-w-[140px]">{f.name}</span>
                        {f.isVerified && <CheckCircle size={12} className="text-[#34cc30] flex-shrink-0" />}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[160px]">{f.email}</div>
                    </div>
                  </button>
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">{f.phone || "—"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">{Number(f.rating || 0).toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-3 tabular-nums">{fmt(f.ordersCount || 0)}</td>
                <td className="p-3 tabular-nums font-medium">{fmt(f.earned || 0)} ر.س</td>
                <td className="p-3"><StatusBadge user={f} /></td>
                <td className="p-3 text-xs text-gray-500">{f.lastLoginAt ? timeAgo(f.lastLoginAt) : "—"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1 relative">
                    <button onClick={() => onOpen(f.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-[#34cc30]" title="تفاصيل"><Eye size={14} /></button>
                    <button onClick={() => onEdit(f.id)} disabled={f.isLocked} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-blue-600 disabled:opacity-40" title="تعديل"><Edit size={14} /></button>
                    {f.phone && (
                      <button onClick={() => openWhatsAppChat(f.phone)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-emerald-600" title="محادثة واتساب">
                        <MessageSquare size={14} />
                      </button>
                    )}
                    <button onClick={() => setOpenMenu(openMenu === f.id ? null : f.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500"><MoreVertical size={14} /></button>
                    {openMenu === f.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
                        <div className="absolute top-8 left-0 z-40 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 shadow-xl rounded-lg py-1 w-48">
                          <MenuItem onClick={() => { onOpen(f.id); setOpenMenu(null); }} icon={Eye}>عرض التفاصيل</MenuItem>
                          <MenuItem onClick={() => { onEdit(f.id); setOpenMenu(null); }} icon={Edit}>تعديل البيانات</MenuItem>
                          {f.isVerified
                            ? <MenuItem onClick={() => quickAction(f.id, "unverify")} icon={X}>إلغاء التوثيق</MenuItem>
                            : <MenuItem onClick={() => quickAction(f.id, "verify")} icon={CheckCircle}>توثيق</MenuItem>}
                          {f.isSuspended
                            ? <MenuItem onClick={() => quickAction(f.id, "unsuspend")} icon={CheckCircle}>إلغاء الإيقاف</MenuItem>
                            : <MenuItem onClick={() => quickAction(f.id, "suspend")} icon={Ban} danger>إيقاف</MenuItem>}
                          {f.email && <MenuItem onClick={() => window.open(`mailto:${f.email}`)} icon={Mail}>إرسال إيميل</MenuItem>}
                          {f.phone && <MenuItem onClick={() => window.open(`tel:${f.phone}`)} icon={Phone}>اتصال</MenuItem>}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, children, onClick, danger }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-white/5 ${danger ? "text-red-600" : "text-gray-700 dark:text-white/80"}`}>
      <Icon size={12} /> {children}
    </button>
  );
}

function CardsView({ data, selected, toggleSelect, onOpen }: any) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {data.map((f: any) => (
        <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className={`bg-white dark:bg-[#1c1f26] rounded-2xl p-4 border ${selected.has(f.id) ? "border-[#34cc30] ring-2 ring-[#34cc30]/20" : "border-gray-100 dark:border-white/5"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start justify-between mb-3">
            <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleSelect(f.id)} className="accent-[#34cc30]" />
            <StatusBadge user={f} />
          </div>
          <button onClick={() => onOpen(f.id)} className="w-full text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold text-lg">{f.name?.charAt(0)}</div>
                <span className="absolute -bottom-0.5 -left-0.5"><OnlineDot online={f.isOnline} /></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-bold text-[#485869] dark:text-white">
                  <span className="truncate">{f.name}</span>
                  {f.isVerified && <CheckCircle size={12} className="text-[#34cc30] flex-shrink-0" />}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{f.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <CardStat label="مشاريع" value={fmt(f.ordersCount || 0)} />
              <CardStat label="التقييم" value={Number(f.rating || 0).toFixed(1)} icon={Star} />
              <CardStat label="الأرباح" value={fmt(f.earned || 0)} />
            </div>
            <div className="text-[10px] text-gray-400 mt-2 text-center">آخر نشاط: {f.lastLoginAt ? timeAgo(f.lastLoginAt) : "—"}</div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function CardStat({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
      <div className="text-xs font-bold text-[#485869] dark:text-white tabular-nums flex items-center justify-center gap-0.5">
        {Icon && <Icon size={10} className="text-amber-500" fill="currentColor" />} {value}
      </div>
      <div className="text-[10px] text-gray-500 dark:text-white/50">{label}</div>
    </div>
  );
}
