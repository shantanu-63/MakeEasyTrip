"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface ExportHistoryItem {
  id: string;
  timestamp: string;
  entity: string;
  format: string;
  recordsCount: number;
  status: string;
}

// Fallback structures to export if localStorage is empty
const MOCK_BOOKINGS = [
  { id: "MET-2601-1001", customerName: "Rahul Kumar", propertyName: "Sunset Villa Goa", checkin: "2026-07-10", pricePaid: 24000, type: "Hotel", status: "Confirmed" },
  { id: "MET-2601-1002", customerName: "Priya Sharma", propertyName: "Goa Water Sports", checkin: "2026-07-15", pricePaid: 5000, type: "Activity", status: "Confirmed" },
  { id: "MET-2601-1003", customerName: "Amit Verma", propertyName: "Ubud Rainforest Resort", checkin: "2026-06-20", pricePaid: 45000, type: "Hotel", status: "Completed" },
  { id: "MET-2601-1004", customerName: "Sneha Patel", propertyName: "Manali Trek", checkin: "2026-08-01", pricePaid: 9000, type: "Activity", status: "Pending" },
  { id: "MET-2601-1005", customerName: "Vikram Singh", propertyName: "Jaipur Palace Hotel", checkin: "2026-07-05", pricePaid: 18000, type: "Hotel", status: "Cancelled" },
];

const MOCK_PROPERTIES = [
  { id: "PROP001", name: "Sunset Villa Goa", city: "Goa", type: "Villa", basePrice: 15000, rating: 4.8, partnerName: "Goa Beach Resort", status: "Approved" },
  { id: "PROP002", name: "Beachfront Resort", city: "Goa", type: "Resort", basePrice: 22000, rating: 4.5, partnerName: "Goa Beach Resort", status: "Approved" },
  { id: "PROP003", name: "Ubud Jungle Lodge", city: "Bali", type: "Hotel", basePrice: 12000, rating: 4.7, partnerName: "Bali Villas Co", status: "Pending" },
  { id: "PROP004", name: "Tokyo Business Hotel", city: "Tokyo", type: "Hotel", basePrice: 8000, rating: 4.3, partnerName: "Tokyo Stays", status: "Approved" },
];

const MOCK_CUSTOMERS = [
  { id: "USR001", fullName: "Rahul Kumar", email: "rahul.k@email.com", phone: "+91-9876543210", status: "Active", createdDate: "2026-01-15T10:00:00Z" },
  { id: "USR002", fullName: "Priya Sharma", email: "priya.s@email.com", phone: "+91-9845123456", status: "Active", createdDate: "2026-02-03T08:30:00Z" },
  { id: "USR003", fullName: "Amit Verma", email: "amit.v@email.com", phone: "+91-9712345678", status: "Blocked", createdDate: "2026-01-28T14:00:00Z" },
];

const MOCK_PARTNERS = [
  { id: "PTR001", businessName: "Goa Beach Resort", ownerName: "Priya Sharma", email: "priya@goabeach.com", status: "Active", verificationStatus: "Verified", totalListings: 3 },
  { id: "PTR002", businessName: "Bali Villas Co", ownerName: "Arjun Mehta", email: "arjun@balivillas.com", status: "Active", verificationStatus: "Pending", totalListings: 1 },
];

