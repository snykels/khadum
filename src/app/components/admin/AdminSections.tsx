'use client';

import { useState, ReactNode } from "react";
import AdminOverview from "./AdminOverview";
import AdminAnalytics from "./AdminAnalytics";
import SupportHub from "./SupportHub";
import EmailCenterPage from "./EmailCenterPage";
import PaymentLogsPage from "./PaymentLogsPage";
import EscalationsPage from "./EscalationsPage";
import AdminPayouts from "./AdminPayouts";
import {
  FreelancersManagementPage, ClientsManagementPage, StaffManagementPage,
  SuspendedUsersPage, PublishedServicesPage, PendingServicesPage,
  CategoriesManagementPage, AllOrdersPage, ActiveOrdersPage,
  CancelledOrdersPage, WalletsPage, AdminWithdrawalsPage,
  AdminTransactionsPage, AdminInvoicesPage, AdminPaymentLinksPage,
} from "./AdminPages";
import {
  CouponsPage, RevenuePage, StaticPagesPage, BlogPage, BannersPage,
  MassNotificationsPage, GeneralSettingsPage, FeesPage, PaymentGatewaysPage,
  MessagingSettingsPage, SubscriptionsManagementPage, AdminSecurityPage,
  SeoPage, AuditLogPage, LandingSettingsPage, RejectionStatsPage,
  EmailSettingsPage, AISettingsPage,
} from "./AdminPagesExtra";
import {
  OrderTransferPage, RefundRequestsPage, ApplicationsPage,
  AdminCertificatesPage,
} from "./AdminPagesNew";
import { InvitesPage } from "./AdminPagesInvitesEmail";
import {
  AdminLeakAttemptsPage,
  AdminInterventionsPage, AdminQuickRepliesPage, AdminCleanupPage,
  AdminPaymentSessionsPage,
} from "./AdminBrokerage";
import UnifiedInbox from "./UnifiedInbox";

/* ─────────────────────────────────────────────
   SectionLayout — واجهة التبويبات المشتركة
───────────────────────────────────────────── */
interface Tab { id: string; label: string; badge?: number; content: ReactNode }

