"use client";

import React, { useState } from "react";
import OnboardingModal from "./OnboardingModal";
import OnboardingComplete from "./OnboardingComplete";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuickHydrationPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    secret_question: "",
    secret_answer: "",
  });
  const [user, setUser] = useState<any>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);

  // Dummy login/register logic (replace with real auth in production)
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!authForm.email || !authForm.password) {
      setError("Please fill all fields.");
      return;
    }
    if (authMode === "register" && (!authForm.secret_question || !authForm.secret_answer)) {
      setError("Please provide a secret question and answer.");
      return;
    }

    // Registration: check if email exists in Supabase 'profile' table
    if (authMode === "register") {
      const { data, error: supaError } = await supabase
        .from('test_user_profiles')
        .select('*')
        .eq('email', authForm.email)
        .single();

      if (supaError || !data) {
        setError("This email is not eligible for registration.");
        return;
      }
    }

    // If passed, continue registration logic (show onboarding)
    setUser({ email: authForm.email });
    setOnboardingOpen(true);
    // Fetch onboarding status immediately after login/register
    fetchOnboardingStatus(authForm.email);
  }

  // Fetch onboarding status from Supabase
  type OnboardingStatus = {
    eligibility_over18: boolean;
    eligibility_noMedication: boolean;
    eligibility_noPsychHistory: boolean;
    nda_agreed: boolean;
    waiver_agreed: boolean;
  };

  async function fetchOnboardingStatus(email: string) {
    setLoadingOnboarding(true);
    const { data } = await supabase
      .from("test_user_profiles")
      .select("eligibility_over18, eligibility_noMedication, eligibility_noPsychHistory, nda_agreed, waiver_agreed")
      .eq("email", email)
      .single();
    if (data) {
      const complete = !!data.eligibility_over18 && !!data.eligibility_noMedication && !!data.eligibility_noPsychHistory && !!data.nda_agreed && !!data.waiver_agreed;
      setOnboardingComplete(complete);
    } else {
      setOnboardingComplete(false);
    }
    setLoadingOnboarding(false);
  }

  function handleLogout() {
    setUser(null);
    setOnboardingComplete(false);
    setAuthForm({ email: "", password: "", secret_question: "", secret_answer: "" });
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #C2E9FB 0%, #A1C4FD 100%)",
      }}
    >
      {/* Fullscreen Dubai Background */}
      <img
        src="/background1.png"
        alt="Hydration event background with yoga and neon drinks bar in Dubai"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.82, filter: "blur(2px) saturate(1.1)" }}
        aria-hidden="true"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-0" style={{
        background: "linear-gradient(180deg, rgba(0,255,255,0.15) 0%, rgba(0,0,0,0.25) 100%)"
      }} />

      {/* Centered Neon Glass Panel */}
      <div
        className="relative z-10 p-6 md:p-12 lg:p-16 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border border-cyan-200"
        style={{
          width: '70%',
          margin: '0 auto',
          background: "rgba(255,255,255,0.42)",
          border: "2.5px solid #00fff9",
          boxShadow: "0 12px 48px 0 #00bfff66, 0 0 42px 0 #00fff999, 0 2px 32px 0 #003c5f33",
          backdropFilter: "blur(18px) saturate(1.2)",
        }}
      >
        {/* Neon Triangle and Title */}
        <div style={{ height: '60px' }} />
            <div className="flex flex-col items-center mb-6">
          <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
            <polygon
              points="35,5 65,55 5,55"
              style={{
                stroke: "#00fff9",
                strokeWidth: 4,
                filter: "drop-shadow(0 0 12px #00fff9)",
                fill: "none"
              }}
            />
          </svg>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg" style={{
            textShadow: "0 0 10px #00fff9, 0 0 20px #00fff9"
          }}>WATER BAR</h1>
        </div>

        {/* Auth Form */}
        {!user ? (
          <>
            <div className="w-full max-w-3xl flex flex-col gap-5 mx-auto items-center justify-center bg-white/60 rounded-3xl shadow-2xl p-8 border-2 border-cyan-300 sm:mx-4 md:mx-8 lg:mx-auto" style={{ boxShadow: "0 8px 48px #00bfff55, 0 0 40px #00fff999" }}>
  <div className="flex w-full gap-2 mb-2">
    <button
      className={`flex-1 px-6 py-3 rounded-full font-bold text-lg transition-all duration-150 shadow ${authMode === 'login' ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white scale-105' : 'bg-white text-cyan-600 border border-cyan-400 hover:bg-cyan-50'}`}
      onClick={() => setAuthMode('login')}
    >
      Login
    </button>
    <button
      className={`flex-1 px-6 py-3 rounded-full font-bold text-lg transition-all duration-150 shadow ${authMode === 'register' ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white scale-105' : 'bg-white text-cyan-600 border border-cyan-400 hover:bg-cyan-50'}`}
      onClick={() => setAuthMode('register')}
    >
      Register
    </button>
  </div>
  <form onSubmit={handleAuth} className="flex flex-col gap-5 w-full">
    <input
      required
      type="email"
      placeholder="Email"
      value={authForm.email}
      onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
      className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
      style={{ boxShadow: "0 2px 16px #00bfff22" }}
    />
    <div className="relative">
      <input
        required
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={authForm.password}
        onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
        className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200 pr-14"
        style={{ boxShadow: "0 2px 16px #00bfff22" }}
      />
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-700 text-xl focus:outline-none"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword(v => !v)}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3.75 3.75 0 0112 8.25c2.07 0 3.75 1.68 3.75 3.75 0 .53-.11 1.03-.3 1.5m-2.2 2.2a3.75 3.75 0 01-5.3-5.3" /></svg>
        )}
      </button>
    </div>
    {authMode === 'register' && (
      <>
        <input
          required
          type="text"
          placeholder="Secret Question (e.g. Mother's maiden name)"
          value={authForm.secret_question}
          onChange={e => setAuthForm(f => ({ ...f, secret_question: e.target.value }))}
          className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
          style={{ boxShadow: "0 2px 16px #00bfff22" }}
        />
        <div className="relative">
          <input
            required
            type={showSecret ? "text" : "password"}
            placeholder="Secret Answer"
            value={authForm.secret_answer}
            onChange={e => setAuthForm(f => ({ ...f, secret_answer: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200 pr-14"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-700 text-xl focus:outline-none"
            tabIndex={-1}
            aria-label={showSecret ? "Hide secret answer" : "Show secret answer"}
            onClick={() => setShowSecret(v => !v)}
          >
            {showSecret ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3.75 3.75 0 0112 8.25c2.07 0 3.75 1.68 3.75 3.75 0 .53-.11 1.03-.3 1.5m-2.2 2.2a3.75 3.75 0 01-5.3-5.3" /></svg>
            )}
          </button>
        </div>
      </>
    )}
    {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
    <button
      type="submit"
      className="w-full rounded-2xl px-7 py-5 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-xl hover:from-cyan-300 hover:to-blue-300 transition-all duration-200 mt-2"
      style={{ boxShadow: "0 4px 32px #00bfff33, 0 0 16px #00fff966" }}
    >
      {authMode === 'login' ? 'Login' : 'Register'}
    </button>
  </form>
  <div style={{ height: '120px' }} />
</div>
          </>
        ) : loadingOnboarding ? (
          <div className="text-cyan-600 font-semibold text-lg">Loading onboarding…</div>
        ) : onboardingComplete ? (
          <OnboardingComplete user={user} onLogoutAction={handleLogout} />
        ) : (
          <OnboardingModal
  user={user}
  supabase={supabase}
  onLogoutAction={handleLogout}
  onOnboardingComplete={() => setOnboardingComplete(true)}
/>
        )}
      </div>
    </div>
  );
}