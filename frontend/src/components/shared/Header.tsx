"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeUser, logoutUser } = useData();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    logoutUser();
    setShowDropdown(false);
    setMobileNavOpen(false);
    router.push("/customer");
  };

  const getNavLinkClass = (path: string) =>
    `nav-link ${pathname === path ? "active" : ""}`;

  const getUserInitials = () => {
    if (!activeUser) return "";
    const name = activeUser.fullName || activeUser.email.split("@")[0];
    return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { href: "/customer", icon: "fa-house", label: "Home" },
    { href: "/customer/destinations", icon: "fa-map-location-dot", label: "Destinations" },
    { href: "/customer/hotels", icon: "fa-hotel", label: "Hotels" },
    { href: "/customer/activities", icon: "fa-compass", label: "Activities" },
    { href: "/customer#panel-ai", icon: "fa-robot", label: "AI Planner", exact: false },
    { href: "/customer/dashboard", icon: "fa-briefcase", label: "Bookings" },
  ];

  return (
    <>
      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          className="mobile-nav-overlay open"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="app-header">
        <div className="container header-container">
          {/* Brand Logo */}
          <Link href="/customer" className="logo-link" aria-label="MakeEasyTrip Home">
            <img
              src="/logo/logo.png"
              alt="MakeEasyTrip Logo"
              className="w-[130px] sm:w-[155px] md:w-[160px] lg:w-[190px] h-auto object-contain block"
            />
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav
            className="hidden lg:block"
            aria-label="Desktop navigation"
          >
            <ul className="nav-links" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={link.exact === false ? "nav-link" : getNavLinkClass(link.href)}
                  >
                    <i className={`fa-solid ${link.icon}`} aria-hidden="true" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Navigation Drawer (Hidden on Desktop) */}
          <nav
            id="traveler-nav"
            className={`lg:hidden ${mobileNavOpen ? "mobile-open block" : "hidden"}`}
            aria-label="Mobile navigation"
          >
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={link.exact === false ? "nav-link" : getNavLinkClass(link.href)}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <i className={`fa-solid ${link.icon}`} aria-hidden="true" /> {link.label}
                  </Link>
                </li>
              ))}
              {/* Mobile-only Sign In button */}
              {!activeUser && (
                <li style={{ marginTop: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
                  <Link
                    href="/customer/auth"
                    className="btn-primary"
                    style={{ display: "inline-flex", justifyContent: "center", width: "100%" }}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Header Actions (Auth Badge / Sign In button) */}
          <div className="header-actions" id="header-auth-actions">
            {activeUser ? (
              <div className="user-menu-container" id="user-header-menu">
                <div
                  className="user-dropdown-trigger"
                  id="user-header-badge"
                  onClick={() => setShowDropdown(!showDropdown)}
                  role="button"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setShowDropdown(!showDropdown)}
                >
                  <div className="user-profile-avatar" id="header-avatar-initials">
                    {getUserInitials()}
                  </div>
                  <span id="header-username-text" className="hidden lg:inline-block">
                    {activeUser.fullName}
                  </span>
                  <i className="fa-solid fa-chevron-down" aria-hidden="true" style={{ fontSize: "11px", marginLeft: "4px", color: "var(--color-primary)" }} />
                </div>
                {showDropdown && (
                  <ul className="user-dropdown-menu active" id="user-header-dropdown" role="menu">
                    <li
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => { router.push("/customer/dashboard"); setShowDropdown(false); }}
                      tabIndex={0}
                    >
                      <i className="fa-solid fa-briefcase" aria-hidden="true" /> My Bookings
                    </li>
                    <li
                      className="user-dropdown-item logout"
                      role="menuitem"
                      onClick={handleLogout}
                      tabIndex={0}
                    >
                      <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Logout
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link
                href="/customer/auth"
                className="btn-primary hidden lg:inline-flex"
                id="btn-header-login"
                style={{ padding: "8px 20px", fontSize: "13px" }}
              >
                <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Sign In
              </Link>
            )}

            {/* Hamburger Menu Toggle (Hidden on Desktop) */}
            <button
              className={`hamburger-btn lg:hidden${mobileNavOpen ? " open" : ""}`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="traveler-nav"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
