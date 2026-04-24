'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import {
  ArrowRight, Save, Eye, Globe, Tag, Image as ImageIcon, Trash2,
  Loader2, Check, AlertCircle, Search, Upload, Link2, FileText, BookOpen,
  Layers, Type, ToggleLeft, ToggleRight, Megaphone,
} from "lucide-react";

const RichEditor = dynamicImport(() => import("@/app/components/admin/RichEditor"), {
  ssr: false,
  loading: () => <div className="border border-border rounded-lg bg-muted/20 animate-pulse h-[600px]" />,
});

const BlockEditor = dynamicImport(() => import("@/app/components/admin/BlockEditor"), {
  ssr: false,
  loading: () => <div className="rounded-xl animate-pulse h-[600px]" style={{ background: "#1e1e1e" }} />,
});

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  author?: string;
  views?: number;
  updatedAt?: string;
  createdAt?: string;
}

const TYPE_CONFIG = {
  page: {
    label: "صفحة",
    icon: FileText,
    apiList: "/api/admin/pages",
    apiSingle: "/api/admin/pages",
    listKey: "page" as const,
    backTab: "pages",
    previewBase: "/p/",
    showAuthor: false,
    requireSlug: true,
    singleton: false,
    hideMeta: false,
  },
  blog: {
    label: "مقال",
    icon: BookOpen,
    apiList: "/api/admin/blog",
    apiSingle: "/api/admin/blog",
    listKey: "post" as const,
    backTab: "blog",
    previewBase: "/blog/",
    showAuthor: true,
    requireSlug: false,
    singleton: false,
    hideMeta: false,
  },
  landing: {
    label: "الصفحة الرئيسية",
    icon: Megaphone,
    apiList: "/api/admin/landing-content",
    apiSingle: "/api/admin/landing-content",
    listKey: "landing" as const,
    backTab: "landing",
    previewBase: "/",
    showAuthor: false,
    requireSlug: false,
    singleton: true,
    hideMeta: true,
  },
} as const;

type EditorType = keyof typeof TYPE_CONFIG;
type EditorMode = "blocks" | "richtext" | "legacy";

