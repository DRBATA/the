"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Simple celebratory mosaic confetti animation
function MosaicCelebration({ show }: { show: boolean }) {
  if (!show) return null;
  // Render 20-30 random mosaic shapes with neon colors and fade-out animation
  const shapes = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <svg className="absolute w-full h-full" style={{ pointerEvents: "none" }}>
        {shapes.map((_, i) => {
          const size = 18 + Math.random() * 18;
          const x = Math.random() * 320;
          const y = 120 + Math.random() * 180;
          const rotate = Math.random() * 360;
          const color = [
            "#2dd4bf", // teal
            "#34d399", // emerald
            "#facc15", // gold
            "#38bdf8", // blue
            "#bef264", // lime
            "#f472b6", // pink
            "#fbbf24", // orange
          ][i % 7];
          return (
            <polygon
              key={i}
              points="10,0 20,10 10,20 0,10"
              fill={color}
              fillOpacity={0.85}
              style={{
                transform: `translate(${x}px,${y}px) rotate(${rotate}deg) scale(${size / 20})`,
                opacity: 0.8,
                filter: "drop-shadow(0 0 6px " + color + ")",
                animation: `fade-mosaic 1.6s ${i * 0.05}s both`,
              }}
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes fade-mosaic {
          0% { opacity: 0; transform: scale(0.7) translateY(0px); }
          30% { opacity: 1; transform: scale(1.1) translateY(-20px); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: scale(0.8) translateY(-80px); }
        }
      `}</style>
    </div>
  );
}

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else {
      setSent(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1700);
    }
  };

  return (
    <div className="relative w-full max-w-xs p-8 rounded-2xl shadow-2xl glass-effect border-4 border-blue-400" style={{ overflow: "hidden" }}>
      {/* Mosaic SVG background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{ zIndex: 0 }}
        viewBox="0 0 320 320"
        fill="none"
      >
        <defs>
          <pattern id="mosaic-login" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="40" height="40" fill="white" fillOpacity="0.0" />
            <polygon points="20,0 40,20 20,40 0,20" fill="#38bdf8" fillOpacity="0.5" />
            <circle cx="20" cy="20" r="8" fill="#fff" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="320" height="320" fill="url(#mosaic-login)" />
      </svg>
      <MosaicCelebration show={showCelebration} />
      <form onSubmit={handleLogin} className="flex flex-col gap-4 z-10 relative">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border-2 border-blue-200 p-3 rounded-xl bg-white/80 focus:border-blue-400 focus:outline-none transition"
        />
        <button type="submit" className="w-full px-6 py-3 rounded-xl font-bold text-lg shadow-lg bg-blue-600/80 border border-blue-400 text-cyan-50 hover:bg-blue-500 transition-all duration-300">
          Send Magic Link
        </button>
        {sent && <p className="text-green-700 text-center">Check your email for the magic link!</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
}
