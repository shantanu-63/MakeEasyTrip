"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface APIKeyConfig {
  id: string;
  provider: "OpenAI" | "Anthropic" | "Google Gemini" | "DeepSeek";
  maskedKey: string;
  status: "Active" | "Paused" | "Depleted" | "Rate Limited";
  monthlyCap: number;
  monthlyUsed: number;
  rpmLimit: number;
  tpmLimit: number;
  lastUsed: string;
}

interface CostSettings {
  globalMonthlyBudget: number;
  currentGlobalCost: number;
  softLimitPercent: number;
  hardLimitPercent: number;
  alertEmail: string;
  autoFallbackToMocks: boolean;
  enableBillingAlerts: boolean;
}

const DEFAULT_KEYS: APIKeyConfig[] = [
  {
    id: "KEY-001",
    provider: "OpenAI",
    maskedKey: "sk-proj-••••••••••••••••W9a2",
    status: "Active",
    monthlyCap: 1500,
    monthlyUsed: 624.50,
    rpmLimit: 3500,
    tpmLimit: 80000,
    lastUsed: "2026-06-23T16:45:12Z",
  },
  {
    id: "KEY-002",
    provider: "Anthropic",
    maskedKey: "sk-ant-••••••••••••••••A9s1",
    status: "Active",
    monthlyCap: 1000,
    monthlyUsed: 215.10,
    rpmLimit: 1000,
    tpmLimit: 40000,
    lastUsed: "2026-06-23T16:42:01Z",
  },
  {
    id: "KEY-003",
    provider: "Google Gemini",
    maskedKey: "AIzaSy••••••••••••••••X7t8",
    status: "Paused",
    monthlyCap: 500,
    monthlyUsed: 495.20,
    rpmLimit: 2000,
    tpmLimit: 100000,
    lastUsed: "2026-06-20T09:12:33Z",
  },
  {
    id: "KEY-004",
    provider: "DeepSeek",
    maskedKey: "sk-ds-••••••••••••••••C2h4",
    status: "Depleted",
    monthlyCap: 200,
    monthlyUsed: 200.00,
    rpmLimit: 1500,
    tpmLimit: 60000,
    lastUsed: "2026-06-18T11:44:00Z",
  }
];

const DEFAULT_SETTINGS: CostSettings = {
  globalMonthlyBudget: 3200,
  currentGlobalCost: 1534.80,
  softLimitPercent: 70,
  hardLimitPercent: 95,
  alertEmail: "admin-billing@makeeasytrip.com",
  autoFallbackToMocks: true,
  enableBillingAlerts: true,
};

