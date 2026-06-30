"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center font-sans">
      <div className="max-w-md bg-white border border-border p-8 rounded-2xl shadow-lg">
        {/* Airplane icon with floating animation */}
        <div 
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-secondary text-4xl mb-6"
          style={{ animation: "float 3s ease-in-out infinite", color: "#FF5E14" }}
        >
          <i className="fa-solid fa-plane-slash"></i>
        </div>

        {/* Styles for the float animation */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-10px) rotate(-3deg);
            }
          }
        `}</style>

        {/* Title & Description */}
        <h2 className="text-3xl font-extrabold text-primary font-heading tracking-tight mb-2" style={{ color: "#0A225C" }}>
          404 - Escape Not Found
        </h2>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          The destination page you are looking for has departed, changed coordinates, or does not exist in our catalog.
        </p>

        {/* Back home CTA button */}
        <Link
          href="/"
          className="btn-primary w-full justify-center py-3 text-sm font-extrabold"
          style={{ backgroundColor: "#FF5E14", color: "white", padding: "12px 24px", borderRadius: "8px" }}
        >
          <i className="fa-solid fa-home mr-2"></i> Go Back Home
        </Link>
      </div>
    </div>
  );
}
