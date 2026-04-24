'use client';
import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

export function Modal({ open, onClose, title, children, size = "md", footer, closeOnBackdrop = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  const sizeCls = {
    sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-[95vw] h-[90vh]"
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => closeOnBackdrop && onClose()} />
      <div className={`relative bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl w-full ${sizeCls} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2d36]">
            <h3 className="text-lg font-bold text-[#485869] dark:text-white">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"><X size={18} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-gray-100 dark:border-[#2a2d36] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export type ConfirmVariant = "info" | "success" | "warning" | "danger";

interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  inputPlaceholder?: string;
  inputRequired?: boolean;
}

interface ConfirmCtx {
  confirm: (opts: ConfirmOptions) => Promise<{ ok: boolean; value?: string }>;
  alert: (msg: ReactNode, variant?: ConfirmVariant, title?: string) => Promise<void>;
}

const Ctx = createContext<ConfirmCtx | null>(null);

const variantMap: Record<ConfirmVariant, { Icon: any; color: string; btn: string }> = {
  info:    { Icon: Info,           color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",        btn: "bg-blue-500 hover:bg-blue-600" },
  success: { Icon: CheckCircle,    color: "text-green-600 bg-green-50 dark:bg-green-900/20",     btn: "bg-[#34cc30] hover:bg-[#2eb829]" },
  warning: { Icon: AlertTriangle,  color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",  btn: "bg-yellow-500 hover:bg-yellow-600" },
  danger:  { Icon: AlertCircle,    color: "text-red-600 bg-red-50 dark:bg-red-900/20",           btn: "bg-red-500 hover:bg-red-600" },
};

import { _registerConfirm, _registerAlert } from "./confirmBus";

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: any) => void; alertOnly?: boolean } | null>(null);
  const [val, setVal] = useState("");

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<{ ok: boolean; value?: string }>((resolve) => {
    setVal(""); setState({ opts, resolve });
  }), []);

  const alert = useCallback((msg: ReactNode, variant: ConfirmVariant = "info", title?: string) => new Promise<void>((resolve) => {
    setState({ opts: { message: msg, variant, title }, resolve: () => resolve(), alertOnly: true });
  }), []);

  useEffect(() => {
    const offC = _registerConfirm((opts, resolve) => {
      setVal(""); setState({ opts: opts as any, resolve });
    });
    const offA = _registerAlert((message, variant, title, resolve) => {
      setState({ opts: { message, variant, title }, resolve: () => resolve(), alertOnly: true });
    });
    return () => { offC(); offA(); };
  }, []);

  const close = (ok: boolean) => {
    if (!state) return;
    if (state.alertOnly) state.resolve(undefined);
    else state.resolve({ ok, value: val });
    setState(null);
  };

  const v = state?.opts.variant || "info";
  const { Icon, color, btn } = variantMap[v];

  return (
    <Ctx.Provider value={{ confirm, alert }}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        size="sm"
        closeOnBackdrop={true}
        footer={state ? (state.alertOnly ? (
          <button onClick={() => close(true)} className={`px-5 py-2 rounded-lg text-white text-sm font-medium ${btn}`}>حسناً</button>
        ) : (
          <>
            <button onClick={() => close(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-[#2a2d36] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">{state.opts.cancelLabel || "إلغاء"}</button>
            <button onClick={() => close(true)} disabled={state.opts.inputRequired && !val.trim()} className={`px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 ${btn}`}>{state.opts.confirmLabel || "تأكيد"}</button>
          </>
        )) : null}
      >
        {state && (
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}><Icon size={24} /></div>
            <div className="flex-1">
              {state.opts.title && <h4 className="font-bold text-[#485869] dark:text-white mb-1">{state.opts.title}</h4>}
              <div className="text-sm text-gray-600 dark:text-gray-300">{state.opts.message}</div>
              {!state.alertOnly && state.opts.inputPlaceholder !== undefined && (
                <input
                  autoFocus
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  placeholder={state.opts.inputPlaceholder}
                  className="mt-3 w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirm() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConfirm must be used inside ConfirmProvider");
  return c;
}
