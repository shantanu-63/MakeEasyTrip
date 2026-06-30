"use client";
import { useData } from "@/context/DataContext";

export function useAuth() {
  const { activeUser, activePartner, activeAdmin, loginUser, logoutUser, loginPartner, logoutPartner, loginAdmin, logoutAdmin } = useData();
  return {
    user: activeUser,
    partner: activePartner,
    admin: activeAdmin,
    isAuthenticated: !!activeUser,
    isPartner: !!activePartner,
    isAdmin: !!activeAdmin,
    loginUser,
    logoutUser,
    loginPartner,
    logoutPartner,
    loginAdmin,
    logoutAdmin,
  };
}
