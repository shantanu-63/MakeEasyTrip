import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/global.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/pages/home.css";
import "@/styles/pages/destination.css";
import "@/styles/pages/hotel.css";
import "@/styles/pages/activity.css";
import "@/styles/pages/dashboard.css";
import "@/styles/pages/auth.css";
import "@/styles/pages/partner.css";
import "@/styles/pages/admin.css";
import "@/styles/pages/admin-panel.css";
import "@/styles/responsive.css";
import { DataProvider } from "@/context/DataContext";

// Font fallbacks are handled via CSS styles
const inter = { variable: "font-sans" };
const outfit = { variable: "font-sans" };

export const metadata: Metadata = {
  title: "Make Easy Trip - Making Travel Easier, Smarter & More Accessible",
  description: "MakeEasyTrip Travel Tech Pvt Ltd - Transforming the travel and hospitality industry through innovation, digital solutions, and customer-centric services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* FontAwesome v6.4.0 for Premium Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
