'use client';

import { useEffect, useRef, useState } from "react";
import { MessageSquare, AlertTriangle, ShieldAlert, Zap, FileText, RefreshCw, Database } from "lucide-react";
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
        )}
      </div>
    </Card>
  );
}

export function AdminDisputesPage() {
  const { data, loading, err, refresh } = useFetch<any[]>("/api/admin/disputes");
  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/disputes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    refresh();
  };
  return (
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
              <th className="text-right p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => (
              <tr key={d.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3 font-mono text-xs">{d.publicCode}</td>
                <td className="p-3">{d.raisedByName || "—"}</td>
                <td className="p-3">{d.againstName || "—"}</td>
                <td className="p-3 text-xs">{d.category}</td>
                <td className="p-3 max-w-[200px] truncate text-xs">{d.reason}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${sevColor[d.priority] || "bg-gray-100"}`}>{d.priority}</span></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColor[d.status] || "bg-gray-100"}`}>{d.status}</span></td>
                <td className="p-3">
                  {d.status === "open" && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(d.id, "investigating")} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">تحقيق</button>
                      <button onClick={() => updateStatus(d.id, "resolved")} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">حُلّ</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">لا توجد نزاعات</td></tr>
            )}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function AdminLeakAttemptsPage() {
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
