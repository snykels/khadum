'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Search, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle, Ban, Eye, Edit, MoreVertical, MessageSquare, Download,
  LayoutGrid, List, RefreshCw, Trash2, Send, Lock, Save, Users, UserCheck,
  Clock, TrendingUp, AlertTriangle, Bookmark, FilterX, Mail, Phone, ShoppingBag
} from "lucide-react";
import { fmt, dateAr, timeAgo, useToast, patchJson, postJson } from "../_helpers";
import ClientDrawer from "./ClientDrawer";
import { openWhatsAppChat } from "../_whatsapp";
import UserEditModal from "../UserEditModal";

type ViewMode = "table" | "cards";
type SortKey = "createdAt" | "name" | "lastLoginAt";
type Order = "asc" | "desc";

interface Filters {
  q: string;
  statuses: string[];
  ordersMin: string;
  ordersMax: string;
  dateFrom: string;
  dateTo: string;
  location: string;
  onlineOnly: boolean;
}

const EMPTY_FILTERS: Filters = {
  q: "", statuses: [], ordersMin: "", ordersMax: "",
  dateFrom: "", dateTo: "", location: "", onlineOnly: false,
};

const STATUS_OPTIONS = [
  { id: "active", label: "نشط" },
  { id: "suspended", label: "موقوف" },
  { id: "blocked", label: "محظور" },
];

const SORT_PRESETS: { id: string; label: string; sort: SortKey; order: Order }[] = [
  { id: "newest", label: "الأحدث تسجيلاً", sort: "createdAt", order: "desc" },
  { id: "oldest", label: "الأقدم تسجيلاً", sort: "createdAt", order: "asc" },
  { id: "name_asc", label: "أبجدياً (أ-ي)", sort: "name", order: "asc" },
  { id: "name_desc", label: "أبجدياً (ي-أ)", sort: "name", order: "desc" },
  { id: "active_recent", label: "آخر نشاط", sort: "lastLoginAt", order: "desc" },
];

