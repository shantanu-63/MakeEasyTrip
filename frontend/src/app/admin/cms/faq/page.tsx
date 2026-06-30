"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "Active" | "Draft";
  displayOrder: number;
  lastUpdated: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "FAQ-101",
    question: "How do I cancel my hotel reservation?",
    answer: "You can cancel your hotel reservation by navigating to your Bookings Dashboard in your traveler account, selecting the booking, and clicking 'Cancel Booking'. Please check the cancellation policy of your specific hotel, as some bookings are non-refundable or may incur cancellation fees depending on the timing of your request.",
    category: "Payments & Refunds",
    status: "Active",
    displayOrder: 1,
    lastUpdated: "2026-06-15"
  },
  {
    id: "FAQ-102",
    question: "What is the baggage allowance for flight bookings?",
    answer: "Baggage allowance varies depending on the airline, route, and cabin class of your flight. You can find detailed baggage information on your e-ticket under the 'Baggage Allowance' section. Alternatively, you can check your booking details under your Traveler Profile page on MakeEasyTrip.",
    category: "Flights",
    status: "Active",
    displayOrder: 2,
    lastUpdated: "2026-06-10"
  },
  {
    id: "FAQ-103",
    question: "Can I make changes to my traveler names after booking?",
    answer: "Name changes are subject to airline and hotel policies. Major name corrections are generally not permitted or may incur penalty fees. Minor spelling corrections (up to 3 characters) can often be updated. Please contact our Support Desk immediately to request a name correction.",
    category: "Bookings",
    status: "Active",
    displayOrder: 3,
    lastUpdated: "2026-06-20"
  },
  {
    id: "FAQ-104",
    question: "How long does a refund take to process?",
    answer: "Once a refund request is approved by MakeEasyTrip, the funds are released to your original payment processor immediately. Depending on your financial institution, it typically takes 5 to 7 business days (and up to 14 days for some credit cards) for the balance to reflect in your account.",
    category: "Payments & Refunds",
    status: "Active",
    displayOrder: 4,
    lastUpdated: "2026-06-22"
  },
  {
    id: "FAQ-105",
    question: "Is there a loyalty program for frequent travelers?",
    answer: "Yes, we are currently testing our MakeEasyTrip Voyager Club loyalty program with select accounts. Members earn Voyager points on every flight and hotel booking, which can be redeemed for future discounts and free room upgrades. We plan to launch it publicly in late 2026.",
    category: "General",
    status: "Draft",
    displayOrder: 5,
    lastUpdated: "2026-06-18"
  }
];

const FAQ_CATEGORIES = ["General", "Bookings", "Flights", "Hotels", "Payments & Refunds", "Support"];

