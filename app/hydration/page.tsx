"use client";

import { useHydration } from "../../contexts/hydration-context";

export default function HydrationScreen() {
  const { hydration } = useHydration();
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">CO₂ Saved</h1>
      <p className="text-5xl font-bold text-green-600">{Math.round(hydration.co2Saved)}g</p>
    </div>
  );
}
