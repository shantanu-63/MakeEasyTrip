"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ActiveUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
}

export interface ActivePartner {
  id: string;
  businessName: string;
  email: string;
  [key: string]: any;
}

export interface ActiveAdmin {
  email: string;
  fullName: string;
}

interface DataContextType {
  destinations: any[];
  properties: any[];
  bookings: any[];
  banners: any[];
  logs: string[];
  activeUser: ActiveUser | null;
  activePartner: ActivePartner | null;
  activeAdmin: ActiveAdmin | null;
  addLog: (text: string) => void;
  setDestinations: React.Dispatch<React.SetStateAction<any[]>>;
  setProperties: React.Dispatch<React.SetStateAction<any[]>>;
  setBookings: React.Dispatch<React.SetStateAction<any[]>>;
  setBanners: React.Dispatch<React.SetStateAction<any[]>>;
  syncProperties: (updated: any[]) => void;
  syncDestinations: (updated: any[]) => void;
  syncBookings: (updated: any[]) => void;
  syncBanners: (updated: any[]) => void;
  loginUser: (email: string, fullName?: string) => void;
  logoutUser: () => void;
  loginPartner: (partnerData: ActivePartner) => void;
  logoutPartner: () => void;
  loginAdmin: (email: string) => void;
  logoutAdmin: () => void;
}

// ─── Default Data ─────────────────────────────────────────────────────────────
import defaultDestinations from "@/data/destinations.json";
import defaultHotels from "@/data/hotels.json";
import defaultActivities from "@/data/activities.json";
import defaultBookings from "@/data/bookings.json";

const DEFAULT_BANNERS = [
  {
    id: "BAN-101",
    title: "Escape to Paradise",
    subtitle: "Discover secret beaches with exclusive 25% off. CODE: EASYGOA",
    ctaText: "Explore Stays",
    ctaLink: "/customer/hotels?city=Goa",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    displayOrder: 1,
    type: "Seasonal Banner",
    status: "Published",
  },
  {
    id: "BAN-102",
    title: "Explore Cultural Heritage",
    subtitle: "Immerse in history with private city guides. CODE: JAIPUR15",
    ctaText: "Explore Stays",
    ctaLink: "/customer/hotels?city=Jaipur",
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    displayOrder: 2,
    type: "Cultural Tour",
    status: "Published",
  },
  {
    id: "BAN-103",
    title: "Alpine Adventure Awaits",
    subtitle: "Hike through lush valleys and mountains. CODE: ESCAPE20",
    ctaText: "Find Activities",
    ctaLink: "/customer/activities?city=Manali",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    displayOrder: 3,
    type: "Adventure Deal",
    status: "Published",
  },
];

const DEFAULT_USER = {
  id: "user-1",
  fullName: "Siddharth Patil",
  email: "siddharth.patil@gmail.com",
  phone: "+91 98765 43210",
  role: "traveler",
  wishlist: ["prop-1", "prop-5"],
  bookings: [],
};

const API_URL = "http://localhost:5000/api";

