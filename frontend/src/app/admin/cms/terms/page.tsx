"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface PolicySection {
  id: string;
  title: string;
  content: string;
  displayOrder: number;
}

interface PolicyDocument {
  version: string;
  lastUpdated: string;
  editedBy: string;
  sections: PolicySection[];
}

const DEFAULT_TERMS_POLICY: PolicyDocument = {
  version: "v4.2.0",
  lastUpdated: "2026-06-20",
  editedBy: "Super Admin",
  sections: [
    {
      id: "SEC-1",
      title: "1. Introduction & Acceptance of Terms",
      content: "Welcome to MakeEasyTrip. By accessing, browsing, or using our websites, mobile applications, or customer portals, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our booking engines or consulting services. We reserve the right to modify these terms at any time without notice, and your continued usage of the platform constitutes agreement to the updated policies.",
      displayOrder: 1
    },
    {
      id: "SEC-2",
      title: "2. User Registration & Account Security",
      content: "To book flights, lodging stays, or guided experiences on our platform, you must create a verified account. You agree to provide true, accurate, and current information during registration. You are solely responsible for maintaining the confidentiality of your login passwords and account sessions. MakeEasyTrip will not be liable for any unauthorized access or activities under your account credentials.",
      displayOrder: 2
    },
    {
      id: "SEC-3",
      title: "3. Booking Engine, convenience Fees & Partner Listings",
      content: "MakeEasyTrip acts as an intermediary booking engine connecting travelers with flight operators, hotel operators, and local experience partners. When you book a service, you enter into a direct agreement with the third-party partner. We charge convenience fees or transaction fees on certain bookings. Any convenience fee is clearly displayed before the checkout payment screen and is non-refundable.",
      displayOrder: 3
    },
    {
      id: "SEC-4",
      title: "4. Cancellation Claims, Payments & Refunds",
      content: "All cancellation, rescheduling, or refund claims are subject to the respective partner merchant's terms. Special promo fares and seasonal package deals are typically non-refundable. Refund processing requests approved by partners take 5-7 business days to credit back. convenience fees and service taxes are non-refundable in most cancellation scenarios.",
      displayOrder: 4
    },
    {
      id: "SEC-5",
      title: "5. Merchant Partners & Listing Compliance",
      content: "Merchant partners who list hotel rooms, guided excursions, or transfer services must comply with local security, cleanliness, and business licensing laws. Partners are fully responsible for the accuracy of pricing, details, and availability schedules. MakeEasyTrip holds the right to immediately suspend or ban any partner listing found misleading or violating standards.",
      displayOrder: 5
    },
    {
      id: "SEC-6",
      title: "6. Limitation of Liability & Indemnity",
      content: "To the maximum extent permitted by law, MakeEasyTrip shall not be liable for any indirect, incidental, special, or consequential damages resulting from your trip, accommodation quality, flight delays, or partner negligence. Travelers are strongly advised to purchase comprehensive travel insurance policies before departure.",
      displayOrder: 6
    }
  ]
};