function slugify(s: string) {
  return s.trim().toLowerCase()
    .replace(/[\s\u0600-\u06ff]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function detectEditorMode(content: string): EditorMode {
  if (!content) return "blocks";
  try {
    const j = JSON.parse(content);
    if (j && Array.isArray(j.blocks)) {
      if (j.blocks.length === 0) return "blocks";
      const first = j.blocks[0];
      if (first && typeof first.type === "string") {
        if (first.type.startsWith("w_")) return "legacy";
        return "blocks";
      }
    }
    if (Array.isArray(j) && j.length > 0) {
      const first = j[0];
      if (first && typeof first.type === "string" && first.type.startsWith("w_")) {
        return "legacy";
      }
    }
  } catch {}
  return "richtext";
}

export default function EditorPageClient({ type, id }: { type: string; id: string }) {
  const router = useRouter();
  const isNew = id === "new";
  const cfg = TYPE_CONFIG[type as EditorType];

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [editorMode, setEditorMode] = useState<EditorMode>("blocks");

  const [data, setData] = useState<PageData>({
    id: 0,
    title: "",
    slug: "",
    content: "",
    status: "draft",
    excerpt: "",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    author: "فريق خدوم",
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cfg) return;
    if (cfg.singleton) {
      (async () => {
        try {
          const r = await fetch(cfg.apiSingle, { cache: "no-store" });
          if (!r.ok) { setError("تعذّر تحميل البيانات"); setLoading(false); return; }
          const j = await r.json();
          const content: string = typeof j.content === "string" ? j.content : "";
          setData(d => ({ ...d, id: 1, title: cfg.label, content, status: "published" }));
          setEditorMode(detectEditorMode(content));
        } catch { setError("خطأ في الاتصال"); }
        setLoading(false);
      })();
      return;
    }
    if (isNew) return;
    (async () => {
      try {
        const r = await fetch(`${cfg.apiSingle}/${id}`, { cache: "no-store" });
        if (!r.ok) { setError("تعذّر تحميل البيانات"); setLoading(false); return; }
        const j = await r.json();
        const item = j[cfg.listKey];
        if (item) {
          const loadedData: PageData = {
            id: item.id,
            title: item.title || "",
            slug: item.slug || "",
            content: item.content || "",
            status: item.status || "draft",
            excerpt: item.excerpt || "",
            coverImage: item.coverImage || "",
            metaTitle: item.metaTitle || "",
            metaDescription: item.metaDescription || "",
            metaKeywords: item.metaKeywords || "",
            ogImage: item.ogImage || "",
            author: item.author || "فريق خدوم",
            views: item.views,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt,
          };
          setData(loadedData);
          setEditorMode(detectEditorMode(loadedData.content));
        }
      } catch { setError("خطأ في الاتصال"); }
      setLoading(false);
    })();
  }, [id, isNew, cfg]);

  const save = useCallback(async (publishStatus?: "draft" | "published") => {
    if (!cfg) return;
    if (cfg.singleton) {
      setError("");
      setSaving(true);
      try {
        const r = await fetch(cfg.apiSingle, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data.content }),
        });
        if (r.ok) {
          setSavedAt(new Date());
        } else {
          const j = await r.json().catch(() => ({}));
          setError(j.error || "فشل الحفظ");
        }
      } catch { setError("فشل الاتصال"); }
      setSaving(false);
      return;
    }

    if (!data.title.trim()) { setError("العنوان مطلوب"); return; }
    if (cfg.requireSlug && !data.slug.trim()) { setError("الرابط مطلوب"); return; }

    setError("");
    setSaving(true);
    const body = { ...data, status: publishStatus || data.status };

    try {
      const url = isNew ? cfg.apiList : `${cfg.apiSingle}/${data.id || id}`;
      const method = isNew ? "POST" : "PATCH";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setSavedAt(new Date());
        if (publishStatus) setData(d => ({ ...d, status: publishStatus }));
        if (isNew && j.id) {
          router.replace(`/admin/editor/${type}/${j.id}`);
        }
      } else {
        setError(j.error || "فشل الحفظ");
      }
    } catch { setError("فشل الاتصال"); }
    setSaving(false);
  }, [data, isNew, cfg, type, id, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const onTitleChange = (v: string) => {
    setData(d => {
      const next = { ...d, title: v };
      if (cfg.requireSlug && (!d.slug || d.slug === slugify(d.title))) {
        next.slug = slugify(v);
      }
      return next;
    });
  };

  const uploadFile = async (file: File, field: "coverImage" | "ogImage") => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok && j.url) setData(d => ({ ...d, [field]: j.url }));
    } catch {}
  };

  const switchMode = (newMode: EditorMode) => {
    if (newMode === editorMode) return;
    const msg = newMode === "richtext"
      ? "التحويل إلى المحرر النصي سيُفقد تنسيق بلوكات Editor.js. هل تريد المتابعة؟"
      : "التحويل إلى محرر البلوكات سيُفقد محتوى HTML الحالي. هل تريد المتابعة؟";
    if (data.content && !confirm(msg)) return;
    setData(d => ({ ...d, content: "" }));
    setEditorMode(newMode);
  };

  if (!cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          نوع غير معروف
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#34cc30]" />
      </div>
    );
  }

  const Icon = cfg.icon;
  const previewUrl = type === "blog" ? `${cfg.previewBase}${data.id || ""}` : `${cfg.previewBase}${data.slug}`;

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ fontFamily: "var(--font-tajawal), Tahoma, sans-serif" }}>
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#1a1d24] border-b border-border px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push(`/admin?section=content&tab=${cfg.backTab}`)}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground transition"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </button>
            <Icon className="text-[#34cc30] shrink-0" size={20} />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{isNew ? `${cfg.label} جديد` : `تعديل ${cfg.label}`}</div>
              <h1 className="font-bold text-foreground truncate text-sm sm:text-base">
                {data.title || `بدون عنوان`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saving ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> جارٍ الحفظ...
              </span>
            ) : savedAt ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-green-600">
                <Check size={14} /> محفوظ {savedAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : null}

            {(cfg.singleton || (!isNew && data.status === "published")) && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition"
                title="فتح في تبويب جديد"
              >
                <Eye size={15} /> <span className="hidden sm:inline">معاينة</span>
              </a>
            )}

            {!cfg.singleton && (
              <button
                onClick={() => save("draft")}
                disabled={saving || editorMode === "legacy"}
                title={editorMode === "legacy" ? "محتوى قديم — التحرير معطّل" : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Save size={15} /> <span className="hidden sm:inline">حفظ مسودة</span>
              </button>
            )}

            <button
              onClick={() => save(cfg.singleton ? undefined : "published")}
              disabled={saving || editorMode === "legacy"}
              title={editorMode === "legacy" ? "محتوى قديم — التحرير معطّل" : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#34cc30] text-white rounded-md hover:bg-[#2ab327] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {cfg.singleton ? <Save size={15} /> : <Globe size={15} />}
              <span className="hidden sm:inline">{cfg.singleton ? "حفظ" : "نشر"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-[1600px] mx-auto mt-2 px-3 py-2 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}
      </header>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6">
        <div className={`grid gap-6 ${cfg.hideMeta ? "" : "lg:grid-cols-[1fr_360px]"}`}>
          {/* Main editor area */}
          <main className="space-y-4 min-w-0">
            {/* Title input */}
            {!cfg.hideMeta && (
              <input
                type="text"
                value={data.title}
                onChange={e => onTitleChange(e.target.value)}
                placeholder={`عنوان ${cfg.label}...`}
                className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/40 px-1"
              />
            )}

            {/* Slug */}
            {!cfg.hideMeta && (cfg.requireSlug || data.slug) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 size={14} />
                <span>الرابط:</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{cfg.previewBase}</span>
                <input
                  type="text"
                  value={data.slug}
                  onChange={e => setData(d => ({ ...d, slug: slugify(e.target.value) }))}
                  className="flex-1 text-xs font-mono bg-transparent border-b border-dashed border-border focus:outline-none focus:border-[#34cc30] px-1"
                  placeholder={cfg.requireSlug ? "my-page-url" : "(اختياري)"}
                />
              </div>
            )}

            {/* Tabs */}
            {!cfg.hideMeta && (
              <div className="flex border-b border-border">
                {([
                  { id: "content", label: "المحتوى" },
                  { id: "seo", label: "تحسين محركات البحث" },
                  { id: "settings", label: "الإعدادات" },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                      activeTab === tab.id
                        ? "border-[#34cc30] text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content tab */}
            {activeTab === "content" && (
              <div className="space-y-3">
                {editorMode === "legacy" ? (
                  <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertCircle size={18} />
                      <h3 className="font-bold">محتوى بصيغة قديمة (Site Builder)</h3>
                    </div>
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      هذه الصفحة تستخدم بلوكات الموقع القديمة (<code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">w_*</code>).
                      لتجنّب فقدان البيانات، تم تعطيل التحرير هنا.
                      افتح هذه الصفحة في محرر بلوكات الموقع القديم، أو ابدأ من جديد بمحتوى Editor.js.
                    </p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-amber-800 dark:text-amber-200 font-medium">عرض البيانات الخام (للقراءة فقط)</summary>
                      <pre className="mt-2 p-3 bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-800 rounded overflow-x-auto text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap" dir="ltr">
                        {data.content}
                      </pre>
                    </details>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("سيتم حذف المحتوى القديم وبدء صفحة جديدة بمحرر البلوكات Editor.js. متابعة؟")) {
                            setData(d => ({ ...d, content: "" }));
                            setEditorMode("blocks");
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition"
                      >
                        ابدأ من جديد بـ Editor.js
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mode toggle */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {editorMode === "blocks" ? <Layers size={15} className="text-[#34cc30]" /> : <Type size={15} />}
                        <span className="font-medium text-foreground">
                          {editorMode === "blocks" ? "محرر البلوكات" : "محرر النص الغني"}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {editorMode === "blocks" ? "Editor.js" : "Tiptap"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchMode(editorMode === "blocks" ? "richtext" : "blocks")}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition"
                      >
                        {editorMode === "blocks" ? <ToggleLeft size={14} /> : <ToggleRight size={14} className="text-[#34cc30]" />}
                        التبديل للـ{editorMode === "blocks" ? "محرر النصي" : "محرر البلوكات"}
                      </button>
                    </div>

                    {editorMode === "blocks" ? (
                      <BlockEditor
                        value={data.content}
                        onChange={v => setData(d => ({ ...d, content: v }))}
                        placeholder="اضغط + لإضافة بلوك، أو ابدأ الكتابة..."
                        minHeight={600}
                      />
                    ) : (
                      <RichEditor
                        value={data.content}
                        onChange={v => setData(d => ({ ...d, content: v }))}
                        placeholder="ابدأ كتابة المحتوى... استخدم شريط الأدوات أعلاه أو اضغط Ctrl+B للنص العريض"
                        minHeight={600}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* SEO tab */}
            {activeTab === "seo" && (
              <div className="border border-border rounded-lg p-5 bg-card space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Search size={18} className="text-[#34cc30]" />
                  <h3 className="font-bold text-foreground">تحسين محركات البحث (SEO)</h3>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-2">معاينة Google:</div>
                  <div className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                    {data.metaTitle || data.title || "عنوان الصفحة"}
                  </div>
                  <div className="text-green-700 dark:text-green-400 text-xs">
                    خدوم{previewUrl}
                  </div>
                  <div className="text-sm text-foreground/70 mt-1 line-clamp-2">
                    {data.metaDescription || data.excerpt || "وصف الصفحة الذي سيظهر في نتائج البحث..."}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    عنوان SEO <span className="text-muted-foreground text-xs font-normal">(اتركه فارغاً لاستخدام عنوان الصفحة)</span>
                  </label>
                  <input
                    type="text"
                    value={data.metaTitle}
                    onChange={e => setData(d => ({ ...d, metaTitle: e.target.value }))}
                    maxLength={60}
                    placeholder={data.title || "عنوان مخصص لمحركات البحث"}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                  />
                  <div className="text-xs text-muted-foreground mt-1">{(data.metaTitle || "").length}/60 — يُفضّل بين 50-60 حرف</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الوصف Meta Description</label>
                  <textarea
                    rows={3}
                    value={data.metaDescription}
                    onChange={e => setData(d => ({ ...d, metaDescription: e.target.value }))}
                    maxLength={160}
                    placeholder="وصف موجز يظهر في نتائج البحث..."
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-y"
                  />
                  <div className="text-xs text-muted-foreground mt-1">{(data.metaDescription || "").length}/160 — يُفضّل بين 120-160 حرف</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الكلمات المفتاحية <span className="text-muted-foreground text-xs font-normal">(مفصولة بفاصلة)</span>
                  </label>
                  <input
                    type="text"
                    value={data.metaKeywords}
                    onChange={e => setData(d => ({ ...d, metaKeywords: e.target.value }))}
                    placeholder="خدوم, مستقلين, خدمات, السعودية"
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">صورة المشاركة (Open Graph)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.ogImage}
                      onChange={e => setData(d => ({ ...d, ogImage: e.target.value }))}
                      placeholder="/uploads/og-image.jpg"
                      className="flex-1 px-3 py-2 border border-border bg-background rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                    />
                    <button
                      type="button"
                      onClick={() => ogInputRef.current?.click()}
                      className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted flex items-center gap-1.5"
                    >
                      <Upload size={14} /> رفع
                    </button>
                    <input ref={ogInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "ogImage"); e.target.value = ""; }} />
                  </div>
                  {data.ogImage && (
                    <div className="mt-2 relative inline-block">
                      <img src={data.ogImage} alt="" className="h-32 rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={() => setData(d => ({ ...d, ogImage: "" }))}
                        className="absolute -top-1 -left-1 bg-destructive text-white rounded-full p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">المقاس المُوصى به: 1200×630</div>
                </div>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <div className="border border-border rounded-lg p-5 bg-card space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Tag size={18} className="text-[#34cc30]" />
                  <h3 className="font-bold text-foreground">إعدادات إضافية</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">المقدّمة (Excerpt)</label>
                  <textarea
                    rows={3}
                    value={data.excerpt}
                    onChange={e => setData(d => ({ ...d, excerpt: e.target.value }))}
                    placeholder="مقتطف يظهر في صفحة المدونة الرئيسية..."
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">صورة الغلاف</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.coverImage}
                      onChange={e => setData(d => ({ ...d, coverImage: e.target.value }))}
                      placeholder="/uploads/cover.jpg"
                      className="flex-1 px-3 py-2 border border-border bg-background rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted flex items-center gap-1.5"
                    >
                      <Upload size={14} /> رفع
                    </button>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "coverImage"); e.target.value = ""; }} />
                  </div>
                  {data.coverImage && (
                    <div className="mt-2 relative inline-block">
                      <img src={data.coverImage} alt="" className="h-32 rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={() => setData(d => ({ ...d, coverImage: "" }))}
                        className="absolute -top-1 -left-1 bg-destructive text-white rounded-full p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {cfg.showAuthor && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">الكاتب</label>
                    <input
                      type="text"
                      value={data.author}
                      onChange={e => setData(d => ({ ...d, author: e.target.value }))}
                      className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                    />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Sidebar */}
          {!cfg.hideMeta && (
          <aside className="space-y-4">
            {/* Status card */}
            <div className="border border-border rounded-lg bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">الحالة</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">حالة النشر</label>
                  <select
                    value={data.status}
                    onChange={e => setData(d => ({ ...d, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                  </select>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>الحالة الحالية:</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    data.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}>
                    {data.status === "published" ? "منشور" : "مسودة"}
                  </span>
                </div>
                {!isNew && data.updatedAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border space-y-1">
                    <div>آخر تحديث: {new Date(data.updatedAt).toLocaleString("ar-SA")}</div>
                    {data.views !== undefined && <div>المشاهدات: {data.views}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Editor mode info */}
            <div className="border border-border rounded-lg bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                {editorMode === "blocks" ? <Layers size={14} className="text-[#34cc30]" />
                  : editorMode === "legacy" ? <AlertCircle size={14} className="text-amber-600" />
                  : <Type size={14} />}
                وضع المحرر
              </h3>
              <div className={`text-xs rounded-md px-3 py-2 ${
                editorMode === "blocks" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : editorMode === "legacy" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              }`}>
                {editorMode === "blocks"
                  ? "محرر البلوكات (Editor.js) — يدعم السحب والإفلات، وبلوكات FAQ مع JSON-LD للسيو"
                  : editorMode === "legacy"
                  ? "محتوى قديم (Site Builder, w_*) — التحرير معطّل لحماية البيانات"
                  : "المحرر النصي (Tiptap) — مناسب للمحتوى القديم بتنسيق HTML"}
              </div>
            </div>

            {/* Keyboard shortcuts */}
            <div className="border border-border rounded-lg bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">اختصارات لوحة المفاتيح</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  ["Ctrl + S", "حفظ"],
                  ["Ctrl + Z", "تراجع"],
                  ["Ctrl + Y", "إعادة"],
                  ["Tab", "إضافة بلوك جديد"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span>{v}</span>
                    <kbd className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-[10px]">{k}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover preview */}
            {data.coverImage && (
              <div className="border border-border rounded-lg bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <ImageIcon size={14} /> صورة الغلاف
                </h3>
                <img src={data.coverImage} alt="" className="w-full rounded-md border border-border" />
              </div>
            )}
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
