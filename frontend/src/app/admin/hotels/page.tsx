"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Property {
  id: string;
  name: string;
  city: string;
  type?: string;
  basePrice?: number;
  pricePerNight?: number;
  rating?: number;
  partnerId?: string;
  partnerName?: string;
  status?: string;
}

const MOCK_HOTELS: Property[] = [
  {
    id: "PROP001",
    name: "Sunset Villa Goa",
    city: "Goa",
    type: "Villa",
    basePrice: 15000,
    rating: 4.8,
    partnerName: "Goa Beach Resort",
    partnerId: "PTR001",
    status: "Approved",
  },
  {
    id: "PROP002",
    name: "Beachfront Resort",
    city: "Goa",
    type: "Resort",
    basePrice: 22000,
    rating: 4.5,
    partnerName: "Goa Beach Resort",
    partnerId: "PTR001",
    status: "Approved",
  },
  {
    id: "PROP003",
    name: "Ubud Jungle Lodge",
    city: "Bali",
    type: "Hotel",
    basePrice: 12000,
    rating: 4.7,
    partnerName: "Bali Villas Co",
    partnerId: "PTR002",
    status: "Pending",
  },
  {
    id: "PROP004",
    name: "Tokyo Business Hotel",
    city: "Tokyo",
    type: "Hotel",
    basePrice: 8000,
    rating: 4.3,
    partnerName: "Tokyo Stays",
    partnerId: "PTR003",
    status: "Approved",
  },
  {
    id: "PROP005",
    name: "Jaipur Palace Inn",
    city: "Jaipur",
    type: "Hotel",
    basePrice: 9500,
    rating: 4.6,
    partnerName: "Rajasthan Heritage",
    partnerId: "PTR005",
    status: "Approved",
  },
];

const ACTIVITY_TYPES = ["activity", "experience", "tour", "adventure"];