export default function CostPage() {
  const [keys, setKeys] = useState<APIKeyConfig[]>([]);
  const [settings, setSettings] = useState<CostSettings>(DEFAULT_SETTINGS);

  // Edit Key Modal State
  const [editingKey, setEditingKey] = useState<APIKeyConfig | null>(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [editCap, setEditCap] = useState(0);
  const [editRpm, setEditRpm] = useState(0);
  const [editTpm, setEditTpm] = useState(0);
  const [editStatus, setEditStatus] = useState<APIKeyConfig["status"]>("Active");

  // Create Key Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProvider, setNewProvider] = useState<APIKeyConfig["provider"]>("OpenAI");
  const [newKeyString, setNewKeyString] = useState("");
  const [newCap, setNewCap] = useState(500);

  // Load from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem("met_ai_keys");
    const savedSettings = localStorage.getItem("met_ai_cost_settings");

    if (savedKeys) {
      try { setKeys(JSON.parse(savedKeys)); } catch (e) { setKeys(DEFAULT_KEYS); }
    } else {
      localStorage.setItem("met_ai_keys", JSON.stringify(DEFAULT_KEYS));
      setKeys(DEFAULT_KEYS);
    }

    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch (e) { setSettings(DEFAULT_SETTINGS); }
    } else {
      localStorage.setItem("met_ai_cost_settings", JSON.stringify(DEFAULT_SETTINGS));
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("met_ai_cost_settings", JSON.stringify(settings));
    alert("Billing thresholds and cap parameters saved successfully!");
  };

  // Open Edit Key
  const handleOpenEdit = (k: APIKeyConfig) => {
    setEditingKey(k);
    setNewKeyValue("");
    setEditCap(k.monthlyCap);
    setEditRpm(k.rpmLimit);
    setEditTpm(k.tpmLimit);
    setEditStatus(k.status);
  };

  // Save Edit Key
  const handleSaveEditKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    const updated = keys.map((k) => {
      if (k.id === editingKey.id) {
        return {
          ...k,
          maskedKey: newKeyValue.trim()
            ? `${newKeyValue.substring(0, 7)}••••••••••••••••${newKeyValue.substring(newKeyValue.length - 4)}`
            : k.maskedKey,
          monthlyCap: editCap,
          rpmLimit: editRpm,
          tpmLimit: editTpm,
          status: editStatus,
          // If status set to Depleted, make monthlyUsed equal to monthlyCap for mock consistency
          monthlyUsed: editStatus === "Depleted" ? editCap : k.monthlyUsed > editCap ? editCap : k.monthlyUsed
        };
      }
      return k;
    });

    setKeys(updated);
    localStorage.setItem("met_ai_keys", JSON.stringify(updated));

    // Re-calculate global total cost based on the sum of all keys
    const newGlobalCost = updated.reduce((acc, current) => acc + current.monthlyUsed, 0);
    const updatedSettings = {
      ...settings,
      currentGlobalCost: parseFloat(newGlobalCost.toFixed(2))
    };
    setSettings(updatedSettings);
    localStorage.setItem("met_ai_cost_settings", JSON.stringify(updatedSettings));

    setEditingKey(null);
    alert("API Key parameters updated successfully.");
  };

  // Create Key
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyString.trim()) {
      alert("Please provide the Secret Key.");
      return;
    }

    const newKeyObj: APIKeyConfig = {
      id: `KEY-${Math.floor(100 + Math.random() * 900)}`,
      provider: newProvider,
      maskedKey: `${newKeyString.substring(0, 7)}••••••••••••••••${newKeyString.substring(newKeyString.length - 4)}`,
      status: "Active",
      monthlyCap: newCap,
      monthlyUsed: 0,
      rpmLimit: 2000,
      tpmLimit: 50000,
      lastUsed: new Date().toISOString()
    };

    const updated = [...keys, newKeyObj];
    setKeys(updated);
    localStorage.setItem("met_ai_keys", JSON.stringify(updated));
    setShowCreateModal(false);
    setNewKeyString("");
    setNewCap(500);
    alert(`Provisioned new ${newProvider} credential entry!`);
  };

  const getStatusBadge = (status: APIKeyConfig["status"]) => {
    if (status === "Active") return "badge approved";
    if (status === "Paused") return "badge warning";
    if (status === "Depleted") return "badge danger";
    return "bg-amber-100 text-amber-800 border-amber-300 font-bold px-2 py-0.5 rounded text-[10px]";
  };

  // Cost calculations
  const totalAllocatedCap = keys.reduce((acc, k) => acc + k.monthlyCap, 0);
  const costPercentage = settings.globalMonthlyBudget
    ? Math.min(Math.round((settings.currentGlobalCost / settings.globalMonthlyBudget) * 100), 100)
    : 0;

  const softLimitThreshold = Math.round((settings.softLimitPercent / 100) * settings.globalMonthlyBudget);
  const hardLimitThreshold = Math.round((settings.hardLimitPercent / 100) * settings.globalMonthlyBudget);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary font-heading">AI Cost Controls</h2>
          <p className="text-sm text-text-muted">
            Configure monthly expenditure limits, manage provider credentials, and set failover triggers.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-key"></i> Add Provider Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Global Cap Settings & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-secondary"></i> Global Budget Gauge
            </h3>

            {/* Progress Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-primary mb-1">
                <span>Month Cost Progress</span>
                <span>{costPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    costPercentage > 90
                      ? "bg-danger"
                      : costPercentage > 70
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                  style={{ width: `${costPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-2 font-semibold">
                <span>Used: ${settings.currentGlobalCost.toFixed(2)}</span>
                <span>Budget Limit: ${settings.globalMonthlyBudget.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick stats list */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-text-muted">Total Keys Allocated:</span>
                <span className="text-primary font-bold">${totalAllocatedCap}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-text-muted">Soft Notify Trigger:</span>
                <span className="text-primary font-bold">
                  {settings.softLimitPercent}% (${softLimitThreshold})
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-text-muted">Hard Block Trigger:</span>
                <span className="text-primary font-bold">
                  {settings.hardLimitPercent}% (${hardLimitThreshold})
                </span>
              </div>
            </div>
          </div>

          {/* Form edit global cost settings */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4">Budget Threshold Control</h3>
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Global Monthly Budget Limit (USD)
                </label>
                <input
                  type="number"
                  value={settings.globalMonthlyBudget}
                  onChange={(e) => setSettings({ ...settings, globalMonthlyBudget: parseInt(e.target.value, 10) })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    Soft Alert (%)
                  </label>
                  <input
                    type="number"
                    value={settings.softLimitPercent}
                    onChange={(e) => setSettings({ ...settings, softLimitPercent: parseInt(e.target.value, 10) })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                    max="90"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    Hard Cutoff (%)
                  </label>
                  <input
                    type="number"
                    value={settings.hardLimitPercent}
                    onChange={(e) => setSettings({ ...settings, hardLimitPercent: parseInt(e.target.value, 10) })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Alert Recipient Email Address
                </label>
                <input
                  type="email"
                  value={settings.alertEmail}
                  onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-semibold text-text-main"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableBillingAlerts}
                    onChange={(e) => setSettings({ ...settings, enableBillingAlerts: e.target.checked })}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Send email alerts on trigger</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoFallbackToMocks}
                    onChange={(e) => setSettings({ ...settings, autoFallbackToMocks: e.target.checked })}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Auto-fallback to offline models</span>
                </label>
              </div>

              <button
                type="submit"
                className="bg-primary text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-900 transition mt-2"
              >
                Apply Cost Thresholds
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Key Management Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-1">Active Credentials &amp; Rate Limits</h3>
            <p className="text-[11px] text-text-muted mb-6">
              Toggle specific provider tokens, check current usage billing against individual limits.
            </p>

            <div className="table-responsive">
              <table className="partner-table" id="keys-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Key Preview</th>
                    <th style={{ textAlign: "right" }}>Usage / Cap</th>
                    <th>Rate Limit</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => {
                    const usagePercent = k.monthlyCap ? Math.min(Math.round((k.monthlyUsed / k.monthlyCap) * 100), 100) : 0;
                    return (
                      <tr key={k.id} className="admin-table-row text-xs">
                        <td className="font-bold text-primary flex items-center gap-2 py-3.5">
                          <i className={`fa-solid ${
                            k.provider === "OpenAI" ? "fa-brain text-purple-600" :
                            k.provider === "Anthropic" ? "fa-robot text-orange-500" :
                            k.provider === "Google Gemini" ? "fa-wand-magic-sparkles text-blue-500" : "fa-server text-teal-600"
                          }`}></i>
                          {k.provider}
                        </td>
                        <td className="font-mono text-text-muted text-[10px]">{k.maskedKey}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className="font-bold text-primary">${k.monthlyUsed.toFixed(2)}</span>
                          <span className="text-[10px] text-text-muted"> / ${k.monthlyCap}</span>
                          <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 ml-auto overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${usagePercent}%` }}></div>
                          </div>
                        </td>
                        <td className="text-text-muted text-[10px] font-mono leading-tight">
                          {k.rpmLimit.toLocaleString()} RPM <br />
                          {k.tpmLimit.toLocaleString()} TPM
                        </td>
                        <td>
                          <span className={getStatusBadge(k.status)}>
                            {k.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleOpenEdit(k)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-primary font-bold px-3 py-1 rounded text-[11px]"
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- CREATE KEY MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-[#0A225C] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Add Provider Key</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateKey} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Provider Brand
                </label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value as APIKeyConfig["provider"])}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="OpenAI">OpenAI (ChatGPT)</option>
                  <option value="Anthropic">Anthropic (Claude)</option>
                  <option value="Google Gemini">Google Gemini</option>
                  <option value="DeepSeek">DeepSeek</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Secret API Key
                </label>
                <input
                  type="password"
                  value={newKeyString}
                  onChange={(e) => setNewKeyString(e.target.value)}
                  placeholder="e.g. sk-proj-aB1c..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Monthly Dollar Cap ($)
                </label>
                <input
                  type="number"
                  value={newCap}
                  onChange={(e) => setNewCap(parseInt(e.target.value, 10))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
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
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT KEY SETTINGS MODAL --- */}
      {editingKey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-[#0A225C] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Configure Key: {editingKey.provider}</h3>
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEditKey} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-primary mb-1">
                  Rotate API Secret (Leave blank to retain current key)
                </label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Paste new secret key..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    Monthly Dollar Cap ($)
                  </label>
                  <input
                    type="number"
                    value={editCap}
                    onChange={(e) => setEditCap(parseInt(e.target.value, 10))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    Operation Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as APIKeyConfig["status"])}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused (Inactive)</option>
                    <option value="Depleted">Depleted (Locked)</option>
                    <option value="Rate Limited">Rate Limited</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    RPM Limit
                  </label>
                  <input
                    type="number"
                    value={editRpm}
                    onChange={(e) => setEditRpm(parseInt(e.target.value, 10))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-primary mb-1">
                    TPM Limit
                  </label>
                  <input
                    type="number"
                    value={editTpm}
                    onChange={(e) => setEditTpm(parseInt(e.target.value, 10))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 font-bold">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="btn-light px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-5 py-2 rounded-xl text-xs hover:bg-blue-900 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
