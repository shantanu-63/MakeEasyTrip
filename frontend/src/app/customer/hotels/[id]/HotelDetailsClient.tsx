"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HotelDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { properties, activeUser, syncProperties, bookings, syncBookings, addLog } = useData();

  // Track whether initial data load has completed
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (properties.length > 0) {
      setDataLoaded(true);
    }
  }, [properties]);

  useEffect(() => {
    const timer = setTimeout(() => setDataLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const hotel = useMemo(() => {
    return properties.find((p) => p.id === id && p.type === "hotel");
  }, [properties, id]);

  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Booking details
  const [checkinDate, setCheckinDate] = useState("2026-06-10");
  const [checkoutDate, setCheckoutDate] = useState("2026-06-17");
  const [calendarStatus, setCalendarStatus] = useState("Standard availability active!");

  useEffect(() => {
    if (!hotel) return;
    if (activeUser) {
      const users = JSON.parse(localStorage.getItem("met_users") || "[]");
      const u = users.find((item: any) => item.id === activeUser.id);
      if (u && u.wishlist) {
        setIsSaved(u.wishlist.includes(hotel.id));
      }
    }
  }, [hotel, activeUser]);

  // Show skeleton while data is loading
  if (!dataLoaded && !hotel) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div className="skeleton" style={{ width: "120px", height: "16px", borderRadius: "6px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "320px", height: "32px", borderRadius: "8px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ width: "200px", height: "14px", borderRadius: "6px" }} />
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

  if (!hotel) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏨</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "12px" }}>Hotel Not Found</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", maxWidth: "400px", marginBottom: "28px", lineHeight: 1.6 }}>
          We couldn&apos;t find the hotel you&apos;re looking for. It may have been removed or the link is incorrect.
        </p>
        <Link href="/customer/hotels" style={{ backgroundColor: "var(--color-secondary)", color: "#fff", padding: "10px 28px", borderRadius: "999px", fontWeight: 700, fontSize: "14px" }}>
          Browse Hotels
        </Link>
      </div>
    );
  }

  const similarStays = properties
    .filter(
      (p) =>
        p.status === "Approved" &&
        p.type === "hotel" &&
        p.city.toLowerCase() === hotel.city.toLowerCase() &&
        p.id !== hotel.id
    )
    .slice(0, 3);

  const toggleSaveHotel = () => {
    if (!activeUser) {
      alert("Please sign in to save hotels.");
      router.push("/customer/auth");
      return;
    }
    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    const idx = users.findIndex((item: any) => item.id === activeUser.id);
    if (idx !== -1) {
      let wishlist = users[idx].wishlist || [];
      if (wishlist.includes(hotel.id)) {
        wishlist = wishlist.filter((item: any) => item !== hotel.id);
        setIsSaved(false);
        addLog(`WISHLIST: Removed hotel ${hotel.title} from wishlist`);
      } else {
        wishlist.push(hotel.id);
        setIsSaved(true);
        addLog(`WISHLIST: Added hotel ${hotel.title} to wishlist`);
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
      if (p.id === hotel.id) {
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
    addLog(`REVIEW: Submitted review for hotel ${hotel.title}`);
  };

  const verifyCalendar = () => {
    const cin = new Date(checkinDate);
    const cout = new Date(checkoutDate);
    if (cout <= cin) {
      setCalendarStatus("Error: Checkout must be after check-in!");
    } else {
      setCalendarStatus("Standard availability active!");
    }
  };

  const handleBookRoom = (roomType: string, roomRate: number) => {
    if (!activeUser) {
      alert("Please sign in to proceed with booking.");
      router.push("/customer/auth");
      return;
    }

    const cin = new Date(checkinDate);
    const cout = new Date(checkoutDate);
    if (cout <= cin) {
      alert("Invalid travel dates selection. Please adjust your calendar.");
      return;
    }

    const diffDays = Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24));
    const totalCost = roomRate * diffDays;

    const newBooking = {
      id: "MET-" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000),
      userId: activeUser.id,
      propertyId: hotel.id,
      propertyName: hotel.title,
      type: "hotel",
      customerName: activeUser.fullName,
      customerEmail: activeUser.email,
      customerPhone: activeUser.phone || "+91 98765 43210",
      checkin: checkinDate,
      checkout: checkoutDate,
      participantCount: 2,
      pricePaid: totalCost,
      status: "Confirmed",
      paymentStatus: "Paid",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedBookings = [newBooking, ...bookings];
    syncBookings(updatedBookings);

    addLog(`BOOKING: Instantly booked ${roomType} at ${hotel.title} for ₹${totalCost}`);
    alert(`Success! Booked ${roomType} at ${hotel.title} for ₹${totalCost.toLocaleString("en-IN")}`);
    router.push("/customer/dashboard");
  };

  return (
    <section id="traveler-hotel-details-view" className="traveler-subview block">
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/customer/hotels" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-secondary)" }}>
            <i className="fa-solid fa-chevron-left"></i> Back to Hotels
          </Link>
          <button
            className={`btn-secondary flex items-center gap-1.5 ${isSaved ? "active" : ""}`}
            onClick={toggleSaveHotel}
            style={{ padding: "6px 16px", fontSize: "12px" }}
          >
            <i className={`${isSaved ? "fa-solid text-red-500" : "fa-regular"} fa-heart`}></i>
            {isSaved ? "Saved" : "Save Hotel"}
          </button>
        </div>

        {/* Title Header */}
        <div style={{ marginBottom: "28px" }}>
          <span className="listing-category" style={{ color: "var(--color-secondary)", fontWeight: 800, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            🏨 HOTEL & RESORT
          </span>
          <h1 id="hotel-details-title" className="text-3xl font-extrabold text-primary mt-1">
            {hotel.title}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }} id="hotel-details-location">
            <i className="fa-solid fa-map-pin mr-1"></i> {hotel.location}, {hotel.city}
          </p>
        </div>

        {/* Gallery Collage */}
        <div className="hotel-gallery-collage grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gallery-large-frame md:col-span-2 h-80 rounded overflow-hidden">
            <img id="hotel-gallery-large" src={hotel.image} alt={hotel.title} className="w-full h-full object-cover" />
          </div>
          <div className="gallery-side-frames flex flex-col gap-4 h-80">
            <div className="gallery-side-frame h-1/2 rounded overflow-hidden">
              <img
                id="hotel-gallery-side-1"
                src={hotel.gallery?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"}
                alt="Gallery 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="gallery-side-frame h-1/2 rounded overflow-hidden">
              <img
                id="hotel-gallery-side-2"
                src={hotel.gallery?.[1] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80"}
                alt="Gallery 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="hotel-details-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 text-primary flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-secondary"></i> Overview
              </h3>
              <p id="hotel-details-description" className="text-xs text-text-main leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-4 text-primary flex items-center gap-2">
                <i className="fa-solid fa-list-check text-secondary"></i> Amenities Offered
              </h3>
              <div className="amenities-grid-details grid grid-cols-2 sm:grid-cols-4 gap-4" id="hotel-details-amenities">
                {hotel.amenities?.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-border rounded p-3 text-center text-xs font-semibold text-primary flex flex-col items-center justify-center gap-1.5"
                  >
                    <i
                      className={`fa-solid ${
                        amenity.includes("WiFi")
                          ? "fa-wifi"
                          : amenity.includes("Pool")
                          ? "fa-water_ladder"
                          : amenity.includes("View")
                          ? "fa-eye"
                          : amenity.includes("Spa")
                          ? "fa-spa"
                          : "fa-circle-check"
                      } text-lg text-secondary`}
                    ></i>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Available Room Options */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-4 text-primary flex items-center gap-2">
                <i className="fa-solid fa-bed text-secondary"></i> Available Room Options
              </h3>
              <div className="room-class-list flex flex-col gap-6" id="hotel-details-rooms">
                {/* Deluxe Double Room */}
                <div className="room-class-card border border-border rounded overflow-hidden flex flex-col md:flex-row bg-slate-50">
                  <div className="room-thumb-box w-full md:w-48 h-40 flex-shrink-0 bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
                      alt="Deluxe Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="room-details-box p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="room-type-title font-bold text-sm text-primary">Deluxe Double Room</h4>
                      <div className="room-occupancy-badges flex gap-3 text-[10px] text-text-muted mt-1.5">
                        <span>
                          <i className="fa-solid fa-user-group mr-1"></i> Max Guests: 2
                        </span>
                        <span>
                          <i className="fa-solid fa-expand mr-1"></i> Area: 32 sq m
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-2">
                        Comfortable stay option featuring a private balcony, king-size bedding, flat-screen TV, and high-speed WiFi.
                      </p>
                    </div>
                    <div className="room-pricing-actions flex justify-between items-center mt-4 border-t border-border/60 pt-3">
                      <div>
                        <span className="text-[10px] text-text-muted block">Rate Per Night</span>
                        <div className="room-rate-val font-extrabold text-sm text-primary">
                          ₹{hotel.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 16px", fontSize: "12px" }}
                        onClick={() => handleBookRoom("Deluxe Double Room", hotel.price)}
                      >
                        Book Room
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Suite */}
                <div className="room-class-card border border-border rounded overflow-hidden flex flex-col md:flex-row bg-slate-50">
                  <div className="room-thumb-box w-full md:w-48 h-40 flex-shrink-0 bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80"
                      alt="Luxury Suite"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="room-details-box p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="room-type-title font-bold text-sm text-primary">Luxury Ocean Suite</h4>
                      <div className="room-occupancy-badges flex gap-3 text-[10px] text-text-muted mt-1.5">
                        <span>
                          <i className="fa-solid fa-user-group mr-1"></i> Max Guests: 3
                        </span>
                        <span>
                          <i className="fa-solid fa-expand mr-1"></i> Area: 58 sq m
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-2">
                        Premium ocean-facing suite featuring a separate living room, private mini-bar, high-speed WiFi, and complimentary bath treatments.
                      </p>
                    </div>
                    <div className="room-pricing-actions flex justify-between items-center mt-4 border-t border-border/60 pt-3">
                      <div>
                        <span className="text-[10px] text-text-muted block">Rate Per Night</span>
                        <div className="room-rate-val font-extrabold text-sm text-primary">
                          ₹{Math.round(hotel.price * 1.6).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 16px", fontSize: "12px" }}
                        onClick={() => handleBookRoom("Luxury Ocean Suite", Math.round(hotel.price * 1.6))}
                      >
                        Book Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="info-details-box bg-white p-6 border border-border rounded-lg shadow-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
                  <i className="fa-solid fa-comments text-secondary"></i> Hotel Reviews
                </h3>
                <span id="hotel-details-reviews-count" className="text-xs font-bold text-text-muted">
                  {hotel.reviews?.length || 0} Reviews
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
                {hotel.reviews && hotel.reviews.length > 0 ? (
                  hotel.reviews.map((r: any, idx: number) => (
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
            {/* Booking Inquiries */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-calendar-days text-secondary"></i> Booking Inquiries
              </h3>
              <div className="availability-calendar-box flex flex-col gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-border p-2 rounded text-xs outline-none"
                    value={checkinDate}
                    onChange={(e) => {
                      setCheckinDate(e.target.value);
                      verifyCalendar();
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-border p-2 rounded text-xs outline-none"
                    value={checkoutDate}
                    onChange={(e) => {
                      setCheckoutDate(e.target.value);
                      verifyCalendar();
                    }}
                  />
                </div>
                <div
                  className={`calendar-status-alert border p-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 ${
                    calendarStatus.includes("Error")
                      ? "bg-red-50 text-red-500 border-red-150"
                      : "bg-emerald-50 text-emerald-600 border-emerald-150"
                  }`}
                >
                  <i className={`fa-solid ${calendarStatus.includes("Error") ? "fa-circle-xmark" : "fa-circle-check"}`}></i>
                  {calendarStatus}
                </div>
              </div>
            </div>

            {/* Interactive Location */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-secondary"></i> Interactive Location
              </h3>
              <div className="map-mock-container relative h-40 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=300&q=80"
                  alt="Map View"
                  className="w-full h-full object-cover"
                />
                <i className="fa-solid fa-location-pin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-red-500 animate-bounce"></i>
              </div>
            </div>

            {/* Similar Stays */}
            <div className="details-sidebar-card bg-white p-6 border border-border rounded-lg shadow-sm">
              <h3 className="details-sidebar-title text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
                <i className="fa-solid fa-hotel text-secondary"></i> Similar Stays
              </h3>
              <div className="sidebar-related-list flex flex-col gap-4">
                {similarStays.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No similar stays found in {hotel.city}.</p>
                ) : (
                  similarStays.map((item) => (
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
          </aside>
        </div>
      </div>
    </section>
  );
}