export default function FAQCMSPage() {
  const router = useRouter();
  const { activeAdmin, addLog } = useData();

  // FAQs State
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [expandedFAQId, setExpandedFAQId] = useState<string | null>(null);

  // Form State for Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");

  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState(FAQ_CATEGORIES[0]);
  const [formStatus, setFormStatus] = useState<"Active" | "Draft">("Active");
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);

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
    const stored = localStorage.getItem("met_faqs");
    if (stored) {
      try {
        setFaqs(JSON.parse(stored));
      } catch (e) {
        setFaqs(DEFAULT_FAQS);
      }
    } else {
      localStorage.setItem("met_faqs", JSON.stringify(DEFAULT_FAQS));
      setFaqs(DEFAULT_FAQS);
    }
  }, []);

  const saveFaqs = (updatedFaqs: FAQItem[]) => {
    const sorted = [...updatedFaqs].sort((a, b) => a.displayOrder - b.displayOrder);
    setFaqs(sorted);
    localStorage.setItem("met_faqs", JSON.stringify(sorted));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId("");
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory(FAQ_CATEGORIES[0]);
    setFormStatus("Active");
    setFormDisplayOrder(faqs.length + 1);
    setShowModal(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setIsEditing(true);
    setEditId(faq.id);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setFormStatus(faq.status);
    setFormDisplayOrder(faq.displayOrder);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      alert("Question and Answer cannot be empty.");
      return;
    }

    if (isEditing && editId) {
      const updated = faqs.map((faq) => {
        if (faq.id === editId) {
          return {
            ...faq,
            question: formQuestion,
            answer: formAnswer,
            category: formCategory,
            status: formStatus,
            displayOrder: Number(formDisplayOrder),
            lastUpdated: new Date().toISOString().split("T")[0]
          };
        }
        return faq;
      });
      saveFaqs(updated);
      if (addLog) addLog(`FAQ_CMS: Updated FAQ item ${editId}`);
    } else {
      const newFaq: FAQItem = {
        id: "FAQ-" + Math.floor(Math.random() * 900 + 100),
        question: formQuestion,
        answer: formAnswer,
        category: formCategory,
        status: formStatus,
        displayOrder: Number(formDisplayOrder),
        lastUpdated: new Date().toISOString().split("T")[0]
      };
      const updated = [...faqs, newFaq];
      saveFaqs(updated);
      if (addLog) addLog(`FAQ_CMS: Created new FAQ item ${newFaq.id}`);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, question: string) => {
    if (confirm(`Are you sure you want to delete this FAQ?\n\n"${question.substring(0, 60)}..."`)) {
      const updated = faqs.filter((faq) => faq.id !== id);
      saveFaqs(updated);
      if (addLog) addLog(`FAQ_CMS: Deleted FAQ item ID ${id}`);
    }
  };

  const handleToggleStatus = (id: string, current: "Active" | "Draft") => {
    const nextStatus: "Active" | "Draft" = current === "Active" ? "Draft" : "Active";
    const updated = faqs.map((faq) => {
      if (faq.id === id) {
        return { ...faq, status: nextStatus, lastUpdated: new Date().toISOString().split("T")[0] };
      }
      return faq;
    });
    saveFaqs(updated);
    if (addLog) addLog(`FAQ_CMS: Changed status of FAQ ${id} to ${nextStatus}`);
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    const index = faqs.findIndex((f) => f.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const updated = [...faqs];
    // swap display orders
    const tempOrder = updated[index].displayOrder;
    updated[index].displayOrder = updated[newIndex].displayOrder;
    updated[newIndex].displayOrder = tempOrder;

    saveFaqs(updated);
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || faq.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalFaqs = faqs.length;
  const activeFaqsCount = faqs.filter((f) => f.status === "Active").length;
  const draftFaqsCount = faqs.filter((f) => f.status === "Draft").length;
  const uniqueCategories = Array.from(new Set(faqs.map((f) => f.category))).length;

  return (
    <AdminLayout
      title="FAQ Content Manager"
      subtitle="Edit customer-facing Frequently Asked Questions. Control answers for flights, bookings, and refund queries."
      actionButton={
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm">
          <i className="fa-solid fa-plus text-sm"></i> Add New FAQ
        </button>
      }
    >
      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-sans">Total FAQs</p>
              <h3 className="text-xl font-extrabold text-primary mt-1 font-sans">{totalFaqs}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fa-solid fa-circle-question"></i>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-sans">Registered questions</p>
        </div>

        <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-sans font-semibold">Active</p>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-1 font-sans">{activeFaqsCount}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <i className="fa-solid fa-eye animate-pulse"></i>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 mt-2 font-sans font-bold">• Displayed to travelers</p>
        </div>

        <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-sans">Draft/Hidden</p>
              <h3 className="text-xl font-extrabold text-amber-500 mt-1 font-sans">{draftFaqsCount}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-eye-slash"></i>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-sans">Offline / Draft mode</p>
        </div>

        <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-sans font-semibold">Topic Categories</p>
              <h3 className="text-xl font-extrabold text-indigo-700 mt-1 font-sans">{uniqueCategories}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fa-solid fa-tags"></i>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-sans">Organized help sections</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden font-sans">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              placeholder="Search by keywords, tags, or question..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-xs outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <select
              className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {FAQ_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* FAQs List */}
        <div className="p-4 flex flex-col gap-3 bg-slate-50">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white text-center p-12 text-text-muted border border-border rounded-lg">
              <i className="fa-solid fa-circle-question text-3xl text-slate-200 mb-3"></i>
              <p className="text-xs">No FAQs match your search parameters. Try clearing the filter options.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedFAQId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
                    isExpanded ? "border-primary shadow-sm" : "border-border hover:border-slate-300"
                  }`}
                >
                  {/* Header Row */}
                  <div className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none" onClick={() => setExpandedFAQId(isExpanded ? null : faq.id)}>
                    <div className="flex items-center gap-3 flex-grow">
                      <span className="font-mono text-[9px] bg-slate-100 text-text-muted px-2 py-0.5 rounded border border-border">
                        {faq.id}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {faq.category}
                      </span>
                      <h4 className="font-extrabold text-primary text-xs leading-snug flex-grow">
                        {faq.question}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {/* Reorder Buttons */}
                      <div className="hidden sm:flex items-center gap-1 border border-border rounded p-0.5 bg-slate-50">
                        <button
                          disabled={index === 0}
                          onClick={() => handleReorder(faq.id, "up")}
                          className="text-[10px] text-text-muted hover:text-primary px-1 disabled:opacity-30 disabled:hover:text-text-muted"
                          title="Move Up"
                        >
                          <i className="fa-solid fa-chevron-up"></i>
                        </button>
                        <button
                          disabled={index === filteredFaqs.length - 1}
                          onClick={() => handleReorder(faq.id, "down")}
                          className="text-[10px] text-text-muted hover:text-primary px-1 disabled:opacity-30 disabled:hover:text-text-muted"
                          title="Move Down"
                        >
                          <i className="fa-solid fa-chevron-down"></i>
                        </button>
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(faq.id, faq.status)}
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                          faq.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {faq.status}
                      </button>

                      {/* Edit/Delete */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className="bg-slate-100 text-primary p-1.5 rounded hover:bg-slate-200 text-[11px]"
                          title="Edit FAQ"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id, faq.question)}
                          className="bg-red-50 text-red-600 p-1.5 rounded hover:bg-red-100 text-[11px]"
                          title="Delete FAQ"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      {/* Toggle Collapse */}
                      <div className="text-text-muted pl-2 text-xs">
                        <i className={`fa-solid ${isExpanded ? "fa-angle-up" : "fa-angle-down"}`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Answer */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-border/60 text-xs">
                      <div className="bg-white p-4 border border-border/80 rounded-lg leading-relaxed text-text-main font-medium shadow-inner whitespace-pre-line text-justify">
                        {faq.answer}
                      </div>
                      <div className="mt-2.5 flex justify-between items-center text-[10px] text-text-muted px-1">
                        <span>Display Index: <strong className="text-primary">{faq.displayOrder}</strong></span>
                        <span>Last Updated: {faq.lastUpdated}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL DIALOG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-primary">
                {isEditing ? `Edit FAQ Question (${editId})` : "Register New FAQ"}
              </h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Question text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How can I request a refund?"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Answer details *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide a clear, detailed, and user-friendly explanation of the solution..."
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  className="border border-border p-2.5 rounded text-xs outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Category Category</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none bg-white text-text-main"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {FAQ_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Publication Status</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none bg-white text-text-main font-bold"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Display Sort Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className="border border-border p-2 rounded text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border text-text-main text-xs font-bold rounded hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2 text-xs font-bold rounded shadow-sm">
                  {isEditing ? "Save FAQ Changes" : "Register Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