export default function ClientsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { show, node } = useToast();

  const [filters, setFilters] = useState<Filters>(() => parseFiltersFromURL(sp));
  const [sort, setSort] = useState<SortKey>(() => (sp.get("sort") as SortKey) || "createdAt");
  const [order, setOrder] = useState<Order>(() => (sp.get("order") as Order) || "desc");
  const [page, setPage] = useState<number>(() => parseInt(sp.get("page") || "1") || 1);
  const [limit, setLimit] = useState<number>(() => parseInt(sp.get("limit") || "20") || 20);
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("khadom_clients_saved_views");
      if (raw) setSavedViews(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (filters.q) qs.set("q", filters.q);
    filters.statuses.forEach(s => qs.append("statusIn", s));
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
    router.replace(`/admin/clients${qs.toString() ? "?" + qs.toString() : ""}`, { scroll: false });
    // eslint-disable-next-line
  }, [filters, sort, order, page, limit, view]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("role", "client");
      if (filters.q) qs.set("q", filters.q);
      filters.statuses.forEach(s => qs.append("statusIn", s));
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
  useEffect(() => { const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && !inField) { e.preventDefault(); setSelected(new Set(data.map(d => d.id))); }
      if (e.key === "Delete" && selected.size > 0 && !inField) { e.preventDefault(); bulkDelete(); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [data, selected]);

  const stats = useMemo(() => {
    const onlineCount = data.filter(d => d.isOnline).length;
    const activeCount = data.filter(d => !d.isSuspended && !d.isBlocked).length;
    const totalSpent = data.reduce((s, d) => s + Number(d.spent || 0), 0);
    const totalOrders = data.reduce((s, d) => s + Number(d.ordersCount || 0), 0);
    return { onlineCount, activeCount, totalSpent, totalOrders };
  }, [data]);

  function updateFilter<K extends keyof Filters>(k: K, v: Filters[K]) { setPage(1); setFilters(f => ({ ...f, [k]: v })); }
  function toggleStatus(id: string) {
    setPage(1);
    setFilters(f => ({ ...f, statuses: f.statuses.includes(id) ? f.statuses.filter(x => x !== id) : [...f.statuses, id] }));
  }
  function resetFilters() { setFilters(EMPTY_FILTERS); setPage(1); }
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.q) n++; if (filters.statuses.length) n++;
    if (filters.ordersMin || filters.ordersMax) n++;
    if (filters.dateFrom || filters.dateTo) n++;
    if (filters.location) n++; if (filters.onlineOnly) n++;
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

  function toggleSelect(id: number) { setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleSelectAll() { selected.size === data.length ? setSelected(new Set()) : setSelected(new Set(data.map(d => d.id))); }

  async function bulkSuspend(on: boolean) {
    if (!selected.size) return;
    const reason = on ? prompt("سبب الإيقاف؟ (اختياري)") || "" : "";
    const payload: any = { ids: Array.from(selected), isSuspended: on, reason };
    if (on) payload.isBlocked = false;
    const { ok, data: res } = await patchJson("/api/admin/users/bulk", payload);
    show(ok ? `تم تحديث ${res.count} عميل` : (res?.error || "فشل"), ok);
    if (ok) { setSelected(new Set()); load(); }
  }
  async function bulkBlock(on: boolean) {
    if (!selected.size) return;
    const reason = on ? prompt("سبب الحظر؟ (اختياري)") || "" : "";
    const payload: any = { ids: Array.from(selected), isBlocked: on, reason };
    if (on) payload.isSuspended = false;
    const { ok, data: res } = await patchJson("/api/admin/users/bulk", payload);
    show(ok ? `تم تحديث ${res.count} عميل` : (res?.error || "فشل"), ok);
    if (ok) { setSelected(new Set()); load(); }
  }
  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`هل أنت متأكد من حذف ${selected.size} عميل؟`)) return;
    const r = await fetch("/api/admin/users/bulk", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    const res = await r.json().catch(() => ({}));
    show(r.ok ? `تم حذف ${res.count} عميل` : (res?.error || "فشل"), r.ok);
    if (r.ok) { setSelected(new Set()); load(); }
  }
  async function bulkNotify() {
    if (!selected.size || !notifyTitle.trim() || !notifyMsg.trim()) { show("اكتب عنوان ورسالة", false); return; }
    const { ok, data: res } = await postJson("/api/admin/users/bulk", {
      ids: Array.from(selected), title: notifyTitle, message: notifyMsg, channel: "inapp"
    });
    show(ok ? `تم الإرسال إلى ${res.count} مستلم` : "فشل", ok);
    if (ok) { setShowBulkNotify(false); setNotifyTitle(""); setNotifyMsg(""); setSelected(new Set()); }
  }
  function exportCSV() {
    const ids = selected.size ? Array.from(selected).join(",") : "";
    const url = ids ? `/api/admin/users/export?role=client&ids=${ids}` : `/api/admin/users/export?role=client`;
    window.open(url, "_blank");
  }
  function bulkWhatsApp() {
    const phones = data.filter(d => selected.has(d.id) && d.phone).map(d => d.phone);
    if (!phones.length) { show("لا توجد أرقام للتواصل", false); return; }
    show(`جاري فتح ${Math.min(5, phones.length)} محادثة واتساب`, true);
    phones.slice(0, 5).forEach((p, i) => setTimeout(() => openWhatsAppChat(p, { uniqueWindow: true }), i * 250));
    if (phones.length > 5) show(`فُتحت أول 5 من أصل ${phones.length}. اختر دفعات أصغر للباقي.`, true);
  }

  function saveCurrentView() {
    if (!newViewName.trim()) { show("اكتب اسم العرض", false); return; }
    const next = [...savedViews, { name: newViewName.trim(), filters, sort, order }];
    setSavedViews(next);
    localStorage.setItem("khadom_clients_saved_views", JSON.stringify(next));
    setNewViewName(""); setShowSaveView(false);
    show("تم حفظ العرض", true);
  }
  function loadView(idx: number) {
    const v = savedViews[idx]; if (!v) return;
    setFilters(v.filters); setSort(v.sort); setOrder(v.order); setPage(1);
  }
  function deleteView(idx: number) {
    const next = savedViews.filter((_, i) => i !== idx);
    setSavedViews(next);
    localStorage.setItem("khadom_clients_saved_views", JSON.stringify(next));
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      {node}

      {showBulkNotify && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBulkNotify(false)}>
          <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-1">إرسال إشعار جماعي</h3>
            <p className="text-xs text-gray-500 mb-4">إلى {selected.size} عميل</p>
            <input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder="عنوان الإشعار"
              className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <textarea value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} placeholder="نص الرسالة..." rows={4}
              className="w-full text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <div className="flex gap-2 mt-4">
              <button onClick={bulkNotify} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg">إرسال</button>
              <button onClick={() => setShowBulkNotify(false)} className="px-4 text-sm text-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إدارة العملاء</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fmt(total)} عميل · صفحة {page} من {totalPages}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === "table" ? "cards" : "table")} className="p-2 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50">
            {view === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          <button onClick={load} className="p-2 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Users} label="إجمالي العملاء" value={fmt(total)} color="from-blue-500 to-blue-600" />
        <KPI icon={UserCheck} label="نشطون" value={fmt(stats.activeCount)} sub="في الصفحة" color="from-emerald-500 to-emerald-600" />
        <KPI icon={ShoppingBag} label="إجمالي الطلبات" value={fmt(stats.totalOrders)} sub="في الصفحة" color="from-amber-500 to-orange-500" />
        <KPI icon={TrendingUp} label="إجمالي الإنفاق" value={`${fmt(stats.totalSpent)} ر.س`} sub="في الصفحة" color="from-purple-500 to-pink-500" />
      </div>

      <div className="bg-white dark:bg-[#1c1f26] rounded-2xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef} value={filters.q} onChange={e => updateFilter("q", e.target.value)}
              placeholder="ابحث بالاسم، البريد، الجوال أو الـ ID... (Ctrl+K)"
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] text-sm rounded-lg pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <select value={`${sort}_${order}`} onChange={e => {
            const preset = SORT_PRESETS.find(p => `${p.sort}_${p.order}` === e.target.value);
            if (preset) applySortPreset(preset.id);
          }} className="text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-3 py-2.5 focus:outline-none">
            {SORT_PRESETS.map(p => <option key={p.id} value={`${p.sort}_${p.order}`}>{p.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg border transition-colors ${
            showFilters || activeFilterCount > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-[#15171c] border-gray-200 dark:border-white/10 hover:bg-gray-50"
          }`}>
            <Filter size={14} /> فلاتر {activeFilterCount > 0 && <span className="bg-white/30 px-1.5 rounded-full text-[10px]">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-red-500 hover:underline">
              <FilterX size={12} /> مسح الكل
            </button>
          )}
        </div>

        {savedViews.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500"><Bookmark size={12} className="inline mb-0.5" /> العروض المحفوظة:</span>
            {savedViews.map((v, i) => (
              <span key={i} className="group flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-xs">
                <button onClick={() => loadView(i)} className="hover:text-blue-600">{v.name}</button>
                <button onClick={() => deleteView(i)} className="opacity-0 group-hover:opacity-100 text-red-500"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-4">
            <FilterSection label="الحالة (يمكن اختيار أكثر من واحد)">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.id} onClick={() => toggleStatus(s.id)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filters.statuses.includes(s.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-[#15171c] border-gray-200 dark:border-white/10 hover:bg-gray-50"
                  }`}>{s.label}</button>
                ))}
              </div>
            </FilterSection>

            <div className="grid sm:grid-cols-2 gap-4">
              <FilterSection label="عدد الطلبات (من - إلى)">
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
                <input type="checkbox" checked={filters.onlineOnly} onChange={e => updateFilter("onlineOnly", e.target.checked)} className="accent-blue-600" />
                <span>متصل الآن فقط</span>
              </label>
              <button onClick={() => setShowSaveView(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Save size={12} /> حفظ كعرض
              </button>
              {showSaveView && (
                <div className="flex items-center gap-2">
                  <input value={newViewName} onChange={e => setNewViewName(e.target.value)} placeholder="اسم العرض" className="text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15171c] rounded-lg px-2 py-1.5 focus:outline-none" />
                  <button onClick={saveCurrentView} className="text-xs bg-blue-600 text-white px-2 py-1.5 rounded-lg">حفظ</button>
                  <button onClick={() => setShowSaveView(false)} className="text-xs text-gray-500">إلغاء</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-l from-blue-600 to-blue-700 text-white rounded-2xl p-3 flex items-center gap-2 flex-wrap shadow-lg">
          <span className="font-bold px-2">{selected.size} محدد</span>
          <span className="text-white/40">|</span>
          <BulkBtn onClick={() => bulkSuspend(true)} icon={Ban}>إيقاف</BulkBtn>
          <BulkBtn onClick={() => bulkBlock(true)} icon={Lock}>حظر</BulkBtn>
          <BulkBtn onClick={() => { bulkSuspend(false); bulkBlock(false); }} icon={CheckCircle}>تفعيل</BulkBtn>
          <BulkBtn onClick={() => setShowBulkNotify(true)} icon={Send}>إشعار جماعي</BulkBtn>
          <BulkBtn onClick={bulkWhatsApp} icon={MessageSquare}>واتساب</BulkBtn>
          <BulkBtn onClick={exportCSV} icon={Download}>تصدير CSV</BulkBtn>
          <BulkBtn onClick={bulkDelete} icon={Trash2} danger>حذف</BulkBtn>
          <button onClick={() => setSelected(new Set())} className="mr-auto text-xs underline">إلغاء التحديد</button>
        </motion.div>
      )}

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
          {activeFilterCount > 0 && <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">مسح الفلاتر</button>}
        </div>
      ) : view === "table" ? (
        <TableView data={data} selected={selected} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll}
          sort={sort} order={order} changeSort={changeSortColumn} openMenu={openMenu} setOpenMenu={setOpenMenu}
          onOpen={setOpenId} onEdit={setEditId} onChanged={load} show={show} />
      ) : (
        <CardsView data={data} selected={selected} toggleSelect={toggleSelect} onOpen={setOpenId} />
      )}

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

      <ClientDrawer userId={openId} onClose={() => setOpenId(null)} onChanged={load} show={show}
        onEdit={(id) => setEditId(id)} />
      <UserEditModal open={editId !== null} userId={editId} mode="client"
        onClose={() => setEditId(null)} onSaved={load} show={show} />
    </div>
  );
}

