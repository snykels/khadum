'use client';

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  AlignRight, AlignCenter, AlignLeft, AlignJustify,
  Undo2, Redo2, Code, Minus, Eraser, Highlighter, Palette,
  Plus, Trash2, ChevronDown, Type,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichEditor({ value, onChange, placeholder = "ابدأ الكتابة هنا...", minHeight = 500 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "rounded-md bg-muted p-3 font-mono text-sm" } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#34cc30] underline underline-offset-2 hover:text-[#2ab327]" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-3" },
        allowBase64: true,
      }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-3 text-sm" } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: "bg-muted/50 border border-border p-2 text-right font-semibold" } }),
      TableCell.configure({ HTMLAttributes: { class: "border border-border p-2 text-right" } }),
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: "right" }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: "rounded px-0.5" } }),
      Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
      Typography,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none px-6 py-5 min-h-[400px]",
        style: `min-height: ${minHeight}px; font-family: var(--font-tajawal), Tahoma, sans-serif;`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const uploadImage = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.ok && d.url) editor?.chain().focus().setImage({ src: d.url }).run();
    } catch {}
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    setLinkUrl(prev);
    setLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl, target: "_blank" }).run();
    setLinkOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  if (!editor) {
    return <div className="border border-border rounded-md bg-muted/20 animate-pulse" style={{ minHeight: minHeight + 80 }} />;
  }

  const Btn = ({
    onClick, active, disabled, title, children,
  }: { onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-all flex items-center justify-center ${
        active
          ? "bg-[#34cc30] text-white shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-6 bg-border mx-1" />;

  const COLORS = [
    "#000000", "#374151", "#6b7280", "#ef4444", "#f97316", "#eab308",
    "#34cc30", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  const HIGHLIGHTS = [
    "#fef08a", "#fed7aa", "#fecaca", "#bbf7d0", "#bae6fd", "#ddd6fe", "#fce7f3",
  ];

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 px-2 py-2 flex flex-wrap items-center gap-0.5 sticky top-0 z-10 backdrop-blur">
        <Btn title="تراجع (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={16} />
        </Btn>
        <Btn title="إعادة (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={16} />
        </Btn>

        <Sep />

        {/* Heading dropdown */}
        <select
          className="text-sm bg-transparent border border-border rounded-md px-2 py-1 hover:bg-muted cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#34cc30]"
          value={
            editor.isActive("heading", { level: 1 }) ? "h1"
            : editor.isActive("heading", { level: 2 }) ? "h2"
            : editor.isActive("heading", { level: 3 }) ? "h3"
            : editor.isActive("heading", { level: 4 }) ? "h4"
            : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(v.slice(1)) as 1 | 2 | 3 | 4 }).run();
          }}
        >
          <option value="p">نص عادي</option>
          <option value="h1">عنوان 1</option>
          <option value="h2">عنوان 2</option>
          <option value="h3">عنوان 3</option>
          <option value="h4">عنوان 4</option>
        </select>

        <Sep />

        <Btn title="عريض (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold size={16} />
        </Btn>
        <Btn title="مائل (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic size={16} />
        </Btn>
        <Btn title="تحته خط (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon size={16} />
        </Btn>
        <Btn title="يتوسطه خط" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough size={16} />
        </Btn>
        <Btn title="كود سطري" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
          <Code size={16} />
        </Btn>

        <Sep />

        {/* Color picker */}
        <div className="relative">
          <Btn title="لون النص" onClick={() => { setShowColorPicker(v => !v); setShowTableMenu(false); }}>
            <Palette size={16} />
          </Btn>
          {showColorPicker && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 w-[156px]">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="col-span-6 mt-1 text-xs text-muted-foreground hover:text-foreground py-1 border-t border-border pt-1"
              >
                إزالة اللون
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <Btn title="تظليل" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
            <Highlighter size={16} />
          </Btn>
        </div>

        <Sep />

        <Btn title="محاذاة لليمين" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight size={16} />
        </Btn>
        <Btn title="توسيط" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter size={16} />
        </Btn>
        <Btn title="محاذاة لليسار" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft size={16} />
        </Btn>
        <Btn title="ضبط" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}>
          <AlignJustify size={16} />
        </Btn>

        <Sep />

        <Btn title="قائمة نقطية" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List size={16} />
        </Btn>
        <Btn title="قائمة مرقمة" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered size={16} />
        </Btn>
        <Btn title="اقتباس" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote size={16} />
        </Btn>

        <Sep />

        <Btn title="رابط (Ctrl+K)" onClick={insertLink} active={editor.isActive("link")}>
          <LinkIcon size={16} />
        </Btn>
        <Btn title="إدراج صورة" onClick={() => fileRef.current?.click()}>
          <ImageIcon size={16} />
        </Btn>

        {/* Table */}
        <div className="relative">
          <Btn title="جدول" onClick={() => { setShowTableMenu(v => !v); setShowColorPicker(false); }} active={editor.isActive("table")}>
            <TableIcon size={16} />
          </Btn>
          {showTableMenu && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[200px]">
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-muted rounded flex items-center gap-2" onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setShowTableMenu(false); }}>
                <Plus size={14}/> إدراج جدول 3×3
              </button>
              <div className="h-px bg-border my-1" />
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-muted rounded" disabled={!editor.isActive("table")} onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}>
                إضافة صف
              </button>
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-muted rounded" disabled={!editor.isActive("table")} onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}>
                إضافة عمود
              </button>
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-muted rounded text-destructive" disabled={!editor.isActive("table")} onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}>
                حذف صف
              </button>
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-muted rounded text-destructive" disabled={!editor.isActive("table")} onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}>
                حذف عمود
              </button>
              <div className="h-px bg-border my-1" />
              <button type="button" className="w-full text-right px-3 py-1.5 text-sm hover:bg-destructive/10 text-destructive rounded flex items-center gap-2" disabled={!editor.isActive("table")} onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}>
                <Trash2 size={14}/> حذف الجدول
              </button>
            </div>
          )}
        </div>

        <Sep />

        <Btn title="خط فاصل" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={16} />
        </Btn>
        <Btn title="مسح التنسيق" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser size={16} />
        </Btn>
      </div>

      {/* Hidden image upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) uploadImage(f);
          e.target.value = "";
        }}
      />

      {/* Bubble menu (selection toolbar) */}
      <BubbleMenu editor={editor} className="bg-popover border border-border rounded-lg shadow-lg p-1 flex items-center gap-0.5">
        <Btn title="عريض" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold size={14} />
        </Btn>
        <Btn title="مائل" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic size={14} />
        </Btn>
        <Btn title="تحته خط" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon size={14} />
        </Btn>
        <Btn title="رابط" onClick={insertLink} active={editor.isActive("link")}>
          <LinkIcon size={14} />
        </Btn>
        <Btn title="تظليل" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
          <Highlighter size={14} />
        </Btn>
      </BubbleMenu>

      {/* Editor */}
      <EditorContent editor={editor} className="khadom-editor" />

      {/* Link dialog */}
      {linkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setLinkOpen(false)}>
          <div className="bg-popover border border-border rounded-lg shadow-xl p-5 w-full max-w-md" dir="rtl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><LinkIcon size={18}/> إضافة/تعديل رابط</h3>
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 bg-background"
              onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkOpen(false); }}
            />
            <div className="flex justify-end gap-2 mt-4">
              {linkUrl && (
                <button type="button" onClick={() => { setLinkUrl(""); applyLink(); }} className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                  إزالة الرابط
                </button>
              )}
              <button type="button" onClick={() => setLinkOpen(false)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted">
                إلغاء
              </button>
              <button type="button" onClick={applyLink} className="px-4 py-1.5 text-sm bg-[#34cc30] text-white rounded-md hover:bg-[#2ab327]">
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor styles */}
      <style jsx global>{`
        .khadom-editor .ProseMirror {
          outline: none;
        }
        .khadom-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .khadom-editor .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; line-height: 1.3; }
        .khadom-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 0.83em 0; line-height: 1.3; }
        .khadom-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0; line-height: 1.4; }
        .khadom-editor .ProseMirror h4 { font-size: 1.1em; font-weight: 600; margin: 1em 0; }
        .khadom-editor .ProseMirror p { margin: 0.5em 0; line-height: 1.7; }
        .khadom-editor .ProseMirror ul { list-style: disc; padding-right: 1.5em; margin: 0.5em 0; }
        .khadom-editor .ProseMirror ol { list-style: decimal; padding-right: 1.5em; margin: 0.5em 0; }
        .khadom-editor .ProseMirror blockquote {
          border-right: 3px solid #34cc30;
          padding-right: 1em;
          margin: 1em 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .khadom-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1.5em 0;
        }
        .khadom-editor .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.15em 0.35em;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
        .khadom-editor .ProseMirror pre {
          background: hsl(var(--muted));
          padding: 0.75em 1em;
          border-radius: 6px;
          margin: 0.75em 0;
          overflow-x: auto;
        }
        .khadom-editor .ProseMirror pre code {
          background: transparent;
          padding: 0;
        }
        .khadom-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 0.75em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        .khadom-editor .ProseMirror table td,
        .khadom-editor .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          padding: 8px 12px;
          vertical-align: top;
          position: relative;
          min-width: 1em;
        }
        .khadom-editor .ProseMirror table th {
          background: hsl(var(--muted) / 0.5);
          font-weight: 600;
        }
        .khadom-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 0.5em 0;
        }
        .khadom-editor .ProseMirror a {
          color: #34cc30;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .khadom-editor .ProseMirror .selectedCell:after {
          background: rgba(52, 204, 48, 0.15);
          content: '';
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .khadom-editor .ProseMirror .column-resize-handle {
          background-color: #34cc30;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 4px;
        }
      `}</style>
    </div>
  );
}
