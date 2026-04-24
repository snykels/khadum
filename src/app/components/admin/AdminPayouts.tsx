'use client';
import { useEffect, useState } from "react";
import { Download, RefreshCw, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";
<<<<<<< HEAD
import { alertDialog } from "@/app/components/ui/confirmBus";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

interface TapPayout {
  payoutId: string;
  status: string;
  payoutDate: string | null;
  amount: number;
  currency: string;
  merchantId: string | null;
  bankName: string | null;
  bankSwift: string | null;
  beneficiaryName: string | null;
  beneficiaryIban: string | null;
  settlementsAvailable: boolean;
  receivedAt: string;
  downloadedAt: string | null;
}

interface Summary {
  total: number;
  totalPaidOut: number;
  totalPending: number;
  countPaidOut: number;
  countFailed: number;
}

<<<<<<< HEAD
const statusConfig: Record<string, { label: string; badgeClass: string; Icon: any }> = {
  PAID_OUT:  { label: "تم التحويل",  badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",  Icon: CheckCircle },
  PENDING:   { label: "قيد التنفيذ", badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent", Icon: Clock },
  INITIATED: { label: "مُبادر",      badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent",    Icon: Clock },
  FAILED:    { label: "فاشل",        badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent",       Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, badgeClass: "bg-gray-100 text-gray-600 border-transparent", Icon: Clock };
  return (
    <Badge className={`inline-flex items-center gap-1 ${cfg.badgeClass}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
=======
const statusConfig: Record<string, { label: string; color: string; Icon: any }> = {
  PAID_OUT:  { label: "تم التحويل",  color: "text-green-600 bg-green-50",  Icon: CheckCircle },
  PENDING:   { label: "قيد التنفيذ", color: "text-yellow-600 bg-yellow-50", Icon: Clock },
  INITIATED: { label: "مُبادر",      color: "text-blue-600 bg-blue-50",    Icon: Clock },
  FAILED:    { label: "فاشل",        color: "text-red-600 bg-red-50",       Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, color: "text-gray-600 bg-gray-50", Icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, color = "text-[#485869]" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  );
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<TapPayout[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [tapLoading, setTapLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/payouts");
      const d = await r.json();
<<<<<<< HEAD
      if (r.ok) { setPayouts(d.payouts || []); setSummary(d.summary); }
=======
      if (r.ok) {
        setPayouts(d.payouts || []);
        setSummary(d.summary);
      }
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    } finally { setLoading(false); }
  }

  async function syncFromTap() {
<<<<<<< HEAD
    setTapLoading(true); setSyncMsg(null);
=======
    setTapLoading(true);
    setSyncMsg(null);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    try {
      const now = Date.now();
      const from = now - 90 * 24 * 60 * 60 * 1000;
      const r = await fetch("/api/admin/payouts/tap-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: now }),
      });
      const d = await r.json();
<<<<<<< HEAD
      if (r.ok) { setSyncMsg(`استُرجع ${d.count || 0} تحويل من Tap`); await load(); }
      else setSyncMsg(`خطأ: ${JSON.stringify(d.error)}`);
=======
      if (r.ok) {
        setSyncMsg(`استُرجع ${d.count || 0} تحويل من Tap`);
        await load();
      } else {
        setSyncMsg(`خطأ: ${JSON.stringify(d.error)}`);
      }
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    } finally { setTapLoading(false); }
  }

  async function downloadReport(payoutId: string) {
    setDownloading(payoutId);
    try {
      const r = await fetch("/api/admin/payouts/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId }),
      });
      if (!r.ok) {
        const e = await r.json();
<<<<<<< HEAD
        await alertDialog(`خطأ: ${e.error}`, "danger", "تعذر التنزيل");
=======
        alert(`خطأ: ${e.error}`);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        return;
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
<<<<<<< HEAD
      a.href = url; a.download = `${payoutId}-report.zip`; a.click();
=======
      a.href = url;
      a.download = `${payoutId}-report.zip`;
      a.click();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      URL.revokeObjectURL(url);
      await load();
    } finally { setDownloading(null); }
  }

  useEffect(() => { load(); }, []);

  const fmt = (n: number) => Number(n || 0).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
<<<<<<< HEAD
          <h1 className="text-xl font-bold text-foreground">التحويلات البنكية من Tap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Payout Webhooks — تحويلات إيرادات المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={syncFromTap} disabled={tapLoading}>
            <RefreshCw className={`w-4 h-4 ${tapLoading ? "animate-spin" : ""}`} />
            {tapLoading ? "جاري الاستعلام..." : "استعلام من Tap"}
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
=======
          <h1 className="text-xl font-bold text-[#485869] dark:text-white">التحويلات البنكية من Tap</h1>
          <p className="text-sm text-gray-500 mt-0.5">Payout Webhooks — تحويلات إيرادات المنصة</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncFromTap}
            disabled={tapLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#485869] text-white rounded-lg text-sm font-medium hover:bg-[#3a4a58] disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${tapLoading ? "animate-spin" : ""}`} />
            {tapLoading ? "جاري الاستعلام..." : "استعلام من Tap"}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        </div>
      </div>

      {syncMsg && (
<<<<<<< HEAD
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm p-3 rounded-lg">
=======
        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm p-3 rounded-lg">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          {syncMsg}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<<<<<<< HEAD
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">إجمالي التحويلات</div>
              <div className="text-xl font-bold text-foreground">{String(summary.total)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">تم تحويله</div>
              <div className="text-xl font-bold text-green-600">{fmt(summary.totalPaidOut)} ر.س</div>
              <div className="text-xs text-muted-foreground">{summary.countPaidOut} تحويل</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">قيد التنفيذ</div>
              <div className="text-xl font-bold text-yellow-600">{fmt(summary.totalPending)} ر.س</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">فاشل</div>
              <div className="text-xl font-bold text-destructive">{String(summary.countFailed)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/50 px-5 py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            سجل التحويلات
          </CardTitle>
        </CardHeader>
        {loading ? (
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2 p-0">
            <RefreshCw className="w-4 h-4 animate-spin" /> جاري التحميل...
          </CardContent>
        ) : payouts.length === 0 ? (
          <CardContent className="text-center py-16 p-0">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">لا توجد تحويلات بعد</p>
            <p className="text-muted-foreground text-xs mt-1">أضف رابط الاستقبال في لوحة Tap ليبدأ الاستقبال</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right py-3 px-4">رقم التحويل</TableHead>
                <TableHead className="text-right py-3 px-3">الحالة</TableHead>
                <TableHead className="text-right py-3 px-3">المبلغ</TableHead>
                <TableHead className="text-right py-3 px-3">البنك</TableHead>
                <TableHead className="text-right py-3 px-3">المستفيد</TableHead>
                <TableHead className="text-right py-3 px-3">التاريخ</TableHead>
                <TableHead className="text-right py-3 px-3">تقرير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map(p => (
                <TableRow key={p.payoutId}>
                  <TableCell className="py-3 px-4">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {p.payoutId.replace("payout_", "").slice(0, 16)}...
                    </code>
                  </TableCell>
                  <TableCell className="py-3 px-3"><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="py-3 px-3 font-bold text-foreground">
                    {fmt(p.amount)} <span className="text-xs font-normal text-muted-foreground">{p.currency}</span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-muted-foreground text-xs">{p.bankName || "—"}</TableCell>
                  <TableCell className="py-3 px-3 text-xs">
                    <div className="text-foreground">{p.beneficiaryName || "—"}</div>
                    {p.beneficiaryIban && <div className="text-muted-foreground font-mono">{p.beneficiaryIban}</div>}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-muted-foreground text-xs">
                    {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString("ar-SA") : new Date(p.receivedAt).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    {p.settlementsAvailable ? (
                      <Button variant="brand" size="sm" onClick={() => downloadReport(p.payoutId)} disabled={downloading === p.payoutId}>
                        <Download className="w-3 h-3" />
                        {downloading === p.payoutId ? "..." : p.downloadedAt ? "إعادة تنزيل" : "تنزيل"}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">غير متاح</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">إعداد رابط الاستقبال في Tap:</p>
        <p>في لوحة Tap ← Settings ← Webhooks، أضف رابطاً منفصلاً للتحويلات:</p>
=======
          <StatCard label="إجمالي التحويلات" value={String(summary.total)} />
          <StatCard label="تم تحويله" value={`${fmt(summary.totalPaidOut)} ر.س`} color="text-green-600" sub={`${summary.countPaidOut} تحويل`} />
          <StatCard label="قيد التنفيذ" value={`${fmt(summary.totalPending)} ر.س`} color="text-yellow-600" />
          <StatCard label="فاشل" value={String(summary.countFailed)} color="text-red-600" />
        </div>
      )}

      <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#252b3b]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#485869] dark:text-gray-200">
            <Building2 className="w-4 h-4" />
            سجل التحويلات
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">لا توجد تحويلات بعد</p>
            <p className="text-gray-400 text-xs mt-1">أضف webhook URL في لوحة Tap ليبدأ الاستقبال</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">رقم التحويل</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">الحالة</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">المبلغ</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">البنك</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">المستفيد</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">التاريخ</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">تقرير</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.payoutId} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#252b3b] transition">
                    <td className="py-3 px-4">
                      <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {p.payoutId.replace("payout_", "").slice(0, 16)}...
                      </code>
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-3 font-bold text-[#485869] dark:text-white">
                      {fmt(p.amount)} <span className="text-xs font-normal text-gray-400">{p.currency}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300 text-xs">{p.bankName || "—"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300 text-xs">
                      <div>{p.beneficiaryName || "—"}</div>
                      {p.beneficiaryIban && <div className="text-gray-400 font-mono">{p.beneficiaryIban}</div>}
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString("ar-SA") : new Date(p.receivedAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="py-3 px-3">
                      {p.settlementsAvailable ? (
                        <button
                          onClick={() => downloadReport(p.payoutId)}
                          disabled={downloading === p.payoutId}
                          className="flex items-center gap-1 px-2 py-1 bg-[#34cc30] text-white rounded-lg text-xs font-medium hover:bg-[#2bb028] disabled:opacity-50 transition"
                        >
                          <Download className="w-3 h-3" />
                          {downloading === p.payoutId ? "..." : p.downloadedAt ? "إعادة تنزيل" : "تنزيل"}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">غير متاح</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">إعداد Payout Webhook في Tap:</p>
        <p>في لوحة Tap ← Settings ← Webhooks، أضف رابطاً منفصلاً للـ Payout:</p>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        <code className="block mt-2 bg-blue-100 dark:bg-blue-900/50 rounded px-3 py-1.5 text-xs font-mono">
          https://khadum.app/api/payments/webhook/tap/payout
        </code>
      </div>
    </div>
  );
}
