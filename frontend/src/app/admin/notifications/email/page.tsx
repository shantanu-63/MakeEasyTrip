"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  senderName: string;
  senderEmail: string;
  body: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "ET-001",
    name: "Booking Confirmation",
    subject: "Your booking at {{property_name}} is confirmed! (Ref: {{booking_id}})",
    category: "Transactional",
    senderName: "MakeEasyTrip Bookings",
    senderEmail: "bookings@makeeasytrip.com",
    body: `Hi {{traveler_name}},\n\nThank you for choosing MakeEasyTrip! We are excited to confirm your booking.\n\nBooking Details:\n- Reference ID: {{booking_id}}\n- Property: {{property_name}}\n- Check-in: {{check_in_date}}\n- Total Paid: {{amount_paid}}\n\nIf you need to make any changes or cancel your booking, please visit the Traveler Portal or reach out to our helpdesk.\n\nSafe Travels,\nThe MakeEasyTrip Team`,
    status: "Active",
    lastUpdated: "2026-06-20T10:00:00Z"
  },
  {
    id: "ET-002",
    name: "Partner Onboarding Welcome",
    subject: "Welcome to MakeEasyTrip Partner Network! Let's get you set up.",
    category: "Onboarding",
    senderName: "Partner Relations",
    senderEmail: "partners@makeeasytrip.com",
    body: `Welcome {{partner_name}},\n\nWe are thrilled to welcome you as a property vendor and host partner on MakeEasyTrip!\n\nYour business account has been approved. To start listing your hotels or experiences:\n1. Log into the Partner Portal using your registered credentials.\n2. Complete your payout details.\n3. Upload high-res images of your hotel rooms or itineraries.\n\nOur partner support desk is available 24/7 at support@makeeasytrip.com.\n\nBest Regards,\nHost Relations Team`,
    status: "Active",
    lastUpdated: "2026-06-18T14:30:00Z"
  },
  {
    id: "ET-003",
    name: "OTP Verification Code",
    subject: "{{otp_code}} is your MakeEasyTrip verification code",
    category: "Security",
    senderName: "MakeEasyTrip Security",
    senderEmail: "security@makeeasytrip.com",
    body: `Hello traveler,\n\nYou requested a login or security action on MakeEasyTrip.\n\nYour verification code is:\n{{otp_code}}\n\nThis code is valid for 10 minutes. If you did not request this, please change your password immediately.\n\nMakeEasyTrip Security Division`,
    status: "Active",
    lastUpdated: "2026-06-22T08:00:00Z"
  }
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Form states
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Transactional");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Editor Tabs: 'edit' | 'preview' | 'test'
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "test">("edit");

  // Notification state
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Test send state
  const [testRecipient, setTestRecipient] = useState("");
  const [testTravelerName, setTestTravelerName] = useState("Aarav Mehta");
  const [testPropertyName, setTestPropertyName] = useState("The Grand Taj Palace");
  const [testBookingId, setTestBookingId] = useState("MET-HB-94182");
  const [testAmount, setTestAmount] = useState("₹24,500");
  const [testOtp, setTestOtp] = useState("892015");

  useEffect(() => {
    const stored = localStorage.getItem("met_email_templates");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTemplates(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0].id);
      } catch {
        setTemplates(DEFAULT_EMAIL_TEMPLATES);
        localStorage.setItem("met_email_templates", JSON.stringify(DEFAULT_EMAIL_TEMPLATES));
        setSelectedId(DEFAULT_EMAIL_TEMPLATES[0].id);
      }
    } else {
      setTemplates(DEFAULT_EMAIL_TEMPLATES);
      localStorage.setItem("met_email_templates", JSON.stringify(DEFAULT_EMAIL_TEMPLATES));
      setSelectedId(DEFAULT_EMAIL_TEMPLATES[0].id);
    }
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setSubject(selectedTemplate.subject);
      setCategory(selectedTemplate.category);
      setSenderName(selectedTemplate.senderName);
      setSenderEmail(selectedTemplate.senderEmail);
      setBody(selectedTemplate.body);
      setStatus(selectedTemplate.status);
    }
  }, [selectedTemplate]);

  const handleSave = () => {
    if (!name || !subject || !body || !senderEmail) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    const updated = templates.map((t) => {
      if (t.id === selectedId) {
        return {
          ...t,
          name,
          subject,
          category,
          senderName,
          senderEmail,
          body,
          status,
          lastUpdated: new Date().toISOString()
        };
      }
      return t;
    });

    setTemplates(updated);
    localStorage.setItem("met_email_templates", JSON.stringify(updated));
    showAlert("Email template updated successfully!", "success");
  };

  const handleCreateNew = () => {
    const newId = `ET-${String(Date.now()).slice(-3)}`;
    const newTemp: EmailTemplate = {
      id: newId,
      name: "New Email Template",
      subject: "Important update regarding your account",
      category: "Transactional",
      senderName: "MakeEasyTrip Support",
      senderEmail: "support@makeeasytrip.com",
      body: "Hi {{traveler_name}},\n\n[Write email body here]\n\nBest Regards,\nThe MakeEasyTrip Team",
      status: "Active",
      lastUpdated: new Date().toISOString()
    };

    const updated = [...templates, newTemp];
    setTemplates(updated);
    localStorage.setItem("met_email_templates", JSON.stringify(updated));
    setSelectedId(newId);
    setActiveTab("edit");
    showAlert("Created new template!", "success");
  };

  const handleDelete = () => {
    if (templates.length <= 1) {
      showAlert("You must keep at least one template.", "error");
      return;
    }
    if (confirm("Are you sure you want to delete this template?")) {
      const updated = templates.filter((t) => t.id !== selectedId);
      setTemplates(updated);
      localStorage.setItem("met_email_templates", JSON.stringify(updated));
      setSelectedId(updated[0].id);
      showAlert("Template deleted.", "success");
    }
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const renderPreview = () => {
    let result = body;
    result = result.replace(/\{\{traveler_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{partner_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{property_name\}\}/g, testPropertyName);
    result = result.replace(/\{\{booking_id\}\}/g, testBookingId);
    result = result.replace(/\{\{amount_paid\}\}/g, testAmount);
    result = result.replace(/\{\{otp_code\}\}/g, testOtp);

    let subjectPreview = subject;
    subjectPreview = subjectPreview.replace(/\{\{property_name\}\}/g, testPropertyName);
    subjectPreview = subjectPreview.replace(/\{\{booking_id\}\}/g, testBookingId);
    subjectPreview = subjectPreview.replace(/\{\{otp_code\}\}/g, testOtp);

    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
        <div className="bg-slate-200/60 p-4 border-b border-slate-200 text-xs text-slate-600 font-bold space-y-1">
          <div><span className="text-slate-400 font-medium">From:</span> {senderName} &lt;{senderEmail}&gt;</div>
          <div><span className="text-slate-400 font-medium">Subject:</span> {subjectPreview}</div>
        </div>
        <div className="bg-white p-6 min-h-[300px] text-sm text-[#1E293B] font-sans leading-relaxed whitespace-pre-wrap">
          {result}
        </div>
        <div className="bg-slate-100 p-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold">
          © {new Date().getFullYear()} MakeEasyTrip Private Limited. All rights reserved.
        </div>
      </div>
    );
  };

  const sendTestNotification = () => {
    if (!testRecipient) {
      showAlert("Please enter a test recipient email.", "error");
      return;
    }

    // Add notification log to localStorage
    const logsStr = localStorage.getItem("met_admin_notifications") || "[]";
    let logs = [];
    try { logs = JSON.parse(logsStr); } catch { logs = []; }

    const newLog = {
      id: `NL-${String(Date.now()).slice(-5)}`,
      recipientName: testTravelerName,
      recipientEmail: testRecipient,
      channel: "Email",
      template: name,
      status: "Delivered",
      sentAt: new Date().toISOString()
    };

    localStorage.setItem("met_admin_notifications", JSON.stringify([newLog, ...logs]));
    showAlert(`Test email successfully sent to ${testRecipient}!`, "success");
    setTestRecipient("");
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A225C]" style={{ fontFamily: "Outfit, sans-serif" }}>
              Email Template Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure and manage rich HTML transactional emails and welcome series.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-[#FF5E14] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04D0A] transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus" /> Create Template
          </button>
        </div>

        {/* Custom Alert */}
        {alert && (
          <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-3 transition-all ${
            alert.type === "success" 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <i className={alert.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"} />
            {alert.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Search & Template List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0A225C]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-[#0A225C] outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Transactional">Transactional</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    t.id === selectedId
                      ? "border-[#0A225C] bg-[#0A225C]/5"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-sm text-[#0A225C]">{t.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === "Active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 line-clamp-1">{t.subject}</span>
                  <div className="flex justify-between items-center w-full mt-1 text-[10px] text-slate-400 font-bold">
                    <span>{t.category}</span>
                    <span>{t.id}</span>
                  </div>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-bold">No templates found.</div>
              )}
            </div>
          </div>

          {/* Right Panel: Template Editor & Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {selectedTemplate ? (
              <>
                {/* Header / Tabs */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold text-xs">
                      {selectedTemplate.id}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#0A225C]">{selectedTemplate.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">Last updated: {new Date(selectedTemplate.lastUpdated).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "edit" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "preview" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Live Preview
                    </button>
                    <button
                      onClick={() => setActiveTab("test")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "test" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Test Send
                    </button>
                  </div>
                </div>

                {/* Tab Body */}
                <div className="p-6 flex-1 flex flex-col">
                  {activeTab === "edit" && (
                    <div className="space-y-4 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Template Name *</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold text-[#0A225C]"
                          >
                            <option value="Transactional">Transactional</option>
                            <option value="Onboarding">Onboarding</option>
                            <option value="Security">Security</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Sender Name *</label>
                          <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Sender Email *</label>
                          <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Email Subject Line *</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-semibold"
                          placeholder="e.g. Booking confirmed!"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Email Body Content *</label>
                          <span className="text-[9px] text-[#FF5E14] font-bold">Variables: {"{{traveler_name}}"}, {"{{booking_id}}"}, {"{{property_name}}"}, {"{{otp_code}}"}</span>
                        </div>
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={10}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#0A225C] resize-y flex-1"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <button
                          onClick={handleDelete}
                          className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-trash-can" /> Delete Template
                        </button>

                        <div className="flex items-center gap-3">
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A225C]"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          <button
                            onClick={handleSave}
                            className="bg-[#0A225C] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#16368C] transition-all"
                          >
                            Save Template
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "preview" && (
                    <div className="space-y-4 flex-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl text-[11px]">
                        <div>
                          <label className="font-bold text-slate-500 block mb-0.5">Traveler Name</label>
                          <input type="text" value={testTravelerName} onChange={e => setTestTravelerName(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-500 block mb-0.5">Hotel/Property Name</label>
                          <input type="text" value={testPropertyName} onChange={e => setTestPropertyName(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-500 block mb-0.5">Booking Ref ID</label>
                          <input type="text" value={testBookingId} onChange={e => setTestBookingId(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-500 block mb-0.5">Amount Paid</label>
                          <input type="text" value={testAmount} onChange={e => setTestAmount(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-500 block mb-0.5">OTP Code</label>
                          <input type="text" value={testOtp} onChange={e => setTestOtp(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none font-bold" />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              setTestTravelerName("Aarav Mehta");
                              setTestPropertyName("The Grand Taj Palace");
                              setTestBookingId("MET-HB-94182");
                              setTestAmount("₹24,500");
                              setTestOtp("892015");
                            }}
                            className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded hover:bg-slate-300 w-full"
                          >
                            Reset Variables
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        {renderPreview()}
                      </div>
                    </div>
                  )}

                  {activeTab === "test" && (
                    <div className="max-w-md mx-auto py-10 space-y-6 flex flex-col justify-center">
                      <div className="text-center space-y-1.5">
                        <i className="fa-solid fa-paper-plane text-3xl text-[#FF5E14]" />
                        <h4 className="font-extrabold text-base text-[#0A225C]">Trigger a Live System Test</h4>
                        <p className="text-xs text-slate-400">Send a simulation of this template to any inbox to verify the design, placeholders, and links.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Test Recipient Email *</label>
                          <input
                            type="email"
                            placeholder="e.g. testing@example.com"
                            value={testRecipient}
                            onChange={(e) => setTestRecipient(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-semibold bg-white"
                          />
                        </div>
                        <button
                          onClick={sendTestNotification}
                          className="w-full bg-[#FF5E14] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#E04D0A] transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paper-plane" /> Send Live Test Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-bold">
                <i className="fa-solid fa-envelope text-4xl mb-2 text-[#0A225C]/25" />
                <span>Select an email template from the list or create a new one.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
