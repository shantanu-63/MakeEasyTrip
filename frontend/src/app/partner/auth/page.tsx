"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function PartnerAuthForm() {
  const router = useRouter();
  const { loginPartner, activePartner, addLog } = useData();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("rajesh@sunsetvilla.com");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activePartner) {
      router.push("/partner");
    }
  }, [activePartner, router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // Default seed partner credentials
    const seedCredentials: Record<string, { id: string; ownerName: string; businessName: string }> = {
      "rajesh@sunsetvilla.com": {
        id: "partner-1",
        ownerName: "Rajesh Kumar",
        businessName: "Sunset Villa & Resorts",
      },
      "partner@makeeasytrip.com": {
        id: "partner-demo",
        ownerName: "Demo Partner",
        businessName: "Indo-Global Travel DMC Ltd",
      },
    };

    const validPassword = "Partner@123";

    if (password === validPassword && seedCredentials[email]) {
      loginPartner({ ...seedCredentials[email], email });
      router.push("/partner");
      return;
    }

    // Try custom partners list from localStorage
    try {
      const partners = JSON.parse(localStorage.getItem("met_partners") || "[]");
      const matched = partners.find((p: any) => p.email === email);
      if (matched) {
        loginPartner(matched);
        router.push("/partner");
        return;
      }
    } catch {}

    // Fallback bypass for preview/demo environments
    if (email && password) {
      const fallbackPartner = {
        id: "partner-" + Math.floor(Math.random() * 10000),
        ownerName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        businessName: email.split("@")[1]?.split(".")[0]?.toUpperCase() + " Travels" || "Partner Business",
        email,
      };
      loginPartner(fallbackPartner);
      router.push("/partner");
      return;
    }

    setError("Invalid credentials. Use rajesh@sunsetvilla.com / Partner@123");
    setLoading(false);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !businessName.trim() || !ownerName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const newPartner = {
      id: "partner-" + Math.floor(Math.random() * 9000 + 1000),
      businessName,
      ownerName,
      email,
      phone,
      verificationLevel: 1,
      status: "Approved",
    };

    try {
      const list = JSON.parse(localStorage.getItem("met_partners") || "[]");
      list.push(newPartner);
      localStorage.setItem("met_partners", JSON.stringify(list));
    } catch {}

    addLog(`PARTNER_REGISTRATION: Registered partner business: '${businessName}'`);
    loginPartner(newPartner);
    router.push("/partner");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 border border-border rounded-lg shadow-md max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/customer" className="inline-block mb-3">
            <svg width="220" height="50" viewBox="0 0 350 80" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10, 5)">
                <clipPath id="auth-logo-clip">
                  <rect x="10" y="18" width="40" height="42" rx="8" />
                </clipPath>
                <rect x="20" y="15" width="4" height="3" rx="1" fill="#0A225C" />
                <rect x="36" y="15" width="4" height="3" rx="1" fill="#0A225C" />
                <path d="M 20,13 L 20,7 C 20,4 23,2 26,2 L 34,2 C 37,2 40,4 40,7 L 40,13 L 36,13 L 36,8 C 36,6 34,5 33,5 L 27,5 C 26,5 24,6 24,8 L 24,13 Z" fill="#0A225C" />
                <rect x="16" y="59" width="6" height="4" rx="2" fill="#0A225C" />
                <rect x="38" y="59" width="6" height="4" rx="2" fill="#0A225C" />
                <g clipPath="url(#auth-logo-clip)">
                  <rect x="10" y="18" width="40" height="42" fill="#FF5E14" />
                  <polygon points="10,60 50,18 50,60" fill="#0A225C" />
                </g>
                <path
                  d="M 40,0 L 25,3 L 15,3 L -10,30 L -18,30 L -12,3 L -28,3 L -33,10 L -37,10 L -34,0 L -37,-10 L -33,-10 L -28,-3 L -12,-3 L -18,-30 L -10,-30 L 15,-3 L 25,-3 Z"
                  fill="#FFFFFF"
                  transform="translate(26, 42) rotate(-45) scale(0.32)"
                />
              </g>
              <g transform="translate(70, 45)">
                <text fontFamily="Outfit" fontSize="34" fontWeight="800" fill="#0A225C">
                  make<tspan fill="#FF5E14">easy</tspan>trip
                </text>
              </g>
            </svg>
          </Link>
          <h2 className="text-lg font-extrabold text-primary">
            {isLogin ? "Partner Merchant Hub" : "Register Travel Partner Account"}
          </h2>
          <p className="text-[11px] text-text-muted mt-1">
            {isLogin
              ? "Access your dashboard, manage inventories, rates & verify bookings"
              : "Empower your travel agency or hospitality business with smart tech"}
          </p>
        </div>

        {isLogin && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-xs">
            <p className="font-bold text-orange-700 mb-1">
              <i className="fa-solid fa-circle-info mr-1"></i> Default Partner Credentials
            </p>
            <p className="text-orange-600">Email: <strong>rajesh@sunsetvilla.com</strong></p>
            <p className="text-orange-600">Password: <strong>Partner@123</strong></p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-danger text-xs rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Business Email</label>
              <input
                type="email"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="rajesh@sunsetvilla.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Password</label>
              <input
                type="password"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="Enter password (Partner@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center py-2.5 text-xs font-bold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin mr-1.5"></i> Signing in...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket mr-1.5"></i> Merchant Login</>
              )}
            </button>
            <p className="text-center text-xs mt-4">
              Don&apos;t have a merchant account?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                className="text-secondary font-bold hover:underline"
              >
                Register Business
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Business Name</label>
              <input
                type="text"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="e.g. Blue Lagoon Scuba DMC"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Owner / Contact Name</label>
              <input
                type="text"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="e.g. Rajesh Kumar"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Business Email</label>
              <input
                type="email"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="partner@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group flex flex-col gap-1">
              <label className="text-[10px] text-text-muted font-bold uppercase">Mobile Number</label>
              <input
                type="tel"
                required
                className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary justify-center py-2.5 text-xs font-bold mt-2">
              <i className="fa-solid fa-handshake-angle mr-1.5"></i> Register Partnership
            </button>
            <p className="text-center text-xs mt-4">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                className="text-secondary font-bold hover:underline"
              >
                Merchant Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PartnerAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading partner portal...</div>
      </div>
    }>
      <PartnerAuthForm />
    </Suspense>
  );
}
