"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error diagnostics to console for operational logging
    console.error("MakeEasyTrip Runtime Exception:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center font-sans">
      <div className="max-w-md bg-white border border-border p-8 rounded-2xl shadow-lg">
        {/* Error icon wrapper */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 text-3xl mb-6 animate-pulse">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-extrabold text-primary font-heading tracking-tight mb-2">
          Internal Server Error
        </h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          MakeEasyTrip experienced a temporary processing exception. Our engineering console has captured the diagnostics.
        </p>

        {/* Error code detail */}
        {error.digest && (
          <div className="bg-slate-50 border border-border rounded-lg p-2.5 mb-6 text-left">
            <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Diagnostic Signature</span>
            <code className="text-[10px] font-mono text-primary font-bold break-all">
              {error.digest}
            </code>
          </div>
        )}

        {/* Actions buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary justify-center text-xs font-bold py-2.5 px-6"
          >
            <i className="fa-solid fa-arrows-rotate mr-1.5"></i> Reload Interface
          </button>
          
          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <i className="fa-solid fa-home mr-1.5"></i> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
