"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface APILog {
  id: string;
  timestamp: string;
  feature: "Trip Planner" | "Support Chat" | "Hotel Search" | "Review Moderator";
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  status: "Success" | "Error" | "Rate Limited";
  requestPayload: string;
  responsePayload: string;
}

const MOCK_API_LOGS: APILog[] = [
  {
    id: "LOG-9081",
    timestamp: "2026-06-23T16:45:12Z",
    feature: "Trip Planner",
    model: "gpt-4o",
    promptTokens: 1450,
    completionTokens: 890,
    latencyMs: 2450,
    status: "Success",
    requestPayload: JSON.stringify({ destination: "Paris", days: 5, budget: "luxury", companion: "couple" }, null, 2),
    responsePayload: JSON.stringify({ overview: "5-day romantic Paris getaway", hotel: "Le Bristol Paris", schedule: "Day 1-5 detailed itinerary" }, null, 2),
  },
  {
    id: "LOG-9080",
    timestamp: "2026-06-23T16:42:01Z",
    feature: "Support Chat",
    model: "gpt-3.5-turbo",
    promptTokens: 420,
    completionTokens: 110,
    latencyMs: 450,
    status: "Success",
    requestPayload: JSON.stringify({ user_id: "USR001", query: "Where is my refund for booking Ref MET-8821?" }, null, 2),
    responsePayload: JSON.stringify({ text: "Hello! Refunds take 5-7 business days to process. It is currently at step 2 of 3..." }, null, 2),
  },
  {
    id: "LOG-9079",
    timestamp: "2026-06-23T16:38:55Z",
    feature: "Hotel Search",
    model: "gpt-4o-mini",
    promptTokens: 890,
    completionTokens: 520,
    latencyMs: 1250,
    status: "Success",
    requestPayload: JSON.stringify({ location: "Goa", filters: ["pool", "beachfront"], maxPrice: 6000 }, null, 2),
    responsePayload: JSON.stringify({ recommendations: ["Taj Exotica", "Caravela Beach Resort"] }, null, 2),
  },
  {
    id: "LOG-9078",
    timestamp: "2026-06-23T16:31:22Z",
    feature: "Support Chat",
    model: "gpt-3.5-turbo",
    promptTokens: 380,
    completionTokens: 150,
    latencyMs: 620,
    status: "Success",
    requestPayload: JSON.stringify({ query: "I want to speak with a human support agent please." }, null, 2),
    responsePayload: JSON.stringify({ text: "[ESCALATE] I will forward your concern to our high priority team immediately." }, null, 2),
  },
  {
    id: "LOG-9077",
    timestamp: "2026-06-23T16:22:10Z",
    feature: "Trip Planner",
    model: "gpt-4o",
    promptTokens: 1890,
    completionTokens: 0,
    latencyMs: 12000,
    status: "Error",
    requestPayload: JSON.stringify({ destination: "Iceland", days: 10, budget: "extreme adventurer" }, null, 2),
    responsePayload: JSON.stringify({ error: "Context length exceeded or connection closed by OpenAI upstream API." }, null, 2),
  },
  {
    id: "LOG-9076",
    timestamp: "2026-06-23T15:58:44Z",
    feature: "Review Moderator",
    model: "gpt-4o-mini",
    promptTokens: 310,
    completionTokens: 45,
    latencyMs: 380,
    status: "Success",
    requestPayload: JSON.stringify({ reviewText: "This place was terrible! Cockroaches in the kitchen and the staff didn't care. SCAM!" }, null, 2),
    responsePayload: JSON.stringify({ flagged: true, reason: "profanity/extreme claims check", score: 0.89 }, null, 2),
  },
  {
    id: "LOG-9075",
    timestamp: "2026-06-23T15:45:00Z",
    feature: "Trip Planner",
    model: "gpt-4o",
    promptTokens: 1510,
    completionTokens: 912,
    latencyMs: 2310,
    status: "Success",
    requestPayload: JSON.stringify({ destination: "Manali", days: 3, budget: "backpacker" }, null, 2),
    responsePayload: JSON.stringify({ itinerary: "Day 1: Solang Valley hiking. Day 2: Old Manali Cafe crawl..." }, null, 2),
  },
  {
    id: "LOG-9074",
    timestamp: "2026-06-23T15:12:19Z",
    feature: "Hotel Search",
    model: "gpt-4o-mini",
    promptTokens: 950,
    completionTokens: 410,
    latencyMs: 1180,
    status: "Success",
    requestPayload: JSON.stringify({ location: "Mumbai", budget: "business" }, null, 2),
    responsePayload: JSON.stringify({ hotels: ["Trident Nariman Point", "Taj Mahal Palace"] }, null, 2),
  },
  {
    id: "LOG-9073",
    timestamp: "2026-06-23T14:48:30Z",
    feature: "Support Chat",
    model: "gpt-3.5-turbo",
    promptTokens: 520,
    completionTokens: 80,
    latencyMs: 510,
    status: "Rate Limited",
    requestPayload: JSON.stringify({ user_id: "USR299", query: "Help!" }, null, 2),
    responsePayload: JSON.stringify({ error: "429 Too Many Requests - Token quota exceeded." }, null, 2),
  }
];

