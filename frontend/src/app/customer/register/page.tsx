"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/customer/auth?panel=signup");
  }, [router]);
  return (
    <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
      <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Redirecting to Registration...</p>
    </div>
  );
}
