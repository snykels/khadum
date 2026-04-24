'use client';

import { useEffect, useRef, useState } from "react";
<<<<<<< HEAD
import { MessageSquare, AlertTriangle, ShieldAlert, Zap, FileText, RefreshCw, Database, CreditCard, CheckCircle, XCircle, Clock, Filter, Ban, Bell, Eye, EyeOff, Search } from "lucide-react";
=======
import { MessageSquare, AlertTriangle, ShieldAlert, Zap, FileText, RefreshCw, Database, CreditCard, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
import ChatView from "../chat/ChatView";

function useFetch<T>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(url)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!mounted) return;
        if (!ok) setErr(j?.error || "خطأ");
        else setData(j);
      })
      .catch((e) => mounted && setErr(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick, ...deps]);
  return { data, loading, err, refresh: () => setTick((t) => t + 1) };
}

function Card({ title, icon: Icon, children, action }: any) {
  return (
    <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-[#34cc30]" />}
          <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const sevColor: Record<string, string> = {
  low: "bg-yellow-100 text-yellow-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-900 font-bold",
};

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  blocked: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-500",
  open: "bg-orange-100 text-orange-700",
  investigating: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-700",
};

export function AdminConversationsPage() {
  const { data, loading, err, refresh } = useFetch<any[]>("/api/admin/conversations");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const adminSseRef = useRef<EventSource | null>(null);

  // Auto-refresh list when any conversation gets updated
  useEffect(() => {
    if (typeof window === "undefined") return;
    const es = new EventSource(`/api/admin/conversations/stream`);
    adminSseRef.current = es;
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === "conv_update") refresh();
      } catch {}
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = (data || []).filter((c: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.publicCode?.toLowerCase().includes(s) ||
      c.clientName?.toLowerCase().includes(s) ||
      c.freelancerName?.toLowerCase().includes(s) ||
      c.subject?.toLowerCase().includes(s)
    );
  });
  const selected = list.find((c: any) => c.id === selectedId) || null;

  return (
    <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex h-[calc(100vh-160px)] min-h-[500px]">
      {/* List */}
      <div className="w-80 shrink-0 border-l border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <MessageSquare size={16} className="text-[#34cc30]" />
          <h2 className="font-bold text-sm flex-1">المحادثات</h2>
          <button onClick={refresh} className="p-1 text-gray-500 hover:text-gray-700"><RefreshCw size={14} /></button>
        </div>
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالكود/الاسم..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5 text-sm bg-white dark:bg-[#222631]"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4 text-center text-gray-500 text-sm">جاري التحميل...</div>}
          {err && <div className="p-4 text-center text-red-600 text-sm">{err}</div>}
          {list.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-right p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#222631] transition ${
                selectedId === c.id ? "bg-[#34cc30]/10 border-r-4 border-r-[#34cc30]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-gray-500">{c.publicCode}</span>
                {c.unreadByAdmin > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{c.unreadByAdmin}</span>
                )}
              </div>
              <div className="text-sm font-bold truncate">{c.clientName} ↔ {c.freelancerName}</div>
              <div className="text-xs text-gray-500 truncate">{c.subject || "—"}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusColor[c.status] || "bg-gray-100"}`}>{c.status}</span>
                <span className="text-[10px] text-gray-400">
                  {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString("ar", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            </button>
          ))}
          {!loading && list.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">لا توجد محادثات</div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <ChatView
            key={selected.id}
            conversationId={selected.id}
            myParty="admin"
            conversationStatus={selected.status}
            onAfterSend={refresh}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              اختر محادثة من القائمة
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminCleanupPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const run = async (force = false) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/cron/cleanup${force ? "?force=1" : ""}`, { method: "POST" });
      setReport(await r.json());
    } finally { setLoading(false); }
  };
  return (
<<<<<<< HEAD
    <Card title="تنظيف البيانات القديمة" icon={Database}>
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          يحذف تلقائياً البيانات القديمة التي انتهت صلاحيتها للحفاظ على أداء المنصة:
          السجلات المنتهية، محاولات التسريب، والإشعارات المقروءة.
        </p>
        <div className="flex gap-2">
          <button onClick={() => run(false)} disabled={loading} className="bg-[#34cc30] text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50 transition">
            {loading ? "جارٍ التنظيف..." : "تشغيل التنظيف"}
          </button>
          <button onClick={() => run(true)} disabled={loading} className="border border-red-300 text-red-700 rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50 transition hover:bg-red-50">
            تنظيف شامل
          </button>
        </div>
        {report && (
          <div className="bg-gray-50 dark:bg-[#111318] rounded-lg p-4 text-sm space-y-1">
            {Object.entries(report).map(([k, v]) => (
              <div key={k} className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{k}</span>
                <span className="font-medium text-[#485869] dark:text-white">{String(v)}</span>
              </div>
            ))}
          </div>
=======
    <Card title="صيانة البيانات (Lifecycle)" icon={Database}>
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ينظف البيانات القديمة تلقائياً (انتهت صلاحيتها) لتوفير المساحة:
          الرسائل القديمة بدون مشاكل، نصوص محاولات التسريب، التتبعات، الكاش، والإشعارات المقروءة.
        </p>
        <div className="flex gap-2">
          <button onClick={() => run(false)} disabled={loading} className="bg-[#34cc30] text-white rounded px-4 py-2 text-sm disabled:opacity-50">
            تشغيل الآن (محدود لمرة بالساعة)
          </button>
          <button onClick={() => run(true)} disabled={loading} className="border border-red-300 text-red-700 rounded px-4 py-2 text-sm disabled:opacity-50">
            تشغيل إجباري
          </button>
        </div>
        {report && (
          <pre className="bg-gray-50 dark:bg-[#111318] rounded p-3 text-xs overflow-x-auto" dir="ltr">
            {JSON.stringify(report, null, 2)}
          </pre>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        )}
      </div>
    </Card>
  );
}

export function AdminDisputesPage() {
  const { data, loading, err, refresh } = useFetch<any[]>("/api/admin/disputes");
  const [resolving, setResolving] = useState<null | { id: number; code: string; amount: number }>(null);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/disputes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    refresh();
  };

  const resolve = async (outcome: "client_wins" | "freelancer_wins") => {
    if (!resolving) return;
    setWorking(true);
    try {
      const res = await fetch("/api/admin/disputes/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeId: resolving.id, outcome, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "خطأ");
      setToast({
        msg: outcome === "client_wins"
          ? `✅ تم صرف استرداد للعميل${json.refundId ? ` (${json.refundId})` : " — راجع tap"}${json.errors?.length ? " ⚠️ " + json.errors[0] : ""}`
          : "✅ تم صرف المبلغ لمحفظة المستقل",
        ok: true,
      });
      setResolving(null);
      refresh();
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : "حدث خطأ", ok: false });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`p-3 rounded-xl text-sm text-center ${toast.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="mr-3 text-xs opacity-60">✕</button>
        </div>
      )}

      {resolving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-[#485869] text-lg mb-1">حسم النزاع — {resolving.code}</h3>
            <p className="text-sm text-gray-500 mb-4">المبلغ: {resolving.amount.toLocaleString("ar-SA")} ريال</p>
            <div className="mb-4">
              <label className="text-xs text-gray-600 font-medium block mb-1">ملاحظة القرار (اختياري)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-2 text-sm resize-none"
                placeholder="سبب القرار أو ملاحظات للطرفين..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => resolve("client_wins")}
                disabled={working}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <XCircle size={16} />
                استرداد للعميل
              </button>
              <button
                onClick={() => resolve("freelancer_wins")}
                disabled={working}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                صرف للمستقل
              </button>
            </div>
            <button onClick={() => { setResolving(null); setNote(""); }} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <Card title="النزاعات" icon={AlertTriangle}>
        {loading && <div className="p-6 text-center text-gray-500">جاري التحميل...</div>}
        {err && <div className="p-6 text-center text-red-600">{err}</div>}
        {data && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#222631] text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-3">الكود</th>
                <th className="text-right p-3">رفعه</th>
                <th className="text-right p-3">ضد</th>
                <th className="text-right p-3">التصنيف</th>
                <th className="text-right p-3">السبب</th>
                <th className="text-right p-3">الأولوية</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">التاريخ</th>
                <th className="text-right p-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any) => (
                <tr key={d.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-3 font-mono text-xs">{d.publicCode}</td>
                  <td className="p-3 text-xs">{d.raisedByName || "—"}</td>
                  <td className="p-3 text-xs">{d.againstName || "—"}</td>
                  <td className="p-3 text-xs">{d.category}</td>
                  <td className="p-3 max-w-[160px] truncate text-xs">{d.reason}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${sevColor[d.priority] || "bg-gray-100"}`}>{d.priority}</span></td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColor[d.status] || "bg-gray-100"}`}>{d.status}</span></td>
                  <td className="p-3 text-xs text-gray-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString("ar") : "—"}</td>
                  <td className="p-3">
                    {(d.status === "open" || d.status === "in_review") ? (
                      <div className="flex gap-1 flex-wrap">
                        {d.status === "open" && (
                          <button onClick={() => updateStatus(d.id, "in_review")} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap">تحقيق</button>
                        )}
                        <button
                          onClick={() => setResolving({ id: d.id, code: d.publicCode || d.orderCode || `#${d.id}`, amount: Number(d.orderAmount || 0) })}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded whitespace-nowrap"
                        >
                          حسم النزاع
                        </button>
                      </div>
                    ) : d.status === "resolved" ? (
                      <span className="text-xs text-green-700">✓ {d.resolution || "محسوم"}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">لا توجد نزاعات</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export function AdminLeakAttemptsPage() {
<<<<<<< HEAD
  const { data, loading, err, refresh } = useFetch<any[]>("/api/admin/leak-attempts");
  const [search, setSearch] = useState("");
  const [filterSev, setFilterSev] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<Record<number, string>>({});

  const sevLabels: Record<string, string> = { low: "منخفضة", medium: "متوسطة", high: "عالية", critical: "حرجة" };
  const partyLabels: Record<string, string> = { client: "عميل", freelancer: "مستقل", admin: "إدارة" };

  async function doAction(id: number, action: "warn" | "block" | "ignore") {
    setActionBusy(id);
    try {
      const r = await fetch(`/api/admin/leak-attempts/${id}/${action}`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      setActionMsg(prev => ({ ...prev, [id]: d.message || (r.ok ? "تم" : "فشل") }));
      if (r.ok) refresh();
    } catch {
      setActionMsg(prev => ({ ...prev, [id]: "خطأ في الاتصال" }));
    }
    setActionBusy(null);
  }

  const list = (data || []).filter((l: any) => {
    const okSev = filterSev === "all" || l.severity === filterSev;
    const okSearch = !search ||
      (l.userName || "").includes(search) ||
      (l.rawText || "").includes(search) ||
      (l.redactedText || "").includes(search);
    return okSev && okSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={22} className="text-[#34cc30]" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">محاولات تسريب التواصل</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">رصد وإدارة محاولات تسريب معلومات التواصل خارج المنصة</p>
          </div>
        </div>
        <button onClick={refresh} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي المحاولات", value: data.length, color: "text-gray-700 dark:text-gray-200" },
            { label: "خطورة عالية/حرجة", value: data.filter((l:any) => l.severity === "high" || l.severity === "critical").length, color: "text-red-600" },
            { label: "متوسطة", value: data.filter((l:any) => l.severity === "medium").length, color: "text-orange-600" },
            { label: "منخفضة", value: data.filter((l:any) => l.severity === "low").length, color: "text-yellow-600" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو النص..."
            className="w-full pr-9 pl-3 py-2 text-sm bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
          />
        </div>
        <div className="flex gap-1">
          {["all", "critical", "high", "medium", "low"].map(s => (
            <button
              key={s}
              onClick={() => setFilterSev(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterSev === s
                  ? "bg-[#34cc30] text-white"
                  : "bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#34cc30]"
              }`}
            >
              {s === "all" ? "الكل" : sevLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading && <div className="p-8 text-center text-gray-500">جاري التحميل...</div>}
        {err && <div className="p-8 text-center text-red-600">{err}</div>}
        {!loading && !err && list.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="font-medium text-gray-500 dark:text-gray-400">لا توجد محاولات تسريب</div>
            <div className="text-xs text-gray-400 mt-1">سيظهر هنا أي نشاط مشبوه يرصده النظام</div>
          </div>
        )}
        {!loading && list.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {list.map((l: any) => {
              const isExpanded = expanded === l.id;
              return (
                <div key={l.id} className="p-4">
                  {/* Row header */}
                  <div className="flex items-start gap-3">
                    {/* Severity indicator */}
                    <div className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${
                      l.severity === "critical" ? "bg-red-600" :
                      l.severity === "high" ? "bg-red-400" :
                      l.severity === "medium" ? "bg-orange-400" : "bg-yellow-400"
                    }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{l.userName || `مستخدم #${l.userId}`}</span>
                        <span className="text-xs text-gray-400">({partyLabels[l.userParty] || l.userParty})</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sevColor[l.severity] || "bg-gray-100"}`}>
                          {sevLabels[l.severity] || l.severity}
                        </span>
                        {l.action && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            {l.action}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 mr-auto">
                          {l.createdAt ? new Date(l.createdAt).toLocaleString("ar") : "—"}
                        </span>
                      </div>

                      {/* Two column: original vs redacted */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3">
                          <div className="text-[10px] font-bold text-red-500 uppercase mb-1.5 flex items-center gap-1">
                            <Eye size={10} /> النص الأصلي (قبل الإخفاء)
                          </div>
                          <p className="text-xs text-red-700 dark:text-red-300 break-words leading-relaxed">
                            {l.rawText || "—"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
                          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                            <EyeOff size={10} /> النص المُقنَّع (ما يراه المستخدم)
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                            {l.redactedText || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => doAction(l.id, "warn")}
                          disabled={actionBusy === l.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 transition dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
                        >
                          <Bell size={12} /> إرسال تحذير
                        </button>
                        <button
                          onClick={() => doAction(l.id, "block")}
                          disabled={actionBusy === l.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                        >
                          <Ban size={12} /> حظر المستخدم
                        </button>
                        <button
                          onClick={() => doAction(l.id, "ignore")}
                          disabled={actionBusy === l.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        >
                          <CheckCircle size={12} /> تجاهل / إيجابي كاذب
                        </button>
                        {actionMsg[l.id] && (
                          <span className="text-xs text-green-600 dark:text-green-400">{actionMsg[l.id]}</span>
                        )}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : l.id)}
                          className="mr-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                          {isExpanded ? "إخفاء التفاصيل" : "المزيد"}
                        </button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 dark:text-gray-300">
                          <div><div className="text-[10px] text-gray-400 mb-0.5">مُكتشف بواسطة</div>{l.detectedBy || "—"}</div>
                          <div><div className="text-[10px] text-gray-400 mb-0.5">الإجراء المتخذ</div>{l.action || "—"}</div>
                          <div><div className="text-[10px] text-gray-400 mb-0.5">المحادثة</div>#{l.conversationId || "—"}</div>
                          <div><div className="text-[10px] text-gray-400 mb-0.5">المستخدم</div>#{l.userId || "—"}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
=======
  const { data, loading, err } = useFetch<any[]>("/api/admin/leak-attempts");
  return (
    <Card title="محاولات تسريب التواصل" icon={ShieldAlert}>
      {loading && <div className="p-6 text-center text-gray-500">جاري التحميل...</div>}
      {err && <div className="p-6 text-center text-red-600">{err}</div>}
      {data && (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#222631] text-gray-600 dark:text-gray-400">
            <tr>
              <th className="text-right p-3">المستخدم</th>
              <th className="text-right p-3">الطرف</th>
              <th className="text-right p-3">الخطورة</th>
              <th className="text-right p-3">الإجراء</th>
              <th className="text-right p-3">المُكتشف بواسطة</th>
              <th className="text-right p-3">النص الأصلي</th>
              <th className="text-right p-3">بعد الإخفاء</th>
              <th className="text-right p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l: any) => (
              <tr key={l.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3">{l.userName || l.userId}</td>
                <td className="p-3 text-xs">{l.userParty}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${sevColor[l.severity] || "bg-gray-100"}`}>{l.severity}</span></td>
                <td className="p-3 text-xs font-bold">{l.action}</td>
                <td className="p-3 text-xs">{l.detectedBy}</td>
                <td className="p-3 max-w-[220px] text-xs text-red-600 truncate">{l.rawText}</td>
                <td className="p-3 max-w-[220px] text-xs truncate">{l.redactedText}</td>
                <td className="p-3 text-xs text-gray-500">{l.createdAt ? new Date(l.createdAt).toLocaleString("ar") : "—"}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">لا توجد محاولات</td></tr>
            )}
          </tbody>
        </table>
      )}
    </Card>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  );
}

export function AdminInterventionsPage() {
  const { data, loading, err } = useFetch<any[]>("/api/admin/interventions");
  return (
    <Card title="تدخلات الإدارة" icon={Zap}>
      {loading && <div className="p-6 text-center text-gray-500">جاري التحميل...</div>}
      {err && <div className="p-6 text-center text-red-600">{err}</div>}
      {data && (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#222631] text-gray-600 dark:text-gray-400">
            <tr>
              <th className="text-right p-3">النوع</th>
              <th className="text-right p-3">المحادثة</th>
              <th className="text-right p-3">الطلب</th>
              <th className="text-right p-3">المستخدم المستهدف</th>
              <th className="text-right p-3">السبب</th>
              <th className="text-right p-3">المبلغ</th>
              <th className="text-right p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((it: any) => (
              <tr key={it.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3 text-xs font-bold">{it.type}</td>
                <td className="p-3 text-xs">{it.conversationId || "—"}</td>
                <td className="p-3 text-xs">{it.orderId || "—"}</td>
                <td className="p-3 text-xs">{it.targetUserId || "—"}</td>
                <td className="p-3 max-w-[260px] truncate">{it.reason}</td>
                <td className="p-3 text-xs">{it.amount ? Number(it.amount).toFixed(2) : "—"}</td>
                <td className="p-3 text-xs text-gray-500">{it.createdAt ? new Date(it.createdAt).toLocaleString("ar") : "—"}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">لا توجد تدخلات</td></tr>
            )}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function AdminQuickRepliesPage() {
  const { data, loading, err, refresh } = useFetch<any[]>("/api/admin/quick-replies");
  const [form, setForm] = useState({ shortcode: "", title: "", body: "", category: "general" });
  const submit = async (e: any) => {
    e.preventDefault();
    const r = await fetch("/api/admin/quick-replies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ shortcode: "", title: "", body: "", category: "general" }); refresh(); }
  };
  const remove = async (id: number) => {
    await fetch(`/api/admin/quick-replies/${id}`, { method: "DELETE" });
    refresh();
  };
  return (
    <div className="space-y-4">
      <Card title="إضافة رد سريع" icon={FileText}>
        <form onSubmit={submit} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.shortcode} onChange={(e) => setForm({ ...form, shortcode: e.target.value })} placeholder="الاختصار (مثل: welcome)" className="border rounded px-3 py-2 text-sm bg-white dark:bg-[#222631]" required />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان" className="border rounded px-3 py-2 text-sm bg-white dark:bg-[#222631]" required />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="التصنيف" className="border rounded px-3 py-2 text-sm bg-white dark:bg-[#222631]" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="نص الرد..." className="border rounded px-3 py-2 text-sm sm:col-span-2 bg-white dark:bg-[#222631]" rows={3} required />
          <button type="submit" className="bg-[#34cc30] text-white rounded px-4 py-2 text-sm sm:col-span-2">إضافة</button>
        </form>
      </Card>
      <Card title="الردود السريعة" icon={FileText}>
        {loading && <div className="p-6 text-center text-gray-500">جاري التحميل...</div>}
        {err && <div className="p-6 text-center text-red-600">{err}</div>}
        {data && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#222631] text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-3">الاختصار</th>
                <th className="text-right p-3">العنوان</th>
                <th className="text-right p-3">التصنيف</th>
                <th className="text-right p-3">الاستخدامات</th>
                <th className="text-right p-3">حذف</th>
              </tr>
            </thead>
            <tbody>
              {data.map((q: any) => (
                <tr key={q.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-3 font-mono text-xs">/{q.shortcode}</td>
                  <td className="p-3">{q.title}</td>
                  <td className="p-3 text-xs">{q.category}</td>
                  <td className="p-3 text-xs">{q.usageCount || 0}</td>
                  <td className="p-3">
                    <button onClick={() => remove(q.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">حذف</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد ردود</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── Payment Sessions Monitor ─────────────────────────────────────────────────

const sessionStatusColor: Record<string, string> = {
  pending:         "bg-yellow-100 text-yellow-800",
  viewed:          "bg-blue-100 text-blue-700",
  method_selected: "bg-purple-100 text-purple-700",
  processing:      "bg-orange-100 text-orange-700",
  paid:            "bg-green-100 text-green-700",
  failed:          "bg-red-100 text-red-700",
  expired:         "bg-gray-200 text-gray-600",
  cancelled:       "bg-gray-100 text-gray-500",
};

const sessionStatusLabel: Record<string, string> = {
  pending:         "معلّقة",
  viewed:          "تمت مشاهدتها",
  method_selected: "اختيار طريقة",
  processing:      "جارية",
  paid:            "مدفوعة ✅",
  failed:          "فشلت",
  expired:         "منتهية",
  cancelled:       "ملغاة",
};

export function AdminPaymentSessionsPage() {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPhone, setFilterPhone]   = useState("");
  const [query, setQuery]               = useState({ status: "", phone: "" });

  const url = `/api/admin/payment-sessions?status=${query.status}&phone=${query.phone}&limit=100`;
  const { data, loading, err, refresh } = useFetch<{ sessions: any[]; stats: any[] }>(url, [url]);

  const sessions = data?.sessions || [];
  const stats    = data?.stats    || [];

  const statMap: Record<string, number> = {};
  stats.forEach((s: any) => { statMap[s.status] = Number(s.cnt); });
  const total = Object.values(statMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["paid", "pending", "failed", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s === query.status ? "" : s); setQuery({ status: s === query.status ? "" : s, phone: filterPhone }); }}
            className={`rounded-2xl p-4 text-right border-2 transition-all ${query.status === s ? "border-[#34cc30]" : "border-transparent"} ${sessionStatusColor[s] || "bg-gray-50"}`}
          >
            <div className="text-2xl font-bold">{(statMap[s] || 0).toLocaleString("ar-SA")}</div>
            <div className="text-xs mt-1 font-medium">{sessionStatusLabel[s] || s}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e2130] rounded-2xl p-4 flex flex-wrap gap-3 items-center border border-gray-100 dark:border-gray-800">
        <Filter size={15} className="text-gray-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">كل الحالات</option>
          {Object.keys(sessionStatusLabel).map((s) => (
            <option key={s} value={s}>{sessionStatusLabel[s]}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="رقم الجوال..."
          value={filterPhone}
          onChange={(e) => setFilterPhone(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44"
        />
        <button
          onClick={() => setQuery({ status: filterStatus, phone: filterPhone })}
          className="px-4 py-1.5 bg-[#485869] text-white rounded-lg text-sm hover:bg-[#3a4a59]"
        >
          بحث
        </button>
        <button onClick={refresh} className="text-gray-500 hover:text-gray-700">
          <RefreshCw size={15} />
        </button>
        <span className="text-xs text-gray-400 mr-auto">الإجمالي: {total.toLocaleString("ar-SA")} جلسة</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-800">
          <CreditCard size={16} className="text-[#485869]" />
          <h2 className="font-bold text-[#485869]">جلسات الدفع</h2>
        </div>
        {loading && <div className="p-8 text-center text-gray-500">جاري التحميل...</div>}
        {err    && <div className="p-8 text-center text-red-600">{err}</div>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#222631] text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="text-right p-3 whitespace-nowrap">#</th>
                  <th className="text-right p-3 whitespace-nowrap">الطلب</th>
                  <th className="text-right p-3 whitespace-nowrap">الجوال</th>
                  <th className="text-right p-3 whitespace-nowrap">المبلغ</th>
                  <th className="text-right p-3 whitespace-nowrap">الحالة</th>
                  <th className="text-right p-3 whitespace-nowrap">Tap Charge</th>
                  <th className="text-right p-3 whitespace-nowrap">المحاولات</th>
                  <th className="text-right p-3 whitespace-nowrap">الصلاحية</th>
                  <th className="text-right p-3 whitespace-nowrap">الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s: any) => {
                  const expired = s.status === "expired" || (s.status === "pending" && new Date(s.expires_at) < new Date());
                  return (
                    <tr key={s.id} className={`border-t border-gray-100 dark:border-gray-800 ${expired && s.status !== "paid" ? "opacity-60" : ""}`}>
                      <td className="p-3 text-xs text-gray-400">{s.id}</td>
                      <td className="p-3 font-mono text-xs">{s.order_code || `#${s.order_id}`}</td>
                      <td className="p-3 text-xs dir-ltr text-left" dir="ltr">{s.client_phone}</td>
                      <td className="p-3 font-bold text-[#485869]">
                        {Number(s.amount).toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${sessionStatusColor[s.status] || "bg-gray-100"}`}>
                          {sessionStatusLabel[s.status] || s.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500 max-w-[120px] truncate">
                        {s.tap_charge_id
                          ? <a href={`https://dashboard.tap.company/charges/${s.tap_charge_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.tap_charge_id.slice(0, 18)}…</a>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="p-3 text-center text-xs">{s.attempts_count || 0}</td>
                      <td className="p-3 text-xs text-gray-500">
                        {expired && s.status !== "paid"
                          ? <span className="text-red-500 flex items-center gap-1"><Clock size={11} />منتهية</span>
                          : s.expires_at ? new Date(s.expires_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) : "—"
                        }
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {s.created_at ? new Date(s.created_at).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-gray-500">لا توجد جلسات دفع</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
