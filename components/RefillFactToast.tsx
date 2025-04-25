"use client";
import React, { useEffect, useState } from "react";
import { Venue, VenueOffer } from "../lib/venues";

interface Payload {
  fact: string;
  venue: Venue;
  offer: VenueOffer | null;
}

const RefillOfferToast: React.FC = () => {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<Payload>) => {
      setPayload(e.detail);
      setTimeout(() => setPayload(null), 5000);
    };
    window.addEventListener("refill-toast", handler as EventListener);
    return () => window.removeEventListener("refill-toast", handler as EventListener);
  }, []);

  if (!payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white text-black rounded-xl shadow-xl px-6 py-4 text-base font-semibold pointer-events-auto overlay border-2 border-[color:var(--primary-blue)] max-w-sm w-full">
        <div className="mb-2 flex items-center"><span role="img" aria-label="burst" className="mr-2 text-[color:var(--primary-blue)]">💧</span>{payload.fact}</div>
        {payload.offer && (
          <div className="text-sm text-[color:var(--primary-blue-dark)] font-medium">Try <span className="font-bold text-[color:var(--primary-blue)]">{payload.venue.name}</span>: {payload.offer.title}</div>
        )}
      </div>
    </div>
  );
};

export default RefillOfferToast;
