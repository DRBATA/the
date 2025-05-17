import { Droplets } from "lucide-react"
import type { Compartment, HydrationAction, Location } from "./types"

// Compartment definitions
export const compartments: { [key: string]: Compartment } = {
  IVF: { label: "Blood Vessels", volume: 3, osmoles: ["Na⁺", "Albumin", "BUN", "Glucose"] },
  ISF: { label: "Between Cells", volume: 12, osmoles: ["Na⁺", "Cl⁻", "Glucose"] },
  ICF: { label: "Inside Cells", volume: 25, osmoles: ["K⁺", "Mg²⁺", "Pi", "Glucose"] },
}

// Sample hydration actions
export const hydrationActions: HydrationAction[] = [
  {
    id: "water",
    name: "Pure Water",
    effects: { IVF: { H2O: 2 } },
    hormones: { ADH: -1 },
    description: "Pure water is quickly absorbed into your bloodstream.",
    color: "#00FFFF",
    icon: <Droplets size={16} />,
  },
  {
    id: "miso",
    name: "Miso Broth",
    effects: { IVF: { Na: 5, BUN: 1 } },
    hormones: { Aldosterone: -1 },
    description: "Adds sodium and umami compounds to your bloodstream.",
    color: "#FFAA00",
  },
  {
    id: "banana",
    name: "Banana",
    effects: { ICF: { K: 5, Glucose: 2 } },
    hormones: { Aldosterone: -2 },
    description: "Adds potassium and glucose, primarily affecting your cells.",
    color: "#FFFF00",
  },
  {
    id: "run",
    name: "Run 20 min",
    effects: {
      ISF: { Na: -3, Cl: -3 },
      IVF: { BUN: 1 },
      ICF: { K: -2 },
    },
    hormones: { Aldosterone: 2, ADH: 2, Cortisol: 1, Testosterone: 1 },
    description: "Exercise depletes electrolytes through sweat and increases metabolic activity.",
    color: "#FF5555",
  },
  {
    id: "electrolyte",
    name: "Electrolyte Drink",
    effects: {
      IVF: { Na: 3, H2O: 2 },
      ISF: { H2O: 1 },
    },
    hormones: { ADH: -1 },
    description: "Replenishes sodium and water, helping maintain fluid balance.",
    color: "#00AAFF",
  },
  {
    id: "mineral",
    name: "Mineral Water",
    effects: {
      IVF: { Na: 1, H2O: 2 },
      ISF: { H2O: 1 },
    },
    hormones: { ADH: -1 },
    description: "Natural minerals enhance hydration and cellular function.",
    color: "#55FFAA",
  },
  {
    id: "coconut",
    name: "Coconut Water",
    effects: {
      IVF: { K: 2, H2O: 2 },
      ISF: { H2O: 1 },
    },
    hormones: { ADH: -1, Aldosterone: -1 },
    description: "Nature's electrolyte drink, rich in potassium.",
    color: "#AAFFAA",
  },
]

// Sample nearby locations
export const nearbyLocations: Location[] = [
  {
    id: "water-station",
    name: "CNA Water Filling Station",
    distance: "90m away",
    type: "water",
    offer: null,
  },
  {
    id: "gym",
    name: "FitLab Gym",
    distance: "75m away",
    type: "electrolyte",
    offer: "Free Electrolyte Shot with Refill!",
  },
  {
    id: "cafe",
    name: "Soulgreen Cafe",
    distance: "60m away",
    type: "food",
    offer: "10% Off Hydration Meal",
    code: "SOUL10",
    recommendation: "Watermelon Feta Salad",
    tags: ["hydration", "electrolyte"],
  },
]
