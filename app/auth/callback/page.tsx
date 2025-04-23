"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Consume the one‑time token in the URL, refresh session, store to localStorage
      await supabase.auth.getSession();
      // Redirect to homepage or returnTo param
      const url = new URL(window.location.href);
      const returnTo = url.searchParams.get("returnTo") || "/";
      router.replace(returnTo);
    })();
  }, [router]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <p>Logging you in…</p>
    </div>
  );
}
