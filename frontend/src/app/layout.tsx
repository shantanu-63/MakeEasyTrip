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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://makeeasytrip.vercel.app"),
  title: {
    default: "MakeEasyTrip — Making Travel Easier, Smarter & More Accessible",
    template: "%s | MakeEasyTrip",
  },
  description:
    "MakeEasyTrip Travel Tech Pvt Ltd — Discover hotels, activities, and destinations across India. Book instantly with the AI Trip Planner.",
  keywords: ["travel", "hotels", "activities", "india travel", "trip planner", "MakeEasyTrip"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "MakeEasyTrip",
    title: "MakeEasyTrip — Making Travel Easier, Smarter & More Accessible",
    description:
      "Discover and book hotels, activities, and destinations across India with the MakeEasyTrip AI Trip Planner.",
    images: [
      {
        url: "/assets/logos/logo.svg",
        width: 350,
        height: 80,
        alt: "MakeEasyTrip Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MakeEasyTrip",
    description: "Making Travel Easier, Smarter & More Accessible",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* FontAwesome v6.4.0 for Premium Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className="antialiased">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
