"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface PromptVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  systemPrompt: string;
  isActive: boolean;
  changeLog: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  category: "Planner" | "Support" | "Recommendation" | "General";
  model: string;
  temperature: number;
  maxTokens: number;
  description: string;
  activeVersion: string;
  versions: PromptVersion[];
}

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: "trip-planner-core",
    title: "AI Trip Planner Core",
    category: "Planner",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 2000,
    description: "Acts as a specialized virtual travel agent for MakeEasyTrip, creating structured travel itineraries.",
    activeVersion: "v2.4",
    versions: [
      {
        version: "v2.4",
        updatedAt: "2026-06-15T10:00:00Z",
        updatedBy: "Nikhil Patil",
        systemPrompt: "You are the MakeEasyTrip AI Trip Planner. Your job is to design highly customized, realistic, and budget-conscious travel itineraries.\n\nWhen a user requests a trip, structure your response to include:\n1. TRIP OVERVIEW: Summarize the destination, duration, vibe, and estimated cost.\n2. DAILY ITINERARY: Give a day-by-day plan with morning, afternoon, and evening activities. Mention travel times.\n3. ACCOMMODATION: Suggest three hotel properties (budget, mid-range, luxury) from MakeEasyTrip.\n4. PRACTICAL TIPS: Note local transit, weather, packing suggestions, and cultural etiquette.\n\nAlways maintain a warm, helpful, and adventurous tone. Recommend booking experiences and hotels through MakeEasyTrip to get the best discounts.",
        isActive: true,
        changeLog: "Refined hotel recommendation structure and added discount emphasis."
      },
      {
        version: "v2.3",
        updatedAt: "2026-05-10T14:30:00Z",
        updatedBy: "Admin",
        systemPrompt: "You are the AI Trip Planner for MakeEasyTrip. Plan itineraries for user requests. Provide hotel options and daily plans.",
        isActive: false,
        changeLog: "Initial prompt setup."
      }
    ]
  },
  {
    id: "support-agent-bot",
    title: "Support Agent Chatbot",
    category: "Support",
    model: "gpt-3.5-turbo",
    temperature: 0.2,
    maxTokens: 800,
    description: "Handles customer support queries, answers FAQs, and triggers escalations to human support.",
    activeVersion: "v1.2",
    versions: [
      {
        version: "v1.2",
        updatedAt: "2026-06-20T11:15:00Z",
        updatedBy: "Nikhil Patil",
        systemPrompt: "You are the MakeEasyTrip Automated Support Assistant. Help travelers with their bookings, cancellations, refunds, and site navigation.\n\nKey rules:\n- Refund processing takes 5-7 business days.\n- Cancellation fees depend on the specific hotel/activity provider policy.\n- Be extremely polite, brief, and solutions-oriented.\n- If the customer uses profanity, remains highly frustrated after 2 attempts, or explicitly asks for a human, prepend the keyword '[ESCALATE]' to your message so our dashboard flag triggers.",
        isActive: true,
        changeLog: "Added '[ESCALATE]' instruction flag."
      },
      {
        version: "v1.1",
        updatedAt: "2026-04-18T09:00:00Z",
        updatedBy: "System Administrator",
        systemPrompt: "You are a customer service assistant. Help the traveler solve their queries about flights and bookings.",
        isActive: false,
        changeLog: "Base version of the support agent prompt."
      }
    ]
  },
  {
    id: "hotel-recommender-pro",
    title: "Hotel Recommender Pro",
    category: "Recommendation",
    model: "gpt-4o-mini",
    temperature: 0.5,
    maxTokens: 1000,
    description: "Matches user profiles to hotels based on budget, style, location, and guest ratings.",
    activeVersion: "v1.0",
    versions: [
      {
        version: "v1.0",
        updatedAt: "2026-06-01T16:00:00Z",
        updatedBy: "Preeti Rao",
        systemPrompt: "You are a hospitality concierge expert. You receive traveler requirements (budget, group configuration, preferred activities, amenities) and return three matching hotels.\n\nFor each hotel, describe:\n- The neighborhood and general vibe\n- Key standout amenities matching traveler demands\n- Why this hotel specifically fits their personal style\n- Approximate night rate",
        isActive: true,
        changeLog: "Production launch."
      }
    ]
  }
];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"edit" | "history" | "simulate">("edit");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Editor Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<PromptTemplate["category"]>("Planner");
  const [formModel, setFormModel] = useState("gpt-4o");
  const [formTemperature, setFormTemperature] = useState(0.7);
  const [formMaxTokens, setFormMaxTokens] = useState(2000);
  const [formSystemPrompt, setFormSystemPrompt] = useState("");
  const [formChangeLog, setFormChangeLog] = useState("");

  // Simulation Sandbox State
  const [sandboxUserInput, setSandboxUserInput] = useState("We are looking for a 4-day budget itinerary for a family of 4 in Jaipur, Rajasthan. Focus on historical sites and local shopping.");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromptId, setNewPromptId] = useState("");
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptDesc, setNewPromptDesc] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState<PromptTemplate["category"]>("Planner");

  // Load prompts
  useEffect(() => {
    const saved = localStorage.getItem("met_ai_prompts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPrompts(parsed);
        if (parsed.length > 0) setSelectedPromptId(parsed[0].id);
      } catch (e) {
        setPrompts(DEFAULT_PROMPTS);
        setSelectedPromptId(DEFAULT_PROMPTS[0].id);
      }
    } else {
      localStorage.setItem("met_ai_prompts", JSON.stringify(DEFAULT_PROMPTS));
      setPrompts(DEFAULT_PROMPTS);
      setSelectedPromptId(DEFAULT_PROMPTS[0].id);
    }
  }, []);

  const selectedPrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId);
  }, [prompts, selectedPromptId]);

  // Sync form when selectedPrompt changes or active tab is switched
  useEffect(() => {
    if (selectedPrompt) {
      const activeVer = selectedPrompt.versions.find((v) => v.isActive) || selectedPrompt.versions[0];
      setFormTitle(selectedPrompt.title);
      setFormDescription(selectedPrompt.description);
      setFormCategory(selectedPrompt.category);
      setFormModel(selectedPrompt.model);
      setFormTemperature(selectedPrompt.temperature);
      setFormMaxTokens(selectedPrompt.maxTokens);
      setFormSystemPrompt(activeVer?.systemPrompt || "");
      setFormChangeLog("");
      setSimulatedResponse("");
    }
  }, [selectedPromptId, selectedPrompt]);

  // Handle Save Update (Creates new version)
  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt) return;

    const currentActiveVer = selectedPrompt.versions.find((v) => v.isActive);
    let nextVerNum = 1.0;
    if (currentActiveVer) {
      const verParts = currentActiveVer.version.replace("v", "").split(".");
      const major = parseInt(verParts[0], 10);
      const minor = parseInt(verParts[1] || "0", 10);
      nextVerNum = parseFloat(`${major}.${minor + 1}`);
    }

    const nextVerStr = `v${nextVerNum.toFixed(1)}`;
    const newVersionObj: PromptVersion = {
      version: nextVerStr,
      updatedAt: new Date().toISOString(),
      updatedBy: "Super Admin (You)",
      systemPrompt: formSystemPrompt,
      isActive: true,
      changeLog: formChangeLog.trim() || "Manual adjustment of prompt instructions."
    };

    const updatedVersions = selectedPrompt.versions.map((v) => ({
      ...v,
      isActive: false,
    }));
    updatedVersions.unshift(newVersionObj); // put newest version at top

    const updatedPrompts = prompts.map((p) => {
      if (p.id === selectedPromptId) {
        return {
          ...p,
          title: formTitle,
          description: formDescription,
          category: formCategory,
          model: formModel,
          temperature: formTemperature,
          maxTokens: formMaxTokens,
          activeVersion: nextVerStr,
          versions: updatedVersions,
        };
      }
      return p;
    });

    setPrompts(updatedPrompts);
    localStorage.setItem("met_ai_prompts", JSON.stringify(updatedPrompts));
    setFormChangeLog("");
    alert(`Successfully updated! Created version ${nextVerStr}`);
  };

  // Rollback to a specific version
  const handleActivateVersion = (verStr: string) => {
    if (!selectedPrompt) return;

    const updatedVersions = selectedPrompt.versions.map((v) => ({
      ...v,
      isActive: v.version === verStr,
    }));

    const targetVer = selectedPrompt.versions.find((v) => v.version === verStr);
    const updatedPrompts = prompts.map((p) => {
      if (p.id === selectedPromptId) {
        return {
          ...p,
          activeVersion: verStr,
          versions: updatedVersions,
        };
      }
      return p;
    });

    setPrompts(updatedPrompts);
    localStorage.setItem("met_ai_prompts", JSON.stringify(updatedPrompts));
    if (targetVer) {
      setFormSystemPrompt(targetVer.systemPrompt);
    }
    alert(`Version ${verStr} is now set as the active prompt template.`);
  };

  // Create template submit
  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptId.trim() || !newPromptTitle.trim()) {
      alert("Please provide ID and Title");
      return;
    }

    if (prompts.some((p) => p.id === newPromptId)) {
      alert("A prompt template with this ID already exists.");
      return;
    }

    const newTemplate: PromptTemplate = {
      id: newPromptId.toLowerCase().replace(/\s+/g, "-"),
      title: newPromptTitle,
      category: newPromptCategory,
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1000,
      description: newPromptDesc,
      activeVersion: "v1.0",
      versions: [
        {
          version: "v1.0",
          updatedAt: new Date().toISOString(),
          updatedBy: "Super Admin",
          systemPrompt: `You are an AI assistant configured for ${newPromptTitle}. Respond to the traveler's queries professionally.`,
          isActive: true,
          changeLog: "Initial template provisioning"
        }
      ]
    };

    const updated = [...prompts, newTemplate];
    setPrompts(updated);
    localStorage.setItem("met_ai_prompts", JSON.stringify(updated));
    setSelectedPromptId(newTemplate.id);
    setShowCreateModal(false);
    setNewPromptId("");
    setNewPromptTitle("");
    setNewPromptDesc("");
  };

  // Simulate generation (Fake AI call)
  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulatedResponse("");

    setTimeout(() => {
      let output = "";
      if (selectedPromptId === "trip-planner-core") {
        output = `### MakeEasyTrip AI Core Response [Simulated gpt-4o]
        
**TRIP OVERVIEW:**
* Destination: Jaipur, Rajasthan
* Duration: 4 Days / 3 Nights
* Travel Style: Family, Budget-focused
* Estimated Total Cost: ₹24,500 (approx. $295 USD) for 4 people

**DAILY ITINERARY:**
* **Day 1: Arrival & Forts Vibe**
  - Morning: Arrive in Jaipur. Check into the budget-friendly *Nahargarh Haveli* hotel.
  - Afternoon: Head to Amer Fort. Rent an audio guide. Take spectacular photos.
  - Evening: Dinner at *Chokhi Dhani* for authentic Rajasthani cultural performance and food buffet (cost-effective package booking available on MakeEasyTrip).
* **Day 2: City Highlights & Shopping**
  - Morning: Visit Hawa Mahal early for the best lighting. Head to Jantar Mantar.
  - Afternoon: Browse Johari Bazaar and Bapu Bazaar for textiles, mojari shoes, and handicrafts. Use your negotiating skills!
  - Evening: Rest at Central Park and watch the Musical Fountain show.
* **Day 3: Palace & Lake Views**
  - Morning: Visit City Palace. Enter the museum.
  - Afternoon: Take pictures of Jal Mahal (Lake Palace) from the promenade.
  - Evening: Traditional puppet show at Jawahar Kala Kendra.
* **Day 4: Departure & Fort View Cafe**
  - Morning: Climb up to Nahargarh Fort for a breathtaking panoramic view of the Pink City.
  - Afternoon: Souvenir shopping. Board train/flight.

**ACCOMMODATION RECOMMENDATIONS (Book via MakeEasyTrip for 15% off):**
1. *Nahargarh Haveli* (Budget: ₹2,200/night) - Clean rooms, central location.
2. *Umaid Bhawan Hotel* (Mid-range: ₹4,500/night) - Heritage feel, pool.
3. *The Lalit Jaipur* (Luxury: ₹11,000/night) - High-end comforts.`;
      } else if (selectedPromptId === "support-agent-bot") {
        if (sandboxUserInput.toLowerCase().includes("refund") || sandboxUserInput.toLowerCase().includes("money")) {
          output = `**Support Agent Response [Simulated gpt-3.5-turbo]**
          
Hello, and thank you for reaching out to MakeEasyTrip Support! I understand you are asking about the status of your refund. 

Our standard policy is that refund claims take between 5 to 7 business days to process and reflect in your bank account, depending on your bank's clearance cycles. 

If this refund request has been pending for longer than 7 business days, please provide me with your booking Reference ID so I can look up the transaction logs immediately. We are here to help!`;
        } else {
          output = `**Support Agent Response [Simulated gpt-3.5-turbo]**
          
Thank you for contacting MakeEasyTrip Support! I am happy to assist you today. 

Regarding your question: "${sandboxUserInput}"
To manage your booking options:
1. Log in to your MakeEasyTrip dashboard.
2. Click on the 'My Bookings' tab.
3. Click 'Manage' next to the itinerary you wish to change.

Please let me know if you require further assistance or need me to call you back.`;
        }
      } else {
        output = `### Simulated Output [Model: ${formModel}]

Based on the prompt rules of "${formTitle}", the AI processed the user input: "${sandboxUserInput}"
Temperature set to: ${formTemperature}

Result:
Recommendation: Hotel Rajasthan Palace (Jaipur, India)
- Neighborhood: Narain Singh Circle, central and historical area.
- Standing: Heritage building with classic courtyard, free Wi-Fi, and hot water.
- Night rate: Approx. ₹2,800 per night. Fits budget goals.`;
      }
      setSimulatedResponse(output);
      setIsSimulating(false);
    }, 1500);
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [prompts, searchQuery, categoryFilter]);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary font-heading">AI Prompt Engineering</h2>
          <p className="text-sm text-text-muted">
            Configure system rules, default parameters, and simulate response engines.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> New Prompt Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Navigation / Prompts List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-primary">Prompt Index</h3>
            
            {/* Search and Filters */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <i className="fa-solid fa-search text-xs"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-8 pr-4 py-2 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary font-bold text-primary"
              >
                <option value="">All Categories</option>
                <option value="Planner">Planner</option>
                <option value="Support">Support</option>
                <option value="Recommendation">Recommendation</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Prompt Cards */}
          <div className="flex flex-col gap-3">
            {filteredPrompts.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-6 text-center text-xs text-text-muted">
                No templates match filter.
              </div>
            ) : (
              filteredPrompts.map((p) => {
                const isActive = p.id === selectedPromptId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPromptId(p.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all shadow-sm ${
                      isActive
                        ? "bg-[#0A225C]/5 border-primary border-2 animate-none"
                        : "bg-white border-border hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-primary border border-slate-200">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted font-bold">
                        {p.activeVersion}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-primary mb-1">{p.title}</h4>
                    <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-text-muted border-t border-slate-100 pt-2">
                      <span>Model: {p.model}</span>
                      <span>Temp: {p.temperature}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Tabbed editor / history / simulation */}
        <div className="lg:col-span-8">
          {selectedPrompt ? (
            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-border bg-slate-50 px-6 pt-4">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "edit"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-primary"
                  }`}
                >
                  <i className="fa-solid fa-code"></i> Edit Template
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "history"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-primary"
                  }`}
                >
                  <i className="fa-solid fa-history"></i> Version History ({selectedPrompt.versions.length})
                </button>
                <button
                  onClick={() => setActiveTab("simulate")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "simulate"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-primary"
                  }`}
                >
                  <i className="fa-solid fa-flask"></i> Sandbox Simulator
                </button>
              </div>

              <div className="p-6">
                {/* 1. EDIT TAB */}
                {activeTab === "edit" && (
                  <form onSubmit={handleSavePrompt} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-primary mb-1.5">
                          Template Title
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-primary mb-1.5">
                          LLM Deployment Model
                        </label>
                        <select
                          value={formModel}
                          onChange={(e) => setFormModel(e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                        >
                          <option value="gpt-4o">gpt-4o (High Accuracy)</option>
                          <option value="gpt-4o-mini">gpt-4o-mini (Cost-Effective)</option>
                          <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy Support)</option>
                          <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-primary mb-1.5">
                        Description / Purpose
                      </label>
                      <input
                        type="text"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-text-main font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-primary mb-1.5">
                          Temperature ({formTemperature})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1.5"
                          step="0.1"
                          value={formTemperature}
                          onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary animate-none"
                        />
                        <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
                          <span>0.0 (Precise)</span>
                          <span>1.5 (Creative)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-primary mb-1.5">
                          Max Response Tokens
                        </label>
                        <input
                          type="number"
                          value={formMaxTokens}
                          onChange={(e) => setFormMaxTokens(parseInt(e.target.value, 10))}
                          className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-primary mb-1.5">
                          Category
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as PromptTemplate["category"])}
                          className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                        >
                          <option value="Planner">Planner</option>
                          <option value="Support">Support</option>
                          <option value="Recommendation">Recommendation</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-primary mb-1.5 flex justify-between">
                        <span>System Instructions / Prompt Core</span>
                        <span className="text-text-muted font-mono text-[10px]">
                          {formSystemPrompt.length} chars
                        </span>
                      </label>
                      <textarea
                        rows={12}
                        value={formSystemPrompt}
                        onChange={(e) => setFormSystemPrompt(e.target.value)}
                        className="w-full border border-border rounded-lg p-3 text-xs font-mono outline-none focus:border-primary leading-relaxed"
                        placeholder="Enter system prompt guidelines..."
                        required
                      />
                    </div>

                    <div className="bg-slate-50 p-4 border border-border rounded-xl">
                      <label className="block text-[11px] font-bold text-primary mb-1">
                        Deployment Changelog (Required to deploy update)
                      </label>
                      <input
                        type="text"
                        value={formChangeLog}
                        onChange={(e) => setFormChangeLog(e.target.value)}
                        placeholder="e.g. Fixed refund conditions in prompt rules"
                        className="w-full border border-border bg-white rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const activeVer = selectedPrompt.versions.find((v) => v.isActive) || selectedPrompt.versions[0];
                          setFormSystemPrompt(activeVer.systemPrompt);
                          setFormTitle(selectedPrompt.title);
                          setFormDescription(selectedPrompt.description);
                          setFormModel(selectedPrompt.model);
                          setFormTemperature(selectedPrompt.temperature);
                          setFormMaxTokens(selectedPrompt.maxTokens);
                          setFormChangeLog("");
                        }}
                        className="btn-light px-4 py-2 text-xs"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-900 transition"
                      >
                        Publish &amp; Save Version
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. HISTORY TAB */}
                {activeTab === "history" && (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-primary mb-2">Version Change History</h4>
                    <div className="space-y-4">
                      {selectedPrompt.versions.map((v) => (
                        <div
                          key={v.version}
                          className={`p-4 border rounded-xl relative ${
                            v.isActive ? "border-success bg-green-50/20" : "border-border bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-primary mr-2">{v.version}</span>
                              {v.isActive && (
                                <span className="bg-success/15 text-success font-bold text-[9px] px-2 py-0.5 rounded-full">
                                  Live in Production
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-mono">
                              {new Date(v.updatedAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-primary mb-2">
                            Changelog: <span className="text-text-main font-normal">{v.changeLog}</span>
                          </p>
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[10px] font-mono text-text-muted whitespace-pre-wrap max-h-32 overflow-y-auto mb-3">
                            {v.systemPrompt}
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-text-muted">Updated by: <strong className="text-primary">{v.updatedBy}</strong></span>
                            {!v.isActive && (
                              <button
                                onClick={() => handleActivateVersion(v.version)}
                                className="bg-[#0A225C] text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-900 transition"
                              >
                                Revert &amp; Activate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SIMULATE TAB */}
                {activeTab === "simulate" && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-xs flex gap-2">
                      <i className="fa-solid fa-triangle-exclamation text-sm mt-0.5"></i>
                      <div>
                        <strong>Sandbox Environment:</strong> Testing system prompts does not incur live billing charges to production accounts. Responses are generated via high-fidelity templates matching the active system configurations.
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-primary mb-1">Combined AI Request Visualizer</h4>
                      <p className="text-[10px] text-text-muted mb-2">
                        How the LLM sees the prompt compilation:
                      </p>
                      <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg max-h-36 overflow-y-auto leading-relaxed border border-slate-950">
                        <span className="text-slate-500 font-bold">// SYSTEM PROMPT</span>
                        <br />
                        {formSystemPrompt}
                        <br />
                        <br />
                        <span className="text-slate-500 font-bold">// USER INPUT</span>
                        <br />
                        {sandboxUserInput}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-primary mb-1">
                        Mock Traveler Query / Input
                      </label>
                      <textarea
                        rows={3}
                        value={sandboxUserInput}
                        onChange={(e) => setSandboxUserInput(e.target.value)}
                        className="w-full border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-text-main font-semibold"
                        placeholder="Enter test user inputs..."
                      />
                    </div>

                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="bg-secondary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2"
                      >
                        {isSimulating ? (
                          <>
                            <i className="fa-solid fa-spinner animate-spin"></i> Processing Prompt Simulation...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-play"></i> Run Sandbox Generation
                          </>
                        )}
                      </button>
                    </div>

                    {simulatedResponse && (
                      <div className="border border-border rounded-xl overflow-hidden mt-2 animate-fadeIn">
                        <div className="bg-slate-50 px-4 py-2 border-b border-border text-[11px] font-bold text-primary flex justify-between items-center">
                          <span>AI Simulated Response Output</span>
                          <span className="text-success flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Completed Successfully
                          </span>
                        </div>
                        <div className="p-4 bg-white text-xs text-text-main font-semibold whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                          {simulatedResponse}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl p-12 text-center text-text-muted shadow-sm">
              Please select a prompt template from the left index list.
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE TEMPLATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-2xl overflow-hidden">
            <div className="bg-[#0A225C] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Add New Prompt Template</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreatePrompt} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Unique Identifier / Key
                </label>
                <input
                  type="text"
                  value={newPromptId}
                  onChange={(e) => setNewPromptId(e.target.value)}
                  placeholder="e.g. flight-recommendation-engine"
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Template Name / Title
                </label>
                <input
                  type="text"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  placeholder="e.g. Flight Recommendation Expert"
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Category
                </label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => setNewPromptCategory(e.target.value as PromptTemplate["category"])}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="Planner">Planner</option>
                  <option value="Support">Support</option>
                  <option value="Recommendation">Recommendation</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newPromptDesc}
                  onChange={(e) => setNewPromptDesc(e.target.value)}
                  placeholder="Describe where and when this system prompt is called..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-light px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-900 transition"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
