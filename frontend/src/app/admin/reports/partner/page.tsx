"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Partner {
  id: string;
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  status: string;
  verificationStatus?: string;
  totalListings?: number;
  partnerType?: string;
}

interface Booking {
  id: string;
  customerName: string;
  propertyName: string;
  checkin: string;
  pricePaid: number;
  type?: string;
  status: string;
}

const DEFAULT_PARTNERS: Partner[] = [
  { id: "PTR001", businessName: "Goa Beach Resort", ownerName: "Priya Sharma", email: "priya@goabeach.com", status: "Active", verificationStatus: "Verified", totalListings: 3, partnerType: "Resort" },
  { id: "PTR002", businessName: "Bali Villas Co", ownerName: "Arjun Mehta", email: "arjun@balivillas.com", status: "Active", verificationStatus: "Pending", totalListings: 1, partnerType: "Villa" },
  { id: "PTR003", businessName: "Tokyo Stays", ownerName: "Yuki Tanaka", email: "yuki@tokyostays.com", status: "Active", verificationStatus: "Verified", totalListings: 2, partnerType: "Hotel" },
  { id: "PTR004", businessName: "Kerala Houseboat", ownerName: "Rajan Nair", email: "rajan@keralaboat.com", status: "Active", verificationStatus: "Under Review", totalListings: 0, partnerType: "Houseboat" },
  { id: "PTR005", businessName: "Rajasthan Heritage", ownerName: "Vikram Singh", email: "vikram@rajasthanheritage.com", status: "Active", verificationStatus: "Verified", totalListings: 1, partnerType: "Hotel" },
];

const DEFAULT_BOOKINGS: Booking[] = [
  { id: "MET-2601-1001", customerName: "Rahul Kumar", propertyName: "Sunset Villa Goa", checkin: "2026-07-10", pricePaid: 24000, type: "Hotel", status: "Confirmed" },
  { id: "MET-2601-1002", customerName: "Priya Sharma", propertyName: "Goa Water Sports", checkin: "2026-07-15", pricePaid: 5000, type: "Activity", status: "Confirmed" },
  { id: "MET-2601-1003", customerName: "Amit Verma", propertyName: "Ubud Rainforest Resort", checkin: "2026-06-20", pricePaid: 45000, type: "Hotel", status: "Completed" },
  { id: "MET-2601-1004", customerName: "Sneha Patel", propertyName: "Manali Trek", checkin: "2026-08-01", pricePaid: 9000, type: "Activity", status: "Pending" },
  { id: "MET-2601-1005", customerName: "Vikram Singh", propertyName: "Jaipur Palace Hotel", checkin: "2026-07-05", pricePaid: 18000, type: "Hotel", status: "Cancelled" },
  { id: "MET-2601-1006", customerName: "Ananya Das", propertyName: "Kerala Backwaters Cruise", checkin: "2026-07-20", pricePaid: 12000, type: "Activity", status: "Confirmed" },
  { id: "MET-2601-1007", customerName: "Rohan Gupta", propertyName: "Sunset Villa Goa", checkin: "2026-04-18", pricePaid: 30000, type: "Hotel", status: "Completed" },
];

