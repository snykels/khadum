'use client';

import { useEffect, useRef, useCallback, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { BlockToolConstructable, ToolSettings } from "@editorjs/editorjs";
import "./block-editor.css";

interface EditorJSData {
  time?: number;
  blocks: Array<{ id?: string; type: string; data: Record<string, unknown> }>;
  version?: string;
}

interface Props {
  value: string;
  onChange: (json: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  blockIndex: number;
}

export default function BlockEditor({
  value,
  onChange,
  placeholder = "اضغط لإضافة محتوى...",
  minHeight = 500,
}: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const undoRef = useRef<import("editorjs-undo").default | null>(null);
  const isReadyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    blockIndex: -1,
  });

  const parseValue = useCallback((): EditorJSData => {
    if (!value) return { blocks: [] };
    try {
      const j = JSON.parse(value);
      if (j && Array.isArray(j.blocks)) return j;
    } catch {}
    return { blocks: [] };
  }, [value]);

  useEffect(() => {
    let editor: EditorJS | null = null;

    async function init() {
      if (!holderRef.current || editorRef.current) return;

      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Checklist = (await import("@editorjs/checklist")).default;
      const InlineCode = (await import("@editorjs/inline-code")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const Columns = (await import("@calumk/editorjs-columns")).default;
      const DragDrop = (await import("editorjs-drag-drop")).default;
      const Undo = (await import("editorjs-undo")).default;
      const FAQBlock = (await import("@/lib/editor-blocks/FAQBlock")).default;

      const initialData = parseValue();

      const headerTool: ToolSettings = {
        class: Header as unknown as BlockToolConstructable,
        config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
        inlineToolbar: true,
      };
      const listTool: ToolSettings = {
        class: List as unknown as BlockToolConstructable,
        config: { defaultStyle: "unordered" },
        inlineToolbar: true,
      };
      const checklistTool: ToolSettings = {
        class: Checklist,
        inlineToolbar: true,
      };
      const inlineCodeTool: ToolSettings = {
        class: InlineCode as unknown as BlockToolConstructable,
      };
      const imageTool: ToolSettings = {
        class: ImageTool as unknown as BlockToolConstructable,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              const fd = new FormData();
              fd.append("file", file);
              try {
                const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
                const d = await r.json();
                if (d.ok && d.url) {
                  return { success: 1, file: { url: d.url } };
                }
              } catch {}
              return { success: 0, file: { url: "" } };
            },
            async uploadByUrl(url: string) {
              return { success: 1, file: { url } };
            },
          },
        },
      };
      const faqTool: ToolSettings = {
        class: FAQBlock as unknown as BlockToolConstructable,
      };

      editor = new EditorJS({
        holder: holderRef.current,
        placeholder,
        autofocus: true,
        inlineToolbar: ["bold", "italic", "link", "inlineCode"],
        data: initialData,
        tools: {
          header: headerTool,
          list: listTool,
          checklist: checklistTool,
          inlineCode: inlineCodeTool,
          image: imageTool,
          faq: faqTool,
          columns: {
            class: Columns,
            config: {
              EditorJsLibrary: EditorJS,
              tools: {
                header: headerTool,
                list: listTool,
                checklist: checklistTool,
                inlineCode: inlineCodeTool,
                image: imageTool,
                faq: faqTool,
              },
            },
          },
        },
        onChange: async () => {
          try {
            if (!editor) return;
            const data = await editor.saver.save();
            onChange(JSON.stringify(data));
          } catch {}
        },
        onReady: () => {
          isReadyRef.current = true;
          try {
            new DragDrop(editor);
          } catch {}
          try {
            undoRef.current = new Undo({ editor });
          } catch {}
        },
        i18n: {
          messages: {
            ui: {
              blockTunes: { toggler: { "Click to tune": "إعدادات البلوك", "or drag to move": "اسحب للتحريك" } },
              inlineToolbar: { converter: { "Convert to": "تحويل إلى" } },
              toolbar: { toolbox: { Add: "إضافة بلوك" } },
              popover: { Filter: "بحث", "Nothing found": "لا توجد نتائج" },
            },
            toolNames: {
              Text: "فقرة",
              Heading: "عنوان",
              List: "قائمة",
              Checklist: "قائمة مهام",
              Quote: "اقتباس",
              Code: "كود",
              Delimiter: "فاصل",
              "Raw HTML": "HTML",
              Table: "جدول",
              Link: "رابط",
              Marker: "تمييز",
              Bold: "عريض",
              Italic: "مائل",
              InlineCode: "كود سطري",
              Image: "صورة",
              Columns: "أعمدة",
              "FAQ / سؤال وجواب": "FAQ / سؤال وجواب",
            },
            blockTunes: {
              delete: { Delete: "حذف", "Click to delete": "انقر للحذف" },
              moveUp: { "Move up": "للأعلى" },
              moveDown: { "Move down": "للأسفل" },
            },
          },
        },
      });

      editorRef.current = editor;
    }

    init();

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
        isReadyRef.current = false;
      }
    };
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const editorEl = holderRef.current;
    if (!editorEl?.contains(e.target as Node)) return;

    let blockIndex = -1;
    const blocks = editorEl.querySelectorAll(".ce-block");
    blocks.forEach((block, i) => {
      if (block.contains(e.target as Node)) {
        blockIndex = i;
      }
    });

    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, blockIndex });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(s => ({ ...s, visible: false }));
  }, []);

  const execCopy = useCallback(async () => {
    closeContextMenu();
    const sel = window.getSelection()?.toString();
    if (sel) {
      try { await navigator.clipboard.writeText(sel); } catch {}
    }
  }, [closeContextMenu]);

  const execPaste = useCallback(async () => {
    closeContextMenu();
    try {
      const text = await navigator.clipboard.readText();
      if (text) document.execCommand("insertText", false, text);
    } catch {}
  }, [closeContextMenu]);

  const execConvertToHeading = useCallback(() => {
    closeContextMenu();
    const editor = editorRef.current;
    if (!editor || contextMenu.blockIndex < 0) return;
    try {
      const block = editor.blocks.getBlockByIndex(contextMenu.blockIndex);
      if (block && block.id) {
        editor.blocks.convert(block.id, "header");
      }
    } catch {}
  }, [closeContextMenu, contextMenu.blockIndex]);

  const execDeleteBlock = useCallback(() => {
    closeContextMenu();
    const editor = editorRef.current;
    if (!editor || contextMenu.blockIndex < 0) return;
    try {
      editor.blocks.delete(contextMenu.blockIndex);
    } catch {}
  }, [closeContextMenu, contextMenu.blockIndex]);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest?.(".block-editor-ctx-menu")) {
        closeContextMenu();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [contextMenu.visible, closeContextMenu]);

  const execUndo = useCallback(() => {
    try { undoRef.current?.undo(); } catch {}
  }, []);

  const execRedo = useCallback(() => {
    try { undoRef.current?.redo(); } catch {}
  }, []);

  return (
    <div
      ref={containerRef}
      id="block-editor-container"
      onContextMenu={handleContextMenu}
      style={{
        background: "#1e1e1e",
        borderRadius: 12,
        border: "1px solid #2e2e2e",
        minHeight,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: "#252525",
          borderBottom: "1px solid #2e2e2e",
          direction: "rtl",
          fontFamily: "var(--font-tajawal), Tahoma, sans-serif",
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execUndo(); }}
          aria-label="تراجع"
          title="تراجع (Ctrl+Z)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "#1e1e1e",
            border: "1px solid #3a3a3a",
            borderRadius: 6,
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: 13,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1e1e1e")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>
          <span>تراجع</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execRedo(); }}
          aria-label="إعادة"
          title="إعادة (Ctrl+Y)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "#1e1e1e",
            border: "1px solid #3a3a3a",
            borderRadius: 6,
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: 13,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1e1e1e")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg>
          <span>إعادة</span>
        </button>
      </div>
      <div
        ref={holderRef}
        id="block-editor-holder"
        style={{
          minHeight,
          padding: "20px 24px",
          color: "#e0e0e0",
          fontFamily: "var(--font-tajawal), Tahoma, sans-serif",
          direction: "rtl",
        }}
      />

      {contextMenu.visible && (
        <div
          className="block-editor-ctx-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            background: "#2a2a2a",
            border: "1px solid #3a3a3a",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            padding: "6px",
            minWidth: 180,
            direction: "rtl",
            fontFamily: "var(--font-tajawal), Tahoma, sans-serif",
          }}
        >
          {[
            { label: "نسخ", icon: "📋", action: execCopy },
            { label: "لصق", icon: "📌", action: execPaste },
            { label: "تحويل لعنوان", icon: "🔤", action: execConvertToHeading },
            { label: "حذف البلوك", icon: "🗑️", action: execDeleteBlock, danger: true },
          ].map(({ label, icon, action, danger }) => (
            <button
              key={label}
              onMouseDown={(e) => { e.preventDefault(); action(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: danger ? "#ff6b6b" : "#e0e0e0",
                fontSize: 14,
                textAlign: "right",
                direction: "rtl",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = danger ? "rgba(255,107,107,0.1)" : "#333")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
