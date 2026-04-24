"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Sparkles, Eye } from "lucide-react";
import { WEB_BLOCK_PRESETS, type WebBlock } from "@/lib/blocks/webKhadom";

type Block = WebBlock;

function parseBlocks(content: string | null | undefined): Block[] {
  if (!content) return [];
  try {
    const j = JSON.parse(content);
    if (Array.isArray(j)) return j;
    if (j && Array.isArray(j.blocks)) return j.blocks;
  } catch { /* not json — treat as legacy text */ }
  return [];
}

function isLegacyText(content: string | null | undefined): boolean {
  if (!content) return false;
  try { JSON.parse(content); return false; } catch { return true; }
}

export function PageBuilder({ value, onChange, onPreview }: { value: string; onChange: (v: string) => void; onPreview?: () => void }) {
  const [blocks, setBlocksState] = useState<Block[]>(() => parseBlocks(value));
  const [legacyMode, setLegacyMode] = useState<boolean>(() => isLegacyText(value));

  function setBlocks(b: Block[]) {
    setBlocksState(b);
    onChange(JSON.stringify(b));
  }

  function addBlock(type: Block["type"]) {
    const preset = WEB_BLOCK_PRESETS.find(p => p.type === type)?.preset;
    if (!preset) return;
    const id = Math.random().toString(36).slice(2, 9);
    setBlocks([...blocks, { id, ...(preset as any) }]);
  }

  function updateBlock(i: number, b: Block) {
    const arr = [...blocks]; arr[i] = b; setBlocks(arr);
  }

  function deleteBlock(i: number) {
    setBlocks(blocks.filter((_, j) => j !== i));
  }

  function moveBlock(i: number, dir: "up" | "down") {
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= blocks.length) return;
    const arr = [...blocks]; [arr[i], arr[j]] = [arr[j], arr[i]]; setBlocks(arr);
  }

  if (legacyMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
          <span className="text-amber-800 dark:text-amber-200">المحتوى الحالي نص حر. يمكنك التحويل إلى منشئ الكتل (سيُمسح النص الحر).</span>
          <button type="button" onClick={() => { setLegacyMode(false); setBlocks([]); }} className="bg-[#0F5132] text-white px-3 py-1.5 rounded text-xs">تحويل إلى الكتل</button>
        </div>
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={12} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg px-4 py-2.5" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-[#0F5132]/5 to-[#C9A961]/5 border border-[#0F5132]/20 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F5132] mb-2"><Sparkles size={14} /> أضف كتلة خدوم (15 كتلة)</div>
        <div className="flex flex-wrap gap-1.5">
          {WEB_BLOCK_PRESETS.map(p => (
            <button key={p.type} type="button" onClick={() => addBlock(p.type)} className="bg-white dark:bg-gray-800 hover:bg-[#0F5132] hover:text-white text-[#0F5132] dark:text-[#25D366] px-2.5 py-1 rounded text-xs font-medium border border-[#0F5132]/20">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">لا توجد كتل بعد — أضف كتلة من الأعلى</p>}

      {blocks.map((b, i) => (
        <div key={b.id || i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-[#0F5132] flex items-center gap-1"><Sparkles size={12} /> {WEB_BLOCK_PRESETS.find(p => p.type === b.type)?.label || b.type}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveBlock(i, "up")} className="p-1 text-gray-400 hover:text-[#0F5132]"><ArrowUp size={14} /></button>
              <button type="button" onClick={() => moveBlock(i, "down")} className="p-1 text-gray-400 hover:text-[#0F5132]"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => deleteBlock(i)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
            </div>
          </div>
          <textarea
            defaultValue={JSON.stringify(b, null, 2)}
            onBlur={e => { try { const j = JSON.parse(e.target.value); updateBlock(i, { ...j, id: b.id }); } catch { /* keep editing */ } }}
            rows={Math.min(18, Math.max(5, JSON.stringify(b, null, 2).split("\n").length))}
            dir="ltr"
            className="w-full font-mono text-xs border border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2"
          />
        </div>
      ))}

      {onPreview && blocks.length > 0 && (
        <button type="button" onClick={onPreview} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Eye size={14} /> معاينة كاملة</button>
      )}
    </div>
  );
}
