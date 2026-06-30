"use client";

import React, { useState, useMemo, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function PartnerRevenuePage() {
  const router = useRouter();
  const { properties, bookings, activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Filter properties belonging to this partner
  const partnerProps = useMemo(() => {
    return properties.filter((p) => p.partnerId === partnerId || !p.partnerId);
  }, [properties, partnerId]);

  // Filter bookings for these properties that are confirmed or completed
  const partnerBookings = useMemo(() => {
    const propIds = partnerProps.map((p) => p.id);
    return bookings.filter((b) => propIds.includes(b.propertyId));
  }, [bookings, partnerProps]);

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return partnerBookings
      .filter((b) => b.status === "Confirmed" || b.status === "Completed")
      .reduce((sum, b) => sum + b.pricePaid, 0);
  }, [partnerBookings]);

  const avgBookingValue = useMemo(() => {
    const validBookings = partnerBookings.filter(
      (b) => b.status === "Confirmed" || b.status === "Completed"
    );
    if (validBookings.length === 0) return 0;
    return totalRevenue / validBookings.length;
  }, [partnerBookings, totalRevenue]);

  const monthlyRevenue = useMemo(() => {
    return totalRevenue * 0.42; // Mock breakdown
  }, [totalRevenue]);

  const commissionRate = 12; // 12% standard platform commission
  const netEarnings = useMemo(() => {
    return totalRevenue * (1 - commissionRate / 100);
  }, [totalRevenue]);

  // Property Breakdown
  const propertyRevenueBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { title: string; count: number; rev: number } } = {};
    partnerProps.forEach((p) => {
      breakdown[p.id] = { title: p.title, count: 0, rev: 0 };
    });

    partnerBookings
      .filter((b) => b.status === "Confirmed" || b.status === "Completed")
      .forEach((b) => {
        if (breakdown[b.propertyId]) {
          breakdown[b.propertyId].count += 1;
          breakdown[b.propertyId].rev += b.pricePaid;
        }
      });

    return Object.values(breakdown).sort((a, b) => b.rev - a.rev);
  }, [partnerProps, partnerBookings]);

  // Withdrawal requests state
  const [withdrawals, setWithdrawals] = useState<any[]>([
    { id: "WTH-881", amount: 45000, date: "2026-06-10", status: "Approved" },
    { id: "WTH-623", amount: 60000, date: "2026-05-28", status: "Approved" },
  ]);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > netEarnings) {
      alert("Error: Requested amount exceeds current net earnings.");
      return;
    }

    const newRequest = {
      id: "WTH-" + Math.floor(Math.random() * 900 + 100),
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setWithdrawals((prev) => [newRequest, ...prev]);
    setWithdrawAmount("");
    addLog(`REVENUE_HUB: Partner submitted a withdrawal request of ₹${amt.toLocaleString("en-IN")}`);
    alert(`Success! Withdrawal request of ₹${amt.toLocaleString("en-IN")} submitted and pending approval.`);
  };

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  return (
    <PartnerLayout
      title="Revenue Dashboard"
      subtitle="Monitor settlements, commission rate matrices, ledger payouts and withdrawals."
    >
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <label className="text-[10px] text-text-muted font-bold uppercase">Gross Bookings Value</label>
          <div className="text-xl font-extrabold text-primary mt-2">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-emerald-500 mt-1 font-bold">
            <i className="fa-solid fa-arrow-trend-up"></i> +14.5% from last month
          </p>
        </div>

        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <label className="text-[10px] text-text-muted font-bold uppercase">Avg Booking Value</label>
          <div className="text-xl font-extrabold text-primary mt-2">
            ₹{avgBookingValue.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-text-muted mt-1">Calculated per reservation</p>
        </div>

        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <label className="text-[10px] text-text-muted font-bold uppercase">Standard Commission</label>
          <div className="text-xl font-extrabold text-secondary mt-2">
            {commissionRate}%
          </div>
          <p className="text-[10px] text-text-muted mt-1">Platform service charge rate</p>
        </div>

        <div className="bg-white p-5 border border-border rounded-lg shadow-sm">
          <label className="text-[10px] text-text-muted font-bold uppercase">Net Earnings Ledger</label>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">
            ₹{netEarnings.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-text-muted mt-1">Available for bank payout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Property breakdown + Transaction Ledger */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Property Breakdown Table */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Revenue Breakdown by Listing</h3>
            <div className="overflow-x-auto">
              <table className="partner-table w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2">Listing Title</th>
                    <th className="pb-2">Bookings Count</th>
                    <th className="pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyRevenueBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-text-muted italic">
                        No property data available.
                      </td>
                    </tr>
                  ) : (
                    propertyRevenueBreakdown.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-3 font-semibold text-text-main">{item.title}</td>
                        <td className="py-3 text-text-muted">{item.count} reservations</td>
                        <td className="py-3 font-bold text-secondary text-right">
                          ₹{item.rev.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking transaction history */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Transaction Ledger History</h3>
            <div className="overflow-x-auto">
              <table className="partner-table w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2">Reservation ID</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2 text-right">Gross Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-text-muted italic">
                        No transactions registered yet.
                      </td>
                    </tr>
                  ) : (
                    partnerBookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100">
                        <td className="py-3 font-mono font-bold text-primary">{b.id}</td>
                        <td className="py-3 text-text-muted">{b.createdAt?.split("T")[0] || "2026-06-20"}</td>
                        <td className="py-3 text-text-main font-semibold">{b.customerName}</td>
                        <td className="py-3 text-right font-bold text-secondary">
                          ₹{b.pricePaid.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Withdrawal payouts */}
        <div className="flex flex-col gap-6">
          {/* Withdrawal request form */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Initiate Bank Withdrawal</h3>
            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">
                  Payout Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <span className="text-[9px] text-text-muted mt-1">
                  Settlements take 2-3 business days to credit to your registered business bank account.
                </span>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                Request Withdrawal
              </button>
            </form>
          </div>

          {/* Withdrawal history */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Withdrawal Requests History</h3>
            <div className="flex flex-col gap-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-border/60">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-primary">{w.id}</div>
                    <div className="text-[9px] text-text-muted mt-0.5">{w.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-secondary">
                      ₹{w.amount.toLocaleString("en-IN")}
                    </div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 ${
                        w.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
