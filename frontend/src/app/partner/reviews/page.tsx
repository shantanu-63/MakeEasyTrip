"use client";

import React, { useState, useMemo, useEffect } from "react";
import PartnerLayout from "@/components/partner/PartnerLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface ReviewItem {
  id: string;
  propertyName: string;
  reviewerName: string;
  rating: number;
  date: string;
  comment: string;
  reply?: string;
  flagged?: boolean;
}

export default function PartnerReviewsPage() {
  const router = useRouter();
  const { properties, activePartner, addLog } = useData();

  const partnerId = activePartner?.id || "partner-1";

  // Filter properties belonging to this partner
  const partnerProps = useMemo(() => {
    return properties.filter((p) => p.partnerId === partnerId || !p.partnerId);
  }, [properties, partnerId]);

  // Load reviews from local storage or seed defaults
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const key = `met_partner_reviews_${partnerId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      // Seed nice reviews for partner properties
      const seedReviews: ReviewItem[] = [
        {
          id: "REV-101",
          propertyName: partnerProps[0]?.title || "Sunset Villa Resort",
          reviewerName: "Amit Sharma",
          rating: 5,
          date: "2026-06-21",
          comment: "Superb location and neat suites. The private swimming pool was extremely clean.",
        },
        {
          id: "REV-102",
          propertyName: partnerProps[0]?.title || "Sunset Villa Resort",
          reviewerName: "Jessica Doe",
          rating: 4,
          date: "2026-06-18",
          comment: "Comfortable rooms and helpful staff. Breakfast spreads could be improved.",
          reply: "Thank you for the review, Jessica! We have passed your comments to our chefs.",
        },
        {
          id: "REV-103",
          propertyName: partnerProps[1]?.title || "Heritage Palace Hotel",
          reviewerName: "Rohan Varma",
          rating: 2,
          date: "2026-06-12",
          comment: "AC was not cooling properly in room 203. Staff was slow to resolve this.",
        },
      ];
      localStorage.setItem(key, JSON.stringify(seedReviews));
      setReviews(seedReviews);
    }
  }, [partnerId, partnerProps]);

  // Save reviews helper
  const saveReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    localStorage.setItem(`met_partner_reviews_${partnerId}`, JSON.stringify(updated));
  };

  // Star Distribution
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 5|4|3|2|1;
      counts[rating] += 1;
    });
    return counts;
  }, [reviews]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewId || !replyText.trim()) return;

    const updated = reviews.map((r) => {
      if (r.id === selectedReviewId) {
        return { ...r, reply: replyText };
      }
      return r;
    });

    saveReviews(updated);
    setReplyText("");
    setSelectedReviewId(null);
    addLog(`REVIEWS_HUB: Replied to review ${selectedReviewId}`);
    alert("Reply saved successfully.");
  };

  const handleToggleFlag = (id: string) => {
    const updated = reviews.map((r) => {
      if (r.id === id) {
        const flagged = !r.flagged;
        addLog(`REVIEWS_HUB: ${flagged ? "Flagged" : "Unflagged"} review ${id}`);
        return { ...r, flagged };
      }
      return r;
    });
    saveReviews(updated);
    alert("Review flagged status updated. Platform admins will review the content.");
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
      title="Guest Reviews & Ratings"
      subtitle="Moderated comments, customer feedback sentiment analysis, and quick replies."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Star Rating Distribution Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4 font-sans">Ratings Overview</h3>
            <div className="text-center py-4 border-b border-border/60">
              <span className="text-4xl font-extrabold text-secondary">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-text-muted block mt-1">★ Average Rating</span>
              <span className="text-[10px] text-text-muted mt-1 block">Based on {reviews.length} reviews</span>
            </div>

            {/* Distribution Graph using standard Tailwind/CSS */}
            <div className="flex flex-col gap-3 mt-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars as 5|4|3|2|1] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-bold text-text-main">{stars} Star</span>
                    <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-text-muted text-right font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Modal Drawer or Card */}
          {selectedReviewId && (
            <div className="bg-white p-6 border border-secondary rounded-lg shadow-md">
              <h3 className="text-sm font-extrabold text-primary mb-3">
                Reply to Review ({selectedReviewId})
              </h3>
              <form onSubmit={handleReplySubmit} className="flex flex-col gap-3">
                <textarea
                  required
                  placeholder="Draft your reply to the guest..."
                  rows={4}
                  className="border border-border p-2 rounded text-xs outline-none focus:border-secondary"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-between items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReviewId(null);
                      setReplyText("");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-text-main text-[11px] font-bold px-3 py-1.5 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-secondary hover:bg-secondary-light text-white text-[11px] font-bold px-4 py-1.5 rounded"
                  >
                    Submit Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right column: Reviews List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-extrabold text-primary mb-4">Reviews & Feedbacks List</h3>
            <div className="flex flex-col gap-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-6">
                  No guest reviews posted yet.
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 border border-border rounded-lg text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-bold text-primary">{r.reviewerName}</span>
                        <span className="text-[10px] text-text-muted ml-2">on {r.propertyName}</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs">{"★".repeat(r.rating)}</span>
                    </div>

                    <div className="text-[10px] text-text-muted">{r.date}</div>
                    <p className="text-text-main font-semibold mt-1">{r.comment}</p>

                    {r.reply && (
                      <div className="p-3 bg-white border-l-2 border-secondary rounded text-text-main mt-2">
                        <span className="text-[10px] text-secondary font-bold block mb-1">
                          Your response:
                        </span>
                        {r.reply}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/40">
                      <button
                        onClick={() => {
                          setSelectedReviewId(r.id);
                          setReplyText(r.reply || "");
                        }}
                        className="text-[10px] text-secondary font-bold hover:underline"
                      >
                        <i className="fa-solid fa-reply mr-1"></i> {r.reply ? "Edit Reply" : "Reply"}
                      </button>
                      <button
                        onClick={() => handleToggleFlag(r.id)}
                        className={`text-[10px] font-bold hover:underline ${
                          r.flagged ? "text-red-600 font-bold" : "text-text-muted"
                        }`}
                      >
                        <i className="fa-solid fa-flag mr-1"></i> {r.flagged ? "Flagged Inappropriate" : "Flag"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}
