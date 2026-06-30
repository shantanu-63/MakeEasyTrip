"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

function PartnerBookingsContent() {
  const router = useRouter();
  const { properties, bookings, syncBookings, activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Filter properties managed by this partner
  const partnerProps = useMemo(() => {
    return properties.filter((p) => p.partnerId === partnerId || !p.partnerId);
  }, [properties, partnerId]);

  // Filter bookings for these properties
  const partnerBookings = useMemo(() => {
    const propIds = partnerProps.map((p) => p.id);
    return bookings.filter((b) => propIds.includes(b.propertyId));
  }, [bookings, partnerProps]);

  // Active status filter: "all" | "Confirmed" | "Completed" | "Cancelled"
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return partnerBookings;
    return partnerBookings.filter((b) => b.status === statusFilter);
  }, [partnerBookings, statusFilter]);

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  const handleUpdateStatus = (bookingId: string, newStatus: "Confirmed" | "Completed" | "Cancelled") => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: newStatus,
          paymentStatus: newStatus === "Cancelled" ? ("Refunded" as const) : b.paymentStatus,
        };
      }
      return b;
    });

    syncBookings(updated);
    addLog(`PARTNER_HUB: Updated status of booking ${bookingId} to ${newStatus}`);
    alert(`Success! Updated booking status to ${newStatus}`);
  };

  return (
    <PartnerLayout
      title="Reservation Manager"
      subtitle="Track customer arrivals, manage check-in statuses, and log occupancy."
    >
      {/* Bookings Management Box */}
      <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
        {/* Status Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-slate-50 text-text-main border border-border hover:bg-slate-100"
              }`}
            >
              {status === "all"
                ? "All Bookings"
                : status === "Confirmed"
                ? "Confirmed / Upcoming"
                : status}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="partner-table w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2">Booking ID</th>
                <th className="pb-2">Customer Details</th>
                <th className="pb-2">Property</th>
                <th className="pb-2">Check-in Date</th>
                <th className="pb-2">Paid Cost</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Quick Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted italic">
                    No bookings found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-3 font-mono font-bold text-primary text-[10px]">{b.id}</td>
                    <td className="py-3">
                      <div className="font-semibold text-text-main">{b.customerName}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{b.customerEmail}</div>
                    </td>
                    <td className="py-3 font-semibold text-text-main">{b.propertyName}</td>
                    <td className="py-3 text-text-muted">{b.checkin}</td>
                    <td className="py-3 font-bold text-primary">
                      ₹{b.pricePaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : b.status === "Completed"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-red-50 text-red-500 border border-red-100"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {b.status === "Confirmed" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "Completed")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 px-2 py-1 rounded text-[10px] font-bold"
                            >
                              Check-In / Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                              className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 px-2 py-1 rounded text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {b.status !== "Confirmed" && (
                          <span className="text-text-muted text-[10px] italic">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PartnerLayout>
  );
}

export default function PartnerBookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading bookings...</div>
      </div>
    }>
      <PartnerBookingsContent />
    </Suspense>
  );
}
