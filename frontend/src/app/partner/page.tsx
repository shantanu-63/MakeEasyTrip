"use client";

import React, { useMemo, useEffect, Suspense } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import KPIStatsCard from "@/components/partner/KPIStatsCard";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function PartnerDashboardContent() {
  const router = useRouter();
  const { properties, bookings, activePartner } = useData();

  // Guard check: redirect if not logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  // Filter properties and bookings managed by this partner
  const partnerId = activePartner?.id || "partner-1";

  const partnerProperties = useMemo(() => {
    return properties.filter((p) => p.partnerId === partnerId || !p.partnerId);
  }, [properties, partnerId]);

  const partnerBookings = useMemo(() => {
    const propIds = partnerProperties.map((p) => p.id);
    return bookings.filter((b) => propIds.includes(b.propertyId));
  }, [bookings, partnerProperties]);

  const stats = useMemo(() => {
    const activeStays = partnerProperties.filter((p) => p.status === "Approved" || p.status === "Published").length;
    const totalRev = partnerBookings.reduce((sum, b) => (b.status === "Confirmed" || b.status === "Completed" ? sum + b.pricePaid : sum), 0);
    const activeGuests = partnerBookings.filter((b) => b.status === "Confirmed").length;
    const pendingAudits = partnerProperties.filter((p) => p.status === "Pending").length;

    return { activeStays, totalRev, activeGuests, pendingAudits };
  }, [partnerProperties, partnerBookings]);

  // Get recent reviews for partner properties
  const partnerReviews = useMemo(() => {
    const list: any[] = [];
    partnerProperties.forEach((p) => {
      p.reviews?.forEach((r: any) => {
        list.push({
          propertyName: p.title,
          author: r.author,
          rating: r.rating,
          date: r.date,
          text: r.text,
        });
      });
    });
    return list.slice(0, 3);
  }, [partnerProperties]);

  // Handle manual redirects
  const handleViewDetails = (type: "hotel" | "activity", id: string) => {
    const routeType = type === "activity" ? "activities" : "hotels";
    router.push(`/customer/${routeType}/${id}`);
  };

  return (
    <PartnerLayout
      title="Partner Operations Dashboard"
      subtitle="Indo-Global Travel DMC Ltd • Merchant Control Panel"
    >
      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPIStatsCard
          title="Active Listings"
          value={`${stats.activeStays} Properties`}
          subText={`${partnerProperties.length} Registered`}
          type="default"
        />
        <KPIStatsCard
          title="Booking Revenue"
          value={`₹${stats.totalRev.toLocaleString("en-IN")}`}
          subText="Real-time gross bookings"
          type="default"
        />
        <KPIStatsCard
          title="Upcoming Arrivals"
          value={`${stats.activeGuests} Stays`}
          subText="Guests arriving this week"
          type="default"
        />
        <KPIStatsCard
          title="Pending Audits"
          value={`${stats.pendingAudits} Listings`}
          subText="Awaiting portal approval"
          type={stats.pendingAudits > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stays and Bookings lists */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active Listings Table */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-base font-extrabold text-primary mb-4 flex justify-between items-center">
              <span>
                <i className="fa-solid fa-hotel mr-1.5 text-secondary"></i> Registered Stays &amp; Tours
              </span>
              <Link href="/partner/properties" className="text-xs text-secondary font-bold hover:underline">
                View All
              </Link>
            </h3>
            <div className="overflow-x-auto">
              <table className="partner-table w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2">Listing Title</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">City</th>
                    <th className="pb-2">Base Price</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerProperties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted italic">
                        No properties registered yet.
                      </td>
                    </tr>
                  ) : (
                    partnerProperties.slice(0, 4).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleViewDetails(p.type, p.id)}
                      >
                        <td className="py-2.5 font-bold text-primary">{p.title}</td>
                        <td className="py-2.5 text-text-main capitalize">{p.type}</td>
                        <td className="py-2.5 text-text-muted">{p.city}</td>
                        <td className="py-2.5 font-semibold text-secondary">
                          ₹{p.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === "Approved" || p.status === "Published"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-base font-extrabold text-primary mb-4 flex justify-between items-center">
              <span>
                <i className="fa-solid fa-receipt mr-1.5 text-secondary"></i> Recent Reservations
              </span>
              <Link href="/partner/bookings" className="text-xs text-secondary font-bold hover:underline">
                Manage Bookings
              </Link>
            </h3>
            <div className="overflow-x-auto">
              <table className="partner-table w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2">Booking ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Check In</th>
                    <th className="pb-2">Price Paid</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted italic">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    partnerBookings.slice(0, 4).map((b) => (
                      <tr key={b.id} className="border-b border-slate-100">
                        <td className="py-2.5 font-mono text-[10px] font-bold text-primary">{b.id}</td>
                        <td className="py-2.5 font-semibold text-text-main">{b.customerName}</td>
                        <td className="py-2.5 text-text-muted">{b.checkin}</td>
                        <td className="py-2.5 font-semibold text-primary">
                          ₹{b.pricePaid.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === "Confirmed" || b.status === "Completed"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-red-50 text-red-500 border border-red-100"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Graphs and feeds */}
        <div className="flex flex-col gap-6">
          {/* Revenue graph */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-base font-extrabold text-primary mb-4 flex items-center gap-1.5">
              <i className="fa-solid fa-chart-column text-secondary"></i> Revenue Summary
            </h3>
            <div className="revenue-graph-wrapper py-6">
              <div className="graph-container flex items-end justify-between h-40 gap-3 px-2 border-b border-border">
                {[
                  { month: "Jan", height: "h-8", opacity: "bg-primary/20" },
                  { month: "Feb", height: "h-6", opacity: "bg-primary/20" },
                  { month: "Mar", height: "h-12", opacity: "bg-primary/20" },
                  { month: "Apr", height: "h-16", opacity: "bg-primary/40" },
                  { month: "May", height: "h-24", opacity: "bg-primary/60" },
                  { month: "Jun", height: "h-32", opacity: "bg-secondary" },
                ].map(({ month, height, opacity }) => (
                  <div key={month} className="graph-bar-wrapper flex flex-col items-center flex-grow">
                    <div className={`graph-bar ${opacity} w-4 ${height} rounded-t`}></div>
                    <span className="text-[10px] text-text-muted mt-1">{month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guest Reviews */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-base font-extrabold text-primary mb-4 flex items-center gap-1.5">
              <i className="fa-solid fa-star-half-stroke text-secondary"></i> Guest Reviews Feed
            </h3>
            <div className="reviews-feed flex flex-col gap-4">
              {partnerReviews.length === 0 ? (
                <div className="text-center text-text-muted text-xs italic py-4">
                  No guest reviews yet.
                </div>
              ) : (
                partnerReviews.map((r, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-primary block">{r.author}</span>
                        <span className="text-[9px] text-text-muted">{r.propertyName}</span>
                      </div>
                      <span className="text-[10px] text-orange-500 font-bold">★ {r.rating}</span>
                    </div>
                    <p className="text-[11px] text-text-main italic mt-1 leading-relaxed">
                      &quot;{r.text}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-base font-extrabold text-primary mb-4 flex items-center gap-1.5">
              <i className="fa-solid fa-bell text-secondary"></i> Notifications
            </h3>
            <div className="notifications-list flex flex-col gap-3">
              <div className="notification-item flex gap-3 text-xs text-text-main border-b border-slate-50 pb-2">
                <i className="fa-solid fa-circle-info text-secondary text-sm mt-0.5"></i>
                <div>
                  <p>
                    Welcome to your MakeEasyTrip Partner Dashboard. Please check your banking credentials to ensure smooth payouts.
                  </p>
                  <span className="text-[9px] text-text-muted mt-1 block">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading partner dashboard...</div>
      </div>
    }>
      <PartnerDashboardContent />
    </Suspense>
  );
}
