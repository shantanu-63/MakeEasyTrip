"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import Link from "next/link";

export default function CustomerHomePage() {
  const router = useRouter();
  const { banners, addLog } = useData();

  // Search widgets active tab: "hotels" | "activities" | "ai"
  const [activeTab, setActiveTab] = useState<"hotels" | "activities" | "ai">("hotels");

  // Hotel search inputs
  const [hotelCity, setHotelCity] = useState("Goa");
  const [hotelCheckIn, setHotelCheckIn] = useState("2026-06-10");
  const [hotelCheckOut, setHotelCheckOut] = useState("2026-06-17");
  const [hotelGuests, setHotelGuests] = useState("2");

  // Activity search inputs
  const [activityCity, setActivityCity] = useState("Goa");
  const [activityDate, setActivityDate] = useState("2026-06-12");
  const [activityType, setActivityType] = useState("all");
  const [activityGuests, setActivityGuests] = useState("2");

  // AI planner inputs
  const [aiCity, setAiCity] = useState("Goa");
  const [aiDuration, setAiDuration] = useState("5");
  const [aiBudget, setAiBudget] = useState("Moderate");
  const [aiDate, setAiDate] = useState("2026-06-12");
  const [aiTravelers, setAiTravelers] = useState("2");
  const [aiInterests, setAiInterests] = useState("Relaxation & Spa");

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const publishedBanners = banners.filter((b) => b.status === "Published");

  useEffect(() => {
    if (publishedBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % publishedBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [publishedBanners.length]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#about" || hash === "#traveler-about-section") {
        const aboutEl = document.getElementById("traveler-about-section");
        if (aboutEl) {
          aboutEl.scrollIntoView({ behavior: "smooth" });
        }
      } else if (hash === "#panel-ai" || hash === "#ai-planner" || hash === "#ai") {
        setActiveTab("ai");
        setTimeout(() => {
          const widgetEl = document.querySelector(".search-widget");
          if (widgetEl) {
            widgetEl.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Run on mount
    handleHashChange();

    // Listen for hash change events
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const activeBanner = publishedBanners[currentSlide] || null;

  const handleHotelSearch = () => {
    addLog(`SEARCH: Hotels search triggered for ${hotelCity}`);
    router.push(
      `/customer/hotels?city=${hotelCity}&checkin=${hotelCheckIn}&checkout=${hotelCheckOut}&guests=${hotelGuests}`
    );
  };

  const handleActivitySearch = () => {
    addLog(`SEARCH: Activities search triggered for ${activityCity}`);
    router.push(
      `/customer/activities?city=${activityCity}&date=${activityDate}&type=${activityType}&guests=${activityGuests}`
    );
  };

  const handleAiPlanGenerate = () => {
    addLog(`AI_PLANNER: Custom itinerary generated for ${aiCity}`);
    router.push(
      `/customer/ai-planner?city=${aiCity}&duration=${aiDuration}&budget=${aiBudget}&date=${aiDate}&travelers=${aiTravelers}&interests=${aiInterests}`
    );
  };

  const shortcutSearch = (city: string) => {
    router.push(`/customer/hotels?city=${city}`);
  };

  // Inline dynamic background style for the hero section
  const heroStyle: React.CSSProperties = activeBanner
    ? {
        backgroundImage: `linear-gradient(rgba(10, 34, 92, 0.75), rgba(6, 21, 59, 0.85)), url('${activeBanner.imageUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.5s ease-in-out",
      }
    : {
        backgroundImage: `linear-gradient(rgba(10, 34, 92, 0.75), rgba(6, 21, 59, 0.85)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };

  return (
    <section id="traveler-home-view" className="traveler-subview">
      {/* Hero Banner */}
      <div className="hero-section" style={heroStyle}>
        <div className="container">
          <h1 className="hero-title">
            {activeBanner ? activeBanner.title : "Where would you like to escape?"}
          </h1>
          <p className="hero-subtitle">
            {activeBanner
              ? activeBanner.subtitle
              : "Making Travel Easier, Smarter & More Accessible — Powered by MakeEasyTrip Travel Tech Pvt Ltd"}
          </p>

          {/* Floating Search Card */}
          <div className="search-widget">
            {/* Navigation Tabs */}
            <div className="search-tabs">
              <button
                className={`search-tab-btn ${activeTab === "hotels" ? "active" : ""}`}
                onClick={() => setActiveTab("hotels")}
              >
                <i className="fa-solid fa-hotel text-orange-500 mr-1"></i> Hotels
              </button>
              <button
                className={`search-tab-btn ${activeTab === "activities" ? "active" : ""}`}
                onClick={() => setActiveTab("activities")}
              >
                <i className="fa-solid fa-compass text-orange-500 mr-1"></i> Activities
              </button>
              <button
                className={`search-tab-btn ${activeTab === "ai" ? "active" : ""}`}
                onClick={() => setActiveTab("ai")}
              >
                <i className="fa-solid fa-robot text-orange-500 mr-1"></i> AI Travel Planner
              </button>
            </div>

            {/* Form Panels */}
            <div className="search-form-container">
              {/* Panel 1: HOTELS */}
              {activeTab === "hotels" && (
                <div className="search-tab-panel active-panel" id="panel-hotels">
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label>Destination City</label>
                      <select value={hotelCity} onChange={(e) => setHotelCity(e.target.value)}>
                        <option value="Goa">Goa, India</option>
                        <option value="Bali">Bali, Indonesia</option>
                        <option value="Tokyo">Tokyo, Japan</option>
                        <option value="Paris">Paris, France</option>
                        <option value="Maldives">Maldives, Indian Ocean</option>
                        <option value="Jaipur">Jaipur, India</option>
                        <option value="Manali">Manali, India</option>
                        <option value="Udaipur">Udaipur, India</option>
                        <option value="Rishikesh">Rishikesh, India</option>
                        <option value="Kerala">Kerala, India</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Check In</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                      />
                    </div>
                    <div className="search-field-box">
                      <label>Check Out</label>
                      <input
                        type="date"
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                      />
                    </div>
                    <div className="search-field-box">
                      <label>Guests & Rooms</label>
                      <select value={hotelGuests} onChange={(e) => setHotelGuests(e.target.value)}>
                        <option value="1">1 Guest, 1 Room</option>
                        <option value="2">2 Guests, 1 Room</option>
                        <option value="4">4 Guests, 2 Rooms</option>
                        <option value="6">6 Guests, 3 Rooms</option>
                      </select>
                    </div>
                  </div>
                  <div className="search-submit-container">
                    <button className="search-submit-btn" onClick={handleHotelSearch}>
                      <i className="fa-solid fa-magnifying-glass mr-1"></i> Search Hotels
                    </button>
                  </div>
                </div>
              )}

              {/* Panel 2: ACTIVITIES */}
              {activeTab === "activities" && (
                <div className="search-tab-panel active-panel" id="panel-activities">
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label>Location / Region</label>
                      <select
                        value={activityCity}
                        onChange={(e) => setActivityCity(e.target.value)}
                      >
                        <option value="Goa">Goa, India</option>
                        <option value="Bali">Bali, Indonesia</option>
                        <option value="Tokyo">Tokyo, Japan</option>
                        <option value="Paris">Paris, France</option>
                        <option value="Maldives">Maldives, Indian Ocean</option>
                        <option value="Jaipur">Jaipur, India</option>
                        <option value="Manali">Manali, India</option>
                        <option value="Udaipur">Udaipur, India</option>
                        <option value="Rishikesh">Rishikesh, India</option>
                        <option value="Kerala">Kerala, India</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Preferred Date</label>
                      <input
                        type="date"
                        value={activityDate}
                        onChange={(e) => setActivityDate(e.target.value)}
                      />
                    </div>
                    <div className="search-field-box">
                      <label>Experience Type</label>
                      <select
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                      >
                        <option value="all">All Experiences</option>
                        <option value="water-sports">Water Sports</option>
                        <option value="adventure">Outdoor Adventure</option>
                        <option value="cultural">Culture & Art Tours</option>
                        <option value="luxury">Luxury & Yachting</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Participants</label>
                      <select
                        value={activityGuests}
                        onChange={(e) => setActivityGuests(e.target.value)}
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="5">5+ Group</option>
                      </select>
                    </div>
                  </div>
                  <div className="search-submit-container">
                    <button className="search-submit-btn" onClick={handleActivitySearch}>
                      <i className="fa-solid fa-compass mr-1"></i> Find Activities
                    </button>
                  </div>
                </div>
              )}

              {/* Panel 3: AI TRIP PLANNER */}
              {activeTab === "ai" && (
                <div className="search-tab-panel active-panel ai-planner-panel" id="panel-ai">
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label>Destination</label>
                      <select value={aiCity} onChange={(e) => setAiCity(e.target.value)}>
                        <option value="Goa">Goa, India</option>
                        <option value="Bali">Bali, Indonesia</option>
                        <option value="Tokyo">Tokyo, Japan</option>
                        <option value="Paris">Paris, France</option>
                        <option value="Jaipur">Jaipur, India</option>
                        <option value="Manali">Manali, India</option>
                        <option value="Udaipur">Udaipur, India</option>
                        <option value="Rishikesh">Rishikesh, India</option>
                        <option value="Kerala">Kerala, India</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Duration</label>
                      <select value={aiDuration} onChange={(e) => setAiDuration(e.target.value)}>
                        <option value="3">3 Days (Weekend Escape)</option>
                        <option value="5">5 Days (Standard Explorer)</option>
                        <option value="7">7 Days (Full Adventure)</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Budget Tier</label>
                      <select value={aiBudget} onChange={(e) => setAiBudget(e.target.value)}>
                        <option value="Budget">Budget ($ - Value focused)</option>
                        <option value="Moderate">Moderate ($$ - Balanced)</option>
                        <option value="Luxury">Luxury ($$$ - Premium Stays)</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Travel Date</label>
                      <input
                        type="date"
                        value={aiDate}
                        onChange={(e) => setAiDate(e.target.value)}
                      />
                    </div>
                    <div className="search-field-box">
                      <label>Travelers</label>
                      <select
                        value={aiTravelers}
                        onChange={(e) => setAiTravelers(e.target.value)}
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="4">4 People</option>
                        <option value="6">6+ Group</option>
                      </select>
                    </div>
                    <div className="search-field-box">
                      <label>Travel Interests</label>
                      <select
                        value={aiInterests}
                        onChange={(e) => setAiInterests(e.target.value)}
                      >
                        <option value="Adventure & Sports">Adventure & Water Sports</option>
                        <option value="Culture & History">Culture & Historical Sites</option>
                        <option value="Relaxation & Spa">Relaxation & Leisure Stays</option>
                        <option value="Foodie Tour">Culinary & Nightlife</option>
                      </select>
                    </div>
                  </div>
                  <div className="search-submit-container">
                    <button className="search-submit-btn" onClick={handleAiPlanGenerate}>
                      <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Generate AI Itinerary
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="offers-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Exclusive Deals & Offers</h2>
            <p className="section-subtitle">
              Unlock limited-time discounts on premium hotels and adventure packages
            </p>
          </div>
        </div>
        <div className="offers-grid">
          {banners
            .filter((b) => b.status === "Published" || b.status === "Live")
            .slice(0, 3)
            .map((b) => {
              const codeMatch = b.subtitle.match(/CODE:\s*([A-Z0-9]+)/i) || b.title.match(/CODE:\s*([A-Z0-9]+)/i);
              const code = codeMatch ? codeMatch[1].toUpperCase() : "METDEAL";
              return (
                <div className="offer-card flex flex-col justify-between" key={b.id}>
                  <div className="offer-img-box">
                    <img src={b.imageUrl} alt={b.title} />
                  </div>
                  <div className="offer-info flex flex-col justify-between flex-grow p-4">
                    <div>
                      <span className="offer-tag">{b.type || "Seasonal Deal"}</span>
                      <h3 className="offer-title text-sm font-bold text-primary mt-1 leading-snug">
                        {b.title}
                      </h3>
                      <p className="offer-desc text-[11px] text-text-muted mt-1 leading-tight">
                        {b.subtitle}
                      </p>
                    </div>
                    <div className="offer-code flex justify-between items-center mt-4">
                      <span className="text-primary font-bold text-xs">
                        CODE:{" "}
                        <span className="border border-dashed border-secondary px-1.5 py-0.5 bg-slate-50 text-[10px] rounded text-secondary ml-1 font-mono">
                          {code}
                        </span>
                      </span>
                      <Link
                        href={b.ctaLink || "/customer/hotels"}
                        className="bg-primary hover:bg-primary-light text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm"
                      >
                        {b.ctaText || "Grab Deal"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Handpicked Collections / Popular Destinations */}
      <div className="destinations-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Destinations</h2>
              <p className="section-subtitle">
                Stunning locations that travelers are raving about this season
              </p>
            </div>
          </div>
          <div className="grid grid-4 gap-6">
            {/* Card 1 */}
            <div className="destination-card cursor-pointer" onClick={() => shortcutSearch("Goa")}>
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
                alt="Goa"
              />
              <div className="destination-overlay">
                <h3 className="destination-name">Goa, India</h3>
                <p className="destination-count">48 Premium Properties</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="destination-card cursor-pointer" onClick={() => shortcutSearch("Bali")}>
              <img
                src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80"
                alt="Bali"
              />
              <div className="destination-overlay">
                <h3 className="destination-name">Bali, Indonesia</h3>
                <p className="destination-count">36 Villas & Spas</p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="destination-card cursor-pointer" onClick={() => shortcutSearch("Tokyo")}>
              <img
                src="https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80"
                alt="Tokyo"
              />
              <div className="destination-overlay">
                <h3 className="destination-name">Tokyo, Japan</h3>
                <p className="destination-count">19 Central Hotels</p>
              </div>
            </div>
            {/* Card 4 */}
            <div className="destination-card cursor-pointer" onClick={() => shortcutSearch("Paris")}>
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80"
                alt="Paris"
              />
              <div className="destination-overlay">
                <h3 className="destination-name">Paris, France</h3>
                <p className="destination-count">25 Historic Stays</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews / Testimonials */}
      <div className="reviews-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">What Our Travelers Say</h2>
            <p className="section-subtitle">
              Real feedback from tourists who booked their dreams through Make Easy Trip
            </p>
          </div>
        </div>
        <div className="review-slider-grid">
          <div className="customer-review-card">
            <div className="reviewer-profile">
              <div className="reviewer-avatar">RK</div>
              <div>
                <h4 className="reviewer-name">Rahul K.</h4>
                <p className="reviewer-location">New Delhi, India</p>
              </div>
            </div>
            <div className="star-rating">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p className="review-text">
              "The booking was smooth as butter. We searched for a beachfront villa in Goa and paid
              using the unified checkout. The partner was notified immediately and confirmed our
              check-in details within minutes."
            </p>
          </div>
          <div className="customer-review-card">
            <div className="reviewer-profile">
              <div className="reviewer-avatar">AM</div>
              <div>
                <h4 className="reviewer-name">Amanda M.</h4>
                <p className="reviewer-location">Sydney, Australia</p>
              </div>
            </div>
            <div className="star-rating">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <p className="review-text">
              "I used the AI Travel Planner to schedule my 5-day solo trip to Tokyo. It generated an
              incredible custom day-by-day plan packed with specific sub-activities. Saved me hours
              of research!"
            </p>
          </div>
          <div className="customer-review-card">
            <div className="reviewer-profile">
              <div className="reviewer-avatar">TP</div>
              <div>
                <h4 className="reviewer-name">Tanmay P.</h4>
                <p className="reviewer-location">Pune, India</p>
              </div>
            </div>
            <div className="star-rating">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p className="review-text">
              "Superb customer support! We had a payment query regarding a water sports operator at
              Anjuna Beach. The support agent resolved the ticket dynamically. Extremely premium booking
              platform!"
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="why-choose-us-section">
        <div className="container">
          <div className="section-header text-center justify-center mb-8">
            <div className="text-center w-full">
              <h2 className="section-title">Why Choose Make Easy Trip</h2>
              <p className="section-subtitle">
                We design premium, hassle-free travel experiences powered by smart tech and local
                insights
              </p>
            </div>
          </div>
          <div className="why-cards-grid">
            <div className="why-card">
              <div className="why-icon">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3>AI-Powered Planning</h3>
              <p>
                Generate highly personalized day-by-day itineraries tailored to your budget and
                travel interests in seconds.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3>100% Secure Checkout</h3>
              <p>
                All platform transactions are secured via Razorpay SSL encrypted checkouts with
                dynamic confirmation tracking.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h3>24/7 Expert Support</h3>
              <p>
                Our dedicated customer support agents and interactive AI support bot are available
                around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US: Company Profile Section */}
      <section className="about-section" id="traveler-about-section" style={{ position: "relative" }}>
        <div id="about" style={{ position: "absolute", top: "-80px" }}></div>
        <div className="container">
          <div className="about-header">
            <span className="about-tagline-badge">
              <i className="fa-solid fa-globe"></i> Travel Tech Company
            </span>
            <h2 className="section-title">About MakeEasyTrip</h2>
            <p className="section-subtitle">
              MakeEasyTrip Travel Tech Pvt Ltd is an emerging travel technology company dedicated to
              transforming the travel and hospitality industry through innovation, digital
              solutions, and customer-centric services.
            </p>
          </div>

          {/* Vision & Mission Cards */}
          <div className="about-vm-grid">
            <div className="about-vm-card vision-card">
              <div className="about-vm-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>
                To build a world-class travel technology platform that connects travelers,
                hospitality providers, and travel businesses through innovation and trust.
              </p>
            </div>
            <div className="about-vm-card mission-card">
              <div className="about-vm-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h3>Our Mission</h3>
              <p>
                To simplify travel through technology, enhance customer experiences, and create
                sustainable growth opportunities for travel and hospitality partners worldwide.
              </p>
            </div>
          </div>

          {/* Key Services Grid */}
          <h3 className="about-services-title">
            <i className="fa-solid fa-check-double mr-2 text-secondary"></i>
            Our Key Services
          </h3>
          <div className="about-services-grid">
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-hotel"></i>
              </div>
              <h4>
                Hotel & Resort
                <br />
                Booking
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-umbrella-beach"></i>
              </div>
              <h4>
                Domestic & Int'l
                <br />
                Holiday Packages
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-passport"></i>
              </div>
              <h4>
                Visa & Travel
                <br />
                Documentation
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-van-shuttle"></i>
              </div>
              <h4>
                Transportation &
                <br />
                Airport Transfers
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <h4>
                Corporate Travel
                <br />
                Solutions
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-code"></i>
              </div>
              <h4>
                Travel Technology
                <br />
                Development
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <h4>
                Hospitality Partner
                <br />
                Solutions
              </h4>
            </div>
            <div className="about-service-card">
              <div className="about-service-icon">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h4>
                Destination
                <br />
                Management
              </h4>
            </div>
          </div>

          {/* Company Stats Bar */}
          <div className="about-stats-bar">
            <div className="about-stat-item">
              <span className="about-stat-number">500+</span>
              <span className="about-stat-label">Hotel Partners</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">50+</span>
              <span className="about-stat-label">Destinations</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">14K+</span>
              <span className="about-stat-label">Happy Travelers</span>
            </div>
            <div className="about-stat-item">
              <span className="about-stat-number">24/7</span>
              <span className="about-stat-label">Customer Support</span>
            </div>
          </div>

          {/* Company Name & Tagline */}
          <div className="about-company-bottom">
            <span className="about-pvt-badge">Travel Tech Pvt Ltd</span>
            <span className="about-company-name">MakeEasyTrip Travel Tech Pvt Ltd</span>
            <span className="text-text-muted">—</span>
            <span className="about-company-tagline">
              "Making Travel Easier, Smarter & More Accessible."
            </span>
          </div>
        </div>
      </section>
    </section>
  );
}
