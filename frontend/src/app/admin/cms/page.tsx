"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function AdminCMSPage() {
  const router = useRouter();
  const { banners, syncBanners, activeAdmin, addLog } = useData();

  const [showAddBanner, setShowAddBanner] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newType, setNewType] = useState("Seasonal Banner");
  const [newCtaLink, setNewCtaLink] = useState("/customer/hotels");

  // Verification guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_admin_session");
      if (!stored && !activeAdmin) {
        router.push("/admin/login");
      }
    }
  }, [activeAdmin, router]);

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubtitle.trim()) return;

    const newBanner = {
      id: "BAN-" + Math.floor(Math.random() * 900 + 100),
      title: newTitle,
      subtitle: newSubtitle,
      ctaText: "Explore Now",
      ctaLink: newCtaLink,
      imageUrl: newImageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      displayOrder: banners.length + 1,
      type: newType,
      status: "Published",
      scheduledStartDate: new Date().toISOString().split("T")[0],
      scheduledEndDate: "2026-12-31",
    };

    const updated = [...banners, newBanner];
    syncBanners(updated);

    addLog(`ADMIN_CONTROL: Created new homepage banner: '${newTitle}'`);
    alert(`Success! Created banner campaign '${newTitle}'`);

    // Reset Form
    setNewTitle("");
    setNewSubtitle("");
    setNewImageUrl("");
    setNewCtaLink("/customer/hotels");
    setShowAddBanner(false);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Published" ? "Archived" : "Published";
    const updated = banners.map((b) => {
      if (b.id === id) {
        return { ...b, status: nextStatus };
      }
      return b;
    });
    syncBanners(updated);
    addLog(`ADMIN_CONTROL: Toggled status of banner ${id} to: ${nextStatus}`);
  };

  return (
    <AdminLayout
      title="Content Management Hub"
      subtitle="Configure homepage carousels, active campaign offers, discounts, and landing deals."
      actionButton={
        <button
          onClick={() => setShowAddBanner(true)}
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "13px" }}
        >
          <i className="fa-solid fa-plus mr-1"></i> Add Banner Campaign
        </button>
      }
    >
      <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
        <h3 className="text-base font-extrabold text-primary mb-4">
          Hero Slides & Active Promotions ({banners.length} campaigns)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((item) => (
            <div
              key={item.id}
              className="banner-config-card border border-border rounded-lg overflow-hidden flex bg-slate-50"
            >
              <div className="w-32 h-32 flex-shrink-0 bg-slate-200">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between text-xs">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                      {item.type}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted">ID: {item.id}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-primary mt-2">{item.title}</h4>
                  <p className="text-text-muted mt-1 leading-snug line-clamp-2">{item.subtitle}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border/60">
                  <span
                    className={`font-bold ${
                      item.status === "Published" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    • {item.status}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="text-secondary font-bold hover:underline"
                  >
                    {item.status === "Published" ? "Archive" : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Banner Modal Dialog */}
      {showAddBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-border max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-primary">Create Banner Campaign</h3>
              <button
                className="text-text-muted hover:text-primary text-xl"
                onClick={() => setShowAddBanner(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBanner} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dreamy Overwater Villas in Maldives"
                  className="border border-border p-2.5 rounded text-xs outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Subtitle & Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save flat 15% on water suites. CODE: MALDIVES15"
                  className="border border-border p-2.5 rounded text-xs outline-none"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Campaign Type</label>
                <select
                  className="border border-border p-2 rounded text-xs outline-none bg-white text-text-main"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="Seasonal Banner">Seasonal Banner</option>
                  <option value="Cultural Tour">Cultural Tour</option>
                  <option value="Adventure Deal">Adventure Deal</option>
                  <option value="Luxury Deal">Luxury Deal</option>
                </select>
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Image URL (Unsplash Link)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/photo-1507525428034..."
                  className="border border-border p-2.5 rounded text-xs outline-none"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">CTA Navigation Link</label>
                <input
                  type="text"
                  className="border border-border p-2.5 rounded text-xs outline-none"
                  value={newCtaLink}
                  onChange={(e) => setNewCtaLink(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs font-bold mt-2">
                Launch Campaign slide
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
