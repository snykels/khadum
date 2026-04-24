'use client';

import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";

type Msg = {
  id: number;
  conversationId: number;
  senderParty: string;
  senderId: number | null;
  messageType: string;
  bodyOriginal: string | null;
  bodyRedacted: string | null;
  hasLeak: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  leakSeverity: string | null;
  createdAt: string;
};

interface Props {
  conversationId: number;
  myParty: "client" | "freelancer" | "admin";
  conversationStatus?: string;
  onAfterSend?: () => void;
}

const partyLabel: Record<string, string> = {
  client: "العميل",
  freelancer: "المستقل",
  admin: "الإدارة",
  system: "النظام",
};

const partyColor: Record<string, string> = {
  client: "bg-blue-500",
  freelancer: "bg-[#34cc30]",
  admin: "bg-purple-500",
  system: "bg-gray-500",
};

export default function ChatView({ conversationId, myParty, conversationStatus, onAfterSend }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setMsgs([]);
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((j) => Array.isArray(j) && setMsgs(j))
      .finally(() => setLoading(false));
  }, [conversationId]);

  // SSE subscription
  useEffect(() => {
    if (typeof window === "undefined") return;
    const es = new EventSource(`/api/conversations/${conversationId}/stream`);
    sseRef.current = es;
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message" && data.message) {
          setMsgs((prev) => {
            if (prev.find((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      } catch {}
    };
    return () => {
      es.close();
      sseRef.current = null;
    };
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    setWarn(null);
    try {
      const r = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const j = await r.json();
      if (!r.ok) {
        setWarn(j?.error || "فشل الإرسال");
      } else {
        setInput("");
        if (j.leak?.blocked) setWarn(`⛔ تم حجب الرسالة: ${j.leak.severity}`);
        else if (j.leak) setWarn(`⚠️ تم رصد محاولة تواصل خارجي وتم إخفاؤها`);
        if (j.message) setMsgs((prev) => prev.find((m) => m.id === j.message.id) ? prev : [...prev, j.message]);
        onAfterSend?.();
      }
    } catch (e: any) {
      setWarn(e.message || "خطأ");
    } finally {
      setSending(false);
    }
  };

  const closed = conversationStatus === "blocked" || conversationStatus === "archived";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1d24]">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          <span className="text-gray-500">{connected ? "متصل (مباشر)" : "غير متصل"}</span>
        </div>
        {conversationStatus && (
          <span className="text-gray-500">الحالة: {conversationStatus}</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#111318]">
        {loading && <div className="text-center text-gray-500 py-8"><Loader2 className="animate-spin inline" /></div>}
        {!loading && msgs.length === 0 && (
          <div className="text-center text-gray-400 py-8">لا توجد رسائل بعد. ابدأ المحادثة.</div>
        )}
        {msgs.map((m) => {
          const mine = m.senderParty === myParty;
          const text = m.bodyOriginal || m.bodyRedacted || "[تم أرشفة المحتوى]";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className={`px-1.5 py-0.5 rounded text-white text-[9px] ${partyColor[m.senderParty] || "bg-gray-400"}`}>
                    {partyLabel[m.senderParty] || m.senderParty}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleString("ar", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</span>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    m.isBlocked
                      ? "bg-red-100 text-red-700 border border-red-300 italic"
                      : mine
                      ? "bg-[#34cc30] text-white"
                      : m.senderParty === "admin"
                      ? "bg-purple-100 text-purple-900"
                      : "bg-white dark:bg-[#222631] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {m.isBlocked ? (
                    <span className="flex items-center gap-1.5"><ShieldAlert size={14} /> {m.blockedReason || "تم حجب الرسالة"}</span>
                  ) : (
                    <>
                      {m.hasLeak && !mine && myParty !== "admin" && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 mb-1"><AlertTriangle size={10} /> تم إخفاء معلومات تواصل</div>
                      )}
                      {text}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {warn && (
        <div className="px-4 py-2 text-xs bg-orange-50 text-orange-700 border-t border-orange-200">{warn}</div>
      )}

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2 bg-white dark:bg-[#1a1d24]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={closed ? "المحادثة مغلقة" : "اكتب رسالة... (Enter للإرسال)"}
          disabled={closed || sending}
          rows={1}
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#222631] resize-none focus:ring-2 focus:ring-[#34cc30]/30 outline-none disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={closed || sending || !input.trim()}
          className="bg-[#34cc30] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#2ab826] disabled:opacity-40 flex items-center gap-1"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
