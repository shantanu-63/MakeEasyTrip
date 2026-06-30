"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CustomerDashboardPage() {
  const router = useRouter();
  const { bookings, properties, activeUser, syncBookings, addLog, logoutUser } = useData();

  const [activeTab, setActiveTab] = useState<"bookings" | "wishlist" | "reviews" | "support">("bookings");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportDesc, setSupportDesc] = useState("");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [localTickets, setLocalTickets] = useState<any[]>([]);

  // Guard check: redirect to auth if not logged in
  useEffect(() => {
    // We check if session check completed
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("met_session") || sessionStorage.getItem("met_session");
      if (!token && !activeUser) {
        router.push("/customer/auth?redirect=dashboard");
      }
    }
  }, [activeUser, router]);

  // Load custom support tickets from localStorage
  useEffect(() => {
    if (activeUser) {
      const stored = localStorage.getItem(`met_tickets_${activeUser.id}`);
      if (stored) {
        setLocalTickets(JSON.parse(stored));
      } else {
        const initial = [
          {
            id: "TK-7389",
            subject: "Refund status for cancelled booking",
            message: "I cancelled my water sports booking at Grande Island. When will the refund reflect in my bank?",
            status: "Closed",
            category: "Refunds",
            createdAt: "2026-06-12",
          },
        ];
        localStorage.setItem(`met_tickets_${activeUser.id}`, JSON.stringify(initial));
        setLocalTickets(initial);
      }
    }
  }, [activeUser]);

  const userBookings = useMemo(() => {
    if (!activeUser) return [];
    return bookings.filter((b) => b.userId === activeUser.id);
  }, [bookings, activeUser]);

  // Get user wishlist items
  const userWishlist = useMemo(() => {
    if (!activeUser) return [];
    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    const u = users.find((item: any) => item.id === activeUser.id);
    if (!u || !u.wishlist) return [];
    return properties.filter((p) => u.wishlist.includes(p.id));
  }, [properties, activeUser]);

  // Get reviews published by user
  const userReviews = useMemo(() => {
    if (!activeUser) return [];
    const result: any[] = [];
    properties.forEach((p) => {
      p.reviews?.forEach((r: any) => {
        if (r.author === activeUser.fullName) {
          result.push({
            propertyName: p.title,
            propertyType: p.type,
            rating: r.rating,
            date: r.date,
            text: r.text,
          });
        }
      });
    });
    return result;
  }, [properties, activeUser]);

  const points = useMemo(() => {
    return userBookings.reduce((sum, b) => sum + Math.floor((b.pricePaid || 0) / 10), 0) + 750;
  }, [userBookings]);

  const tier = useMemo(() => {
    if (points >= 2000) return { name: "Platinum Tier", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    if (points >= 1000) return { name: "Gold Tier", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { name: "Silver Tier", color: "text-slate-600 bg-slate-50 border-slate-200" };
  }, [points]);

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updated = bookings.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: "Cancelled", paymentStatus: "Refunded" };
        }
        return b;
      });
      syncBookings(updated);
      addLog(`BOOKING_CANCEL: Cancelled booking ${bookingId}`);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDesc.trim() || !activeUser) return;

    const newTicket = {
      id: "TK-" + Math.floor(Math.random() * 9000 + 1000),
      subject: supportSubject,
      message: supportDesc,
      status: "Open",
      category: "Booking Assistance",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newTicket, ...localTickets];
    setLocalTickets(updated);
    localStorage.setItem(`met_tickets_${activeUser.id}`, JSON.stringify(updated));

    setSupportSubject("");
    setSupportDesc("");
    setShowNewTicketForm(false);
    addLog(`SUPPORT: Created support ticket ${newTicket.id}`);
    alert(`Success! Created ticket ${newTicket.id}`);
  };

  if (!activeUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    return activeUser.fullName
      ? activeUser.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  return (
    <section id="traveler-dashboard-view" className="traveler-subview block">
      <div className="container dashboard-view-container px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-primary">Your Travel Dashboard</h2>
          <button
            onClick={() => {
              logoutUser();
              router.push("/customer");
            }}
            className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
          >
            <i className="fa-solid fa-right-from-bracket"></i> Sign Out
          </button>
        </div>

        {/* Profile Overview & Loyalty Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Profile Card */}
          <div className="profile-overview-card md:col-span-2 bg-white p-6 border border-border rounded-lg shadow-sm flex items-center gap-5">
            <div className="profile-large-avatar w-16 h-16 rounded-full bg-secondary text-white text-2xl font-bold flex items-center justify-center">
              {getInitials()}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary">{activeUser.fullName}</h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Verified Tourist Profile • Account: {activeUser.email}
              </p>
              <div className="flex gap-4 mt-2.5 text-[11px] font-bold text-text-main">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-passport text-secondary text-xs"></i> Passport: Checked
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-500 text-xs"></i> Insurance: Active
                </span>
              </div>
            </div>
          </div>

          {/* Loyalty & Rewards Card */}
          <div className="loyalty-rewards-card bg-white p-6 border border-border rounded-lg shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Loyalty Points Balance</span>
                <span className="text-2xl font-black text-primary mt-1 block">{points.toLocaleString()} pts</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tier.color}`}>
                {tier.name}
              </span>
            </div>
            <div className="border-t border-dashed border-border mt-3 pt-3 flex justify-between items-center text-[10px]">
              <span className="text-text-muted">Available Coupon:</span>
              <span className="font-mono font-bold text-secondary bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                METTRIP10 (10% Off)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="dashboard-tabs flex flex-wrap gap-2 mb-6">
          <button
            className={`dashboard-tab-btn px-4 py-2 text-xs font-semibold rounded ${
              activeTab === "bookings"
                ? "bg-primary text-white"
                : "bg-white text-text-main border border-border hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            My Bookings ({userBookings.length})
          </button>
          <button
            className={`dashboard-tab-btn px-4 py-2 text-xs font-semibold rounded ${
              activeTab === "wishlist"
                ? "bg-primary text-white"
                : "bg-white text-text-main border border-border hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab("wishlist")}
          >
            Saved Items ({userWishlist.length})
          </button>
          <button
            className={`dashboard-tab-btn px-4 py-2 text-xs font-semibold rounded ${
              activeTab === "reviews"
                ? "bg-primary text-white"
                : "bg-white text-text-main border border-border hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            My Reviews ({userReviews.length})
          </button>
          <button
            className={`dashboard-tab-btn px-4 py-2 text-xs font-semibold rounded ${
              activeTab === "support"
                ? "bg-primary text-white"
                : "bg-white text-text-main border border-border hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab("support")}
          >
            Support Tickets ({localTickets.length})
          </button>
        </div>

        {/* 1. Bookings Panel */}
        {activeTab === "bookings" && (
          <div id="dash-panel-bookings" className="flex flex-col gap-4">
            {userBookings.length === 0 ? (
              <div className="text-center py-12 bg-white border border-border rounded-lg text-text-muted text-xs italic">
                You haven't booked any trips yet.{" "}
                <Link href="/customer/hotels" className="text-secondary font-bold underline">
                  Book stays
                </Link>{" "}
                or{" "}
                <Link href="/customer/activities" className="text-secondary font-bold underline">
                  experiences
                </Link>{" "}
                now!
              </div>
            ) : (
              userBookings.map((b) => (
                <div
                  key={b.id}
                  className="booking-card bg-white p-5 border border-border rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <span className="text-[10px] bg-slate-100 border border-border px-2 py-0.5 rounded text-text-muted font-mono">
                      ID: {b.id}
                    </span>
                    <h4 className="text-sm font-extrabold text-primary mt-1.5">{b.propertyName}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Check-In Date: {b.checkin} {b.checkout ? `• Check-Out Date: ${b.checkout}` : ""}
                    </p>
                    <div className="flex gap-2.5 items-center mt-2.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          b.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : b.status === "Cancelled"
                            ? "bg-red-50 text-red-500 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        Status: {b.status}
                      </span>
                      <span className="text-[10px] text-text-main font-bold">
                        Paid Amount: ₹{b.pricePaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  {b.status === "Confirmed" && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 px-3.5 py-1.5 text-xs font-bold rounded"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Wishlist Panel */}
        {activeTab === "wishlist" && (
          <div id="dash-panel-wishlist">
            {userWishlist.length === 0 ? (
              <div className="text-center py-12 bg-white border border-border rounded-lg text-text-muted text-xs italic">
                No items saved to wishlist.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="wishlist-deck">
                {userWishlist.map((item) => (
                  <div
                    key={item.id}
                    className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="listing-img-box relative h-40 w-full">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="listing-badge absolute top-2.5 left-2.5 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary line-clamp-1">{item.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{item.location}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3.5 pt-2.5 border-t border-border">
                        <div className="text-xs font-extrabold text-primary">
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                        <Link
                          href={`/customer/${item.type}s/${item.id}`}
                          className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Reviews Panel */}
        {activeTab === "reviews" && (
          <div id="dash-panel-reviews" className="flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-primary mb-2">My Published Reviews</h3>
            {userReviews.length === 0 ? (
              <p className="text-xs text-text-muted italic text-center py-12 bg-white border border-border rounded-lg">
                You haven't submitted any reviews yet.
              </p>
            ) : (
              userReviews.map((r, idx) => (
                <div key={idx} className="review-card bg-white p-5 border border-border rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-extrabold text-primary block">
                        {r.propertyName} ({r.propertyType})
                      </span>
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
            )}
          </div>
        )}

        {/* 4. Support Panel */}
        {activeTab === "support" && (
          <div id="dash-panel-support" className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-extrabold text-primary">My Support Tickets</h3>
              <button
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "12px" }}
                onClick={() => setShowNewTicketForm(!showNewTicketForm)}
              >
                <i className="fa-solid fa-plus mr-1"></i> {showNewTicketForm ? "Cancel" : "New Ticket"}
              </button>
            </div>

            {showNewTicketForm && (
              <form
                onSubmit={handleCreateTicket}
                className="bg-white p-6 border border-border rounded-lg flex flex-col gap-4"
              >
                <h4 className="text-xs font-extrabold text-primary">Submit Support Case</h4>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Subject</label>
                  <input
                    type="text"
                    required
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="Briefly state your concern"
                    className="border border-border p-2 rounded text-xs outline-none"
                  />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Message Detail</label>
                  <textarea
                    required
                    value={supportDesc}
                    onChange={(e) => setSupportDesc(e.target.value)}
                    placeholder="Elaborate details here..."
                    rows={4}
                    className="border border-border p-2 rounded text-xs outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary self-start px-6 py-2 text-xs">
                  Create Ticket
                </button>
              </form>
            )}

            <div className="flex flex-col gap-4">
              {localTickets.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-12 bg-white border border-border rounded-lg">
                  No support tickets created.
                </p>
              ) : (
                localTickets.map((t) => (
                  <div key={t.id} className="ticket-card bg-white p-5 border border-border rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-100 border border-border px-1.5 py-0.5 rounded text-text-muted font-mono font-bold">
                          ID: {t.id} • {t.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-primary mt-2">{t.subject}</h4>
                        <p className="text-xs text-text-main mt-1 leading-relaxed">{t.message}</p>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          t.status === "Closed"
                            ? "bg-slate-100 text-slate-500 border border-slate-200"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted block mt-3">Created: {t.createdAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
export default function CustomerDashboardContent() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</p>
        </div>
      </div>
    }>
      <CustomerDashboardPage />
    </Suspense>
  );
}
