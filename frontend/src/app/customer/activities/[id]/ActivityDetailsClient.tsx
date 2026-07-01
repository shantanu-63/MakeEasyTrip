"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ActivityDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { properties, activeUser, syncProperties, bookings, syncBookings, addLog } = useData();

  // Track whether initial data load has completed
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Once properties have been populated (either from API or localStorage), mark as loaded
    if (properties.length > 0) {
      setDataLoaded(true);
    }
  }, [properties]);

  // Also handle case where data loads but there are genuinely no activities
  useEffect(() => {
    // Give it a max 3s to load before showing not-found
    const timer = setTimeout(() => setDataLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const activity = useMemo(() => {
    return properties.find((p) => p.id === id && p.type === "activity");
  }, [properties, id]);

  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Booking details
  const [preferredDate, setPreferredDate] = useState("2026-06-12");
  const [participantsCount, setParticipantsCount] = useState(2);

  useEffect(() => {
    if (!activity) return;
    if (activeUser) {
      const users = JSON.parse(localStorage.getItem("met_users") || "[]");
      const u = users.find((item: any) => item.id === activeUser.id);
      if (u && u.wishlist) {
        setIsSaved(u.wishlist.includes(activity.id));
      }
    }
  }, [activity, activeUser]);

  // Show skeleton while data is loading
  if (!dataLoaded && !activity) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div className="skeleton" style={{ width: "120px", height: "16px", borderRadius: "6px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "280px", height: "32px", borderRadius: "8px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ width: "180px", height: "14px", borderRadius: "6px" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "32px", height: "320px" }}>
          <div className="skeleton" style={{ borderRadius: "12px", height: "100%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="skeleton" style={{ borderRadius: "12px", flex: 1 }} />
            <div className="skeleton" style={{ borderRadius: "12px", flex: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🧭</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "12px" }}>Activity Not Found</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", maxWidth: "400px", marginBottom: "28px", lineHeight: 1.6 }}>
          We couldn&apos;t find the activity you&apos;re looking for. It may have been removed or the link is incorrect.
        </p>
        <Link href="/customer/activities" style={{ backgroundColor: "var(--color-secondary)", color: "#fff", padding: "10px 28px", borderRadius: "999px", fontWeight: 700, fontSize: "14px" }}>
          Browse Activities
        </Link>
      </div>
    );
  }

  const relatedTours = properties
    .filter(
      (p) =>
        p.status === "Approved" &&
        p.type === "activity" &&
        p.city.toLowerCase() === activity.city.toLowerCase() &&
        p.id !== activity.id
    )
    .slice(0, 3);

  const toggleSaveActivity = () => {
    if (!activeUser) {
      alert("Please sign in to save activities.");
      router.push("/customer/auth");
      return;
    }
    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    const idx = users.findIndex((item: any) => item.id === activeUser.id);
    if (idx !== -1) {
      let wishlist = users[idx].wishlist || [];
      if (wishlist.includes(activity.id)) {
        wishlist = wishlist.filter((item: any) => item !== activity.id);
        setIsSaved(false);
        addLog(`WISHLIST: Removed experience ${activity.title} from wishlist`);
      } else {
        wishlist.push(activity.id);
        setIsSaved(true);
        addLog(`WISHLIST: Added experience ${activity.title} to wishlist`);
      }
      users[idx].wishlist = wishlist;
      localStorage.setItem("met_users", JSON.stringify(users));
    }
  };

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) return;
    const authorName = activeUser ? activeUser.fullName : "Anonymous traveler";
    const newReview = {
      author: authorName,
      rating: reviewRating,
      date: new Date().toISOString().split("T")[0],
      text: reviewText,
    };

    const updatedProperties = properties.map((p) => {
      if (p.id === activity.id) {
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = parseFloat((totalRating / updatedReviews.length).toFixed(1));
        return {
          ...p,
          reviews: updatedReviews,
          rating: avg,
          ratingCount: updatedReviews.length,
        };
      }
      return p;
    });

    syncProperties(updatedProperties);
    setReviewText("");
    addLog(`REVIEW: Submitted review for activity ${activity.title}`);
  };

  const handleBookNow = () => {
    if (!activeUser) {
      alert("Please sign in to proceed with booking.");
      router.push("/customer/auth");
      return;
    }

    const totalCost = activity.price * participantsCount;

    const newBooking = {
      id: "MET-" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000),
      userId: activeUser.id,
      propertyId: activity.id,
      propertyName: activity.title,
      type: "activity",
      customerName: activeUser.fullName,
      customerEmail: activeUser.email,
      customerPhone: activeUser.phone || "+91 98765 43210",
      checkin: preferredDate,
      participantCount: participantsCount,
      pricePaid: totalCost,
      status: "Confirmed",
      paymentStatus: "Paid",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedBookings = [newBooking, ...bookings];
    syncBookings(updatedBookings);

    addLog(`BOOKING: Instantly booked activity ${activity.title} for ${participantsCount} guests: ₹${totalCost}`);
    alert(`Success! Booked ${activity.title} for ${participantsCount} guests. Paid: ₹${totalCost.toLocaleString("en-IN")}`);
    router.push("/customer/dashboard");
  };

  return (
    <section id="traveler-activity-details-view" className="traveler-subview block">
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/customer/activities" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-secondary)" }}>
            <i className="fa-solid fa-chevron-left"></i> Back to Activities
          </Link>
          <button
            className={`btn-secondary flex items-center gap-1.5 ${isSaved ? "active" : ""}`}
            onClick={toggleSaveActivity}
            style={{ padding: "6px 16px", fontSize: "12px" }}
          >
            <i className={`${isSaved ? "fa-solid text-red-500" : "fa-regular"} fa-heart`}></i>
            {isSaved ? "Saved" : "Save Experience"}
          </button>
        </div>

        {/* Title Header */}
        <div style={{ marginBottom: "28px" }}>
          <span className="listing-category" style={{ color: "var(--color-secondary)", fontWeight: 800, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            🛶 OUTDOOR EXPERIENCE
          </span>
          <h1 id="activity-details-title" className="text-3xl font-extrabold text-primary mt-1">
            {activity.title}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }} id="activity-details-location">
            <i className="fa-solid fa-map-pin mr-1"></i> {activity.location}, {activity.city}
          </p>
        </div>

        {/* Gallery Collage */}
        <div className="hotel-gallery-collage grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gallery-large-frame md:col-span-2 h-80 rounded overflow-hidden">
            <img id="activity-gallery-large" src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
          </div>
          <div className="gallery-side-frames flex flex-col gap-4 h-80">
            <div className="gallery-side-frame h-1/2 rounded overflow-hidden">
              <img
                id="activity-gallery-side-1"
                src={activity.gallery?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80"}
                alt="Gallery 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="gallery-side-frame h-1/2 rounded overflow-hidden">
              <img
                id="activity-gallery-side-2"
                src={activity.gallery?.[1] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80"}
                alt="Gallery 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="hotel-details-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 text-primary flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-secondary"></i> Overview
              </h3>
              <p id="activity-details-description" className="text-xs text-text-main leading-relaxed">
                {activity.description}
              </p>
            </div>

            {/* Schedule & Inclusions */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-4 text-primary flex items-center gap-2">
                <i className="fa-solid fa-list-check text-secondary"></i> Included Services & Schedule
              </h3>
              <div className="amenities-grid-details grid grid-cols-2 sm:grid-cols-4 gap-4" id="activity-details-inclusions">
                {activity.amenities?.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-border rounded p-3 text-center text-xs font-semibold text-primary flex flex-col items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-circle-check text-lg text-secondary"></i>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Requirements */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 text-primary flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-secondary"></i> Tour Requirements
              </h3>
              <ul className="filter-list flex flex-col gap-2 pl-5 list-disc text-xs text-text-main" id="activity-details-requirements">
                <li>All participants must be comfortable in shallow water environments.</li>
                <li>Safety gear (helmet, PADI certified vest) will be provided at base camps.</li>
                <li>Minimum age limitation: 10 years and above.</li>
              </ul>
            </div>

            {/* Reviews Section */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg shadow-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
                  <i className="fa-solid fa-comments text-secondary"></i> Tour Reviews
                </h3>
                <span id="activity-details-reviews-count" className="text-xs font-bold text-text-muted">
                  {activity.reviews?.length || 0} Reviews
                </span>
              </div>

              {/* Submit review */}
              <div className="add-review-form bg-bg-light p-4 rounded border border-border">
                <h4 className="text-xs font-bold text-primary mb-2">Submit Review</h4>
                <div className="flex justify-between items-center mb-3">
                  <div className="star-rating-input flex gap-1 cursor-pointer text-orange-500 text-lg">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <i
                        key={num}
                        className={`${num <= reviewRating ? "fa-solid" : "fa-regular"} fa-star`}
                        onClick={() => setReviewRating(num)}
                      ></i>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience here..."
                    className="flex-grow bg-white border border-border px-3.5 py-2.5 rounded text-xs outline-none"
                  />
                  <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "12px" }} onClick={handleReviewSubmit}>
                    Submit
                  </button>
                </div>
              </div>

              <div className="details-reviews-list mt-6 flex flex-col gap-4">
                {activity.reviews && activity.reviews.length > 0 ? (
                  activity.reviews.map((r: any, idx: number) => (
                    <div className="review-card border-b border-slate-100 pb-4" key={idx}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-extrabold text-primary block">{r.author}</span>
                          <span className="text-[10px] text-text-muted">{r.date}</span>
                        </div>
                        <div className="text-xs text-orange-500 font-bold flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <i className="fa-solid fa-star" key={i}></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-main mt-2 leading-relaxed italic">"{r.text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted italic text-center">No reviews submitted yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Booking Inquiries */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-calendar-days text-secondary"></i> Booking Inquiries
              </h3>
              <div className="availability-calendar-box flex flex-col gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-border p-2 rounded text-xs outline-none"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Participants
                  </label>
                  <select
                    className="w-full border border-border p-2 rounded text-xs outline-none"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(parseInt(e.target.value))}
                  >
                    <option value="1">1 Participant</option>
                    <option value="2">2 Participants</option>
                    <option value="4">4 Participants</option>
                    <option value="6">6 Participants</option>
                  </select>
                </div>
                <div className="calendar-status-alert bg-emerald-50 text-emerald-600 border border-emerald-150 p-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check"></i> Standard slots available!
                </div>
                <button
                  className="btn-primary w-full justify-center mt-4"
                  style={{ fontSize: "14px", padding: "10px 0" }}
                  onClick={handleBookNow}
                >
                  Instant Book:{" "}
                  <span id="activity-sidebar-price" className="font-extrabold ml-1">
                    ₹{(activity.price * participantsCount).toLocaleString("en-IN")}
                  </span>
                </button>
              </div>
            </div>

            {/* Related Tours */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-compass text-secondary"></i> Related Tours
              </h3>
              <div className="sidebar-related-list flex flex-col gap-4">
                {relatedTours.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No related experiences found in {activity.city}.</p>
                ) : (
                  relatedTours.map((item) => (
                    <div
                      className="related-item flex gap-3 cursor-pointer group"
                      key={item.id}
                      onClick={() => router.push(`/customer/activities/${item.id}`)}
                    >
                      <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{item.location}</p>
                        <div className="text-xs font-bold text-secondary mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