export default function ExportCentrePage() {
  const [entity, setEntity] = useState<"bookings" | "properties" | "customers" | "partners">("bookings");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [limit, setLimit] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [generating, setGenerating] = useState(false);

  // Load counts and export log history
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("met_export_history");
      if (storedHistory) {
        setExportHistory(JSON.parse(storedHistory));
      }
    } catch {}
  }, []);

  // Compute live preview counts of records available in system
  const counts = useMemo(() => {
    let bookingsCount = 0;
    let propertiesCount = 0;
    let customersCount = 0;
    let partnersCount = 0;

    try {
      const b = localStorage.getItem("met_platform_bookings");
      bookingsCount = b ? JSON.parse(b).length : MOCK_BOOKINGS.length;
      
      const p = localStorage.getItem("met_platform_properties") || localStorage.getItem("met_properties");
      propertiesCount = p ? JSON.parse(p).length : MOCK_PROPERTIES.length;

      const c = localStorage.getItem("met_platform_customers") || localStorage.getItem("met_users");
      customersCount = c ? JSON.parse(c).length : MOCK_CUSTOMERS.length;

      const pt = localStorage.getItem("met_platform_partners") || localStorage.getItem("met_partners");
      partnersCount = pt ? JSON.parse(pt).length : MOCK_PARTNERS.length;
    } catch {}

    return { bookingsCount, propertiesCount, customersCount, partnersCount };
  }, []);

  // Execute export and trigger download
  const handleExecuteExport = () => {
    setGenerating(true);

    setTimeout(() => {
      let dataToExport: any[] = [];

      try {
        if (entity === "bookings") {
          const raw = localStorage.getItem("met_platform_bookings");
          dataToExport = raw ? JSON.parse(raw) : MOCK_BOOKINGS;
        } else if (entity === "properties") {
          const raw = localStorage.getItem("met_platform_properties") || localStorage.getItem("met_properties");
          dataToExport = raw ? JSON.parse(raw) : MOCK_PROPERTIES;
        } else if (entity === "customers") {
          const raw = localStorage.getItem("met_platform_customers") || localStorage.getItem("met_users");
          dataToExport = raw ? JSON.parse(raw) : MOCK_CUSTOMERS;
        } else if (entity === "partners") {
          const raw = localStorage.getItem("met_platform_partners") || localStorage.getItem("met_partners");
          dataToExport = raw ? JSON.parse(raw) : MOCK_PARTNERS;
        }
      } catch {
        // Fallback
        if (entity === "bookings") dataToExport = MOCK_BOOKINGS;
        else if (entity === "properties") dataToExport = MOCK_PROPERTIES;
        else if (entity === "customers") dataToExport = MOCK_CUSTOMERS;
        else if (entity === "partners") dataToExport = MOCK_PARTNERS;
      }

      // Filter by Date if applicable (assuming date is checkin or createdDate or created)
      if (startDate || endDate) {
        dataToExport = dataToExport.filter((item) => {
          const itemDateStr = item.createdDate || item.checkin || item.created || new Date().toISOString();
          const itemDate = new Date(itemDateStr).getTime();
          const start = startDate ? new Date(startDate).getTime() : 0;
          const end = endDate ? new Date(endDate).getTime() : Infinity;
          return itemDate >= start && itemDate <= end;
        });
      }

      // Filter by limit
      if (limit !== "all") {
        const limNum = parseInt(limit, 10);
        if (!isNaN(limNum)) {
          dataToExport = dataToExport.slice(0, limNum);
        }
      }

      const timestamp = new Date().toISOString();
      const fileName = `met_${entity}_export_${timestamp.substring(0, 10)}`;

      if (dataToExport.length === 0) {
        alert("No records found in selected range to export.");
        setGenerating(false);
        return;
      }

      // Download payload compilation
      if (format === "csv") {
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(",")];

        for (const row of dataToExport) {
          const values = headers.map((header) => {
            const val = row[header];
            const escaped = ("" + (val ?? "")).replace(/"/g, '""');
            return `"${escaped}"`;
          });
          csvRows.push(values.join(","));
        }

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Export JSON format
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.json`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Update log history list
      const newLog: ExportHistoryItem = {
        id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp,
        entity: entity.toUpperCase(),
        format: format.toUpperCase(),
        recordsCount: dataToExport.length,
        status: "Success",
      };

      const updatedHistory = [newLog, ...exportHistory].slice(0, 10);
      setExportHistory(updatedHistory);
      localStorage.setItem("met_export_history", JSON.stringify(updatedHistory));

      setGenerating(false);
    }, 800);
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AdminLayout
      title="Compliance Export Center"
      subtitle="Extract raw transactional databases, hotel room files, and user directories in standard CSV or JSON sheets."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configuration Panel */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide border-b border-border pb-4">
            <i className="fa-solid fa-gears text-secondary mr-2"></i> Export Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            {/* Entity selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-primary uppercase">Target Database Table</label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value as any)}
                className="border border-border rounded-lg p-2.5 outline-none focus:border-primary"
              >
                <option value="bookings">Transactions &amp; Bookings Ledgers</option>
                <option value="properties">Properties &amp; Stays Listings</option>
                <option value="customers">Customers base Profile Database</option>
                <option value="partners">Registered Business Partners</option>
              </select>
            </div>

            {/* File Format selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-primary uppercase">Target File Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="border border-border rounded-lg p-2.5 outline-none focus:border-primary"
              >
                <option value="csv">Standard CSV spreadsheet (.csv)</option>
                <option value="json">Raw JSON array stream (.json)</option>
              </select>
            </div>

            {/* Limit selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-primary uppercase">Max Record Rows</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="border border-border rounded-lg p-2.5 outline-none focus:border-primary"
              >
                <option value="all">Full Database (All records)</option>
                <option value="50">Limit to first 50 rows</option>
                <option value="200">Limit to first 200 rows</option>
                <option value="500">Limit to first 500 rows</option>
              </select>
            </div>

            {/* Date filter bounds */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-primary uppercase">Creation Date Filter</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start"
                  className="border border-border rounded-lg p-2 outline-none text-xs focus:border-primary"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End"
                  className="border border-border rounded-lg p-2 outline-none text-xs focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              onClick={handleExecuteExport}
              disabled={generating}
              className="bg-primary hover:bg-primary/95 text-white font-extrabold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 text-xs"
            >
              {generating ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Generating Export Package...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-export"></i>
                  Generate &amp; Download File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database row counters panel */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide border-b border-border pb-4 mb-4">
              <i className="fa-solid fa-database text-secondary mr-2"></i> Database Row Counts
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center p-2.5 bg-bg-light border border-border rounded-lg">
                <span className="text-primary font-bold">Bookings &amp; Sales</span>
                <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {counts.bookingsCount} rows
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-bg-light border border-border rounded-lg">
                <span className="text-primary font-bold">Hotel Properties</span>
                <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {counts.propertiesCount} rows
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-bg-light border border-border rounded-lg">
                <span className="text-primary font-bold">Customer Profiles</span>
                <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {counts.customersCount} rows
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-bg-light border border-border rounded-lg">
                <span className="text-primary font-bold">Consortium Partners</span>
                <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {counts.partnersCount} rows
                </span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-4 mt-6">
            <span className="text-[10px] font-bold text-secondary uppercase block">Privacy and Safety Note</span>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              Export activities are logged under the master operations log ledger. Downloaded logs containing guest identity keys must comply with traveler data security norms.
            </p>
          </div>
        </div>
      </div>

      {/* Export log history ledger */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mt-8">
        <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-6">
          <i className="fa-solid fa-list-check text-secondary mr-2"></i> Admin Export Logs History
        </h3>

        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Export ID</th>
                <th>Executed At</th>
                <th>Database Segment</th>
                <th>File Format</th>
                <th>Compiled Rows</th>
                <th style={{ textAlign: "right" }}>Operation Status</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-text-muted text-xs">
                    No export logs executed in this terminal.
                  </td>
                </tr>
              ) : (
                exportHistory.map((item) => (
                  <tr key={item.id} className="admin-table-row text-xs">
                    <td><strong>{item.id}</strong></td>
                    <td className="text-text-muted">{formatFriendlyDate(item.timestamp)}</td>
                    <td>
                      <span className="bg-slate-100 text-primary font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.entity}
                      </span>
                    </td>
                    <td className="font-mono">{item.format}</td>
                    <td className="font-bold text-primary">{item.recordsCount} rows</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge approved">
                        <i className="fa-solid fa-circle-check mr-1"></i> {item.status}
                      </span>
                    </td>
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
