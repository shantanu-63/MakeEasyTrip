"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import Link from "next/link";

function AIPlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { properties, activeUser, addLog } = useData();

  // Parse parameters from query string
  const city = searchParams.get("city") || "Goa";
  const duration = parseInt(searchParams.get("duration") || "5");
  const budget = searchParams.get("budget") || "Moderate";
  const dateInput = searchParams.get("date") || "2026-06-12";
  const travelers = parseInt(searchParams.get("travelers") || "2");
  const interests = searchParams.get("interests") || "Relaxation & Spa";

  const cityCountryMap: Record<string, string> = {
    Goa: "Goa, India",
    Bali: "Bali, Indonesia",
    Tokyo: "Tokyo, Japan",
    Paris: "Paris, France",
    Jaipur: "Jaipur, India",
    Manali: "Manali, India",
    Udaipur: "Udaipur, India",
    Rishikesh: "Rishikesh, India",
    Kerala: "Kerala, India",
  };

  const cityDisplay = cityCountryMap[city] || city;

  // Static timeline itinerary templates
  const templates: Record<string, Array<{ title: string; act: string }>> = {
    Goa: [
      { title: "Ocean Breeze & Sunsets", act: "Relaxing walks along Candolim Beach. Evening seafood buffet at local shacks." },
      { title: "Heritage & Culture", act: "Explore Basilica of Bom Jesus and Latin Quarter in Panaji." },
      { title: "Dolphin Sighting & Island Tour", act: "Early morning boat cruise to Grande Island. Snorkeling session." },
    ],
    Bali: [
      { title: "Ubud Rainforest Spiritual Tour", act: "Visit Monkey Forest Temple, Tegalalang Rice Terraces, and local spa." },
      { title: "Volcano Sunrise Trek", act: "Early morning guided trek to Mount Batur summit. Breakfast on steam vents." },
      { title: "Beachfront Relaxations", act: "Sunset watching at Uluwatu Temple, followed by Jimbaran seafood dinner." },
    ],
    Tokyo: [
      { title: "Futuristic Shinjuku & Shibuya", act: "Cross Shibuya Crossing, visit Tokyo Metropolitan building, explore neon lanes." },
      { title: "Historic Asakusa & Akihabara", act: "Senso-ji Temple exploration, followed by anime and tech crawls." },
      { title: "Mt Fuji Day Escapade", act: "Bullet train to Lake Kawaguchiko for panoramic mountain views." },
    ],
    Paris: [
      { title: "Eiffel Tower & Seine Cruise", act: "Ascend the iconic monument for panoramic views, followed by a romantic sunset river cruise." },
      { title: "Louvre Museum & Historic Paris", act: "Explore masterpieces like Mona Lisa in Louvre. Visit Notre Dame cathedral and Latin Quarter." },
      { title: "Versailles Royal Palace", act: "Take a day excursion to Palace of Versailles, exploring Hall of Mirrors and royal gardens." },
    ],
    Jaipur: [
      { title: "Amber Fort & Hawa Mahal", act: "Ascend Amber Fort on elephant back. Visit Palace of Winds (Hawa Mahal) and City Palace." },
      { title: "Jantar Mantar & Bazaar Shopping", act: "Explore royal observatory (Jantar Mantar). Shop block-print textiles in Johari Bazaar." },
      { title: "Chokhi Dhani Rajasthani Village", act: "Evening traditional dance, camel rides, and authentic wood-fired Rajasthani thali dinner." },
    ],
    Manali: [
      { title: "Hadimba Temple & Solang Valley", act: "Visit wooden Hadimba temple in cedar forests. Try paragliding & zorbing in Solang Valley." },
      { title: "Rohtang Pass Snow Adventure", act: "Drive up to Rohtang Pass for snow sliding, photography, and panoramic Himalayan views." },
      { title: "Jogini Falls & Old Manali Cafes", act: "Short trek to scenic Jogini Waterfalls, followed by live music cafes crawl in Old Manali." },
    ],
    Udaipur: [
      { title: "City Palace & Lake Pichola Cruise", act: "Explore the giant City Palace complex. Take a sunset boat cruise around Lake Palace." },
      { title: "Saheliyon-ki-Bari & Sajjangarh", act: "Visit royal gardens of fountains. Drive up to Monsoon Palace (Sajjangarh) for sunset." },
      { title: "Dharohar Folk Dance & Lakeside Dining", act: "Watch traditional puppetry at Bagore-ki-Haveli, followed by candlelit dinner at Ambrai." },
    ],
    Rishikesh: [
      { title: "Lakshman Jhula & Ganga Aarti", act: "Walk across historic suspension bridges. Attend spiritual Ganga Aarti ceremony at Triveni Ghat." },
      { title: "White Water Rafting & Camping", act: "Thrilling 16km rafting down Ganges rapids. Bonfire & luxury camping on sandy river beaches." },
      { title: "Neer Garh Waterfall Hike & Yoga", act: "Sunrise yoga class at ashram. Hike to Neer Garh waterfalls for a refreshing natural pool dip." },
    ],
    Kerala: [
      { title: "Munnar Tea Gardens Exploration", act: "Walk through green tea estates of Munnar. Visit Tea Museum and Echo Point." },
      { title: "Alleppey Houseboat Backwater Cruise", act: "Board a traditional Kettuvallam houseboat. Sail through canals under coconut palms with fresh Kerala food." },
      { title: "Fort Kochi Heritage & Kathakali", act: "See historic Chinese Fishing Nets & St Francis Church. Evening Kathakali dance performance." },
    ],
  };

  const daysList = templates[city] || templates["Goa"];

  // Filter Recommended Hotels matching City & Budget
  const allApproved = properties.filter((p) => p.status === "Approved");
  const cityHotels = allApproved.filter(
    (p) => p.type === "hotel" && p.city.toLowerCase() === city.toLowerCase()
  );

  let matchedHotels = [];
  if (budget === "Budget") {
    matchedHotels = cityHotels.filter((h) => h.price <= 6000);
  } else if (budget === "Moderate") {
    matchedHotels = cityHotels.filter((h) => h.price > 6000 && h.price <= 15000);
  } else {
    matchedHotels = cityHotels.filter((h) => h.price > 15000);
  }
  if (matchedHotels.length === 0) matchedHotels = cityHotels;
  matchedHotels.sort((a, b) => b.rating - a.rating);

  // Filter Recommended Activities matching City & Interests
  const cityActivities = allApproved.filter(
    (p) => p.type === "activity" && p.city.toLowerCase() === city.toLowerCase()
  );

  let matchedActivities = [];
  const lowerInterest = interests.toLowerCase();
  if (lowerInterest.includes("adventure")) {
    matchedActivities = cityActivities.filter(
      (a) =>
        a.title.toLowerCase().includes("scuba") ||
        a.title.toLowerCase().includes("rafting") ||
        a.title.toLowerCase().includes("safari") ||
        a.title.toLowerCase().includes("trek") ||
        a.title.toLowerCase().includes("water")
    );
  } else if (lowerInterest.includes("culture")) {
    matchedActivities = cityActivities.filter(
      (a) =>
        a.title.toLowerCase().includes("culture") ||
        a.title.toLowerCase().includes("heritage") ||
        a.title.toLowerCase().includes("temple") ||
        a.title.toLowerCase().includes("dance") ||
        a.title.toLowerCase().includes("cruise")
    );
  } else if (lowerInterest.includes("relaxation")) {
    matchedActivities = cityActivities.filter(
      (a) =>
        a.title.toLowerCase().includes("spa") ||
        a.title.toLowerCase().includes("yacht") ||
        a.title.toLowerCase().includes("sunset") ||
        a.title.toLowerCase().includes("cruise") ||
        a.title.toLowerCase().includes("boat")
    );
  } else {
    matchedActivities = cityActivities.filter(
      (a) =>
        a.title.toLowerCase().includes("food") ||
        a.title.toLowerCase().includes("culinary") ||
        a.title.toLowerCase().includes("night") ||
        a.title.toLowerCase().includes("walk")
    );
  }
  if (matchedActivities.length === 0) matchedActivities = cityActivities;
  matchedActivities.sort((a, b) => b.rating - a.rating);

  // Budget Estimations
  const hotelEstimatePerNight =
    matchedHotels.length > 0
      ? matchedHotels.reduce((acc, h) => acc + h.price, 0) / matchedHotels.length
      : budget === "Budget"
      ? 3000
      : budget === "Moderate"
      ? 8000
      : 25000;

  const roomsNeeded = Math.ceil(travelers / 2);
  const totalStayEstimate = Math.round(hotelEstimatePerNight * duration * roomsNeeded);

  const activityEstimatePerPerson =
    matchedActivities.length > 0
      ? matchedActivities.reduce((acc, a) => acc + a.price, 0) / matchedActivities.length
      : budget === "Budget"
      ? 1000
      : budget === "Moderate"
      ? 2500
      : 8000;

  const activitiesCount = Math.ceil(duration / 2);
  const totalActivityEstimate = Math.round(activityEstimatePerPerson * travelers * activitiesCount);

  const transportRate = budget === "Budget" ? 500 : budget === "Moderate" ? 1200 : 3000;
  const totalTransportEstimate = transportRate * travelers * duration;

  const grandTotalEstimate = totalStayEstimate + totalActivityEstimate + totalTransportEstimate;

  const formatFriendlyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleCardClick = (type: "hotel" | "activity", id: string) => {
    const routeType = type === "activity" ? "activities" : "hotels";
    router.push(`/customer/${routeType}/${id}`);
  };

  return (
    <div className="container ai-planner-output-view px-6 py-8">
      <Link
        href="/customer"
        className="text-xs font-semibold text-secondary mb-6 inline-block hover:underline"
      >
        <i className="fa-solid fa-chevron-left mr-1"></i> Plan Another Trip
      </Link>

      {/* Planner Summary Box */}
      <div className="planner-summary-header bg-primary text-white p-8 rounded-lg mb-8">
        <i className="fa-solid fa-robot text-secondary text-4xl mb-3"></i>
        <h2 className="text-2xl font-bold font-heading">
          Custom Itinerary for {cityDisplay} ({duration} Days)
        </h2>
        <p className="text-sm opacity-80 mt-1">
          Crafted dynamically by the Make Easy Trip AI Assistant
        </p>

        <div className="planner-summary-grid mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Destination</span>
            <span className="font-bold">{cityDisplay}</span>
          </div>
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Duration</span>
            <span className="font-bold">{duration} Days</span>
          </div>
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Budget Tier</span>
            <span className="font-bold">{budget}</span>
          </div>
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Key Focus</span>
            <span className="font-bold">{interests}</span>
          </div>
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Travel Date</span>
            <span className="font-bold">{formatFriendlyDate(dateInput)}</span>
          </div>
          <div className="planner-summary-item flex flex-col">
            <span className="text-[11px] text-slate-300">Travelers</span>
            <span className="font-bold">
              {travelers} {travelers === 1 ? "Person" : "People"}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Itinerary day-by-day Timeline */}
      <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
        <i className="fa-solid fa-calendar-day text-secondary"></i> Your Day-by-Day Journey
      </h3>
      <div className="timeline-container flex flex-col gap-6 mb-10 pl-6 border-l-2 border-slate-200">
        {Array.from({ length: duration }).map((_, index) => {
          const itemIdx = index % daysList.length;
          const info = daysList[itemIdx];
          const dayNumber = index + 1;
          return (
            <div className="timeline-item relative" key={dayNumber}>
              <div className="timeline-badge absolute -left-10 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm">
                {dayNumber}
              </div>
              <div className="timeline-content bg-white p-6 rounded-lg border border-border shadow-sm">
                <h4 className="text-sm font-extrabold text-primary">{info.title}</h4>
                <p className="text-xs text-text-main mt-1 leading-relaxed">{info.act}</p>
                <div className="timeline-amenity-tags mt-3">
                  <span className="text-[10px] bg-bg-light border border-border px-2.5 py-1 rounded-full font-semibold text-text-muted">
                    <i className="fa-solid fa-plane-arrival mr-1"></i> Plan: {interests} ({budget})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Planner Breakdown */}
      <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 mt-12">
        <i className="fa-solid fa-wallet text-secondary"></i> Estimated Budget Breakdown
      </h3>
      <div className="planner-budget-card bg-white border border-border rounded-lg p-6 mb-10 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-bg-light rounded">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Stays Estimate
            </div>
            <h4 className="text-lg font-extrabold text-primary mt-2">
              ₹{totalStayEstimate.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="p-4 bg-bg-light rounded">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Activities Estimate
            </div>
            <h4 className="text-lg font-extrabold text-primary mt-2">
              ₹{totalActivityEstimate.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="p-4 bg-bg-light rounded">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Local Transport
            </div>
            <h4 className="text-lg font-extrabold text-primary mt-2">
              ₹{totalTransportEstimate.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="p-4 bg-primary text-white rounded">
            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
              Total Estimated Cost
            </div>
            <h4 className="text-xl font-extrabold text-secondary mt-2">
              ₹{grandTotalEstimate.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>
      </div>

      {/* Recommended Stays */}
      <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 mt-12">
        <i className="fa-solid fa-hotel text-secondary"></i> Recommended Stays
      </h3>
      <div className="listings-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {matchedHotels.slice(0, 3).map((item) => (
          <div
            className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            key={item.id}
            onClick={() => handleCardClick("hotel", item.id)}
          >
            <div className="listing-img-box relative h-48 w-full bg-slate-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <span className="listing-badge absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded">
                PREMIUM STAY
              </span>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                <p className="text-[11px] text-text-muted mt-1">
                  <i className="fa-solid fa-map-pin mr-1"></i> {item.location}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 text-[10px] font-bold rounded">
                    ★ {item.rating}
                  </span>
                  <span className="text-[10px] text-text-muted">({item.ratingCount} reviews)</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                <div>
                  <span className="text-[10px] text-text-muted">Rate / Night</span>
                  <div className="text-sm font-extrabold text-primary">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>
                <button className="bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded hover:bg-primary-light">
                  View Rooms
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Experiences */}
      <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 mt-12">
        <i className="fa-solid fa-compass text-secondary"></i> Recommended Experiences
      </h3>
      <div className="listings-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {matchedActivities.slice(0, 3).map((item) => (
          <div
            className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            key={item.id}
            onClick={() => handleCardClick("activity", item.id)}
          >
            <div className="listing-img-box relative h-48 w-full bg-slate-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <span className="listing-badge absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
                POPULAR TOUR
              </span>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                <p className="text-[11px] text-text-muted mt-1">
                  <i className="fa-solid fa-map-pin mr-1"></i> {item.location}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 text-[10px] font-bold rounded">
                    ★ {item.rating}
                  </span>
                  <span className="text-[10px] text-text-muted">({item.ratingCount} reviews)</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                <div>
                  <span className="text-[10px] text-text-muted">Price / Guest</span>
                  <div className="text-sm font-extrabold text-primary">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>
                <button className="bg-primary text-white text-[11px] font-bold px-3.5 py-1.5 rounded hover:bg-primary-light">
                  Book Tour
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Generating custom AI itinerary...</p>
    </div>
  </div>
);

export default function AIPlannerPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AIPlannerContent />
    </Suspense>
  );
}
