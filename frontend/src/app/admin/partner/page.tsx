"use client";

import { useState, useEffect, useMemo } from "react";
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

const MOCK_PARTNERS: Partner[] = [
  {
    id: "PTR001",
    businessName: "Goa Beach Resort",
    ownerName: "Priya Sharma",
    email: "priya@goabeach.com",
    status: "Active",
    verificationStatus: "Verified",
    totalListings: 3,
    partnerType: "Resort",
  },
  {
    id: "PTR002",
    businessName: "Bali Villas Co",
    ownerName: "Arjun Mehta",
    email: "arjun@balivillas.com",
    status: "Active",
    verificationStatus: "Pending",
    totalListings: 1,
    partnerType: "Villa",
  },
  {
    id: "PTR003",
    businessName: "Tokyo Stays",
    ownerName: "Yuki Tanaka",
    email: "yuki@tokyostays.com",
    status: "Active",
    verificationStatus: "Verified",
    totalListings: 2,
    partnerType: "Hotel",
  },
  {
    id: "PTR004",
    businessName: "Kerala Houseboat",
    ownerName: "Rajan Nair",
    email: "rajan@keralaboat.com",
    status: "Active",
    verificationStatus: "Under Review",
    totalListings: 0,
    partnerType: "Houseboat",
  },
];

function getStatusBadgeClass(status: string): string {
  if (status === "Suspended") return "badge warning";
  if (status === "Inactive") return "badge danger";
  return "badge approved";
}

function getVerificationBadgeClass(vs: string): string {
  if (vs === "Verified") return "badge approved";
  if (vs === "Pending") return "badge warning";
  if (vs === "Under Review") return "badge info";
  return "badge warning";
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [verifFilter, setVerifFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("met_platform_partners") || localStorage.getItem("met_partners");
    let loaded: Partner[] = [];
    if (raw) {
      try { loaded = JSON.parse(raw); } catch { loaded = []; }
    }
    loaded = loaded.map((p) => ({
      ...p,
      status: p.status || "Active",
    }));
    setPartners(loaded.length > 0 ? loaded : MOCK_PARTNERS);
  }, []);

  const filtered = useMemo(() => {
    let list = partners;
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
          (p.ownerName && p.ownerName.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
      );
    }
    return list;
  }, [partners, verifFilter, searchQuery]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">
          Travel Partners Directory
        </h2>
        <p className="text-sm text-text-muted">
          Manage active stays and tour operators, vet compliance permits, and inspect payouts ledger histories.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-56">
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
          </div>
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
              <i className="fa-solid fa-search text-xs"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business name, ID, or owner..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table" id="partners-table">
            <thead>
              <tr>
                <th>Partner ID</th>
                <th>Business Name</th>
                <th>Owner / Contact</th>
                <th>Email</th>
                <th style={{ textAlign: "center" }}>Properties</th>
                <th>Status</th>
                <th>Verification</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-muted font-semibold">
                    <i className="fa-solid fa-handshake-slash text-2xl mb-2 block text-slate-300"></i>
                    No partners found matching selection.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const sClass = getStatusBadgeClass(p.status || "Active");
                  const vClass = getVerificationBadgeClass(p.verificationStatus || "Pending");
                  const typeFriendly = p.partnerType
                    ? p.partnerType.replace("_", " ").toUpperCase()
                    : "AGENCY";
                  return (
                    <tr
                      key={p.id}
                      className="admin-table-row text-xs cursor-pointer"
                      onClick={() => (window.location.href = `/admin/partner/${p.id}`)}
                    >
                      <td><strong>{p.id}</strong></td>
                      <td className="font-bold text-primary">{p.businessName}</td>
                      <td className="text-text-muted font-semibold">{p.ownerName || "N/A"}</td>
                      <td className="text-text-muted font-semibold">{p.email || "N/A"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.totalListings ?? 0}
                        </span>
                      </td>
                      <td><span className={sClass}>{p.status || "Active"}</span></td>
                      <td><span className={vClass}>{p.verificationStatus || "Pending"}</span></td>
                      <td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => (window.location.href = `/admin/partner/${p.id}?tab=verify`)}
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "11px", color: "var(--color-info)", borderColor: "var(--color-info)" }}
                          >
                            <i className="fa-solid fa-file-shield"></i> Verify
                          </button>
                          <button
                            onClick={() => (window.location.href = `/admin/partner/${p.id}`)}
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "11px" }}
                          >
                            <i className="fa-solid fa-gear"></i> Manage
                          </button>
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
    </AdminLayout>
  );
}
