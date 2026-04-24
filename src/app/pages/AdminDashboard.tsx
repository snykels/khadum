'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminOverview from "../components/admin/AdminOverview";
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
  AdminInterventionsPage, AdminQuickRepliesPage, AdminCleanupPage
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
};

export default function AdminDashboard() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const currentPage = pageMap[pathname] || <AdminOverview />;

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#111318] flex">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 overflow-x-auto">
          <AdminHeader onMobileMenu={() => setMobileOpen(true)} />
          <main className="p-3 sm:p-4 md:p-6">
            {currentPage}
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
