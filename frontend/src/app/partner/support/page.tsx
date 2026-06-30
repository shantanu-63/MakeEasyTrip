"use client";

import React, { useState, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
  message: string;
}

export default function PartnerSupportPage() {
  const router = useRouter();
  const { activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Support Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Billing Issues");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const key = `met_partner_tickets_${partnerId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setTickets(JSON.parse(stored));
    } else {
      const seedTickets: SupportTicket[] = [
        {
          id: "TCK-401",
          subject: "Verification Delay on Fire Permit Document",
          category: "Compliance & Verification",
          priority: "High",
          status: "In Progress",
          createdAt: "2026-06-20",
          message: "My municipal permit is still showing pending from 4 days. Need it approved.",
        },
        {
          id: "TCK-402",
          subject: "Commission rate clarification for July bookings",
          category: "Billing Issues",
          priority: "Low",
          status: "Resolved",
          createdAt: "2026-06-15",
          message: "Is the commission rate flat 12% for villas too?",
        },
      ];
      localStorage.setItem(key, JSON.stringify(seedTickets));
      setTickets(seedTickets);
    }
  }, [partnerId]);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem(`met_partner_tickets_${partnerId}`, JSON.stringify(updated));
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket: SupportTicket = {
      id: "TCK-" + Math.floor(Math.random() * 900 + 100),
      subject,
      category,
      priority,
      status: "Open",
      createdAt: new Date().toISOString().split("T")[0],
      message,
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);

    // Also push to master platform support tickets in local storage so admin can see it!
    const allSupportTickets = JSON.parse(localStorage.getItem("met_support_tickets") || "[]");
    const adminTicket = {
      id: newTicket.id,
      partnerId: partnerId,
      propertyName: activePartner?.businessName || "Indo-Global Travel DMC Ltd",
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: newTicket.status,
      createdAt: newTicket.createdAt,
      messages: [{ sender: "partner", text: message, time: new Date().toISOString() }],
    };
    localStorage.setItem("met_support_tickets", JSON.stringify([adminTicket, ...allSupportTickets]));

    setSubject("");
    setMessage("");
    addLog(`SUPPORT_HUB: Registered support ticket: ${newTicket.id} -> ${subject}`);
    alert(`Success! Ticket ${newTicket.id} registered. Our team will review your query within 4 hours.`);
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
      title="Merchant Support Center"
      subtitle="Log technical grievances, request commission payouts details, or clear database sync issues."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Ticket registration form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Log Support Ticket</h3>
            <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Subject Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank payout discrepancy"
                  className="border border-border p-2 rounded text-xs outline-none focus:border-secondary"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Category</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none bg-white font-semibold"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Billing Issues">Billing Issues</option>
                    <option value="Compliance & Verification">Compliance & Verification</option>
                    <option value="Inventory Sync">Inventory Sync</option>
                    <option value="Technical Error">Technical Error</option>
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Priority</label>
                  <select
                    className="border border-border p-2 rounded text-xs outline-none bg-white font-semibold"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Detailed Query</label>
                <textarea
                  required
                  placeholder="Provide transaction IDs, error logs or clear details to help us debug..."
                  rows={4}
                  className="border border-border p-2 rounded text-xs outline-none focus:border-secondary"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                Submit Support Query
              </button>
            </form>
          </div>

          {/* SLA Badging card */}
          <div className="bg-slate-50 p-5 border border-border rounded-lg">
            <h4 className="text-xs font-bold text-primary mb-2">Service Level SLA</h4>
            <div className="flex flex-col gap-2.5 text-[10px] text-text-muted">
              <div className="flex justify-between font-semibold">
                <span>Critical / High Priority</span>
                <span className="text-red-500 font-bold">1-2 Hours Response</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Medium Priority</span>
                <span className="text-orange-500 font-bold">4-6 Hours Response</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Low Priority</span>
                <span className="text-slate-500">12 Hours Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Ticket list */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Support Ticket Registry</h3>
            <div className="flex flex-col gap-4">
              {tickets.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-6">
                  No support tickets raised yet.
                </p>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-border rounded-lg text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary">{t.id}</span>
                        <h4 className="font-bold text-text-main mt-1 text-sm">{t.subject}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.status === "Open"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : t.status === "In Progress"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-slate-100 text-text-muted border border-border"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex gap-4 text-[10px] text-text-muted mt-1">
                      <span>Category: <strong>{t.category}</strong></span>
                      <span>Priority: <strong className={t.priority === "High" ? "text-red-500" : ""}>{t.priority}</strong></span>
                      <span>Date: <strong>{t.createdAt}</strong></span>
                    </div>

                    <p className="text-text-main mt-2 border-t border-border/40 pt-2">{t.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
