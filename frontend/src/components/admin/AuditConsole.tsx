"use client";

import React from "react";
import { useData } from "@/context/DataContext";

export default function AuditConsole() {
  const { logs } = useData();

  return (
    <div className="partner-list-card mt-6">
      <h3 className="text-lg font-bold mb-4 border-b border-border pb-3 text-primary flex items-center gap-2">
        <i className="fa-solid fa-terminal"></i> Platform Audit Trail (Real-Time Database Sync)
      </h3>
      <div 
        id="admin-live-logs" 
        className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-md max-h-60 overflow-y-auto flex flex-col gap-1.5"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic">No activity logs recorded yet.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
