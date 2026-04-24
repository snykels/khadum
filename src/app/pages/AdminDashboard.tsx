'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminOverview from "../components/admin/AdminOverview";
<<<<<<< HEAD
import { ConfirmProvider } from "../components/ui/Modal";
import {
  OverviewSection, InboxSection, UsersSection, OrdersSection,
  FinanceSection, ContentSection, MarketingSection, AutomationSection,
  SettingsSection,
} from "../components/admin/AdminSections";

/* ─────────────────────────────────────────────
   خريطة المسارات — الأقسام الرئيسية الجديدة
   + المسارات القديمة للتوافق مع الروابط المحفوظة
───────────────────────────────────────────── */
const pageMap: Record<string, React.ReactNode> = {
  /* ── أقسام جديدة ── */
  "/admin":              <OverviewSection />,
  "/admin/inbox":        <InboxSection />,
  "/admin/users":        <UsersSection />,
  "/admin/orders":       <OrdersSection />,
  "/admin/finance":      <FinanceSection />,
  "/admin/content":      <ContentSection />,
  "/admin/marketing":    <MarketingSection />,
  "/admin/automation":   <AutomationSection />,
  "/admin/settings":     <SettingsSection />,

  /* ── روابط قديمة — تعيد للقسم الصحيح (توافق) ── */
  "/admin/analytics":         <OverviewSection />,
  "/admin/conversations":     <InboxSection />,
  "/admin/disputes":          <InboxSection />,
  "/admin/legacy-disputes":   <InboxSection />,
  "/admin/support":           <InboxSection />,
  "/admin/support-tickets":   <InboxSection />,
  "/admin/escalations":       <InboxSection />,
  "/admin/leak-attempts":     <InboxSection />,
  "/admin/interventions":     <InboxSection />,
  "/admin/quick-replies":     <AutomationSection />,
  "/admin/freelancers":       <UsersSection />,
  "/admin/clients":           <UsersSection />,
  "/admin/staff":             <UsersSection />,
  "/admin/applications":      <UsersSection />,
  "/admin/suspended":         <UsersSection />,
  "/admin/invites":           <UsersSection />,
  "/admin/active-orders":     <OrdersSection />,
  "/admin/cancelled-orders":  <OrdersSection />,
  "/admin/order-transfers":   <OrdersSection />,
  "/admin/services":          <OrdersSection />,
  "/admin/pending-services":  <OrdersSection />,
  "/admin/categories":        <OrdersSection />,
  "/admin/keywords":          <OrdersSection />,
  "/admin/wallets":           <FinanceSection />,
  "/admin/withdrawals":       <FinanceSection />,
  "/admin/transactions":      <FinanceSection />,
  "/admin/invoices":          <FinanceSection />,
  "/admin/payment-links":     <FinanceSection />,
  "/admin/payment-sessions":  <FinanceSection />,
  "/admin/payment-logs":      <FinanceSection />,
  "/admin/payouts":           <FinanceSection />,
  "/admin/refund-requests":   <FinanceSection />,
  "/admin/revenue":           <FinanceSection />,
  "/admin/pages":             <ContentSection />,
  "/admin/blog":              <ContentSection />,
  "/admin/banners":           <ContentSection />,
  "/admin/mass-notifications":<MarketingSection />,
  "/admin/email-center":      <MarketingSection />,
  "/admin/email-settings":    <MarketingSection />,
  "/admin/email-templates":   <MarketingSection />,
  "/admin/newsletter":        <MarketingSection />,
  "/admin/coupons":           <MarketingSection />,
  "/admin/messaging":         <AutomationSection />,
  "/admin/rejection-stats":   <InboxSection />,
  "/admin/general-settings":  <SettingsSection />,
  "/admin/fees":              <SettingsSection />,
  "/admin/payment-gateways":  <SettingsSection />,
  "/admin/security":          <SettingsSection />,
  "/admin/seo":               <SettingsSection />,
  "/admin/landing-settings":  <SettingsSection />,
  "/admin/subscriptions":     <SettingsSection />,
  "/admin/audit-log":         <SettingsSection />,
  "/admin/data-cleanup":      <SettingsSection />,
=======
import {
  FreelancersManagementPage, ClientsManagementPage, StaffManagementPage,
  VerificationsPage, SuspendedUsersPage, PublishedServicesPage,
  PendingServicesPage, CategoriesManagementPage, KeywordsPage,
  AllOrdersPage, ActiveOrdersPage, DisputesPage, CancelledOrdersPage,
  WalletsPage, AdminWithdrawalsPage,
  AdminTransactionsPage, AdminInvoicesPage, AdminPaymentLinksPage
} from "../components/admin/AdminPages";
import {
  TransactionsPage, CouponsPage, RevenuePage, StaticPagesPage, BlogPage,
  BannersPage, NewsletterPage, MassNotificationsPage, GeneralSettingsPage,
  FeesPage, PaymentGatewaysPage, EmailSettingsPage, MessagingSettingsPage,
  SubscriptionsManagementPage, AdminSecurityPage, SeoPage, AuditLogPage,
  RejectionStatsPage
} from "../components/admin/AdminPagesExtra";
import {
  AdminSupportTicketsPage, OrderTransferPage, RefundRequestsPage, ApplicationsPage
} from "../components/admin/AdminPagesNew";
import { InvitesPage, EmailTemplatesPage } from "../components/admin/AdminPagesInvitesEmail";
import SupportHub from "../components/admin/SupportHub";
import EmailCenterPage from "../components/admin/EmailCenterPage";
import PaymentLogsPage from "../components/admin/PaymentLogsPage";
import {
  AdminConversationsPage, AdminDisputesPage, AdminLeakAttemptsPage,
  AdminInterventionsPage, AdminQuickRepliesPage, AdminCleanupPage,
  AdminPaymentSessionsPage
} from "../components/admin/AdminBrokerage";
import EscalationsPage from "../components/admin/EscalationsPage";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminPayouts from "../components/admin/AdminPayouts";
import { ConfirmProvider } from "../components/ui/Modal";

const pageMap: Record<string, React.ReactNode> = {
  "/admin": <AdminOverview />,
  "/admin/analytics": <AdminAnalytics />,
  "/admin/support": <SupportHub />,
  "/admin/support-tickets": <AdminSupportTicketsPage />,
  "/admin/order-transfers": <OrderTransferPage />,
  "/admin/refund-requests": <RefundRequestsPage />,
  "/admin/applications": <ApplicationsPage />,
  "/admin/freelancers": <FreelancersManagementPage />,
  "/admin/clients": <ClientsManagementPage />,
  "/admin/staff": <StaffManagementPage />,
  "/admin/suspended": <SuspendedUsersPage />,
  "/admin/services": <PublishedServicesPage />,
  "/admin/pending-services": <PendingServicesPage />,
  "/admin/categories": <CategoriesManagementPage />,
  "/admin/keywords": <KeywordsPage />,
  "/admin/orders": <AllOrdersPage />,
  "/admin/active-orders": <ActiveOrdersPage />,
  "/admin/disputes": <AdminDisputesPage />,
  "/admin/legacy-disputes": <DisputesPage />,
  "/admin/conversations": <AdminConversationsPage />,
  "/admin/leak-attempts": <AdminLeakAttemptsPage />,
  "/admin/escalations": <EscalationsPage />,
  "/admin/interventions": <AdminInterventionsPage />,
  "/admin/quick-replies": <AdminQuickRepliesPage />,
  "/admin/data-cleanup": <AdminCleanupPage />,
  "/admin/cancelled-orders": <CancelledOrdersPage />,
  "/admin/wallets": <WalletsPage />,
  "/admin/withdrawals": <AdminWithdrawalsPage />,
  "/admin/transactions": <AdminTransactionsPage />,
  "/admin/invoices": <AdminInvoicesPage />,
  "/admin/payment-links": <AdminPaymentLinksPage />,
  "/admin/payment-sessions": <AdminPaymentSessionsPage />,
  "/admin/payment-logs": <PaymentLogsPage />,
  "/admin/payouts": <AdminPayouts />,
  "/admin/coupons": <CouponsPage />,
  "/admin/revenue": <RevenuePage />,
  "/admin/pages": <StaticPagesPage />,
  "/admin/blog": <BlogPage />,
  "/admin/banners": <BannersPage />,
  "/admin/newsletter": <NewsletterPage />,
  "/admin/mass-notifications": <MassNotificationsPage />,
  "/admin/general-settings": <GeneralSettingsPage />,
  "/admin/fees": <FeesPage />,
  "/admin/payment-gateways": <PaymentGatewaysPage />,
  "/admin/email-center": <EmailCenterPage />,
  "/admin/email-settings": <EmailCenterPage />,
  "/admin/email-templates": <EmailCenterPage />,
  "/admin/newsletter": <EmailCenterPage />,
  "/admin/messaging": <MessagingSettingsPage />,
  "/admin/subscriptions": <SubscriptionsManagementPage />,
  "/admin/security": <AdminSecurityPage />,
  "/admin/seo": <SeoPage />,
  "/admin/audit-log": <AuditLogPage />,
  "/admin/rejection-stats": <RejectionStatsPage />,
  "/admin/invites": <InvitesPage />,
  "/admin/email-templates": <EmailTemplatesPage />,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
};

export default function AdminDashboard() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
<<<<<<< HEAD

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "1");
  }, []);
<<<<<<< HEAD

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);
<<<<<<< HEAD

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const currentPage = pageMap[pathname] ?? <OverviewSection />;
=======
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const currentPage = pageMap[pathname] || <AdminOverview />;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#111318] flex">
<<<<<<< HEAD
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <AdminHeader onMobileMenu={() => setMobileOpen(true)} />
          <main>
=======
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 overflow-x-auto">
          <AdminHeader onMobileMenu={() => setMobileOpen(true)} />
          <main className="p-3 sm:p-4 md:p-6">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
            {currentPage}
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