export default function UsagePage() {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);

  // Time filter state
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d">("7d");

  useEffect(() => {
    const saved = localStorage.getItem("met_ai_usage_logs");
    if (saved) {
      try { setLogs(JSON.parse(saved)); } catch (e) { setLogs(MOCK_API_LOGS); }
    } else {
      localStorage.setItem("met_ai_usage_logs", JSON.stringify(MOCK_API_LOGS));
      setLogs(MOCK_API_LOGS);
    }
  }, []);

  // Compute Stats
  const stats = useMemo(() => {
    const totalRequests = logs.length;
    let successCount = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalLatency = 0;

    logs.forEach((log) => {
      if (log.status === "Success") successCount++;
      totalPromptTokens += log.promptTokens;
      totalCompletionTokens += log.completionTokens;
      totalLatency += log.latencyMs;
    });

    const avgLatencyMs = totalRequests ? Math.round(totalLatency / totalRequests) : 0;
    const successRate = totalRequests ? Math.round((successCount / totalRequests) * 100) : 0;
    const totalTokens = totalPromptTokens + totalCompletionTokens;

    return {
      totalRequests,
      successRate,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens,
      avgLatencyMs,
    };
  }, [logs]);

  // Filter logs list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.requestPayload.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.responsePayload.toLowerCase().includes(searchQuery.toLowerCase());
      const matchModel = modelFilter === "" || log.model === modelFilter;
      const matchFeature = featureFilter === "" || log.feature === featureFilter;
      const matchStatus = statusFilter === "" || log.status === statusFilter;
      return matchSearch && matchModel && matchFeature && matchStatus;
    });
  }, [logs, searchQuery, modelFilter, featureFilter, statusFilter]);

  // Add random mock log to simulate live logs
  const handleGenerateLog = () => {
    const features: APILog["feature"][] = ["Trip Planner", "Support Chat", "Hotel Search", "Review Moderator"];
    const models = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];
    const randFeature = features[Math.floor(Math.random() * features.length)];
    const randModel = models[Math.floor(Math.random() * models.length)];
    const isErr = Math.random() < 0.1;
    const isRate = Math.random() < 0.05;

    let status: APILog["status"] = "Success";
    if (isErr) status = "Error";
    else if (isRate) status = "Rate Limited";

    const promptTokens = Math.floor(Math.random() * 1500) + 200;
    const completionTokens = status === "Success" ? Math.floor(Math.random() * 800) + 50 : 0;
    const latencyMs = status === "Success" ? Math.floor(Math.random() * 2000) + 300 : Math.floor(Math.random() * 8000) + 1000;

    const newLog: APILog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      feature: randFeature,
      model: randModel,
      promptTokens,
      completionTokens,
      latencyMs,
      status,
      requestPayload: JSON.stringify({ test_arg: "Live Simulated Request Payload", timestamp: Date.now() }, null, 2),
      responsePayload: status === "Success"
        ? JSON.stringify({ simulated: "Success outcome generated by the server.", tokens_used: promptTokens + completionTokens }, null, 2)
        : JSON.stringify({ error: "System failed during standard operations loop." }, null, 2),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("met_ai_usage_logs", JSON.stringify(updated));
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all simulation logs?")) {
      setLogs([]);
      localStorage.setItem("met_ai_usage_logs", JSON.stringify([]));
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary font-heading">AI Usage Analytics</h2>
          <p className="text-sm text-text-muted">
            Monitor API throughput, model latency distributions, and total token allocation.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleGenerateLog}
            className="flex-1 md:flex-none bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bolt"></i> Simulate API Call
          </button>
          <button
            onClick={handleClearLogs}
            className="flex-1 md:flex-none border border-slate-200 text-text-main hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-trash-can"></i> Reset Logs
          </button>
        </div>
      </div>

      {/* --- STATS CARD ROW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h4 className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Total LLM Requests</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{stats.totalRequests}</div>
            <span className="text-[10px] text-success font-bold"><i className="fa-solid fa-arrow-trend-up"></i> +12% from yesterday</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-success/5 text-success rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-percent"></i>
          </div>
          <div>
            <h4 className="text-[11px] text-text-muted font-bold uppercase tracking-wider">API Success Rate</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{stats.successRate}%</div>
            <span className="text-[10px] text-text-muted">Target operational goal &gt;98%</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-warning/5 text-warning rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-server"></i>
          </div>
          <div>
            <h4 className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Total Tokens Consumed</h4>
            <div className="text-2xl font-black text-primary mt-0.5">
              {stats.totalTokens.toLocaleString()}
            </div>
            <span className="text-[10px] text-text-muted font-semibold">
              In: {stats.totalPromptTokens.toLocaleString()} | Out: {stats.totalCompletionTokens.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF5E14]/5 text-secondary rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <h4 className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Avg Response Latency</h4>
            <div className="text-2xl font-black text-primary mt-0.5">{stats.avgLatencyMs} ms</div>
            <span className="text-[10px] text-danger font-bold"><i className="fa-solid fa-clock-rotate-left"></i> +80ms model warm-up</span>
          </div>
        </div>
      </div>

      {/* --- CHARTS ROW (SVG Based for compilation safety & responsive beauty) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* SVG Daily Call Volume Chart */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-primary">Hourly Request Distribution</h3>
              <p className="text-[11px] text-text-muted">Simulated active request load across periods</p>
            </div>
            <span className="text-[11px] font-bold text-primary bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              Live Monitor
            </span>
          </div>

          <div className="relative w-full h-64 border-b border-l border-slate-200">
            {/* SVG Visual bar representation */}
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Bars */}
              {/* Day 1: 120 */}
              <rect x="40" y="120" width="30" height="80" rx="4" fill="#0A225C" opacity="0.85" className="transition-all hover:opacity-100 cursor-pointer" />
              <text x="55" y="110" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">120</text>
              {/* Day 2: 150 */}
              <rect x="100" y="90" width="30" height="110" rx="4" fill="#0A225C" opacity="0.85" className="transition-all hover:opacity-100" />
              <text x="115" y="80" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">150</text>
              {/* Day 3: 135 */}
              <rect x="160" y="105" width="30" height="95" rx="4" fill="#0A225C" opacity="0.85" className="transition-all hover:opacity-100" />
              <text x="175" y="95" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">135</text>
              {/* Day 4: 195 */}
              <rect x="220" y="45" width="30" height="155" rx="4" fill="#FF5E14" opacity="0.85" className="transition-all hover:opacity-100" />
              <text x="235" y="35" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#FF5E14">195</text>
              {/* Day 5: 220 */}
              <rect x="280" y="20" width="30" height="180" rx="4" fill="#0A225C" opacity="0.85" className="transition-all hover:opacity-100" />
              <text x="295" y="12" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">220</text>
              {/* Day 6: 180 */}
              <rect x="340" y="60" width="30" height="140" rx="4" fill="#0A225C" opacity="0.85" className="transition-all hover:opacity-100" />
              <text x="355" y="50" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">180</text>
              {/* Day 7: 245 */}
              <rect x="400" y="5" width="30" height="195" rx="4" fill="#0A225C" opacity="0.95" className="transition-all hover:opacity-100" />
              <text x="415" y="0" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A225C">245</text>
            </svg>
            <div className="absolute inset-x-0 bottom-[-24px] flex justify-between px-6 text-[10px] font-bold text-text-muted">
              <span>Jun 17</span>
              <span>Jun 18</span>
              <span>Jun 19</span>
              <span>Jun 20 (Promo)</span>
              <span>Jun 21</span>
              <span>Jun 22</span>
              <span>Today (Jun 23)</span>
            </div>
          </div>
        </div>

        {/* SVG Token allocation / cost Line Chart */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-primary">Token Cumulative Usage Trend</h3>
              <p className="text-[11px] text-text-muted">Prompt vs. Completion allocation metrics</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span> Input</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-secondary rounded-full"></span> Output</span>
            </div>
          </div>

          <div className="relative w-full h-64 border-b border-l border-slate-200">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Area path input */}
              <path d="M 0,200 L 50,170 L 100,160 L 180,110 L 250,90 L 330,70 L 420,40 L 500,20 L 500,200 Z" fill="rgba(10,34,92,0.06)" />
              <path d="M 0,200 L 50,170 L 100,160 L 180,110 L 250,90 L 330,70 L 420,40 L 500,20" fill="none" stroke="#0A225C" strokeWidth="2.5" />
              
              {/* Area path output */}
              <path d="M 0,200 L 50,190 L 100,185 L 180,160 L 250,140 L 330,120 L 420,95 L 500,75 L 500,200 Z" fill="rgba(255,94,20,0.06)" />
              <path d="M 0,200 L 50,190 L 100,185 L 180,160 L 250,140 L 330,120 L 420,95 L 500,75" fill="none" stroke="#FF5E14" strokeWidth="2.5" />

              {/* Points */}
              <circle cx="250" cy="90" r="4" fill="#0A225C" />
              <circle cx="250" cy="140" r="4" fill="#FF5E14" />
              <circle cx="500" cy="20" r="4" fill="#0A225C" />
              <circle cx="500" cy="75" r="4" fill="#FF5E14" />
            </svg>
            <div className="absolute inset-x-0 bottom-[-24px] flex justify-between px-6 text-[10px] font-bold text-text-muted">
              <span>9:00 AM</span>
              <span>11:00 AM</span>
              <span>1:00 PM</span>
              <span>3:00 PM</span>
              <span>5:00 PM (Peak)</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- LOGS TABLE & CONTROLS --- */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-primary">Latency &amp; Request Audit Log</h3>
            <p className="text-[11px] text-text-muted">Inspect prompt variables, headers, and upstream latencies.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search log payloads..."
                className="w-full pl-3 pr-3 py-1.5 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary"
              />
            </div>
            <div>
              <select
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary"
              >
                <option value="">All Features</option>
                <option value="Trip Planner">Trip Planner</option>
                <option value="Support Chat">Support Chat</option>
                <option value="Hotel Search">Hotel Search</option>
                <option value="Review Moderator">Review Moderator</option>
              </select>
            </div>
            <div>
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary"
              >
                <option value="">All Models</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Error">Error</option>
                <option value="Rate Limited">Rate Limited</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="partner-table" id="usage-logs-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Feature Engine</th>
                <th>LLM Model</th>
                <th style={{ textAlign: "right" }}>In Tokens</th>
                <th style={{ textAlign: "right" }}>Out Tokens</th>
                <th style={{ textAlign: "right" }}>Latency</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Payloads</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-text-muted font-semibold">
                    <i className="fa-solid fa-magnifying-glass-minus text-2xl mb-2 block text-slate-300"></i>
                    No API request logs match search/filter requirements.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = "bg-success/15 text-success border-success/30";
                  if (log.status === "Error") badgeColor = "bg-danger/15 text-danger border-danger/30";
                  if (log.status === "Rate Limited") badgeColor = "bg-warning/15 text-warning border-warning/30";

                  const cleanTime = new Date(log.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  });

                  return (
                    <tr key={log.id} className="admin-table-row text-xs">
                      <td><strong>{log.id}</strong></td>
                      <td className="text-text-muted font-mono">{cleanTime}</td>
                      <td className="font-bold text-primary">{log.feature}</td>
                      <td className="text-text-muted font-mono">{log.model}</td>
                      <td style={{ textAlign: "right" }} className="font-mono text-text-muted">{log.promptTokens}</td>
                      <td style={{ textAlign: "right" }} className="font-mono text-text-muted">{log.completionTokens}</td>
                      <td style={{ textAlign: "right" }} className="font-bold text-primary">{log.latencyMs} ms</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${badgeColor}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-primary font-bold px-2.5 py-1 rounded text-[11px]"
                        >
                          <i className="fa-solid fa-code"></i> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LOG INSPECTION MODAL --- */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-border shadow-2xl overflow-hidden">
            <div className="bg-[#0A225C] text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Payload Audit Trace: {selectedLog.id}</h3>
                <span className="text-[10px] text-white/70 font-mono">{selectedLog.timestamp}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Request Payload (JSON)
                </h4>
                <pre className="bg-slate-950 text-emerald-400 font-mono text-[10px] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 border border-slate-900">
                  {selectedLog.requestPayload}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Response Payload (JSON)
                </h4>
                <pre className="bg-slate-950 text-indigo-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 border border-slate-900">
                  {selectedLog.responsePayload}
                </pre>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-between items-center text-[10px] font-mono text-text-muted">
              <span>Model: <strong className="text-primary">{selectedLog.model}</strong> | Latency: <strong className="text-primary">{selectedLog.latencyMs}ms</strong></span>
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-primary text-white font-bold px-4 py-1.5 rounded-lg hover:bg-blue-900 text-xs transition"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
