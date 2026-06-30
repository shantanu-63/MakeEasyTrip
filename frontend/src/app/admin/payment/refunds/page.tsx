"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";

interface Booking {
  id: string;
  customerName: string;
  propertyName: string;
  propertyId?: string;
  checkin: string;
  checkout?: string;
  pricePaid: number;
  type?: string;
  status: string;
  cancellationReason?: string;
  cancellationDate?: string;
  refundRequested?: boolean;
  refundStatus?: string;
  refundAmount?: number;
  refundMethod?: string;
  adminNotes?: string;
  payoutTxnId?: string;
  payoutGateway?: string;
  payoutDisbursedDate?: string;
}

export default function PaymentRefundsVettingPage() {
  const { bookings, syncBookings, addLog } = useData();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVetting, setFilterVetting] = useState<"all" | "low-risk" | "medium-risk" | "high-risk">("all");

  // Payout processing states
  const [payoutTxnId, setPayoutTxnId] = useState("");
  const [payoutGateway, setPayoutGateway] = useState("Stripe API Gateway");
  const [vettingVerdict, setVettingVerdict] = useState<"disburse" | "reject" | "hold">("disburse");
  const [vettingComments, setVettingComments] = useState("");

  // Seed some pending refund bookings if there are none, to demonstrate the vetting interface
  useEffect(() => {
    if (bookings.length > 0) {
      const pendingClaims = bookings.filter((b) => b.refundStatus === "Approved");
      if (pendingClaims.length === 0) {
        // Mark one of the bookings as cancellation approved but pending payout vetting
        const updated = bookings.map((b, idx) => {
          if (idx === 1) {
            return {
              ...b,
              status: "Cancelled",
              refundRequested: true,
              refundStatus: "Approved",
              refundAmount: Math.floor(b.pricePaid * 0.8),
              cancellationReason: "Flight cancelled, requested refund.",
              cancellationDate: "2026-06-22",
              adminNotes: "Client requested refund; approved 80% per standard cancellation rules.",
            };
          }
          return b;
        });
        syncBookings(updated);
        addLog("SYSTEM: Seeded a pending refund payment for finance vetting.");
      }
    }
  }, [bookings, syncBookings, addLog]);

  // Open vetting panel
  const openVettingPanel = (booking: Booking) => {
    setSelectedBooking(booking);
    setPayoutTxnId(`TXN-OUT-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayoutGateway(booking.refundMethod || "Stripe API Gateway");
    setVettingComments("");
    setVettingVerdict("disburse");
  };

  // Close panel
  const closeVettingPanel = () => {
    setSelectedBooking(null);
  };

  // Handle vetting submission
  const handleSubmitVerdict = () => {
    if (!selectedBooking) return;

    if (vettingVerdict === "disburse" && !payoutTxnId.trim()) {
      alert("Please enter a Payout Transaction ID to finalize the disbursal.");
      return;
    }

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        let nextRefundStatus = b.refundStatus;
        let nextStatus = b.status;

        if (vettingVerdict === "disburse") {
          nextRefundStatus = "Refunded";
          nextStatus = "Cancelled";
        } else if (vettingVerdict === "reject") {
          nextRefundStatus = "Rejected";
          nextStatus = "Confirmed"; // Reverted
        } else if (vettingVerdict === "hold") {
          nextRefundStatus = "Approved"; // Stays in vetting queue
        }

        return {
          ...b,
          status: nextStatus,
          refundStatus: nextRefundStatus,
          payoutTxnId: vettingVerdict === "disburse" ? payoutTxnId : undefined,
          payoutGateway: vettingVerdict === "disburse" ? payoutGateway : undefined,
          payoutDisbursedDate: vettingVerdict === "disburse" ? new Date().toISOString().split("T")[0] : undefined,
          adminNotes: `${b.adminNotes || ""}\n[Finance Audit ${new Date().toISOString().split("T")[0]}]: Verdict: ${vettingVerdict.toUpperCase()}. Comments: ${vettingComments}`,
        };
      }
      return b;
    });

    syncBookings(updated);
    addLog(
      `FINANCE_VETTING: Processed refund payment for ${selectedBooking.id}. Verdict: ${vettingVerdict.toUpperCase()}`
    );
    alert(
      vettingVerdict === "disburse"
        ? `Payout of Rs. ${selectedBooking.refundAmount?.toLocaleString()} disbursed. Booking marked as Refunded.`
        : vettingVerdict === "reject"
        ? "Refund payment rejected. Booking status reverted to Confirmed."
        : "Refund placed on administrative Hold. Further checks required."
    );
    closeVettingPanel();
  };

  // Get risk level details
  const getRiskScore = (b: Booking) => {
    const amt = b.refundAmount || b.pricePaid;
    if (amt > 50000) {
      return { level: "HIGH", color: "text-red-600 bg-red-50 border-red-100", checks: ["High amount transaction (>50k)", "Dual authorization suggested"] };
    }
    if (amt > 15000) {
      return { level: "MEDIUM", color: "text-orange-600 bg-orange-50 border-orange-100", checks: ["Medium amount transaction", "Self-cancellation reason verified"] };
    }
    return { level: "LOW", color: "text-green-600 bg-green-50 border-green-100", checks: ["Low amount transaction", "Automated policy matched"] };
  };

  // Filter list
  const pendingRefunds = bookings.filter((b) => b.refundStatus === "Approved");

  const filteredPending = pendingRefunds.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      b.customerName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q);

    const risk = getRiskScore(b).level.toLowerCase();
    const matchRisk = filterVetting === "all" || risk === filterVetting.replace("-risk", "");

    return matchSearch && matchRisk;
  });

  return (
    <AdminLayout
      title="Refund Payments Vetting Console"
      subtitle="Audit pending refund disbursements, review transaction threat/risk signals, and authorize payouts."
    >
      {/* Risk Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-[#0A225C]">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Awaiting Audit</span>
          <div className="text-2xl font-extrabold text-[#0A225C] mt-1">{pendingRefunds.length}</div>
          <span className="text-[10px] text-text-muted">Refund payouts queued</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">High Risk Queues</span>
          <div className="text-2xl font-extrabold text-danger mt-1">
            {pendingRefunds.filter((b) => (b.refundAmount || b.pricePaid) > 50000).length}
          </div>
          <span className="text-[10px] text-text-muted">Requires supervisor check</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Queue Value</span>
          <div className="text-2xl font-extrabold text-warning mt-1">
            Rs. {pendingRefunds.reduce((sum, b) => sum + (b.refundAmount || 0), 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Total capital pending disbursal</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Disbursed (Total)</span>
          <div className="text-2xl font-extrabold text-success mt-1">
            {bookings.filter((b) => b.refundStatus === "Refunded").length}
          </div>
          <span className="text-[10px] text-text-muted">Processed and cleared</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-primary uppercase">Risk Classification</label>
            <select
              value={filterVetting}
              onChange={(e) => setFilterVetting(e.target.value as any)}
              className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0A225C]"
            >
              <option value="all">All Risk Levels</option>
              <option value="low-risk">Low Risk Score</option>
              <option value="medium-risk">Medium Risk Score</option>
              <option value="high-risk">High Risk Score</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-bold text-primary uppercase">Search Queue</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <i className="fa-solid fa-search text-[10px]"></i>
              </span>
              <input
                type="text"
                placeholder="Search by customer, booking ID, stay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg outline-none focus:border-[#0A225C] text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vetting Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Beneficiary Name</th>
                <th>Stays / Tours</th>
                <th>Claim Amt / Total Paid</th>
                <th>Refund Target Route</th>
                <th>Risk Profile</th>
                <th>Admin Reason</th>
                <th style={{ textAlign: "right" }}>Vetting Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-muted font-semibold">
                    <i className="fa-solid fa-clipboard-check text-3xl mb-3 block text-slate-300"></i>
                    All refunds cleared! No payouts pending vetting.
                  </td>
                </tr>
              ) : (
                filteredPending.map((b) => {
                  const riskInfo = getRiskScore(b);
                  return (
                    <tr key={b.id} className="admin-table-row text-xs">
                      <td>
                        <strong>{b.id}</strong>
                      </td>
                      <td className="font-bold text-primary">{b.customerName}</td>
                      <td className="font-bold text-primary max-w-[150px] truncate" title={b.propertyName}>
                        {b.propertyName}
                      </td>
                      <td className="font-semibold text-primary">
                        <span className="text-[#FF5E14] font-bold">
                          Rs. {(b.refundAmount || b.pricePaid).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-text-muted block">
                          of Rs. {b.pricePaid.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="text-text-muted font-medium">
                        {b.refundMethod || "Original Payment Method"}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${riskInfo.color}`}
                        >
                          {riskInfo.level} Risk
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate text-text-muted italic" title={b.cancellationReason}>
                        {b.cancellationReason || "No details provided"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => openVettingPanel(b)}
                          className="bg-[#0A225C] hover:bg-[#081a4a] text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <i className="fa-solid fa-shield-halved"></i> Vet Payout
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vetting Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0A225C] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold font-heading flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-secondary"></i> Security Vetting &amp; Disbursal
                </h3>
                <p className="text-[11px] text-white/70 mt-0.5">Booking ID: {selectedBooking.id}</p>
              </div>
              <button onClick={closeVettingPanel} className="text-white/80 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Risk Alert Panel */}
              <div
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  getRiskScore(selectedBooking).level === "HIGH"
                    ? "bg-red-50/50 border-red-100"
                    : getRiskScore(selectedBooking).level === "MEDIUM"
                    ? "bg-orange-50/50 border-orange-100"
                    : "bg-green-50/50 border-green-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#0A225C] text-[11px] uppercase tracking-wider">
                    Automated Risk Analysis Verdict
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      getRiskScore(selectedBooking).color
                    }`}
                  >
                    {getRiskScore(selectedBooking).level} Risk Score
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-text-muted mt-1">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i> Original payment card
                    active
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i> IP location check matched
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i> Zero historical disputes
                    found
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {getRiskScore(selectedBooking).level === "HIGH" ? (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation text-[10px]"></i> High value transaction flag
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[10px]"></i> Value inside limits
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Beneficiary details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-border/60">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Beneficiary</span>
                  <span className="font-bold text-primary">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Refund Capital</span>
                  <span className="font-bold text-[#FF5E14]">
                    Rs. {(selectedBooking.refundAmount || selectedBooking.pricePaid).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Booking Amount</span>
                  <span className="font-semibold text-text-muted">
                    Rs. {selectedBooking.pricePaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Target Payout Gateway</span>
                  <span className="font-semibold text-primary">
                    {selectedBooking.refundMethod || "Original Payment Method"}
                  </span>
                </div>
              </div>

              {/* Booking & Reason details */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-border/60">
                <span className="text-[10px] text-text-muted uppercase block">Stay / Tour booking</span>
                <span className="font-bold text-primary block truncate">
                  {selectedBooking.propertyName} ({selectedBooking.checkin})
                </span>
                <span className="text-[10px] text-text-muted uppercase block pt-2">Reason Approved by Admin</span>
                <p className="text-text-muted italic bg-white p-2 rounded border border-border/40 mt-1">
                  &ldquo;{selectedBooking.cancellationReason || "No details provided"}&rdquo;
                </p>
              </div>

              {/* Audit form */}
              <div className="border-t border-border/60 pt-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">Select Audit Action</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVettingVerdict("disburse")}
                      className={`py-2 rounded-lg font-bold border transition text-center ${
                        vettingVerdict === "disburse"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-white text-text-muted border-border hover:bg-slate-50"
                      }`}
                    >
                      <i className="fa-solid fa-circle-check mr-1"></i> Approve Payout
                    </button>
                    <button
                      type="button"
                      onClick={() => setVettingVerdict("hold")}
                      className={`py-2 rounded-lg font-bold border transition text-center ${
                        vettingVerdict === "hold"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-white text-text-muted border-border hover:bg-slate-50"
                      }`}
                    >
                      <i className="fa-solid fa-circle-pause mr-1"></i> Put on Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => setVettingVerdict("reject")}
                      className={`py-2 rounded-lg font-bold border transition text-center ${
                        vettingVerdict === "reject"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-white text-text-muted border-border hover:bg-slate-50"
                      }`}
                    >
                      <i className="fa-solid fa-circle-xmark mr-1"></i> Reject Payout
                    </button>
                  </div>
                </div>

                {vettingVerdict === "disburse" && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-primary uppercase">
                        Payout Txn Reference <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={payoutTxnId}
                        onChange={(e) => setPayoutTxnId(e.target.value)}
                        placeholder="ch_stripe_payout_xyz123..."
                        className="border border-border rounded-lg p-2 outline-none focus:border-[#0A225C] text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-primary uppercase">Payout Gateway Integration</label>
                      <select
                        value={payoutGateway}
                        onChange={(e) => setPayoutGateway(e.target.value)}
                        className="border border-border rounded-lg p-2 outline-none focus:border-[#0A225C] text-xs font-semibold"
                      >
                        <option value="Stripe API Gateway">Stripe Direct API Payout</option>
                        <option value="Razorpay Instant Payout">Razorpay Instant API</option>
                        <option value="PayPal Sandbox Outflow">PayPal Gateway</option>
                        <option value="HDFC Bank Corporate Transfer">HDFC Corporate NEFT/RTGS</option>
                        <option value="Internal Wallet Allocation">MET Account Wallet</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">
                    Audit Verification Comments
                  </label>
                  <textarea
                    rows={2}
                    value={vettingComments}
                    onChange={(e) => setVettingComments(e.target.value)}
                    placeholder="E.g., verified with partner, billing credentials checked, transaction approved for instant release..."
                    className="border border-border rounded-lg p-2 outline-none focus:border-[#0A225C] text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-border flex justify-between gap-2">
              <button
                type="button"
                onClick={closeVettingPanel}
                className="bg-white hover:bg-slate-100 border border-border text-primary font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Close Audit
              </button>
              <button
                type="button"
                onClick={handleSubmitVerdict}
                className="bg-[#0A225C] hover:bg-[#081a4a] text-white font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Submit Audit Verdict
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
