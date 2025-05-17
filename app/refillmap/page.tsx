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
  const [venues, setVenues] = useState<any[]>([]); // TODO: type this as Venue[]

  // TODO: Get from user context or props (for V0 integration)
  const userId = "demo-user-id";
  const hydrationLevel = 1; // Dummy
  const threshold = 0; // Dummy

  // Fetch venues from /api/should_ping when location changes
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    // Call /api/should_ping with userId, location, hydrationLevel, threshold
    fetch("/api/should_ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        location: { lat: userLocation[0], lon: userLocation[1] },
        hydrationLevel,
        threshold,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // data.venues: array of venues with offers/menu suggestions
        if (Array.isArray(data.venues)) {
          setVenues(data.venues);
        } else {
          // fallback to static
          setVenues(waterRefillStations.map((station, idx) => ({
            id: idx,
            name: station.name,
            coordinates: {
              latitude: station.latitude || 25.20,
              longitude: station.longitude || 55.27,
            },
            hook: station.description,
            mapsUrl: station.googleMapsUrl,
          })));
        }
      })
      .catch(() => {
        setVenues(waterRefillStations.map((station, idx) => ({
          id: idx,
          name: station.name,
          coordinates: {
            latitude: station.latitude || 25.20,
            longitude: station.longitude || 55.27,
          },
          hook: station.description,
          mapsUrl: station.googleMapsUrl,
        })));
      });
  }, [userLocation]);

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

