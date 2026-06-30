"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import Link from "next/link";

function GlobalSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { destinations, properties, addLog } = useData();

  const queryParam = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeQuery, setActiveQuery] = useState(queryParam);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Category filters
  const [showDestinations, setShowDestinations] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const [showActivities, setShowActivities] = useState(true);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem("met_recent_searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    } else {
      const defaultRecent = ["Goa scuba", "Bali resorts", "Paris Eiffel"];
      localStorage.setItem("met_recent_searches", JSON.stringify(defaultRecent));
      setRecentSearches(defaultRecent);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    let list = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(list);
    localStorage.setItem("met_recent_searches", JSON.stringify(list));
  };

  const handleSearchTrigger = (term: string) => {
    setActiveQuery(term);
    setSearchQuery(term);
    saveRecentSearch(term);
    addLog(`GLOBAL_SEARCH: Searched for term '${term}'`);
    router.push(`/customer/search?query=${encodeURIComponent(term)}`);
  };

  // Perform search matching
  const matches = useMemo(() => {
    const q = activeQuery.toLowerCase().trim();
    if (!q) {
      return { matchedDests: [], matchedHotels: [], matchedActs: [] };
    }

    const matchedDests = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );

    const matchedHotels = properties.filter(
      (p) =>
        p.status === "Approved" &&
        p.type === "hotel" &&
        (p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );

    const matchedActs = properties.filter(
      (p) =>
        p.status === "Approved" &&
        p.type === "activity" &&
        (p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );

    return { matchedDests, matchedHotels, matchedActs };
  }, [destinations, properties, activeQuery]);

  const handleCardClick = (type: "destinations" | "hotels" | "activities", id: string) => {
    router.push(`/customer/${type}/${id}`);
  };

  return (
    <div className="container search-results-container px-6 py-8">
      <div className="mb-6">
        <Link href="/customer" className="text-xs font-semibold text-secondary hover:underline">
          <i className="fa-solid fa-chevron-left mr-1"></i> Back to Home
        </Link>
        <h2 className="text-3xl font-extrabold text-primary mt-2">Global Platform Search</h2>
        <p className="text-xs text-text-muted mt-1">
          Find and explore all international destinations, stays, and activities instantly
        </p>
      </div>

      {/* Global Search Bar Widget */}
      <div className="search-widget bg-white p-4 border border-border rounded-lg shadow-sm mb-8 flex gap-3 items-center">
        <i className="fa-solid fa-magnifying-glass text-lg text-text-muted ml-2"></i>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchTrigger(searchQuery)}
          placeholder="Search destinations, hotels, scuba diving, tours..."
          className="flex-grow border-none text-sm font-semibold text-primary outline-none bg-transparent"
        />
        <button
          className="btn-primary px-6 py-2.5 text-xs font-bold"
          onClick={() => handleSearchTrigger(searchQuery)}
        >
          Search Now
        </button>
      </div>

      <div className="search-results-layout grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <aside className="filters-sidebar lg:col-span-1 bg-white p-6 border border-border rounded-lg shadow-sm h-fit">
          <h3 className="text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left"></i> Recent Searches
          </h3>
          <div className="recent-searches-list flex flex-col gap-2">
            {recentSearches.length === 0 ? (
              <p className="text-xs text-text-muted italic">No recent searches.</p>
            ) : (
              recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchTrigger(term)}
                  className="text-left text-xs text-text-main hover:text-secondary hover:underline truncate"
                >
                  <i className="fa-solid fa-clock mr-1 text-[10px] text-text-muted"></i>
                  {term}
                </button>
              ))
            )}
          </div>

          <h3 className="text-sm font-extrabold text-primary mb-4 mt-8 flex items-center gap-2">
            <i className="fa-solid fa-filter"></i> Search Category
          </h3>
          <ul className="filter-list flex flex-col gap-3 text-xs text-text-main">
            <li className="filter-item flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDestinations}
                onChange={() => setShowDestinations(!showDestinations)}
                className="accent-secondary"
              />
              <span>Destinations</span>
            </li>
            <li className="filter-item flex items-center gap-2">
              <input
                type="checkbox"
                checked={showHotels}
                onChange={() => setShowHotels(!showHotels)}
                className="accent-secondary"
              />
              <span>Hotels & Resorts</span>
            </li>
            <li className="filter-item flex items-center gap-2">
              <input
                type="checkbox"
                checked={showActivities}
                onChange={() => setShowActivities(!showActivities)}
                className="accent-secondary"
              />
              <span>Experiences & Tours</span>
            </li>
          </ul>
        </aside>

        {/* Results Deck */}
        <main className="lg:col-span-3 flex flex-col gap-10">
          {!activeQuery.trim() ? (
            <div className="text-center py-12 bg-white border border-border rounded-lg text-text-muted text-sm italic">
              Please enter a search query to search across the platform.
            </div>
          ) : (
            <>
              {/* Group A: Destinations */}
              {showDestinations && (
                <div id="search-group-destinations" className="search-results-group">
                  <h3 className="text-lg font-extrabold mb-4 border-b-2 border-border pb-2 text-primary flex items-center gap-2">
                    <i className="fa-solid fa-map-location-dot text-secondary"></i> Matches in Destinations
                  </h3>
                  {matches.matchedDests.length === 0 ? (
                    <p className="text-xs text-text-muted italic">No destinations match "{activeQuery}".</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {matches.matchedDests.map((item) => (
                        <div
                          className="destination-card cursor-pointer relative rounded-lg overflow-hidden h-40 border border-border group"
                          key={item.id}
                          onClick={() => handleCardClick("destinations", item.id)}
                        >
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                          <div className="destination-overlay absolute inset-0 bg-black/60 flex flex-col justify-end p-3 text-white">
                            <h4 className="text-xs font-bold leading-tight">{item.name}</h4>
                            <p className="text-[9px] opacity-80 mt-0.5">{item.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Group B: Hotels */}
              {showHotels && (
                <div id="search-group-hotels" className="search-results-group">
                  <h3 className="text-lg font-extrabold mb-4 border-b-2 border-border pb-2 text-primary flex items-center gap-2">
                    <i className="fa-solid fa-hotel text-secondary"></i> Matches in Hotels & Resorts
                  </h3>
                  {matches.matchedHotels.length === 0 ? (
                    <p className="text-xs text-text-muted italic">No hotels match "{activeQuery}".</p>
                  ) : (
                    <div className="listings-grid grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {matches.matchedHotels.map((item) => (
                        <div
                          className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                          key={item.id}
                          onClick={() => handleCardClick("hotels", item.id)}
                        >
                          <div className="listing-img-box h-40 relative">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-primary">{item.title}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5">{item.location}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                              <span className="text-xs font-extrabold text-primary">
                                ₹{item.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                                ★ {item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Group C: Activities */}
              {showActivities && (
                <div id="search-group-activities" className="search-results-group">
                  <h3 className="text-lg font-extrabold mb-4 border-b-2 border-border pb-2 text-primary flex items-center gap-2">
                    <i className="fa-solid fa-compass text-secondary"></i> Matches in Experiences
                  </h3>
                  {matches.matchedActs.length === 0 ? (
                    <p className="text-xs text-text-muted italic">No experiences match "{activeQuery}".</p>
                  ) : (
                    <div className="listings-grid grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {matches.matchedActs.map((item) => (
                        <div
                          className="listing-card bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                          key={item.id}
                          onClick={() => handleCardClick("activities", item.id)}
                        >
                          <div className="listing-img-box h-40 relative">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-primary">{item.title}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5">{item.location}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                              <span className="text-xs font-extrabold text-primary">
                                ₹{item.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                                ★ {item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <i className="fa-solid fa-plane fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Searching across the platform...</p>
    </div>
  </div>
);

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GlobalSearchContent />
    </Suspense>
  );
}
