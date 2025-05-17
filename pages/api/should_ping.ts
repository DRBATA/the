import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Request body interface
interface ShouldPingRequest {
  userId: string;
  location: { lat: number; lon: number };
  hydrationLevel: number;
  threshold: number;
}

// DB record interface
type HydrationSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
};

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Earth radius in meters
const EARTH_RADIUS = 6371000;

// Utility to convert degrees to radians
function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

// "Should-Ping" endpoint handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO for V0: supply userId, hydrationLevel, electrolyteNeed, foodNeed, etc. from user context/profile/plan
  const { location, hydrationLevel, threshold, electrolyteNeed, foodNeed } = req.body as ShouldPingRequest & { electrolyteNeed?: boolean, foodNeed?: boolean };
  const { lat, lon } = location;

  // 1) Check hydration threshold
  if (hydrationLevel < threshold) {
    return res.json({ shouldPing: false });
  }

  // 2) Venue logic - in production, fetch from DB or 2GIS API
  // Here, use static demo data for illustration
  const demoVenues = [
    {
      id: "cna1",
      name: "CNA Water Filling Station",
      coordinates: { latitude: 25.21, longitude: 55.28 },
      type: "water",
      offer: null,
      menu: null,
      distance: 90,
    },
    {
      id: "gym1",
      name: "FitLab Gym",
      coordinates: { latitude: 25.205, longitude: 55.275 },
      type: "electrolyte",
      offer: { title: "Free Electrolyte Shot with Refill!", voucher: null },
      menu: null,
      distance: 75,
    },
    {
      id: "cafe1",
      name: "Soulgreen Cafe",
      coordinates: { latitude: 25.202, longitude: 55.271 },
      type: "food",
      offer: { title: "10% Off Hydration Meal", voucher: "SOUL10" },
      menu: { item: "Watermelon Feta Salad", meets: "hydration+electrolyte" },
      distance: 60,
    },
  ];

  // 3) Filter venues by user need
  let filteredVenues = [];
  if (foodNeed) {
    filteredVenues = demoVenues.filter(v => v.type === "food");
  } else if (electrolyteNeed) {
    filteredVenues = demoVenues.filter(v => v.type === "electrolyte");
  } else {
    filteredVenues = demoVenues.filter(v => v.type === "water");
  }

  // Always include all venues within 100m for demo
  filteredVenues = demoVenues.filter(v => v.distance <= 100);

  // 4) Respond with venues, each with id, name, coordinates, type, offer, menu
  return res.json({
    shouldPing: true,
    venues: filteredVenues,
    // TODO for V0: extend venue types/offers, and supply user hydration state for smarter logic
  });
}

        cos(radians($1)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )) AS distance
    FROM hydration_spots
    WHERE latitude BETWEEN $3 AND $4
      AND longitude BETWEEN $5 AND $6
    HAVING distance <= $7
    ORDER BY distance
    LIMIT 1;
  `;

  try {
    const result = await pool.query<HydrationSpot>(query, [lat, lon, minLat, maxLat, minLon, maxLon, radiusMeters]);

    // 4) No nearby spot -> no ping
    if (result.rows.length === 0) {
      return res.json({ shouldPing: false });
    }

    // 5) Return nearest spot info
    const spot = result.rows[0];
    return res.json({
      shouldPing: true,
      spot: {
        id: spot.id,
        name: spot.name,
        lat: spot.latitude,
        lon: spot.longitude,
        distance: spot.distance
      }
    });
  } catch (err) {
    console.error('Error in should-ping:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
