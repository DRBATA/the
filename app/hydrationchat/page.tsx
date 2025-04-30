// HydrationChat page wrapper for /hydrationchat

"use client";
import HydrationChat from "../components/HydrationChat";

export default function HydrationChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-4">
        <HydrationChat onClose={() => { window.location.href = "/hydration"; }} />
      </div>
    </div>
  );
}
