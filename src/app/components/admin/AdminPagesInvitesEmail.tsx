'use client';

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Copy, Mail, Eye, Send, Save, Type, AlignLeft, Square, Image as ImageIcon, Minus, MoveVertical, Code, ArrowUp, ArrowDown, Bold, Italic, Underline, Link as LinkIcon, Sparkles } from "lucide-react";
import { confirmDialog } from "../ui/confirmBus";
import { KHADOM_BLOCK_PRESETS } from "@/lib/blocks/emailKhadom";

// ============== INVITES ==============
export function InvitesPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState(14);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/invites");
    const d = await r.json();
    setInvites(d.invites || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setCreating(true); setMsg("");
    const r = await fetch("/api/admin/invites", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || null, note: note || null, expiresInDays: days }),
    });
    const d = await r.json();
    if (r.ok) { setEmail(""); setNote(""); setMsg("تم إنشاء الدعوة"); load(); } else setMsg(d.error || "فشل");
    setCreating(false);
  }

  async function del(id: number) {
    if (!(await confirmDialog({ message: "حذف هذه الدعوة؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return;
    await fetch(`/api/admin/invites?id=${id}`, { method: "DELETE" });
    load();
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/apply?invite=${token}`;
    navigator.clipboard.writeText(link);
    setMsg("تم نسخ الرابط");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">دعوات التسجيل</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">عند تفعيل وضع "بدعوة فقط" يجب على المتقدم استخدام رابط دعوة صالح من هنا.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold mb-4 dark:text-white">إنشاء دعوة جديدة</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="بريد المدعو (اختياري)" dir="ltr" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة (اختياري)" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
          <input type="number" min={1} max={365} value={days} onChange={e => setDays(Number(e.target.value))} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" placeholder="أيام الصلاحية" />
          <button onClick={create} disabled={creating} className="bg-[#34cc30] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2eb829] disabled:opacity-50 flex items-center justify-center gap-2"><Plus size={16} /> إنشاء</button>
        </div>
        {msg && <p className="text-xs text-[#34cc30] mt-2">{msg}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
        ) : invites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد دعوات</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-right">الرمز</th>
                <th className="px-4 py-3 text-right">البريد</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">انتهاء</th>
                <th className="px-4 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {invites.map((inv: any) => {
                const expired = inv.expires_at && new Date(inv.expires_at) < new Date();
                const status = inv.used_at ? "مستخدمة" : expired ? "منتهية" : "نشطة";
                const color = inv.used_at ? "bg-gray-100 text-gray-600" : expired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
                return (
                  <tr key={inv.id} className="dark:text-gray-200">
                    <td className="px-4 py-3 font-mono text-xs">{inv.token.slice(0, 16)}…</td>
                    <td className="px-4 py-3" dir="ltr">{inv.email || "—"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${color}`}>{status}</span></td>
                    <td className="px-4 py-3 text-xs">{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString("ar-SA") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => copyLink(inv.token)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded" title="نسخ الرابط"><Copy size={14} /></button>
                        <button onClick={() => del(inv.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded" title="حذف"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============== EMAIL TEMPLATES (BLOCK EDITOR) ==============
type Block =
  | { id: string; type: "heading"; text: string; level?: 1 | 2 | 3; align?: "right" | "center" | "left" }
  | { id: string; type: "text"; html: string; align?: "right" | "center" | "left" }
  | { id: string; type: "button"; text: string; url: string; bg?: string; color?: string; align?: "right" | "center" | "left" }
  | { id: string; type: "image"; src: string; alt?: string; width?: number; align?: "right" | "center" | "left" }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; height?: number }
  | { id: string; type: "html"; html: string }
  | { id: string; type: string; [k: string]: any };

const BLOCK_PALETTE: Array<{ type: Block["type"]; label: string; icon: any }> = [
  { type: "heading", label: "عنوان", icon: Type },
  { type: "text", label: "نص", icon: AlignLeft },
  { type: "button", label: "زر", icon: Square },
  { type: "image", label: "صورة", icon: ImageIcon },
  { type: "divider", label: "فاصل", icon: Minus },
  { type: "spacer", label: "مسافة", icon: MoveVertical },
  { type: "html", label: "HTML", icon: Code },
];

const newBlock = (type: Block["type"]): Block => {
  const id = Math.random().toString(36).slice(2, 9);
  switch (type) {
    case "heading": return { id, type, text: "عنوان جديد", level: 2, align: "right" };
    case "text": return { id, type, html: "اكتب النص هنا...", align: "right" };
    case "button": return { id, type, text: "اضغط هنا", url: "{{link}}", bg: "#34cc30", color: "#ffffff", align: "center" };
    case "image": return { id, type, src: "", alt: "", width: 400, align: "center" };
    case "divider": return { id, type };
    case "spacer": return { id, type, height: 20 };
    case "html": return { id, type, html: "<p></p>" };
    default: return { id, type } as Block;
  }
};

function RichTextToolbar({ onCmd }: { onCmd: (c: string, v?: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
      <button type="button" onClick={() => onCmd("bold")} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="غامق"><Bold size={14} /></button>
      <button type="button" onClick={() => onCmd("italic")} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="مائل"><Italic size={14} /></button>
      <button type="button" onClick={() => onCmd("underline")} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="تسطير"><Underline size={14} /></button>
      <button type="button" onClick={() => { const u = prompt("الرابط:"); if (u) onCmd("createLink", u); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="رابط"><LinkIcon size={14} /></button>
    </div>
  );
}

function BlockEditorItem({ block, onChange, onDelete, onMove }: { block: Block; onChange: (b: Block) => void; onDelete: () => void; onMove: (dir: "up" | "down") => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase">{block.type}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => onMove("up")} className="p-1 text-gray-400 hover:text-[#485869] dark:hover:text-white"><ArrowUp size={14} /></button>
          <button type="button" onClick={() => onMove("down")} className="p-1 text-gray-400 hover:text-[#485869] dark:hover:text-white"><ArrowDown size={14} /></button>
          <button type="button" onClick={onDelete} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
        </div>
      </div>

      {block.type === "heading" && (
        <div className="space-y-2">
          <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
          <div className="flex gap-2 text-xs">
            <select value={block.level || 2} onChange={e => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-2 py-1">
              <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
            </select>
            <select value={block.align || "right"} onChange={e => onChange({ ...block, align: e.target.value as any })} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-2 py-1">
              <option value="right">يمين</option><option value="center">وسط</option><option value="left">يسار</option>
            </select>
          </div>
        </div>
      )}

      {block.type === "text" && (
        <div>
          <RichTextToolbar onCmd={(c, v) => { document.execCommand(c, false, v); if (editorRef.current) onChange({ ...block, html: editorRef.current.innerHTML }); }} />
          <div ref={editorRef} contentEditable suppressContentEditableWarning onBlur={e => onChange({ ...block, html: (e.target as HTMLDivElement).innerHTML })} className="min-h-[80px] border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" dangerouslySetInnerHTML={{ __html: block.html }} dir={block.align === "left" ? "ltr" : "rtl"} />
          <select value={block.align || "right"} onChange={e => onChange({ ...block, align: e.target.value as any })} className="mt-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-2 py-1 text-xs">
            <option value="right">يمين</option><option value="center">وسط</option><option value="left">يسار</option>
          </select>
        </div>
      )}

      {block.type === "button" && (
        <div className="grid grid-cols-2 gap-2">
          <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="نص الزر" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
          <input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="الرابط (مثال: {{link}})" dir="ltr" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-xs">لون الخلفية:<input type="color" value={block.bg || "#34cc30"} onChange={e => onChange({ ...block, bg: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-xs">لون النص:<input type="color" value={block.color || "#ffffff"} onChange={e => onChange({ ...block, color: e.target.value })} /></label>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <input value={block.src} onChange={e => onChange({ ...block, src: e.target.value })} placeholder="رابط الصورة" dir="ltr" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input value={block.alt || ""} onChange={e => onChange({ ...block, alt: e.target.value })} placeholder="نص بديل" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
            <input type="number" value={block.width || 400} onChange={e => onChange({ ...block, width: Number(e.target.value) })} placeholder="العرض px" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-sm" />
          </div>
          {block.src && <img src={block.src} alt={block.alt} style={{ maxWidth: 200 }} className="rounded border" />}
        </div>
      )}

      {block.type === "spacer" && (
        <div className="flex items-center gap-2"><label className="text-sm">الارتفاع px:</label><input type="number" value={block.height || 20} onChange={e => onChange({ ...block, height: Number(e.target.value) })} className="w-24 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-1 text-sm" /></div>
      )}

      {block.type === "html" && (
        <textarea value={block.html} onChange={e => onChange({ ...block, html: e.target.value })} rows={6} dir="ltr" className="w-full font-mono text-xs border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2" />
      )}

      {block.type === "divider" && <div className="border-t-2 border-dashed border-gray-300" />}

      {String(block.type).startsWith("k_") && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#0F5132] font-semibold"><Sparkles size={14} /> كتلة خدوم — حرّر الحقول كـ JSON</div>
          <textarea
            defaultValue={JSON.stringify(block, null, 2)}
            onBlur={e => { try { const j = JSON.parse(e.target.value); onChange({ ...j, id: block.id }); } catch { /* keep editing */ } }}
            rows={Math.min(20, Math.max(6, JSON.stringify(block, null, 2).split("\n").length))}
            dir="ltr"
            className="w-full font-mono text-xs border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2"
          />
          <p className="text-[10px] text-gray-500">احفظ التغييرات بالنقر خارج الصندوق. الحقول المتاحة موضّحة في القالب الافتراضي.</p>
        </div>
      )}
    </div>
  );
}

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/email-templates");
    const d = await r.json();
    setTemplates(d.templates || []);
    if (d.templates?.length) {
      const slug = selected?.slug || d.templates[0].slug;
      const r2 = await fetch(`/api/admin/email-templates?slug=${encodeURIComponent(slug)}`);
      const d2 = await r2.json();
      if (d2.template) setSelected(d2.template);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function selectTpl(slug: string) {
    const r = await fetch(`/api/admin/email-templates?slug=${encodeURIComponent(slug)}`);
    const d = await r.json();
    if (d.template) setSelected(d.template);
  }

  function getBlocks(t: any): Block[] {
    if (!t) return [];
    return Array.isArray(t.blocks) ? t.blocks : [];
  }

  function setBlocks(blocks: Block[]) {
    setSelected({ ...selected, blocks });
  }

  async function save() {
    if (!selected) return;
    setMsg("جاري الحفظ...");
    const variables = typeof selected.variables === "string"
      ? selected.variables.split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(selected.variables) ? selected.variables : [];
    const r = await fetch("/api/admin/email-templates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id, slug: selected.slug, name: selected.name, subject: selected.subject,
        blocks: getBlocks(selected), variables, isActive: selected.isActive !== false,
      }),
    });
    if (r.ok) { setMsg("تم الحفظ"); load(); } else setMsg("فشل الحفظ");
    setTimeout(() => setMsg(""), 2500);
  }

  async function preview() {
    if (!selected) return;
    const r = await fetch("/api/admin/email-templates/preview", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: getBlocks(selected), subject: selected.subject }),
    });
    const d = await r.json();
    setPreviewHtml(d.html || "");
  }

  async function sendTest() {
    if (!selected || !testEmail) return;
    setMsg("جاري الإرسال...");
    const r = await fetch("/api/admin/email-templates/preview", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: getBlocks(selected), subject: selected.subject, sendTo: testEmail }),
    });
    setMsg(r.ok ? "تم إرسال البريد التجريبي" : "فشل الإرسال");
    setTimeout(() => setMsg(""), 3000);
  }

  function addBlock(type: Block["type"]) { setBlocks([...getBlocks(selected), newBlock(type)]); }
  function updateBlock(idx: number, b: Block) { const arr = [...getBlocks(selected)]; arr[idx] = b; setBlocks(arr); }
  function deleteBlock(idx: number) { setBlocks(getBlocks(selected).filter((_, i) => i !== idx)); }
  function moveBlock(idx: number, dir: "up" | "down") {
    const arr = [...getBlocks(selected)];
    const j = dir === "up" ? idx - 1 : idx + 1;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setBlocks(arr);
  }

  async function newTpl() {
    const slug = prompt("معرّف القالب (slug بالإنجليزية، مثل: welcome_email):");
    if (!slug) return;
    const name = prompt("اسم القالب:") || slug;
    const r = await fetch("/api/admin/email-templates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, subject: "موضوع البريد", blocks: [], variables: ["name", "link"], isActive: true }),
    });
    if (r.ok) { await load(); selectTpl(slug); }
  }

  const blocks = selected ? getBlocks(selected) : [];
  const variablesStr = selected
    ? (typeof selected.variables === "string" ? selected.variables : Array.isArray(selected.variables) ? selected.variables.join(",") : "")
    : "";

  const isRawMode = blocks.length === 1 && blocks[0].type === "html";
  const rawHtml = isRawMode ? (blocks[0] as any).html : "";

  function toggleRawMode() {
    if (!selected) return;
    if (isRawMode) {
      setBlocks([{ id: "h", type: "heading", text: "عنوان جديد", level: 2, align: "right" }]);
    } else {
      const html = blocks.map(b => {
        if (b.type === "heading") return `<h${b.level || 2} style="text-align:${b.align || "right"}">${b.text}</h${b.level || 2}>`;
        if (b.type === "text") return `<div style="text-align:${b.align || "right"}">${b.html}</div>`;
        if (b.type === "button") return `<p style="text-align:${b.align || "center"}"><a href="${b.url}" style="background:${b.bg || "#34cc30"};color:${b.color || "#fff"};padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">${b.text}</a></p>`;
        if (b.type === "image") return `<p style="text-align:${b.align || "center"}"><img src="${b.src}" alt="${b.alt || ""}" style="max-width:${b.width || 400}px"/></p>`;
        if (b.type === "divider") return `<hr/>`;
        if (b.type === "spacer") return `<div style="height:${b.height || 16}px"></div>`;
        if (b.type === "html") return b.html;
        return "";
      }).join("\n");
      setBlocks([{ id: "raw", type: "html", html: html || "<p>اكتب HTML الإيميل بالكامل هنا. يمكنك استخدام {{name}}, {{link}}, {{site_name}} وأي متغيرات أخرى عرّفتها أعلاه.</p>" }]);
    }
  }

  function setRawHtml(v: string) {
    setBlocks([{ id: "raw", type: "html", html: v }]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">قوالب البريد الإلكتروني</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">محرر قوالب احترافي بكتل مرنة. استخدم المتغيرات بالشكل <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{name}}"}</code></p>
        </div>
        <button onClick={newTpl} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16} /> قالب جديد</button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          {loading ? <div className="text-gray-500 text-sm p-2">...</div> : templates.map((t: any) => (
            <button key={t.id} onClick={() => selectTpl(t.slug)} className={`w-full text-right px-3 py-2 rounded-lg text-sm mb-1 ${selected?.id === t.id ? "bg-[#34cc30]/10 text-[#34cc30] font-semibold" : "hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"}`}>
              <div className="flex items-center gap-2"><Mail size={14} />{t.name}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{t.slug}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selected && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} placeholder="اسم القالب" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                  <input value={selected.slug} readOnly placeholder="slug" dir="ltr" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 rounded-lg px-3 py-2 text-sm bg-gray-50" />
                </div>
                <input value={selected.subject || ""} onChange={e => setSelected({ ...selected, subject: e.target.value })} placeholder="موضوع البريد" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                <input value={variablesStr} onChange={e => setSelected({ ...selected, variables: e.target.value })} placeholder="المتغيرات (مفصولة بفاصلة، مثل: name,link,site_name)" dir="ltr" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs font-mono" />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isRawMode && <span className="text-xs text-gray-500 dark:text-gray-400 self-center">كتل أولية:</span>}
                    {!isRawMode && BLOCK_PALETTE.map(p => (
                      <button key={p.type} onClick={() => addBlock(p.type)} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-[#34cc30]/10 hover:text-[#34cc30] text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs">
                        <p.icon size={14} /> {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!isRawMode && (
                <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-dashed border-[#0F5132]/30">
                  <span className="text-xs text-[#0F5132] font-bold self-center flex items-center gap-1"><Sparkles size={12} /> كتل خدوم (10):</span>
                  {KHADOM_BLOCK_PRESETS.map(p => (
                    <button key={p.type} onClick={() => { const id = Math.random().toString(36).slice(2,9); setBlocks([...getBlocks(selected), { id, ...(p.preset as any) }]); }} className="bg-[#0F5132]/10 hover:bg-[#0F5132] hover:text-white text-[#0F5132] dark:text-[#25D366] dark:hover:bg-[#0F5132] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#0F5132]/20">
                      {p.label}
                    </button>
                  ))}
                </div>
                )}
                <div className="flex justify-end mb-3">
                  <button onClick={toggleRawMode} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isRawMode ? "bg-[#485869] text-white" : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50 hover:bg-amber-100"}`}>
                    <Code size={14} /> {isRawMode ? "العودة إلى الكتل" : "وضع HTML خام"}
                  </button>
                </div>
                {isRawMode ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">تحرير HTML كامل للإيميل. سيتم تطبيق المتغيرات تلقائياً ({"{{name}}, {{link}}, {{site_name}}, ..."}).</p>
                    <textarea value={rawHtml} onChange={e => setRawHtml(e.target.value)} rows={20} dir="ltr" className="w-full font-mono text-xs border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" spellCheck={false} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blocks.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">لا توجد كتل بعد — أضف من الأعلى أو فعّل وضع HTML خام</p>}
                    {blocks.map((b, i) => (
                      <BlockEditorItem key={b.id} block={b} onChange={nb => updateBlock(i, nb)} onDelete={() => deleteBlock(i)} onMove={dir => moveBlock(i, dir)} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-wrap items-center gap-3">
                <button onClick={save} className="bg-[#485869] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3a4756] flex items-center gap-2"><Save size={14} /> حفظ</button>
                <button onClick={preview} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"><Eye size={14} /> معاينة</button>
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="بريد للاختبار" dir="ltr" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]" />
                <button onClick={sendTest} disabled={!testEmail} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2eb829] disabled:opacity-50 flex items-center gap-2"><Send size={14} /> إرسال تجريبي</button>
                {msg && <span className="text-xs text-gray-600 dark:text-gray-300">{msg}</span>}
              </div>

              {previewHtml && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h3 className="font-semibold mb-3 dark:text-white">المعاينة</h3>
                  <iframe srcDoc={previewHtml} className="w-full h-[500px] border border-gray-200 rounded-lg bg-white" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
