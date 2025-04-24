import { venues, Venue } from "../lib/venues";

interface OfferResult {
  venue: Venue;
  offer: Venue["offers"][number] | null;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Very simple selection: returns dayAnchor except last 90 mins of that venue's hours, then eveningAnchor if available, otherwise anchor24h.
export function chooseVenueOffer(now: Date): OfferResult {
  // Iterate microAreas by first dayAnchor occurrence order
  const areas = Array.from(new Set(venues.map(v => v.microArea)));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const area of areas) {
    const areaVenues = venues.filter(v => v.microArea === area);
    const day = areaVenues.find(v => v.role === "dayAnchor");
    const eve = areaVenues.find(v => v.role === "eveningAnchor");
    const all24 = areaVenues.find(v => v.role === "anchor24h");

    if (day) {
      const closeMins = timeToMinutes(day.closeTime);
      if (nowMinutes <= closeMins - 90) {
        return { venue: day, offer: day.offers[0] ?? null };
      }
      // within last 90 mins -> upsell evening
      if (eve) {
        return { venue: eve, offer: eve.offers[0] ?? null };
      }
    }
    if (eve && now.getHours() >= 17) {
      return { venue: eve, offer: eve.offers[0] ?? null };
    }
    if (all24) {
      return { venue: all24, offer: all24.offers[0] ?? null };
    }
  }

  // fallback to first venue
  return { venue: venues[0], offer: venues[0].offers[0] ?? null };
}
