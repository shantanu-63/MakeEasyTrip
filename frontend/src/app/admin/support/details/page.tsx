"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
        text: "Hi, I checked my bank statement and noticed I was charged twice for booking Ref BK-8820. One charge was ₹15,000 on June 20, and there's another pending charge of ₹15,000 on June 21. Please refund the second transaction."
      },
      {
        sender: "AI Assistant",
        senderName: "MET TravelBot",
        timestamp: "2026-06-22T09:30:15Z",
        text: "Hello Rahul! Thank you for contacting MakeEasyTrip Support. I see you have a double charge query for booking BK-8820. I have checked our transaction ledger and indeed see two attempts. I will flag this immediately for our financial audit team. It usually takes 5-7 business days for double charge pre-authorizations to release. Would you like me to connect you with an admin?"
      },
      {
        sender: "Traveler",
        senderName: "Rahul Kumar",
        timestamp: "2026-06-22T09:31:02Z",
        text: "Yes please, this is urgent because it has frozen my credit limit. I need a real person to look at this."
      },
      {
        sender: "System",
        senderName: "System Automation",
        timestamp: "2026-06-22T09:31:05Z",
        text: "Ticket status changed to ESCALATED. Assigned priority increased to HIGH. Assigned to Nikhil Patil."
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
    messages: [
      {
        sender: "Traveler",
        senderName: "Priya Sharma",
        timestamp: "2026-06-23T10:15:00Z",
        text: "I would like to cancel my Heritage Food Tour for tomorrow. My flight was delayed and I won't arrive in time."
      },
      {
        sender: "Admin Agent",
        senderName: "Preeti Rao",
        timestamp: "2026-06-23T11:00:00Z",
        text: "Hi Priya, I am sorry to hear about your delayed flight. I am checking the cancellation window with the tour organizer. Since it is less than 24 hours, there may be a 20% cancellation fee, but I am attempting to get a full waiver. I will update you within an hour."
      }
    ]
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
    messages: [
      {
        sender: "Traveler",
        senderName: "Amit Verma",
        timestamp: "2026-06-23T12:05:00Z",
        text: "I am trying to do web check-in for flight BK-9011 on IndiGo, but the airline portal says PNR is not active. Can you assist?"
      }
    ]
  }
];

function TicketDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string>("");

  // Reply state
  const [adminReply, setAdminReply] = useState("");
  const [simulationRole, setSimulationRole] = useState<"Admin Agent" | "Traveler">("Admin Agent");

  // Load tickets
  useEffect(() => {
    const saved = localStorage.getItem("met_support_tickets");
    let loaded: SupportTicket[] = [];
    if (saved) {
      try { loaded = JSON.parse(saved); } catch (e) { loaded = DEFAULT_TICKETS; }
    } else {
      localStorage.setItem("met_support_tickets", JSON.stringify(DEFAULT_TICKETS));
      loaded = DEFAULT_TICKETS;
    }
    setTickets(loaded);

    // Read target ticket from search parameters or fallback to first
    const paramId = searchParams.get("id");
    if (paramId && loaded.some(t => t.id === paramId)) {
      setActiveTicketId(paramId);
    } else if (loaded.length > 0) {
      setActiveTicketId(loaded[0].id);
    }
  }, [searchParams]);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  const handleUpdateField = (field: "status" | "priority" | "assignedAgent", value: string) => {
    if (!activeTicket) return;
    const updated = tickets.map((t) => {
      if (t.id === activeTicketId) {
        const updatedTicket = { ...t, [field]: value };
        // Add log message
        const logMsg: TicketMessage = {
          sender: "System",
          senderName: "System Log",
          timestamp: new Date().toISOString(),
          text: `Ticket ${field} updated to: ${value.toUpperCase()}`
        };
        updatedTicket.messages = [...updatedTicket.messages, logMsg];
        return updatedTicket;
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem("met_support_tickets", JSON.stringify(updated));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !adminReply.trim()) return;

    const senderName = simulationRole === "Admin Agent" ? "Super Admin (You)" : activeTicket.traveler.name;
    const newMsg: TicketMessage = {
      sender: simulationRole,
      senderName,
      timestamp: new Date().toISOString(),
      text: adminReply.trim()
    };

    const updated = tickets.map((t) => {
      if (t.id === activeTicketId) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          // Auto transition Open tickets to In Progress when admin replies
          status: (t.status === "Open" && simulationRole === "Admin Agent") ? "In Progress" : t.status
        } as SupportTicket;
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem("met_support_tickets", JSON.stringify(updated));
    setAdminReply("");
  };

  if (!activeTicket) {
    return (
      <div className="bg-white border border-border rounded-2xl p-12 text-center text-text-muted">
        <i className="fa-solid fa-triangle-exclamation text-3xl text-danger mb-4 block"></i>
        <h3 className="text-lg font-bold text-primary mb-2">Ticket Not Found</h3>
        <p className="text-sm text-text-muted">The specified support ticket ID is not available in the database.</p>
        <button
          onClick={() => router.push("/admin/support")}
          className="mt-4 bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs"
        >
          Return to Help Desk
        </button>
      </div>
    );
  }

  const getPriorityColor = (p: SupportTicket["priority"]) => {
    if (p === "High") return "badge danger";
    if (p === "Medium") return "badge warning";
    return "badge approved";
  };

  const getStatusColor = (s: SupportTicket["status"]) => {
    if (s === "Closed" || s === "Resolved") return "badge approved";
    if (s === "Escalated") return "badge danger";
    if (s === "In Progress") return "badge warning";
    return "bg-slate-100 text-primary border border-slate-300 font-bold px-2 py-0.5 rounded text-[10px]";
  };

  return (
    <div>
      {/* Selector and Actions Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-primary whitespace-nowrap">
            Active Ticket Workspace:
          </label>
          <select
            value={activeTicketId}
            onChange={(e) => {
              setActiveTicketId(e.target.value);
              router.push(`/admin/support/details?id=${e.target.value}`);
            }}
            className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary bg-slate-50 cursor-pointer"
          >
            {tickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.subject.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => router.push("/admin/support")}
          className="border border-slate-200 text-text-main hover:bg-slate-50 px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 w-full md:w-auto justify-center"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Support Desk
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Metadata & Action Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-text-muted font-bold block">TICKET ID</span>
                <span className="text-lg font-black text-primary">{activeTicket.id}</span>
              </div>
              <span className={getStatusColor(activeTicket.status)}>{activeTicket.status}</span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-primary mb-1">Subject</h4>
                <p className="text-xs text-text-main font-semibold leading-relaxed">
                  {activeTicket.subject}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[11px] font-bold text-primary mb-1">Category</h4>
                  <span className="text-[10px] font-bold bg-slate-100 text-primary border border-slate-200 px-2 py-0.5 rounded">
                    {activeTicket.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-primary mb-1">Priority</h4>
                  <span className={getPriorityColor(activeTicket.priority)}>{activeTicket.priority}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-primary mb-2">Traveler Contact</h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5 font-semibold">
                  <div className="text-primary font-bold">{activeTicket.traveler.name}</div>
                  <div className="text-text-muted text-[11px] font-mono">{activeTicket.traveler.email}</div>
                  <div className="text-text-muted text-[11px] font-mono">{activeTicket.traveler.phone}</div>
                  {activeTicket.traveler.bookingId && (
                    <div className="pt-1.5 border-t border-slate-200 mt-1.5 flex justify-between items-center text-[10px]">
                      <span className="text-text-muted">Associated Booking:</span>
                      <strong className="text-secondary font-mono">{activeTicket.traveler.bookingId}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket status updating control */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Operational Assignment</h3>

            <div>
              <label className="block text-[11px] font-bold text-primary mb-1.5">
                Ticket Status Workflow
              </label>
              <select
                value={activeTicket.status}
                onChange={(e) => handleUpdateField("status", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary bg-white text-primary"
              >
                <option value="Open">Open (Unresolved)</option>
                <option value="In Progress">In Progress (Agent Active)</option>
                <option value="Escalated">Escalated (Admin Attention)</option>
                <option value="Resolved">Resolved (Pending Close)</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-primary mb-1.5">
                Assigned Staff Member
              </label>
              <select
                value={activeTicket.assignedAgent}
                onChange={(e) => handleUpdateField("assignedAgent", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary bg-white text-primary"
              >
                <option value="Unassigned">Unassigned (Pool)</option>
                <option value="Nikhil Patil">Nikhil Patil (Super Admin)</option>
                <option value="Preeti Rao">Preeti Rao (Financials Specialist)</option>
                <option value="MET TravelBot">MET TravelBot (AI Assistant)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-primary mb-1.5">
                Severity Priority Level
              </label>
              <select
                value={activeTicket.priority}
                onChange={(e) => handleUpdateField("priority", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary bg-white text-primary"
              >
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Logs Feed & Reply Composer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-border rounded-2xl shadow-sm flex flex-col h-[520px]">
            {/* Feed Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-success rounded-full"></span>
                <h3 className="text-xs font-bold text-primary">Live Communication Thread</h3>
              </div>
              <span className="text-[10px] text-text-muted font-mono">
                Created: {new Date(activeTicket.createdDate).toLocaleDateString("en-IN")}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {activeTicket.messages.map((msg, idx) => {
                const isSystem = msg.sender === "System";
                if (isSystem) {
                  return (
                    <div key={idx} className="flex justify-center my-2">
                      <div className="bg-slate-100 text-text-muted border border-slate-200 text-[10px] font-mono px-3 py-1 rounded-full text-center">
                        <i className="fa-solid fa-circle-info mr-1"></i> {msg.text} ({new Date(msg.timestamp).toLocaleTimeString("en-IN")})
                      </div>
                    </div>
                  );
                }

                const isMe = msg.sender === "Admin Agent";
                const isBot = msg.sender === "AI Assistant";

                let bubbleBg = "bg-white text-text-main border-slate-200";
                let alignment = "justify-start";
                if (isMe) {
                  bubbleBg = "bg-[#0A225C] text-white border-transparent";
                  alignment = "justify-end";
                } else if (isBot) {
                  bubbleBg = "bg-purple-50 text-purple-900 border-purple-200";
                }

                return (
                  <div key={idx} className={`flex ${alignment}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 border shadow-sm ${bubbleBg}`}>
                      <div className="flex justify-between items-center gap-4 mb-1 border-b border-slate-100/10 pb-1 text-[9px] font-bold opacity-80">
                        <span>{msg.senderName} ({msg.sender})</span>
                        <span className="font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer Footer */}
            <div className="p-4 border-t border-border bg-white rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="composer-mode"
                        checked={simulationRole === "Admin Agent"}
                        onChange={() => setSimulationRole("Admin Agent")}
                        className="text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span>Reply as Admin Agent</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-secondary">
                      <input
                        type="radio"
                        name="composer-mode"
                        checked={simulationRole === "Traveler"}
                        onChange={() => setSimulationRole("Traveler")}
                        className="text-secondary focus:ring-secondary w-3.5 h-3.5"
                      />
                      <span>Simulate Traveler Message</span>
                    </label>
                  </div>
                  <span className="text-text-muted font-mono">{adminReply.length} chars</span>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder={
                      simulationRole === "Admin Agent"
                        ? "Type your response to the traveler here..."
                        : "Simulate a reply from the traveler (e.g. asking for updates)..."
                    }
                    className="flex-1 border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary text-text-main font-semibold"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#0A225C] text-white px-5 rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailsPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">Ticket Details Console</h2>
        <p className="text-sm text-text-muted">
          Inspect message threads, log support actions, and allocate troubleshooting agents.
        </p>
      </div>

      <Suspense fallback={
        <div className="bg-white border border-border rounded-2xl p-12 text-center text-text-muted shadow-sm">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-primary mb-3"></i>
          <div>Loading ticket workspace...</div>
        </div>
      }>
        <TicketDetailsContent />
      </Suspense>
    </AdminLayout>
  );
}