export default function TermsCMSPage() {
  const router = useRouter();
  const { activeAdmin, addLog } = useData();

  // Document State
  const [doc, setDoc] = useState<PolicyDocument | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Unsaved Changes" | "Saving...">("Saved");

  // Verify access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_admin_session");
      if (!stored && !activeAdmin) {
        router.push("/admin/login");
      }
    }
  }, [activeAdmin, router]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("met_terms_policy");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDoc(parsed);
        if (parsed.sections?.length > 0) {
          setSelectedSectionId(parsed.sections[0].id);
        }
      } catch (e) {
        setDoc(DEFAULT_TERMS_POLICY);
        setSelectedSectionId(DEFAULT_TERMS_POLICY.sections[0].id);
      }
    } else {
      localStorage.setItem("met_terms_policy", JSON.stringify(DEFAULT_TERMS_POLICY));
      setDoc(DEFAULT_TERMS_POLICY);
      setSelectedSectionId(DEFAULT_TERMS_POLICY.sections[0].id);
    }
  }, []);

  if (!doc) {
    return (
      <AdminLayout title="Terms of Service Policy Editor" subtitle="Loading editor details...">
        <div className="text-center p-12 text-text-muted">Loading policy configuration...</div>
      </AdminLayout>
    );
  }

  const selectedSection = doc.sections.find((s) => s.id === selectedSectionId) || doc.sections[0];

  const handleUpdateMetadata = (field: "version" | "editedBy", value: string) => {
    setSaveStatus("Unsaved Changes");
    setDoc((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
        lastUpdated: new Date().toISOString().split("T")[0]
      };
    });
  };

  const handleSectionTextChange = (field: "title" | "content", value: string) => {
    if (!selectedSectionId) return;
    setSaveStatus("Unsaved Changes");
    setDoc((prev) => {
      if (!prev) return null;
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id === selectedSectionId) {
          return { ...sec, [field]: value };
        }
        return sec;
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handlePublish = () => {
    setSaveStatus("Saving...");
    setTimeout(() => {
      const updatedDoc = {
        ...doc,
        lastUpdated: new Date().toISOString().split("T")[0],
        editedBy: activeAdmin?.fullName || doc.editedBy || "Super Admin"
      };
      setDoc(updatedDoc);
      localStorage.setItem("met_terms_policy", JSON.stringify(updatedDoc));
      setSaveStatus("Saved");
      if (addLog) addLog(`POLICY_CMS: Published Terms of Service Policy version ${doc.version}`);
      alert(`Terms of Service policy successfully saved and published! (Version: ${doc.version})`);
    }, 600);
  };

  const handleAddSection = () => {
    setSaveStatus("Unsaved Changes");
    const newId = "SEC-" + Math.floor(Math.random() * 9000 + 1000);
    const newSection: PolicySection = {
      id: newId,
      title: `${doc.sections.length + 1}. New Policy Section Title`,
      content: "Type the body of the policy section details here...",
      displayOrder: doc.sections.length + 1
    };

    const updatedSections = [...doc.sections, newSection];
    setDoc((prev) => {
      if (!prev) return null;
      return { ...prev, sections: updatedSections };
    });
    setSelectedSectionId(newId);
  };

  const handleDeleteSection = (id: string, title: string) => {
    if (doc.sections.length <= 1) {
      alert("A policy document must contain at least one section.");
      return;
    }
    if (confirm(`Are you sure you want to delete the section: "${title}"?\n\nThis will remove it from the document outline.`)) {
      setSaveStatus("Unsaved Changes");
      const updatedSections = doc.sections
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, displayOrder: idx + 1 }));

      setDoc((prev) => {
        if (!prev) return null;
        return { ...prev, sections: updatedSections };
      });

      // Select another section
      if (selectedSectionId === id) {
        setSelectedSectionId(updatedSections[0].id);
      }
    }
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    const index = doc.sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= doc.sections.length) return;

    setSaveStatus("Unsaved Changes");
    const updatedSections = [...doc.sections];
    // swap
    const tempOrder = updatedSections[index].displayOrder;
    updatedSections[index].displayOrder = updatedSections[newIndex].displayOrder;
    updatedSections[newIndex].displayOrder = tempOrder;

    // re-sort based on order
    updatedSections.sort((a, b) => a.displayOrder - b.displayOrder);

    // reset orders to 1..N indices
    const normalized = updatedSections.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));

    setDoc((prev) => {
      if (!prev) return null;
      return { ...prev, sections: normalized };
    });
  };

  return (
    <AdminLayout
      title="Terms of Service Policy Editor"
      subtitle="Edit legal policies, bookings convenience fee terms, and traveler contracts."
      actionButton={
        <div className="flex items-center gap-3">
          {/* Save status badge */}
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border ${
              saveStatus === "Saved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : saveStatus === "Saving..."
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {saveStatus === "Saved" ? (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-cloud-arrow-up"></i> Published &amp; Synced
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-triangle-exclamation"></i> Unsaved Changes
              </span>
            )}
          </span>

          <button onClick={handlePublish} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm">
            <i className="fa-solid fa-circle-check text-sm"></i> Publish Policy Document
          </button>
        </div>
      }
    >
      {/* Policy Metadata header */}
      <div className="bg-white p-4 border border-border rounded-lg shadow-sm mb-6 font-sans">
        <h4 className="text-xs font-extrabold text-primary mb-3">Policy Registry Metadata</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Document Version</label>
            <input
              type="text"
              value={doc.version}
              onChange={(e) => handleUpdateMetadata("version", e.target.value)}
              className="border border-border p-2 rounded text-xs outline-none focus:border-primary font-mono text-primary font-bold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Last Updated Date</label>
            <input
              type="text"
              disabled
              value={doc.lastUpdated}
              className="border border-border p-2 rounded text-xs outline-none bg-slate-50 text-text-muted font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Editor / Publisher</label>
            <input
              type="text"
              value={doc.editedBy}
              onChange={(e) => handleUpdateMetadata("editedBy", e.target.value)}
              className="border border-border p-2 rounded text-xs outline-none focus:border-primary font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Sections Count</label>
            <div className="border border-border p-2 rounded text-xs bg-slate-50 font-bold text-primary font-mono">
              {doc.sections.length} document sections
            </div>
          </div>
        </div>
      </div>

      {/* Editor Layout Split tabs */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden font-sans">
        <div className="flex justify-between items-center border-b border-border bg-slate-50 px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x -mb-2 ${
                activeTab === "edit"
                  ? "bg-white border-border text-primary"
                  : "bg-transparent border-transparent text-text-muted hover:text-primary"
              }`}
            >
              <i className="fa-solid fa-pen-to-square mr-1"></i> Section Outline Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x -mb-2 ${
                activeTab === "preview"
                  ? "bg-white border-border text-primary"
                  : "bg-transparent border-transparent text-text-muted hover:text-primary"
              }`}
            >
              <i className="fa-solid fa-book-open mr-1"></i> Traveler Live Preview
            </button>
          </div>
          <div className="text-[10px] text-text-muted">
            MakeEasyTrip legal control desk
          </div>
        </div>

        {/* Tab Content: Edit Outline */}
        {activeTab === "edit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[450px]">
            {/* Outline Sidebar */}
            <div className="border-r border-border bg-slate-50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-extrabold text-primary uppercase">Table of Contents</h4>
                  <button
                    onClick={handleAddSection}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-indigo-200"
                  >
                    <i className="fa-solid fa-plus"></i> Add Section
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto">
                  {doc.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition select-none flex items-center justify-between gap-2 ${
                        sec.id === selectedSectionId
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-border text-primary hover:border-slate-400"
                      }`}
                    >
                      <span className="text-xs font-extrabold line-clamp-1 flex-grow">
                        {sec.title}
                      </span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Up / Down sort */}
                        <button
                          disabled={idx === 0}
                          onClick={() => handleReorder(sec.id, "up")}
                          className={`text-[9px] px-1 disabled:opacity-20 ${sec.id === selectedSectionId ? "text-white/60 hover:text-white" : "text-text-muted hover:text-primary"}`}
                        >
                          <i className="fa-solid fa-chevron-up"></i>
                        </button>
                        <button
                          disabled={idx === doc.sections.length - 1}
                          onClick={() => handleReorder(sec.id, "down")}
                          className={`text-[9px] px-1 disabled:opacity-20 ${sec.id === selectedSectionId ? "text-white/60 hover:text-white" : "text-text-muted hover:text-primary"}`}
                        >
                          <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id, sec.title)}
                          className={`text-[10px] p-1 rounded ${
                            sec.id === selectedSectionId ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-red-50 text-red-500"
                          }`}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/80 text-[10px] text-text-muted font-semibold leading-relaxed">
                * Note: Reordering or deleting sections updates the draft index instantly. Remember to click "Publish Policy" to push changes live.
              </div>
            </div>

            {/* Current Section Editor */}
            <div className="lg:col-span-2 p-6 flex flex-col gap-4">
              {selectedSection ? (
                <>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded border border-indigo-150 font-mono">
                      ID: {selectedSection.id} | Position: {selectedSection.displayOrder}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase">Section Configurator</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Section Title / Header *</label>
                    <input
                      type="text"
                      required
                      value={selectedSection.title}
                      onChange={(e) => handleSectionTextChange("title", e.target.value)}
                      className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary font-bold text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-grow">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Section Content Body *</label>
                    <textarea
                      required
                      rows={14}
                      value={selectedSection.content}
                      onChange={(e) => handleSectionTextChange("content", e.target.value)}
                      className="border border-border p-3 rounded-lg text-xs outline-none focus:border-primary font-sans leading-relaxed flex-grow text-justify"
                      placeholder="Write policy terms, compliance mandates, conditions..."
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-12 text-text-muted my-auto">
                  Select a section from the Outline Sidebar to begin editing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Traveler Live Preview */}
        {activeTab === "preview" && (
          <div className="p-8 max-w-3xl mx-auto min-h-[500px]">
            {/* Header info mock */}
            <div className="text-center border-b border-border pb-6 mb-8">
              <h2 className="text-2xl font-extrabold text-primary font-heading">Terms of Service</h2>
              <p className="text-xs text-text-muted mt-2">
                Last Updated: {doc.lastUpdated} | Document Version: {doc.version}
              </p>
              <div className="mt-4 flex justify-center gap-4 text-[11px] text-text-muted font-semibold">
                <span>Verified Publisher: {doc.editedBy}</span>
                <span>•</span>
                <span>MakeEasyTrip Legal Compliance</span>
              </div>
            </div>

            {/* Document Flow */}
            <div className="space-y-6">
              {doc.sections.map((sec) => (
                <div key={sec.id} className="border-b border-border/40 pb-5 last:border-0 last:pb-0">
                  <h3 className="text-sm font-extrabold text-primary font-heading mb-2">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-text-main leading-relaxed text-justify whitespace-pre-line font-medium">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Accept / Footer mock */}
            <div className="mt-12 p-4 bg-slate-50 border border-border rounded-lg text-center">
              <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
                This document governs all interactions with the MakeEasyTrip platform. For specific questions regarding convenience fees or cancellation requests, please contact our Support desk or open a ticket.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