function SectionLayout({ tabs, storageKey }: { tabs: Tab[]; storageKey: string }) {
  const [active, setActive] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(storageKey);
      if (saved && tabs.some(t => t.id === saved)) return saved;
    }
    return tabs[0].id;
  });

  const handleTab = (id: string) => {
    setActive(id);
    try { sessionStorage.setItem(storageKey, id); } catch {}
  };

  const current = tabs.find(t => t.id === active) || tabs[0];

  return (
    <div className="flex flex-col min-h-full">
      {/* شريط التبويبات */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1a1d24] border-b border-gray-100 dark:border-[#2a2d36] overflow-x-auto">
        <div className="flex items-center px-4 gap-0.5 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[13.5px] font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                active === tab.id
                  ? "border-[#34cc30] text-[#485869] dark:text-white"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-[#485869] dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-[#34cc30] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      {/* المحتوى */}
      <div className="flex-1 p-4 sm:p-6">{current.content}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   1. قسم الرئيسية
───────────────────────────────────────────── */
export function OverviewSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_overview"
      tabs={[
        { id: "overview",   label: "نظرة عامة",  content: <AdminOverview /> },
        { id: "analytics",  label: "التحليلات",   content: <AdminAnalytics /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   2. صندوق الوارد الموحد
───────────────────────────────────────────── */
export function InboxSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_inbox"
      tabs={[
        { id: "unified",        label: "صندوق الوارد الموحد", content: <UnifiedInbox /> },
        { id: "support",        label: "مركز الدعم",         content: <SupportHub /> },
        { id: "escalations",    label: "تصعيدات واتساب",     content: <EscalationsPage /> },
        { id: "leaks",          label: "محاولات التسريب",    content: <AdminLeakAttemptsPage /> },
        { id: "interventions",  label: "تدخلات الإدارة",     content: <AdminInterventionsPage /> },
        { id: "rejections",     label: "أسباب رفض العروض",  content: <RejectionStatsPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   3. المستخدمون
───────────────────────────────────────────── */
export function UsersSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_users"
      tabs={[
        { id: "freelancers",    label: "المستقلون",          content: <FreelancersManagementPage /> },
        { id: "clients",        label: "العملاء",            content: <ClientsManagementPage /> },
        { id: "staff",          label: "المشرفون والأدوار",  content: <StaffManagementPage /> },
        { id: "applications",   label: "طلبات التسجيل",      content: <ApplicationsPage /> },
        { id: "certificates",   label: "الشهادات",           content: <AdminCertificatesPage /> },
        { id: "invites",        label: "الدعوات",            content: <InvitesPage /> },
        { id: "suspended",      label: "الموقوفون",          content: <SuspendedUsersPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   4. الطلبات والخدمات
───────────────────────────────────────────── */
export function OrdersSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_orders"
      tabs={[
        { id: "all",        label: "كل الطلبات",          content: <AllOrdersPage /> },
        { id: "active",     label: "الطلبات النشطة",       content: <ActiveOrdersPage /> },
        { id: "cancelled",  label: "الملغاة",              content: <CancelledOrdersPage /> },
        { id: "transfers",  label: "الطلبات المحوّلة",      content: <OrderTransferPage /> },
        { id: "services",   label: "الخدمات المنشورة",      content: <PublishedServicesPage /> },
        { id: "pending",    label: "بانتظار الموافقة",      content: <PendingServicesPage /> },
        { id: "categories", label: "التصنيفات",            content: <CategoriesManagementPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   5. المالية
───────────────────────────────────────────── */
export function FinanceSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_finance"
      tabs={[
        { id: "wallets",        label: "المحافظ",           content: <WalletsPage /> },
        { id: "withdrawals",    label: "السحوبات",          content: <AdminWithdrawalsPage /> },
        { id: "transactions",   label: "المعاملات",         content: <AdminTransactionsPage /> },
        { id: "invoices",       label: "الفواتير",          content: <AdminInvoicesPage /> },
        { id: "payment-links",  label: "روابط الدفع",       content: <AdminPaymentLinksPage /> },
        { id: "sessions",       label: "جلسات الدفع",       content: <AdminPaymentSessionsPage /> },
        { id: "payouts",        label: "التحويلات البنكية", content: <AdminPayouts /> },
        { id: "refunds",        label: "طلبات الاسترداد",   content: <RefundRequestsPage /> },
        { id: "revenue",        label: "تقارير الإيرادات",  content: <RevenuePage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   6. المحتوى والصفحات
───────────────────────────────────────────── */
export function ContentSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_content"
      tabs={[
        { id: "pages",    label: "الصفحات الثابتة",  content: <StaticPagesPage /> },
        { id: "blog",     label: "المدونة",           content: <BlogPage /> },
        { id: "banners",  label: "البانرات",          content: <BannersPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   7. التسويق
───────────────────────────────────────────── */
export function MarketingSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_marketing"
      tabs={[
        { id: "notifications", label: "الإشعارات الجماعية", content: <MassNotificationsPage /> },
        { id: "email",         label: "مركز البريد",         content: <EmailCenterPage /> },
        { id: "coupons",       label: "الكوبونات",           content: <CouponsPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   8. الأتمتة
───────────────────────────────────────────── */
export function AutomationSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_automation"
      tabs={[
        { id: "whatsapp",      label: "واتساب",             content: <MessagingSettingsPage /> },
        { id: "ai",            label: "الذكاء الاصطناعي",   content: <AISettingsPage /> },
        { id: "quick-replies", label: "الردود السريعة",      content: <AdminQuickRepliesPage /> },
      ]}
    />
  );
}

/* ─────────────────────────────────────────────
   9. الإعدادات
───────────────────────────────────────────── */
export function SettingsSection() {
  return (
    <SectionLayout
      storageKey="admin_tab_settings"
      tabs={[
        { id: "general",      label: "عامة",                   content: <GeneralSettingsPage /> },
        { id: "fees",         label: "العمولات",                content: <FeesPage /> },
        { id: "payment",      label: "بوابات الدفع",            content: <PaymentGatewaysPage /> },
        { id: "email",        label: "البريد الإلكتروني",        content: <EmailSettingsPage /> },
        { id: "security",     label: "الأمان",                  content: <AdminSecurityPage /> },
        { id: "seo",          label: "تحسين محركات البحث",      content: <SeoPage /> },
        { id: "landing",      label: "الصفحة الرئيسية",         content: <LandingSettingsPage /> },
        { id: "subscriptions",label: "الباقات",                 content: <SubscriptionsManagementPage /> },
        { id: "audit",        label: "سجل الأنشطة",             content: <AuditLogPage /> },
        { id: "cleanup",      label: "تنظيف البيانات القديمة",   content: <AdminCleanupPage /> },
      ]}
    />
  );
}
