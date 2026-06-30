"use client";

import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";

interface MonthRevenue {
  monthKey: string; // e.g. "2026-06"
  monthName: string; // e.g. "June 2026"
  bookingsCount: number;
  grossVolume: number;
  platformFee: number;
  gstCollected: number;
  tdsWithheld: number;
  netPartnerPayout: number;
  payoutStatus: "Pending" | "Processing" | "Disbursed" | "Tax Filed";
}

export default function RevenueAndTaxesDashboard() {
  const { bookings, addLog } = useData();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [taxQuarter, setTaxQuarter] = useState("Q2 (Apr-Jun)");
  const [payoutStatusMap, setPayoutStatusMap] = useState<Record<string, MonthRevenue["payoutStatus"]>>({
    "2026-04": "Tax Filed",
    "2026-05": "Disbursed",
    "2026-06": "Processing",
    "2026-07": "Pending",
  });

  // Calculate dynamic monthly revenue aggregates
  const monthlyRevenueData = useMemo(() => {
    const aggregates: Record<string, { count: number; totalPaid: number }> = {};

    // Group bookings by checkin month
    bookings.forEach((b) => {
      if (!b.checkin) return;
      const yearMonth = b.checkin.substring(0, 7); // "2026-06"
      if (!yearMonth.startsWith(selectedYear)) return;

      const amt = b.pricePaid || 0;
      // Exclude cancelled bookings that didn't pay anything, but keep cancellations with partial payouts
      const actualVolume = b.status === "Cancelled" ? b.refundAmount || 0 : amt;

      if (!aggregates[yearMonth]) {
        aggregates[yearMonth] = { count: 0, totalPaid: 0 };
      }
      aggregates[yearMonth].count += 1;
      aggregates[yearMonth].totalPaid += actualVolume;
    });

    // Make sure we have entries for April, May, June, July 2026 if they aren't created by data
    const monthKeys = ["2026-04", "2026-05", "2026-06", "2026-07"];
    monthKeys.forEach((k) => {
      if (!k.startsWith(selectedYear)) return;
      if (!aggregates[k]) {
        aggregates[k] = { count: 0, totalPaid: 0 };
      }
    });

    // Format into MonthRevenue items
    const monthNames: Record<string, string> = {
      "2026-01": "January 2026",
      "2026-02": "February 2026",
      "2026-03": "March 2026",
      "2026-04": "April 2026",
      "2026-05": "May 2026",
      "2026-06": "June 2026",
      "2026-07": "July 2026",
      "2026-08": "August 2026",
      "2026-09": "September 2026",
      "2026-10": "October 2026",
      "2026-11": "November 2026",
      "2026-12": "December 2026",
    };

    return Object.entries(aggregates)
      .map(([key, data]) => {
        const gross = data.totalPaid;
        const commRate = 0.15; // 15% Platform Commission
        const gstRate = 0.18; // 18% GST on Commission
        const tdsRate = 0.01; // 1% TDS on Partner Payouts

        const platformFee = gross * commRate;
        const gstCollected = platformFee * gstRate;

        const partnerShare = gross - platformFee;
        const tdsWithheld = partnerShare * tdsRate;
        const netPartnerPayout = partnerShare - tdsWithheld;

        return {
          monthKey: key,
          monthName: monthNames[key] || key,
          bookingsCount: data.count,
          grossVolume: gross,
          platformFee: platformFee,
          gstCollected: gstCollected,
          tdsWithheld: tdsWithheld,
          netPartnerPayout: netPartnerPayout,
          payoutStatus: payoutStatusMap[key] || "Pending",
        };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [bookings, selectedYear, payoutStatusMap]);

  // Aggregate totals for the top KPI Widgets
  const totalFinancials = useMemo(() => {
    let gross = 0;
    let fee = 0;
    let gst = 0;
    let tds = 0;
    let net = 0;

    monthlyRevenueData.forEach((m) => {
      gross += m.grossVolume;
      fee += m.platformFee;
      gst += m.gstCollected;
      tds += m.tdsWithheld;
      net += m.netPartnerPayout;
    });

    return { gross, fee, gst, tds, net };
  }, [monthlyRevenueData]);

  // Run payout disbursal for a specific month
  const triggerPayoutRun = (monthKey: string, monthName: string) => {
    const currentStatus = payoutStatusMap[monthKey] || "Pending";
    if (currentStatus === "Disbursed" || currentStatus === "Tax Filed") {
      alert(`Payouts for ${monthName} have already been released and cannot be rerun.`);
      return;
    }

    const confirmRun = window.confirm(
      `Confirm Payout Batch Run for ${monthName}?\nThis will calculate bank transfers for partners, deduct TDS (1%), and send transactions to the corporate treasury.`
    );
    if (!confirmRun) return;

    setPayoutStatusMap((prev) => ({
      ...prev,
      [monthKey]: "Disbursed",
    }));

    addLog(`FINANCE_REVENUE: Executed monthly payout run for ${monthKey}. Status updated to Disbursed.`);
    alert(`Success! Partner payments for ${monthName} have been processed and disbursed successfully.`);
  };

  // Mock Tax reports download
  const handleDownloadTaxReport = (scheduleType: string) => {
    addLog(`FINANCE_REVENUE: Downloaded tax compliance schedule: ${scheduleType} for ${taxQuarter}`);
    alert(`Compiling and downloading ${scheduleType} report for ${taxQuarter}.\nCSV download started in background.`);
  };

  return (
    <AdminLayout
      title="Revenue &amp; Tax Compliance"
      subtitle="Corporate finance ledger, platform commission metrics, and monthly partner TDS/GST tax schedules."
    >
      {/* Financial KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-xs font-semibold">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-[#0A225C]">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Gross Volume (GBV)</span>
          <div className="text-2xl font-extrabold text-[#0A225C] mt-1">
            Rs. {totalFinancials.gross.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Filtered by Year {selectedYear}</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Platform Fee Commission</span>
          <div className="text-2xl font-extrabold text-success mt-1">
            Rs. {totalFinancials.fee.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">15% net cut on bookings</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">GST Collected (18%)</span>
          <div className="text-2xl font-extrabold text-warning mt-1">
            Rs. {totalFinancials.gst.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">GST on platform service charge</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">TDS Withheld (1.0%)</span>
          <div className="text-2xl font-extrabold text-danger mt-1">
            Rs. {totalFinancials.tds.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-text-muted">Withheld from partner payouts</span>
        </div>
      </div>

      {/* Main dashboard body */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Monthly Financial Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-primary font-heading">Monthly Revenue Breakdown</h3>
              <p className="text-[11px] text-text-muted">Platform fees, tax deductions, and net disbursements.</p>
            </div>
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-border rounded-lg text-xs font-bold px-3 py-1.5 outline-none focus:border-[#0A225C]"
              >
                <option value="2026">Financial Year 2026</option>
                <option value="2025">Financial Year 2025</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="table-responsive">
              <table className="partner-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Gross Volume</th>
                    <th>Comm. (15%)</th>
                    <th>GST (18%)</th>
                    <th>TDS (1%)</th>
                    <th>Net Payout</th>
                    <th>Payout Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueData.map((m) => (
                    <tr key={m.monthKey} className="admin-table-row text-xs">
                      <td>
                        <strong>{m.monthName}</strong>
                      </td>
                      <td className="font-semibold text-text-muted">{m.bookingsCount}</td>
                      <td className="font-bold text-primary">Rs. {m.grossVolume.toLocaleString("en-IN")}</td>
                      <td className="font-semibold text-primary">Rs. {m.platformFee.toLocaleString("en-IN")}</td>
                      <td className="text-text-muted">Rs. {m.gstCollected.toLocaleString("en-IN")}</td>
                      <td className="text-text-muted">Rs. {m.tdsWithheld.toLocaleString("en-IN")}</td>
                      <td className="font-bold text-[#FF5E14]">
                        Rs. {m.netPartnerPayout.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            m.payoutStatus === "Tax Filed"
                              ? "approved"
                              : m.payoutStatus === "Disbursed"
                              ? "info"
                              : m.payoutStatus === "Processing"
                              ? "warning"
                              : "danger"
                          }`}
                        >
                          {m.payoutStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {m.payoutStatus === "Pending" || m.payoutStatus === "Processing" ? (
                          <button
                            onClick={() => triggerPayoutRun(m.monthKey, m.monthName)}
                            className="bg-primary hover:bg-[#081a4a] text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 ml-auto"
                          >
                            <i className="fa-solid fa-play"></i> Run Payouts
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted font-bold block text-right">
                            <i className="fa-solid fa-circle-check text-green-500 mr-1"></i> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Taxes Schedules and Filings */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-primary font-heading mb-4">
              Payout Tax Schedules (FY 2026)
            </h3>

            {/* Quarter Filter */}
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-primary uppercase">Select Filing Quarter</label>
              <select
                value={taxQuarter}
                onChange={(e) => setTaxQuarter(e.target.value)}
                className="border border-border rounded-lg text-xs font-semibold p-2 outline-none focus:border-[#FF5E14] w-full"
              >
                <option value="Q1 (Jan-Mar)">Q1 (Jan-Mar) - Filing Closed</option>
                <option value="Q2 (Apr-Jun)">Q2 (Apr-Jun) - In Progress</option>
                <option value="Q3 (Jul-Sep)">Q3 (Jul-Sep) - Upcoming</option>
                <option value="Q4 (Oct-Dec)">Q4 (Oct-Dec) - Upcoming</option>
              </select>
            </div>

            {/* Compliance Progress Bar */}
            <div className="p-4 bg-slate-50 border border-border rounded-xl mb-4 text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-primary">Compliance Score</span>
                <span className="font-extrabold text-success">92%</span>
              </div>
              <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-success h-full" style={{ width: "92%" }}></div>
              </div>
              <span className="text-[9px] text-text-muted block leading-relaxed">
                TDS payments deposited. Form 26Q returns ready for supervisor signature. GSTR-1 reconciled.
              </span>
            </div>

            {/* Download Schedules Actions */}
            <div className="space-y-3">
              <div className="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-slate-50 transition text-xs">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-file-invoice text-red-500 text-base"></i>
                  <div>
                    <span className="font-bold text-primary block">TDS Challan Form 26Q</span>
                    <span className="text-[9px] text-text-muted">1% TDS deduction for contractors</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadTaxReport("TDS Challan Form 26Q")}
                  className="text-primary hover:text-secondary text-xs"
                >
                  <i className="fa-solid fa-cloud-arrow-down"></i>
                </button>
              </div>

              <div className="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-slate-50 transition text-xs">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-file-signature text-blue-500 text-base"></i>
                  <div>
                    <span className="font-bold text-primary block">GST Commission Ledger</span>
                    <span className="text-[9px] text-text-muted">18% GST collected report</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadTaxReport("GST Commission Ledger")}
                  className="text-primary hover:text-secondary text-xs"
                >
                  <i className="fa-solid fa-cloud-arrow-down"></i>
                </button>
              </div>

              <div className="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-slate-50 transition text-xs">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-hotel text-green-500 text-base"></i>
                  <div>
                    <span className="font-bold text-primary block">Partner Tax Declarations</span>
                    <span className="text-[9px] text-text-muted">PAN card verification files</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadTaxReport("Partner Tax Declarations")}
                  className="text-primary hover:text-secondary text-xs"
                >
                  <i className="fa-solid fa-cloud-arrow-down"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0A225C] text-white p-5 border border-border rounded-2xl shadow-sm text-xs space-y-2">
            <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wide">
              Tax Advisory &amp; Compliance Notes
            </h4>
            <p className="leading-relaxed text-white/80">
              Pursuant to the Finance Act, TDS under Section 194-O is applicable to all e-commerce transactions at
              1%. Admins must ensure that PAN details are verified prior to executing monthly payout runs. Payments
              to partners without a verified PAN must be penalized with a 20% TDS rate deduction.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
