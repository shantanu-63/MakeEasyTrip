"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/context/DataContext";


interface BookingDetails {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  city: string;
  image: string;
  price: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
}

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeUser, bookings, syncBookings, addLog } = useData();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Guest details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load booking details from URL params or localStorage
    const propertyId = searchParams.get("propertyId") || "";
    const propertyName = searchParams.get("propertyName") || "Sunset Villa";
    const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
    const checkOut = searchParams.get("checkOut") || new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];
    const guests = parseInt(searchParams.get("guests") || "2");
    const price = parseInt(searchParams.get("price") || "12000");

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
    const total = price * nights;

    // Try to load from localStorage pending booking
    const pendingStr = localStorage.getItem("met_pending_booking");
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        setBooking(pending);
      } catch {
        setBooking({
          propertyId,
          propertyName: decodeURIComponent(propertyName),
          propertyType: searchParams.get("type") || "hotel",
          city: searchParams.get("city") || "Goa",
          image: searchParams.get("image") || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
          price,
          checkIn,
          checkOut,
          guests,
          nights,
          total,
        });
      }
    } else {
      setBooking({
        propertyId,
        propertyName: decodeURIComponent(propertyName),
        propertyType: searchParams.get("type") || "hotel",
        city: searchParams.get("city") || "Goa",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        price,
        checkIn,
        checkOut,
        guests,
        nights,
        total,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    // Pre-fill user details if logged in from activeUser context
    if (activeUser) {
      setGuestName(activeUser.fullName || "");
      setGuestEmail(activeUser.email || "");
      setGuestPhone(activeUser.phone || "");
    }
  }, [activeUser]);


  const handleGuestDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(guestEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedTerms) {
      setError("Please agree to the terms and conditions to proceed.");
      return;
    }

    if (paymentMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID.");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      setError("Please fill in all card details.");
      return;
    }

    setIsSubmitting(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Create booking record
    const bookingId = "BKG-" + Math.floor(Math.random() * 900000 + 100000);
    setConfirmationId(bookingId);

    const newBooking = {
      id: bookingId,
      propertyId: booking?.propertyId,
      propertyName: booking?.propertyName,
      city: booking?.city,
      type: booking?.propertyType || "hotel",
      guestName,
      guestEmail,
      guestPhone,
      checkIn: booking?.checkIn,
      checkOut: booking?.checkOut,
      userId: activeUser?.id || "user-local",
      guests: booking?.guests,
      nights: booking?.nights,
      pricePaid: booking?.total,
      totalAmount: booking?.total,
      paymentMethod,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      specialRequests,
    };

    // Update DataContext global state
    const updatedBookings = [newBooking, ...bookings];
    syncBookings(updatedBookings);
    addLog(`BOOKING: Booked property ${booking?.propertyName} for ₹${booking?.total}`);

    // Save to user bookings (compat fallback)
    if (activeUser) {
      try {
        const userBookings = JSON.parse(localStorage.getItem(`met_user_bookings_${activeUser.id}`) || "[]");
        userBookings.push(newBooking);
        localStorage.setItem(`met_user_bookings_${activeUser.id}`, JSON.stringify(userBookings));
      } catch {}
    }

    // Clear pending booking
    localStorage.removeItem("met_pending_booking");

    setIsSubmitting(false);
    setBookingConfirmed(true);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  if (!booking) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <i className="fa-solid fa-spinner fa-spin text-4xl text-primary mb-4 block"></i>
        <p className="text-text-muted">Loading checkout...</p>
      </div>
    );
  }

  const taxes = Math.round(booking.total * 0.12);
  const grandTotal = booking.total + taxes;

  return (
    <div style={{ background: "var(--color-bg-light)", minHeight: "100vh", paddingTop: "40px", paddingBottom: "60px" }}>
      <div className="container" style={{ maxWidth: "1100px" }}>

        {/* Step 3: Confirmation */}
        {step === 3 && bookingConfirmed && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "var(--color-success)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", fontSize: "36px"
            }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "8px" }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "8px" }}>
              Your stay at <strong>{booking.propertyName}</strong> is confirmed.
            </p>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "32px", fontSize: "13px" }}>
              Confirmation ID: <strong style={{ color: "var(--color-primary)", fontFamily: "monospace" }}>{confirmationId}</strong>
            </p>

            <div style={{
              background: "white", borderRadius: "16px", border: "1px solid var(--color-border)",
              padding: "24px", maxWidth: "480px", margin: "0 auto 32px", textAlign: "left"
            }}>
              <h4 style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "16px", fontSize: "14px" }}>Booking Summary</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Property</span>
                  <span style={{ fontWeight: 600 }}>{booking.propertyName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Check-in</span>
                  <span style={{ fontWeight: 600 }}>{booking.checkIn}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Check-out</span>
                  <span style={{ fontWeight: 600 }}>{booking.checkOut}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Guests</span>
                  <span style={{ fontWeight: 600 }}>{booking.guests}</span>
                </div>
                <hr style={{ borderColor: "var(--color-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Total Paid</span>
                  <span style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "15px" }}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/customer/dashboard" style={{
                background: "var(--color-primary)", color: "white",
                padding: "12px 28px", borderRadius: "8px", fontWeight: 700, fontSize: "14px",
                textDecoration: "none"
              }}>
                <i className="fa-solid fa-gauge mr-2"></i>View My Bookings
              </Link>
              <Link href="/customer" style={{
                background: "transparent", color: "var(--color-primary)",
                border: "2px solid var(--color-border)", padding: "12px 28px",
                borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none"
              }}>
                <i className="fa-solid fa-home mr-2"></i>Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Steps 1 & 2 */}
        {step !== 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

            {/* Left: Form */}
            <div>
              {/* Progress steps */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
                {[{ n: 1, label: "Guest Details" }, { n: 2, label: "Payment" }].map(({ n, label }) => (
                  <React.Fragment key={n}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: step >= n ? "var(--color-primary)" : "var(--color-border)",
                        color: step >= n ? "white" : "var(--color-text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "12px"
                      }}>{n}</div>
                      <span style={{
                        fontSize: "13px", fontWeight: step === n ? 700 : 500,
                        color: step === n ? "var(--color-primary)" : "var(--color-text-muted)"
                      }}>{label}</span>
                    </div>
                    {n < 2 && <div style={{ flex: 1, height: "2px", background: step > n ? "var(--color-primary)" : "var(--color-border)" }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626",
                  padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px",
                  display: "flex", alignItems: "center", gap: "8px"
                }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              {/* Step 1: Guest Details */}
              {step === 1 && (
                <form onSubmit={handleGuestDetailsNext}>
                  <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "28px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "20px" }}>
                      <i className="fa-solid fa-user mr-2 text-secondary"></i>Guest Information
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Enter full name"
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "8px",
                            border: "1.5px solid var(--color-border)", fontSize: "13px",
                            outline: "none", boxSizing: "border-box"
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="Enter email"
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "8px",
                            border: "1.5px solid var(--color-border)", fontSize: "13px",
                            outline: "none", boxSizing: "border-box"
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "8px",
                            border: "1.5px solid var(--color-border)", fontSize: "13px",
                            outline: "none", boxSizing: "border-box"
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>
                          Guests Count
                        </label>
                        <input
                          type="number"
                          value={booking.guests}
                          readOnly
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "8px",
                            border: "1.5px solid var(--color-border)", fontSize: "13px",
                            background: "#F8FAFC", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>
                          Special Requests (Optional)
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Early check-in, late check-out, dietary preferences, accessibility needs..."
                          rows={3}
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "8px",
                            border: "1.5px solid var(--color-border)", fontSize: "13px",
                            outline: "none", resize: "vertical", boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" style={{
                    width: "100%", background: "var(--color-secondary)", color: "white",
                    padding: "14px", borderRadius: "10px", fontWeight: 800, fontSize: "15px",
                    border: "none", cursor: "pointer"
                  }}>
                    Continue to Payment <i className="fa-solid fa-arrow-right ml-2"></i>
                  </button>
                </form>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "28px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "20px" }}>
                      <i className="fa-solid fa-lock mr-2 text-secondary"></i>Secure Payment
                    </h3>

                    {/* Payment method tabs */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                      {[
                        { id: "upi", label: "UPI", icon: "fa-mobile-alt" },
                        { id: "card", label: "Debit/Credit Card", icon: "fa-credit-card" },
                        { id: "netbanking", label: "Net Banking", icon: "fa-building-columns" },
                        { id: "wallet", label: "Wallet", icon: "fa-wallet" },
                      ].map(({ id, label, icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id as any)}
                          style={{
                            padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                            border: paymentMethod === id ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                            background: paymentMethod === id ? "rgba(10,34,92,0.05)" : "white",
                            color: paymentMethod === id ? "var(--color-primary)" : "var(--color-text-muted)",
                            cursor: "pointer"
                          }}
                        >
                          <i className={`fa-solid ${icon} mr-1.5`}></i>{label}
                        </button>
                      ))}
                    </div>

                    {/* UPI */}
                    {paymentMethod === "upi" && (
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>UPI ID *</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@paytm / @gpay / @phonepe"
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                          <i className="fa-solid fa-shield-halved mr-1 text-success"></i>UPI payment is secured by NPCI
                        </p>
                      </div>
                    )}

                    {/* Card */}
                    {paymentMethod === "card" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>Card Number *</label>
                          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>Expiry (MM/YY) *</label>
                          <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/28" maxLength={5}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>CVV *</label>
                          <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="•••" maxLength={4}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "6px" }}>Name on Card *</label>
                          <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="As on your card"
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--color-border)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      </div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === "netbanking" && (
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "10px" }}>Select Your Bank</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                          {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Other"].map((bank) => (
                            <button key={bank} type="button" style={{
                              padding: "12px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                              border: "1.5px solid var(--color-border)", background: "white",
                              color: "var(--color-text-main)", cursor: "pointer", textAlign: "center"
                            }}>
                              <i className="fa-solid fa-building-columns block text-primary mb-1 text-lg"></i>
                              {bank}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wallet */}
                    {paymentMethod === "wallet" && (
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "10px" }}>Select Wallet</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                          {["Paytm", "PhonePe", "Google Pay", "Amazon Pay", "MobiKwik", "Freecharge"].map((wallet) => (
                            <button key={wallet} type="button" style={{
                              padding: "12px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                              border: "1.5px solid var(--color-border)", background: "white",
                              color: "var(--color-text-main)", cursor: "pointer", textAlign: "center"
                            }}>
                              <i className="fa-solid fa-wallet block text-secondary mb-1 text-lg"></i>
                              {wallet}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terms */}
                    <div style={{ marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <input
                        type="checkbox"
                        id="terms-agree"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        style={{ marginTop: "2px", cursor: "pointer" }}
                      />
                      <label htmlFor="terms-agree" style={{ fontSize: "12px", color: "var(--color-text-muted)", cursor: "pointer" }}>
                        I agree to the{" "}
                        <Link href="/customer/about" style={{ color: "var(--color-primary)", fontWeight: 700 }}>Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="/customer/about" style={{ color: "var(--color-primary)", fontWeight: 700 }}>Cancellation Policy</Link>.
                        I confirm the booking details are correct.
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        padding: "14px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "14px",
                        border: "1.5px solid var(--color-border)", background: "white",
                        color: "var(--color-text-main)", cursor: "pointer"
                      }}
                    >
                      <i className="fa-solid fa-arrow-left mr-2"></i>Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 1, background: isSubmitting ? "var(--color-text-muted)" : "var(--color-secondary)",
                        color: "white", padding: "14px", borderRadius: "10px",
                        fontWeight: 800, fontSize: "15px", border: "none",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                      }}
                    >
                      {isSubmitting ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Processing Payment...</>
                      ) : (
                        <><i className="fa-solid fa-lock"></i> Pay {formatCurrency(grandTotal)} Securely</>
                      )}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", justifyContent: "center" }}>
                    <i className="fa-solid fa-shield-halved text-success text-sm"></i>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      256-bit SSL encrypted • PCI DSS compliant • RBI approved payment gateway
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Booking Summary */}
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <img
                  src={booking.image}
                  alt={booking.propertyName}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "4px" }}>{booking.propertyName}</h3>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                    <i className="fa-solid fa-location-dot mr-1"></i>{booking.city}
                  </p>
                  <hr style={{ borderColor: "var(--color-border)", marginBottom: "16px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Check-in</span>
                      <span style={{ fontWeight: 600 }}>{booking.checkIn}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Check-out</span>
                      <span style={{ fontWeight: 600 }}>{booking.checkOut}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Duration</span>
                      <span style={{ fontWeight: 600 }}>{booking.nights} night{booking.nights !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Guests</span>
                      <span style={{ fontWeight: 600 }}>{booking.guests} guest{booking.guests !== 1 ? "s" : ""}</span>
                    </div>
                    <hr style={{ borderColor: "var(--color-border)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        {formatCurrency(booking.price)} × {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(booking.total)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>GST & Taxes (12%)</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(taxes)}</span>
                    </div>
                    <hr style={{ borderColor: "var(--color-border)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--color-primary)" }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--color-primary)" }}>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <div style={{
                    marginTop: "16px", padding: "10px 14px", borderRadius: "8px",
                    background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
                    display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--color-success)"
                  }}>
                    <i className="fa-solid fa-shield-halved"></i>
                    <span><strong>Free cancellation</strong> until 24 hrs before check-in</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px", background: "white", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "16px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "10px" }}>
                  <i className="fa-solid fa-headset mr-2 text-secondary"></i>Need Help?
                </h4>
                <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  Call us 24/7 at <strong>+91-8800-TRAVEL</strong> or email <strong>support@makeeasytrip.com</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CheckoutLoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading checkout...</p>
    </div>
  </div>
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
