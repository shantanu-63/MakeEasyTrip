"use client";

import React, { useMemo, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function AdminPaymentPage() {
  const router = useRouter();
  const { bookings, activeAdmin } = useData();

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_admin_session");
      if (!stored && !activeAdmin) {
        router.push("/admin/login");
      }
    }
  }, [activeAdmin, router]);

  const finance = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "Confirmed" || b.status === "Completed");
    const grossRevenue = confirmed.reduce((sum, b) => sum + b.pricePaid, 0);
    const platformCommissions = Math.round(grossRevenue * 0.15); // 15% commission fee
    const merchantPayouts = grossRevenue - platformCommissions;

    return { grossRevenue, platformCommissions, merchantPayouts };
  }, [bookings]);

  return (
    <AdminLayout
      title="Financial Ledger & Payouts"
      subtitle="Track gross booking volumes, commissions, tax invoicing, and merchant bank distributions."
    >
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Gross Booking Volume
          </div>
          <div className="text-xl font-extrabold text-primary mt-2">
            ₹{finance.grossRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-text-muted mt-1.5">
            Total transactions processed
          </div>
        </div>

        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Platform Commissions (15%)
          </div>
          <div className="text-xl font-extrabold text-secondary mt-2">
            ₹{finance.platformCommissions.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1.5">
            Platform operations share
          </div>
        </div>

        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Net Partner Distribution
          </div>
          <div className="text-xl font-extrabold text-primary mt-2">
            ₹{finance.merchantPayouts.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-sky-655 font-semibold mt-1.5">
            Bank transfers pending settlement
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
        <h3 className="text-base font-extrabold text-primary mb-4">
          Platform Transactions Ledger ({bookings.length} logs)
        </h3>
        <div className="overflow-x-auto">
          <table className="partner-table w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2">Reference ID</th>
                <th className="pb-2">Traveler</th>
                <th className="pb-2">Stay / Tour</th>
                <th className="pb-2">Booking Date</th>
                <th className="pb-2">Gross Price</th>
                <th className="pb-2">Payout (85%)</th>
                <th className="pb-2">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-text-muted italic">
                    No transactions recorded on this platform yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-3 font-mono font-bold text-primary text-[10px]">{b.id}</td>
                    <td className="py-3">
                      <div className="font-semibold text-text-main">{b.customerName}</div>
                      <div className="text-[9px] text-text-muted">{b.customerEmail}</div>
                    </td>
                    <td className="py-3 font-semibold text-text-main">{b.propertyName}</td>
                    <td className="py-3 text-text-muted">{b.createdAt || "2026-06-12"}</td>
                    <td className="py-3 font-extrabold text-primary">
                      ₹{b.pricePaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 font-semibold text-secondary">
                      ₹{Math.round(b.pricePaid * 0.85).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : b.paymentStatus === "Refunded"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-red-50 text-red-500 border border-red-100"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
