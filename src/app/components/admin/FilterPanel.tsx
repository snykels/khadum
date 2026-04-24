'use client';

import { ReactNode, useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  title?: string;
  active?: number;
  children: ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  align?: "left" | "right";
}

export default function FilterPanel({ title = "تصفية متقدمة", active = 0, children, onReset, onApply, align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm shadow-sm ${
          open || active > 0
            ? "bg-[#34cc30] border-[#34cc30] text-white shadow-[#34cc30]/30"
            : "bg-white dark:bg-[#252830] border-gray-200 dark:border-[#2a2d36] text-[#485869] dark:text-gray-200 hover:border-[#34cc30] hover:text-[#34cc30]"
        }`}
      >
        <SlidersHorizontal size={18} />
        <span>{title}</span>
        {active > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${open ? "bg-white text-[#34cc30]" : "bg-[#34cc30] text-white"}`}>
            {active}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute z-40 top-full mt-2 ${align === "left" ? "left-0" : "right-0"} w-[320px] sm:w-[420px] bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-[#2a2d36] bg-gradient-to-l from-[#34cc30]/10 to-transparent">
            <div className="flex items-center gap-2 font-bold text-[#485869] dark:text-white">
              <SlidersHorizontal size={16} className="text-[#34cc30]" />
              {title}
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">{children}</div>
          <div className="flex justify-between items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-[#2a2d36] bg-gray-50 dark:bg-[#15171c]">
            <button
              onClick={() => { onReset?.(); }}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              إعادة تعيين
            </button>
            <button
              onClick={() => { onApply?.(); setOpen(false); }}
              className="bg-[#34cc30] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2eb829] shadow-sm"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        active
          ? "bg-[#34cc30] border-[#34cc30] text-white shadow-sm"
          : "bg-white dark:bg-[#252830] border-gray-200 dark:border-[#2a2d36] text-gray-600 dark:text-gray-300 hover:border-[#34cc30] hover:text-[#34cc30]"
      }`}
    >
      {children}
    </button>
  );
}