export default function PartnerReportsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifFilter, setVerifFilter] = useState("");

  useEffect(() => {
    try {
      const storedPartners = localStorage.getItem("met_platform_partners") || localStorage.getItem("met_partners");
      const loadedPartners = storedPartners ? JSON.parse(storedPartners) : [];
      setPartners(loadedPartners.length > 0 ? loadedPartners : DEFAULT_PARTNERS);

      const storedBookings = localStorage.getItem("met_platform_bookings");
      const loadedBookings = storedBookings ? JSON.parse(storedBookings) : [];
      setBookings(loadedBookings.length > 0 ? loadedBookings : DEFAULT_BOOKINGS);
    } catch {
      setPartners(DEFAULT_PARTNERS);
      setBookings(DEFAULT_BOOKINGS);
    }
  }, []);

  // Map bookings to partners. Since we don't have perfect foreign keys in plain data, 
  // we map based on keyword matching or property name mappings.
  const partnerPerformance = useMemo(() => {
    return partners.map((partner) => {
      // Find bookings belonging to this partner
      let partnerBookings = bookings.filter((b) => {
        const prop = (b.propertyName || "").toLowerCase();
        const bizName = (partner.businessName || "").toLowerCase();
        
        // Matching rules: if booking property mentions partner business or keywords
        if (bizName.includes("goa") && prop.includes("goa")) return true;
        if (bizName.includes("bali") && prop.includes("ubud")) return true;
        if (bizName.includes("tokyo") && prop.includes("tokyo")) return true;
        if (bizName.includes("rajasthan") && prop.includes("jaipur")) return true;
        if (bizName.includes("kerala") && prop.includes("kerala")) return true;
        
        // Fallback exact match on words
        const bizWords = bizName.split(" ").filter(w => w.length > 3);
        return bizWords.some(w => prop.includes(w));
      });

      const confirmedBookings = partnerBookings.filter(b => b.status === "Confirmed" || b.status === "Completed");
      const totalSales = confirmedBookings.reduce((sum, b) => sum + (b.pricePaid || 0), 0);
      const commissionContribution = Math.round(totalSales * 0.15); // Standard 15% rate

      return {
        ...partner,
        bookingsCount: confirmedBookings.length,
        totalSales,
        commissionContribution,
      };
    });
  }, [partners, bookings]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalPartners = partners.length;
    const activePartners = partners.filter(p => p.status === "Active").length;
    const pendingReview = partners.filter(p => p.verificationStatus === "Pending" || p.verificationStatus === "Under Review").length;
    const totalListings = partners.reduce((sum, p) => sum + (p.totalListings || 0), 0);
    const totalPlatformCommissions = partnerPerformance.reduce((sum, p) => sum + p.commissionContribution, 0);

    return {
      totalPartners,
      activePartners,
      pendingReview,
      totalListings,
      totalPlatformCommissions,
    };
  }, [partners, partnerPerformance]);

  // Filtered partners base
  const filteredPartners = useMemo(() => {
    let list = partnerPerformance;

    if (verifFilter) {
      list = list.filter((p) => {
        const vs = p.verificationStatus || "Pending";
        if (verifFilter === "Verified") return vs === "Verified";
        if (verifFilter === "Pending") return vs !== "Verified";
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.ownerName && p.ownerName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [partnerPerformance, verifFilter, searchQuery]);

  const topPartners = useMemo(() => {
    return [...partnerPerformance]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3);
  }, [partnerPerformance]);

  const formatCurrency = (amount: number) => {
    return "₹" + amount.toLocaleString("en-IN");
  };

  return (
    <AdminLayout
      title="Partner Performance Analytics"
      subtitle="Evaluate supplier commission payments, property listing numbers, and vendor account validation audits."
    >
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-primary">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Registered Suppliers</span>
          <div className="text-2xl font-extrabold text-primary mt-1">{aggregateStats.totalPartners}</div>
          <div className="text-[10px] text-success font-bold mt-2">
            <i className="fa-solid fa-circle-check mr-1"></i> {aggregateStats.activePartners} Active operations
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Total Commission Volume</span>
          <div className="text-2xl font-extrabold text-secondary mt-1">{formatCurrency(aggregateStats.totalPlatformCommissions)}</div>
          <div className="text-[10px] text-text-muted font-bold mt-2">
            Estimated 15.0% yield base
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Supplier Catalog Items</span>
          <div className="text-2xl font-extrabold text-success mt-1">{aggregateStats.totalListings} Listings</div>
          <div className="text-[10px] text-success font-bold mt-2">
            Avg: {aggregateStats.totalPartners > 0 ? (aggregateStats.totalListings / aggregateStats.totalPartners).toFixed(1) : 0} items/partner
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Pending Vetting Queues</span>
          <div className="text-2xl font-extrabold text-danger mt-1">{aggregateStats.pendingReview} Accounts</div>
          <div className="text-[10px] text-danger font-bold mt-2">
            <i className="fa-solid fa-circle-exclamation mr-1"></i> Requires compliance review
          </div>
        </div>
      </div>

      {/* Top Performing Partners Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-6">
            <i className="fa-solid fa-trophy text-secondary mr-2"></i> Supplier Revenue Leaderboard
          </h3>

          <div className="space-y-4">
            {topPartners.map((p, idx) => {
              const maxSales = Math.max(...partnerPerformance.map((item) => item.totalSales), 1);
              const percent = Math.round((p.totalSales / maxSales) * 100);

              return (
                <div key={p.id} className="p-4 bg-bg-light border border-border rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-primary">{p.businessName}</span>
                      <span className="text-[9px] uppercase font-bold text-text-muted bg-white border border-border px-2 py-0.5 rounded-full">
                        {p.partnerType || "AGENCY"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-secondary">{formatCurrency(p.totalSales)} sales</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-text-muted font-semibold">
                    <span>{p.bookingsCount} guest checkouts</span>
                    <span className="text-secondary font-bold">Commission share: {formatCurrency(p.commissionContribution)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commission Tiering Analysis */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-4">
              <i className="fa-solid fa-receipt text-secondary mr-2"></i> Partner Fee Levels
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Our travel consortium manages partner commissions using listing metrics and billing performance tiers.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 border-b border-border font-semibold">
                <span className="text-primary font-bold">Bronze (0-5 bookings)</span>
                <span className="text-secondary font-extrabold">15.0% flat</span>
              </div>
              <div className="flex justify-between items-center p-2.5 border-b border-border font-semibold">
                <span className="text-primary font-bold">Silver (6-20 bookings)</span>
                <span className="text-secondary font-extrabold">12.5% flat</span>
              </div>
              <div className="flex justify-between items-center p-2.5 font-semibold">
                <span className="text-primary font-bold">Gold (20+ bookings)</span>
                <span className="text-secondary font-extrabold">10.0% flat</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-secondary/10 p-4 rounded-xl text-left mt-6">
            <span className="text-[10px] font-extrabold text-secondary uppercase block">Consortium Guidelines</span>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              Discounts to standard commissions must be reviewed and signed off by the Operations Vetting board.
            </p>
          </div>
        </div>
      </div>

      {/* Partners List Filter and Grid */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-56 text-xs">
            <select
              value={verifFilter}
              onChange={(e) => setVerifFilter(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="">All Verification Statuses</option>
              <option value="Verified">Verified Partners</option>
              <option value="Pending">Pending / Under Review</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
              <i className="fa-solid fa-search text-xs"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner business name, ID..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Partner ID</th>
                <th>Supplier Company</th>
                <th>Rep. Owner</th>
                <th>Catalog Stays</th>
                <th>Bookings Count</th>
                <th>Gross Billings</th>
                <th>Status</th>
                <th>Verification</th>
                <th style={{ textAlign: "right" }}>Commissions Contribution</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-text-muted text-xs">
                    No supplier matching selection criteria found.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const statusClass = p.status === "Active" ? "badge approved" : "badge danger";
                  const verifClass = 
                    p.verificationStatus === "Verified"
                      ? "badge approved"
                      : p.verificationStatus === "Pending"
                      ? "badge warning"
                      : "badge info";

                  return (
                    <tr key={p.id} className="admin-table-row text-xs">
                      <td><strong>{p.id}</strong></td>
                      <td className="font-bold text-primary">{p.businessName}</td>
                      <td className="font-semibold text-text-muted">{p.ownerName || "N/A"}</td>
                      <td className="font-bold text-primary text-center">
                        <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {p.totalListings ?? 0}
                        </span>
                      </td>
                      <td className="font-semibold text-text-muted">{p.bookingsCount} orders</td>
                      <td className="font-bold text-primary">{formatCurrency(p.totalSales)}</td>
                      <td>
                        <span className={statusClass}>{p.status}</span>
                      </td>
                      <td>
                        <span className={verifClass}>{p.verificationStatus || "Pending"}</span>
                      </td>
                      <td style={{ textAlign: "right" }} className="font-bold text-secondary">
                        {formatCurrency(p.commissionContribution)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
