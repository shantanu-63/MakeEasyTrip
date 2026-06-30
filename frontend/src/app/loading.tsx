"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-center font-sans">
      <div className="flex flex-col items-center gap-4">
        {/* Animated ring spinner */}
        <div 
          className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-secondary animate-spin"
          style={{ borderTopColor: "#FF5E14" }}
        ></div>
        <div className="text-sm font-bold text-primary tracking-wide" style={{ color: "#0A225C" }}>
          Loading MakeEasyTrip...
        </div>
      </div>
    </div>
  );
}
