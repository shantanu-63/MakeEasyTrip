"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface PushTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  deepLink: string;
  imageUrl: string;
  status: "Active" | "Inactive";
}

const DEFAULT_PUSH_TEMPLATES: PushTemplate[] = [
  {
    id: "PUSH-001",
    name: "Check-in Reminder",
    title: "Upcoming check-in tomorrow! 🏨",
    body: "Hi {{traveler_name}}, get ready for your stay at {{property_name}}! Check check-in details and get directions now.",
    deepLink: "makeeasytrip://bookings/{{booking_id}}",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    status: "Active"
  },
  {
    id: "PUSH-002",
    name: "Flash Sale Alert",
    title: "Limited Time: 25% Off Luxury Stays! ✈️",
    body: "Tap to view secret deals on beachfront resorts and historic palaces. Book by midnight!",
    deepLink: "makeeasytrip://offers/flash-25",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    status: "Active"
  },
  {
    id: "PUSH-003",
    name: "Feedback Request",
    title: "How was your experience? ⭐",
    body: "Hi {{traveler_name}}, help other travelers by rating your recent stay at {{property_name}}.",
    deepLink: "makeeasytrip://reviews/new?bookingId={{booking_id}}",
    imageUrl: "",
    status: "Active"
  }
];

export default function PushNotificationsPage() {
  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");

  // FCM Settings States
  const [fcmProjectId, setFcmProjectId] = useState("makeeasytrip-fcm-prod");
  const [fcmSenderId, setFcmSenderId] = useState("892019482711");
  const [fcmKeyStatus, setFcmKeyStatus] = useState("Active (FCM Private Key uploaded)");
  const [sdkSnippetType, setSdkSnippetType] = useState("web"); // web | iOS | android

  // Form States
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Tabs: 'edit' | 'test'
  const [activeTab, setActiveTab] = useState<"edit" | "test">("edit");
  const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android">("ios");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Test states
  const [testUserId, setTestUserId] = useState("");
  const [testTravelerName, setTestTravelerName] = useState("Priya Sharma");
  const [testPropertyName, setTestPropertyName] = useState("The Leela Palace");
  const [testBookingId, setTestBookingId] = useState("MET-69201");

  useEffect(() => {
    const stored = localStorage.getItem("met_push_templates");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTemplates(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0].id);
      } catch {
        setTemplates(DEFAULT_PUSH_TEMPLATES);
        localStorage.setItem("met_push_templates", JSON.stringify(DEFAULT_PUSH_TEMPLATES));
        setSelectedId(DEFAULT_PUSH_TEMPLATES[0].id);
      }
    } else {
      setTemplates(DEFAULT_PUSH_TEMPLATES);
      localStorage.setItem("met_push_templates", JSON.stringify(DEFAULT_PUSH_TEMPLATES));
      setSelectedId(DEFAULT_PUSH_TEMPLATES[0].id);
    }
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setTitle(selectedTemplate.title);
      setBody(selectedTemplate.body);
      setDeepLink(selectedTemplate.deepLink);
      setImageUrl(selectedTemplate.imageUrl);
      setStatus(selectedTemplate.status);
    }
  }, [selectedTemplate]);

  const handleSave = () => {
    if (!name || !title || !body) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    const updated = templates.map((t) => {
      if (t.id === selectedId) {
        return {
          ...t,
          name,
          title,
          body,
          deepLink,
          imageUrl,
          status
        };
      }
      return t;
    });

    setTemplates(updated);
    localStorage.setItem("met_push_templates", JSON.stringify(updated));
    showAlert("Push notification template updated successfully!", "success");
  };

  const handleCreateNew = () => {
    const newId = `PUSH-${String(Date.now()).slice(-3)}`;
    const newTemp: PushTemplate = {
      id: newId,
      name: "New Push Template",
      title: "Notification Title 🔔",
      body: "Write notification body message here.",
      deepLink: "makeeasytrip://home",
      imageUrl: "",
      status: "Active"
    };

    const updated = [...templates, newTemp];
    setTemplates(updated);
    localStorage.setItem("met_push_templates", JSON.stringify(updated));
    setSelectedId(newId);
    setActiveTab("edit");
    showAlert("Created new push template!", "success");
  };

  const handleDelete = () => {
    if (templates.length <= 1) {
      showAlert("You must keep at least one push template.", "error");
      return;
    }
    if (confirm("Are you sure you want to delete this push template?")) {
      const updated = templates.filter((t) => t.id !== selectedId);
      setTemplates(updated);
      localStorage.setItem("met_push_templates", JSON.stringify(updated));
      setSelectedId(updated[0].id);
      showAlert("Push template deleted.", "success");
    }
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const getReplacedField = (rawText: string) => {
    let result = rawText;
    result = result.replace(/\{\{traveler_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{partner_name\}\}/g, testTravelerName);
    result = result.replace(/\{\{property_name\}\}/g, testPropertyName);
    result = result.replace(/\{\{booking_id\}\}/g, testBookingId);
    return result;
  };

  const handleSendTestPush = () => {
    if (!testUserId) {
      showAlert("Please enter a target Traveler Email, Phone or User ID.", "error");
      return;
    }

    const logsStr = localStorage.getItem("met_admin_notifications") || "[]";
    let logs = [];
    try { logs = JSON.parse(logsStr); } catch { logs = []; }

    const newLog = {
      id: `NL-${String(Date.now()).slice(-5)}`,
      recipientName: testTravelerName,
      recipientEmail: testUserId,
      channel: "Push",
      template: name,
      status: "Delivered",
      sentAt: new Date().toISOString()
    };

    localStorage.setItem("met_admin_notifications", JSON.stringify([newLog, ...logs]));
    showAlert(`Test Push notification dispatched to User ${testUserId}!`, "success");
    setTestUserId("");
  };

  const filtered = templates.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A225C]" style={{ fontFamily: "Outfit, sans-serif" }}>
              Mobile Push Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure real-time push alerts, deep links, and device service credentials.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-[#FF5E14] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04D0A] transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus" /> Create Push
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
          {/* Left Column: Templates + SDK configs */}
          <div className="space-y-6">
            {/* Template List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-[#0A225C]">Push Templates</h3>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{filtered.length} total</span>
              </div>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search templates..."
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
                    <span className="text-[11px] text-slate-400 truncate block">{t.title}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 font-bold">No templates found.</div>
                )}
              </div>
            </div>

            {/* FCM Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-[#0A225C]">FCM Cloud Service</h3>
                <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full text-[9px] font-bold">Active API</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Project ID</label>
                  <input
                    type="text"
                    value={fcmProjectId}
                    onChange={(e) => setFcmProjectId(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-mono text-slate-600 bg-slate-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Sender ID</label>
                  <input
                    type="text"
                    value={fcmSenderId}
                    onChange={(e) => setFcmSenderId(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0A225C] font-mono text-slate-600 bg-slate-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Service Private Key (.json)</label>
                  <div className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-3.5 text-center flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100">
                    <i className="fa-solid fa-file-code text-slate-400 text-lg" />
                    <span className="font-bold text-slate-500 text-[10px]">{fcmKeyStatus}</span>
                    <span className="text-[9px] text-slate-400">Click to upload another private key file</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5 font-bold text-slate-500">
                    <span>SDK SDK Snippet</span>
                    <div className="flex gap-2">
                      <button onClick={() => setSdkSnippetType("web")} className={`underline text-[10px] ${sdkSnippetType === "web" ? "text-[#0A225C]" : ""}`}>Web</button>
                      <button onClick={() => setSdkSnippetType("ios")} className={`underline text-[10px] ${sdkSnippetType === "ios" ? "text-[#0A225C]" : ""}`}>iOS</button>
                      <button onClick={() => setSdkSnippetType("android")} className={`underline text-[10px] ${sdkSnippetType === "android" ? "text-[#0A225C]" : ""}`}>Android</button>
                    </div>
                  </div>
                  <pre className="p-3 bg-slate-950 text-[#38BDF8] text-[9px] rounded-xl overflow-x-auto font-mono leading-relaxed">
                    {sdkSnippetType === "web" && `// FCM Web Configuration\nimport { initializeApp } from "firebase/app";\nimport { getMessaging } from "firebase/messaging";\n\nconst firebaseConfig = {\n  apiKey: "AIzaSyA8...",\n  authDomain: "met.firebaseapp.com",\n  projectId: "${fcmProjectId}"\n};\n\nconst app = initializeApp(firebaseConfig);\nexport const messaging = getMessaging(app);`}
                    {sdkSnippetType === "ios" && `// FCM iOS APNs setup\nimport FirebaseCore\nimport FirebaseMessaging\n\n@main\nclass AppDelegate: UIResponder, UIApplicationDelegate {\n  func application(...) {\n    FirebaseApp.configure()\n    Messaging.messaging().delegate = self\n  }\n}`}
                    {sdkSnippetType === "android" && `// FCM Android manifest setup\n<service\n    android:name=".MyFirebaseMessagingService"\n    android:exported="false">\n    <intent-filter>\n        <action android:name="com.google.firebase.MESSAGING_EVENT"/>\n    </intent-filter>\n</service>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Template details & Visual Push Lockscreen simulator */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTemplate ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Header */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-extrabold text-xs">
                      {selectedTemplate.id}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0A225C]">{selectedTemplate.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Action Deep Link: {deepLink}</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-4 py-1.5 rounded-md transition-all ${
                        activeTab === "edit" ? "bg-white text-[#0A225C] shadow-sm" : "hover:text-[#0A225C]"
                      }`}
                    >
                      Config Template
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

                {/* Main Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  {activeTab === "edit" ? (
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
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Action Deep Link *</label>
                          <input
                            type="text"
                            value={deepLink}
                            onChange={(e) => setDeepLink(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-mono text-slate-600"
                            placeholder="makeeasytrip://..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Notification Title (Bold Header) *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C] font-bold"
                            placeholder="e.g. Flight check-in ready!"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Rich Image URL (Optional)</label>
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#0A225C]"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Message Content *</label>
                          <span className="text-[9px] text-slate-400 font-bold">Recommended &lt;120 chars (Length: {body.length})</span>
                        </div>
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={3}
                          maxLength={150}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#0A225C] resize-none"
                          placeholder="e.g. Hi Siddharth, rate your experience..."
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left Sandbox variables */}
                      <div className="space-y-4 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-[#0A225C]">Recipient User ID / Account *</label>
                          <input
                            type="text"
                            placeholder="e.g. user@example.com / USER-8210"
                            value={testUserId}
                            onChange={(e) => setTestUserId(e.target.value)}
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
                          <div className="col-span-2">
                            <label className="font-bold text-slate-400 block mb-0.5 text-[9px]">Booking Ref ID</label>
                            <input type="text" value={testBookingId} onChange={e => setTestBookingId(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 outline-none" />
                          </div>
                        </div>

                        <button
                          onClick={handleSendTestPush}
                          className="w-full bg-[#FF5E14] text-white py-2.5 rounded-xl font-bold hover:bg-[#E04D0A] transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paper-plane" /> Send Simulation Push
                        </button>
                      </div>

                      {/* Right Lockscreen Simulation */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                          <button onClick={() => setPreviewPlatform("ios")} className={`px-3 py-1 rounded-lg ${previewPlatform === "ios" ? "bg-white shadow text-[#0A225C]" : "text-slate-500"}`}>iPhone App</button>
                          <button onClick={() => setPreviewPlatform("android")} className={`px-3 py-1 rounded-lg ${previewPlatform === "android" ? "bg-white shadow text-[#0A225C]" : "text-slate-500"}`}>Android OS</button>
                        </div>

                        {previewPlatform === "ios" ? (
                          /* iOS Banner style */
                          <div className="w-[280px] min-h-[380px] bg-slate-900 rounded-[40px] border-[6px] border-slate-800 p-3 shadow-lg relative flex flex-col justify-start text-white overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549241520-425e3dfc01cd?auto=format&fit=crop&w=400&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}>
                            <div className="w-20 h-4 bg-black rounded-full mx-auto mb-6"></div>
                            
                            {/* Date/Time lockscreen */}
                            <div className="text-center font-light mb-6 drop-shadow-md">
                              <div className="text-3xl">16:50</div>
                              <div className="text-[9px] uppercase tracking-widest font-semibold mt-1">Tuesday, June 23</div>
                            </div>

                            {/* Notification banner */}
                            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-left w-full space-y-1.5 shadow">
                              <div className="flex justify-between items-center text-[9px] text-white/60 font-bold">
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 bg-[#FF5E14] rounded flex items-center justify-center text-[7px] text-white font-extrabold">MET</div>
                                  <span>MAKEEASYTRIP</span>
                                </div>
                                <span>now</span>
                              </div>
                              <div className="text-xs font-bold text-white leading-tight">{getReplacedField(title)}</div>
                              <div className="text-[10px] text-white/80 leading-normal">{getReplacedField(body)}</div>
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt="Rich Push Preview"
                                  className="w-full h-20 object-cover rounded-xl mt-1.5 border border-white/5"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Android Banner style */
                          <div className="w-[280px] min-h-[380px] bg-[#121212] rounded-[36px] border-[6px] border-slate-800 p-3 shadow-lg relative flex flex-col justify-start text-slate-100 overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}>
                            <div className="w-2.5 h-2.5 bg-black rounded-full absolute top-2.5 left-1/2 -translate-x-1/2"></div>
                            
                            {/* Time lockscreen */}
                            <div className="text-left font-light mb-8 pl-4 pt-4 drop-shadow-md text-white">
                              <div className="text-2xl font-bold">4:50</div>
                              <div className="text-[9px] tracking-wide mt-0.5">Tue, June 23</div>
                            </div>

                            {/* Android Notification */}
                            <div className="bg-[#2D2D2D]/95 backdrop-blur-md rounded-[20px] p-3 text-left w-full space-y-1 shadow">
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                <div className="flex items-center gap-1.5">
                                  <i className="fa-solid fa-bell text-[#FF5E14]" />
                                  <span>MakeEasyTrip • 1m</span>
                                </div>
                                <i className="fa-solid fa-chevron-down text-[8px]" />
                              </div>
                              <div className="text-[11px] font-bold text-white mt-1">{getReplacedField(title)}</div>
                              <div className="text-[10px] text-slate-300 leading-snug">{getReplacedField(body)}</div>
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt="Rich Push Preview"
                                  className="w-full h-16 object-cover rounded-lg mt-1 border border-white/5"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-bold">
                <i className="fa-solid fa-mobile-screen text-4xl mb-2 text-[#0A225C]/25" />
                <span>Select a push template to configure.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
