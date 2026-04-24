export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const cleaned = String(input).replace(/[\s\-\(\)]/g, "").trim();
  if (!cleaned) return null;
  let s = cleaned;
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("00")) s = s.slice(2);
  if (s.startsWith("966")) {
    return /^966[0-9]{9}$/.test(s) ? s : null;
  }
  if (/^0?5[0-9]{8}$/.test(s)) {
    if (s.startsWith("0")) s = s.slice(1);
    return "966" + s;
  }
  return null;
}

export function isValidSaudiPhone(input: string | null | undefined): boolean {
  return normalizePhone(input) !== null;
}

export function formatPhoneDisplay(phone: string | null | undefined): string {
  const n = normalizePhone(phone);
  if (!n) return phone || "";
  return `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}
