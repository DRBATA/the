"use client";

import { useEffect, useState } from "react";
import MagicLinkLogin from "../components/MagicLinkLogin";
import ProfileModal from "@/components/ProfileModal";
import DrinkModal from "@/components/DrinkModal";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const res = await fetch(`/api/dashboard?user_id=${user.id}`);
        const dash = await res.json();
        setDashboard(dash);
      }
      setLoading(false);
    };
    getUserAndDashboard();
  }, []);

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

  // Neon-frosted dashboard panel with modals and neon water drop button
  const [showProfile, setShowProfile] = useState(false);
  const [showDrink, setShowDrink] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<{plan?: string, advice?: string} | null>(null);

  // Show profile modal if any required field is missing
  useEffect(() => {
    if (dashboard && (!dashboard.profile?.height_cm || !dashboard.profile?.weight_kg || !dashboard.profile?.sex || !dashboard.profile?.date_of_birth)) {
      setShowProfile(true);
    }
  }, [dashboard]);

  // Water drop SVG
  const WaterDrop = ({glow}: {glow?: boolean}) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6C32 6 16 28 16 40C16 51.0457 24.9543 60 36 60C47.0457 60 56 51.0457 56 40C56 28 40 6 32 6Z" stroke="#00FFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#001428" filter={glow ? "drop-shadow(0 0 16px #00FFFF)" : "none"}/>
      <circle cx="32" cy="44" r="10" fill="#00FFFF55" />
    </svg>
  );

  // Neon panel and controls
  return (
    <main
      className="min-h-screen flex flex-col justify-end items-center relative"
      style={{
        background: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-Qe3ko5ZImDFe4txiZ9Pi2nTsq1GWDu.png') center/cover no-repeat`,
      }}
    >
      {/* Neon water drop AI/info button */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-36 z-20 flex flex-col items-center">
        <button
          className="rounded-full p-2 bg-white/10 border-2 border-cyan-300 neon-box"
          style={{ boxShadow: aiLoading ? "0 0 32px 8px #00FFFF" : "0 0 12px 2px #00FFFF" }}
          onClick={async () => {
            setAiLoading(true);
            const res = await fetch(`/api/dashboard?user_id=${user.id}`);
            const dash = await res.json();
            setAiOutput({ plan: dash.plan, advice: dash.advice });
            setAiLoading(false);
          }}
          aria-label="Get AI hydration advice"
        >
          <WaterDrop glow={aiLoading} />
        </button>
        <div className="mt-2 text-center text-cyan-200 neon-text text-sm font-semibold">
          {aiLoading ? "Thinking..." : "AI Hydration Advice"}
        </div>
      </div>

      {/* Neon/frosted bottom panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex flex-row items-center justify-around py-4 px-2"
        style={{
          background: "rgba(255,255,255,0.18)",
          borderRadius: 24,
          boxShadow: "0 0 32px 6px #00FFF7, 0 2px 24px 0 #0074D980",
          backdropFilter: "blur(18px)",
          border: "2px solid rgba(0,255,255,0.25)",
          maxWidth: 480,
          margin: "0 auto"
        }}
      >
        {/* Profile modal button */}
        <button
          className="rounded-full p-3 bg-white/10 border-2 border-cyan-300 neon-box text-2xl"
          onClick={() => setShowProfile(true)}
          aria-label="Edit Profile"
        >
          👤
        </button>
        {/* Drink log modal button */}
        <button
          className="rounded-full p-3 bg-white/10 border-2 border-cyan-300 neon-box text-2xl"
          onClick={() => setShowDrink(true)}
          aria-label="Log Drink"
        >
          🥤
        </button>
      </div>

      {/* Neon triangle info display (replaces old panel) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-56 z-10 flex flex-col items-center">
        <svg width="120" height="104" viewBox="0 0 120 104" fill="none">
          <polygon points="60,8 112,96 8,96" stroke="#00FFFF" strokeWidth="5" fill="#001428cc" filter="drop-shadow(0 0 16px #00FFFF)" />
        </svg>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 text-center text-cyan-100 neon-text text-base font-semibold px-2">
          <div><b>Plan:</b> {aiOutput?.plan || dashboard?.plan}</div>
          <div className="mt-1"><b>Advice:</b> {aiOutput?.advice || dashboard?.advice}</div>
        </div>
      </div>

      {/* Modals */}
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onSave={async (profile) => {
          await supabase.from("profiles").update(profile).eq("id", user.id);
          setShowProfile(false);
          // Refresh dashboard
          const res = await fetch(`/api/dashboard?user_id=${user.id}`);
          setDashboard(await res.json());
        }}
        initialProfile={dashboard?.profile}
      />
      <DrinkModal
        open={showDrink}
        onClose={() => setShowDrink(false)}
        onSave={async (drink) => {
          await supabase.from("hydration_logs").insert({ ...drink, user_id: user.id, timestamp: new Date().toISOString() });
          setShowDrink(false);
          // Refresh dashboard
          const res = await fetch(`/api/dashboard?user_id=${user.id}`);
          setDashboard(await res.json());
        }}
      />
    </main>
  );
}