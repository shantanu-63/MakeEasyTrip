"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("MakeEasyTrip Root Layout Exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased bg-slate-50 min-h-screen flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md bg-white border border-border p-8 rounded-2xl shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 text-3xl mb-6">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>

          <h2 className="text-xl font-extrabold text-primary font-heading tracking-tight mb-2">
            System Critical Error
          </h2>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            MakeEasyTrip's root infrastructure experienced a critical exception.
          </p>

          {error.digest && (
            <div className="bg-slate-50 border border-border rounded-lg p-2.5 mb-6 text-left">
              <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Diagnostic Signature</span>
              <code className="text-[10px] font-mono text-primary font-bold break-all">
                {error.digest}
              </code>
            </div>
          )}

          <button
            onClick={() => reset()}
            className="w-full bg-secondary hover:bg-secondary-light text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "#FF5E14" }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Recover System
          </button>
        </div>
      </body>
    </html>
  );
}
