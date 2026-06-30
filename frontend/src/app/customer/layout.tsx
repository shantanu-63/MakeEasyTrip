"use client";
import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import SupportWidget from "@/components/shared/SupportWidget";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <Header />
      <main className="flex-grow" role="main">
        {children}
      </main>
      <SupportWidget />
      <Footer />
    </div>
  );
}
