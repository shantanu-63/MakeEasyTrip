"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface EmailTemplate { id: string; name: string; subject: string; body: string; }
interface SMSTemplate { id: string; name: string; body: string; }
interface PushTemplate { id: string; name: string; title: string; body: string; }

export default function BroadcastComposerPage() {
  // Target Audience States
  const [targetAudience, setTargetAudience] = useState<"travelers" | "partners" | "both" | "segment">("travelers");
  const [customSegment, setCustomSegment] = useState("active_bookings");
  
  // Channels
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendPush, setSendPush] = useState(true);

  // Content States
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Scheduling
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  // Available Templates (imported from localStorage)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([]);
  const [pushTemplates, setPushTemplates] = useState<PushTemplate[]>([]);

  // Simulation sending progress states
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Load email templates
    const eStored = localStorage.getItem("met_email_templates");
    if (eStored) {
      try { setEmailTemplates(JSON.parse(eStored)); } catch {}
    }
    // Load SMS templates
    const sStored = localStorage.getItem("met_sms_templates");
    if (sStored) {
      try { setSmsTemplates(JSON.parse(sStored)); } catch {}
    }
    // Load Push templates
    const pStored = localStorage.getItem("met_push_templates");
    if (pStored) {
      try { setPushTemplates(JSON.parse(pStored)); } catch {}
    }
  }, []);

  // Audience Size Estimation
  const estimatedSize = (() => {
    let base = 0;
    if (targetAudience === "travelers") base = 12480;
    else if (targetAudience === "partners") base = 850;
    else if (targetAudience === "both") base = 13330;
    else {
      // Custom segment
      if (customSegment === "active_bookings") base = 2150;
      else if (customSegment === "new_signups") base = 890;
      else if (customSegment === "inactive_90d") base = 4800;
    }
    return base;
  })();

  const handleImportTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    if (templateId.startsWith("ET-")) {
      const et = emailTemplates.find(t => t.id === templateId);
      if (et) {
        setSubject(et.subject);
        setBody(et.body);
        setSendEmail(true);
      }
    } else if (templateId.startsWith("SMS-")) {
      const st = smsTemplates.find(t => t.id === templateId);
      if (st) {
        setSubject(st.name);
        setBody(st.body);
        setSendSMS(true);
      }
    } else if (templateId.startsWith("PUSH-")) {
      const pt = pushTemplates.find(t => t.id === templateId);
      if (pt) {
        setSubject(pt.title);
        setBody(pt.body);
        setSendPush(true);
      }
    }
  };

  const handleTriggerBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      showAlert("Please enter a subject/title and message body.", "error");
      return;
    }
    if (!sendEmail && !sendSMS && !sendPush) {
      showAlert("Please select at least one delivery channel.", "error");
      return;
    }

    if (scheduleType === "later" && !scheduleDateTime) {
      showAlert("Please specify a future date and time to schedule this broadcast.", "error");
      return;
    }

    if (scheduleType === "later") {
      showAlert(`Broadcast successfully scheduled for ${new Date(scheduleDateTime).toLocaleString()}`, "success");
      // Reset composer
      setSubject("");
      setBody("");
      setDeepLink("");
      setImageUrl("");
      setSelectedTemplateId("");
      return;
    }

    // Immediate send simulation
    setIsSending(true);
    setSendProgress(0);
    setSentCount(0);
    setFailedCount(0);
    setShowProgressModal(true);

    const totalToDeliver = estimatedSize;
    const intervalTime = 30; // ms per tick
    const totalTicks = 80;
    const stepSize = Math.ceil(totalToDeliver / totalTicks);

    let currentSent = 0;
    let ticks = 0;

    const timer = setInterval(() => {
      ticks++;
      const pct = Math.min(Math.round((ticks / totalTicks) * 100), 100);
      setSendProgress(pct);

      currentSent += stepSize;
      if (currentSent >= totalToDeliver) {
        currentSent = totalToDeliver;
      }
      
      const fails = Math.round(currentSent * 0.002); // 0.2% failure rate
      setSentCount(currentSent - fails);
      setFailedCount(fails);

      if (ticks >= totalTicks) {
        clearInterval(timer);
        setIsSending(false);

        // Add summary log to Delivery logs
        const logsStr = localStorage.getItem("met_admin_notifications") || "[]";
        let logs = [];
        try { logs = JSON.parse(logsStr); } catch { logs = []; }

        const channelText = [
          sendEmail ? "Email" : "",
          sendSMS ? "SMS" : "",
          sendPush ? "Push" : ""
        ].filter(Boolean).join("+");

        const targetText = targetAudience === "both" 
          ? "Travelers & Partners" 
          : targetAudience === "travelers" 
          ? "All Travelers" 
          : targetAudience === "partners" 
          ? "All Partners" 
          : `Segment (${customSegment})`;

        const newLog = {
          id: `NL-${String(Date.now()).slice(-5)}`,
          recipientName: `${targetText} [${totalToDeliver.toLocaleString()} users]`,
          recipientEmail: `broadcast_list_${String(Date.now()).slice(-4)}@makeeasytrip.com`,
          channel: (sendEmail ? "Email" : sendPush ? "Push" : "SMS") as any,
          template: `[Broadcast] ${subject}`,
          status: "Delivered",
          sentAt: new Date().toISOString(),
          body: `Channels: ${channelText}\n\n${body}`,
          provider: "Bulk SMTP / Gateway Coordinator"
        };

        localStorage.setItem("met_admin_notifications", JSON.stringify([newLog, ...logs]));
      }
    }, intervalTime);
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A225C]" style={{ fontFamily: "Outfit, sans-serif" }}>
            Mass Broadcast Composer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Design and dispatch announcements or promotion campaigns to users instantly or on schedule.</p>
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

        <form onSubmit={handleTriggerBroadcast} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Middle: Composition Fields */}
          <div className="lg:col-span-2 space-y-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-[#0A225C] border-b border-slate-100 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square text-[#FF5E14]" /> Compose Broadcast
            </h3>

            {/* Template importer */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Quick Import Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleImportTemplate(e.target.value)}
                className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold text-[#0A225C]"
              >
                <option value="">-- Choose template to prefill content --</option>
                <optgroup label="Email Templates">
                  {emailTemplates.map(t => (
                    <option key={t.id} value={t.id}>📧 {t.name} (Email)</option>
                  ))}
                </optgroup>
                <optgroup label="SMS Triggers">
                  {smsTemplates.map(t => (
                    <option key={t.id} value={t.id}>💬 {t.name} (SMS)</option>
                  ))}
                </optgroup>
                <optgroup label="Push Templates">
                  {pushTemplates.map(t => (
                    <option key={t.id} value={t.id}>📱 {t.name} (Push)</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Title / Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Broadcast Title / Subject Line *</label>
              <input
                type="text"
                placeholder="e.g. Major app upgrade this weekend / Special discount for travelers"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold"
                required
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Message Content *</label>
              <textarea
                placeholder="Compose your broadcast message payload. You can write rich text descriptions."
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border border-slate-200 rounded-xl p-3.5 text-xs outline-none focus:border-[#0A225C] resize-y"
                required
              />
            </div>

            {/* Optional Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Action Deep Link URL</label>
                <input
                  type="text"
                  placeholder="makeeasytrip://offers/june"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-mono text-slate-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Image Attachment URL (Push Rich Media)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Audience & Scheduling controls */}
          <div className="space-y-6">
            {/* Target Sizing Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0A225C] border-b border-slate-100 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-users text-[#FF5E14]" /> Audience Targeting
              </h3>

              <div className="space-y-3 text-xs">
                {/* Target Audience selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Destination Group</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-bold text-[#0A225C]"
                  >
                    <option value="travelers">All Travelers (Customers)</option>
                    <option value="partners">All Travel Partners (Vendors)</option>
                    <option value="both">Both (All platform users)</option>
                    <option value="segment">Custom Dynamic Segment</option>
                  </select>
                </div>

                {/* Segment detail selector */}
                {targetAudience === "segment" && (
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <label className="font-bold text-slate-500 text-[10px]">Filter Criteria</label>
                    <select
                      value={customSegment}
                      onChange={(e) => setCustomSegment(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold text-[#0A225C] bg-white"
                    >
                      <option value="active_bookings">Travelers with Active Bookings</option>
                      <option value="new_signups">New Signups (last 30 days)</option>
                      <option value="inactive_90d">Inactive Users (over 90 days)</option>
                    </select>
                  </div>
                )}

                {/* Estimate box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Size</span>
                    <span className="text-xl font-black text-[#0A225C]">{estimatedSize.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold ml-1">users</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-100/60 flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-users text-sm"></i>
                  </div>
                </div>

                {/* Channel Checkboxes */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="font-bold text-slate-500 block mb-1">Delivery Channels</label>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="accent-[#0A225C] rounded w-4 h-4"
                    />
                    <span>📧 Email Service Dispatch</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={sendSMS}
                      onChange={(e) => setSendSMS(e.target.checked)}
                      className="accent-[#0A225C] rounded w-4 h-4"
                    />
                    <span>💬 SMS Gateway Broadcast</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={sendPush}
                      onChange={(e) => setSendPush(e.target.checked)}
                      className="accent-[#0A225C] rounded w-4 h-4"
                    />
                    <span>📱 Mobile Device Push Banner</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Delivery scheduling Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0A225C] border-b border-slate-100 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-clock text-[#FF5E14]" /> Dispatch Schedule
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex gap-3 font-bold text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      checked={scheduleType === "now"}
                      onChange={() => setScheduleType("now")}
                      className="accent-[#0A225C]"
                    />
                    <span>Immediate Send</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      checked={scheduleType === "later"}
                      onChange={() => setScheduleType("later")}
                      className="accent-[#0A225C]"
                    />
                    <span>Plan Schedule</span>
                  </label>
                </div>

                {scheduleType === "later" && (
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <label className="font-bold text-slate-500 text-[10px]">Select Target Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold text-slate-700 bg-white"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#FF5E14] text-white py-2.5 rounded-xl font-bold hover:bg-[#E04D0A] transition-all flex items-center justify-center gap-2 shadow"
                >
                  {scheduleType === "now" ? (
                    <>
                      <i className="fa-solid fa-bullhorn" /> Start Live Broadcast
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-calendar-check" /> Lock Scheduled Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Progress Overlay Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-50 text-[#FF5E14] rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <i className="fa-solid fa-broadcast-tower text-xl" />
                </div>
                <h4 className="font-extrabold text-base text-[#0A225C]">
                  {isSending ? "Broadcasting in Progress..." : "Broadcast Finished Successfully!"}
                </h4>
                <p className="text-xs text-slate-400">
                  Target: {targetAudience === "both" ? "All Users" : targetAudience === "travelers" ? "Travelers" : targetAudience === "partners" ? "Partners" : "Segment"}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Progress</span>
                  <span>{sendProgress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-[#FF5E14] rounded-full transition-all duration-300"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sent Success</span>
                  <span className="text-lg font-black text-green-600">{sentCount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Delivered Fails</span>
                  <span className="text-lg font-black text-red-500">{failedCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Close / Action button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    // Clear composer
                    setSubject("");
                    setBody("");
                    setDeepLink("");
                    setImageUrl("");
                    setSelectedTemplateId("");
                  }}
                  disabled={isSending}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                    isSending 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-[#0A225C] text-white hover:bg-[#16368C]"
                  }`}
                >
                  <i className="fa-solid fa-circle-check" /> {isSending ? "Syncing delivery database..." : "Dismiss & View Logs"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
