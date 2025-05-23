"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { refillFacts } from "../lib/refillFacts";


declare global {
  interface Window { __guestDataSynced?: boolean }
}


const firstFiveFacts = [
  "You just saved your first bottle—way to go!",
  "Second refill—keep it up!",
  "Three is a magic number for the planet!",
  "Four bottles saved, four times the impact!",
  "Five bottles—you're a refill hero!",
];
const sixToTenFacts = [
  "Six refills—your habit is making waves!",
  "Seven up! The ocean thanks you.",
  "Eight bottles saved—plastic-free is the way!",
  "Nine refills—almost at double digits!",
  "Ten bottles! You're a sustainability star!",
];
import { chooseVenueOffer } from "../utils/venueSelector";

export interface UserProfile {
  id: string;
  email: string;
  water_subscription_status?: string;
  stripe_customer_id?: string;
  date_of_birth?: string;
  sex?: string;
  name?: string;
  tone?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_pct?: number;
  water_bottle_saved?: number;
  carbon_saved?: number;
}
 

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  claimFirstFreeRefill: () => Promise<boolean>;
  addRefill: () => Promise<boolean>;
  canRefill: () => boolean;
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
        let { data, error } = await supabase
          .from("profiles")
          .select("id, email, water_subscription_status, stripe_customer_id, date_of_birth, sex, name, tone, height_cm, weight_kg, body_fat_pct, water_bottle_saved, carbon_saved")
          .eq("id", session.user.id)
          .single();
        if (error?.code === 'PGRST116' || error?.code === '42703' || error?.message?.includes('does not exist')) {
          // Profile row does not exist or column mismatch, create a minimal row
          const { data: created, error: insertError } = await supabase
            .from("profiles")
            .insert({ id: session.user.id, water_bottle_saved: 0 })
            .select()
            .single();
          if (insertError) console.log("Profile creation error:", insertError);
          data = created;
        } else if (error) {
          console.log("Profile fetch error:", error);
        }
        if (data) {
          setUser({
            id: data.id,
            email: data.email ?? session.user.email ?? "",
            water_subscription_status: data.water_subscription_status,
            stripe_customer_id: data.stripe_customer_id,
            date_of_birth: data.date_of_birth,
            sex: data.sex,
            name: data.name,
            tone: data.tone,
            height_cm: data.height_cm,
            weight_kg: data.weight_kg,
            body_fat_pct: data.body_fat_pct,
            water_bottle_saved: data.water_bottle_saved || 0,
            carbon_saved: data.carbon_saved,
          });
        } else {
          // No profile yet or other fetch error – still consider the user logged in with minimal data
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            water_bottle_saved: 0,
          });
        }
      } else {
        // No Supabase session, set user to null
        setUser(null);
      }
      setIsLoading(false);
    };
    getProfile();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
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
    if (user.water_subscription_status === "active") return true; // Unlimited for subscribers
    return (user.water_bottle_saved ?? 0) < 5; // Limit to 5 for free users
  };


  // Add a refill if allowed, update Supabase
  const addRefill = async (): Promise<boolean> => {
    if (!user) return false;
    if (!canRefill()) return false;
    const newCount = (user.water_bottle_saved || 0) + 1;
    setUser({ ...user, water_bottle_saved: newCount });
    // Try to sync if online and logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({ water_bottle_saved: newCount }).eq("id", user.id);
      // Fetch fresh profile from Supabase after update
      let { data, error } = await supabase
        .from("profiles")
        .select("id, email, water_subscription_status, stripe_customer_id, date_of_birth, sex, name, tone, height_cm, weight_kg, body_fat_pct, water_bottle_saved, carbon_saved")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setUser({
          id: data.id,
          email: data.email ?? session.user.email ?? "",
          water_subscription_status: data.water_subscription_status,
          stripe_customer_id: data.stripe_customer_id,
          date_of_birth: data.date_of_birth,
          sex: data.sex,
          name: data.name,
          tone: data.tone,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          body_fat_pct: data.body_fat_pct,
          water_bottle_saved: data.water_bottle_saved || 0,
          carbon_saved: data.carbon_saved,
        });
      }
    }
    try {
      const { venue, offer } = chooseVenueOffer(new Date());
      let fact = "";
      if (newCount <= 5) {
        fact = firstFiveFacts[(newCount - 1) % firstFiveFacts.length];
      } else if (newCount <= 10) {
        fact = sixToTenFacts[(newCount - 6) % sixToTenFacts.length];
      } else {
        fact = refillFacts[(newCount - 11) % refillFacts.length];
      }
      window.dispatchEvent(new CustomEvent("refill-toast", { detail: { fact } }));
    } catch (e) {
      console.error("Failed to dispatch refill toast", e);
    }
    return true;
  };

  // Mark subscription as active (temporary local action)
  const subscribe = async () => {
    if (!user) return;
    if (user.water_subscription_status === "active") return;
    setUser({ ...user, water_subscription_status: "active" });
    // Try to sync if online and logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      supabase.from("profiles").update({ water_subscription_status: "active" }).eq("id", user.id);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, updateUser, claimFirstFreeRefill, addRefill, subscribe, canRefill }}
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
