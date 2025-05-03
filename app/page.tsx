"use client";

import MagicLinkLogin from "../components/MagicLinkLogin";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0074D9",
      }}
    >
      <MagicLinkLogin />
    </main>
  );
}