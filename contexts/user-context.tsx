"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

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
} 

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase after login
  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile from 'profiles' table
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, username, water_subscription_status, membership_status, water_bottle_saved, medical_exemption, confirmed_address, whatsapp_number, created_at")
          .eq("id", session.user.id)
          .single();
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
        } else if (error && error.code === "PGRST116") {
          // No profile yet: create one
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              water_bottle_saved: 0,
              water_subscription_status: 'inactive',
              membership_status: 'none',
            })
            .select()
            .single();
          setUser({
            id: newProfile.id,
            email: newProfile.email,
            username: newProfile.username,
            water_subscription_status: newProfile.water_subscription_status,
            membership_status: newProfile.membership_status,
            water_bottle_saved: newProfile.water_bottle_saved || 0,
            medical_exemption: newProfile.medical_exemption,
            confirmed_address: newProfile.confirmed_address,
            whatsapp_number: newProfile.whatsapp_number,
            created_at: newProfile.created_at,
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    getProfile();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setUser(null);
      else getProfile();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Magic link login
  const login = async (email: string) => {
    await supabase.auth.signInWithOtp({ email });
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


  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, updateUser, claimFirstFreeRefill }}
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
