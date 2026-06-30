"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  createdDate: string;
  bookings?: unknown[];
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "USR001",
    fullName: "Rahul Kumar",
    email: "rahul.k@email.com",
    phone: "+91-9876543210",
    status: "Active",
    createdDate: "2026-01-15T10:00:00Z",
    bookings: [{}, {}],
  },
  {
    id: "USR002",
    fullName: "Priya Sharma",
    email: "priya.s@email.com",
    phone: "+91-9845123456",
    status: "Active",
    createdDate: "2026-02-03T08:30:00Z",
    bookings: [{}],
  },
  {
    id: "USR003",
    fullName: "Amit Verma",
    email: "amit.v@email.com",
    phone: "+91-9712345678",
    status: "Blocked",
    createdDate: "2026-01-28T14:00:00Z",
    bookings: [],
  },
  {
    id: "USR004",
    fullName: "Sneha Patel",
    email: "sneha.p@email.com",
    phone: "+91-9634567890",
    status: "Active",
    createdDate: "2026-03-05T09:15:00Z",
    bookings: [{}, {}, {}],
  },
  {
    id: "USR005",
    fullName: "Ravi Nair",
    email: "ravi.n@email.com",
    phone: "+91-9501234567",
    status: "Suspended",
    createdDate: "2026-02-20T11:45:00Z",
    bookings: [{}],
  },
];

function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadgeClass(status: string): string {
  if (status === "Blocked") return "badge danger";
  if (status === "Suspended") return "badge warning";
  return "badge approved";
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const raw1 = localStorage.getItem("met_platform_customers");
    const raw2 = localStorage.getItem("met_users");
    let loaded: Customer[] = [];

    if (raw1) {
      try { loaded = JSON.parse(raw1); } catch { loaded = []; }
    } else if (raw2) {
      try { loaded = JSON.parse(raw2); } catch { loaded = []; }
    }

    loaded = loaded.map((u) => ({
      ...u,
      status: u.status || "Active",
      createdDate: u.createdDate || "2026-03-10T12:00:00Z",
    }));

    setCustomers(loaded.length > 0 ? loaded : MOCK_CUSTOMERS);
  }, []);

  const filtered = useMemo(() => {
    let list = customers;
    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customers, statusFilter, searchQuery]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">
          Customers Directory
        </h2>
        <p className="text-sm text-text-muted">
          Browse traveler account profiles, monitor reservation totals, and execute block actions.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
              >
                <option value="">All Account Statuses</option>
                <option value="Active">Active Users</option>
                <option value="Blocked">Blocked Users</option>
                <option value="Suspended">Suspended Users</option>
              </select>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
              <i className="fa-solid fa-search text-xs"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traveler name, ID, or email..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table" id="customers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Traveler Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Join Date</th>
                <th style={{ textAlign: "center" }}>Bookings</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-muted font-semibold">
                    <i className="fa-solid fa-users-slash text-2xl mb-2 block text-slate-300"></i>
                    No customers found matching the search parameters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const joinDate = c.createdDate
                    ? formatFriendlyDate(c.createdDate.substring(0, 10))
                    : "N/A";
                  const bookingsCount = c.bookings ? c.bookings.length : 0;
                  const sClass = getStatusBadgeClass(c.status || "Active");
                  return (
                    <tr
                      key={c.id}
                      className="admin-table-row text-xs cursor-pointer"
                      onClick={() => (window.location.href = `/admin/customer/${c.id}`)}
                    >
                      <td><strong>{c.id}</strong></td>
                      <td className="font-bold text-primary">{c.fullName}</td>
                      <td className="text-text-muted font-semibold">{c.email}</td>
                      <td className="font-mono text-text-muted">{c.phone || "N/A"}</td>
                      <td className="text-text-muted">{joinDate}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {bookingsCount}
                        </span>
                      </td>
                      <td><span className={sClass}>{c.status || "Active"}</span></td>
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => (window.location.href = `/admin/customer/${c.id}`)}
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          <i className="fa-solid fa-user-gear"></i> Manage
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
    </AdminLayout>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading customers...</div>
      </div>
    }>
      <CustomersContent />
    </Suspense>
  );
}
