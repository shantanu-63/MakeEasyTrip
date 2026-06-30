"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface PartnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export default function PartnerLayout({
  children,
  title,
  subtitle,
  actionButton,
}: PartnerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [partner, setPartner] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const checkPartner = async () => {
      const storedPartner = localStorage.getItem("met_partner_session");

      // Try Supabase session first (lazy-loaded to avoid static import)
      try {
        const { getSupabase } = await import("@/core/services/supabase");
        const {
          data: { session },
        } = await getSupabase().auth.getSession();
        if (session?.user) {
          setPartner({
            ownerName:
              session.user.user_metadata?.fullName ||
              session.user.email?.split("@")[0] ||
              "Partner Owner",
            businessName: "Indo-Global Travel DMC Ltd",
            email: session.user.email,
          });
          return;
        }
      } catch {}

      if (storedPartner) {
        try {
          const parsed = JSON.parse(storedPartner);
          setPartner(parsed);
          return;
        } catch {}
      }

      // Default fallback partner for visual demo
      setPartner({
        ownerName: "Rajesh Kumar",
        businessName: "Sunset Villa & Resorts",
        email: "rajesh@sunsetvilla.com",
      });
    };

    checkPartner();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem("met_partner_session");
    sessionStorage.removeItem("met_partner_session");
    try {
      const { getSupabase } = await import("@/core/services/supabase");
      await getSupabase().auth.signOut();
    } catch {}
    router.push("/partner/auth");
  };

  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(path + "/");
    return `nav-link${isActive ? " active" : ""}`;
  };

  const getInitials = () => {
    if (!partner) return "P";
    return partner.ownerName
      ? partner.ownerName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "P";
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      {/* Sticky Application Header */}
      <header className="app-header">
        <div className="container header-container">
          {/* Brand Logo */}
          <Link href="/partner" className="logo-link">
            <img src="/assets/logos/logo.svg" alt="Make Easy Trip Logo" style={{ height: "50px" }} />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            className="partner-hamburger"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`fa-solid ${mobileNavOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>

          {/* Navigation Links */}
          <nav className={`partner-nav${mobileNavOpen ? " open" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link
                  href="/partner"
                  className={pathname === "/partner" ? "nav-link active" : "nav-link"}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <i className="fa-solid fa-chart-line"></i> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/partner/properties" className={getNavLinkClass("/partner/properties")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-hotel"></i> Stays
                </Link>
              </li>
              <li>
                <Link href="/partner/bookings" className={getNavLinkClass("/partner/bookings")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-calendar-check"></i> Bookings
                </Link>
              </li>
              <li>
                <Link href="/partner/revenue" className={getNavLinkClass("/partner/revenue")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-indian-rupee-sign"></i> Revenue
                </Link>
              </li>
              <li>
                <Link href="/partner/reviews" className={getNavLinkClass("/partner/reviews")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-star"></i> Reviews
                </Link>
              </li>
              <li>
                <Link href="/partner/documents" className={getNavLinkClass("/partner/documents")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-file-shield"></i> Documents
                </Link>
              </li>
              <li>
                <Link href="/partner/support" className={getNavLinkClass("/partner/support")} onClick={() => setMobileNavOpen(false)}>
                  <i className="fa-solid fa-headset"></i> Support
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Actions & Dropdown Menu */}
          <div className="header-actions">
            <div className="user-menu-container">
              <div className="user-dropdown-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-profile-badge">
                  <div className="user-profile-avatar" id="avatar-initials">
                    {getInitials()}
                  </div>
                  <span id="header-owner-name">{partner?.ownerName || "Loading..."}</span>
                  <i className="fa-solid fa-caret-down"></i>
                </div>
              </div>

              {showDropdown && (
                <ul className="user-dropdown-menu active" id="user-dropdown-menu">
                  <li className="px-4 py-3 border-b border-slate-100">
                    <div className="font-bold text-sm text-primary truncate">{partner?.ownerName || "Partner"}</div>
                    <div className="text-xs text-text-muted truncate">{partner?.email || ""}</div>
                    <div className="text-[10px] text-text-muted font-medium mt-0.5 truncate">{partner?.businessName || ""}</div>
                  </li>
                  <li>
                    <Link href="/partner/profile" className="user-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <i className="fa-solid fa-user-gear"></i> Edit Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/partner" className="user-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <i className="fa-solid fa-table-columns"></i> Dashboard
                    </Link>
                  </li>
                  <li className="user-dropdown-item logout" onClick={handleSignOut}>
                    <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main content body viewport */}
      <main className="container" style={{ flex: 1, padding: "32px 24px" }}>
        {/* Hub Title header */}
        <div className="dashboard-header-bar">
          <div className="dashboard-header-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {children}
      </main>
    </div>
  );
}
