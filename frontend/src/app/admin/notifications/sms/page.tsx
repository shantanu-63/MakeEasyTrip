"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface SMSTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  body: string;
  status: "Active" | "Inactive";
  senderId: string;
}

const DEFAULT_SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: "SMS-001",
    name: "Booking Confirmed Short",
    triggerEvent: "booking.confirmed",
    body: "Hi {{traveler_name}}, your booking at {{property_name}} is CONFIRMED. Ref: {{booking_id}}. Details sent to your email. Thanks for using MakeEasyTrip!",
    status: "Active",
    senderId: "METRIP"
  },
  {
    id: "SMS-002",
    name: "Security OTP Verification",
    triggerEvent: "auth.otp",
    body: "{{otp_code}} is your verification code for MakeEasyTrip. Valid for 10 minutes. Do not share this OTP with anyone.",
    status: "Active",
    senderId: "METSEC"
  },
  {
    id: "SMS-003",
    name: "Partner Booking Alert",
    triggerEvent: "partner.new_booking",
    body: "New Booking! Partner {{partner_name}}, you have received a new booking (Ref: {{booking_id}}). Please check the Partner Console to view details.",
    status: "Active",
    senderId: "METPRT"
  }
];

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");

  // Gateway Settings States
  const [gateway, setGateway] = useState("Twilio");
  const [senderIdDefault, setSenderIdDefault] = useState("METRIP");
  const [accountSid, setAccountSid] = useState("AC8490a09f8d7b3a4a9c1e7a3b4f6201e");
  const [authToken, setAuthToken] = useState("••••••••••••••••••••••••••••••••");
  const [gatewayConnected, setGatewayConnected] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [senderId, setSenderId] = useState("");

  // Tabs: 'edit' | 'test'
  const [activeTab, setActiveTab] = useState<"edit" | "test">("edit");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Test states
  const [testPhone, setTestPhone] = useState("");
  const [testTravelerName, setTestTravelerName] = useState("Siddharth");
  const [testPropertyName, setTestPropertyName] = useState("Goa Beach Resort");
  const [testBookingId, setTestBookingId] = useState("MET-40291");
  const [testOtp, setTestOtp] = useState("582103");

  useEffect(() => {
    const stored = localStorage.getItem("met_sms_templates");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTemplates(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0].id);
      } catch {
        setTemplates(DEFAULT_SMS_TEMPLATES);
        localStorage.setItem("met_sms_templates", JSON.stringify(DEFAULT_SMS_TEMPLATES));
        setSelectedId(DEFAULT_SMS_TEMPLATES[0].id);
      }
    } else {
      setTemplates(DEFAULT_SMS_TEMPLATES);
      localStorage.setItem("met_sms_templates", JSON.stringify(DEFAULT_SMS_TEMPLATES));
      setSelectedId(DEFAULT_SMS_TEMPLATES[0].id);
    }
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setTriggerEvent(selectedTemplate.triggerEvent);
      setBody(selectedTemplate.body);
      setStatus(selectedTemplate.status);
      setSenderId(selectedTemplate.senderId);
    }
  }, [selectedTemplate]);

  // Character Counter details
  const getSmsSegments = (text: string) => {
    const totalChars = text.length;
    // Standard GSM-7 character limit is 160 characters for 1 segment.
    // If it exceeds 160, messages are concatenated. Concatenated SMS segment limit is 153 chars.
    if (totalChars <= 160) {
      return { segments: totalChars === 0 ? 0 : 1, limit: 160 };
    } else {
      const segments = Math.ceil(totalChars / 153);
      return { segments, limit: segments * 153 };
    }
  };

  const currentStats = getSmsSegments(body);

  const handleSave = () => {
    if (!name || !body || !senderId || !triggerEvent) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    const updated = templates.map((t) => {
      if (t.id === selectedId) {
        return {
          ...t,
          name,
          triggerEvent,
          body,
          status,
          senderId
        };
      }
      return t;
    });

    setTemplates(updated);
    localStorage.setItem("met_sms_templates", JSON.stringify(updated));
    showAlert("SMS trigger template updated successfully!", "success");
  };

  const handleCreateNew = () => {
    const newId = `SMS-${String(Date.now()).slice(-3)}`;
    const newTemp: SMSTemplate = {
      id: newId,
      name: "New SMS Trigger",
      triggerEvent: "custom.event",
      body: "Hi {{traveler_name}}, this is a notification message.",
      status: "Active",
      senderId: "METRIP"
    };

    const updated = [...templates, newTemp];
    setTemplates(updated);
    localStorage.setItem("met_sms_templates", JSON.stringify(updated));
    setSelectedId(newId);
    setActiveTab("edit");
    showAlert("Created new SMS template!", "success");
  };

  const handleDelete = () => {
    if (templates.length <= 1) {
      showAlert("You must keep at least one SMS template.", "error");
      return;
    }
    if (confirm("Are you sure you want to delete this SMS template?")) {
      const updated = templates.filter((t) => t.id !== selectedId);
      setTemplates(updated);
      localStorage.setItem("met_sms_templates", JSON.stringify(updated));
      setSelectedId(updated[0].id);
      showAlert("SMS template deleted.", "success");
    }
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const getReplacedBody = () => {
    let result = body;
    result = result.replace(/\{\{traveler_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{partner_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{property_name\}\}/g, testPropertyName);
    result = result.replace(/\{\{booking_id\}\}/g, testBookingId);
    result = result.replace(/\{\{otp_code\}\}/g, testOtp);
    return result;
  };

  const handleSendTestSMS = () => {
    if (!testPhone) {
      showAlert("Please enter a test mobile phone number.", "error");
      return;
    }
    if (!gatewayConnected) {
      showAlert("SMS gateway is offline. Reconnect gateway before sending.", "error");
      return;
    }

    // Add log
    const logsStr = localStorage.getItem("met_admin_notifications") || "[]";
    let logs = [];
    try { logs = JSON.parse(logsStr); } catch { logs = []; }

    const newLog = {
      id: `NL-${String(Date.now()).slice(-5)}`,
      recipientName: testPhone,
      recipientEmail: testPhone,
      channel: "SMS",
      template: name,
      status: "Delivered",
      sentAt: new Date().toISOString()
    };

    localStorage.setItem("met_admin_notifications", JSON.stringify([newLog, ...logs]));
    showAlert(`Test SMS sent successfully to ${testPhone} via ${gateway}!`, "success");
    setTestPhone("");
  };

  const handleUpdateGateway = (e: React.FormEvent) => {
    e.preventDefault();
    showAlert("SMS Gateway configuration updated successfully!", "success");
  };

  const filtered = templates.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.triggerEvent.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A225C]" style={{ fontFamily: "Outfit, sans-serif" }}>
              SMS Triggers & Gateway
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure short-messaging system triggers and SMS gateway integrations.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-[#FF5E14] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04D0A] transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus" /> Create Trigger
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
          {/* Left Column: SMS Templates List & Gateway Configuration */}
          <div className="space-y-6">
            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-[#0A225C]">SMS Triggers</h3>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{filtered.length} total</span>
              </div>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search SMS triggers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0A225C]"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      t.id === selectedId
                        ? "border-[#0A225C] bg-[#0A225C]/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs text-[#0A225C]">{t.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                        t.status === "Active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Trigger: {t.triggerEvent}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 font-bold">No triggers found.</div>
                )}
              </div>
            </div>

            {/* Gateway Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-[#0A225C]">Gateway Settings</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1.5 ${
                  gatewayConnected ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gatewayConnected ? "bg-green-500" : "bg-red-500"}`}></span>
                  {gatewayConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <form onSubmit={handleUpdateGateway} className="space-y-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Provider Service</label>
                  <select
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-bold text-[#0A225C]"
                  >
                    <option value="Twilio">Twilio SMS API</option>
                    <option value="Plivo">Plivo Communications</option>
                    <option value="Sinch">Sinch Messaging SDK</option>
                    <option value="Msg91">Msg91 Gateway (India)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Default Sender ID (Header)</label>
                  <input
                    type="text"
                    value={senderIdDefault}
                    onChange={(e) => setSenderIdDefault(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Account SID / API Key</label>
                  <input
                    type="text"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-mono text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Auth Token / Secret</label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGatewayConnected(!gatewayConnected)}
                    className={`font-bold px-3 py-1.5 rounded-lg border text-[10px] ${
                      gatewayConnected 
                        ? "text-red-600 border-red-200 hover:bg-red-50" 
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }`}
                  >
                    {gatewayConnected ? "Disable API" : "Enable API"}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0A225C] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#16368C]"
                  >
                    Save Config
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Template Editor & Preview Simulator */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTemplate ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Header tabs */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-extrabold text-xs">
                      {selectedTemplate.id}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0A225C]">{selectedTemplate.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Sender ID: {senderId}</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "edit" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Template Editor
                    </button>
                    <button
                      onClick={() => setActiveTab("test")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "test" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Test Sandbox
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  {activeTab === "edit" ? (
                    <div className="space-y-4 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Template Title *</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Sender ID (6 Chars) *</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={senderId}
                            onChange={(e) => setSenderId(e.target.value.toUpperCase())}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold text-center tracking-widest"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Trigger Hook Event *</label>
                        <input
                          type="text"
                          value={triggerEvent}
                          onChange={(e) => setTriggerEvent(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-mono text-slate-600"
                          placeholder="e.g. order.confirmation"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">SMS Message Body *</label>
                          <span className="text-[9px] text-slate-400 font-bold">Characters: {body.length} | Segments: {currentStats.segments} (Max {currentStats.limit} chars)</span>
                        </div>
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={6}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#0A225C] resize-none bg-slate-50"
                        />
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-slate-500 font-medium">
                          <strong className="text-[#0A225C]">Dynamic Placeholders:</strong> You can inject variables dynamically by adding double curly braces, e.g., <code>{"{{traveler_name}}"}</code>, <code>{"{{property_name}}"}</code>, <code>{"{{booking_id}}"}</code>, or <code>{"{{otp_code}}"}</code>.
                        </div>
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left inputs */}
                      <div className="space-y-4 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-[#0A225C]">Recipient Phone Number *</label>
                          <input
                            type="text"
                            placeholder="e.g. +91 98765 43210"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                          <div>
                            <label className="font-bold text-slate-400 block mb-0.5 text-[9px]">Traveler Name</label>
                            <input type="text" value={testTravelerName} onChange={e => setTestTravelerName(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none" />
                          </div>
                          <div>
                            <label className="font-bold text-slate-400 block mb-0.5 text-[9px]">Property Name</label>
                            <input type="text" value={testPropertyName} onChange={e => setTestPropertyName(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none" />
                          </div>
                          <div>
                            <label className="font-bold text-slate-400 block mb-0.5 text-[9px]">Booking ID</label>
                            <input type="text" value={testBookingId} onChange={e => setTestBookingId(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none" />
                          </div>
                          <div>
                            <label className="font-bold text-slate-400 block mb-0.5 text-[9px]">OTP Code</label>
                            <input type="text" value={testOtp} onChange={e => setTestOtp(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none" />
                          </div>
                        </div>

                        <button
                          onClick={handleSendTestSMS}
                          className="w-full bg-[#FF5E14] text-white py-2.5 rounded-xl font-bold hover:bg-[#E04D0A] transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paper-plane" /> Send Simulation SMS
                        </button>
                      </div>

                      {/* Right iPhone simulation */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-[240px] h-[440px] border-[8px] border-slate-800 rounded-[36px] bg-black shadow-lg relative overflow-hidden flex flex-col justify-between p-2">
                          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto absolute top-1 left-1/2 -translate-x-1/2 z-10"></div>
                          
                          {/* Messages list */}
                          <div className="bg-[#1C1C1E] flex-1 rounded-[24px] mt-4 p-3 flex flex-col justify-end overflow-hidden">
                            <div className="text-center text-[8px] text-slate-500 font-bold mb-2">Today 12:45 PM</div>
                            <div className="bg-[#2C2C2E] text-white text-[10px] p-2.5 rounded-2xl rounded-bl-none max-w-[85%] self-start border border-slate-700/50 shadow">
                              <div className="font-bold text-[8px] text-slate-400 mb-1">Sender: {senderId}</div>
                              <p className="leading-tight">{getReplacedBody()}</p>
                            </div>
                            <div className="text-left text-[8px] font-bold text-slate-500 mt-1 ml-1">Delivered</div>
                          </div>

                          {/* Message input */}
                          <div className="h-8 bg-[#1C1C1E] border-t border-slate-800/80 p-1 flex items-center justify-between text-[9px] text-slate-400 rounded-b-[24px]">
                            <span>iMessage</span>
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                              <i className="fa-solid fa-arrow-up text-[9px]"></i>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-2">Visual Mobile Simulator</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-bold">
                <i className="fa-solid fa-comment-sms text-4xl mb-2 text-[#0A225C]/25" />
                <span>Select a trigger or template to modify.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
