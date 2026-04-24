import type { ConfirmVariant } from "./Modal";

export interface BusConfirmOpts {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  inputPlaceholder?: string;
  inputRequired?: boolean;
}

type Listener = (opts: BusConfirmOpts, resolve: (v: { ok: boolean; value?: string }) => void) => void;
type AlertListener = (msg: string, variant: ConfirmVariant | undefined, title: string | undefined, resolve: () => void) => void;

let confirmListener: Listener | null = null;
let alertListener: AlertListener | null = null;

export function _registerConfirm(l: Listener) { confirmListener = l; return () => { if (confirmListener === l) confirmListener = null; }; }
export function _registerAlert(l: AlertListener) { alertListener = l; return () => { if (alertListener === l) alertListener = null; }; }

export function confirmDialog(opts: BusConfirmOpts): Promise<{ ok: boolean; value?: string }> {
  return new Promise(resolve => {
    if (confirmListener) confirmListener(opts, resolve);
    else resolve({ ok: typeof window !== "undefined" ? window.confirm(opts.message) : false });
  });
}

export function alertDialog(message: string, variant?: ConfirmVariant, title?: string): Promise<void> {
  return new Promise(resolve => {
    if (alertListener) alertListener(message, variant, title, resolve);
    else { if (typeof window !== "undefined") window.alert(message); resolve(); }
  });
}
