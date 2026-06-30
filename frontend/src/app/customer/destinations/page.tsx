"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import Link from "next/link";

function DestinationsContent() {
  const router = useRouter();
  const { destinations } = useData();

  // Filter states
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("recommended");

  // Get filtered destinations
  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    // Filter by Country
    if (selectedCountry !== "all") {
      result = result.filter(
        (d) => d.country.toLowerCase() === selectedCountry.toLowerCase()
      );
    }

    // Filter by Budget Tier
    if (selectedBudgets.length > 0) {
      result = result.filter((d) => selectedBudgets.includes(d.budget));
    }

    // Sort options
    if (sortOption === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // recommended, sort by rating descending
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [destinations, selectedCountry, selectedBudgets, sortOption]);

  const toggleBudget = (budget: string) => {
    setSelectedBudgets((prev) =>
      prev.includes(budget) ? prev.filter((b) => b !== budget) : [...prev, budget]
    );
  };

  const handleCardClick = (id: string) => {
    router.push(`/customer/destinations/${id}`);
  };

  const resetFilters = () => {
    setSelectedCountry("all");
    setSelectedBudgets([]);
    setSortOption("recommended");
  };

  // Get distinct countries from destinations
  const countries = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.country) set.add(d.country);
    });
    return Array.from(set);
  }, [destinations]);

  return (
    <div className="container search-results-container px-6 py-8">
      {/* Page Breadcrumbs & Title */}
      <div className="mb-6">
        <Link href="/customer" className="text-xs font-semibold text-secondary hover:underline">
          <i className="fa-solid fa-chevron-left mr-1"></i> Back to Home
        </Link>
        <h2 className="text-3xl font-extrabold text-primary mt-2">Explore Destinations</h2>
        <p className="text-xs text-text-muted mt-1">
          Browse handpicked locations and plan your next premium escape
        </p>
      </div>

      <div className="search-results-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar bg-white p-6 border border-border rounded-lg shadow-sm">
          <h3 className="text-base font-extrabold text-primary mb-6 flex justify-between items-center">
            <span>
              <i className="fa-solid fa-sliders mr-1"></i> Filters
            </span>
            <button onClick={resetFilters} className="text-xs text-secondary font-bold hover:underline">
              Reset All
            </button>
          </h3>

          {/* Filter: Country */}
          <div className="filter-section mb-6">
            <h4 className="filter-title font-bold text-xs text-primary mb-3">Country</h4>
            <select
              className="w-full border border-border p-2 rounded outline-none text-xs text-text-main"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option value={c} key={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Budget Category */}
          <div className="filter-section border-t border-border pt-4">
            <h4 className="filter-title font-bold text-xs text-primary mb-3">Budget Tier</h4>
            <ul className="filter-list flex flex-col gap-2.5 text-xs text-text-main">
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="budget-checkbox accent-secondary"
                  checked={selectedBudgets.includes("Budget")}
                  onChange={() => toggleBudget("Budget")}
                />
                <span>Value Focus ($)</span>
              </li>
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="budget-checkbox accent-secondary"
                  checked={selectedBudgets.includes("Moderate")}
                  onChange={() => toggleBudget("Moderate")}
                />
                <span>Balanced ($$)</span>
              </li>
              <li className="filter-item flex items-center gap-2">
                <input
                  type="checkbox"
                  className="budget-checkbox accent-secondary"
                  checked={selectedBudgets.includes("Luxury")}
                  onChange={() => toggleBudget("Luxury")}
                />
                <span>Premium ($$$)</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Listings Column */}
        <main className="flex-grow">
          {/* Top Sort Bar */}
          <div className="listings-top-bar flex justify-between items-center mb-6 bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="results-count text-xs text-text-main">
              We found{" "}
              <span className="font-extrabold text-primary">{filteredDestinations.length}</span>{" "}
              destinations matching your criteria
            </div>
            <div className="sort-container flex items-center gap-2 text-xs">
              <label className="text-text-muted">Sort By:</label>
              <select
                className="sort-select border border-border p-1.5 rounded outline-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="destinations-deck">
            {filteredDestinations.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-white border border-border rounded-lg text-text-muted text-sm">
                No destinations match your criteria. Try adjusting your filters.
              </div>
            ) : (
              filteredDestinations.map((item) => (
                <div
                  className="destination-card cursor-pointer relative rounded-lg overflow-hidden h-64 border border-border group"
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="destination-overlay absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <h3 className="destination-name font-extrabold text-base leading-tight">
                      {item.name}, {item.country}
                    </h3>
                    <p className="destination-count text-[11px] opacity-80 mt-1 flex items-center gap-1">
                      <span className="bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                        ★ {item.rating}
                      </span>
                      Budget: {item.budget}
                    </p>
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
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading destinations...</p>
    </div>
  </div>
);

export default function DestinationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DestinationsContent />
    </Suspense>
  );
}
