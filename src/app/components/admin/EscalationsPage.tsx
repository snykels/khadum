'use client';

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, CheckCircle2, Hand, RotateCcw, Phone, Clock } from "lucide-react";

interface SnapshotMessage {
  role?: string;
  body?: string;
  direction?: string;
  createdAt?: string;
}

interface Escalation {
  id: number;
  phone: string;
  reason: string;
  priority: "low" | "normal" | "high" | "urgent";
  summary: string;
  conversationSnapshot: SnapshotMessage[];
  status: "new" | "in_progress" | "resolved";
  assignedTo: number | null;
  assignedToName: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const priorityColor: Record<string, string> = {
  urgent: "bg-red-200 text-red-900 font-bold",
  high: "bg-red-100 text-red-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const statusColor: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const statusLabel: Record<string, string> = {
  new: "جديد",
  in_progress: "قيد المعالجة",
  resolved: "مُحلّ",
};

const priorityLabel: Record<string, string> = {
  urgent: "عاجل",
  high: "مرتفع",
  normal: "عادي",
  low: "منخفض",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
}

export default function EscalationsPage() {
  const [items, setItems] = useState<Escalation[]>([]);
  const [summary, setSummary] = useState({ new: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<Escalation | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const url = filter ? `/api/admin/escalations?status=${filter}` : "/api/admin/escalations";
    const r = await fetch(url);
    const j = await r.json();
    if (r.ok) {
      setItems(j.items || []);
      setSummary(j.summary || { new: 0, in_progress: 0, resolved: 0 });
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function act(id: number, action: "claim" | "resolve" | "reopen", note?: string) {
    const r = await fetch(`/api/admin/escalations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (r.ok) {
      setSelected(null);
      setResolveNote("");
      await load();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={22} className="text-[#34cc30]" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">التصعيدات</h1>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { k: "", label: "الكل", n: summary.new + summary.in_progress + summary.resolved, color: "bg-gray-100 text-gray-800" },
          { k: "new", label: "جديد", n: summary.new, color: "bg-orange-100 text-orange-700" },
          { k: "in_progress", label: "قيد المعالجة", n: summary.in_progress, color: "bg-blue-100 text-blue-700" },
          { k: "resolved", label: "مُحلّ", n: summary.resolved, color: "bg-green-100 text-green-700" },
        ].map((c) => (
          <button
            key={c.k}
            onClick={() => setFilter(c.k)}
            className={`p-3 rounded-xl border text-right transition ${filter === c.k ? "border-[#34cc30] bg-[#34cc30]/10" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d24]"}`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
            <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{c.n}</div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل…</div>
        ) : !items.length ? (
          <div className="p-8 text-center text-gray-500">لا توجد تصعيدات.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((e) => (
              <li key={e.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[e.priority]}`}>{priorityLabel[e.priority] || e.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[e.status]}`}>{statusLabel[e.status]}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} /> {e.phone}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} /> {timeAgo(e.createdAt)}</span>
                      {e.assignedToName && (
                        <span className="text-xs text-gray-500">مُسند إلى: {e.assignedToName}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{e.summary}</div>
                    <div className="text-xs text-gray-500 mt-1">السبب: {e.reason}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelected(e)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">عرض</button>
                    {e.status === "new" && (
                      <button onClick={() => act(e.id, "claim")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
                        <Hand size={12} /> استلمت
                      </button>
                    )}
                    {e.status !== "resolved" && (
                      <button onClick={() => setSelected(e)} className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> حُلّ
                      </button>
                    )}
                    {e.status === "resolved" && (
                      <button onClick={() => act(e.id, "reopen")} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 flex items-center gap-1">
                        <RotateCcw size={12} /> إعادة فتح
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-[#1a1d24] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">تصعيد #{selected.id}</h2>
                <p className="text-xs text-gray-500">{selected.phone} • {timeAgo(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">الملخص</div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selected.summary}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">السبب</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selected.reason}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2">آخر الرسائل</div>
                <div className="space-y-1 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                  {(selected.conversationSnapshot || []).map((m: SnapshotMessage, i: number) => (
                    <div key={i} className="text-xs">
                      <span className={`inline-block min-w-16 font-bold ${m.direction === "in" ? "text-blue-600" : "text-green-600"}`}>
                        {m.direction === "in" ? "العميل" : "البوت"}:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300"> {String(m.body || "").slice(0, 240)}</span>
                    </div>
                  ))}
                  {!selected.conversationSnapshot?.length && (
                    <div className="text-xs text-gray-500">لا يوجد سياق محفوظ.</div>
                  )}
                </div>
              </div>
              {selected.status !== "resolved" && (
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">ملاحظة الحل (اختياري)</div>
                  <textarea
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    rows={3}
                    className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder="ماذا تم؟"
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    {selected.status === "new" && (
                      <button onClick={() => act(selected.id, "claim")} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        استلمت
                      </button>
                    )}
                    <button onClick={() => act(selected.id, "resolve", resolveNote || undefined)} className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                      حُلّ
                    </button>
                  </div>
                </div>
              )}
              {selected.status === "resolved" && selected.resolutionNote && (
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">ملاحظة الحل</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.resolutionNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
