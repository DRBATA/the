// Venue and offer definitions (extended MVP)
export type MicroArea = "Marina" | "DIFC" | "AlQuoz" | "SustainableCity" | "SiliconOasis";
export type VenueRole = "dayAnchor" | "eveningAnchor" | "anchor24h" | "redundancy";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VenueOffer {
  id: string;
  title: string;
  description: string;
  code?: string;
  validUntil?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
  microArea: MicroArea;
  role: VenueRole;
  openTime: string;
  closeTime: string;
  reasons: string;
  hook: string;
  coordinates: Coordinates;
  offers: VenueOffer[];
}

export const venues: Venue[] = [
  {
    id: "soulgreen-dubai-creek-veda",
    name: "SoulGreen – Dubai Creek Veda",
    address: "Veda Mall, Sheikh Rashid Rd, Dubai Creek, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=SoulGreen+Dubai+Creek+Veda",
    microArea: "DIFC",
    role: "dayAnchor",
    openTime: "08:00",
    closeTime: "20:00",
    reasons: "Healthy bowls & salads, sustainable packaging, prime demo site footfall",
    hook: "Enjoy 20% off any Buddha Bowl after your refill!",
    coordinates: { latitude: 25.1946, longitude: 55.3273 },
    offers: [
      {
        id: "buddha-bowl-20",
        title: "20% Off Any Buddha Bowl",
        description: "Show this voucher after refilling your bottle to redeem.",
        code: "SOULGREENDEMO",
        validUntil: "2025-12-31",
      },
    ],
  }, 
  {
    id: "risen-cafe-marina",
    name: "Risen Café & Artisanal Bakery – Dubai Marina",
    address: "Marina Promenade, Dubai Marina, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Risen+Cafe+Dubai+Marina",
    microArea: "Marina",
    role: "dayAnchor",
    openTime: "07:00",
    closeTime: "22:00",
    reasons: "Biodegradable fit-out, local-produce pledge, heavy promenade foot-traffic",
    hook: "Grab a mini-cruffin with specialty coffee after your refill!",
    coordinates: { latitude: 25.0779, longitude: 55.1296 },
    offers: [
      {
        id: "free-mini-cruffin",
        title: "Free Mini Cruffin with Any Specialty Coffee",
        description: "Show this voucher after refilling your bottle. Valid today only!",
        code: "RISENCRUFFIN",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "sobe-rooftop-bar",
    name: "SoBe Rooftop Bar – W Dubai The Palm",
    address: "W Dubai – The Palm, Palm Jumeirah, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=SoBe+Rooftop+Bar+Dubai",
    microArea: "Marina",
    role: "eveningAnchor",
    openTime: "16:00",
    closeTime: "02:00",
    reasons: "Zero-plastic barware, spectacular sunset views, vibrant social media reach",
    hook: "Sunset 2-for-1 ‘Miami Vice’ mocktails 17-19 h!",
    coordinates: { latitude: 25.1381, longitude: 55.1310 },
    offers: [
      {
        id: "miami-vice-bogo",
        title: "2-for-1 ‘Miami Vice’ Mocktail",
        description: "Valid 17-19 h after your refill. Present this offer at the bar.",
        code: "SOBESUNSET",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "espresso-lab-d3",
    name: "The Espresso Lab – Dubai Design District",
    address: "Building 7, Dubai Design District, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Espresso+Lab+Dubai",
    microArea: "DIFC",
    role: "dayAnchor",
    openTime: "07:00",
    closeTime: "23:00",
    reasons: "Carbon‑neutral roastery, design‑week crowd, speciality coffee awards",
    hook: "Free oat‑milk upgrade on any pour‑over after refill!",
    coordinates: { latitude: 25.1860, longitude: 55.2773 },
    offers: [
      {
        id: "free-oat-milk",
        title: "Free Oat‑Milk Upgrade on Any Pour‑Over",
        description: "Show this screen after refilling your bottle.",
        code: "LABOAT",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "boca-difc",
    name: "BOCA – DIFC",
    address: "Gate Village 6, DIFC, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=BOCA+DIFC",
    microArea: "DIFC",
    role: "eveningAnchor",
    openTime: "12:00",
    closeTime: "02:00",
    reasons: "Michelin Green Star, zero‑waste kitchen, strong ESG storytelling",
    hook: "Zero‑waste tapas free with first drink after refill!",
    coordinates: { latitude: 25.2086, longitude: 55.2802 },
    offers: [
      {
        id: "free-zero-waste-tapas",
        title: "Complimentary Zero‑Waste Tapas with First Drink",
        description: "Present after refill; bar only.",
        code: "BOCAZERO",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "galaxy-bar-difc",
    name: "Galaxy Bar – DIFC",
    address: "Gate Village 7, DIFC, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Galaxy+Bar+DIFC",
    microArea: "DIFC",
    role: "redundancy",
    openTime: "21:00",
    closeTime: "04:00",
    reasons: "World’s 50 Best Bars, paper‑less menus, late‑night option",
    hook: "10 % off ‘Milky Way’ signature cocktail after refill!",
    coordinates: { latitude: 25.2086, longitude: 55.2805 },
    offers: [
      {
        id: "milky-way-10pct",
        title: "10 % Off ‘Milky Way’ Signature Cocktail",
        description: "Show this voucher after your refill.",
        code: "GALAXY10",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "a4-space-alserkal",
    name: "A4 Space – Alserkal Avenue",
    address: "Warehouse 4, Alserkal Avenue, Al Quoz, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=A4+Space+Dubai",
    microArea: "AlQuoz",
    role: "dayAnchor",
    openTime: "11:00",
    closeTime: "19:00",
    reasons: "Dubai Can pioneer, co‑working & cultural events, community vibe",
    hook: "20 % off house‑brewed kombucha after refill!",
    coordinates: { latitude: 25.1443, longitude: 55.2306 },
    offers: [
      {
        id: "kombucha20",
        title: "20 % Off House‑Brewed Kombucha",
        description: "Valid same day as refill. Show at counter.",
        code: "A4KOMBU20",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "lowe-koa-canvas",
    name: "LOWE – KOA Canvas",
    address: "KOA Canvas, Al Barari, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=LOWE+Dubai",
    microArea: "AlQuoz",
    role: "eveningAnchor",
    openTime: "08:00",
    closeTime: "23:00",
    reasons: "Michelin Green Star, waste‑to‑table R&D, destination dining",
    hook: "Chef’s ‘Waste‑Not’ croquette free with any main after refill!",
    coordinates: { latitude: 25.0990, longitude: 55.3540 },
    offers: [
      {
        id: "waste-not-croquette",
        title: "Chef’s ‘Waste‑Not’ Croquette On the House",
        description: "Available with any main after your refill.",
        code: "LOWECROC",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "oasis-cafe-sustainable-city",
    name: "Oasis Café – The Sustainable City",
    address: "Sustainable Plaza, The Sustainable City, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Oasis+Cafe+Sustainable+City+Dubai",
    microArea: "SustainableCity",
    role: "dayAnchor",
    openTime: "07:00",
    closeTime: "20:00",
    reasons: "90 % recycled‑water system, net‑zero precinct showcase",
    hook: "Free date‑cacao energy bite with smoothie after refill!",
    coordinates: { latitude: 24.9821, longitude: 55.3047 },
    offers: [
      {
        id: "free-date-bite",
        title: "Free Date‑Cacao Energy Bite With Smoothie",
        description: "Show this voucher after refilling your bottle.",
        code: "OASISBITE",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "800-pizza-sustainable-city",
    name: "800 PIZZA – The Sustainable City",
    address: "Main Plaza, The Sustainable City, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=800+Pizza+Sustainable+City+Dubai",
    microArea: "SustainableCity",
    role: "eveningAnchor",
    openTime: "11:00",
    closeTime: "23:30",
    reasons: "Wood‑fired, recycled‑paper packaging, late‑night slice option",
    hook: "AED 10 off any Margherita slice with drink after 18 h refill!",
    coordinates: { latitude: 24.9825, longitude: 55.3049 },
    offers: [
      {
        id: "margherita10",
        title: "AED 10 Off Any Margherita Slice with Drink",
        description: "Present after 18 h refill for evening deal.",
        code: "PIZZA10",
        validUntil: "2025-12-31",
      },
    ],
  },
  {
    id: "dtec-cafe-silicon-oasis",
    name: "Dtec Campus Café – Dubai Silicon Oasis",
    address: "Dubai Technology Entrepreneur Campus, Octave Building, Dubai Silicon Oasis, Dubai, UAE",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dtec+Campus+Cafe+Dubai",
    microArea: "SiliconOasis",
    role: "anchor24h",
    openTime: "00:00",
    closeTime: "23:59",
    reasons: "24/7 startup campus, climate‑tech community, perfect IoT data pilot site",
    hook: "Free nitro cold‑brew shot before 09 h whenever you refill!",
    coordinates: { latitude: 25.1166, longitude: 55.3797 },
    offers: [
      {
        id: "nitro-shot-free",
        title: "Free Nitro Cold‑Brew Shot Before 09 h",
        description: "Valid anytime you refill between 00:00‑09:00.",
        code: "DTECNITRO",
        validUntil: "2025-12-31",
      },
    ],
  }
];
