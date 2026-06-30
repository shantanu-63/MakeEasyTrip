"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeUser, logoutUser } = useData();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logoutUser();
    setShowDropdown(false);
    router.push("/customer");
  };

  const getNavLinkClass = (path: string) =>
    `nav-link ${pathname === path ? "active" : ""}`;

  const getUserInitials = () => {
    if (!activeUser) return "";
    const name = activeUser.fullName || activeUser.email.split("@")[0];
    return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <Link href="/customer" className="logo-link">
          <svg width="280" height="60" viewBox="0 0 350 80" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(10, 5)">
              <clipPath id="header-suitcase-clip">
                <rect x="10" y="18" width="40" height="42" rx="8" />
              </clipPath>
              <rect x="20" y="15" width="4" height="3" rx="1" fill="#0A225C" />
              <rect x="36" y="15" width="4" height="3" rx="1" fill="#0A225C" />
              <path
                d="M 20,13 L 20,7 C 20,4 23,2 26,2 L 34,2 C 37,2 40,4 40,7 L 40,13 L 36,13 L 36,8 C 36,6 34,5 33,5 L 27,5 C 26,5 24,6 24,8 L 24,13 Z"
                fill="#0A225C"
              />
              <rect x="16" y="59" width="6" height="4" rx="2" fill="#0A225C" />
              <rect x="38" y="59" width="6" height="4" rx="2" fill="#0A225C" />
              <g clipPath="url(#header-suitcase-clip)">
                <rect x="10" y="18" width="40" height="42" fill="#FF5E14" />
                <polygon points="10,52 18,60 26,26 34,40 42,28 50,18 50,60 10,60" fill="#0A225C" />
              </g>
              <path
                d="M 40,0 L 25,3 L 15,3 L -10,30 L -18,30 L -12,3 L -28,3 L -33,10 L -37,10 L -34,0 L -37,-10 L -33,-10 L -28,-3 L -12,-3 L -18,-30 L -10,-30 L 15,-3 L 25,-3 Z"
                fill="#FFFFFF"
                transform="translate(23, 44) rotate(-45) scale(0.32)"
              />
            </g>
            <g transform="translate(70, 45)">
              <text fontFamily="Outfit" fontSize="34" fontWeight="800" fill="#0A225C">make</text>
              <text fontFamily="Outfit" fontSize="34" fontWeight="800" fill="#FF5E14" x="84">easy</text>
              <text fontFamily="Outfit" fontSize="34" fontWeight="800" fill="#0A225C" x="156">trip</text>
              <text fontFamily="Inter" fontSize="11" fontWeight="700" letterSpacing="4.5" fill="#475569" x="3" y="18">TRAVEL MADE EASY</text>
            </g>
          </svg>
        </Link>

        {/* Navigation */}
        <nav id="traveler-nav">
          <ul className="nav-links">
            <li><Link href="/customer" className={getNavLinkClass("/customer")}><i className="fa-solid fa-house" /> Home</Link></li>
            <li><Link href="/customer/destinations" className={getNavLinkClass("/customer/destinations")}><i className="fa-solid fa-map-location-dot" /> Destinations</Link></li>
            <li><Link href="/customer/hotels" className={getNavLinkClass("/customer/hotels")}><i className="fa-solid fa-hotel" /> Hotels</Link></li>
            <li><Link href="/customer/activities" className={getNavLinkClass("/customer/activities")}><i className="fa-solid fa-compass" /> Activities</Link></li>
            <li><Link href="/customer#panel-ai" className="nav-link"><i className="fa-solid fa-robot" /> AI Planner</Link></li>
            <li><Link href="/customer/dashboard" className={getNavLinkClass("/customer/dashboard")}><i className="fa-solid fa-briefcase" /> Bookings</Link></li>
          </ul>
        </nav>

        {/* Auth Actions */}
        <div className="header-actions" id="header-auth-actions">
          {activeUser ? (
            <div className="user-menu-container" id="user-header-menu">
              <div
                className="user-dropdown-trigger"
                id="user-header-badge"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-profile-avatar" id="header-avatar-initials">
                  {getUserInitials()}
                </div>
                <span id="header-username-text">{activeUser.fullName}</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: "11px", marginLeft: "4px", color: "var(--color-primary)" }} />
              </div>
              {showDropdown && (
                <ul className="user-dropdown-menu active" id="user-header-dropdown">
                  <li className="user-dropdown-item" onClick={() => { router.push("/customer/dashboard"); setShowDropdown(false); }}>
                    <i className="fa-solid fa-briefcase" /> My Bookings
                  </li>
                  <li className="user-dropdown-item logout" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket" /> Logout
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link href="/customer/auth" className="btn-primary" id="btn-header-login" style={{ padding: "8px 20px", fontSize: "13px" }}>
              <i className="fa-solid fa-right-to-bracket" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
