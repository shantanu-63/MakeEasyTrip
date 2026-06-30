"use client";

import React, { useMemo, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { properties, syncProperties, activeAdmin, addLog } = useData();

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_admin_session");
      if (!stored && !activeAdmin) {
        router.push("/admin/login");
      }
    }
  }, [activeAdmin, router]);

  const pendingProps = useMemo(() => {
    return properties.filter((p) => p.status === "Pending");
  }, [properties]);

  const handleApprove = (id: string, title: string) => {
    const updated = properties.map((p) => {
      if (p.id === id) {
        return { ...p, status: "Approved" as const };
      }
      return p;
    });
    syncProperties(updated);
    addLog(`ADMIN_CONTROL: Dedicated approve action for property: '${title}'`);
    alert(`Success! Listing '${title}' is approved.`);
  };

  const handleDisallow = (id: string, title: string) => {
    const updated = properties.map((p) => {
      if (p.id === id) {
        return { ...p, status: "Disabled" as const };
      }
      return p;
    });
    syncProperties(updated);
    addLog(`ADMIN_CONTROL: Dedicated reject action for property: '${title}'`);
    alert(`Listing '${title}' has been disallowed.`);
  };

  return (
    <AdminLayout
      title="Compliance & Vetting Queue"
      subtitle="Verify partnership licenses, tax documentation and audit property specifications before publishing."
    >
      <div className="flex flex-col gap-6">
        {pendingProps.length === 0 ? (
          <div className="text-center py-12 bg-white border border-border rounded-lg text-text-muted text-sm italic shadow-sm">
            Great job! Vetting queue is clean. All property proposals are audited.
          </div>
        ) : (
          pendingProps.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 border border-border rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-6"
            >
              {/* Info Column */}
              <div className="flex-grow">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-border">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-amber-50 text-amber-600 font-bold border border-amber-100 px-2 py-0.5 rounded uppercase">
                      Category: {item.type}
                    </span>
                    <h4 className="text-sm font-extrabold text-primary mt-1.5">{item.title}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Location: {item.location}, {item.city}
                    </p>
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded border border-border flex items-center gap-2 text-xs">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    <div>
                      <span className="font-bold block text-primary">GST INVOICE</span>
                      <span className="text-[9px] text-text-muted">GSTIN Verified</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-border flex items-center gap-2 text-xs">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    <div>
                      <span className="font-bold block text-primary">LICENSE CODE</span>
                      <span className="text-[9px] text-text-muted">Local Gov Registered</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-border flex items-center gap-2 text-xs">
                    <i className="fa-solid fa-shield text-secondary"></i>
                    <div>
                      <span className="font-bold block text-primary">INSURANCE CLAIM</span>
                      <span className="text-[9px] text-text-muted">Standard Coverage</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-text-main mt-4 leading-relaxed bg-slate-50 p-3 rounded border border-border">
                  <strong className="block text-primary text-[10px] uppercase font-bold mb-1">
                    Property Specifications Overview:
                  </strong>
                  {item.description}
                </p>
              </div>

              {/* Actions Column */}
              <div className="flex flex-col gap-2.5 justify-center md:border-l border-slate-100 md:pl-6 flex-shrink-0 w-full md:w-36">
                <button
                  onClick={() => handleApprove(item.id, item.title)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 text-xs font-bold rounded shadow-sm text-center"
                >
                  Approve Listing
                </button>
                <button
                  onClick={() => handleDisallow(item.id, item.title)}
                  className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 py-2 text-xs font-bold rounded text-center"
                >
                  Disallow Listing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