function getStatusBadgeClass(status: string): string {
  if (status === "Pending") return "badge warning";
  if (status === "Disabled" || status === "Suspended") return "badge danger";
  return "badge approved";
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Property[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableTargetId, setDisableTargetId] = useState<string | null>(null);
  const [disableMode, setDisableMode] = useState("Temporary");
  const [disableReason, setDisableReason] = useState("");
  const [disableComments, setDisableComments] = useState("");

  const loadData = () => {
    const raw =
      localStorage.getItem("met_platform_properties") ||
      localStorage.getItem("met_properties");
    let loaded: Property[] = [];
    if (raw) {
      try {
        loaded = JSON.parse(raw);
      } catch {
        loaded = [];
      }
    }
    // Filter out activities
    loaded = loaded.filter(
      (p) => !ACTIVITY_TYPES.includes((p.type || "hotel").toLowerCase())
    );
    setHotels(loaded.length > 0 ? loaded : MOCK_HOTELS);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats
  const totalCount = hotels.length;
  const activeCount = hotels.filter(
    (h) => h.status === "Approved" || h.status === "Published"
  ).length;
  const disabledCount = hotels.filter(
    (h) => h.status === "Disabled" || h.status === "Suspended"
  ).length;
  const pendingCount = hotels.filter(
    (h) => !h.status || h.status === "Pending"
  ).length;

  const filtered = useMemo(() => {
    let list = hotels;
    if (typeFilter) {
      list = list.filter(
        (h) => (h.type || "Hotel").toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (statusFilter) {
      list = list.filter((h) => {
        const s = h.status || "Pending";
        if (statusFilter === "Approved") return s === "Approved" || s === "Published";
        if (statusFilter === "Disabled") return s === "Disabled" || s === "Suspended";
        return s === statusFilter;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [hotels, typeFilter, statusFilter, searchQuery]);

  const handleApprove = (id: string) => {
    const raw =
      localStorage.getItem("met_platform_properties") ||
      localStorage.getItem("met_properties");
    if (raw) {
      try {
        const props: Property[] = JSON.parse(raw);
        const idx = props.findIndex((p) => p.id === id);
        if (idx !== -1) {
          props[idx].status = "Approved";
          const key = localStorage.getItem("met_platform_properties")
            ? "met_platform_properties"
            : "met_properties";
          localStorage.setItem(key, JSON.stringify(props));
        }
      } catch {}
    }
    setHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: "Approved" } : h))
    );
  };

  const handleDisable = (id: string) => {
    setDisableTargetId(id);
    setShowDisableModal(true);
  };

  const submitDisable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableTargetId) return;
    const raw =
      localStorage.getItem("met_platform_properties") ||
      localStorage.getItem("met_properties");
    if (raw) {
      try {
        const props: Property[] = JSON.parse(raw);
        const idx = props.findIndex((p) => p.id === disableTargetId);
        if (idx !== -1) {
          props[idx].status = "Disabled";
          const key = localStorage.getItem("met_platform_properties")
            ? "met_platform_properties"
            : "met_properties";
          localStorage.setItem(key, JSON.stringify(props));
        }
      } catch {}
    }
    setHotels((prev) =>
      prev.map((h) =>
        h.id === disableTargetId ? { ...h, status: "Disabled" } : h
      )
    );
    setShowDisableModal(false);
    setDisableTargetId(null);
    setDisableMode("Temporary");
    setDisableReason("");
    setDisableComments("");
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">
          Hotel Stays &amp; Properties Registry
        </h2>
        <p className="text-sm text-text-muted">
          Monitor and manage all live stays, villas, and resorts listing operations across the platform.
        </p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Total Hotels</span>
          <div className="text-2xl font-extrabold text-primary mt-1">{totalCount}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Active / Live</span>
          <div className="text-2xl font-extrabold text-success mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Disabled Stays</span>
          <div className="text-2xl font-extrabold text-danger mt-1">{disabledCount}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Pending Review</span>
          <div className="text-2xl font-extrabold text-warning mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="Hotel">Hotel</option>
              <option value="Villa">Villa</option>
              <option value="Resort">Resort</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Active / Live</option>
              <option value="Disabled">Disabled Stays</option>
              <option value="Pending">Pending Review</option>
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
              placeholder="Search hotel name, city or ID..."
              className="w-full pl-9 pr-4 py-1.5 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table" id="hotels-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Property Name</th>
                <th>City</th>
                <th>Type</th>
                <th>Base Price</th>
                <th>Rating</th>
                <th>Partner</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-text-muted font-semibold">
                    <i className="fa-solid fa-hotel text-2xl mb-2 block text-slate-300"></i>
                    No hotel listings found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => {
                  const status = h.status || "Pending";
                  const sClass = getStatusBadgeClass(status);
                  const isLive = status === "Approved" || status === "Published";
                  const price = h.basePrice || h.pricePerNight || 0;
                  return (
                    <tr
                      key={h.id}
                      className="admin-table-row text-xs cursor-pointer"
                      onClick={() => (window.location.href = `/admin/hotels/${h.id}`)}
                    >
                      <td><strong>{h.id}</strong></td>
                      <td className="font-bold text-primary">{h.name}</td>
                      <td className="font-semibold text-text-muted">{h.city}</td>
                      <td>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                          {h.type || "Hotel"}
                        </span>
                      </td>
                      <td className="font-bold text-primary">
                        ₹{price.toLocaleString("en-IN")}<span className="text-text-muted font-normal">/night</span>
                      </td>
                      <td className="font-bold text-warning">
                        <i className="fa-solid fa-star"></i> {h.rating || "4.5"}
                      </td>
                      <td className="font-semibold text-text-muted">{h.partnerName || "Indo-Global Travel"}</td>
                      <td><span className={sClass}>{status}</span></td>
                      <td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => (window.location.href = `/admin/hotels/${h.id}`)}
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "10px" }}
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                          {isLive ? (
                            <button
                              onClick={() => handleDisable(h.id)}
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "10px", color: "var(--color-danger)", borderColor: "var(--color-border)" }}
                            >
                              <i className="fa-solid fa-ban"></i> Disable
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(h.id)}
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "10px", color: "var(--color-success)", borderColor: "var(--color-border)" }}
                            >
                              <i className="fa-solid fa-check"></i> Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <i className="fa-solid fa-ban text-danger"></i> Disable Hotel Access
            </h3>
            <form onSubmit={submitDisable} className="space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Disabling Mode</label>
                <select
                  value={disableMode}
                  onChange={(e) => setDisableMode(e.target.value)}
                  className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                >
                  <option value="Temporary">Temporary Disable / Suspend</option>
                  <option value="Permanent">Permanent Disable / Ban</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Action Reason</label>
                <select
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  required
                  className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                >
                  <option value="">Select Reason...</option>
                  <option value="Policy Violation">Policy Violation</option>
                  <option value="Fraudulent Activity">Fraudulent Activity</option>
                  <option value="Partner Suspension">Partner Suspension</option>
                  <option value="Customer Complaints">High Customer Complaints</option>
                  <option value="Legal Issues">Legal Issues</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Detailed Comments</label>
                <textarea
                  value={disableComments}
                  onChange={(e) => setDisableComments(e.target.value)}
                  rows={3}
                  required
                  placeholder="Provide complete review log context..."
                  className="border border-border rounded-lg p-2.5 outline-none focus:border-primary"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setShowDisableModal(false); setDisableTargetId(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-danger hover:bg-danger/90 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
                >
                  Confirm Disable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
