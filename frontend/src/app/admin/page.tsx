"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";

interface AuditLog {
  id: string;
  timestamp: string;
  actorType: string;
  actorId: string;
  actionType: string;
  description: string;
  ipAddress: string;
}

interface KPIs {
  customers: { total: number; active: number };
  partners: { total: number; pending: number };
  properties: { total: number };
  activities: { total: number };
  financials: { grossRevenue: number; todayRevenue: number };
}

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function formatFriendlyDate(ts: string): string {
  try {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function AdminDashboardContent() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIs>({
    customers: { total: 0, active: 0 },
    partners: { total: 0, pending: 0 },
    properties: { total: 0 },
    activities: { total: 0 },
    financials: { grossRevenue: 0, todayRevenue: 0 },
  });
  const [hotelsPct, setHotelsPct] = useState(50);
  const [actsPct, setActsPct] = useState(50);
  const [topDestinations, setTopDestinations] = useState<{ dest: string; gmv: number; pct: number }[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Session guard
    const stored = localStorage.getItem("met_admin_session");
    if (!stored) {
      router.push("/admin/login");
      return;
    }

    // Load data from localStorage
    const customers = JSON.parse(localStorage.getItem("met_platform_customers") || "[]");
    const partners = JSON.parse(localStorage.getItem("met_platform_partners") || "[]");
    const properties = JSON.parse(localStorage.getItem("met_platform_properties") || "[]");
    const bookings = JSON.parse(localStorage.getItem("met_platform_bookings") || "[]");
    const logs: AuditLog[] = JSON.parse(localStorage.getItem("met_system_audit_logs") || "[]");

    const activeCustomers = customers.filter((c: any) => c.status === "Active").length;
    const pendingPartners = partners.filter((p: any) => p.status === "Pending" || p.verificationStatus === "Pending").length;
    const hotelProps = properties.filter((p: any) => p.type !== "activity");
    const activityProps = properties.filter((p: any) => p.type === "activity");

    const today = new Date().toISOString().split("T")[0];
    let grossRevenue = 0;
    let todayRevenue = 0;
    const confirmedBookings = bookings.filter((b: any) => b.status !== "Cancelled");
    confirmedBookings.forEach((b: any) => {
      const amount = b.pricePaid || b.totalAmount || 0;
      grossRevenue += amount;
      if ((b.createdAt || b.date || "").startsWith(today)) {
        todayRevenue += amount;
      }
    });

    setKpis({
      customers: { total: customers.length, active: activeCustomers },
      partners: { total: partners.length, pending: pendingPartners },
      properties: { total: hotelProps.length },
      activities: { total: activityProps.length },
      financials: { grossRevenue, todayRevenue },
    });

    // Booking volume ratio
    const hotels = confirmedBookings.filter((b: any) => b.type === "hotel").length;
    const acts = confirmedBookings.filter((b: any) => b.type === "activity").length;
    const total = hotels + acts;
    if (total > 0) {
      setHotelsPct(Math.round((hotels / total) * 100));
      setActsPct(Math.round((acts / total) * 100));
    }

    // Top destinations
    const destCounts: Record<string, number> = {};
    confirmedBookings.forEach((b: any) => {
      const city = b.city || "Goa";
      destCounts[city] = (destCounts[city] || 0) + (b.pricePaid || 0);
    });
    const sorted = Object.entries(destCounts).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
    setTopDestinations(
      sorted.slice(0, 3).map(([dest, gmv]) => ({
        dest,
        gmv,
        pct: Math.round((gmv / maxVal) * 100),
      }))
    );

    // Audit logs
    setAuditLogs(logs.slice(0, 5));
  }, [router]);

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary font-heading">Super Control Center</h2>
          <p className="text-sm text-text-muted">
            High-level GMV tracking, business vetting queues, and compliance status audits.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Customer KPI */}
        <div className="admin-card">
          <div className="admin-card-accent bg-primary"></div>
          <div className="admin-card-title">Total Customers</div>
          <div className="admin-card-value">{kpis.customers.total}</div>
          <div className="admin-card-sub text-success">
            <i className="fa-solid fa-circle-check"></i>
            <span>{kpis.customers.active}</span> Active travelers
          </div>
        </div>

        {/* Partner KPI */}
        <div className="admin-card">
          <div className="admin-card-accent bg-secondary"></div>
          <div className="admin-card-title">Travel Partners</div>
          <div className="admin-card-value">{kpis.partners.total}</div>
          <div className="admin-card-sub text-warning">
            <i className="fa-solid fa-clock"></i>
            <span>{kpis.partners.pending}</span> Pending verification
          </div>
        </div>

        {/* Products KPI */}
        <div className="admin-card">
          <div className="admin-card-accent bg-success"></div>
          <div className="admin-card-title">Platform Products</div>
          <div className="admin-card-value">
            {kpis.properties.total + kpis.activities.total}{" "}
            <span className="text-base font-bold">items</span>
          </div>
          <div className="admin-card-sub text-success">
            <i className="fa-solid fa-earth-asia"></i> Stays &amp; Experiences
          </div>
        </div>

        {/* Revenue KPI */}
        <div className="admin-card">
          <div className="admin-card-accent bg-info"></div>
          <div className="admin-card-title">Net Sales GMV</div>
          <div className="admin-card-value">{formatCurrency(kpis.financials.grossRevenue)}</div>
          <div className="admin-card-sub text-info">
            Today: {formatCurrency(kpis.financials.todayRevenue)}
          </div>
        </div>
      </div>

      {/* Visual Charts & Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Booking volume shares */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-primary mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-secondary"></i> Category Booking Volume Ratio
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Hotel Stays &amp; Villas</span>
                <span>{hotelsPct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${hotelsPct}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Experiences &amp; Tours</span>
                <span>{actsPct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: `${actsPct}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-6 leading-relaxed">
            Percentage calculations represent proportion of bookings registered on database catalog.
          </p>
        </div>

        {/* Popular markets */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-primary mb-4 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-secondary"></i> Top Performing Destinations
          </h3>
          <div className="space-y-3">
            {topDestinations.length === 0 ? (
              <div className="text-xs text-text-muted text-center py-6">
                No transactions registered yet.
              </div>
            ) : (
              topDestinations.map(({ dest, gmv, pct }) => (
                <div key={dest}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{dest} Market</span>
                    <span>{formatCurrency(gmv)}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-success h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Audit Logs Ledger */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <h3 className="text-base font-extrabold text-primary">
            <i className="fa-solid fa-shield-halved text-secondary mr-2"></i> System Audit Trail
          </h3>
          <span className="text-[10px] font-bold text-text-muted bg-bg-light border border-border px-2.5 py-1 rounded-full uppercase">
            Realtime Activity Logging
          </span>
        </div>

        <div className="table-responsive">
          <table className="partner-table" id="audit-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Actor Type</th>
                <th>Actor ID</th>
                <th>Action Type</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-text-muted py-6">
                    No audit logs logged in database.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="admin-table-row text-xs">
                    <td><strong>{log.id}</strong></td>
                    <td className="text-text-muted">{formatFriendlyDate(log.timestamp)}</td>
                    <td><span className="font-bold text-primary uppercase">{log.actorType}</span></td>
                    <td className="font-mono">{log.actorId}</td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actionType === "LOGIN" || log.actionType === "DB_INIT"
                            ? "bg-green-50 text-success"
                            : log.actionType.includes("ALERT") || log.actionType.includes("FAIL")
                            ? "bg-red-50 text-danger"
                            : "bg-blue-50 text-info"
                        }`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td
                      className="font-semibold text-primary max-w-xs truncate"
                      title={log.description}
                    >
                      {log.description}
                    </td>
                    <td className="font-mono text-text-muted">{log.ipAddress}</td>
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading dashboard...</div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
