"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";

interface FlaggedReview {
  id: string;
  reviewerName: string;
  propertyName: string;
  rating: number;
  comment: string;
  flagReason: string;
  flaggedAt: string;
}

export default function FlaggedReviewsPage() {
  const { addLog } = useData();
  const [flaggedList, setFlaggedList] = useState<FlaggedReview[]>([]);

  useEffect(() => {
    // Load from local storage or set mock data
    const key = "met_flagged_reviews";
    const stored = localStorage.getItem(key);
    if (stored) {
      setFlaggedList(JSON.parse(stored));
    } else {
      const mockFlagged: FlaggedReview[] = [
        {
          id: "REV-103",
          reviewerName: "Rohan Varma",
          propertyName: "Heritage Palace Hotel",
          rating: 2,
          comment: "AC was not cooling properly in room 203. Staff was slow to resolve this.",
          flagReason: "Inappropriate language reported by partner owner",
          flaggedAt: "2026-06-22",
        },
        {
          id: "REV-115",
          reviewerName: "John Smith",
          propertyName: "Sunset Villa Goa",
          rating: 1,
          comment: "Worst service ever. Scam resort! Do not go here.",
          flagReason: "Suspicious negative review spam",
          flaggedAt: "2026-06-21",
        },
      ];
      localStorage.setItem(key, JSON.stringify(mockFlagged));
      setFlaggedList(mockFlagged);
    }
  }, []);

  const saveFlaggedList = (updated: FlaggedReview[]) => {
    setFlaggedList(updated);
    localStorage.setItem("met_flagged_reviews", JSON.stringify(updated));
  };

  const handleDismissFlag = (id: string) => {
    const updated = flaggedList.filter((r) => r.id !== id);
    saveFlaggedList(updated);
    addLog(`ADMIN_REVIEWS: Dismissed flag on review ${id}`);
    alert(`Success: Flag for review ${id} dismissed. Review kept on the platform.`);
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    const updated = flaggedList.filter((r) => r.id !== id);
    saveFlaggedList(updated);

    // Also update main reviews storage if it exists
    const partnerReviewsKey = "met_partner_reviews_partner-1";
    const partnerReviews = localStorage.getItem(partnerReviewsKey);
    if (partnerReviews) {
      const parsed = JSON.parse(partnerReviews);
      const filtered = parsed.filter((r: any) => r.id !== id);
      localStorage.setItem(partnerReviewsKey, JSON.stringify(filtered));
    }

    addLog(`ADMIN_REVIEWS: Permanently deleted review ${id}`);
    alert(`Success: Flagged review ${id} permanently deleted.`);
  };

  return (
    <AdminLayout
      title="Flagged Reviews Reports"
      subtitle="Moderation queue for reviews reported by travelers or travel merchants."
    >
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-extrabold text-primary mb-4">Pending Flagged Reviews Queue</h3>
        
        <div className="table-responsive">
          <table className="partner-table w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2">Review ID</th>
                <th className="pb-2">Reviewer & Property</th>
                <th className="pb-2">Comment</th>
                <th className="pb-2">Flag Reason</th>
                <th className="pb-2 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted italic font-semibold">
                    <i className="fa-solid fa-circle-check text-2xl text-emerald-500 mb-2 block"></i>
                    All reviews are compliant. Flagged queue is empty.
                  </td>
                </tr>
              ) : (
                flaggedList.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-4 font-mono font-bold text-primary">{item.id}</td>
                    <td className="py-4">
                      <div className="font-semibold text-text-main">{item.reviewerName}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{item.propertyName}</div>
                      <div className="text-orange-500 font-bold mt-1">{"★".repeat(item.rating)}</div>
                    </td>
                    <td className="py-4 text-text-main max-w-xs">{item.comment}</td>
                    <td className="py-4 text-red-500 font-semibold">{item.flagReason}</td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleDismissFlag(item.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded font-bold"
                        >
                          Dismiss Flag
                        </button>
                        <button
                          onClick={() => handleDeleteReview(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded font-bold"
                        >
                          Delete Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
