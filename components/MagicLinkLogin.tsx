"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Send Magic Link
      </button>
      {sent && <p>Check your email for the magic link!</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
