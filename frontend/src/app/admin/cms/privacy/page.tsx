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

interface HistorySnapshot {
  id: string;
  timestamp: string;
  version: string;
  editedBy: string;
  changeSummary: string;
  sections: PolicySection[];
}

const DEFAULT_PRIVACY_POLICY: PolicyDocument = {
  version: "v3.2.0",
  lastUpdated: "2026-06-18",
  editedBy: "System Operator",
  sections: [
    {
      id: "PRV-1",
      title: "1. Information We Collect",
      content: "We collect personal data you provide directly when booking travel, registering accounts, or subscribing to newsletters. This includes traveler names, email addresses, phone numbers, billing/payment details, and government-issued IDs (where required for flight bookings). We also collect automatic data like IP addresses, browser types, and device identifiers via cookies.",
      displayOrder: 1
    },
    {
      id: "PRV-2",
      title: "2. How We Use Your Information",
      content: "MakeEasyTrip processes traveler data to manage bookings, coordinate ticketing with airline/hotel partners, facilitate secure checkouts, deliver automated notifications, offer customer support, and customize travel advice. We may also use data for promotional campaigns, newsletter dispatches, and platform security diagnostics.",
      displayOrder: 2
    },
    {
      id: "PRV-3",
      title: "3. Data Sharing & Third-Party Disclosures",
      content: "We share traveler data with hotels, airlines, and excursion merchants to fulfill your bookings. We do not sell passenger contact details to third-party advertisers. We employ trusted cloud providers, analytics suites, and payment processors who adhere to strict data safety regulations.",
      displayOrder: 3
    },
    {
      id: "PRV-4",
      title: "4. Cookies & Behavioral Tracking",
      content: "We use essential cookies for cart sessions, authentication tokens, and user preferences. Analytical cookies help us track search trends and refine checkout speeds. You can customize cookie preferences via your browser settings, though disabling cookies may degrade some booking features.",
      displayOrder: 4
    },
    {
      id: "PRV-5",
      title: "5. Your Privacy Rights & Choices (GDPR / CCPA)",
      content: "Under applicable data protection laws, travelers have the right to access, correct, or delete their personal files. You may also withdraw consent for promotional mailing lists at any time. To request complete account erasure, please contact the MakeEasyTrip Privacy Office.",
      displayOrder: 5
    },
    {
      id: "PRV-6",
      title: "6. Data Retention & Security Safeguards",
      content: "We store personal traveler files for as long as needed to fulfill booking contracts, settle taxes, or resolve legal claims. Standard retention is 3 years from the date of last active transaction. We implement TLS encryption, firewalls, and tokenized payments to protect your data.",
      displayOrder: 6
    }
  ]
};

const DEFAULT_HISTORY: HistorySnapshot[] = [
  {
    id: "REV-101",
    timestamp: "2026-04-10 10:15:30",
    version: "v3.0.0",
    editedBy: "System Installer",
    changeSummary: "Initial setup of unified GDPR privacy policies",
    sections: [
      {
        id: "PRV-1",
        title: "1. Information We Collect",
        content: "Initial setup content explaining traveler profile collection.",
        displayOrder: 1
      },
      {
        id: "PRV-2",
        title: "2. How We Use Your Information",
        content: "Standard operational use outlines for booking engines.",
        displayOrder: 2
      }
    ]
  },
  {
    id: "REV-102",
    timestamp: "2026-05-15 14:22:00",
    version: "v3.1.0",
    editedBy: "Admin Operator",
    changeSummary: "Updated Cookie Policy terms and added 3-year data retention timelines",
    sections: DEFAULT_PRIVACY_POLICY.sections
  }
];

