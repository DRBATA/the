"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { db } from "../lib/dexieClient";

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  water_subscription_status?: string; // e.g. 'active', 'inactive', etc.
  membership_status?: string; // e.g. 'none', 'silver', 'gold', 'platinum'
  water_bottle_saved: number;
  medical_exemption?: boolean;
  confirmed_address?: string;
  whatsapp_number?: string;
  created_at?: string;
} 

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  claimFirstFreeRefill: () => Promise<boolean>;
  addRefill: () => Promise<boolean>;
  subscribe: () => Promise<void>;
} 

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase after login
  useEffect(() => {
    const getProfile = async () => {
      // Try Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Supabase session after magic link:", session);
      if (session?.user) {
        // Fetch profile from 'profiles' table
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, username, water_subscription_status, membership_status, water_bottle_saved, medical_exemption, confirmed_address, whatsapp_number, created_at")
          .eq("id", session.user.id)
          .single();
        if (error) console.log("Profile fetch error:", error);
        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            username: data.username,
            water_subscription_status: data.water_subscription_status,
            membership_status: data.membership_status,
            water_bottle_saved: data.water_bottle_saved || 0,
            medical_exemption: data.medical_exemption,
            confirmed_address: data.confirmed_address,
            whatsapp_number: data.whatsapp_number,
            created_at: data.created_at,
          });
          // Cache profile locally for offline access
          db.profiles.put({
            id: data.id,
            email: data.email,
            water_bottle_saved: data.water_bottle_saved || 0,
            water_subscription_status: data.water_subscription_status,
            membership_status: data.membership_status,
          });
        } else {
          // No profile yet or other fetch error – still consider the user logged in with minimal data
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            water_bottle_saved: 0,
          });
          db.profiles.put({
            id: session.user.id,
            email: session.user.email ?? "",
            water_bottle_saved: 0,
          });
        }
      } else {
        // No Supabase session, try Dexie offline profile
        const cached = await db.profiles.toCollection().first();
        if (cached) {
          setUser({
            id: cached.id,
            email: cached.email,
            water_bottle_saved: cached.water_bottle_saved,
            water_subscription_status: cached.water_subscription_status,
            membership_status: cached.membership_status,
          });
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    getProfile();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        // Do not clear Dexie profile on logout, just set user to null
        setUser(null);
      }
      else getProfile();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Magic link login
  const login = async (email: string) => {
    await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Dexie profile is intentionally NOT cleared, so offline mode works
  };

  // Update user profile in Supabase
  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();
    if (updated) setUser({ ...user, ...updated });
    if (updated) {
      db.profiles.put({
        id: updated.id,
        email: updated.email,
        water_bottle_saved: updated.water_bottle_saved ?? user.water_bottle_saved,
        water_subscription_status: updated.water_subscription_status ?? user.water_subscription_status,
        membership_status: updated.membership_status ?? user.membership_status,
      });
    }
  };

  // Claim first free refill
  const claimFirstFreeRefill = async (): Promise<boolean> => {
    if (!user) return false;
    if (user.water_bottle_saved > 0) return false; // Already used
    await updateUser({
      water_bottle_saved: 1,
    });
    return true;
  };

  // Check if user can perform a refill
  const canRefill = () => {
    if (!user) return false;
    if (user.water_bottle_saved < 5) return true;
    return user.water_subscription_status === "active";
  };

  // Add a refill if allowed, update Supabase & Dexie
  const addRefill = async (): Promise<boolean> => {
    if (!user) return false;
    if (!canRefill()) return false;
    const newCount = (user.water_bottle_saved || 0) + 1;
    setUser({ ...user, water_bottle_saved: newCount });
    db.profiles.put({ ...user, water_bottle_saved: newCount });
    // Try to sync if online and logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      supabase.from("profiles").update({ water_bottle_saved: newCount }).eq("id", user.id);
    }
    return true;
  };

  // Mark subscription as active (temporary local action)
  const subscribe = async () => {
    if (!user) return;
    if (user.water_subscription_status === "active") return;
    setUser({ ...user, water_subscription_status: "active" });
    db.profiles.put({ ...user, water_subscription_status: "active" });
    // Try to sync if online and logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      supabase.from("profiles").update({ water_subscription_status: "active" }).eq("id", user.id);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, updateUser, claimFirstFreeRefill, addRefill, subscribe }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
