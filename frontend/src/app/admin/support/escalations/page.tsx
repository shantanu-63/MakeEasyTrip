"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface TicketMessage {
  sender: "Traveler" | "AI Assistant" | "Admin Agent" | "System";
  senderName: string;
  timestamp: string;
  text: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: "Billing & Payment" | "Cancellation Claims" | "Refund Requests" | "General Inquiry";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Escalated" | "Resolved" | "Closed";
  assignedAgent: string;
  createdDate: string;
  traveler: {
    name: string;
    email: string;
    phone: string;
    bookingId?: string;
  };
  messages: TicketMessage[];
}

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "TCK-1092",
    subject: "Double Charged for Hotel Stay at Grand Hyatt Mumbai",
    category: "Billing & Payment",
    priority: "High",
    status: "Escalated",
    assignedAgent: "Nikhil Patil",
    createdDate: "2026-06-22T09:30:00Z",
    traveler: {
      name: "Rahul Kumar",
      email: "rahul.k@email.com",
      phone: "+91-9876543210",
      bookingId: "BK-8820"
    },
    messages: [
      {
        sender: "Traveler",
        senderName: "Rahul Kumar",
        timestamp: "2026-06-22T09:30:00Z",
        text: "Double charge issue on BK-8820."
      }
    ]
  },
  {
    id: "TCK-1044",
    subject: "Cancellation request for Delhi Activity Experience",
    category: "Cancellation Claims",
    priority: "Medium",
    status: "In Progress",
    assignedAgent: "Preeti Rao",
    createdDate: "2026-06-23T10:15:00Z",
    traveler: {
      name: "Priya Sharma",
      email: "priya.s@email.com",
      phone: "+91-9845123456",
      bookingId: "BK-4412"
    },
    messages: []
  },
  {
    id: "TCK-1025",
    subject: "Unable to complete flight web check-in",
    category: "General Inquiry",
    priority: "Low",
    status: "Open",
    assignedAgent: "Unassigned",
    createdDate: "2026-06-23T12:05:00Z",
    traveler: {
      name: "Amit Verma",
      email: "amit.v@email.com",
      phone: "+91-9712345678",
      bookingId: "BK-9011"
    },
    messages: []
  }
];

