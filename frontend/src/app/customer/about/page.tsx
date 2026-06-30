"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="about-section" id="traveler-about-section">
      <div className="container">
        {/* Section Header */}
        <div className="about-header">
          <span className="about-tagline-badge">
            <i className="fa-solid fa-globe"></i> Travel Tech Company
          </span>
          <h2 className="section-title">About MakeEasyTrip</h2>
          <p className="section-subtitle">
            MakeEasyTrip Travel Tech Pvt Ltd is an emerging travel technology company dedicated to transforming the travel and hospitality industry through innovation, digital solutions, and customer-centric services.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="about-vm-grid">
          <div className="about-vm-card vision-card">
            <div className="about-vm-icon">
              <i className="fa-solid fa-eye"></i>
            </div>
            <h3>Our Vision</h3>
            <p>To build a world-class travel technology platform that connects travelers, hospitality providers, and travel businesses through innovation and trust.</p>
          </div>
          <div className="about-vm-card mission-card">
            <div className="about-vm-icon">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <h3>Our Mission</h3>
            <p>To simplify travel through technology, enhance customer experiences, and create sustainable growth opportunities for travel and hospitality partners worldwide.</p>
          </div>
        </div>

        {/* Key Services Grid */}
        <h3 className="about-services-title">
          <i className="fa-solid fa-check-double" style={{ color: "var(--color-secondary)", marginRight: "8px" }}></i>
          Our Key Services
        </h3>
        <div className="about-services-grid">
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-hotel"></i>
            </div>
            <h4>Hotel &amp; Resort<br />Booking</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-umbrella-beach"></i>
            </div>
            <h4>Domestic &amp; Int&apos;l<br />Holiday Packages</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-passport"></i>
            </div>
            <h4>Visa &amp; Travel<br />Documentation</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-van-shuttle"></i>
            </div>
            <h4>Transportation &amp;<br />Airport Transfers</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <h4>Corporate Travel<br />Solutions</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-code"></i>
            </div>
            <h4>Travel Technology<br />Development</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h4>Hospitality Partner<br />Solutions</h4>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <h4>Destination<br />Management</h4>
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
          <span style={{ color: "var(--color-text-muted)" }}>—</span>
          <span className="about-company-tagline">&quot;Making Travel Easier, Smarter &amp; More Accessible.&quot;</span>
        </div>
      </div>
    </section>
  );
}
