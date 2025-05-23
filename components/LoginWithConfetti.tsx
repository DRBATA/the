"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { db, MetaRecord } from "../lib/dexieClient";
import { supabase } from "../lib/supabaseClient";

const CONFETTI_COLORS = ["#00C2A0", "#00796B", "#FFD600", "#3DDC97"]; // Brand colors

export default function LoginWithConfetti() {
  const [email, setEmail] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount, try to load last used email from Dexie
  useEffect(() => {
    db.meta.orderBy('id').reverse().first().then(record => {
      if (record?.email) setEmail(record.email);
    });
  }, []);

  const handleLogin = async (loginEmail: string) => {
    setLoading(true);
    setMessage("");
    try {
      await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      // Save email to Dexie for future pre-fill
      await db.meta.put({ email: loginEmail, lastMagicLinkSent: new Date().toISOString() });
      setShowConfetti(true);
      setMessage(
        `🎉 Email sent! Check your inbox for your magic link.`
      );
      setTimeout(() => setShowConfetti(false), 2000);
    } catch (error) {
      console.error("Magic link error:", error);
      setMessage("Failed to send magic link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: 220 }}>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={120}
          colors={CONFETTI_COLORS}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none" }}
        />
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleLogin(email);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}
      >
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ fontSize: 18, padding: 8, borderRadius: 8, border: "1px solid #ccc", width: 260 }}
        />
        <button
          type="submit"
          disabled={loading || !email}
          style={{ fontSize: 18, padding: "8px 24px", borderRadius: 8, background: "#00C2A0", color: "#fff", border: "none", cursor: "pointer" }}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
      {email && !loading && (
        <button
          onClick={() => handleLogin(email)}
          className="btn" style={{marginTop:16}}
        >
          Log in as {email}
        </button>
      )}
      {message && (
        <div style={{ marginTop: 24, fontSize: 18, textAlign: "center" }}>{message}</div>
      )}
    </div>
  );
}
