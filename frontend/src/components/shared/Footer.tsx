"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const handleShortcutSearch = (city: string) => {
    // Navigate to hotels catalog with city search prefilled
    router.push(`/customer/hotels?city=${encodeURIComponent(city)}`);
  };

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Branding column */}
          <div className="footer-logo-box">
            <svg width="240" height="50" viewBox="0 0 350 80" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10, 5)">
                <clipPath id="footer-suitcase-clip">
                  <rect x="10" y="18" width="40" height="42" rx="8" />
                </clipPath>
                <rect x="20" y="15" width="4" height="3" rx="1" fill="#FFFFFF" />
                <rect x="36" y="15" width="4" height="3" rx="1" fill="#FFFFFF" />
                <path
                  d="M 20,13 L 20,7 C 20,4 23,2 26,2 L 34,2 C 37,2 40,4 40,7 L 40,13 L 36,13 L 36,8 C 36,6 34,5 33,5 L 27,5 C 26,5 24,6 24,8 L 24,13 Z"
                  fill="#FFFFFF"
                />
                <rect x="16" y="59" width="6" height="4" rx="2" fill="#FFFFFF" />
                <rect x="38" y="59" width="6" height="4" rx="2" fill="#FFFFFF" />
                <g clipPath="url(#footer-suitcase-clip)">
                  <rect x="10" y="18" width="40" height="42" fill="#FF5E14" />
                  <polygon points="10,60 50,18 50,60" fill="#FFFFFF" />
                </g>
                <path
                  d="M 40,0 L 25,3 L 15,3 L -10,30 L -18,30 L -12,3 L -28,3 L -33,10 L -37,10 L -34,0 L -37,-10 L -33,-10 L -28,-3 L -12,-3 L -18,-30 L -10,-30 L 15,-3 L 25,-3 Z"
                  fill="#0A225C"
                  transform="translate(26, 42) rotate(-45) scale(0.32)"
                />
              </g>
              <g transform="translate(70, 45)">
                <text fontFamily="Outfit" fontSize="34" fontWeight="800" fill="#FFFFFF">
                  make<tspan fill="#FF5E14">easy</tspan>trip
                </text>
                <text fontFamily="Inter" fontSize="11" fontWeight="700" letterSpacing="4.5" fill="#E2E8F0" x="3" y="18">
                  TRAVEL MADE EASY
                </text>
              </g>
            </svg>
            <p className="mt-[10px] text-sm text-slate-300">
              MakeEasyTrip Travel Tech Pvt Ltd is an emerging travel technology company dedicated to transforming the travel and hospitality industry through innovation, digital solutions, and customer-centric services.
            </p>
            <p className="mt-[8px] text-xs italic text-secondary">
              &quot;Making Travel Easier, Smarter &amp; More Accessible.&quot;
            </p>
          </div>

          {/* Column 1: Links */}
          <div>
            <h3 className="footer-title">Stays &amp; Vacations</h3>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleShortcutSearch("Goa")} className="text-left hover:text-secondary">
                  Beachside Hotels in Goa
                </button>
              </li>
              <li>
                <button onClick={() => handleShortcutSearch("Bali")} className="text-left hover:text-secondary">
                  Jungle Resorts in Bali
                </button>
              </li>
              <li>
                <button onClick={() => handleShortcutSearch("Tokyo")} className="text-left hover:text-secondary">
                  Central Stays in Tokyo
                </button>
              </li>
              <li>
                <button onClick={() => handleShortcutSearch("Paris")} className="text-left hover:text-secondary">
                  Luxury Suites in Paris
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="footer-title">Partner Business</h3>
            <ul className="footer-links">
              <li>
                <Link href="/partner/auth" className="hover:text-secondary">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-secondary">
                  Add Resort/Activities
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-secondary">
                  Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-secondary">
                  Super Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="footer-title">Company &amp; Support</h3>
            <ul className="footer-links">
              <li>
                <Link href="/customer#about" className="hover:text-secondary">
                  <i className="fa-solid fa-building"></i> About MakeEasyTrip
                </Link>
              </li>
              <li>
                <Link href="/customer/dashboard?tab=support" className="hover:text-secondary">
                  <i className="fa-solid fa-circle-question"></i> Help &amp; Support Chat
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-secondary">
                  <i className="fa-solid fa-passport"></i> Visa Assistance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary">
                  <i className="fa-solid fa-shield-halved"></i> Secure Payments
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="footer-bottom text-slate-400">
          <div>&copy; {new Date().getFullYear()} MakeEasyTrip Travel Tech Pvt Ltd. All rights reserved.</div>
          <div>Making Travel Easier, Smarter &amp; More Accessible • Powered by Innovation &amp; Trust</div>
        </div>
      </div>
    </footer>
  );
}
