"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase will handle the access_token in the URL and set the session automatically.
    // You can add any post-login logic here if needed.
    router.replace("/"); // Redirect to homepage or dashboard
  }, [router]);

  return <p>Logging you in…</p>;
}
