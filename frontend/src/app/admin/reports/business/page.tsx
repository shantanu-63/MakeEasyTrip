"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Booking {
  id: string;
  customerName: string;
  propertyName: string;
  checkin: string;
  checkout?: string;
  createdDate?: string;
  pricePaid: number;
  type?: string;
  status: string;
}

const DEFAULT_BOOKINGS: Booking[] = [
  { id: "MET-2601-1001", customerName: "Rahul Kumar", propertyName: "Ocean Palms Beach Resort", checkin: "2026-06-10", createdDate: "2026-06-01T10:00:00Z", pricePaid: 24000, type: "Hotel", status: "Confirmed" },
  { id: "MET-2601-1002", customerName: "Priya Sharma", propertyName: "Goa Water Sports", checkin: "2026-06-15", createdDate: "2026-06-03T11:30:00Z", pricePaid: 5000, type: "Activity", status: "Confirmed" },
  { id: "MET-2601-1003", customerName: "Amit Verma", propertyName: "Ubud Rainforest Resort", checkin: "2026-05-20", createdDate: "2026-05-28T09:00:00Z", pricePaid: 45000, type: "Hotel", status: "Completed" },
  { id: "MET-2601-1004", customerName: "Sneha Patel", propertyName: "Manali Trek", checkin: "2026-06-05", createdDate: "2026-06-02T14:00:00Z", pricePaid: 9000, type: "Activity", status: "Pending" },
  { id: "MET-2601-1005", customerName: "Vikram Singh", propertyName: "Jaipur Palace Hotel", checkin: "2026-05-05", createdDate: "2026-05-02T16:00:00Z", pricePaid: 18000, type: "Hotel", status: "Cancelled" },
  { id: "MET-2601-1006", customerName: "Ananya Das", propertyName: "Kerala Backwaters Cruise", checkin: "2026-06-12", createdDate: "2026-06-08T08:00:00Z", pricePaid: 12000, type: "Activity", status: "Confirmed" },
  { id: "MET-2601-1007", customerName: "Rohan Gupta", propertyName: "Sunset Villa Goa", checkin: "2026-04-18", createdDate: "2026-04-12T10:00:00Z", pricePaid: 30000, type: "Hotel", status: "Completed" },
  { id: "MET-2601-1008", customerName: "Neha Sen", propertyName: "Bali Paragliding", checkin: "2026-04-20", createdDate: "2026-04-14T09:00:00Z", pricePaid: 6500, type: "Activity", status: "Completed" },
];

