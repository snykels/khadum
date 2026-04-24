'use client';

import { useState, useEffect, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { HelpCircle, MessageSquare, ArrowLeftRight, RotateCcw, Send, Eye, CheckCircle, X, Clock, AlertTriangle, Phone, Search, Edit, ChevronDown, UserPlus, RefreshCw, FileText, ExternalLink, Copy, Mail, Trash2, Hourglass, ShieldCheck, Filter, Users2, Inbox, Ban, MailWarning } from "lucide-react";
import { InvitesPage as InvitesEmbedded } from "./AdminPagesInvitesEmail";
import { useToast as _useToastRedesign, postJson as _postJsonR, fmt as _fmtR } from "./_helpers";
import { openWhatsAppChat } from "./_whatsapp";

// =================== تذاكر الدعم (أدمن) ===================
import { useFetch as _useFetch, useToast as _useToast, patchJson as _patchJson, postJson as _postJson, dateAr as _dateAr, fmt as _fmt, Loading as _Loading } from "./_helpers";

export function AdminSupportTicketsPage() {
  const { data, loading, reload } = _useFetch<any>("/api/admin/tickets", "tickets");
  const { show, node } = _useToast();
  const [filter, setFilter] = useState("all");
  const list: any[] = data || [];
  const statusLabel: any = { open: "مفتوح", in_review: "قيد المراجعة", resolved: "محلول" };
  const statusColor: any = { open: "bg-blue-100 text-blue-700", in_review: "bg-yellow-100 text-yellow-700", resolved: "bg-green-100 text-green-700" };
  const priorityColor: any = { urgent: "bg-red-100 text-red-700", medium: "bg-yellow-100 text-yellow-700", normal: "bg-gray-100 text-gray-600" };
  const priorityLabel: any = { urgent: "عاجل", medium: "متوسط", normal: "عادي" };
  const filtered = filter === "all" ? list : list.filter(t => t.status === filter);
  const counts = {
    open: list.filter(t => t.status === "open").length,
    in_review: list.filter(t => t.status === "in_review").length,
    resolved: list.filter(t => t.status === "resolved").length,
  };
  async function setStatus(id: number, status: string) {
    const { ok } = await _patchJson(`/api/admin/tickets/${id}`, { status });
    show(ok ? "تم التحديث" : "فشل", ok); if (ok) reload();
  }
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869]">تذاكر الدعم</h1>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">{counts.open} تذكرة مفتوحة</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {[{l:"إجمالي",v:list.length,c:"text-[#485869]"},{l:"مفتوحة",v:counts.open,c:"text-blue-600"},{l:"قيد المراجعة",v:counts.in_review,c:"text-yellow-600"},{l:"محلولة",v:counts.resolved,c:"text-green-600"}].map(s=>(
          <div key={s.l} className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">{s.l}</div><div className={`text-2xl font-bold ${s.c}`}>{s.v}</div></div>
        ))}
      </div>
      <div className="flex gap-2">{[{k:"all",l:"الكل"},{k:"open",l:"مفتوح"},{k:"in_review",l:"قيد المراجعة"},{k:"resolved",l:"محلول"}].map(f=><button key={f.k} onClick={()=>setFilter(f.k)} className={`px-3 py-1.5 rounded-lg text-sm ${filter===f.k?"bg-[#34cc30] text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{f.l}</button>)}</div>
      {loading ? <_Loading /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="text-right p-4">الرقم</th><th className="text-right p-4">المرسل</th><th className="text-right p-4">الموضوع</th><th className="text-right p-4">الأولوية</th><th className="text-right p-4">التاريخ</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراء</th></tr></thead>
            <tbody className="text-sm">{filtered.map((t:any)=>(
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-[#485869]">TK-{String(t.id).padStart(4,"0")}</td>
                <td className="p-4"><div className="font-medium">{t.fromName}</div><div className="text-xs text-gray-500">{t.fromRole === "freelancer" ? "مستقل" : t.fromRole === "client" ? "عميل" : "—"}</div></td>
                <td className="p-4 max-w-[250px] truncate">{t.subject}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${priorityColor[t.priority] || ""}`}>{priorityLabel[t.priority]}</span></td>
                <td className="p-4 text-gray-500">{_dateAr(t.createdAt)}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${statusColor[t.status]}`}>{statusLabel[t.status]}</span></td>
                <td className="p-4">
                  {t.status !== "resolved" ? (
                    <div className="flex gap-1">
                      {t.status === "open" && <button onClick={()=>setStatus(t.id,"in_review")} className="text-blue-500 text-xs hover:underline">مراجعة</button>}
                      <button onClick={()=>setStatus(t.id,"resolved")} className="text-green-600 text-xs hover:underline">حل</button>
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">لا توجد تذاكر</td></tr>}
            </tbody></table>
        </div>
      )}
    </div>
  );
}

// =================== تحويل المهام بين المستقلين ===================
export function OrderTransferPage() {
  const { data, loading, reload } = _useFetch<any>("/api/admin/transfers", "transfers");
  const orders = _useFetch<any>("/api/admin/orders?status=active", "orders");
  const freelancers = _useFetch<any>("/api/admin/users?role=freelancer", "users");
  const { show, node } = _useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", toFreelancerId: "", reason: "", notes: "" });
  const transfers: any[] = data || [];
  const reasons = ["عدم الرد خلال 48 ساعة", "طلب المستقل الانسحاب", "إيقاف المستقل لمخالفة", "عدم القدرة على التنفيذ", "طلب العميل", "أخرى"];
  async function submit() {
    if (!form.orderId || !form.toFreelancerId) return show("اختر الطلب والمستقل", false);
    const { ok, data } = await _postJson("/api/admin/transfers", { ...form, orderId: parseInt(form.orderId), toFreelancerId: parseInt(form.toFreelancerId) });
    show(ok ? "تم التحويل" : data.error || "فشل", ok);
    if (ok) { setShowForm(false); setForm({ orderId: "", toFreelancerId: "", reason: "", notes: "" }); reload(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#485869]">تحويل المهام</h1><p className="text-sm text-gray-500 mt-1">تحويل الطلبات من مستقل إلى آخر في حالة عدم الرد أو الانسحاب</p></div>
        <button onClick={()=>setShowForm(!showForm)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showForm?<><X size={16}/> إلغاء</>:<><ArrowLeftRight size={16}/> تحويل جديد</>}</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">إجمالي التحويلات</div><div className="text-2xl font-bold text-[#485869]">{transfers.length}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">هذا الشهر</div><div className="text-2xl font-bold text-yellow-600">2</div></div>
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">بسبب عدم الرد</div><div className="text-2xl font-bold text-red-500">1</div></div>
      </div>

      {node}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30">
          <h3 className="text-lg font-bold text-[#485869] mb-4 flex items-center gap-2"><ArrowLeftRight size={20} className="text-[#34cc30]" /> تحويل طلب إلى مستقل آخر</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">رقم الطلب</label>
              <select value={form.orderId} onChange={e=>setForm({...form,orderId:e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5">
                <option value="">اختر الطلب...</option>
                {(orders.data||[]).map((o:any)=><option key={o.id} value={o.id}>#ORD-{String(o.id).padStart(4,"0")} — {o.serviceTitle} ({o.freelancerName})</option>)}
              </select>
            </div>
            <div><label className="block text-sm text-gray-600 mb-1.5">المستقل الجديد</label>
              <select value={form.toFreelancerId} onChange={e=>setForm({...form,toFreelancerId:e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5">
                <option value="">اختر المستقل...</option>
                {(freelancers.data||[]).filter((u:any)=>!u.isSuspended).map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm text-gray-600 mb-1.5">سبب التحويل</label>
              <select value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5">
                <option value="">اختر السبب...</option>{reasons.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1.5">ملاحظات إضافية</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5" placeholder="سبب التحويل التفصيلي..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={()=>setShowForm(false)} className="border border-gray-200 px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50">إلغاء</button>
            <button onClick={submit} className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><ArrowLeftRight size={16}/> تأكيد التحويل</button>
          </div>
        </div>
      )}

      {loading ? <_Loading /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-[#485869]">سجل التحويلات</h3></div>
          <table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="text-right p-4">الرقم</th><th className="text-right p-4">الطلب</th><th className="text-right p-4">من</th><th className="text-right p-4">إلى</th><th className="text-right p-4">السبب</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">التاريخ</th></tr></thead>
            <tbody className="text-sm">{transfers.map((t:any)=>(
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">TRF-{String(t.id).padStart(4,"0")}</td>
                <td className="p-4 font-medium text-[#485869]">#ORD-{String(t.orderId).padStart(4,"0")}</td>
                <td className="p-4 text-red-500">{t.fromName || "—"}</td>
                <td className="p-4 text-green-600">{t.toName}</td>
                <td className="p-4 text-gray-600 text-xs max-w-[180px] truncate">{t.reason}</td>
                <td className="p-4 font-medium">{_fmt(t.amount)} ر.س</td>
                <td className="p-4 text-gray-500">{_dateAr(t.createdAt)}</td>
              </tr>
            ))}
            {transfers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">لا توجد تحويلات</td></tr>}
            </tbody></table>
        </div>
      )}
    </div>
  );
}

// =================== طلبات الاسترداد (واتساب) ===================
export function RefundRequestsPage() {
  const { data, loading, reload } = _useFetch<any>("/api/admin/refunds", "refunds");
  const { show, node } = _useToast();
  const refunds: any[] = data || [];
  const statusLabel: any = { new: "جديد", reviewing: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };
  const statusColor: any = { new: "bg-blue-100 text-blue-700", reviewing: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  const counts = {
    new: refunds.filter(r => r.status === "new").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
    total: refunds.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
  };
  async function setStatus(id: number, status: string) {
    const { ok } = await _patchJson(`/api/admin/refunds/${id}`, { status });
    show(ok ? "تم التحديث" : "فشل", ok); if (ok) reload();
  }
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#485869]">طلبات الاسترداد</h1><p className="text-sm text-gray-500 mt-1">طلبات الاسترداد الواردة من العملاء عبر واتساب</p></div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{counts.new} طلب جديد</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">إجمالي الطلبات</div><div className="text-2xl font-bold text-[#485869]">{refunds.length}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">مبلغ الاستردادات</div><div className="text-2xl font-bold text-red-500">{_fmt(counts.total)} ر.س</div></div>
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">تمت الموافقة</div><div className="text-2xl font-bold text-green-600">{counts.approved}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-4"><div className="text-sm text-gray-500 mb-1">مرفوضة</div><div className="text-2xl font-bold text-gray-400">{counts.rejected}</div></div>
      </div>

      {loading ? <_Loading /> : refunds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">لا توجد طلبات استرداد</div>
      ) : (
        <div className="space-y-4">
          {refunds.map((r:any) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold">{(r.clientName||"?").charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#485869]">REF-{String(r.id).padStart(4,"0")}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                      {r.source && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><Phone size={10} /> {r.source === "whatsapp" ? "واتساب" : r.source}</span>}
                    </div>
                    <div className="text-sm text-gray-600">{r.clientName} · <span dir="ltr">{r.clientPhone}</span></div>
                  </div>
                </div>
                <div className="text-left"><div className="text-xl font-bold text-red-500">{_fmt(r.amount)} ر.س</div><div className="text-xs text-gray-500">{_dateAr(r.createdAt)}</div></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <div><span className="text-gray-500">الطلب: </span><span className="font-medium text-[#485869]">{r.orderId ? `#ORD-${String(r.orderId).padStart(4,"0")}` : "—"}</span></div>
                <div><span className="text-gray-500">المستقل: </span><span className="font-medium">{r.freelancerName || "—"}</span></div>
                <div><span className="text-gray-500">السبب: </span><span className="font-medium text-gray-700">{r.reason}</span></div>
              </div>
              {(r.status === "new" || r.status === "reviewing") && (
                <div className="flex gap-2">
                  {r.status === "new" && <button onClick={()=>setStatus(r.id,"reviewing")} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600">بدء المراجعة</button>}
                  <button onClick={()=>setStatus(r.id,"approved")} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2eb829] flex items-center gap-2"><CheckCircle size={14}/> قبول الاسترداد</button>
                  <button onClick={()=>setStatus(r.id,"rejected")} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 flex items-center gap-2"><X size={14}/> رفض</button>
                  {r.clientPhone && <a href={`https://wa.me/${(r.clientPhone||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><MessageSquare size={14}/> مراسلة العميل</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== طلبات الانضمام ===================
interface Application {
  id: number; name: string; email: string; phone: string; city: string | null;
  phoneCountryCode: string | null; country: string | null; gender: string | null; dateOfBirth: string | null;
  mainCategory: string | null; subCategory: string | null; yearsExperience: string | null;
  skills: string | null; bio: string | null; portfolioUrl: string | null;
  linkedinUrl: string | null; nationalIdImage: string | null; nationalIdFrontImage: string | null; nationalIdBackImage: string | null;
  bankName: string | null; iban: string | null; ibanDocument: string | null;
  status: string | null; rejectionReason: string | null; createdAt: string | null;
  // Enrichment from API
  activationStatus?: "pending" | "active" | null;
  userId?: number | null;
  setupLink?: string | null;
  tokenExpiresAt?: string | null;
  tokenUsed?: boolean;
  tokenRevoked?: boolean;
  tokenExpired?: boolean;
}

type AppFilter = "pending" | "awaiting_activation" | "activated" | "expired" | "rejected" | "all";

function appFilterMatch(a: Application, f: AppFilter): boolean {
  if (f === "all") return true;
  if (f === "pending") return a.status === "pending";
  if (f === "rejected") return a.status === "rejected";
  if (f === "awaiting_activation") return a.status === "approved" && a.activationStatus === "pending" && !a.tokenExpired && !a.tokenRevoked;
  if (f === "expired") return a.status === "approved" && a.activationStatus === "pending" && (a.tokenExpired === true || a.tokenRevoked === true);
  if (f === "activated") return a.status === "approved" && a.activationStatus === "active";
  return false;
}

function effectiveStatus(a: Application): { key: AppFilter; label: string; cls: string; icon: LucideIcon } {
  if (a.status === "pending") return { key: "pending", label: "بانتظار المراجعة", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: Hourglass };
  if (a.status === "rejected") return { key: "rejected", label: "مرفوض", cls: "bg-red-100 text-red-700 border-red-200", icon: X };
  if (a.status === "approved" && a.activationStatus === "active") return { key: "activated", label: "مفعّل", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ShieldCheck };
  if (a.status === "approved" && a.activationStatus === "pending" && (a.tokenExpired || a.tokenRevoked)) return { key: "expired", label: "رابط منتهي/ملغى", cls: "bg-orange-100 text-orange-700 border-orange-200", icon: MailWarning };
  if (a.status === "approved") return { key: "awaiting_activation", label: "بانتظار التفعيل", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock };
  return { key: "all", label: a.status || "—", cls: "bg-gray-100 text-gray-600 border-gray-200", icon: Inbox };
}

export function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<AppFilter>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"apps" | "invites">("apps");
  const [bulkBusy, setBulkBusy] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function load(silent = false) {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch("/api/admin/applications", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setApps(data.applications || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);
  // soft refresh every 45s without flicker
  useEffect(() => {
    const t = setInterval(() => load(true), 45000);
    return () => clearInterval(t);
  }, []);

  async function doAction(action: "approve" | "reject", id?: number) {
    const targetId = id ?? selected?.id;
    if (!targetId) return;
    setActionLoading(true);

    // Optimistic update for approve/reject from modal
    const prev = apps;
    if (action === "approve") {
      setApps(p => p.map(x => x.id === targetId ? { ...x, status: "approved", activationStatus: "pending", tokenUsed: false, tokenRevoked: false, tokenExpired: false } : x));
    } else if (action === "reject") {
      setApps(p => p.map(x => x.id === targetId ? { ...x, status: "rejected", rejectionReason: rejectReason || x.rejectionReason } : x));
    }

    try {
      const res = await fetch(`/api/admin/applications/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApps(prev); // rollback
        showToast(data.error || "فشل", false);
      } else {
        showToast(data.message || "تم", true);
        setSelected(null);
        setShowRejectInput(false);
        setRejectReason("");
        load(true);
      }
    } catch {
      setApps(prev);
      showToast("حدث خطأ", false);
    } finally {
      setActionLoading(false);
    }
  }

  async function resendLink(app: Application) {
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/applications/${app.id}/resend`, { method: "POST" });
      const d = await r.json();
      showToast(d.message || d.error || (r.ok ? "تم الإرسال" : "فشل"), r.ok);
      if (r.ok) load(true);
    } catch { showToast("حدث خطأ", false); }
    finally { setActionLoading(false); }
  }

  async function cancelInvite(app: Application) {
    if (!confirm(`هل أنت متأكد من إلغاء الدعوة وإبطال رابط التفعيل لـ ${app.name}؟`)) return;
    setActionLoading(true);
    try {
      const r = await fetch(`/api/admin/applications/${app.id}/cancel`, { method: "POST" });
      const d = await r.json();
      showToast(d.message || d.error || (r.ok ? "تم الإلغاء" : "فشل"), r.ok);
      if (r.ok) { setSelected(null); load(true); }
    } catch { showToast("حدث خطأ", false); }
    finally { setActionLoading(false); }
  }

  function copyLink(link: string | null | undefined) {
    if (!link) { showToast("لا يوجد رابط متاح", false); return; }
    navigator.clipboard.writeText(link).then(() => showToast("تم نسخ الرابط ✓", true)).catch(() => showToast("فشل النسخ", false));
  }

  function whatsApp(app: Application) {
    if (!app.phone) { showToast("لا يوجد رقم جوال", false); return; }
    const phone = (app.phoneCountryCode || "") + app.phone;
    openWhatsAppChat(phone, { uniqueWindow: true });
  }

  // Bulk operations
  async function bulkAction(action: "approve" | "reject" | "resend") {
    const ids = Array.from(bulkSelected);
    if (!ids.length) return;
    if (!confirm(`تنفيذ "${action === "approve" ? "قبول" : action === "reject" ? "رفض" : "إعادة إرسال"}" لـ ${ids.length} طلب؟`)) return;
    setBulkBusy(true);
    let ok = 0, fail = 0;
    for (const id of ids) {
      try {
        const url = action === "resend"
          ? `/api/admin/applications/${id}/resend`
          : `/api/admin/applications/${id}`;
        const body = action === "resend" ? undefined : JSON.stringify({ action });
        const r = await fetch(url, {
          method: "POST",
          headers: action === "resend" ? {} : { "Content-Type": "application/json" },
          body,
        });
        if (r.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setBulkBusy(false);
    setBulkSelected(new Set());
    showToast(`تم: ${ok}${fail ? ` · فشل: ${fail}` : ""}`, fail === 0);
    load(true);
  }

  const counts = useMemo(() => ({
    pending: apps.filter(a => a.status === "pending").length,
    awaiting_activation: apps.filter(a => appFilterMatch(a, "awaiting_activation")).length,
    activated: apps.filter(a => appFilterMatch(a, "activated")).length,
    expired: apps.filter(a => appFilterMatch(a, "expired")).length,
    rejected: apps.filter(a => a.status === "rejected").length,
    all: apps.length,
  }), [apps]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter(a => appFilterMatch(a, filter)).filter(a => {
      if (!q) return true;
      return (a.name || "").toLowerCase().includes(q)
        || (a.email || "").toLowerCase().includes(q)
        || (a.phone || "").toLowerCase().includes(q)
        || (a.mainCategory || "").toLowerCase().includes(q);
    });
  }, [apps, filter, search]);

  // Reset bulk selection when filter changes
  useEffect(() => { setBulkSelected(new Set()); }, [filter, search]);

  const allInPageSelected = filtered.length > 0 && filtered.every(f => bulkSelected.has(f.id));

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.ok ? "bg-[#34cc30]" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#485869]">الطلبات والدعوات</h1>
          <p className="text-sm text-gray-500 mt-1">طلبات الانضمام ودعوات التسجيل للمستقلين</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> تحديث
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[{k:"apps",l:"طلبات الانضمام"},{k:"invites",l:"دعوات التسجيل"}].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as "apps" | "invites")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.k ? "border-[#34cc30] text-[#34cc30]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "invites" ? <InvitesEmbedded /> : (
      <>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { k: "pending", label: "بانتظار المراجعة", value: counts.pending, icon: Hourglass, color: "from-amber-500 to-amber-600", textCls: "text-amber-600" },
            { k: "awaiting_activation", label: "بانتظار التفعيل", value: counts.awaiting_activation, icon: Clock, color: "from-blue-500 to-blue-600", textCls: "text-blue-600" },
            { k: "activated", label: "مفعّل", value: counts.activated, icon: ShieldCheck, color: "from-emerald-500 to-emerald-600", textCls: "text-emerald-600" },
            { k: "expired", label: "رابط منتهي/ملغى", value: counts.expired, icon: MailWarning, color: "from-orange-500 to-orange-600", textCls: "text-orange-600" },
            { k: "rejected", label: "مرفوض", value: counts.rejected, icon: X, color: "from-red-500 to-red-600", textCls: "text-red-600" },
          ].map(s => {
            const Icon = s.icon;
            const active = filter === s.k;
            return (
              <button
                key={s.k}
                onClick={() => setFilter(s.k as AppFilter)}
                className={`text-right bg-white rounded-xl shadow-sm border transition-all p-4 hover:shadow-md ${active ? "border-[#34cc30] ring-2 ring-[#34cc30]/20" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                    <div className={`text-2xl font-bold ${s.textCls}`}>{_fmtR(s.value)}</div>
                  </div>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search + Filter chips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو البريد أو الجوال أو التخصص"
                className="w-full border border-gray-200 text-sm rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {([
              { k: "pending", l: "بانتظار المراجعة", c: counts.pending },
              { k: "awaiting_activation", l: "بانتظار التفعيل", c: counts.awaiting_activation },
              { k: "activated", l: "مفعّل", c: counts.activated },
              { k: "expired", l: "منتهي/ملغى", c: counts.expired },
              { k: "rejected", l: "مرفوض", c: counts.rejected },
              { k: "all", l: "الكل", c: counts.all },
            ] as { k: AppFilter; l: string; c: number }[]).map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f.k ? "bg-[#34cc30] text-white border-[#34cc30]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {f.l}
                <span className={`text-[10px] px-1.5 rounded-full ${filter === f.k ? "bg-white/30" : "bg-gray-100"}`}>{f.c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions bar */}
        {bulkSelected.size > 0 && (
          <div className="bg-[#485869] text-white rounded-xl px-4 py-3 flex flex-wrap items-center gap-2 sticky top-2 z-30 shadow-md">
            <span className="text-sm font-medium">{bulkSelected.size} طلب محدد</span>
            <div className="flex-1" />
            {filter === "pending" && (
              <>
                <button onClick={() => bulkAction("approve")} disabled={bulkBusy} className="bg-[#34cc30] hover:bg-[#2eb829] text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60">
                  <CheckCircle size={12} /> قبول الكل
                </button>
                <button onClick={() => bulkAction("reject")} disabled={bulkBusy} className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60">
                  <X size={12} /> رفض الكل
                </button>
              </>
            )}
            {(filter === "awaiting_activation" || filter === "expired") && (
              <button onClick={() => bulkAction("resend")} disabled={bulkBusy} className="bg-blue-500 hover:bg-blue-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60">
                <Send size={12} /> إعادة إرسال
              </button>
            )}
            <button onClick={() => setBulkSelected(new Set())} className="text-xs px-2 py-1.5 rounded-lg hover:bg-white/10">إلغاء التحديد</button>
          </div>
        )}

        {/* Table / Empty / Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
            <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} hasSearch={!!search.trim()} onClearSearch={() => setSearch("")} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        className="accent-[#34cc30]"
                        checked={allInPageSelected}
                        onChange={() => {
                          if (allInPageSelected) setBulkSelected(new Set());
                          else setBulkSelected(new Set(filtered.map(f => f.id)));
                        }}
                      />
                    </th>
                    <th className="text-right p-3">المتقدم</th>
                    <th className="text-right p-3">التخصص</th>
                    <th className="text-right p-3">الدولة / المدينة</th>
                    <th className="text-right p-3">الحالة</th>
                    <th className="text-right p-3">التاريخ</th>
                    <th className="text-right p-3 w-[260px]">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(app => {
                    const st = effectiveStatus(app);
                    const StIcon = st.icon;
                    const checked = bulkSelected.has(app.id);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="p-3 align-top">
                          <input
                            type="checkbox"
                            className="accent-[#34cc30] mt-1"
                            checked={checked}
                            onChange={() => {
                              setBulkSelected(prev => {
                                const next = new Set(prev);
                                if (next.has(app.id)) next.delete(app.id); else next.add(app.id);
                                return next;
                              });
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-[#485869]">{app.name}</div>
                          <div className="text-xs text-gray-400" dir="ltr">{app.email}</div>
                          <div className="text-xs text-gray-400" dir="ltr">{app.phoneCountryCode || ""} {app.phone || ""}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700">{app.mainCategory || "—"}</div>
                          <div className="text-xs text-gray-400">{app.subCategory || "—"}</div>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div>{app.country || "—"}</div>
                          <div className="text-xs text-gray-400">{app.city || "—"}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${st.cls}`}>
                            <StIcon size={11} /> {st.label}
                          </span>
                          {st.key === "awaiting_activation" && app.tokenExpiresAt && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              ينتهي: {new Date(app.tokenExpiresAt).toLocaleDateString("en-CA")}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-CA") : "—"}
                        </td>
                        <td className="p-3">
                          <RowActions
                            app={app}
                            onView={() => { setSelected(app); setShowRejectInput(false); setRejectReason(""); }}
                            onCopy={() => copyLink(app.setupLink)}
                            onResend={() => resendLink(app)}
                            onCancel={() => cancelInvite(app)}
                            onWhatsApp={() => whatsApp(app)}
                            actionLoading={actionLoading}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map(app => {
                const st = effectiveStatus(app);
                const StIcon = st.icon;
                const checked = bulkSelected.has(app.id);
                return (
                  <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="accent-[#34cc30] mt-1"
                        checked={checked}
                        onChange={() => {
                          setBulkSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(app.id)) next.delete(app.id); else next.add(app.id);
                            return next;
                          });
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#485869]">{app.name}</div>
                        <div className="text-xs text-gray-500" dir="ltr">{app.email}</div>
                        <div className="text-xs text-gray-500" dir="ltr">{app.phoneCountryCode || ""} {app.phone || ""}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${st.cls}`}>
                        <StIcon size={10} /> {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {app.mainCategory || "—"} {app.subCategory ? `· ${app.subCategory}` : ""} · {app.city || app.country || "—"}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                      <RowActions
                        app={app}
                        onView={() => { setSelected(app); setShowRejectInput(false); setRejectReason(""); }}
                        onCopy={() => copyLink(app.setupLink)}
                        onResend={() => resendLink(app)}
                        onCancel={() => cancelInvite(app)}
                        onWhatsApp={() => whatsApp(app)}
                        actionLoading={actionLoading}
                        compact
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </>
      )}

      {/* Application Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#485869]">تفاصيل الطلب</h2>
                {(() => {
                  const st = effectiveStatus(selected);
                  const StIcon = st.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>
                      <StIcon size={11} /> {st.label}
                    </span>
                  );
                })()}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">الاسم:</span> <span className="font-medium">{selected.name}</span></div>
                <div><span className="text-gray-500">البريد:</span> <span dir="ltr">{selected.email}</span></div>
                <div><span className="text-gray-500">الواتساب:</span> <span dir="ltr">{selected.phoneCountryCode} {selected.phone}</span></div>
                <div><span className="text-gray-500">الدولة / المدينة:</span> <span>{selected.country || "—"} / {selected.city || "—"}</span></div>
                <div><span className="text-gray-500">الجنس:</span> <span>{selected.gender || "—"}</span></div>
                <div><span className="text-gray-500">تاريخ الميلاد:</span> <span>{selected.dateOfBirth || "—"}</span></div>
                <div><span className="text-gray-500">المجال:</span> <span>{selected.mainCategory} — {selected.subCategory}</span></div>
                <div><span className="text-gray-500">الخبرة:</span> <span>{selected.yearsExperience || "—"}</span></div>
                <div><span className="text-gray-500">البنك:</span> <span>{selected.bankName || "—"}</span></div>
                <div><span className="text-gray-500">الآيبان:</span> <span dir="ltr">{selected.iban || "—"}</span></div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">النبذة الشخصية</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3">{selected.bio}</p>
              </div>

              {selected.skills && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">المهارات</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.split(",").map(s => (
                      <span key={s} className="bg-[#34cc30]/10 text-[#34cc30] text-xs px-2 py-1 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {selected.portfolioUrl && (
                  <a href={selected.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink size={14} /> ملف الأعمال / الموقع / التواصل
                  </a>
                )}
                {selected.linkedinUrl && (
                  <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink size={14} /> LinkedIn
                  </a>
                )}
              </div>

              {(selected.nationalIdFrontImage || selected.nationalIdBackImage || selected.nationalIdImage) && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">صور الهوية الوطنية / الإقامة</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(selected.nationalIdFrontImage || selected.nationalIdImage) && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">الأمام</p>
                        <img src={selected.nationalIdFrontImage || selected.nationalIdImage || ""} alt="هوية من الأمام" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
                      </div>
                    )}
                    {selected.nationalIdBackImage && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">الخلف</p>
                        <img src={selected.nationalIdBackImage} alt="هوية من الخلف" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selected.ibanDocument && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">وثيقة الآيبان المختومة من البنك</p>
                  {selected.ibanDocument.startsWith("data:application/pdf") ? (
                    <a href={selected.ibanDocument} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm">
                      <FileText size={16} /> فتح وثيقة الآيبان
                    </a>
                  ) : (
                    <img src={selected.ibanDocument} alt="وثيقة الآيبان" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
                  )}
                </div>
              )}

              {selected.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <strong>سبب الرفض:</strong> {selected.rejectionReason}
                </div>
              )}

              {selected.status === "pending" && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {showRejectInput && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">سبب الرفض (اختياري)</label>
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                        placeholder="أخبر المتقدم بسبب رفض طلبه..."
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => doAction("approve")}
                      disabled={actionLoading}
                      className="flex-1 bg-[#34cc30] text-white py-2.5 rounded-xl font-medium hover:bg-[#2eb829] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> موافقة وإنشاء الحساب
                    </button>
                    {!showRejectInput ? (
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                      >
                        <X size={16} /> رفض
                      </button>
                    ) : (
                      <button
                        onClick={() => doAction("reject")}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <X size={16} /> تأكيد الرفض
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selected.status === "approved" && selected.activationStatus === "pending" && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <Clock size={16} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          {selected.tokenExpired || selected.tokenRevoked ? "رابط التفعيل منتهي أو مُلغى" : "بانتظار تفعيل الحساب"}
                        </div>
                        <div className="text-xs">
                          تم إنشاء الحساب وإرسال رابط التفعيل عبر البريد والواتساب.
                          {selected.tokenExpiresAt && !selected.tokenExpired && (
                            <> ينتهي الرابط في {new Date(selected.tokenExpiresAt).toLocaleString("en-CA")}.</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => copyLink(selected.setupLink)} className="flex-1 min-w-[140px] bg-gray-100 text-[#485869] py-2.5 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                      <Copy size={14} /> نسخ الرابط
                    </button>
                    <button onClick={() => resendLink(selected)} disabled={actionLoading} className="flex-1 min-w-[140px] bg-blue-500 text-white py-2.5 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-60 flex items-center justify-center gap-2">
                      <Send size={14} /> إعادة إرسال
                    </button>
                    <button onClick={() => whatsApp(selected)} className="flex-1 min-w-[140px] bg-[#25D366] text-white py-2.5 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2">
                      <MessageSquare size={14} /> واتساب
                    </button>
                    <button onClick={() => cancelInvite(selected)} disabled={actionLoading} className="flex-1 min-w-[140px] bg-red-50 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-100 disabled:opacity-60 flex items-center justify-center gap-2">
                      <Ban size={14} /> إلغاء الدعوة
                    </button>
                  </div>
                </div>
              )}

              {selected.status === "approved" && selected.activationStatus === "active" && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800 flex items-center gap-2">
                    <ShieldCheck size={16} /> الحساب مفعّل والمستقل يستطيع تسجيل الدخول.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === Sub-components for ApplicationsPage ===

function RowActions({ app, onView, onCopy, onResend, onCancel, onWhatsApp, actionLoading, compact = false }: {
  app: Application;
  onView: () => void;
  onCopy: () => void;
  onResend: () => void;
  onCancel: () => void;
  onWhatsApp: () => void;
  actionLoading: boolean;
  compact?: boolean;
}) {
  const isApprovedPending = app.status === "approved" && app.activationStatus === "pending";
  const isActivated = app.status === "approved" && app.activationStatus === "active";
  const btn = `inline-flex items-center gap-1 ${compact ? "text-[11px] px-2 py-1" : "text-xs px-2.5 py-1.5"} rounded-lg border transition-colors`;
  return (
    <div className="flex flex-wrap gap-1.5">
      <button onClick={onView} className={`${btn} border-gray-200 text-[#485869] hover:bg-gray-50`} title="عرض التفاصيل">
        <Eye size={12} /> عرض
      </button>
      {isApprovedPending && (
        <>
          <button onClick={onCopy} disabled={!app.setupLink} className={`${btn} border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40`} title="نسخ رابط التفعيل">
            <Copy size={12} /> {!compact && "نسخ"}
          </button>
          <button onClick={onResend} disabled={actionLoading} className={`${btn} border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50`} title="إعادة إرسال البريد + الواتساب">
            <Send size={12} /> {!compact && "إعادة إرسال"}
          </button>
          <button onClick={onWhatsApp} className={`${btn} border-emerald-200 text-emerald-600 hover:bg-emerald-50`} title="فتح واتساب">
            <MessageSquare size={12} />
          </button>
          <button onClick={onCancel} disabled={actionLoading} className={`${btn} border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50`} title="إلغاء الدعوة">
            <Ban size={12} />
          </button>
        </>
      )}
      {isActivated && (
        <button onClick={onWhatsApp} className={`${btn} border-emerald-200 text-emerald-600 hover:bg-emerald-50`} title="فتح واتساب">
          <MessageSquare size={12} /> {!compact && "واتساب"}
        </button>
      )}
    </div>
  );
}

function EmptyState({ filter, hasSearch, onClearSearch }: { filter: AppFilter; hasSearch: boolean; onClearSearch: () => void }) {
  const config: Record<AppFilter, { icon: LucideIcon; title: string; desc: string }> = {
    pending: { icon: Hourglass, title: "لا توجد طلبات بانتظار المراجعة", desc: "ستظهر هنا الطلبات الجديدة فور وصولها." },
    awaiting_activation: { icon: Clock, title: "لا توجد حسابات بانتظار التفعيل", desc: "بعد قبول الطلب يظهر هنا حتى يكمل المستقل تعيين كلمة المرور." },
    activated: { icon: ShieldCheck, title: "لا توجد حسابات مفعّلة بعد", desc: "ستظهر الحسابات هنا بعد تفعيلها من قِبل المستقلين." },
    expired: { icon: MailWarning, title: "لا توجد روابط منتهية", desc: "إذا انتهى رابط التفعيل قبل استخدامه يظهر هنا لإعادة الإرسال." },
    rejected: { icon: X, title: "لا توجد طلبات مرفوضة", desc: "كل شيء على ما يرام." },
    all: { icon: Inbox, title: "لا توجد طلبات", desc: "لم يتقدم أحد بعد، شارك رابط التقديم لاستقبال طلبات جديدة." },
  };
  const c = config[filter] || config.all;
  const Icon = c.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="text-[#485869] font-medium">{hasSearch ? "لا توجد نتائج للبحث" : c.title}</p>
      <p className="text-sm text-gray-500 mt-1">{hasSearch ? "جرّب كلمات أخرى أو امسح البحث." : c.desc}</p>
      {hasSearch && (
        <button onClick={onClearSearch} className="mt-4 text-sm text-[#34cc30] hover:underline inline-flex items-center gap-1">
          <X size={14} /> مسح البحث
        </button>
      )}
    </div>
  );
}
