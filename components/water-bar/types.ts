import type React from "react"
// User profile type
export type UserProfile = {
  username: string | null
  height: number | null // in cm
  weight: number | null // in kg
  age: number | null
  biologicalSex: "male" | "female" | null
  muscleMass: number | null // percentage
  supabaseId: string | null
  isLoggedIn: boolean
}

// Compartment type
export type Compartment = {
  label: string
  volume: number
  osmoles: string[]
}

// Compartment state type
export type CompartmentState = {
  [key: string]: { [key: string]: number }
}

// Hydration action type
export type HydrationAction = {
  id: string
  name: string
  effects: { [compartment: string]: { [solute: string]: number } }
  hormones?: { [hormone: string]: number }
  description: string
  color: string
  icon?: React.ReactNode
}

// Timeline event type
export type TimelineEvent = {
  id: string
  time: string // Format: "HH:MM"
  timestamp: Date
  actionId: string
  state: CompartmentState
  source: "user" | "ai" | "planned"
  confirmed: boolean
}

// Location type
export type Location = {
  id: string
  name: string
  distance: string
  type: "water" | "electrolyte" | "food"
  offer: string | null
  code?: string
  recommendation?: string
  tags?: string[]
}
