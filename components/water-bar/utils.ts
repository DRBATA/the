import type { CompartmentState, UserProfile, HydrationAction } from "./types"

// Calculate osmolality for a compartment
export function calculateOsmolality(compartment: { [key: string]: number }) {
  const { Na = 0, K = 0, Cl = 0, Glucose = 0, BUN = 0 } = compartment
  return Math.round(2 * (Na + K + Cl) + Glucose / 18 + BUN / 2.8)
}

// Calculate hydration score based on compartment states
export function calculateHydrationScore(state: CompartmentState) {
  // Total water content (50% of score)
  const totalH2O = state.IVF.H2O + state.ISF.H2O + state.ICF.H2O
  const waterScore = Math.min(totalH2O / 50, 1) * 50

  // Distribution ratio (30% of score)
  const idealRatio = [3, 12, 25]
  const userRatio = [state.IVF.H2O, state.ISF.H2O, state.ICF.H2O]
  const deviation = idealRatio.reduce((sum, ideal, i) => sum + Math.abs(ideal - userRatio[i]), 0)
  const distributionScore = Math.max(0, 30 - deviation)

  // Osmolality balance (20% of score)
  const IVF_Osm = calculateOsmolality(state.IVF)
  const ISF_Osm = calculateOsmolality(state.ISF)
  const ICF_Osm = calculateOsmolality(state.ICF)
  const avgOsm = (IVF_Osm + ISF_Osm + ICF_Osm) / 3
  const osmDeviation = Math.abs(IVF_Osm - avgOsm) + Math.abs(ISF_Osm - avgOsm) + Math.abs(ICF_Osm - avgOsm)
  const osmScore = Math.max(0, 20 - osmDeviation)

  return Math.round(waterScore + distributionScore + osmScore)
}

// Apply an action to a state and return the new state
export function applyAction(currentState: CompartmentState, action: HydrationAction): CompartmentState {
  const newState = JSON.parse(JSON.stringify(currentState)) // Deep copy

  // Apply effects to compartments
  for (const [comp, changes] of Object.entries(action.effects)) {
    for (const [solute, delta] of Object.entries(changes)) {
      newState[comp][solute] = (newState[comp][solute] || 0) + delta
    }
  }

  // Apply hormonal effects
  if (action.hormones) {
    for (const [hormone, delta] of Object.entries(action.hormones)) {
      newState.Hormones[hormone] = (newState.Hormones[hormone] || 0) + delta
    }
  }

  return newState
}

// Generate time slots for the 24-hour clock
export function generateTimeSlots() {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
  }
  return slots
}

// Calculate the angle for a time slot
export function getTimeAngle(time: string) {
  const [hours] = time.split(":").map(Number)
  return (hours / 24) * 360
}

// Check if a time slot is in the past
export function isTimeInPast(time: string, currentTime: string) {
  return time <= currentTime
}

// Check if a time slot is the current hour
export function isCurrentHour(time: string, currentTime: string) {
  return time === currentTime
}

// Get the status text for the hydration score
export function getHydrationStatus(hydrationScore: number) {
  if (hydrationScore >= 80) return "Well Hydrated"
  if (hydrationScore >= 60) return "Adequately Hydrated"
  if (hydrationScore >= 40) return "Mildly Dehydrated"
  return "Dehydrated"
}

// Calculate total body water based on user profile
export function calculateTotalBodyWater(userProfile: UserProfile) {
  if (!userProfile.weight || !userProfile.age || !userProfile.biologicalSex) {
    return null
  }

  // Watson formula for total body water
  let tbw = 0
  if (userProfile.biologicalSex === "male") {
    // Male: TBW = 2.447 - (0.09516 × age) + (0.1074 × height) + (0.3362 × weight)
    tbw = 2.447 - 0.09516 * userProfile.age + 0.1074 * (userProfile.height || 170) + 0.3362 * userProfile.weight
  } else {
    // Female: TBW = -2.097 + (0.1069 × height) + (0.2466 × weight)
    tbw = -2.097 + 0.1069 * (userProfile.height || 160) + 0.2466 * userProfile.weight
  }

  // Adjust based on muscle mass if available
  if (userProfile.muscleMass) {
    // Higher muscle mass means more water
    const muscleFactor = 1 + (userProfile.muscleMass - 30) / 100
    tbw = tbw * muscleFactor
  }

  return Math.round(tbw * 10) / 10 // Round to 1 decimal place
}
