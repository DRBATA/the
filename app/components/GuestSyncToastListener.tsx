"use client";
import { useEffect } from "react";

export function GuestSyncToastListener() {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (window.showToast) {
        window.showToast(e.detail.message, "success");
      } else {
        alert(e.detail.message); // fallback
      }
    };
    window.addEventListener("guest-sync-toast", handler as EventListener);
    return () => window.removeEventListener("guest-sync-toast", handler as EventListener);
  }, []);
  return null;
}
