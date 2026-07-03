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
            <img
              src="/logo/logo.png"
              alt="MakeEasyTrip Logo"
              className="w-[130px] sm:w-[155px] md:w-[160px] lg:w-[185px] h-auto object-contain block"
            />
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