// ─── Context ──────────────────────────────────────────────────────────────────
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [activePartner, setActivePartner] = useState<ActivePartner | null>(null);
  const [activeAdmin, setActiveAdmin] = useState<ActiveAdmin | null>(null);

  const addLog = (text: string) => {
    const time = new Date().toISOString().replace("T", " ").substring(0, 19);
    const msg = `[${time}] ${text}`;
    setLogs((prev) => [...prev.slice(-99), msg]);
    if (process.env.NODE_ENV === "development") console.log(msg);
  };

  const safeGet = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const safeSet = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadData = async () => {
      // Destinations
      try {
        const res = await fetch(`${API_URL}/destinations`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDestinations(data);
        safeSet("met_destinations", data);
        addLog("API_SYNC: destinations loaded");
      } catch {
        const data = safeGet("met_destinations", defaultDestinations as Record<string, unknown>[]);
        if (!localStorage.getItem("met_destinations")) safeSet("met_destinations", data);
        setDestinations(data);
        addLog("LOCAL_FALLBACK: destinations");
      }

      // Properties
      try {
        const res = await fetch(`${API_URL}/properties`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProperties(data);
        safeSet("met_properties", data);
        addLog("API_SYNC: properties loaded");
      } catch {
        let data = safeGet<Record<string, unknown>[]>("met_properties", []);
        if (!data.length) {
          data = [...(defaultHotels as Record<string, unknown>[]), ...(defaultActivities as Record<string, unknown>[])];
          safeSet("met_properties", data);
        }
        setProperties(data);
        addLog("LOCAL_FALLBACK: properties");
      }

      // Bookings
      try {
        const token = localStorage.getItem("met_session") || sessionStorage.getItem("met_session");
        if (!token) throw new Error();
        const res = await fetch(`${API_URL}/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBookings(data);
        safeSet("met_platform_bookings", data);
        addLog("API_SYNC: bookings loaded");
      } catch {
        const data = safeGet("met_platform_bookings", defaultBookings as Record<string, unknown>[]);
        if (!localStorage.getItem("met_platform_bookings")) safeSet("met_platform_bookings", data);
        setBookings(data);
        addLog("LOCAL_FALLBACK: bookings");
      }

      // Banners
      try {
        const res = await fetch(`${API_URL}/admin/cms/banners`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBanners(data);
        safeSet("met_homepage_banners", data);
        addLog("API_SYNC: banners loaded");
      } catch {
        const data = safeGet("met_homepage_banners", DEFAULT_BANNERS as Record<string, unknown>[]);
        if (!localStorage.getItem("met_homepage_banners")) safeSet("met_homepage_banners", data);
        setBanners(data);
        addLog("LOCAL_FALLBACK: banners");
      }
    };

    loadData();

    // Restore sessions
    const token = localStorage.getItem("met_session") || sessionStorage.getItem("met_session");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setActiveUser({
            id: payload.id || payload.userId || "user-local",
            email: payload.email || "",
            role: payload.role ? String(payload.role).toLowerCase() : "traveler",
            fullName: payload.fullName || "Traveler",
          });
        }
      } catch {}
    }

    const partnerRaw = localStorage.getItem("met_partner_session");
    if (partnerRaw) {
      try { setActivePartner(JSON.parse(partnerRaw)); } catch {}
    }

    const adminRaw = localStorage.getItem("met_admin_session");
    if (adminRaw) {
      try { setActiveAdmin(JSON.parse(adminRaw)); } catch {}
    }

    // Seed default user list
    if (!localStorage.getItem("met_users")) {
      safeSet("met_users", [DEFAULT_USER]);
    }

    // Supabase auth — dynamically imported to avoid bundle poisoning
    let unsubscribe: (() => void) | null = null;
    import("@/core/services/supabase").then(({ getSupabase }) => {
      const client = getSupabase();
      const { data: { subscription } } = client.auth.onAuthStateChange((_event: string, session: { user?: { id: string; email?: string; user_metadata?: { fullName?: string } } } | null) => {
        if (session?.user) {
          setActiveUser({
            id: session.user.id,
            email: session.user.email || "",
            role: "traveler",
            fullName: session.user.user_metadata?.fullName || session.user.email?.split("@")[0] || "Traveler",
          });
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    }).catch(() => {});

    addLog("DB_INIT: MakeEasyTrip data layer initialized");

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ─── Sync Helpers ───────────────────────────────────────────────────────────
  const syncProperties = (updated: any[]) => {
    setProperties(updated);
    safeSet("met_properties", updated);
    addLog(`Properties synced (${updated.length})`);
  };

  const syncDestinations = (updated: any[]) => {
    setDestinations(updated);
    safeSet("met_destinations", updated);
    addLog(`Destinations synced (${updated.length})`);
  };

  const syncBookings = (updated: any[]) => {
    setBookings(updated);
    safeSet("met_platform_bookings", updated);
    addLog(`Bookings synced (${updated.length})`);
  };

  const syncBanners = (updated: any[]) => {
    setBanners(updated);
    safeSet("met_homepage_banners", updated);
    addLog(`Banners synced (${updated.length})`);
  };

  // ─── Auth Operations ─────────────────────────────────────────────────────────
  const loginUser = async (email: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Customer@Password" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("met_session", data.token);
        setActiveUser(data.user);
        addLog(`USER_LOGIN_API: ${email}`);
        return;
      }
    } catch {}

    // Offline fallback
    const user: ActiveUser = {
      id: `user-${Date.now()}`,
      fullName: fullName || "Traveler",
      email,
      role: "traveler",
    };
    const expiry = Date.now() + 2 * 60 * 60 * 1000;
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ userId: user.id, email, role: user.role, fullName: user.fullName, expiry }));
    const sig = btoa(`${user.id}${email}${expiry}MET_SECRET_2026`);
    localStorage.setItem("met_session", `${header}.${payload}.${sig}`);
    setActiveUser(user);
    addLog(`USER_LOGIN_LOCAL: ${email}`);
  };

  const logoutUser = () => {
    localStorage.removeItem("met_session");
    sessionStorage.removeItem("met_session");
    setActiveUser(null);
    addLog("USER_LOGOUT");
  };

  const loginPartner = (partnerData: ActivePartner) => {
    safeSet("met_partner_session", partnerData);
    setActivePartner(partnerData);
    addLog(`PARTNER_LOGIN: ${partnerData.businessName}`);
  };

  const logoutPartner = () => {
    localStorage.removeItem("met_partner_session");
    setActivePartner(null);
    addLog("PARTNER_LOGOUT");
  };

  const loginAdmin = (email: string) => {
    const admin: ActiveAdmin = { email, fullName: "Super Admin" };
    safeSet("met_admin_session", admin);
    setActiveAdmin(admin);
    addLog(`ADMIN_LOGIN: ${email}`);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("met_admin_session");
    setActiveAdmin(null);
    addLog("ADMIN_LOGOUT");
  };

  return (
    <DataContext.Provider
      value={{
        destinations, properties, bookings, banners, logs,
        activeUser, activePartner, activeAdmin,
        addLog, setDestinations, setProperties, setBookings, setBanners,
        syncProperties, syncDestinations, syncBookings, syncBanners,
        loginUser, logoutUser, loginPartner, logoutPartner, loginAdmin, logoutAdmin,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
