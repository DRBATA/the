"use client"

import type React from "react"
import { useState } from "react"
import OnboardingModal from "./OnboardingModal" // Import the modal

export default function QuickHydrationPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showSecret, setShowSecret] = useState<boolean>(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    secret_question: "",
    secret_answer: "",
  })
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dummy login/register logic (client-side only)
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Simulate login/register
    if (!authForm.email || !authForm.password) {
      setError("Please fill all fields.")
      return
    }

    if (authMode === "register" && (!authForm.secret_question || !authForm.secret_answer)) {
      setError("Please provide a secret question and answer.")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authForm.email)) {
      setError("Please enter a valid email address.")
      return
    }

    // Demo credentials check
    if (authMode === "login" && authForm.email === "demo@waterbar.com" && authForm.password === "WaterBar123!") {
      // Demo login success
      setUser({ email: authForm.email })
      setOnboardingOpen(true)
      return
    }

    // For demo purposes, also allow any valid email/password combination
    if (authForm.password.length >= 8) {
      // Simulate success
      setUser({ email: authForm.email })
      setOnboardingOpen(true)
    } else {
      setError("Password must be at least 8 characters long.")
    }
  }

  function handleLogout() {
    setUser(null)
    setAuthForm({ email: "", password: "", secret_question: "", secret_answer: "" })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-900 to-indigo-950">
      {/* Abstract Water Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.2),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.3),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
      </div>

      {/* Animated Water Ripples */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10"
            style={{
              width: `${100 + i * 40}px`,
              height: `${100 + i * 40}px`,
              left: `${50 + Math.sin(i * 0.5) * 10}%`,
              top: `${30 + Math.cos(i * 0.5) * 20}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 40px 20px rgba(6, 182, 212, 0.15)",
              animation: `ripple ${6 + i * 2}s infinite ease-out`,
            }}
          />
        ))}
      </div>

      {/* Centered Glass Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto">
        {!user ? (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            {/* Logo and Title */}
            <div className="pt-8 pb-4 px-6 text-center">
              <div className="inline-block mb-2">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="mx-auto">
                  <circle cx="30" cy="30" r="28" stroke="rgba(6, 182, 212, 0.8)" strokeWidth="2" fill="none" />
                  <path
                    d="M30 15 C 20 25, 40 35, 30 45"
                    stroke="rgba(6, 182, 212, 0.8)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">WATER</span>{" "}
                BAR
              </h1>
              <p className="text-cyan-100/70 mt-1 text-sm">Premium hydration experience</p>
            </div>

            {/* Auth Tabs */}
            <div className="flex px-6 mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
                  authMode === "login"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/60 hover:text-white/80"
                }`}
                onClick={() => setAuthMode("login")}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
                  authMode === "register"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/60 hover:text-white/80"
                }`}
                onClick={() => setAuthMode("register")}
              >
                Create Account
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="px-6 pb-8 space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-medium text-cyan-100/70">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-medium text-cyan-100/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {authMode === "register" && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="secret_question" className="text-xs font-medium text-cyan-100/70">
                      Secret Question
                    </label>
                    <input
                      id="secret_question"
                      required
                      type="text"
                      placeholder="e.g. Mother's maiden name"
                      value={authForm.secret_question}
                      onChange={(e) => setAuthForm((f) => ({ ...f, secret_question: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="secret_answer" className="text-xs font-medium text-cyan-100/70">
                      Secret Answer
                    </label>
                    <div className="relative">
                      <input
                        id="secret_answer"
                        required
                        type={showSecret ? "text" : "password"}
                        placeholder="Your answer"
                        value={authForm.secret_answer}
                        onChange={(e) => setAuthForm((f) => ({ ...f, secret_answer: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70"
                        tabIndex={-1}
                        aria-label={showSecret ? "Hide answer" : "Show answer"}
                        onClick={() => setShowSecret((v) => !v)}
                      >
                        {showSecret ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-200 mt-2 relative overflow-hidden group"
              >
                <span className="relative z-10">{authMode === "login" ? "Sign In" : "Create Account"}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-x-1/4 top-0 h-[300%] w-[150%] -translate-y-[100%] rotate-45 bg-white/20 group-hover:translate-y-[100%] transition-transform duration-700"></span>
              </button>
            </form>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.25)] p-8 text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-300"
              >
                <path d="M18 20a6 6 0 0 0-12 0" />
                <circle cx="12" cy="10" r="4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-cyan-100/70 mb-6">{user.email}</p>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white font-medium transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal open={onboardingOpen} onCloseAction={() => setOnboardingOpen(false)} />

      {/* Add keyframe animation for ripples */}
      <style jsx global>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
