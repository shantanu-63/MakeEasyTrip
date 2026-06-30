"use client";
// Supabase client — lazy initialized, client-side only
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Named export for backwards compatibility
export const supabase = {
  auth: {
    getSession: () => getSupabase().auth.getSession(),
    onAuthStateChange: (cb: any) => getSupabase().auth.onAuthStateChange(cb),
    signOut: () => getSupabase().auth.signOut(),
  }
};