export default function BusinessReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "12months">("30days");
  const [activeTab, setActiveTab] = useState<"hotels" | "activities" | "all">("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("met_platform_bookings");
      const loaded: Booking[] = stored ? JSON.parse(stored) : [];
      setBookings(loaded.length > 0 ? loaded : DEFAULT_BOOKINGS);
    } catch {
      setBookings(DEFAULT_BOOKINGS);
    }
  }, []);

  // Filtered Bookings based on Category Tab and Time Range
  const filteredData = useMemo(() => {
    let list = bookings;
    
    // Category filter
    if (activeTab === "hotels") {
      list = list.filter((b) => (b.type || "Hotel").toLowerCase() === "hotel");
    } else if (activeTab === "activities") {
      list = list.filter((b) => (b.type || "").toLowerCase() === "activity" || (b.type || "").toLowerCase() === "experience");
    }

    // Time filter
    const now = new Date();
    list = list.filter((b) => {
      const bDate = new Date(b.createdDate || b.checkin || now);
      const diffTime = Math.abs(now.getTime() - bDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeRange === "7days") return diffDays <= 7;
      if (timeRange === "30days") return diffDays <= 30;
      if (timeRange === "12months") return diffDays <= 365;
      return true;
    });

    return list;
  }, [bookings, activeTab, timeRange]);

  // Financial KPIs calculations
  const stats = useMemo(() => {
    const total = filteredData.length;
    const confirmed = filteredData.filter((b) => b.status === "Confirmed" || b.status === "Completed");
    const cancelled = filteredData.filter((b) => b.status === "Cancelled");
    const pending = filteredData.filter((b) => b.status === "Pending");

    const grossGmv = confirmed.reduce((sum, b) => sum + (b.pricePaid || 0), 0);
    const lostGmv = cancelled.reduce((sum, b) => sum + (b.pricePaid || 0), 0);
    
    // Platform commission estimation (15% default fee tier)
    const platformCommission = Math.round(grossGmv * 0.15);

    const aov = confirmed.length > 0 ? Math.round(grossGmv / confirmed.length) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled.length / total) * 100) : 0;

    return {
      totalBookings: total,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      pendingCount: pending.length,
      grossGmv,
      lostGmv,
      platformCommission,
      aov,
      cancellationRate,
    };
  }, [filteredData]);

  // Generate SVG Chart points dynamically
  const chartData = useMemo(() => {
    const pointsMap: Record<string, number> = {};

    if (timeRange === "7days") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        pointsMap[key] = 0;
      }
      filteredData.forEach((b) => {
        if (b.status !== "Cancelled") {
          const bDate = new Date(b.createdDate || b.checkin);
          const key = bDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          if (key in pointsMap) {
            pointsMap[key] += (b.pricePaid || 0);
          }
        }
      });
    } else if (timeRange === "30days") {
      // Last 4 weeks
      for (let i = 4; i >= 1; i--) {
        pointsMap[`Week ${i}`] = 0;
      }
      const now = new Date();
      filteredData.forEach((b) => {
        if (b.status !== "Cancelled") {
          const bDate = new Date(b.createdDate || b.checkin);
          const diffDays = Math.ceil(Math.abs(now.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24));
          const wNum = Math.min(4, Math.ceil(diffDays / 7));
          const key = `Week ${5 - wNum}`;
          if (key in pointsMap) {
            pointsMap[key] += (b.pricePaid || 0);
          }
        }
      });
    } else {
      // Last 12 months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      for (let i = 11; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        pointsMap[months[mIdx]] = 0;
      }
      filteredData.forEach((b) => {
        if (b.status !== "Cancelled") {
          const bDate = new Date(b.createdDate || b.checkin);
          const mName = months[bDate.getMonth()];
          if (mName in pointsMap) {
            pointsMap[mName] += (b.pricePaid || 0);
          }
        }
      });
    }

    const labels = Object.keys(pointsMap);
    const values = Object.values(pointsMap);
    const maxVal = Math.max(...values, 5000);

    return { labels, values, maxVal };
  }, [filteredData, timeRange]);

  const formatCurrency = (amount: number) => {
    return "₹" + amount.toLocaleString("en-IN");
  };

  return (
    <AdminLayout
      title="Business Reports & GMV Tracking"
      subtitle="Examine booking volume ratios, gross merchandise values, commissions and overall corporate growth metrics."
    >
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Report Horizon:</span>
          <div className="flex border border-border rounded-lg overflow-hidden bg-bg-light text-xs font-bold text-primary">
            <button
              onClick={() => setTimeRange("7days")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors ${timeRange === "7days" ? "bg-primary text-white hover:bg-primary" : ""}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30days")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors border-x border-border ${timeRange === "30days" ? "bg-primary text-white hover:bg-primary" : ""}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("12months")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors ${timeRange === "12months" ? "bg-primary text-white hover:bg-primary" : ""}`}
            >
              12 Months
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Category Segment:</span>
          <div className="flex border border-border rounded-lg overflow-hidden bg-bg-light text-xs font-bold text-primary">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors ${activeTab === "all" ? "bg-secondary text-white hover:bg-secondary" : ""}`}
            >
              All Product Classes
            </button>
            <button
              onClick={() => setActiveTab("hotels")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors border-x border-border ${activeTab === "hotels" ? "bg-secondary text-white hover:bg-secondary" : ""}`}
            >
              Stays / Hotels
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-2 hover:bg-slate-100 transition-colors ${activeTab === "activities" ? "bg-secondary text-white hover:bg-secondary" : ""}`}
            >
              Experiences
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Gross GMV Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Gross Sales GMV</span>
              <span className="text-2xl font-extrabold text-primary block mt-2">{formatCurrency(stats.grossGmv)}</span>
            </div>
            <div className="bg-primary/5 p-2 rounded-xl text-primary text-sm">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div className="text-[10px] font-bold text-success mt-4 flex items-center gap-1">
            <i className="fa-solid fa-circle-check"></i>
            <span>{stats.confirmedCount}</span> Verified Bookings Included
          </div>
        </div>

        {/* Platform commission Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Commissions Share (15%)</span>
              <span className="text-2xl font-extrabold text-secondary block mt-2">{formatCurrency(stats.platformCommission)}</span>
            </div>
            <div className="bg-secondary/5 p-2 rounded-xl text-secondary text-sm">
              <i className="fa-solid fa-percent"></i>
            </div>
          </div>
          <div className="text-[10px] font-bold text-text-muted mt-4 flex items-center gap-1">
            <i className="fa-solid fa-shield-heart text-secondary"></i>
            <span>Net Platform Revenue Share</span>
          </div>
        </div>

        {/* AOV Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Average Booking Ticket</span>
              <span className="text-2xl font-extrabold text-success block mt-2">{formatCurrency(stats.aov)}</span>
            </div>
            <div className="bg-success/5 p-2 rounded-xl text-success text-sm">
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div className="text-[10px] font-bold text-success mt-4 flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up"></i> Per guest checkout transaction
          </div>
        </div>

        {/* Cancellation Losses */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Cancellation Rate</span>
              <span className="text-2xl font-extrabold text-danger block mt-2">{stats.cancellationRate}%</span>
            </div>
            <div className="bg-danger/5 p-2 rounded-xl text-danger text-sm">
              <i className="fa-solid fa-ban"></i>
            </div>
          </div>
          <div className="text-[10px] font-bold text-danger mt-4 flex items-center gap-1">
            Loss: {formatCurrency(stats.lostGmv)} ({stats.cancelledCount} claims)
          </div>
        </div>
      </div>

      {/* Visual Analytics Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* GMV Graph representation */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide flex items-center gap-2">
              <i className="fa-solid fa-chart-area text-secondary"></i> Net GMV Billing Curve
            </h3>
            <span className="text-[10px] font-bold bg-bg-light px-2.5 py-1 rounded-full border border-border text-text-muted uppercase">
              Sales Trend Lines
            </span>
          </div>

          <div className="w-full relative mt-4">
            {chartData.values.length > 0 ? (
              <div className="w-full">
                {/* Custom SVG line-bar graph */}
                <svg viewBox="0 0 600 240" className="w-full h-56 overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = 20 + ratio * 180;
                    const val = Math.round(chartData.maxVal * (1 - ratio));
                    return (
                      <g key={idx}>
                        <line x1="60" y1={y} x2="560" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="15" y={y + 4} fill="#64748b" className="text-[9px] font-bold font-mono">
                          {formatCurrency(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG Bars & Coordinates */}
                  {chartData.values.map((val, idx) => {
                    const totalBars = chartData.values.length;
                    const width = 440 / totalBars;
                    const x = 70 + idx * width + (width - 24) / 2;
                    const pct = val / chartData.maxVal;
                    const height = pct * 180;
                    const y = 200 - height;

                    return (
                      <g key={idx} className="group cursor-pointer">
                        {/* Bar Chart element */}
                        <rect
                          x={x}
                          y={y}
                          width="24"
                          height={Math.max(2, height)}
                          rx="4"
                          fill="url(#primaryGradient)"
                          className="hover:fill-secondary transition-colors duration-200"
                        />
                        {/* Interactive Tooltip value */}
                        <text
                          x={x + 12}
                          y={y - 8}
                          textAnchor="middle"
                          fill="#FF5E14"
                          className="text-[9px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity font-mono"
                        >
                          {formatCurrency(val)}
                        </text>
                        {/* Label x-axis */}
                        <text
                          x={x + 12}
                          y="220"
                          textAnchor="middle"
                          fill="#475569"
                          className="text-[9px] font-bold font-sans"
                        >
                          {chartData.labels[idx]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Line border */}
                  <line x1="60" y1="200" x2="560" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5E14" />
                      <stop offset="100%" stopColor="#0A225C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-text-muted">
                No billing metrics in specified time bounds.
              </div>
            )}
          </div>
        </div>

        {/* Segment Ratios */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-6 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-secondary"></i> Segment Revenue Share
            </h3>

            {/* Calculate segments dynamically */}
            {(() => {
              const hotelsAmt = bookings
                .filter((b) => b.status !== "Cancelled" && (b.type || "Hotel").toLowerCase() === "hotel")
                .reduce((sum, b) => sum + (b.pricePaid || 0), 0);
              const actsAmt = bookings
                .filter((b) => b.status !== "Cancelled" && ((b.type || "").toLowerCase() === "activity" || (b.type || "").toLowerCase() === "experience"))
                .reduce((sum, b) => sum + (b.pricePaid || 0), 0);
              const totalAmt = hotelsAmt + actsAmt || 1;

              const hotelsPct = Math.round((hotelsAmt / totalAmt) * 100);
              const actsPct = Math.round((actsAmt / totalAmt) * 100);

              return (
                <div className="space-y-6">
                  {/* Stays Progress bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-primary flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block"></span>
                        Stays &amp; Hotels
                      </span>
                      <span>{hotelsPct}% ({formatCurrency(hotelsAmt)})</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${hotelsPct}%` }}></div>
                    </div>
                  </div>

                  {/* Experiences Progress bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-secondary flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-secondary rounded-full inline-block"></span>
                        Tours &amp; Activities
                      </span>
                      <span>{actsPct}% ({formatCurrency(actsAmt)})</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${actsPct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-bg-light border border-border p-4 rounded-xl text-left mt-6">
            <span className="text-[10px] font-bold text-primary uppercase block">Target Yield Note</span>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              Standard yields stand at 15.00% across all listed vendor categories. Direct partner payouts settle monthly net of commission deductibles.
            </p>
          </div>
        </div>
      </div>

      {/* Booking List Ledger */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-6">
          <i className="fa-solid fa-receipt text-secondary mr-2"></i> Bookings Revenue Breakdown
        </h3>

        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Vended Property / Tour</th>
                <th>Tx Date</th>
                <th>Status</th>
                <th>Gross Paid</th>
                <th style={{ textAlign: "right" }}>Commissions (15%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-text-muted text-xs">
                    No transactions located in selected parameters.
                  </td>
                </tr>
              ) : (
                filteredData.map((b) => {
                  const comm = b.status === "Cancelled" ? 0 : Math.round(b.pricePaid * 0.15);
                  const commText = b.status === "Cancelled" ? "₹0 (Refunded)" : formatCurrency(comm);

                  return (
                    <tr key={b.id} className="admin-table-row text-xs">
                      <td><strong>{b.id}</strong></td>
                      <td className="font-bold text-primary">{b.customerName}</td>
                      <td className="font-semibold text-text-muted max-w-[180px] truncate" title={b.propertyName}>
                        {b.propertyName}
                      </td>
                      <td className="font-mono text-text-muted">
                        {b.createdDate ? b.createdDate.substring(0, 10) : b.checkin}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === "Confirmed"
                              ? "approved"
                              : b.status === "Completed"
                              ? "info"
                              : b.status === "Cancelled"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="font-bold text-primary">{formatCurrency(b.pricePaid)}</td>
                      <td style={{ textAlign: "right" }} className="font-bold text-secondary">
                        {commText}
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
