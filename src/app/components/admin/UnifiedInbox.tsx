"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { alertDialog } from "@/app/components/ui/confirmBus";
import {
  MessageSquare, Search, Send, Paperclip, MoreVertical, Phone, Mail, User,
  Clock, CheckCircle2, AlertTriangle, Archive, Ban, Loader2, X, Filter,
  Inbox, Users as UsersIcon, ChevronDown, FileText, StickyNote, Zap,
  RefreshCw, Bell, ExternalLink, ShieldAlert, Globe, Smartphone, Briefcase,
  XCircle, TrendingUp, UserX, AlertCircle, ChevronRight, ChevronLeft, HelpCircle, MessageCircle,
} from "lucide-react";

type Conversation = {
  id: number;
  publicCode: string;
  orderId: number | null;
  status: string;
  channel?: "whatsapp" | "web" | "freelancer" | string | null;
  subject: string | null;
  lastMessageAt: string;
  lastMessageBy: string | null;
  unreadByAdmin: number;
  adminId: number | null;
  adminName: string | null;
  clientName: string | null;
  clientId: number | null;
  clientPhone: string | null;
  clientAvatar: string | null;
  freelancerName: string | null;
  freelancerId: number | null;
  freelancerPhone: string | null;
  freelancerAvatar: string | null;
  createdAt: string;
};

type Message = {
  id: number;
  conversationId: number;
  senderParty: "client" | "freelancer" | "admin" | "system";
  senderId: number | null;
  messageType: string;
  bodyOriginal: string;
  bodyRedacted: string | null;
  hasLeak: boolean;
  leakSeverity: string | null;
  isBlocked: boolean;
  createdAt: string;
};

type Note = {
  id: number;
  adminId: number;
  adminName: string | null;
  reason: string;
  createdAt: string;
};

type TicketSummary = { id: number; subject: string; status: string; priority: string | null; createdAt: string };

type ConvDetails = Conversation & {
  clientEmail: string | null;
  freelancerEmail: string | null;
  clientCreatedAt: string | null;
  freelancerCreatedAt: string | null;
  clientIsBlocked: boolean | null;
  freelancerIsBlocked: boolean | null;
  closedAt: string | null;
  closedReason: string | null;
  adminEmail: string | null;
  order: {
    id: number;
    publicCode: string;
    status: string;
    amount: string | null;
    serviceTitle: string | null;
    createdAt: string;
  } | null;
  notes: Note[];
  ticketHistory: TicketSummary[];
};

type Staff = { id: number; name: string; email: string; role: string; avatarUrl: string | null };
type QuickReply = { id: number; shortcode: string; title: string; body: string; category: string | null };

