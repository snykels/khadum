"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Loader2, Check } from "lucide-react";

export const Tip = ({ label, children, side = "top" }: { label: string; children: ReactNode; side?: "top" | "bottom" | "left" | "right" }) => (
  <TooltipPrimitive.Provider delayDuration={150}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content side={side} sideOffset={6} className="z-[80] bg-[#1C1917] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg" dir="rtl" style={{ fontFamily: "var(--font-tajawal), Tahoma, sans-serif" }}>
          {label}
          <TooltipPrimitive.Arrow className="fill-[#1C1917]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

export const RippleButton = ({ children, className = "", onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
        const id = Date.now();
        setRipples(r => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.(e);
      }}
      className={`relative overflow-hidden ${className}`}
      {...(rest as any)}
    >
      {children}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span key={r.id} initial={{ scale: 0, opacity: 0.4 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} className="absolute rounded-full bg-white/40 pointer-events-none" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30 }} />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

export function EditableNote({ initialText, placeholder, onSave }: { initialText: string; placeholder?: string; onSave: (text: string) => Promise<void> | void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastText = useRef(initialText);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function handleInput() {
    const t = ref.current?.innerText || "";
    if (t === lastText.current) return;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      lastText.current = t;
      await onSave(t);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    }, 900);
  }

  return (
    <div className="relative group">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || "اكتب ملاحظتك هنا..."}
        className="outline-none p-4 rounded-xl border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-[#0F5132] focus:bg-[#0F5132]/5 transition-all min-h-[80px] text-sm leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        dir="rtl"
      >{initialText}</div>
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute top-2 left-2 text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${status === "saving" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}
          >
            {status === "saving" ? <><Loader2 className="w-3 h-3 animate-spin" /> يتم الحفظ...</> : <><Check className="w-3 h-3" /> تم الحفظ</>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const StaggerList = ({ children, delay = 0.06 }: { children: ReactNode[]; delay?: number }) => (
  <>{(Array.isArray(children) ? children : [children]).map((c, i) => (
    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * delay, ease: [0.22, 1, 0.36, 1] }}>{c}</motion.div>
  ))}</>
);