export default function EscalationsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("EscalatedOrHigh"); // default to showing escalated or high priority

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("met_support_tickets");
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch (e) {
        setTickets(DEFAULT_TICKETS);
      }
    } else {
      localStorage.setItem("met_support_tickets", JSON.stringify(DEFAULT_TICKETS));
      setTickets(DEFAULT_TICKETS);
    }
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const totalEscalated = tickets.filter(t => t.status === "Escalated").length;
    const totalHighPriority = tickets.filter(t => t.priority === "High" && t.status !== "Closed" && t.status !== "Resolved").length;
    const unassignedCritical = tickets.filter(t => (t.priority === "High" || t.status === "Escalated") && t.assignedAgent === "Unassigned").length;
    const totalSlaBreach = tickets.filter(t => (t.priority === "High" && t.status === "Open")).length;

    return {
      totalEscalated,
      totalHighPriority,
      unassignedCritical,
      totalSlaBreach
    };
  }, [tickets]);

  // Inline Actions
  const handleAssignAgent = (ticketId: string, agentName: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedAgent: agentName,
          messages: [
            ...t.messages,
            {
              sender: "System" as const,
              senderName: "System Log",
              timestamp: new Date().toISOString(),
              text: `Ticket reassigned inline to: ${agentName}`
            }
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("met_support_tickets", JSON.stringify(updated));
    alert(`Reassigned ticket ${ticketId} to ${agentName}.`);
  };

  const handleResolveTicket = (ticketId: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "Resolved" as const,
          messages: [
            ...t.messages,
            {
              sender: "System" as const,
              senderName: "System Log",
              timestamp: new Date().toISOString(),
              text: "Ticket marked as RESOLVED inline by administrator."
            }
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("met_support_tickets", JSON.stringify(updated));
    alert(`Ticket ${ticketId} resolved successfully.`);
  };

  const handleEscalateTicket = (ticketId: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "Escalated" as const,
          priority: "High" as const,
          messages: [
            ...t.messages,
            {
              sender: "System" as const,
              senderName: "System Log",
              timestamp: new Date().toISOString(),
              text: "Ticket manually flagged as ESCALATED inline."
            }
          ]
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("met_support_tickets", JSON.stringify(updated));
    alert(`Ticket ${ticketId} status upgraded to Escalated.`);
  };

  // Filters & Search
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.traveler.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = categoryFilter === "" || t.category === categoryFilter;
      
      let matchPriority = true;
      if (priorityFilter === "EscalatedOrHigh") {
        matchPriority = t.status === "Escalated" || t.priority === "High";
      } else if (priorityFilter === "EscalatedOnly") {
        matchPriority = t.status === "Escalated";
      } else if (priorityFilter === "HighOnly") {
        matchPriority = t.priority === "High";
      }

      return matchSearch && matchCategory && matchPriority;
    });
  }, [tickets, searchQuery, categoryFilter, priorityFilter]);

  const getPriorityBadgeClass = (p: SupportTicket["priority"]) => {
    if (p === "High") return "badge danger";
    if (p === "Medium") return "badge warning";
    return "badge approved";
  };

  const getStatusBadgeClass = (s: SupportTicket["status"]) => {
    if (s === "Closed" || s === "Resolved") return "badge approved";
    if (s === "Escalated") return "bg-red-100 text-red-800 border-red-200 font-bold px-2 py-0.5 rounded text-[10px]";
    if (s === "In Progress") return "badge warning";
    return "bg-slate-100 text-primary border border-slate-300 font-bold px-2 py-0.5 rounded text-[10px]";
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) + " " + d.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">Escalated &amp; Critical Support Queue</h2>
        <p className="text-sm text-text-muted">
          Manage system grievances, billing audit reviews, and high-priority SLA ticket exceptions.
        </p>
      </div>

      {/* --- STATS SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-fire-flame-curved"></i>
          </div>
          <div>
            <h4 className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Escalated Tickets</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{metrics.totalEscalated}</div>
          </div>
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active High Priority</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{metrics.totalHighPriority}</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-user-slash"></i>
          </div>
          <div>
            <h4 className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Unassigned Critical</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{metrics.unassignedCritical}</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-user-clock"></i>
          </div>
          <div>
            <h4 className="text-[10px] text-text-muted font-bold uppercase tracking-wider">SLA Response Breach</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{metrics.totalSlaBreach}</div>
          </div>
        </div>
      </div>

      {/* --- SEARCH AND FILTERS BAR --- */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary cursor-pointer"
              >
                <option value="EscalatedOrHigh">Escalated or High Severity</option>
                <option value="EscalatedOnly">Escalated status only</option>
                <option value="HighOnly">High priority only</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Billing & Payment">Billing &amp; Payment</option>
                <option value="Cancellation Claims">Cancellation Claims</option>
                <option value="Refund Requests">Refund Requests</option>
                <option value="General Inquiry">General Inquiry</option>
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
              placeholder="Search ID, Subject, or Customer..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all font-semibold"
            />
          </div>
        </div>
      </div>

      {/* --- ESCALATIONS LIST TABLE --- */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table" id="escalated-tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject Topic</th>
                <th>Traveler Contact</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Date Opened</th>
                <th>Allocated Agent</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Management Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-text-muted font-semibold">
                    <i className="fa-solid fa-shield-halved text-3xl mb-3 block text-slate-200"></i>
                    No escalated or high severity tickets match query filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isClosed = t.status === "Closed" || t.status === "Resolved";
                  return (
                    <tr key={t.id} className="admin-table-row text-xs">
                      <td>
                        <strong>{t.id}</strong>
                        {t.status === "Escalated" && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block ml-1.5 animate-pulse"></span>
                        )}
                      </td>
                      <td className="max-w-[180px] truncate">
                        <a
                          href={`/admin/support/details?id=${t.id}`}
                          className="font-bold text-primary hover:underline hover:text-secondary block"
                        >
                          {t.subject}
                        </a>
                        <span className="text-[10px] text-text-muted font-mono block truncate">
                          Ref Booking: {t.traveler.bookingId || "None"}
                        </span>
                      </td>
                      <td className="font-semibold text-text-main">
                        <div>{t.traveler.name}</div>
                        <div className="text-[10px] text-text-muted font-mono">{t.traveler.phone}</div>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold bg-slate-100 text-primary border border-slate-200 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </td>
                      <td>
                        <span className={getPriorityBadgeClass(t.priority)}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="text-text-muted font-mono">{formatFriendlyDate(t.createdDate)}</td>
                      <td>
                        <select
                          value={t.assignedAgent}
                          onChange={(e) => handleAssignAgent(t.id, e.target.value)}
                          className="border border-border rounded px-1.5 py-0.5 text-[10px] font-bold outline-none focus:border-primary bg-white text-primary"
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Nikhil Patil">Nikhil Patil</option>
                          <option value="Preeti Rao">Preeti Rao</option>
                          <option value="MET TravelBot">MET TravelBot</option>
                        </select>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(t.status)}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }} className="flex justify-end gap-2 py-4">
                        <button
                          onClick={() => window.location.href = `/admin/support/details?id=${t.id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-[#0A225C] font-bold px-2 py-1 rounded text-[10px] transition border border-slate-200"
                        >
                          <i className="fa-solid fa-comments"></i> Chat
                        </button>
                        
                        {!isClosed && (
                          <>
                            {t.status !== "Escalated" && (
                              <button
                                onClick={() => handleEscalateTicket(t.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-[10px] transition border border-red-200"
                                title="Upgrade Status to Escalated"
                              >
                                <i className="fa-solid fa-angles-up"></i> Escalate
                              </button>
                            )}
                            <button
                              onClick={() => handleResolveTicket(t.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-[10px] transition border border-green-200"
                            >
                              <i className="fa-solid fa-check"></i> Resolve
                            </button>
                          </>
                        )}
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
