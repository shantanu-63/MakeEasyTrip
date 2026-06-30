"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DestinationDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { destinations, properties, activeUser, syncDestinations, addLog } = useData();

  // Find the active destination
  const dest = useMemo(() => {
    return destinations.find((d) => d.id === id);
  }, [destinations, id]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    if (!dest) return;
    // Check if destination is in user wishlist
    if (activeUser) {
      const users = JSON.parse(localStorage.getItem("met_users") || "[]");
      const u = users.find((item: any) => item.id === activeUser.id);
      if (u && u.wishlist) {
        setIsWished(u.wishlist.includes(dest.id));
      }
    }
  }, [dest, activeUser]);

  if (!dest) {
    return (
      <div className="container p-8 text-center text-sm text-text-muted">
        Destination not found. <Link href="/customer/destinations" className="text-secondary font-bold">Go Back</Link>
      </div>
    );
  }

  // Related stays matching this destination name (or city name)
  const staysNearby = properties.filter(
    (p) =>
      p.status === "Approved" &&
      p.type === "hotel" &&
      p.city.toLowerCase() === dest.city.toLowerCase()
  );

  // Related destinations (excluding current)
  const relatedSpots = destinations.filter((d) => d.id !== dest.id).slice(0, 3);

  const handleSaveDestination = () => {
    if (!activeUser) {
      alert("Please sign in to save destinations.");
      router.push("/customer/auth");
      return;
    }
    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    const idx = users.findIndex((item: any) => item.id === activeUser.id);
    if (idx !== -1) {
      let wishlist = users[idx].wishlist || [];
      if (wishlist.includes(dest.id)) {
        wishlist = wishlist.filter((item: any) => item !== dest.id);
        setIsWished(false);
        addLog(`WISHLIST: Removed destination ${dest.name} from wishlist`);
      } else {
        wishlist.push(dest.id);
        setIsWished(true);
        addLog(`WISHLIST: Added destination ${dest.name} to wishlist`);
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

    const updatedDestinations = destinations.map((d) => {
      if (d.id === dest.id) {
        const updatedReviews = [newReview, ...(d.reviews || [])];
        // Calculate new rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = parseFloat((totalRating / updatedReviews.length).toFixed(1));
        return {
          ...d,
          reviews: updatedReviews,
          rating: avg,
          ratingCount: updatedReviews.length,
        };
      }
      return d;
    });

    syncDestinations(updatedDestinations);
    setReviewText("");
    addLog(`REVIEW: Submitted review for destination ${dest.name}`);
  };

  const shiftSlider = (dir: number) => {
    const total = dest.gallery?.length || 0;
    if (total === 0) return;
    setCurrentSlide((prev) => (prev + dir + total) % total);
  };

  return (
    <section id="traveler-destination-details-view" className="traveler-subview block">
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/customer/destinations" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-secondary)" }}>
            <i className="fa-solid fa-chevron-left"></i> Back to Destinations
          </Link>
          <button
            className={`btn-secondary flex items-center gap-1.5 ${isWished ? "active" : ""}`}
            onClick={handleSaveDestination}
            style={{ padding: "6px 16px", fontSize: "12px" }}
          >
            <i className={`${isWished ? "fa-solid text-red-500" : "fa-regular"} fa-heart`}></i>
            {isWished ? "Saved" : "Save Destination"}
          </button>
        </div>

        {/* Banner Header */}
        <div className="destination-banner-hero relative h-80 rounded-lg overflow-hidden mb-8">
          <img
            id="dest-details-banner-img"
            src={dest.thumbnail}
            alt={dest.name}
            className="w-full h-full object-cover"
          />
          <div className="destination-banner-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex justify-between items-end p-8 text-white">
            <div>
              <span id="dest-details-location-tag" className="text-secondary font-extrabold text-xs tracking-wider uppercase block">
                {dest.country}
              </span>
              <h1 id="dest-details-name" className="text-3xl font-extrabold font-heading mt-1">
                {dest.name}
              </h1>
            </div>
            <div className="destination-card-rating bg-emerald-500 text-white font-extrabold px-3 py-1 rounded text-sm flex items-center gap-1">
              <i className="fa-solid fa-star"></i>
              <span id="dest-details-rating-val">{dest.rating}</span>
            </div>
          </div>
        </div>

        <div className="destination-details-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 text-primary flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-secondary"></i> Overview
              </h3>
              <p id="dest-details-description" className="text-xs text-text-main leading-relaxed">
                {dest.description}
              </p>
            </div>

            {/* Gallery Slider */}
            {dest.gallery && dest.gallery.length > 0 && (
              <div className="gallery-slider-box relative h-80 rounded-lg overflow-hidden mb-6 border border-border shadow-sm bg-slate-900 flex items-center justify-center">
                <img
                  src={dest.gallery[currentSlide]}
                  alt={`${dest.name} Gallery ${currentSlide}`}
                  className="h-full object-contain"
                />
                <button
                  className="slider-nav-btn prev absolute left-4 bg-white/70 hover:bg-white text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                  onClick={() => shiftSlider(-1)}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  className="slider-nav-btn next absolute right-4 bg-white/70 hover:bg-white text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                  onClick={() => shiftSlider(1)}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                <div className="slider-dots-row absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {dest.gallery.map((_: any, idx: number) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                        idx === currentSlide ? "bg-secondary scale-110" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentSlide(idx)}
                    ></span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-4 text-primary flex items-center gap-2">
                <i className="fa-solid fa-route text-secondary"></i> Highlights
              </h3>
              <div className="highlights-grid grid grid-cols-2 gap-3.5" id="dest-details-highlights">
                {dest.highlights ? (
                  dest.highlights.map((h: string, idx: number) => (
                    <div className="highlight-pill bg-slate-50 border border-border px-3.5 py-2.5 rounded text-xs text-text-main flex items-center gap-2 font-semibold" key={idx}>
                      <i className="fa-solid fa-circle-check text-emerald-500"></i> {h}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="highlight-pill bg-slate-50 border border-border px-3.5 py-2.5 rounded text-xs text-text-main flex items-center gap-2 font-semibold">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i> Cultural Heritage Tours
                    </div>
                    <div className="highlight-pill bg-slate-50 border border-border px-3.5 py-2.5 rounded text-xs text-text-main flex items-center gap-2 font-semibold">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i> Premium Local Cuisines
                    </div>
                    <div className="highlight-pill bg-slate-50 border border-border px-3.5 py-2.5 rounded text-xs text-text-main flex items-center gap-2 font-semibold">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i> Adventure & Trails
                    </div>
                    <div className="highlight-pill bg-slate-50 border border-border px-3.5 py-2.5 rounded text-xs text-text-main flex items-center gap-2 font-semibold">
                      <i className="fa-solid fa-circle-check text-emerald-500"></i> Luxury Beach Stays
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Travel Guidelines */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-4 text-primary flex items-center gap-2">
                <i className="fa-solid fa-plane-departure text-secondary"></i> Travel Guidelines
              </h3>
              <div className="travel-info-cards grid grid-cols-3 gap-4">
                <div className="travel-info-card bg-slate-50 p-4 border border-border rounded text-center">
                  <i className="fa-solid fa-passport text-secondary text-2xl mb-2"></i>
                  <h4 className="font-bold text-xs text-primary">Visa Needed</h4>
                  <p className="text-[10px] text-text-muted mt-1">{dest.visa || "Visa on Arrival"}</p>
                </div>
                <div className="travel-info-card bg-slate-50 p-4 border border-border rounded text-center">
                  <i className="fa-solid fa-wallet text-secondary text-2xl mb-2"></i>
                  <h4 className="font-bold text-xs text-primary">Best Budget</h4>
                  <p id="dest-details-budget-info" className="text-[10px] text-text-muted mt-1">
                    {dest.budget} Tier
                  </p>
                </div>
                <div className="travel-info-card bg-slate-50 p-4 border border-border rounded text-center">
                  <i className="fa-solid fa-cloud-sun text-secondary text-2xl mb-2"></i>
                  <h4 className="font-bold text-xs text-primary">Best Season</h4>
                  <p className="text-[10px] text-text-muted mt-1">{dest.season || "Year Round"}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg shadow-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
                  <i className="fa-solid fa-comments text-secondary"></i> Destination Reviews
                </h3>
                <span id="dest-details-reviews-count" className="text-xs font-bold text-text-muted">
                  {dest.reviews?.length || 0} Reviews
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
                {dest.reviews && dest.reviews.length > 0 ? (
                  dest.reviews.map((r: any, idx: number) => (
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

          {/* Right Column Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Nearby Stays */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-hotel text-secondary"></i> Stays Nearby
              </h3>
              <div className="sidebar-related-list flex flex-col gap-4">
                {staysNearby.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No stays nearby registered yet.</p>
                ) : (
                  staysNearby.slice(0, 3).map((item) => (
                    <div
                      className="related-item flex gap-3 cursor-pointer group"
                      key={item.id}
                      onClick={() => router.push(`/customer/hotels/${item.id}`)}
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

            {/* Related Spots */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-globe text-secondary"></i> Related Spots
              </h3>
              <div className="sidebar-related-list flex flex-col gap-4">
                {relatedSpots.map((item) => (
                  <div
                    className="related-item flex gap-3 cursor-pointer group"
                    key={item.id}
                    onClick={() => router.push(`/customer/destinations/${item.id}`)}
                  >
                    <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.country}</p>
                      <div className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        ★ {item.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
