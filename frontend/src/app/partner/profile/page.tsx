"use client";

import React, { useState, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function PartnerProfilePage() {
  const router = useRouter();
  const { activePartner, loginPartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Form states loaded from localstorage session
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("Goa");

  // Bank Info states
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (activePartner) {
      setBusinessName(activePartner.businessName || "Indo-Global Travel DMC Ltd");
      setOwnerName(activePartner.ownerName || "Rajesh Kumar");
      setEmail(activePartner.email || "partner@makeeasytrip.com");
      setMobileNumber(activePartner.mobileNumber || "+91 98765 43210");
      setBusinessAddress(activePartner.businessAddress || "101 Beach View Road, Calangute");
      setCity(activePartner.city || "Goa");
      setBankName(activePartner.bankName || "State Bank of India");
      setBankAccountNumber(activePartner.bankAccountNumber || "XXXX-XXXX-8821");
      setBankIfsc(activePartner.bankIfsc || "SBIN0001024");
    } else {
      // Load from local storage
      const stored = localStorage.getItem("met_partner_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        setBusinessName(parsed.businessName);
        setOwnerName(parsed.ownerName);
        setEmail(parsed.email);
        setMobileNumber(parsed.mobileNumber || "+91 98765 43210");
        setBusinessAddress(parsed.businessAddress || "101 Beach View Road, Calangute");
        setCity(parsed.city || "Goa");
        setBankName(parsed.bankName || "State Bank of India");
        setBankAccountNumber(parsed.bankAccountNumber || "XXXX-XXXX-8821");
        setBankIfsc(parsed.bankIfsc || "SBIN0001024");
      }
    }
  }, [activePartner]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !email) return;

    const updatedSession = {
      ...activePartner,
      id: partnerId,
      businessName,
      ownerName,
      email,
      mobileNumber,
      businessAddress,
      city,
    };

    loginPartner(updatedSession);
    addLog(`PARTNER_HUB: Updated profile settings for partner business: ${businessName}`);
    alert("Profile settings updated successfully.");
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankAccountNumber || !bankIfsc) return;

    const updatedSession = {
      ...activePartner,
      id: partnerId,
      bankName,
      bankAccountNumber,
      bankIfsc,
    };

    loginPartner(updatedSession);
    addLog(`PARTNER_HUB: Updated banking settlement credentials for: ${businessName}`);
    alert("Bank settlement details updated successfully.");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setOldPassword("");
    setNewPassword("");
    addLog(`PARTNER_HUB: Changed account password for partner email: ${email}`);
    alert("Account password changed successfully.");
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
      title="Merchant Profile Editor"
      subtitle="Edit hospitality contact info, registered payout bank accounts, and credentials."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Merchant business info details */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Corporate Business Settings</h3>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Business Name</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Owner Name</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Contact Email</label>
                  <input
                    type="email"
                    required
                    className="border border-border p-2 rounded text-xs outline-none bg-slate-50 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Contact Phone</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Operating City</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Registered Address</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-fit px-6 py-2.5 text-xs">
                Save Profile Details
              </button>
            </form>
          </div>

          {/* Bank settlements info */}
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Payout Settlement Bank Account</h3>
            <form onSubmit={handleBankSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Bank Name</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Account Number</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">IFSC Code</label>
                  <input
                    type="text"
                    required
                    className="border border-border p-2 rounded text-xs outline-none"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-fit px-6 py-2.5 text-xs">
                Update Bank Accounts
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Credentials password changer */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 text-xs">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  className="border border-border p-2 rounded text-xs outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                Update Credentials
              </button>
            </form>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
