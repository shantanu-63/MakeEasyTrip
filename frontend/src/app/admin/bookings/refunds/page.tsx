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
}

export default function BookingRefundsPage() {
  const { bookings, syncBookings, addLog } = useData();
  const [activeTab, setActiveTab] = useState<"list" | "issue">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActiveQuery, setSearchActiveQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Form states for manual refund
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("Original Payment Method");
  const [vettingMode, setVettingMode] = useState<"vetting" | "direct">("vetting");

  // Load selection and sync pre-fills
  const openManualRefundModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setRefundAmount(booking.pricePaid);
    setRefundReason("");
    setRefundMethod("Original Payment Method");
    setVettingMode("vetting");
  };

  const handleConfirmRefund = () => {
    if (!selectedBooking) return;

    if (refundAmount <= 0) {
      alert("Refund amount must be greater than zero.");
      return;
    }
    if (refundAmount > selectedBooking.pricePaid) {
      alert(`Refund amount cannot exceed the price paid (Rs. ${selectedBooking.pricePaid.toLocaleString()}).`);
      return;
    }
    if (!refundReason.trim()) {
      alert("Please provide a reason for the manual refund.");
      return;
    }

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          status: "Cancelled",
          refundRequested: true,
          refundStatus: vettingMode === "vetting" ? "Approved" : "Refunded",
          refundAmount: refundAmount,
          refundMethod: refundMethod,
          cancellationReason: `Manual Refund: ${refundReason}`,
          cancellationDate: new Date().toISOString().split("T")[0],
          adminNotes: `Refund initiated manually by Admin. Direct Disbursal: ${vettingMode === "direct"}`,
        };
      }
      return b;
    });

    syncBookings(updated);
    addLog(
      `REFUND: Manually issued refund for ${selectedBooking.id}. Amount: Rs. ${refundAmount}. Route: ${vettingMode}`
    );
    alert(
      vettingMode === "vetting"
        ? `Refund of Rs. ${refundAmount.toLocaleString()} approved and sent to payment vetting queue.`
        : `Refund of Rs. ${refundAmount.toLocaleString()} has been processed and marked as disbursed directly.`
    );
    setSelectedBooking(null);
    setActiveTab("list");
  };

  // Filtered lists
  // 1. Historical list of refunded / approved refunds
  const refundedBookings = bookings.filter(
    (b) => b.refundStatus === "Approved" || b.refundStatus === "Refunded"
  );

  const filteredRefunded = refundedBookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      b.customerName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q) ||
      (b.cancellationReason && b.cancellationReason.toLowerCase().includes(q))
    );
  });

  // 2. Active bookings available to issue refund
  const activeBookings = bookings.filter(
    (b) => b.status === "Confirmed" || b.status === "Completed" || b.status === "Pending"
  );

  const filteredActive = activeBookings.filter((b) => {
    const q = searchActiveQuery.toLowerCase();
    return (
      !searchActiveQuery ||
      b.customerName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q)
    );
  });

  // Calculations for stats
  const totalValueRefunded = bookings
    .filter((b) => b.refundStatus === "Refunded")
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  const totalValueApproved = bookings
    .filter((b) => b.refundStatus === "Approved")
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  const refundedCount = bookings.filter(
    (b) => b.refundStatus === "Refunded" || b.refundStatus === "Approved"
  ).length;

  return (
    <AdminLayout
      title="Refund Requests Manager"
      subtitle="Issue manual booking cancellations and track historical customer refund payments."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-[#0A225C]">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Refund Events</span>
          <div className="text-2xl font-extrabold text-[#0A225C] mt-1">{refundedCount}</div>
          <span className="text-[10px] text-text-muted">Total refunds processed</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Disbursed Value</span>
          <div className="text-2xl font-extrabold text-success mt-1">
            Rs. {totalValueRefunded.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Paid to customers</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Approved & Vetting</span>
          <div className="text-2xl font-extrabold text-warning mt-1">
            Rs. {totalValueApproved.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Awaiting finance approval</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Direct Disbursals</span>
          <div className="text-2xl font-extrabold text-danger mt-1">
            {bookings.filter((b) => b.refundStatus === "Refunded").length}
          </div>
          <span className="text-[10px] text-text-muted">Bypassed vetting queue</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 font-heading font-extrabold text-xs tracking-wider uppercase border-b-2 transition ${
            activeTab === "list"
              ? "border-[#FF5E14] text-[#FF5E14]"
              : "border-transparent text-text-muted hover:text-[#0A225C]"
          }`}
        >
          <i className="fa-solid fa-list-check mr-1.5"></i> Refunded Bookings Log
        </button>
        <button
          onClick={() => setActiveTab("issue")}
          className={`px-6 py-3 font-heading font-extrabold text-xs tracking-wider uppercase border-b-2 transition ${
            activeTab === "issue"
              ? "border-[#FF5E14] text-[#FF5E14]"
              : "border-transparent text-text-muted hover:text-[#0A225C]"
          }`}
        >
          <i className="fa-solid fa-hand-holding-dollar mr-1.5"></i> Issue Manual Refund
        </button>
      </div>

      {/* Tab 1: Refunds Log */}
      {activeTab === "list" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-primary uppercase">Search Refund Log</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <i className="fa-solid fa-search text-[10px]"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search by customer, booking ID, stay, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="table-responsive">
              <table className="partner-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Name</th>
                    <th>Property / Experience</th>
                    <th>Amount Paid</th>
                    <th>Refund Amount</th>
                    <th>Refund Method</th>
                    <th>Refund Status</th>
                    <th>Initiation Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunded.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-text-muted font-semibold">
                        <i className="fa-solid fa-receipt text-3xl mb-3 block text-slate-300"></i>
                        No refund entries found.
                      </td>
                    </tr>
                  ) : (
                    filteredRefunded.map((b) => (
                      <tr key={b.id} className="admin-table-row text-xs">
                        <td>
                          <strong>{b.id}</strong>
                        </td>
                        <td className="font-bold text-primary">{b.customerName}</td>
                        <td className="font-bold text-primary">{b.propertyName}</td>
                        <td className="font-semibold text-text-muted">
                          Rs. {b.pricePaid.toLocaleString("en-IN")}
                        </td>
                        <td className="font-bold text-[#FF5E14]">
                          Rs. {b.refundAmount?.toLocaleString("en-IN") || "0"}
                        </td>
                        <td className="text-text-muted font-medium">
                          {b.refundMethod || "Original Gateway"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              b.refundStatus === "Refunded"
                                ? "approved"
                                : b.refundStatus === "Approved"
                                ? "warning"
                                : "danger"
                            }`}
                          >
                            {b.refundStatus === "Refunded" ? "Disbursed" : "Pending Vetting"}
                          </span>
                        </td>
                        <td className="text-text-muted">
                          {b.cancellationDate
                            ? new Date(b.cancellationDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Issue Manual Refund */}
      {activeTab === "issue" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-primary uppercase">
                Search Active Bookings to Refund
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <i className="fa-solid fa-search text-[10px]"></i>
                </span>
                <input
                  type="text"
                  placeholder="Enter Booking ID, Customer name or Property stay..."
                  value={searchActiveQuery}
                  onChange={(e) => setSearchActiveQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="table-responsive">
              <table className="partner-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Name</th>
                    <th>Property Name</th>
                    <th>Check In</th>
                    <th>Price Paid</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-text-muted font-semibold">
                        <i className="fa-solid fa-circle-info text-3xl mb-3 block text-slate-300"></i>
                        No active/completed bookings found for refunding.
                      </td>
                    </tr>
                  ) : (
                    filteredActive.map((b) => (
                      <tr key={b.id} className="admin-table-row text-xs">
                        <td>
                          <strong>{b.id}</strong>
                        </td>
                        <td className="font-bold text-primary">{b.customerName}</td>
                        <td className="font-bold text-primary">{b.propertyName}</td>
                        <td className="text-text-muted">
                          {new Date(b.checkin).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="font-bold text-primary">Rs. {b.pricePaid.toLocaleString("en-IN")}</td>
                        <td>
                          <span className="badge info">{b.status}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => openManualRefundModal(b)}
                            className="bg-[#FF5E14] hover:bg-[#ff5e14]/90 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ml-auto"
                          >
                            <i className="fa-solid fa-arrow-rotate-left"></i> Issue Refund
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Refund Form Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#FF5E14] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold font-heading">Issue Manual Refund</h3>
                <p className="text-[11px] text-white/70 mt-0.5">Booking ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/80 hover:text-white text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-border/60 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Customer</span>
                  <span className="font-bold text-primary">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Paid Price</span>
                  <span className="font-bold text-primary">
                    Rs. {selectedBooking.pricePaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-text-muted uppercase block">Booking For</span>
                  <span className="font-semibold text-primary block truncate">
                    {selectedBooking.propertyName}
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">
                    Refund Amount (Rs.) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    max={selectedBooking.pricePaid}
                    min={1}
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="border border-border rounded-lg p-2.5 outline-none focus:border-[#FF5E14] text-xs font-bold"
                  />
                  <span className="text-[10px] text-text-muted">
                    Must not exceed Rs. {selectedBooking.pricePaid.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">Refund Payout Route</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="border border-border rounded-lg p-2.5 outline-none focus:border-[#FF5E14] text-xs font-semibold"
                  >
                    <option value="Original Payment Method">Original Payment Gateway (Stripe/Razorpay)</option>
                    <option value="Platform Wallet Credit">MakeEasyTrip Wallet Balance</option>
                    <option value="Direct Bank Account Transfer">Direct NEFT/IMPS Bank Transfer</option>
                    <option value="Cash / Offline Refund">Offline Cash Payout</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">Vetting Routing Control</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label
                      className={`border rounded-xl p-3 flex flex-col gap-1 cursor-pointer transition ${
                        vettingMode === "vetting"
                          ? "border-[#FF5E14] bg-orange-50/40"
                          : "border-border hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[#0A225C]">
                        <input
                          type="radio"
                          name="vettingMode"
                          checked={vettingMode === "vetting"}
                          onChange={() => setVettingMode("vetting")}
                          className="accent-[#FF5E14]"
                        />
                        Queue for Finance Vetting
                      </div>
                      <span className="text-[9px] text-text-muted">
                        Sends claim to the Finance team vetting console for standard compliance checking.
                      </span>
                    </label>

                    <label
                      className={`border rounded-xl p-3 flex flex-col gap-1 cursor-pointer transition ${
                        vettingMode === "direct"
                          ? "border-[#FF5E14] bg-orange-50/40"
                          : "border-border hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[#0A225C]">
                        <input
                          type="radio"
                          name="vettingMode"
                          checked={vettingMode === "direct"}
                          onChange={() => setVettingMode("direct")}
                          className="accent-[#FF5E14]"
                        />
                        Direct Disbursal
                      </div>
                      <span className="text-[9px] text-text-muted">
                        Bypasses checking and immediately flags the refund status as complete and disbursed.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-primary uppercase">
                    Refund Reason Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="E.g., Client requested rescheduling, but we couldn't accommodate. Refunding under goodwill policy..."
                    className="border border-border rounded-lg p-2.5 outline-none focus:border-[#FF5E14] text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-border flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="bg-white hover:bg-slate-100 border border-border text-primary font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="bg-[#FF5E14] hover:bg-[#ff5e14]/90 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
