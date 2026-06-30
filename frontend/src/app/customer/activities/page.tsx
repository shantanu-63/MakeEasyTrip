"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import Link from "next/link";

function ActivitiesListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { properties } = useData();

  // Search parameters
  const city = searchParams.get("city") || "Goa";
  const date = searchParams.get("date") || "2026-06-12";
  const type = searchParams.get("type") || "all";
  const guests = searchParams.get("guests") || "2";

  // Filter states
  const [priceLimit, setPriceLimit] = useState<number>(50000);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [activityType, setActivityType] = useState<string>(type);
  const [sortOption, setSortOption] = useState<string>("recommended");

  // Get activities for the matching city
  const activities = useMemo(() => {
    return properties.filter(
      (p) =>
        p.status === "Approved" &&
        p.type === "activity" &&
        p.city.toLowerCase() === city.toLowerCase()
    );
  }, [properties, city]);

  // Apply filters and sorting
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by Price Limit
    result = result.filter((a) => a.price <= priceLimit);

    // Filter by Star Rating
    if (selectedRatings.length > 0) {
      result = result.filter((a) => {
        return selectedRatings.some((r) => a.rating >= r);
      });
    }

    // Filter by Activity Type (if not "all")
    if (activityType !== "all") {
      result = result.filter((a) => {
        // Simple mock matching by category keywords
        const titleLower = a.title.toLowerCase();
        if (activityType === "water-sports") {
          return titleLower.includes("scuba") || titleLower.includes("dive") || titleLower.includes("water") || titleLower.includes("surf");
        } else if (activityType === "adventure") {
          return titleLower.includes("hike") || titleLower.includes("trek") || titleLower.includes("rafting") || titleLower.includes("adventure") || titleLower.includes("safari");
        } else if (activityType === "cultural") {
          return titleLower.includes("culture") || titleLower.includes("heritage") || titleLower.includes("temple") || titleLower.includes("dance") || titleLower.includes("tour");
        } else if (activityType === "luxury") {
          return titleLower.includes("yacht") || titleLower.includes("cruise") || titleLower.includes("private") || titleLower.includes("premium");
        }
        return true;
      });
    }

    // Apply Sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activities, priceLimit, selectedRatings, activityType, sortOption]);

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleCardClick = (id: string) => {
    router.push(`/customer/activities/${id}`);
  };

  const resetFilters = () => {
    setPriceLimit(50000);
    setSelectedRatings([]);
    setActivityType("all");
    setSortOption("recommended");
  };

  const formatDate = (dStr: string) => {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <div className="container search-results-container px-6 py-8">
      {/* Page Breadcrumbs & Title */}
      <div className="mb-6">
        <Link href="/customer" className="text-xs font-semibold text-secondary hover:underline">
          <i className="fa-solid fa-chevron-left mr-1"></i> Back to Search
        </Link>
        <h2 className="text-3xl font-extrabold text-primary mt-2">Activities in {city}</h2>
        <p className="text-xs text-text-muted mt-1">
          Showing experiences for {formatDate(date)} • {guests} Participants
        </p>
      </div>

      <div className="search-results-layout">
        {/* Filter Sidebar Panel */}
        <aside className="filters-sidebar bg-white p-6 border border-border rounded-lg shadow-sm">
          <h3 className="text-base font-extrabold text-primary mb-6 flex justify-between items-center">
            <span>
              <i className="fa-solid fa-sliders mr-1"></i> Filters
            </span>
            <button onClick={resetFilters} className="text-xs text-secondary font-bold hover:underline">
              Reset All
            </button>
          </h3>

          {/* Filter: Price Range */}
          <div className="filter-section mb-6">
            <h4 className="filter-title font-bold text-xs text-primary mb-3">Price Per Guest</h4>
            <div className="luxury-glass-price-card mb-4 bg-slate-50 border border-border p-3 rounded text-center">
              <span className="luxury-glass-label text-[10px] text-text-muted block">Budget Range</span>
              <div className="luxury-glass-value text-xs font-bold text-primary mt-1">
                <span>₹1,000</span> <span className="mx-1.5 text-text-muted">—</span>{" "}
                <span>₹{priceLimit.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="slider-wrapper-luxury">
              <input
                type="range"
                className="price-range-slider w-full accent-secondary"
                min="1000"
                max="50000"
                step="500"
                value={priceLimit}
                onChange={(e) => setPriceLimit(parseInt(e.target.value))}
              />
            </div>
            <div className="price-values flex justify-between text-[10px] text-text-muted mt-1.5">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Filter: Category Type */}
          <div className="filter-section mb-6 border-t border-border pt-4">
            <h4 className="filter-title font-bold text-xs text-primary mb-3">Experience Type</h4>
            <select
              className="w-full border border-border p-2 rounded outline-none text-xs text-text-main"
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

          {/* Filter: Star Rating */}
          <div className="filter-section border-t border-border pt-4">
            <h4 className="filter-title font-bold text-xs text-primary mb-3">Rating Score</h4>
            <ul className="filter-list flex flex-col gap-2.5 text-xs text-text-main">
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rating-checkbox accent-secondary"
                  checked={selectedRatings.includes(5)}
                  onChange={() => toggleRating(5)}
                />
                <span>5 Star Reviews</span>
              </li>
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rating-checkbox accent-secondary"
                  checked={selectedRatings.includes(4)}
                  onChange={() => toggleRating(4)}
                />
                <span>4 Star & Above</span>
              </li>
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rating-checkbox accent-secondary"
                  checked={selectedRatings.includes(3)}
                  onChange={() => toggleRating(3)}
                />
                <span>3 Star & Above</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Listings Column */}
        <main className="flex-grow">
          {/* Top Sort Bar */}
          <div className="listings-top-bar flex justify-between items-center mb-6 bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="results-count text-xs text-text-main">
              We found <span className="font-extrabold text-primary">{filteredActivities.length}</span>{" "}
              matches matching your criteria
            </div>
            <div className="sort-container flex items-center gap-2 text-xs">
              <label className="text-text-muted">Sort By:</label>
              <select
                className="sort-select border border-border p-1.5 rounded outline-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recommended">Popularity & Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Listings Cards List */}
          <div className="listings-grid grid grid-cols-1 sm:grid-cols-2 gap-6" id="listings-deck">
            {filteredActivities.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white border border-border rounded-lg text-text-muted text-sm">
                No experiences match your criteria in {city}. Try modifying your filters.
              </div>
            ) : (
              filteredActivities.map((item) => (
                <div
                  className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                >
                  <div className="listing-img-box relative h-48 w-full bg-slate-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="listing-badge absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      TOUR / ACTIVITY
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-primary leading-snug">{item.title}</h4>
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
                      <button className="bg-primary hover:bg-primary-light text-white text-[11px] font-bold px-3.5 py-1.5 rounded transition-colors">
                        Book Tour
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading tours & experiences...</p>
    </div>
  </div>
);

export default function ActivitiesListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ActivitiesListContent />
    </Suspense>
  );
}
