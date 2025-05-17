import type { CompartmentState, HydrationAction } from "./types"
import { hydrationActions as hydrationActionsConstants } from "./constants"

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

export const hydrationActions = hydrationActionsConstants
