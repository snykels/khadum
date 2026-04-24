'use client';

<<<<<<< HEAD
import { useEffect, useState, useCallback, useRef } from "react";
import {
  HelpCircle, AlertCircle, ArrowLeftRight, RotateCcw, Mail,
  Phone, MessageSquare, RefreshCw, CheckCircle, Clock,
  ChevronLeft, User, ShoppingBag, Send, ExternalLink,
  FileText, Search, Loader2, MoreVertical, UserCheck, XCircle,
  AlertTriangle, Eye, DollarSign,
} from "lucide-react";
import { OrderTransferPage, RefundRequestsPage } from "./AdminPagesNew";

type TabKey = "tickets" | "disputes" | "transfers" | "refunds" | "contact";

const tabs: { key: TabKey; label: string; icon: typeof HelpCircle }[] = [
  { key: "tickets",   label: "تذاكر الدعم",      icon: HelpCircle },
  { key: "disputes",  label: "النزاعات",          icon: AlertCircle },
  { key: "transfers", label: "تحويل الطلبات",     icon: ArrowLeftRight },
  { key: "refunds",   label: "طلبات الاسترداد",   icon: RotateCcw },
  { key: "contact",   label: "رسائل تواصل معنا",  icon: Mail },
];

// ─── Tickets ───────────────────────────────────
type Ticket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  fromName: string;
  fromRole: string | null;
  fromEmail: string | null;
  fromPhone: string | null;
  createdAt: string;
};

const TICKET_STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: "جديدة",         color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  in_review:   { label: "قيد المراجعة",  color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  in_progress: { label: "قيد المعالجة",  color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  resolved:    { label: "مغلقة",         color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
};

const TICKET_PRIORITY: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  normal: "bg-gray-100 text-gray-600",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "عاجل", medium: "متوسط", normal: "عادي",
};

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  return `قبل ${Math.floor(h / 24)} يوم`;
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ComponentType<any>; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Icon size={28} className="text-gray-300 dark:text-gray-600" />
      </div>
      <div className="font-medium text-gray-500 dark:text-gray-400 text-sm">{title}</div>
      {desc && <div className="text-xs text-gray-400 mt-1 max-w-[180px]">{desc}</div>}
    </div>
  );
}

function RowActionsMenu({ items }: { items: { label: string; icon: React.ComponentType<any>; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#1e2130] border border-gray-200 dark:border-[#2a2d36] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TicketDetailPanel({ ticket, onUpdate }: { ticket: Ticket; onUpdate: () => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setStatus(ticket.status);
    setMsg("");
  }, [ticket.id, ticket.status]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (r.ok) { setMsg("تم الحفظ بنجاح"); onUpdate(); }
      else setMsg("فشل الحفظ");
    } catch { setMsg("خطأ في الاتصال"); }
    setSaving(false);
  }

  const roleLabel = (r: string | null) => {
    if (!r) return "—";
    if (r === "freelancer" || r === "مستقل") return "مستقل";
    if (r === "client" || r === "عميل") return "عميل";
    return r;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="font-bold text-[#485869] dark:text-white text-lg leading-tight">{ticket.subject}</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${TICKET_STATUS[ticket.status]?.color}`}>
            {TICKET_STATUS[ticket.status]?.label || ticket.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(ticket.createdAt)}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${TICKET_PRIORITY[ticket.priority] || ""}`}>
            {PRIORITY_LABEL[ticket.priority] || ticket.priority}
          </span>
          <span>TK-{String(ticket.id).padStart(4, "0")}</span>
        </div>
      </div>

      {/* User info */}
      <div className="bg-gray-50 dark:bg-[#252830] rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1.5">
          <User size={11} /> بيانات المرسل
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold text-sm">
            {ticket.fromName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#485869] dark:text-white">{ticket.fromName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{roleLabel(ticket.fromRole)}</div>
          </div>
        </div>
        {ticket.fromPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone size={13} />
            <a href={`tel:${ticket.fromPhone}`} className="hover:text-[#34cc30]">{ticket.fromPhone}</a>
            <a href={`https://wa.me/${ticket.fromPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              className="bg-[#34cc30] text-white px-2 py-0.5 rounded text-[11px] font-medium">
              واتساب
            </a>
          </div>
        )}
        {ticket.fromEmail && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail size={13} />{ticket.fromEmail}
          </div>
        )}
      </div>

      {/* Original message */}
      <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl p-4">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-1.5">
          <FileText size={11} /> الرسالة
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
      </div>

      {/* Update status */}
      <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">تحديث الحالة</div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-[#485869] dark:text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="open">جديدة</option>
          <option value="in_review">قيد المراجعة</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">مغلقة</option>
        </select>
        <div className="flex items-center justify-between">
          {msg && <span className={`text-xs ${msg.includes("تم") ? "text-green-600" : "text-red-500"}`}>{msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="mr-auto bg-[#34cc30] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2eb829] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            حفظ
          </button>
        </div>
      </div>

      {/* Quick actions */}
      {ticket.fromPhone && (
        <div className="flex gap-2">
          <a href={`https://wa.me/${ticket.fromPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829]">
            <MessageSquare size={14} /> رد عبر واتساب
          </a>
        </div>
      )}
    </div>
  );
}

function TicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [adminId, setAdminId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/tickets", { cache: "no-store" });
      if (r.ok) { const d = await r.json(); setTickets(Array.isArray(d) ? d : (d.tickets || [])); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.id) setAdminId(d.user.id);
    }).catch(() => {});
  }, [load]);

  const filtered = tickets
    .filter(t => filter === "all" || t.status === filter)
    .filter(t => !search || t.subject.includes(search) || t.fromName.includes(search));

  const counts = {
    open: tickets.filter(t => t.status === "open").length,
    in_review: tickets.filter(t => t.status === "in_review").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  async function quickStatus(id: number, status: string) {
    try {
      await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } catch {}
  }

  async function assignToMe(id: number) {
    if (!adminId) return;
    try {
      await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: adminId }),
      });
      load();
    } catch {}
  }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[500px] bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden">
      {/* List */}
      <div className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-[340px] md:shrink-0 border-l border-gray-100 dark:border-[#2a2d36]`}>
        <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36] space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-8 pl-3 py-1.5 text-sm bg-gray-50 dark:bg-[#252830] border border-gray-200 dark:border-[#2a2d36] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
              />
            </div>
            <button onClick={load} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex gap-1 flex-wrap text-xs">
            {[
              { k: "all",        l: `الكل (${tickets.length})` },
              { k: "open",       l: `جديدة (${counts.open})` },
              { k: "in_review",  l: `مراجعة (${counts.in_review})` },
              { k: "in_progress",l: `معالجة (${counts.in_progress})` },
              { k: "resolved",   l: `مغلقة (${counts.resolved})` },
            ].map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-2.5 py-1 rounded-lg ${filter === f.k ? "bg-[#34cc30] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"}`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <Loader2 size={24} className="animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={HelpCircle} title="لا توجد تذاكر" desc="جميع التذاكر مُعالجة أو لا توجد تذاكر بهذا الفلتر" />
          ) : filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-right p-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5 transition ${selected?.id === t.id ? "bg-[#34cc30]/5 border-r-2 border-r-[#34cc30]" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-medium text-[#485869] dark:text-white text-sm line-clamp-1">{t.subject}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TICKET_STATUS[t.status]?.color || ""}`}>
                    {TICKET_STATUS[t.status]?.label || t.status}
                  </span>
                  <RowActionsMenu items={[
                    { label: "عرض التفاصيل", icon: Eye, onClick: () => setSelected(t) },
                    ...(adminId ? [{ label: "تعيين لي", icon: UserCheck, onClick: () => assignToMe(t.id) }] : []),
                    { label: "وضع قيد المراجعة", icon: Clock, onClick: () => quickStatus(t.id, "in_review") },
                    { label: "وضع قيد المعالجة", icon: AlertTriangle, onClick: () => quickStatus(t.id, "in_progress") },
                    { label: "إغلاق التذكرة", icon: XCircle, onClick: () => quickStatus(t.id, "resolved"), danger: true },
                  ]} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>{t.fromName}</span>
                <span>{timeAgo(t.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-[#2a2d36] bg-white dark:bg-[#1a1d24] sticky top-0">
            <button
              onClick={() => setSelected(null)}
              className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              TK-{String(selected.id).padStart(4, "0")}
            </span>
          </div>
          <TicketDetailPanel
            key={selected.id}
            ticket={selected}
            onUpdate={() => {
              load();
              setSelected(prev => prev ? { ...prev } : null);
            }}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <EmptyState icon={HelpCircle} title="اختر تذكرة لعرض تفاصيلها" desc="انقر على أي تذكرة من القائمة" />
        </div>
      )}
    </div>
  );
}