function parseFiltersFromURL(sp: URLSearchParams): Filters {
  return {
    q: sp.get("q") || "",
    statuses: sp.getAll("statusIn"),
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
        <div className={`bg-gradient-to-br ${color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md`}><Icon size={18} /></div>
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
    <button onClick={onClick} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 ${danger ? "bg-red-600/30 hover:bg-red-600/50" : ""}`}>
      <Icon size={13} /> {children}
    </button>
  );
}
function StatusBadge({ user }: { user: any }) {
  if (user.isLocked) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 w-fit"><Lock size={10} /> محمي</span>;
  if (user.isBlocked) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-medium">محظور</span>;
  if (user.isSuspended) return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-medium">موقوف</span>;
  return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-medium">نشط</span>;
}
function OnlineDot({ online }: { online: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${online ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-gray-300"}`} />;
}
function SortHeader({ label, col, sort, order, changeSort }: any) {
  const active = sort === col;
  return (
    <th className="text-right p-3">
      <button onClick={() => changeSort(col)} className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${active ? "text-blue-600" : ""}`}>
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
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: true, isBlocked: false, reason });
      show(ok ? "تم الإيقاف" : "فشل", ok); if (ok) onChanged();
    }
    if (action === "block") {
      const reason = prompt("سبب الحظر؟") || "";
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isBlocked: true, isSuspended: false, reason });
      show(ok ? "تم الحظر" : "فشل", ok); if (ok) onChanged();
    }
    if (action === "activate") {
      const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: false, isBlocked: false });
      show(ok ? "تم التفعيل" : "فشل", ok); if (ok) onChanged();
    }
  }
  return (
    <div className="bg-white dark:bg-[#1c1f26] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#15171c] text-xs text-gray-600 dark:text-gray-400">
            <tr>
              <th className="p-3 w-10">
                <input type="checkbox" checked={data.length > 0 && selected.size === data.length} onChange={toggleSelectAll} className="accent-blue-600" />
              </th>
              <SortHeader label="العميل" col="name" sort={sort} order={order} changeSort={changeSort} />
              <th className="text-right p-3">الجوال</th>
              <th className="text-right p-3">الطلبات</th>
              <th className="text-right p-3">الإنفاق</th>
              <th className="text-right p-3">آخر طلب</th>
              <th className="text-right p-3">الحالة</th>
              <SortHeader label="آخر نشاط" col="lastLoginAt" sort={sort} order={order} changeSort={changeSort} />
              <th className="text-right p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((c: any) => (
              <tr key={c.id} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 ${selected.has(c.id) ? "bg-blue-50 dark:bg-blue-500/5" : ""}`}>
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-blue-600" />
                </td>
                <td className="p-3">
                  <button onClick={() => onOpen(c.id)} className="flex items-center gap-3 text-right">
                    <div className="relative">
                      {c.avatar
                        ? <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{c.name?.charAt(0)}</div>}
                      <span className="absolute -bottom-0.5 -left-0.5"><OnlineDot online={c.isOnline} /></span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[#485869] dark:text-white truncate max-w-[160px]">{c.name}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[160px]" dir="ltr">{c.phone || c.email}</div>
                    </div>
                  </button>
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">{c.phone || "—"}</td>
                <td className="p-3 tabular-nums">{fmt(c.ordersCount || 0)}</td>
                <td className="p-3 tabular-nums font-medium">{fmt(c.spent || 0)} ر.س</td>
                <td className="p-3 text-xs text-gray-500">{c.lastOrder ? timeAgo(c.lastOrder) : "—"}</td>
                <td className="p-3"><StatusBadge user={c} /></td>
                <td className="p-3 text-xs text-gray-500">{c.lastLoginAt ? timeAgo(c.lastLoginAt) : "—"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1 relative">
                    <button onClick={() => onOpen(c.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-blue-600" title="تفاصيل"><Eye size={14} /></button>
                    <button onClick={() => onEdit(c.id)} disabled={c.isLocked} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-blue-600 disabled:opacity-40" title="تعديل"><Edit size={14} /></button>
                    {c.phone && (
                      <button onClick={() => openWhatsAppChat(c.phone)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500 hover:text-emerald-600" title="محادثة واتساب">
                        <MessageSquare size={14} />
                      </button>
                    )}
                    <button onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500"><MoreVertical size={14} /></button>
                    {openMenu === c.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
                        <div className="absolute top-8 left-0 z-40 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-white/10 shadow-xl rounded-lg py-1 w-48">
                          <MenuItem onClick={() => { onOpen(c.id); setOpenMenu(null); }} icon={Eye}>عرض التفاصيل</MenuItem>
                          <MenuItem onClick={() => { onEdit(c.id); setOpenMenu(null); }} icon={Edit}>تعديل البيانات</MenuItem>
                          {(c.isSuspended || c.isBlocked)
                            ? <MenuItem onClick={() => quickAction(c.id, "activate")} icon={CheckCircle}>تفعيل الحساب</MenuItem>
                            : <>
                                <MenuItem onClick={() => quickAction(c.id, "suspend")} icon={Ban} danger>إيقاف مؤقت</MenuItem>
                                <MenuItem onClick={() => quickAction(c.id, "block")} icon={Lock} danger>حظر دائم</MenuItem>
                              </>}
                          {c.email && <MenuItem onClick={() => window.open(`mailto:${c.email}`)} icon={Mail}>إرسال إيميل</MenuItem>}
                          {c.phone && <MenuItem onClick={() => window.open(`tel:${c.phone}`)} icon={Phone}>اتصال</MenuItem>}
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
      {data.map((c: any) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className={`bg-white dark:bg-[#1c1f26] rounded-2xl p-4 border ${selected.has(c.id) ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-100 dark:border-white/5"} hover:shadow-md transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-blue-600" />
            <StatusBadge user={c} />
          </div>
          <button onClick={() => onOpen(c.id)} className="w-full text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {c.avatar
                  ? <img src={c.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">{c.name?.charAt(0)}</div>}
                <span className="absolute -bottom-0.5 -left-0.5"><OnlineDot online={c.isOnline} /></span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#485869] dark:text-white truncate">{c.name}</div>
                <div className="text-[11px] text-gray-500 truncate font-mono" dir="ltr">{c.phone || c.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <CardStat label="طلبات" value={fmt(c.ordersCount || 0)} />
              <CardStat label="الإنفاق" value={`${fmt(c.spent || 0)}`} />
            </div>
            <div className="text-[10px] text-gray-400 mt-2 text-center">آخر طلب: {c.lastOrder ? timeAgo(c.lastOrder) : "—"}</div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
function CardStat({ label, value }: any) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
      <div className="text-xs font-bold text-[#485869] dark:text-white tabular-nums">{value}</div>
      <div className="text-[10px] text-gray-500 dark:text-white/50">{label}</div>
    </div>
  );
}