export default function PrivacyCMSPage() {
  const router = useRouter();
  const { activeAdmin, addLog } = useData();

  // Policy States
  const [doc, setDoc] = useState<PolicyDocument | null>(null);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "history">("edit");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Unsaved Changes" | "Saving...">("Saved");
  const [changeSummary, setChangeSummary] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [viewHistorySnapshot, setViewHistorySnapshot] = useState<HistorySnapshot | null>(null);

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
    // 1. Current document
    const storedDoc = localStorage.getItem("met_privacy_policy");
    if (storedDoc) {
      try {
        const parsed = JSON.parse(storedDoc);
        setDoc(parsed);
        if (parsed.sections?.length > 0) {
          setSelectedSectionId(parsed.sections[0].id);
        }
      } catch (e) {
        setDoc(DEFAULT_PRIVACY_POLICY);
        setSelectedSectionId(DEFAULT_PRIVACY_POLICY.sections[0].id);
      }
    } else {
      localStorage.setItem("met_privacy_policy", JSON.stringify(DEFAULT_PRIVACY_POLICY));
      setDoc(DEFAULT_PRIVACY_POLICY);
      setSelectedSectionId(DEFAULT_PRIVACY_POLICY.sections[0].id);
    }

    // 2. Document History Log
    const storedHistory = localStorage.getItem("met_privacy_policy_history");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        setHistory(DEFAULT_HISTORY);
      }
    } else {
      localStorage.setItem("met_privacy_policy_history", JSON.stringify(DEFAULT_HISTORY));
      setHistory(DEFAULT_HISTORY);
    }
  }, []);

  if (!doc) {
    return (
      <AdminLayout title="Privacy Policy Editor" subtitle="Loading policy configuration...">
        <div className="text-center p-12 text-text-muted">Loading policy parameters...</div>
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

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeSummary.trim()) {
      alert("Please provide a summary of your policy changes.");
      return;
    }

    setSaveStatus("Saving...");
    setShowPublishModal(false);

    setTimeout(() => {
      const todayDate = new Date().toISOString().split("T")[0];
      const todayTime = new Date().toISOString().replace("T", " ").substring(0, 19);
      const editorName = activeAdmin?.fullName || doc.editedBy || "Super Admin";

      const updatedDoc: PolicyDocument = {
        ...doc,
        lastUpdated: todayDate,
        editedBy: editorName
      };

      // Create new history snapshot
      const newSnapshot: HistorySnapshot = {
        id: "REV-" + Math.floor(Math.random() * 900 + 100),
        timestamp: todayTime,
        version: doc.version,
        editedBy: editorName,
        changeSummary: changeSummary,
        sections: doc.sections
      };

      const updatedHistory = [newSnapshot, ...history];

      // Commit to state and storage
      setDoc(updatedDoc);
      setHistory(updatedHistory);
      localStorage.setItem("met_privacy_policy", JSON.stringify(updatedDoc));
      localStorage.setItem("met_privacy_policy_history", JSON.stringify(updatedHistory));
      setSaveStatus("Saved");
      setChangeSummary("");

      if (addLog) addLog(`POLICY_CMS: Published Privacy Policy version ${doc.version} (revision: ${newSnapshot.id})`);
      alert(`Privacy Policy version ${doc.version} successfully saved and registered in history.`);
    }, 600);
  };

  const handleAddSection = () => {
    setSaveStatus("Unsaved Changes");
    const newId = "PRV-" + Math.floor(Math.random() * 9000 + 1000);
    const newSection: PolicySection = {
      id: newId,
      title: `${doc.sections.length + 1}. New privacy section`,
      content: "Draft your privacy, compliance or data clause details here...",
      displayOrder: doc.sections.length + 1
    };

    setDoc((prev) => {
      if (!prev) return null;
      return { ...prev, sections: [...prev.sections, newSection] };
    });
    setSelectedSectionId(newId);
  };

  const handleDeleteSection = (id: string, title: string) => {
    if (doc.sections.length <= 1) {
      alert("The Privacy Policy must contain at least one legal section.");
      return;
    }
    if (confirm(`Are you sure you want to delete the section: "${title}"?\n\nThis outline removal will reflect on your live policy pages.`)) {
      setSaveStatus("Unsaved Changes");
      const updated = doc.sections
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, displayOrder: idx + 1 }));

      setDoc((prev) => {
        if (!prev) return null;
        return { ...prev, sections: updated };
      });

      if (selectedSectionId === id) {
        setSelectedSectionId(updated[0].id);
      }
    }
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    const index = doc.sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= doc.sections.length) return;

    setSaveStatus("Unsaved Changes");
    const updated = [...doc.sections];
    const temp = updated[index].displayOrder;
    updated[index].displayOrder = updated[newIndex].displayOrder;
    updated[newIndex].displayOrder = temp;

    updated.sort((a, b) => a.displayOrder - b.displayOrder);
    const normalized = updated.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));

    setDoc((prev) => {
      if (!prev) return null;
      return { ...prev, sections: normalized };
    });
  };

  // Restore snapshot
  const handleRestoreVersion = (snapshot: HistorySnapshot) => {
    if (confirm(`Are you sure you want to restore Privacy Policy version ${snapshot.version}?\n\nThis will overwrite your current draft configuration with the snapshot from ${snapshot.timestamp}.`)) {
      setSaveStatus("Unsaved Changes");
      const restoredDoc: PolicyDocument = {
        version: snapshot.version + "-restored",
        lastUpdated: new Date().toISOString().split("T")[0],
        editedBy: activeAdmin?.fullName || "Super Admin",
        sections: snapshot.sections
      };

      setDoc(restoredDoc);
      if (restoredDoc.sections.length > 0) {
        setSelectedSectionId(restoredDoc.sections[0].id);
      }
      setActiveTab("edit");
      if (addLog) addLog(`POLICY_CMS: Restored Privacy Policy draft from snapshot ${snapshot.id}`);
      alert(`Restored snapshot contents into active outline. Please review and click 'Publish Policy' to make it active.`);
    }
  };

  return (
    <AdminLayout
      title="Privacy Policy Configuration"
      subtitle="Modify GDPR/CCPA disclosures, cookies statements, and data retention guidelines."
      actionButton={
        <div className="flex items-center gap-3">
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
                <i className="fa-solid fa-triangle-exclamation"></i> Unsaved Draft
              </span>
            )}
          </span>

          <button
            onClick={() => setShowPublishModal(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm"
          >
            <i className="fa-solid fa-cloud-arrow-up text-sm"></i> Save &amp; Log Version
          </button>
        </div>
      }
    >
      {/* Metadata Configuration */}
      <div className="bg-white p-4 border border-border rounded-lg shadow-sm mb-6 font-sans">
        <h4 className="text-xs font-extrabold text-primary mb-3">Active Policy Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Revision Version</label>
            <input
              type="text"
              value={doc.version}
              onChange={(e) => handleUpdateMetadata("version", e.target.value)}
              className="border border-border p-2 rounded text-xs outline-none focus:border-primary font-mono text-primary font-bold animate-pulse"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Last Published</label>
            <input
              type="text"
              disabled
              value={doc.lastUpdated}
              className="border border-border p-2 rounded text-xs outline-none bg-slate-50 text-text-muted font-mono font-bold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Editor In Charge</label>
            <input
              type="text"
              value={doc.editedBy}
              onChange={(e) => handleUpdateMetadata("editedBy", e.target.value)}
              className="border border-border p-2 rounded text-xs outline-none focus:border-primary font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-bold uppercase">Active Sections</label>
            <div className="border border-border p-2 rounded text-xs bg-slate-50 font-extrabold text-primary font-mono text-center">
              {doc.sections.length} document clauses
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden font-sans">
        {/* Navigation Tabs */}
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
              <i className="fa-solid fa-pen-to-square mr-1"></i> Policy Composer
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x -mb-2 ${
                activeTab === "preview"
                  ? "bg-white border-border text-primary"
                  : "bg-transparent border-transparent text-text-muted hover:text-primary"
              }`}
            >
              <i className="fa-solid fa-book-open mr-1"></i> Live Layout Preview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x -mb-2 ${
                activeTab === "history"
                  ? "bg-white border-border text-primary"
                  : "bg-transparent border-transparent text-text-muted hover:text-primary"
              }`}
            >
              <i className="fa-solid fa-history mr-1"></i> Revision History ({history.length})
            </button>
          </div>
          <div className="text-[10px] text-text-muted font-mono font-bold">
            makeeasytrip.com/privacy
          </div>
        </div>

        {/* Tab 1: Composer */}
        {activeTab === "edit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[450px]">
            {/* Outline list */}
            <div className="border-r border-border bg-slate-50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-extrabold text-primary uppercase">Outline Clauses</h4>
                  <button
                    onClick={handleAddSection}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-indigo-250 transition"
                  >
                    <i className="fa-solid fa-plus text-xs"></i> New Clause
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

              <div className="mt-4 pt-3 border-t border-border/80 text-[10px] text-text-muted font-medium">
                Tip: Click "Save &amp; Log Version" to store document outlines securely into revision database logs.
              </div>
            </div>

            {/* Editing Box */}
            <div className="lg:col-span-2 p-6 flex flex-col gap-4">
              {selectedSection ? (
                <>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded border border-indigo-150 font-mono">
                      ID: {selectedSection.id} | Position Order: {selectedSection.displayOrder}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase">Clause Outline Configuration</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Section / Clause Title *</label>
                    <input
                      type="text"
                      required
                      value={selectedSection.title}
                      onChange={(e) => handleSectionTextChange("title", e.target.value)}
                      className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary font-bold text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-grow">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Clause Content Details *</label>
                    <textarea
                      required
                      rows={14}
                      value={selectedSection.content}
                      onChange={(e) => handleSectionTextChange("content", e.target.value)}
                      className="border border-border p-3 rounded-lg text-xs outline-none focus:border-primary font-sans leading-relaxed flex-grow text-justify"
                      placeholder="Type details concerning cookie processing, GDPR rights, third party integrations..."
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-12 text-text-muted my-auto">
                  Select a section from the Outline list on the left to begin editing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Live Layout Preview */}
        {activeTab === "preview" && (
          <div className="p-8 max-w-3xl mx-auto min-h-[500px]">
            <div className="text-center border-b border-border pb-6 mb-8">
              <h2 className="text-2xl font-extrabold text-primary font-heading">Privacy Policy</h2>
              <p className="text-xs text-text-muted mt-2">
                Last Updated: {doc.lastUpdated} | Active Document Version: {doc.version}
              </p>
              <div className="mt-4 flex justify-center gap-4 text-[11px] text-text-muted font-bold">
                <span>Certified Authority: {doc.editedBy}</span>
                <span>•</span>
                <span>MakeEasyTrip Data Security Council</span>
              </div>
            </div>

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

            <div className="mt-12 p-4 bg-slate-50 border border-border rounded-lg text-center">
              <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
                MakeEasyTrip employs strict protocols to safeguard traveler files. For any queries concerning user access rights, deletion requests or cookie concerns, please reach out to the compliance desk.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Revision History Log */}
        {activeTab === "history" && (
          <div className="p-6">
            <h4 className="text-xs font-extrabold text-primary mb-4 uppercase">Document History Log</h4>
            <div className="flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="text-center p-12 text-text-muted border border-border border-dashed rounded-lg">
                  No historical publication records found. Saving updates creates automated revision timestamps.
                </div>
              ) : (
                history.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-primary bg-white border border-border px-2 py-0.5 rounded">
                          {rev.version}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono font-bold">Revision ID: {rev.id}</span>
                        <span className="text-[10px] text-text-muted font-bold">• {rev.timestamp}</span>
                      </div>
                      <p className="text-xs font-bold text-primary mt-1">
                        Change Summary: <span className="text-text-main font-semibold font-sans">{rev.changeSummary}</span>
                      </p>
                      <div className="flex gap-2 text-[10px] text-text-muted font-semibold mt-1">
                        <span>Editor: {rev.editedBy}</span>
                        <span>•</span>
                        <span>Contains {rev.sections.length} legal clauses</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewHistorySnapshot(rev)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded transition"
                      >
                        <i className="fa-solid fa-eye mr-1"></i> View Snapshot
                      </button>
                      <button
                        onClick={() => handleRestoreVersion(rev)}
                        className="bg-white hover:bg-slate-100 border border-border text-primary text-xs font-bold px-3 py-1.5 rounded transition"
                      >
                        <i className="fa-solid fa-rotate-left mr-1"></i> Restore Draft
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PUBLISH CHANGE SUMMARY MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-3 border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-primary">Log Revision Snapshot</h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => setShowPublishModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Change Summary / Notes *</label>
                <textarea
                  required
                  rows={4}
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="e.g. Updated Article 6 timelines to comply with 2026 GDPR directives..."
                  className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-border text-text-main text-xs font-bold rounded hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2 text-xs font-bold rounded shadow-sm">
                  Publish Policy &amp; Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW HISTORICAL SNAPSHOT DIALOG */}
      {viewHistorySnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-primary flex items-center gap-2">
                  <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-primary">
                    {viewHistorySnapshot.version}
                  </span>
                  Historical Snapshot Detail
                </h3>
                <p className="text-[10px] text-text-muted mt-1 font-mono">
                  Revision ID: {viewHistorySnapshot.id} | Compiled: {viewHistorySnapshot.timestamp}
                </p>
              </div>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => setViewHistorySnapshot(null)}
              >
                &times;
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-border rounded-lg mb-4 text-xs">
              <span className="text-[10px] font-bold text-primary uppercase block">Change Summary Log:</span>
              <p className="font-sans italic text-text-main font-semibold mt-1">
                "{viewHistorySnapshot.changeSummary}"
              </p>
              <div className="flex gap-4 text-[10px] text-text-muted mt-2 font-mono">
                <span>By: {viewHistorySnapshot.editedBy}</span>
                <span>•</span>
                <span>Length: {viewHistorySnapshot.sections.length} clauses</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 border-b border-border pb-4">
              {viewHistorySnapshot.sections.map((sec) => (
                <div key={sec.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <h4 className="text-xs font-bold text-primary font-heading mb-1">{sec.title}</h4>
                  <p className="text-[11px] text-text-main leading-relaxed text-justify whitespace-pre-line font-medium">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 mt-3">
              <button
                onClick={() => {
                  handleRestoreVersion(viewHistorySnapshot);
                  setViewHistorySnapshot(null);
                }}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded transition shadow-sm hover:bg-[#081b49]"
              >
                <i className="fa-solid fa-rotate-left mr-1"></i> Restore This Draft
              </button>
              <button
                onClick={() => setViewHistorySnapshot(null)}
                className="px-4 py-2 border border-border text-text-main text-xs font-bold rounded hover:bg-slate-100 transition"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