// ─── Disputes ──────────────────────────────────
type Dispute = {
  id: number;
  publicCode: string;
  orderId: number | null;
  orderCode: string | null;
  orderAmount: string | null;
  category: string | null;
  reason: string | null;
  evidence?: any[] | null;
  status: string;
  priority: string | null;
  resolution: string | null;
  refundIssued: boolean | null;
  assignedTo: number | null;
  raisedByName: string | null;
  againstName: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

const DISPUTE_STATUS: Record<string, { label: string; color: string }> = {
  open:       { label: "مفتوح",         color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  pending:    { label: "قيد الفحص",     color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  in_review:  { label: "قيد المراجعة",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  resolved:   { label: "محلول",         color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  rejected:   { label: "مرفوض",         color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
};

function DisputeDetailPanel({ dispute, onUpdate }: { dispute: Dispute; onUpdate: () => void }) {
  const [status, setStatus] = useState(dispute.status);
  const [resolution, setResolution] = useState(dispute.resolution || "");
  const [refund, setRefund] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setStatus(dispute.status);
    setResolution(dispute.resolution || "");
    setRefund("");
    setMsg("");
  }, [dispute.id]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const body: Record<string, any> = { id: dispute.id, status, resolution };
      if (refund) body.refundAmount = parseFloat(refund);
      const r = await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) { setMsg("تم الحفظ"); onUpdate(); }
      else setMsg("فشل الحفظ");
    } catch { setMsg("خطأ"); }
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-bold text-[#485869] dark:text-white">نزاع #{dispute.publicCode}</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${DISPUTE_STATUS[dispute.status]?.color}`}>
            {DISPUTE_STATUS[dispute.status]?.label || dispute.status}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(dispute.createdAt)}</div>
      </div>

      {/* Parties + Evidence side by side */}
      {(() => {
        const evList: any[] = Array.isArray(dispute.evidence) ? dispute.evidence : [];
        const raisedEvidence = evList.filter((e: any) => !e.party || e.party === "client" || e.party === "raised_by" || e.party === "raisedBy");
        const againstEvidence = evList.filter((e: any) => e.party === "freelancer" || e.party === "against" || e.party === "againstUser");
        const noPartyEvidence = evList.filter((e: any) => !e.party);
        const leftEvidence = raisedEvidence.length > 0 ? raisedEvidence : noPartyEvidence;
        const rightEvidence = againstEvidence;
        const renderEv = (ev: any) => typeof ev === "string" ? ev : (ev.text || ev.url || ev.description || ev.content || JSON.stringify(ev));
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20 flex flex-col gap-2">
              <div className="text-xs text-blue-600 dark:text-blue-300 font-bold">المُبلِّغ</div>
              <div className="font-semibold text-[#485869] dark:text-white text-sm">{dispute.raisedByName || "—"}</div>
              {leftEvidence.length > 0 && (
                <div className="mt-1 space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-500 uppercase">الأدلة المقدمة</div>
                  {leftEvidence.map((ev: any, i: number) => (
                    <div key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg p-2 border border-blue-100 dark:border-blue-900/30 break-words">
                      {renderEv(ev)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/20 flex flex-col gap-2">
              <div className="text-xs text-red-600 dark:text-red-300 font-bold">المُبلَّغ عنه</div>
              <div className="font-semibold text-[#485869] dark:text-white text-sm">{dispute.againstName || "—"}</div>
              {rightEvidence.length > 0 && (
                <div className="mt-1 space-y-1.5">
                  <div className="text-[10px] font-bold text-red-500 uppercase">رد الطرف الآخر</div>
                  {rightEvidence.map((ev: any, i: number) => (
                    <div key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg p-2 border border-red-100 dark:border-red-900/30 break-words">
                      {renderEv(ev)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {dispute.orderId && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><ShoppingBag size={10} /> الطلب المرتبط</div>
              <div className="font-semibold text-[#485869] dark:text-white">#{dispute.orderCode}</div>
              {dispute.orderAmount && (
                <div className="text-sm text-[#34cc30] font-bold mt-1">
                  {parseFloat(dispute.orderAmount).toLocaleString("ar-SA")} ر.س
                </div>
              )}
            </div>
            <a href={`/admin/orders?id=${dispute.orderId}`} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-blue-500">
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      )}

      {dispute.reason && (
        <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><AlertCircle size={10} /> سبب النزاع</div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{dispute.reason}</p>
          {dispute.category && <div className="text-xs text-gray-400 mt-1">التصنيف: {dispute.category}</div>}
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 uppercase">الحل والقرار</div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-3 py-2 text-sm text-[#485869] dark:text-white"
        >
          <option value="open">مفتوح</option>
          <option value="pending">قيد الفحص</option>
          <option value="in_review">قيد المراجعة</option>
          <option value="resolved">محلول</option>
          <option value="rejected">مرفوض</option>
        </select>
        <textarea
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          rows={3}
          placeholder="قرار الإدارة وملاحظاتها..."
          className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-3 py-2 text-sm resize-none text-[#485869] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
        />
        <input
          type="number"
          value={refund}
          onChange={e => setRefund(e.target.value)}
          placeholder="مبلغ الاسترداد (ر.س) — اتركه فارغاً إن لم يكن هناك استرداد"
          className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-3 py-2 text-sm text-[#485869] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
        />
        <div className="flex items-center justify-between">
          {msg && <span className={`text-xs ${msg.includes("تم") ? "text-green-600" : "text-red-500"}`}>{msg}</span>}
          <button onClick={save} disabled={saving}
            className="mr-auto bg-[#34cc30] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2eb829] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} حفظ القرار
          </button>
        </div>
        {dispute.refundIssued && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={12} /> تم إصدار الاسترداد مسبقاً
          </div>
        )}
      </div>
    </div>
  );
}

function DisputesTab() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/disputes", { cache: "no-store" });
      if (r.ok) setDisputes(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? disputes : disputes.filter(d => d.status === filter);

  async function quickDispute(body: Record<string, any>) {
    try {
      await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      load();
    } catch {}
  }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[500px] bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden">
      <div className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-[320px] md:shrink-0 border-l border-gray-100 dark:border-[#2a2d36]`}>
        <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36]">
          <div className="flex gap-1 flex-wrap text-xs">
            {[
              { k: "all",       l: `الكل (${disputes.length})` },
              { k: "open",      l: `مفتوح (${disputes.filter(d=>d.status==="open").length})` },
              { k: "pending",   l: `فحص (${disputes.filter(d=>d.status==="pending").length})` },
              { k: "in_review", l: `مراجعة (${disputes.filter(d=>d.status==="in_review").length})` },
              { k: "resolved",  l: `محلول (${disputes.filter(d=>d.status==="resolved").length})` },
            ].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)}
                className={`px-2.5 py-1 rounded-lg ${filter===f.k ? "bg-[#34cc30] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={AlertCircle} title="لا توجد نزاعات" desc="لا توجد نزاعات بهذا الفلتر" />
          ) : filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`w-full text-right p-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5 transition ${selected?.id===d.id ? "bg-[#34cc30]/5 border-r-2 border-r-[#34cc30]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[#485869] dark:text-white text-sm">#{d.publicCode}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${DISPUTE_STATUS[d.status]?.color}`}>
                    {DISPUTE_STATUS[d.status]?.label}
                  </span>
                  <RowActionsMenu items={[
                    { label: "عرض التفاصيل", icon: Eye, onClick: () => setSelected(d) },
                    { label: "تعيين لي", icon: UserCheck, onClick: () => quickDispute({ id: d.id, assignedToMe: true }) },
                    { label: "وضع قيد الفحص", icon: Clock, onClick: () => quickDispute({ id: d.id, status: "pending" }) },
                    { label: "وضع قيد المراجعة", icon: AlertTriangle, onClick: () => quickDispute({ id: d.id, status: "in_review" }) },
                    { label: "إغلاق / حل", icon: CheckCircle, onClick: () => quickDispute({ id: d.id, status: "resolved" }) },
                    { label: "إصدار استرداد", icon: DollarSign, onClick: () => quickDispute({ id: d.id, refundAmount: parseFloat(d.orderAmount || "0") || 0 }) },
                    { label: "رفض", icon: XCircle, onClick: () => quickDispute({ id: d.id, status: "rejected" }), danger: true },
                  ]} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{d.raisedByName} ضد {d.againstName}</div>
              {d.orderCode && <div className="text-[10px] text-blue-500 mt-1 flex items-center gap-1"><ShoppingBag size={9} /> #{d.orderCode}</div>}
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-[#2a2d36] sticky top-0 bg-white dark:bg-[#1a1d24]">
            <button onClick={() => setSelected(null)} className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{selected.publicCode}</span>
          </div>
          <DisputeDetailPanel key={selected.id} dispute={selected} onUpdate={load} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <EmptyState icon={AlertCircle} title="اختر نزاعاً لعرض تفاصيله" desc="انقر على أي نزاع من القائمة" />
        </div>
      )}
    </div>
  );
}

// ─── Contact Messages ───────────────────────────
type ContactMsg = {
  id: number; name: string; phone: string; email: string | null;
  subject: string | null; message: string; status: string | null; createdAt: string | null;
};

function ContactTab() {
  const [items, setItems] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [search, setSearch] = useState("");

  const statusLabel: Record<string, string> = { new: "جديد", in_progress: "قيد المراجعة", closed: "مغلق" };
  const statusColor: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };

=======
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

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/contact-messages");
<<<<<<< HEAD
      if (r.ok) setItems((await r.json()).messages || []);
=======
      const d = await r.json();
      if (r.ok) setItems(d.messages || []);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

<<<<<<< HEAD
  const filtered = items.filter(m => {
    const okStatus = statusFilter === "الكل" || m.status === statusFilter;
    const okSearch = !search || m.name.includes(search) || m.phone.includes(search) || m.message.includes(search);
    return okStatus && okSearch;
  });

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[500px] bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden">
      <div className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-[340px] md:shrink-0 border-l border-gray-100 dark:border-[#2a2d36]`}>
        <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36] space-y-2">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
              className="w-full pr-8 pl-3 py-1.5 text-sm bg-gray-50 dark:bg-[#252830] border border-gray-200 dark:border-[#2a2d36] rounded-lg focus:outline-none" />
          </div>
          <div className="flex gap-1 text-xs">
            {["الكل", "new", "in_progress", "closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg ${statusFilter===s ? "bg-[#34cc30] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>
                {statusLabel[s] || s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-gray-400" /></div>
          : filtered.length === 0 ? <EmptyState icon={Mail} title="لا توجد رسائل" desc="لا توجد رسائل تواصل بهذا الفلتر" />
          : filtered.map(m => (
            <button key={m.id} onClick={() => setSelected(m)}
              className={`w-full text-right p-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5 transition ${selected?.id===m.id ? "bg-[#34cc30]/5 border-r-2 border-r-[#34cc30]" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[#485869] dark:text-white text-sm">{m.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColor[m.status||"new"]}`}>
                  {statusLabel[m.status||"new"] || m.status}
                </span>
              </div>
              {m.subject && <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{m.subject}</div>}
              <div className="text-xs text-gray-400 mt-1">{m.createdAt ? timeAgo(m.createdAt) : ""}</div>
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <button onClick={() => setSelected(null)} className="md:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft size={16} /> رجوع
          </button>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold">
              {selected.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-[#485869] dark:text-white">{selected.name}</div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Phone size={12} />{selected.phone}</span>
                {selected.email && <span>{selected.email}</span>}
              </div>
            </div>
          </div>
          {selected.subject && <div className="font-semibold text-[#485869] dark:text-white">{selected.subject}</div>}
          <div className="bg-gray-50 dark:bg-[#252830] rounded-xl p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${selected.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2eb829]">
              <MessageSquare size={14} /> رد عبر واتساب
            </a>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <EmptyState icon={Mail} title="اختر رسالة لعرضها" desc="انقر على أي رسالة من القائمة" />
=======
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
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        </div>
      )}
    </div>
  );
}

export default function SupportHub() {
  const [tab, setTab] = useState<TabKey>("tickets");

  const renderTab = () => {
    switch (tab) {
<<<<<<< HEAD
      case "tickets":   return <TicketsTab />;
      case "disputes":  return <DisputesTab />;
      case "transfers": return <OrderTransferPage />;
      case "refunds":   return <RefundRequestsPage />;
      case "contact":   return <ContactTab />;
=======
      case "tickets":   return <AdminSupportTicketsPage />;
      case "disputes":  return <DisputesPage />;
      case "transfers": return <OrderTransferPage />;
      case "refunds":   return <RefundRequestsPage />;
      case "contact":   return <ContactMessagesTab />;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    }
  };

  return (
<<<<<<< HEAD
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white flex items-center gap-2">
            <HelpCircle className="text-[#34cc30]" /> مركز الدعم الموحّد
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            تذاكر، نزاعات، تحويل الطلبات، استردادات، ورسائل التواصل
          </p>
=======
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
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        </div>
      </div>

      {/* Tabs */}
<<<<<<< HEAD
      <div className="flex gap-1 overflow-x-auto pb-1">
=======
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-100 dark:border-[#2a2d36] p-1.5 flex flex-wrap gap-1 overflow-x-auto">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
<<<<<<< HEAD
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                active
                  ? "bg-[#34cc30] text-white border-[#34cc30] shadow-sm"
                  : "bg-white dark:bg-[#1a1d24] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#2a2d36] hover:border-[#34cc30] hover:text-[#34cc30]"
              }`}
            >
              <Icon size={15} />
=======
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                active
                  ? "bg-[#34cc30] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={16} className={active ? "" : t.color} />
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              {t.label}
            </button>
          );
        })}
      </div>

<<<<<<< HEAD
=======
      {/* Body */}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      <div>{renderTab()}</div>
    </div>
  );
}
