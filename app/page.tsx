"use client";

import { useEffect, useState } from "react";
import MagicLinkLogin from "../components/MagicLinkLogin";
import { supabase } from "../lib/supabaseClient";

interface Profile {
  email: string;
  water_bottle_saved: number;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch profile by user ID (assumes id matches in profiles table)
        const { data, error } = await supabase
          .from("profiles")
          .select("email, water_bottle_saved")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, []);

  // Calculate carbon saved (example: 0.083kg CO2 per bottle)
  const carbonSaved = profile ? (profile.water_bottle_saved * 0.083).toFixed(2) : "0.00";

  if (loading) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0074D9", color: "white" }}>Loading...</main>;
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0074D9",
        }}
      >
        <MagicLinkLogin />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0074D9",
        color: "white",
        flexDirection: "column",
      }}
    >
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Welcome, {profile?.email || user.email}!</h2>
      <div style={{ fontSize: 22, marginBottom: 8 }}>Bottles Saved: <b>{profile?.water_bottle_saved ?? 0}</b></div>
      <div style={{ fontSize: 22 }}>Carbon Saved: <b>{carbonSaved} kg CO₂</b></div>
    </main>
  );
}