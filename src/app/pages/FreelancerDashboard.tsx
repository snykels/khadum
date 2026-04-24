'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import FreelancerSidebar from "../components/freelancer/FreelancerSidebar";
import FreelancerHeader from "../components/freelancer/FreelancerHeader";
import FreelancerOverview from "../components/freelancer/FreelancerOverviewLive";
import {
  ProfilePage, OrdersPage, MessagesPage, ServicesPage, PortfolioPage,
  SkillsPage, ReviewsPage, WalletPage, InvoicesPage, EarningsPage,
  WithdrawalsPage, SettingsPage, NotificationsSettingsPage, SecurityPage,
  WhatsAppSettingsPage, AvailabilityPage, SupportPage
} from "../components/freelancer/FreelancerPages";
import { FreelancerNotificationsPage } from "../components/freelancer/FreelancerNotifications";

const pageMap: Record<string, React.ReactNode> = {
  "/freelancer": <FreelancerOverview />,
  "/freelancer/alerts": <FreelancerNotificationsPage />,
  "/freelancer/profile": <ProfilePage />,
  "/freelancer/orders": <OrdersPage />,
  "/freelancer/messages": <MessagesPage />,
  "/freelancer/services": <ServicesPage />,
  "/freelancer/portfolio": <PortfolioPage />,
  "/freelancer/skills": <SkillsPage />,
  "/freelancer/reviews": <ReviewsPage />,
  "/freelancer/wallet": <WalletPage />,
  "/freelancer/invoices": <InvoicesPage />,
  "/freelancer/earnings": <EarningsPage />,
  "/freelancer/withdrawals": <WithdrawalsPage />,
  "/freelancer/settings": <SettingsPage />,
  "/freelancer/notifications": <NotificationsSettingsPage />,
  "/freelancer/security": <SecurityPage />,
  "/freelancer/whatsapp": <WhatsAppSettingsPage />,
  "/freelancer/availability": <AvailabilityPage />,
  "/freelancer/support": <SupportPage />,
};

export default function FreelancerDashboard() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("freelancer_sidebar_collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("freelancer_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const currentPage = pageMap[pathname] || <FreelancerOverview />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111318] flex">
      <FreelancerSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 overflow-x-auto">
        <FreelancerHeader onMobileMenu={() => setMobileOpen(true)} />
        <main className="p-3 sm:p-4 md:p-6">
          {currentPage}
        </main>
      </div>
    </div>
  );
}
