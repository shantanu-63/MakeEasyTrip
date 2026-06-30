"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  actionButton,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token =
        localStorage.getItem("met_admin_session") ||
        sessionStorage.getItem("met_admin_session");
      try {
        const { getSupabase } = await import("@/core/services/supabase");
        const {
          data: { session },
        } = await getSupabase().auth.getSession();
        if (session?.user) {
          setAdmin({
            fullName:
              session.user.user_metadata?.fullName || "Super Admin",
            email: session.user.email || "admin@makeeasytrip.com",
          });
          return;
        }
      } catch {}
      if (token) {
        try {
          const parsed = JSON.parse(token);
          setAdmin(parsed);
          return;
        } catch {}
      }
      setAdmin({ fullName: "Super Admin", email: "admin@makeeasytrip.com" });
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("met_admin_session");
    sessionStorage.removeItem("met_admin_session");
    try {
      const { getSupabase } = await import("@/core/services/supabase");
      await getSupabase().auth.signOut();
    } catch {}
    router.push("/admin/login");
  };

  const getInitials = () => {
    if (!admin) return "A";
    return admin.fullName
      ? admin.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "A";
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="admin-body" style={{ minHeight: "100vh" }}>
      {/* --- Left Sidebar Navigation --- */}
      <aside className={`admin-sidebar${sidebarOpen ? " active" : ""}`} id="sidebar-menu">
        {/* Sidebar Header / Logo */}
        <div className="admin-sidebar-header">
          <Link href="/admin" className="flex items-center w-full">
            {/* Suitcase Icon SVG */}
            <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(5, 0)">
                <clipPath id="admin-suitcase-clip">
                  <rect x="10" y="18" width="40" height="42" rx="8" />
                </clipPath>
                <rect x="20" y="15" width="4" height="3" rx="1" fill="#FFFFFF" />
                <rect x="36" y="15" width="4" height="3" rx="1" fill="#FFFFFF" />
                <path d="M 20,13 L 20,7 C 20,4 23,2 26,2 L 34,2 C 37,2 40,4 40,7 L 40,13 L 36,13 L 36,8 C 36,6 34,5 33,5 L 27,5 C 26,5 24,6 24,8 L 24,13 Z" fill="#FFFFFF" />
                <rect x="16" y="59" width="6" height="4" rx="2" fill="#FFFFFF" />
                <rect x="38" y="59" width="6" height="4" rx="2" fill="#FFFFFF" />
                <g clipPath="url(#admin-suitcase-clip)">
                  <rect x="10" y="18" width="40" height="42" fill="#FF5E14" />
                  <polygon points="10,52 18,60 26,26 34,40 42,28 50,18 50,60 10,60" fill="#FFFFFF" />
                </g>
                <path d="M 40,0 L 25,3 L 15,3 L -10,30 L -18,30 L -12,3 L -28,3 L -33,10 L -37,10 L -34,0 L -37,-10 L -33,-10 L -28,-3 L -12,-3 L -18,-30 L -10,-30 L 15,-3 L 25,-3 Z" fill="#0A225C" transform="translate(23, 44) rotate(-45) scale(0.32)" />
              </g>
            </svg>
            {/* Brand text */}
            <div className="sidebar-logo-text ml-2 text-left">
              <div className="font-heading font-extrabold text-sm leading-none tracking-tight flex items-center">
                <span className="text-white">make</span>
                <span className="text-secondary ml-1">easy</span>
                <span className="text-white ml-1">trip</span>
              </div>
              <div className="text-[8px] font-bold tracking-[2px] text-slate-400 mt-1 uppercase">Admin Control</div>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="admin-sidebar-menu">
          <span className="menu-heading">Main Hub</span>
          <Link href="/admin" className={`menu-item${isActive("/admin") && pathname === "/admin" ? " active" : ""}`}>
            <i className="fa-solid fa-chart-line text-lg w-5"></i>
            <span className="menu-text">Overview Dashboard</span>
          </Link>

          <span className="menu-heading font-semibold">User Databases</span>
          <Link href="/admin/customer" className={`menu-item${isActive("/admin/customer") ? " active" : ""}`}>
            <i className="fa-solid fa-users text-lg w-5"></i>
            <span className="menu-text">Customers Base</span>
          </Link>
          <Link href="/admin/partner" className={`menu-item${isActive("/admin/partner") ? " active" : ""}`}>
            <i className="fa-solid fa-handshake text-lg w-5"></i>
            <span className="menu-text">Travel Partners</span>
          </Link>

          <span className="menu-heading">Approvals Vetting</span>
          <Link href="/admin/approvals" className={`menu-item flex justify-between${isActive("/admin/approvals") ? " active" : ""}`}>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-hotel text-lg w-5"></i>
              <span className="menu-text">Property Approvals</span>
            </div>
          </Link>

          <span className="menu-heading">Product Managers</span>
          <Link href="/admin/hotels" className={`menu-item${isActive("/admin/hotels") ? " active" : ""}`}>
            <i className="fa-solid fa-building text-lg w-5"></i>
            <span className="menu-text">Hotel Stays</span>
          </Link>
          <Link href="/admin/activities" className={`menu-item${isActive("/admin/activities") ? " active" : ""}`}>
            <i className="fa-solid fa-person-hiking text-lg w-5"></i>
            <span className="menu-text">Experiences</span>
          </Link>

          <span className="menu-heading">Bookings Manager</span>
          <Link href="/admin/bookings" className={`menu-item${isActive("/admin/bookings") ? " active" : ""}`}>
            <i className="fa-solid fa-receipt text-lg w-5"></i>
            <span className="menu-text">Bookings Registry</span>
          </Link>
          <Link href="/admin/bookings/cancellations" className={`menu-item${isActive("/admin/bookings/cancellations") ? " active" : ""}`}>
            <i className="fa-solid fa-ban text-lg w-5"></i>
            <span className="menu-text">Cancellation Claims</span>
          </Link>
          <Link href="/admin/bookings/refunds" className={`menu-item${isActive("/admin/bookings/refunds") ? " active" : ""}`}>
            <i className="fa-solid fa-file-invoice-dollar text-lg w-5"></i>
            <span className="menu-text">Refund Requests</span>
          </Link>

          <span className="menu-heading">Finance Hub</span>
          <Link href="/admin/payment" className={`menu-item${isActive("/admin/payment") ? " active" : ""}`}>
            <i className="fa-solid fa-wallet text-lg w-5"></i>
            <span className="menu-text">Transactions Ledger</span>
          </Link>
          <Link href="/admin/payment/refunds" className={`menu-item${isActive("/admin/payment/refunds") ? " active" : ""}`}>
            <i className="fa-solid fa-arrow-rotate-left text-lg w-5"></i>
            <span className="menu-text">Refund Vetting</span>
          </Link>
          <Link href="/admin/payment/revenue" className={`menu-item${isActive("/admin/payment/revenue") ? " active" : ""}`}>
            <i className="fa-solid fa-file-contract text-lg w-5"></i>
            <span className="menu-text">Revenue &amp; Taxes</span>
          </Link>

          <span className="menu-heading">Feedback Moderation</span>
          <Link href="/admin/reviews" className={`menu-item${isActive("/admin/reviews") ? " active" : ""}`}>
            <i className="fa-solid fa-comments text-lg w-5"></i>
            <span className="menu-text">Reviews Moderation</span>
          </Link>
          <Link href="/admin/reviews/flagged" className={`menu-item${isActive("/admin/reviews/flagged") ? " active" : ""}`}>
            <i className="fa-solid fa-circle-exclamation text-lg w-5"></i>
            <span className="menu-text">Flagged Reports</span>
          </Link>

          <span className="menu-heading">CMS Management</span>
          <Link href="/admin/cms" className={`menu-item${isActive("/admin/cms") ? " active" : ""}`}>
            <i className="fa-solid fa-window-restore text-lg w-5"></i>
            <span className="menu-text">Homepage Banners</span>
          </Link>
          <Link href="/admin/cms/blogs" className={`menu-item${isActive("/admin/cms/blogs") ? " active" : ""}`}>
            <i className="fa-solid fa-blog text-lg w-5"></i>
            <span className="menu-text">Blog Editor</span>
          </Link>
          <Link href="/admin/cms/faq" className={`menu-item${isActive("/admin/cms/faq") ? " active" : ""}`}>
            <i className="fa-solid fa-circle-question text-lg w-5"></i>
            <span className="menu-text">FAQ Manager</span>
          </Link>
          <Link href="/admin/cms/terms" className={`menu-item${isActive("/admin/cms/terms") ? " active" : ""}`}>
            <i className="fa-solid fa-gavel text-lg w-5"></i>
            <span className="menu-text">Terms Editor</span>
          </Link>
          <Link href="/admin/cms/privacy" className={`menu-item${isActive("/admin/cms/privacy") ? " active" : ""}`}>
            <i className="fa-solid fa-user-shield text-lg w-5"></i>
            <span className="menu-text">Privacy Policy</span>
          </Link>

          <span className="menu-heading">AI Engine Control</span>
          <Link href="/admin/ai/prompts" className={`menu-item${isActive("/admin/ai/prompts") ? " active" : ""}`}>
            <i className="fa-solid fa-gears text-lg w-5"></i>
            <span className="menu-text">Prompt Templates</span>
          </Link>
          <Link href="/admin/ai/usage" className={`menu-item${isActive("/admin/ai/usage") ? " active" : ""}`}>
            <i className="fa-solid fa-database text-lg w-5"></i>
            <span className="menu-text">AI Usage Logs</span>
          </Link>
          <Link href="/admin/ai/cost" className={`menu-item${isActive("/admin/ai/cost") ? " active" : ""}`}>
            <i className="fa-solid fa-chart-pie text-lg w-5"></i>
            <span className="menu-text">AI Cost Controls</span>
          </Link>

          <span className="menu-heading">Notifications</span>
          <Link href="/admin/notifications" className={`menu-item${isActive("/admin/notifications") ? " active" : ""}`}>
            <i className="fa-solid fa-bell text-lg w-5"></i>
            <span className="menu-text">Notif. Dashboard</span>
          </Link>
          <Link href="/admin/notifications/email" className={`menu-item${isActive("/admin/notifications/email") ? " active" : ""}`}>
            <i className="fa-solid fa-envelope text-lg w-5"></i>
            <span className="menu-text">Email Templates</span>
          </Link>
          <Link href="/admin/notifications/sms" className={`menu-item${isActive("/admin/notifications/sms") ? " active" : ""}`}>
            <i className="fa-solid fa-comment-sms text-lg w-5"></i>
            <span className="menu-text">SMS Templates</span>
          </Link>
          <Link href="/admin/notifications/push" className={`menu-item${isActive("/admin/notifications/push") ? " active" : ""}`}>
            <i className="fa-solid fa-mobile-screen text-lg w-5"></i>
            <span className="menu-text">Push Templates</span>
          </Link>
          <Link href="/admin/notifications/logs" className={`menu-item${isActive("/admin/notifications/logs") ? " active" : ""}`}>
            <i className="fa-solid fa-list-check text-lg w-5"></i>
            <span className="menu-text">Delivery Logs</span>
          </Link>
          <Link href="/admin/notifications/broadcast" className={`menu-item${isActive("/admin/notifications/broadcast") ? " active" : ""}`}>
            <i className="fa-solid fa-bullhorn text-lg w-5"></i>
            <span className="menu-text">Broadcast Composer</span>
          </Link>

          <span className="menu-heading">Reports &amp; Analytics</span>
          <Link href="/admin/reports/business" className={`menu-item${isActive("/admin/reports/business") ? " active" : ""}`}>
            <i className="fa-solid fa-chart-column text-lg w-5"></i>
            <span className="menu-text">Business Reports</span>
          </Link>
          <Link href="/admin/reports/partner" className={`menu-item${isActive("/admin/reports/partner") ? " active" : ""}`}>
            <i className="fa-solid fa-users-gear text-lg w-5"></i>
            <span className="menu-text">Partner Analytics</span>
          </Link>
          <Link href="/admin/reports/customer" className={`menu-item${isActive("/admin/reports/customer") ? " active" : ""}`}>
            <i className="fa-solid fa-user-group text-lg w-5"></i>
            <span className="menu-text">Customer Analytics</span>
          </Link>
          <Link href="/admin/reports/export" className={`menu-item${isActive("/admin/reports/export") ? " active" : ""}`}>
            <i className="fa-solid fa-file-export text-lg w-5"></i>
            <span className="menu-text">Export Center</span>
          </Link>

          <span className="menu-heading">Support &amp; Help Desk</span>
          <Link href="/admin/support" className={`menu-item${isActive("/admin/support") && pathname === "/admin/support" ? " active" : ""}`}>
            <i className="fa-solid fa-ticket text-lg w-5"></i>
            <span className="menu-text">Support Tickets</span>
          </Link>
          <Link href="/admin/support/details" className={`menu-item${isActive("/admin/support/details") ? " active" : ""}`}>
            <i className="fa-solid fa-headset text-lg w-5"></i>
            <span className="menu-text">Ticket Details</span>
          </Link>
          <Link href="/admin/support/escalations" className={`menu-item${isActive("/admin/support/escalations") ? " active" : ""}`}>
            <i className="fa-solid fa-fire text-lg w-5"></i>
            <span className="menu-text">Escalations</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 text-[11px] text-white/45 font-medium flex justify-between items-center">
          <span>System v4.0.0</span>
          <button onClick={handleLogout} className="text-danger hover:underline">
            <i className="fa-solid fa-power-off"></i> Exit
          </button>
        </div>
      </aside>

      {/* --- Right Workspace --- */}
      <div className="admin-workspace">
        {/* Header */}
        <header className="admin-header">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-primary text-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <i className={`fa-solid ${sidebarOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Live Operations Console</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Admin user details + dropdown */}
            <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {getInitials()}
                </div>
                <div className="hidden sm:block text-left">
                  <h4 className="text-xs font-bold text-primary leading-none" id="admin-header-name">
                    {admin?.fullName || "Super Admin"}
                  </h4>
                  <span className="text-[10px] text-text-muted">Master Operator</span>
                </div>
                <i className="fa-solid fa-caret-down text-xs text-text-muted"></i>
              </div>
              {showDropdown && (
                <ul className="absolute right-0 top-12 w-48 bg-white border border-border rounded-xl shadow-lg py-2 text-xs font-bold z-50" id="admin-user-dropdown-menu">
                  <li className="px-4 py-2 text-text-muted border-b border-border">
                    <div className="font-bold text-primary truncate">{admin?.fullName || "Super Admin"}</div>
                    <div className="text-[10px] font-normal truncate">{admin?.email || "admin@makeeasytrip.com"}</div>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-power-off text-danger mr-2"></i> Log Out
                  </li>
                </ul>
              )}
            </div>
          </div>
        </header>

        {/* Mobile overlay to close sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-90 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Canvas */}
        <main className="admin-main-content">
          {/* Optional page title bar */}
          {title && (
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-primary font-heading">{title}</h2>
                {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
              </div>
              {actionButton && <div>{actionButton}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
