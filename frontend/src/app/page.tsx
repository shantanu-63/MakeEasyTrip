"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect travelers to customer home on boot
    router.replace("/customer");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
        <p className="mt-4 text-sm font-semibold text-primary">Loading MakeEasyTrip Portal...</p>
      </div>
    </div>
  );
}
