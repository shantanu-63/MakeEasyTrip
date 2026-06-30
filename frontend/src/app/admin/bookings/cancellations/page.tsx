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
  adminNotes?: string;
}

export default function CancellationsPage() {
  const { bookings, syncBookings, addLog } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [customRefundAmt, setCustomRefundAmt] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState("");

  // Seed cancellation claims if none exist in the bookings DB
  useEffect(() => {
    if (bookings.length > 0) {
      const hasCancellations = bookings.some(
        (b) =>
          b.status === "Cancellation Requested" ||
          b.status === "Cancelled" ||
          b.refundStatus === "Pending" ||
          b.refundStatus === "Approved" ||
          b.refundStatus === "Rejected"
      );

      if (!hasCancellations) {
        const updated = bookings.map((b, idx) => {
          if (idx === 0) {
            return {
              ...b,
              status: "Cancellation Requested",
              cancellationReason: "Medical emergency in the family. Flight cancelled.",
              cancellationDate: "2026-06-22",
              refundRequested: true,
              refundStatus: "Pending",
              refundAmount: b.pricePaid,
            };
          }
          if (idx === 2) {
            return {
              ...b,
              status: "Cancellation Requested",
              cancellationReason: "Sudden business travel rescheduling. Cannot travel anymore.",
              cancellationDate: "2026-06-21",
              refundRequested: true,
              refundStatus: "Pending",
              refundAmount: b.pricePaid,
            };
          }
          return b;
        });
        syncBookings(updated);
        addLog("SYSTEM: Seeded cancellation claims for testing.");
      }
    }
  }, [bookings, syncBookings, addLog]);

  // Handle modal selection
  const openProcessModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setCustomRefundAmt(booking.refundAmount || booking.pricePaid);
    setAdminNotes(booking.adminNotes || "");
  };

  // Close modal
  const closeModal = () => {
    setSelectedBooking(null);
  };

  // Approve Claim
  const handleApproveClaim = () => {
    if (!selectedBooking) return;

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          status: "Cancelled",
          refundStatus: "Approved",
          refundAmount: customRefundAmt,
          adminNotes: adminNotes,
          cancellationDate: b.cancellationDate || new Date().toISOString().split("T")[0],
        };
      }
      return b;
    });

    syncBookings(updated);
    addLog(`CANCELLATION: Approved claim ${selectedBooking.id} with refund amount Rs. ${customRefundAmt}`);
    alert(`Cancellation claim approved. Refund of Rs. ${customRefundAmt.toLocaleString()} has been queued for vetting.`);
    closeModal();
  };

  // Reject Claim
  const handleRejectClaim = () => {
    if (!selectedBooking) return;

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          status: "Confirmed", // Reverted to confirmed or cancellation rejected
          refundStatus: "Rejected",
          refundAmount: 0,
          adminNotes: adminNotes,
        };
      }
      return b;
    });

    syncBookings(updated);
    addLog(`CANCELLATION: Rejected claim ${selectedBooking.id}. Status reverted to Confirmed.`);
    alert(`Cancellation claim rejected. Booking status has been reverted to Confirmed.`);
    closeModal();
  };

  // Inject a new mockup claim for testing
  const injectMockClaim = () => {
    const claimId = `MET-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: Booking = {
      id: claimId,
      customerName: "Aarav Kapoor",
      propertyName: "Sandalwood Luxury Stays",
      propertyId: "prop-4",
      checkin: "2026-07-02",
      checkout: "2026-07-06",
      pricePaid: 32000,
      type: "hotel",
      status: "Cancellation Requested",
      cancellationReason: "Flight price hike and overall itinerary cancellation.",
      cancellationDate: "2026-06-23",
      refundRequested: true,
      refundStatus: "Pending",
      refundAmount: 32000,
    };
    syncBookings([newClaim, ...bookings]);
    addLog(`CANCELLATION: Injected mock claim ${claimId}`);
    alert(`Injected mock cancellation claim: ${claimId}`);
  };

  // Filtering logic
  const filteredClaims = bookings.filter((b) => {
    // We only display bookings that have a cancellation request, are cancelled, or have refund metadata
    const isCancellation =
      b.status === "Cancellation Requested" ||
      b.status === "Cancelled" ||
      b.refundStatus === "Pending" ||
      b.refundStatus === "Approved" ||
      b.refundStatus === "Rejected";

    if (!isCancellation) return false;

    // Filter by claim status selection
    // "Pending" -> status is 'Cancellation Requested' AND refundStatus is 'Pending'
    // "Approved" -> refundStatus is 'Approved' (or status is 'Cancelled' with refundStatus 'Approved')
    // "Rejected" -> refundStatus is 'Rejected'
    if (filterStatus === "Pending") {
      if (b.refundStatus !== "Pending" && b.status !== "Cancellation Requested") return false;
    } else if (filterStatus === "Approved") {
      if (b.refundStatus !== "Approved") return false;
    } else if (filterStatus === "Rejected") {
      if (b.refundStatus !== "Rejected") return false;
    }

    // Search query match
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      b.customerName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q) ||
      (b.cancellationReason && b.cancellationReason.toLowerCase().includes(q));

    return matchSearch;
  });

  // Calculate statistics
  const totalClaims = bookings.filter(
    (b) => b.status === "Cancellation Requested" || b.refundStatus === "Pending"
  ).length;
  const approvedClaims = bookings.filter((b) => b.refundStatus === "Approved").length;
  const rejectedClaims = bookings.filter((b) => b.refundStatus === "Rejected").length;
  const totalRefundAmt = bookings
    .filter((b) => b.refundStatus === "Approved")
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  return (
    <AdminLayout
      title="Cancellation Claims"
      subtitle="Review guest cancellation claims, verify policy eligibility, and process refunds."
      actionButton={
        <button
          onClick={injectMockClaim}
          className="bg-[#FF5E14] hover:bg-[#ff5e14]/90 text-white font-bold text-xs py-2 px-4 rounded-xl transition duration-150 shadow-sm flex items-center gap-1.5"
        >
          <i className="fa-solid fa-plus-circle"></i> Create Test Claim
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-[#0A225C]">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Pending Claims</span>
          <div className="text-2xl font-extrabold text-[#0A225C] mt-1">{totalClaims}</div>
          <span className="text-[10px] text-text-muted">Awaiting decision</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Approved Refunds</span>
          <div className="text-2xl font-extrabold text-success mt-1">{approvedClaims}</div>
          <span className="text-[10px] text-text-muted">Paid/Approved requests</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Rejected Claims</span>
          <div className="text-2xl font-extrabold text-danger mt-1">{rejectedClaims}</div>
          <span className="text-[10px] text-text-muted">Disallowed requests</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Refund Value Approved</span>
          <div className="text-2xl font-extrabold text-[#FF5E14] mt-1">
            Rs. {totalRefundAmt.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Queued for vetting</span>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-primary uppercase">Claim Status</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {["Pending", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 py-1.5 rounded-md font-bold text-center transition-all ${
                    filterStatus === status
                      ? "bg-white text-primary shadow-sm"
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-bold text-primary uppercase">Search Claims</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <i className="fa-solid fa-search text-[10px]"></i>
              </span>
              <input
                type="text"
                placeholder="Search by customer name, booking ID, hotel, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Property</th>
                <th>Check In</th>
                <th>Paid Amount</th>
                <th>Claim Date</th>
                <th>Reason</th>
                <th>Refund Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-text-muted font-semibold">
                    <i className="fa-solid fa-ban text-3xl mb-3 block text-slate-300"></i>
                    No cancellation claims found in this category.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="admin-table-row text-xs">
                    <td>
                      <strong>{claim.id}</strong>
                    </td>
                    <td className="font-bold text-primary">{claim.customerName}</td>
                    <td className="font-bold text-primary max-w-[150px] truncate" title={claim.propertyName}>
                      {claim.propertyName}
                    </td>
                    <td className="text-text-muted font-semibold">
                      {new Date(claim.checkin).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="font-bold text-primary">Rs. {claim.pricePaid.toLocaleString("en-IN")}</td>
                    <td className="text-text-muted">
                      {claim.cancellationDate
                        ? new Date(claim.cancellationDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="max-w-[200px] truncate italic text-text-muted" title={claim.cancellationReason}>
                      {claim.cancellationReason || "No reason specified"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          claim.refundStatus === "Approved"
                            ? "approved"
                            : claim.refundStatus === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {claim.refundStatus || "Pending Vetting"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {claim.refundStatus === "Pending" || claim.status === "Cancellation Requested" ? (
                        <button
                          onClick={() => openProcessModal(claim)}
                          className="bg-primary hover:bg-[#081a4a] text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ml-auto"
                        >
                          <i className="fa-solid fa-gavel"></i> Process Claim
                        </button>
                      ) : (
                        <button
                          onClick={() => openProcessModal(claim)}
                          className="bg-slate-100 hover:bg-slate-200 text-primary font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ml-auto"
                        >
                          <i className="fa-solid fa-eye"></i> View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0A225C] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold font-heading">Process Cancellation Claim</h3>
                <p className="text-[11px] text-white/70 mt-0.5">Booking ID: {selectedBooking.id}</p>
              </div>
              <button onClick={closeModal} className="text-white/80 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Booking Info Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-border/60">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Guest Name</span>
                  <span className="font-bold text-primary">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Property Stay</span>
                  <span className="font-bold text-primary block truncate" title={selectedBooking.propertyName}>
                    {selectedBooking.propertyName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Check-in Date</span>
                  <span className="font-semibold text-text-muted">
                    {new Date(selectedBooking.checkin).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Total Price Paid</span>
                  <span className="font-bold text-primary">
                    Rs. {selectedBooking.pricePaid.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <span className="text-[10px] text-primary font-bold uppercase block mb-1">
                  Cancellation Details
                </span>
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-danger italic">
                  &ldquo;{selectedBooking.cancellationReason || "No reason specified"}&rdquo;
                </div>
                {selectedBooking.cancellationDate && (
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Submitted on:{" "}
                    {new Date(selectedBooking.cancellationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Refund Policy Calculation */}
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <h4 className="font-bold text-warning text-[11px] uppercase mb-1">Cancellation Policy Check</h4>
                <p className="text-text-muted leading-relaxed">
                  Based on check-in date ({selectedBooking.checkin}) and request date (
                  {selectedBooking.cancellationDate || "2026-06-23"}), this booking qualifies for a:
                </p>
                <div className="mt-2 text-xs font-bold text-primary">
                  {new Date(selectedBooking.checkin).getTime() -
                    new Date(selectedBooking.cancellationDate || "2026-06-23").getTime() >
                  7 * 24 * 60 * 60 * 1000 ? (
                    <span className="text-success flex items-center gap-1">
                      <i className="fa-solid fa-check-circle"></i> Full Refund Eligible (&gt; 7 days notice)
                    </span>
                  ) : new Date(selectedBooking.checkin).getTime() -
                      new Date(selectedBooking.cancellationDate || "2026-06-23").getTime() >
                    2 * 24 * 60 * 60 * 1000 ? (
                    <span className="text-warning flex items-center gap-1">
                      <i className="fa-solid fa-info-circle"></i> 50% Refund Eligible (2-7 days notice)
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">
                      <i className="fa-solid fa-triangle-exclamation"></i> No Refund / Fee Applies (&lt; 48h notice)
                    </span>
                  )}
                </div>
              </div>

              {/* Form Input for Refund Amount */}
              {selectedBooking.refundStatus === "Pending" || selectedBooking.status === "Cancellation Requested" ? (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-primary uppercase">
                      Approve Refund Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      max={selectedBooking.pricePaid}
                      min={0}
                      value={customRefundAmt}
                      onChange={(e) => setCustomRefundAmt(Number(e.target.value))}
                      className="border border-border rounded-lg p-2 outline-none focus:border-[#0A225C] text-xs font-bold"
                    />
                    <span className="text-[10px] text-text-muted">
                      Max allowed: Rs. {selectedBooking.pricePaid.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-primary uppercase">
                      Internal Audit / Guest Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add processing notes or reasons for full/partial approval..."
                      className="border border-border rounded-lg p-2 outline-none focus:border-[#0A225C] text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block">Final Refund Amount</span>
                      <span className="font-bold text-primary">
                        Rs. {selectedBooking.refundAmount?.toLocaleString("en-IN") || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block">Vetting Status</span>
                      <span
                        className={`badge ${
                          selectedBooking.refundStatus === "Approved"
                            ? "approved"
                            : selectedBooking.refundStatus === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {selectedBooking.refundStatus}
                      </span>
                    </div>
                  </div>
                  {selectedBooking.adminNotes && (
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block">Internal Admin Notes</span>
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-border/40 font-semibold italic text-text-muted">
                        {selectedBooking.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 p-4 border-t border-border flex justify-between gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-white hover:bg-slate-100 border border-border text-primary font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Close
              </button>

              {(selectedBooking.refundStatus === "Pending" || selectedBooking.status === "Cancellation Requested") && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRejectClaim}
                    className="bg-danger hover:bg-danger/90 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                  >
                    Reject Claim
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveClaim}
                    className="bg-[#0A225C] hover:bg-[#081a4a] text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                  >
                    Approve & Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
