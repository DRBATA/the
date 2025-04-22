export interface WaterRefillStation {
  name: string;
  address: string;
  googleMapsUrl: string;
  image: string;
  description: string;
  menuUrl?: string;
}

export const waterRefillStations: WaterRefillStation[] = [
  {
    name: "Ras Al Khor - Dubai Creek Harbour",
    address: "Dubai - United Arab Emirates",
    googleMapsUrl:
      "https://www.google.com/maps?q=Ras+Al+Khor+-+Dubai+Creek+Harbour+-+Dubai+-+United+Arab+Emirates",
    image: "/images/soulgreen-logo.png",
    description:
      "Discover Soulgreen and other unique refill partners across Dubai!\nWe carefully select each location for quality, sustainability, and a welcoming experience.\nTap a location to learn more, see the menu, or get directions.\n\nEnjoy wellness-focused dishes crafted with seasonal ingredients that nourish body and soul, while respecting biodiversity.",
    menuUrl:
      "https://qr.mydigimenu.com/6c7faf86-ccf2-469b-9a83-eca4f2bab0fb/menu-page?menuID=46095",
  },
  // Add more locations here as needed
];
