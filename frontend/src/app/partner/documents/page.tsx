"use client";

import React, { useState, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface DocItem {
  id: string;
  name: string;
  type: string;
  fileName: string;
  status: "Approved" | "Pending" | "Action Required";
  submittedAt: string;
}

export default function PartnerDocumentsPage() {
  const router = useRouter();
  const { activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  const [documents, setDocuments] = useState<DocItem[]>([
    {
      id: "DOC-991",
      name: "GSTIN Registration Certificate",
      type: "Tax ID Document",
      fileName: "GSTIN_sunset_villa_2026.pdf",
      status: "Approved",
      submittedAt: "2026-06-01",
    },
    {
      id: "DOC-992",
      name: "Permanent Account Number (PAN)",
      type: "Identity Document",
      fileName: "PAN_partnership_payout.pdf",
      status: "Approved",
      submittedAt: "2026-06-01",
    },
    {
      id: "DOC-993",
      name: "Municipal Tourism Business License",
      type: "Operations License",
      fileName: "municipal_hotel_permit.pdf",
      status: "Pending",
      submittedAt: "2026-06-20",
    },
  ]);

  const [newDocName, setNewDocName] = useState("Property Ownership Deed");
  const [newDocFile, setNewDocFile] = useState("");

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile.trim()) {
      alert("Please enter a file name / upload string.");
      return;
    }

    const newDoc: DocItem = {
      id: "DOC-" + Math.floor(Math.random() * 900 + 100),
      name: newDocName,
      type: "Ownership Verification",
      fileName: newDocFile,
      status: "Pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };

    setDocuments((prev) => [...prev, newDoc]);
    setNewDocFile("");
    addLog(`COMPLIANCE_HUB: Uploaded verification document: ${newDocName} -> ${newDocFile}`);
    alert(`Success! Document '${newDocName}' uploaded and added to the compliance verification queue.`);
  };

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_partner_session");
      if (!stored && !activePartner) {
        router.push("/partner/auth");
      }
    }
  }, [activePartner, router]);

  return (
    <PartnerLayout
      title="Compliance & Verifications Documents"
      subtitle="Manage corporate taxation files, GSTIN records, municipal certificates, and check KYC status."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Upload form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Upload Document</h3>
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Document Title / Type</label>
                <select
                  className="border border-border p-2 rounded text-xs outline-none bg-white font-semibold"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                >
                  <option value="Property Ownership Deed">Property Ownership Deed</option>
                  <option value="Municipal Fire Safety Certificate">Municipal Fire Safety Certificate</option>
                  <option value="Utility Electric Bill Ledger">Utility Electric Bill Ledger</option>
                  <option value="Liability Insurance Cover Note">Liability Insurance Cover Note</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">File Name (PDF / Image)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. fire_clearance_certificate.pdf"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={newDocFile}
                  onChange={(e) => setNewDocFile(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                Submit File for Verification
              </button>
            </form>
          </div>

          {/* KYC Status Guide */}
          <div className="bg-slate-50 p-5 border border-border rounded-lg">
            <h4 className="text-xs font-bold text-primary mb-2">Compliance Guidelines</h4>
            <ul className="list-disc list-inside text-[10px] text-text-muted flex flex-col gap-2">
              <li>KYC verification is mandatory before receiving bank payouts.</li>
              <li>GSTIN certification must correspond to the partner business registry name.</li>
              <li>Ensure municipal hospitality permits are active and not expired.</li>
            </ul>
          </div>
        </div>

        {/* Right column: Document list */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Compliance Document Registry</h3>
            <div className="overflow-x-auto">
              <table className="partner-table w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2">Document Name</th>
                    <th className="pb-2">File Name</th>
                    <th className="pb-2">Submitted Date</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <div className="font-semibold text-text-main">{doc.name}</div>
                        <div className="text-[9px] text-text-muted mt-0.5">{doc.type}</div>
                      </td>
                      <td className="py-3 font-mono text-primary text-[10px]">{doc.fileName}</td>
                      <td className="py-3 text-text-muted">{doc.submittedAt}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            doc.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : doc.status === "Pending"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-red-50 text-red-500 border border-red-100"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
