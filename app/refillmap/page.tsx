"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { waterRefillStations } from "../../lib/waterRefillStations";

// Dynamically import RefillMap to avoid SSR issues with leaflet
const RefillMap = dynamic(() => import("../../components/RefillMap").then(mod => mod.RefillMap), {
  ssr: false,
});

export default function RefillMapPage() {
  // Optional: user geolocation
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  // Convert waterRefillStations to venues format expected by RefillMap
  const venues = waterRefillStations.map((station, idx) => ({
    id: idx,
    name: station.name,
    coordinates: {
      latitude: station.latitude || 25.20, // fallback if not present
      longitude: station.longitude || 55.27,
    },
    hook: station.description,
    mapsUrl: station.googleMapsUrl,
  }));

  return (
    <div className="h-screen w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      {/* Header style can be added here if needed */}
      <div className="flex-1 min-h-0">
        <RefillMap
          venues={venues}
          center={userLocation || [25.20, 55.27]}
          zoom={userLocation ? 13 : 11}
        />
      </div>
    </div>
  );
}