const STATUS_LABELS: Record<string, string> = {
  active: "مفتوحة",
  completed: "مغلقة",
  disputed: "نزاع",
  blocked: "محظورة",
  archived: "مؤرشفة",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  disputed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  blocked: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const PARTY_LABEL: Record<string, string> = {
  client: "العميل",
  freelancer: "المستقل",
  admin: "الإدارة",
  system: "النظام",
};

function ChannelBadge({ channel }: { channel?: string | null }) {
  if (!channel) return null;
  if (channel === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[#25D366]/10 text-[#128C7E] font-medium border border-[#25D366]/20">
        <Smartphone className="w-2.5 h-2.5" /> واتساب
      </span>
    );
  }
  if (channel === "web") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
        <Globe className="w-2.5 h-2.5" /> موقع
      </span>
    );
  }
  if (channel === "freelancer") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
        <Briefcase className="w-2.5 h-2.5" /> مستقل
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
      <MessageCircle className="w-2.5 h-2.5" /> داخلي
    </span>
  );
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  const d = Math.floor(h / 24);
  if (d < 30) return `منذ ${d} يوم`;
  return date.toLocaleDateString("ar-SA");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function EmptyState({ icon: Icon, title, desc, cta, onCta }: {
  icon: React.ComponentType<any>;
  title: string;
  desc?: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      </div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</div>
      {desc && <div className="text-xs text-slate-400 max-w-[200px]">{desc}</div>}
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-4 px-4 py-2 bg-[#34cc30] text-white text-xs font-medium rounded-lg hover:bg-[#28a824] transition"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

type ActiveFilter = "all" | "unread" | "mine" | "unassigned" | "disputed" | "whatsapp" | "web" | "urgent";

export default function UnifiedInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<ConvDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [search, setSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const loadConversations = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterAssignee !== "all") params.set("assignee", filterAssignee);
    if (filterUnread) params.set("unread", "1");
    if (search.trim()) params.set("q", search.trim());
    try {
      const r = await fetch(`/api/admin/conversations?${params.toString()}`, { cache: "no-store" });
      if (r.ok) setConversations(await r.json());
    } catch {}
    setLoadingList(false);
  }, [filterStatus, filterAssignee, filterUnread, search]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    fetch("/api/admin/staff-list").then(r => r.ok ? r.json() : []).then(setStaff).catch(() => {});
    fetch("/api/admin/quick-replies").then(r => r.ok ? r.json() : []).then(setQuickReplies).catch(() => {});
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.id) setCurrentAdminId(d.user.id);
    }).catch(() => {});
  }, []);

  const loadConversation = useCallback(async (id: number) => {
    setLoadingChat(true);
    try {
      const [d, m] = await Promise.all([
        fetch(`/api/admin/conversations/${id}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/conversations/${id}/messages`).then(r => r.ok ? r.json() : []),
      ]);
      setDetails(d);
      setMessages(m || []);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadByAdmin: 0 } : c));
    } catch {}
    setLoadingChat(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    if (selectedId) loadConversation(selectedId);
  }, [selectedId, loadConversation]);

  useEffect(() => {
    if (!selectedId) return;
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      fetch(`/api/conversations/${selectedId}/messages`).then(r => r.ok ? r.json() : []).then(setMessages).catch(() => {});
    }, 5000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [selectedId]);

  useEffect(() => {
    const t = setInterval(() => loadConversations(), 15000);
    return () => clearInterval(t);
  }, [loadConversations]);

  const send = async () => {
    if (!draft.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (r.ok) {
        setDraft("");
        const msgs = await fetch(`/api/conversations/${selectedId}/messages`).then(x => x.json());
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        const err = await r.json().catch(() => ({}));
        await alertDialog(err.error || "تعذر الإرسال", "danger", "خطأ");
      }
    } catch {
      await alertDialog("خطأ في الاتصال", "danger", "خطأ");
    }
    setSending(false);
  };

  const addNote = async () => {
    if (!noteDraft.trim() || !selectedId) return;
    try {
      const r = await fetch(`/api/admin/conversations/${selectedId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft.trim() }),
      });
      if (r.ok) {
        const note = await r.json();
        setDetails(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : prev);
        setNoteDraft("");
      }
    } catch {}
  };

  const updateConversation = async (patch: Record<string, any>) => {
    if (!selectedId) return;
    try {
      const r = await fetch(`/api/admin/conversations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (r.ok) {
        await loadConversation(selectedId);
        loadConversations();
      }
    } catch {}
  };

  const doAction = async (action: "close" | "escalate" | "block" | "dispute") => {
    if (!selectedId || actionLoading) return;
    setActionLoading(action);
    try {
      if (action === "close") {
        await updateConversation({ status: "completed" });
        await alertDialog("تم إغلاق المحادثة بنجاح", "success", "تم");
      } else if (action === "dispute") {
        const dr = await fetch("/api/admin/disputes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: selectedId }),
        });
        if (dr.ok) {
          await updateConversation({ status: "disputed" });
          await alertDialog("تم تحويل المحادثة إلى نزاع بنجاح", "success", "تم");
        } else {
          const errData = await dr.json().catch(() => ({}));
          await alertDialog(errData.error || "تعذر تحويل المحادثة إلى نزاع", "danger", "خطأ");
        }
      } else if (action === "block") {
        let userBlocked = true;
        if (details?.clientId) {
          const br = await fetch(`/api/admin/users/${details.clientId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBlocked: true }),
          });
          userBlocked = br.ok;
          if (!userBlocked) {
            await alertDialog("تعذر حظر المستخدم، يرجى المحاولة مرة أخرى", "danger", "خطأ");
          }
        }
        if (userBlocked) {
          await updateConversation({ status: "blocked" });
          await alertDialog("تم حظر المستخدم وإغلاق المحادثة", "success", "تم");
        }
      } else if (action === "escalate") {
        const er = await fetch(`/api/admin/conversations/${selectedId}/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "تصعيد يدوي من الإدارة" }),
        });
        if (er.ok) {
          await loadConversation(selectedId);
          await alertDialog("تم تصعيد المحادثة بنجاح", "success", "تم");
        } else {
          await alertDialog("تعذر تصعيد المحادثة", "danger", "خطأ");
        }
      }
    } catch {
      await alertDialog("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى", "danger", "خطأ");
    }
    setActionLoading(null);
  };

  const insertQuickReply = (q: QuickReply) => {
    setDraft(prev => (prev ? prev + "\n" : "") + q.body);
    setShowQuickReplies(false);
  };

  const counts = useMemo(() => {
    const c = { all: conversations.length, unread: 0, mine: 0, unassigned: 0, disputed: 0, whatsapp: 0, web: 0, urgent: 0 };
    conversations.forEach(x => {
      if (x.unreadByAdmin > 0) c.unread++;
      if (x.adminId && (currentAdminId ? x.adminId === currentAdminId : staff.some(s => s.id === x.adminId))) c.mine++;
      if (!x.adminId) c.unassigned++;
      if (x.status === "disputed") c.disputed++;
      if (x.channel === "whatsapp") c.whatsapp++;
      if (x.channel === "web") c.web++;
      if (x.status === "disputed" || x.unreadByAdmin > 0) c.urgent++;
    });
    return c;
  }, [conversations, staff, currentAdminId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (filterChannel !== "all" && c.channel !== filterChannel) return false;
      if (filterUrgent && !(c.status === "disputed" || c.unreadByAdmin > 0)) return false;
      return true;
    });
  }, [conversations, filterChannel, filterUrgent]);

  const activeFilter: ActiveFilter = useMemo(() => {
    if (filterUrgent) return "urgent";
    if (filterChannel === "whatsapp") return "whatsapp";
    if (filterChannel === "web") return "web";
    if (filterUnread) return "unread";
    if (filterAssignee === "me") return "mine";
    if (filterAssignee === "none") return "unassigned";
    if (filterStatus === "disputed") return "disputed";
    return "all";
  }, [filterStatus, filterAssignee, filterUnread, filterChannel, filterUrgent]);

  const setFilter = (f: ActiveFilter) => {
    setFilterStatus("all");
    setFilterAssignee("all");
    setFilterUnread(false);
    setFilterChannel("all");
    setFilterUrgent(false);
    if (f === "unread") setFilterUnread(true);
    else if (f === "mine") setFilterAssignee("me");
    else if (f === "unassigned") setFilterAssignee("none");
    else if (f === "disputed") setFilterStatus("disputed");
    else if (f === "whatsapp") setFilterChannel("whatsapp");
    else if (f === "web") setFilterChannel("web");
    else if (f === "urgent") setFilterUrgent(true);
  };

  const filterChips: { v: ActiveFilter; label: string; count?: number }[] = [
    { v: "all",        label: "الكل",        count: counts.all },
    { v: "unread",     label: "غير مقروء",   count: counts.unread },
    { v: "mine",       label: "لي",          count: counts.mine },
    { v: "unassigned", label: "غير مُعيّن",   count: counts.unassigned },
    { v: "disputed",   label: "نزاع",        count: counts.disputed },
    { v: "whatsapp",   label: "واتساب",      count: counts.whatsapp },
    { v: "web",        label: "موقع",        count: counts.web },
    { v: "urgent",     label: "⚡ عاجل" },
  ];

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* RIGHT: Conversation list */}
      <aside className="w-[320px] flex-shrink-0 border-l border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#34cc30]" />
              صندوق الوارد
            </h2>
            <button
              onClick={() => loadConversations()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم المحادثة أو اسم المستخدم..."
              className="w-full pr-9 pl-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {filterChips.map(t => (
              <button
                key={t.v}
                onClick={() => setFilter(t.v)}
                className={`text-xs px-2 py-1 rounded-lg border transition ${
                  activeFilter === t.v
                    ? "bg-[#34cc30] text-white border-[#34cc30]"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#34cc30]"
                }`}
              >
                {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="لا توجد محادثات"
              desc="لا توجد محادثات تطابق الفلتر الحالي"
              cta="إظهار الكل"
              onCta={() => setFilter("all")}
            />
          ) : (
            filteredConversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-right p-3 border-b border-slate-100 dark:border-slate-800 transition relative ${
                  selectedId === c.id
                    ? "bg-[#34cc30]/10 border-r-4 border-r-[#34cc30]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {c.unreadByAdmin > 0 && (
                  <span className="absolute top-3 left-3 inline-flex items-center justify-center w-5 h-5 bg-[#34cc30] text-white text-xs rounded-full font-bold">
                    {c.unreadByAdmin}
                  </span>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#485869] to-[#34cc30] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(c.clientName || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {c.clientName || "—"}
                      </div>
                      <div className="text-xs text-slate-400 flex-shrink-0">{timeAgo(c.lastMessageAt)}</div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      مع {c.freelancerName || "—"} · #{c.publicCode}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[c.status] || ""}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                      {c.channel && <ChannelBadge channel={c.channel} />}
                      {c.adminId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 truncate max-w-[80px]">
                          {c.adminName || "—"}
                        </span>
                      )}
                      {c.orderId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          طلب
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* CENTER: Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="font-medium text-slate-500 dark:text-slate-400">اختر محادثة لعرضها</p>
              <p className="text-sm text-slate-400 mt-1">سيظهر المحتوى هنا</p>
            </div>
          </div>
        ) : !details ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#34cc30]" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#485869] to-[#34cc30] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(details.clientName || "?")[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{details.clientName} ↔ {details.freelancerName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>#{details.publicCode}</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.5 rounded ${STATUS_COLORS[details.status]}`}>
                        {STATUS_LABELS[details.status]}
                      </span>
                      {details.channel && <ChannelBadge channel={details.channel} />}
                      {details.adminName && (
                        <>
                          <span>·</span>
                          <span>مُعيّنة لـ {details.adminName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select
                    value={details.adminId ?? ""}
                    onChange={e => updateConversation({ adminId: e.target.value || null })}
                    className="text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 max-w-[120px]"
                  >
                    <option value="">غير معيّنة</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`p-2 rounded-lg ${showNotes ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"}`}
                    title="ملاحظات داخلية"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowContextPanel(v => !v)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title={showContextPanel ? "إخفاء اللوحة الجانبية" : "إظهار اللوحة الجانبية"}
                  >
                    {showContextPanel ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => doAction("close")}
                  disabled={actionLoading === "close" || details.status === "completed"}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                >
                  {actionLoading === "close" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  إغلاق / حل
                </button>
                <button
                  onClick={() => doAction("escalate")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                >
                  {actionLoading === "escalate" ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                  تصعيد
                </button>
                <button
                  onClick={() => doAction("block")}
                  disabled={actionLoading === "block" || details.status === "blocked"}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                >
                  {actionLoading === "block" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                  حظر المستخدم
                </button>
                <button
                  onClick={() => doAction("dispute")}
                  disabled={actionLoading === "dispute" || details.status === "disputed"}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                >
                  {actionLoading === "dispute" ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                  تحويل لنزاع
                </button>
                <div className="mr-auto">
                  <select
                    value={details.status}
                    onChange={e => updateConversation({ status: e.target.value })}
                    className="text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="active">مفتوحة</option>
                    <option value="completed">مغلقة</option>
                    <option value="disputed">نزاع</option>
                    <option value="blocked">محظورة</option>
                    <option value="archived">مؤرشفة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes panel (collapsible) */}
            {showNotes && (
              <div className="px-4 py-3 border-b border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-950/20 max-h-60 overflow-y-auto">
                <div className="text-xs font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-1">
                  <StickyNote className="w-3 h-3" /> ملاحظات داخلية (لا يراها العميل ولا المستقل)
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addNote()}
                    placeholder="أضف ملاحظة..."
                    className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900/40 rounded-lg"
                  />
                  <button
                    onClick={addNote}
                    className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                  >
                    إضافة
                  </button>
                </div>
                <div className="space-y-1.5">
                  {details.notes.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-2">لا توجد ملاحظات</div>
                  ) : (
                    details.notes.map(n => (
                      <div key={n.id} className="bg-white dark:bg-slate-900 rounded-lg p-2 text-xs border border-yellow-100 dark:border-yellow-900/30">
                        <div className="text-slate-700 dark:text-slate-200">{n.reason}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.adminName} · {timeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              {loadingChat ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="لا توجد رسائل بعد"
                  desc="ابدأ المحادثة بإرسال رسالة للطرفين"
                />
              ) : (
                messages.map(m => {
                  const isAdmin = m.senderParty === "admin";
                  const isSystem = m.senderParty === "system";
                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center">
                        <span className="inline-block text-[11px] px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                          {m.bodyOriginal}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${
                        isAdmin
                          ? "bg-[#485869] text-white"
                          : m.senderParty === "client"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                          : "bg-[#34cc30]/10 text-slate-900 dark:text-white border border-[#34cc30]/30"
                      }`}>
                        <div className="text-[10px] opacity-70 mb-0.5">{PARTY_LABEL[m.senderParty] || m.senderParty}</div>
                        <div className="text-sm whitespace-pre-wrap break-words">{m.bodyOriginal}</div>
                        {m.hasLeak && (
                          <div className="text-[10px] mt-1 flex items-center gap-1 text-orange-300">
                            <ShieldAlert className="w-3 h-3" />
                            رصد محاولة تسريب ({m.leakSeverity})
                          </div>
                        )}
                        <div className="text-[10px] opacity-60 mt-1 text-left">{formatTime(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/30">
              {showQuickReplies && (
                <div className="mb-2 max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1">
                  {quickReplies.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-2">لا توجد ردود جاهزة</div>
                  ) : quickReplies.map(q => (
                    <button
                      key={q.id}
                      onClick={() => insertQuickReply(q)}
                      className="w-full text-right p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{q.title}</div>
                      <div className="text-xs text-slate-500 truncate">{q.body}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`p-2 rounded-lg ${showQuickReplies ? "bg-[#34cc30]/20 text-[#34cc30]" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"}`}
                  title="ردود جاهزة"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="اكتب رداً للعميل أو المستقل... (Enter للإرسال، Shift+Enter لسطر جديد)"
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg resize-none bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                />
                <button
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="px-4 py-2 bg-[#34cc30] text-white rounded-lg font-semibold hover:bg-[#28a824] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  إرسال
                </button>
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 px-1">
                ستظهر رسالتك للطرفين كرسالة من <strong>الإدارة</strong>
              </div>
            </div>
          </>
        )}
      </main>

      {/* LEFT: Context Panel */}
      {details && showContextPanel && (
        <aside className="w-[280px] flex-shrink-0 border-r border-slate-200 dark:border-slate-700 overflow-y-auto bg-slate-50 dark:bg-slate-800/20">
          <div className="p-4 space-y-4">
            {/* Conversation meta */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">معلومات المحادثة</div>
              <div className="space-y-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">الرقم</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200">#{details.publicCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">أنشئت</span>
                  <span className="text-slate-700 dark:text-slate-200">{timeAgo(details.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">آخر رسالة</span>
                  <span className="text-slate-700 dark:text-slate-200">{timeAgo(details.lastMessageAt)}</span>
                </div>
                {details.channel && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">القناة</span>
                    <ChannelBadge channel={details.channel} />
                  </div>
                )}
                {details.closedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">أُغلقت</span>
                    <span className="text-slate-700 dark:text-slate-200">{timeAgo(details.closedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <User className="w-3 h-3" /> العميل
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white">{details.clientName}</div>
                {details.clientEmail && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3 h-3" /> {details.clientEmail}
                  </div>
                )}
                {details.clientPhone && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3 h-3" /> {details.clientPhone}
                  </div>
                )}
                {details.clientCreatedAt && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" /> عضو منذ {timeAgo(details.clientCreatedAt)}
                  </div>
                )}
                {details.clientIsBlocked && (
                  <div className="flex items-center gap-1 text-red-600 font-semibold">
                    <Ban className="w-3 h-3" /> محظور
                  </div>
                )}
                <a
                  href={`/admin/users?id=${details.clientId}`}
                  className="text-[#34cc30] hover:underline text-[11px] flex items-center gap-1 mt-1"
                >
                  ملف كامل <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Freelancer */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <UsersIcon className="w-3 h-3" /> المستقل
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white">{details.freelancerName}</div>
                {details.freelancerEmail && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3 h-3" /> {details.freelancerEmail}
                  </div>
                )}
                {details.freelancerPhone && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3 h-3" /> {details.freelancerPhone}
                  </div>
                )}
                {details.freelancerCreatedAt && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" /> عضو منذ {timeAgo(details.freelancerCreatedAt)}
                  </div>
                )}
                {details.freelancerIsBlocked && (
                  <div className="flex items-center gap-1 text-red-600 font-semibold">
                    <Ban className="w-3 h-3" /> محظور
                  </div>
                )}
                <a
                  href={`/admin/users?id=${details.freelancerId}`}
                  className="text-[#34cc30] hover:underline text-[11px] flex items-center gap-1 mt-1"
                >
                  ملف كامل <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Order */}
            {details.order && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> الطلب المرتبط
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-mono text-slate-700 dark:text-slate-200">#{details.order.publicCode}</div>
                  <div className="text-slate-900 dark:text-white font-medium">{details.order.serviceTitle || "—"}</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الحالة</span>
                    <span className="text-slate-700 dark:text-slate-200">{details.order.status}</span>
                  </div>
                  {details.order.amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">المبلغ</span>
                      <span className="font-semibold text-[#34cc30]">{details.order.amount} ر.س</span>
                    </div>
                  )}
                  <a
                    href={`/admin/orders?id=${details.order.id}`}
                    className="text-[#34cc30] hover:underline text-[11px] flex items-center gap-1 mt-1"
                  >
                    تفاصيل الطلب <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Ticket history */}
            {details.ticketHistory && details.ticketHistory.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> سجل التذاكر ({details.ticketHistory.length})
                </div>
                <div className="space-y-1.5">
                  {details.ticketHistory.map(tk => (
                    <div key={tk.id} className="text-xs bg-slate-50 dark:bg-slate-700/50 rounded p-2 border border-slate-100 dark:border-slate-600">
                      <div className="font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{tk.subject}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-slate-400">{timeAgo(tk.createdAt)}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tk.status === "resolved" ? "bg-green-100 text-green-600" : tk.status === "open" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                          {tk.status === "resolved" ? "مغلقة" : tk.status === "open" ? "جديدة" : "قيد المعالجة"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick notes summary */}
            {details.notes.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-900/30">
                <div className="text-xs font-bold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-1">
                  <StickyNote className="w-3 h-3" /> ملاحظات ({details.notes.length})
                </div>
                <div className="text-xs text-yellow-800 dark:text-yellow-200 line-clamp-2">
                  {details.notes[0].reason}
                </div>
                {details.notes.length > 1 && (
                  <button onClick={() => setShowNotes(true)} className="text-[11px] text-yellow-600 dark:text-yellow-400 mt-1 hover:underline">
                    +{details.notes.length - 1} ملاحظات أخرى
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
