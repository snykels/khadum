"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

export default function PaymentLogsPage() {
  const [data, setData] = useState<{ stats: any; logs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payment-logs")
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const logs = data?.logs || [];
  const conversion = stats.total_clicks ? Math.round((stats.paid * 100) / stats.total_clicks) : 0;

  const statusLabel: Record<string, string> = { pending: "بانتظار الدفع", paid: "تم الدفع", failed: "فشل", cancelled: "أُلغي" };
  const statusColor: Record<string, string> = { pending: "bg-amber-100 text-amber-700", paid: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#485869] dark:text-gray-100">سجل عمليات الدفع</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تتبّع نقرات روابط الدفع مقارنة بعمليات الدفع المكتملة</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="إجمالي النقرات" value={stats.total_clicks ?? 0} color="text-blue-600" />
        <StatCard label="تم الدفع" value={stats.paid ?? 0} color="text-green-600" />
        <StatCard label="بانتظار الدفع" value={stats.pending ?? 0} color="text-amber-600" />
        <StatCard label="نسبة التحويل" value={`${conversion}%`} color="text-purple-600" />
      </div>

      <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-[#2a2d36] flex items-center gap-2">
          <CreditCard size={18} className="text-[#34cc30]" />
          <h3 className="font-bold text-[#485869] dark:text-gray-100">سجل النقرات الأخيرة</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد بيانات بعد. سيظهر السجل فور تسجيل أول نقرة على رابط دفع.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#252830] text-gray-500 text-right">
                <tr>
                  <th className="px-3 py-2 font-medium">المستخدم</th>
                  <th className="px-3 py-2 font-medium">المبلغ</th>
                  <th className="px-3 py-2 font-medium">البوابة</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                  <th className="px-3 py-2 font-medium">وقت النقر</th>
                  <th className="px-3 py-2 font-medium">وقت الدفع</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-gray-100 dark:border-[#2a2d36]">
                    <td className="px-3 py-2 text-[#485869] dark:text-gray-200">{log.userName || log.userEmail || `#${log.userId || "—"}`}</td>
                    <td className="px-3 py-2 font-medium">{log.amount ? `${log.amount} ${log.currency || ""}` : "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{log.gateway || "—"}</td>
                    <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${statusColor[log.status] || "bg-gray-100 text-gray-700"}`}>{statusLabel[log.status] || log.status}</span></td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{new Date(log.clickedAt).toLocaleString("ar-SA")}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{log.paidAt ? new Date(log.paidAt).toLocaleString("ar-SA") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl p-4">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
