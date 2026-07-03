"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const { loginAdmin, activeAdmin } = useData();

  const [email, setEmail] = useState("admin@makeeasytrip.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeAdmin) {
      router.push("/admin");
    }
  }, [activeAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    // Validate credentials
    const validEmail = "admin@makeeasytrip.com";
    const validPassword = "Admin@2026";

    if (email === validEmail && password === validPassword) {
      loginAdmin(email);
      router.push("/admin");
    } else {
      // Also try any stored admins from localStorage for multi-admin support
      try {
        const stored = localStorage.getItem("met_admins");
        if (stored) {
          const admins = JSON.parse(stored);
          const match = admins.find(
            (a: any) => a.email === email && (a.password === password || !a.password)
          );
          if (match) {
            loginAdmin(email);
            router.push("/admin");
            return;
          }
        }
      } catch {}
      setError("Invalid credentials. Use admin@makeeasytrip.com / Admin@2026");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-xl max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/customer" className="inline-block mb-3">
            <img
              src="/logo/logo.png"
              alt="MakeEasyTrip Logo"
              className="w-[200px] h-auto object-contain mx-auto block"
            />
          </Link>
          <h2 className="text-lg font-extrabold text-primary flex items-center justify-center gap-1.5 mt-2">
            <i className="fa-solid fa-user-shield text-secondary"></i> Super Admin Control Panel
          </h2>
          <p className="text-[11px] text-text-muted mt-1">
            Access global platform statistics, manage supply compliance, and ledger audits.
          </p>
        </div>

        {/* Default credentials hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs">
          <p className="font-bold text-blue-700 mb-1">
            <i className="fa-solid fa-circle-info mr-1"></i> Default Admin Credentials
          </p>
          <p className="text-blue-600">Email: <strong>admin@makeeasytrip.com</strong></p>
          <p className="text-blue-600">Password: <strong>Admin@2026</strong></p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-danger text-xs rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="form-group flex flex-col gap-1">
            <label className="text-[10px] text-text-muted font-bold uppercase">Admin Email</label>
            <input
              type="email"
              required
              className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary"
              placeholder="admin@makeeasytrip.com"
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
              placeholder="Enter your password (Admin@2026)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-light text-white justify-center py-2.5 text-xs font-bold rounded flex items-center gap-1.5 mt-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i> Secure Operator Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-sm font-semibold animate-pulse">Loading admin panel...</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
