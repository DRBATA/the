"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle Supabase magic link/callback, then redirect
    (async () => {
      try {
        await supabase.auth.getSession();
      } catch (err) {
        console.error("Auth callback error:", err);
      } finally {
        const url = new URL(window.location.href);
        const returnTo = url.searchParams.get("returnTo") || "/";
        router.replace(returnTo);
      }
    })();
  }, [router]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <p>Logging you in…</p>
    </div>
  );
}
