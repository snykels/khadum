"use client";

import { useState } from "react";
import { Mail, FileText, BarChart3, Send } from "lucide-react";
import { EmailSettingsPage, NewsletterPage } from "./AdminPagesExtra";
import { EmailTemplatesPage } from "./AdminPagesInvitesEmail";

type Tab = "settings" | "templates" | "newsletter" | "analytics";

const TABS: Array<{ key: Tab; label: string; icon: any }> = [
  { key: "settings", label: "إعدادات SMTP", icon: Mail },
  { key: "templates", label: "قوالب البريد", icon: FileText },
  { key: "newsletter", label: "النشرة البريدية", icon: Send },
  { key: "analytics", label: "تحليلات الإرسال", icon: BarChart3 },
];

export default function EmailCenterPage() {
  const [tab, setTab] = useState<Tab>("settings");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#485869] dark:text-gray-100">مركز البريد الإلكتروني</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">جميع إعدادات وقوالب وتحليلات البريد في مكان واحد</p>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl">
        <div className="border-b border-gray-200 dark:border-[#2a2d36] px-2 sm:px-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-[#34cc30] text-[#34cc30]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-[#485869] dark:hover:text-gray-200"
                }`}
              >
                <t.icon size={16} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {tab === "settings" && <EmailSettingsPage />}
          {tab === "templates" && <EmailTemplatesPage />}
          {tab === "newsletter" && <NewsletterPage />}
          {tab === "analytics" && <EmailAnalyticsPanel />}
        </div>
      </div>
    </div>
  );
}

function EmailAnalyticsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">إحصائيات أداء البريد المرسل من المنصة.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المرسل", value: "—", color: "text-blue-600" },
          { label: "تم التسليم", value: "—", color: "text-green-600" },
          { label: "فشل الإرسال", value: "—", color: "text-red-600" },
          { label: "تم الفتح", value: "—", color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 dark:bg-[#252830] rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        تتطلب التحليلات تفعيل تتبع البريد عبر مزود SMTP (Postmark / SendGrid / Mailgun). فعّل التتبع من تبويب "إعدادات SMTP".
      </div>
    </div>
  );
}
