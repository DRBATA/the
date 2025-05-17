"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, X, Info, ChevronUp, ChevronDown, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

// Types for our hydration model
type Compartment = {
  label: string
  volume: number
  osmoles: string[]
}

type CompartmentState = {
  [key: string]: { [key: string]: number }
}

type HydrationAction = {
  id: string
  name: string
  effects: { [compartment: string]: { [solute: string]: number } }
  hormones?: { [hormone: string]: number }
  description: string
  color: string
  icon?: React.ReactNode
}

type TimelineEvent = {
  id: string
  time: string // Format: "HH:MM"
  timestamp: Date
  actionId: string
  state: CompartmentState
  source: "user" | "ai" | "planned"
  confirmed: boolean
}

// Compartment definitions
const compartments: { [key: string]: Compartment } = {
  IVF: { label: "Blood Vessels", volume: 3, osmoles: ["Na⁺", "Albumin", "BUN", "Glucose"] },
  ISF: { label: "Between Cells", volume: 12, osmoles: ["Na⁺", "Cl⁻", "Glucose"] },
  ICF: { label: "Inside Cells", volume: 25, osmoles: ["K⁺", "Mg²⁺", "Pi", "Glucose"] },
  "4CF": {
    label: "4th Compartment",
    volume: 1,
    osmoles: ["ADH", "Urea", "Aquaporins", "Skin", "CollectingDuct", "Sweat"],
  },
}

// Sample hydration actions with colors inspired by the Water Bar images
const hydrationActions: HydrationAction[] = [
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
      "4CF": { Urea: 1, Skin: 1, Sweat: 2 },
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
      "4CF": { Minerals: 2 },
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

// Calculate osmolality for a compartment
function calculateOsmolality(compartment: { [key: string]: number }) {
  // Osmolality formula: sum of all solute concentrations
  // Each solute contributes differently to osmolality based on its properties

  // Primary electrolytes (contribute 2× their concentration due to dissociation)
  const { Na = 0, K = 0, Cl = 0 } = compartment
  const electrolytes = 2 * (Na + K + Cl) // Factor of 2 accounts for ionic dissociation

  // Organic molecules (contribute based on molecular weight)
  const { Glucose = 0, BUN = 0, Albumin = 0 } = compartment
  const glucose = Glucose / 18 // Glucose MW ≈ 180, divided by 10 for concentration units
  const urea = BUN / 2.8 // BUN to urea conversion factor
  const protein = Albumin * 1.4 // Albumin contribution to oncotic pressure

  // Sum all contributions and round to nearest whole number
  return Math.round(electrolytes + glucose + urea + protein)
}

// Calculate hydration score based on compartment states
function calculateHydrationScore(state: CompartmentState) {
  // 1. Total water content (50% of score)
  const totalH2O = state.IVF.H2O + state.ISF.H2O + state.ICF.H2O + (state["4CF"].H2O || 0)
  const idealTotalH2O = 40 // Ideal total body water (in liters)
  const waterPercentage = Math.min(totalH2O / idealTotalH2O, 1.2) // Allow up to 120% hydration
  const waterScore = Math.min(50, waterPercentage * 50) // Max 50 points

  // 2. Distribution ratio (30% of score)
  // Ideal distribution: IVF 7.5%, ISF 30%, ICF 62.5%
  const idealRatio = [0.075, 0.3, 0.625] // Proportions of total water
  const actualVolumes = [state.IVF.H2O, state.ISF.H2O, state.ICF.H2O]
  const actualTotal = actualVolumes.reduce((sum, vol) => sum + vol, 0)

  // Calculate actual ratios
  const actualRatio = actualVolumes.map((vol) => (actualTotal > 0 ? vol / actualTotal : 0))

  // Calculate deviation from ideal ratio (sum of absolute differences)
  const ratioDeviation = idealRatio.reduce((sum, ideal, i) => sum + Math.abs(ideal - actualRatio[i]), 0)

  // Convert to score (lower deviation = higher score)
  const distributionScore = Math.max(0, 30 - ratioDeviation * 100)

  // 3. Osmolality balance (20% of score)
  const IVF_Osm = calculateOsmolality(state.IVF)
  const ISF_Osm = calculateOsmolality(state.ISF)
  const ICF_Osm = calculateOsmolality(state.ICF)

  // Ideal osmolality is around 290 mOsm/kg
  const idealOsm = 290
  const osmDeviation = (Math.abs(IVF_Osm - idealOsm) + Math.abs(ISF_Osm - idealOsm) + Math.abs(ICF_Osm - idealOsm)) / 3 // Average deviation

  // Convert to score (lower deviation = higher score)
  const osmScore = Math.max(0, 20 - osmDeviation / 10)

  // 4. Hormone balance (bonus points, up to 5)
  const { ADH = 0, Aldosterone = 0 } = state.Hormones
  const hormoneBalance = 5 - Math.min(5, Math.abs(ADH) + Math.abs(Aldosterone))

  // Calculate final score (sum of all components)
  return Math.round(waterScore + distributionScore + osmScore + hormoneBalance)
}

// Add this new function to calculate fluid shifts between compartments
function calculateFluidShifts(state: CompartmentState): CompartmentState {
  const newState = JSON.parse(JSON.stringify(state)) // Deep copy

  // Get osmolality of each compartment
  const IVF_Osm = calculateOsmolality(state.IVF)
  const ISF_Osm = calculateOsmolality(state.ISF)
  const ICF_Osm = calculateOsmolality(state.ICF)

  // Calculate osmotic gradients
  const IVF_ISF_gradient = IVF_Osm - ISF_Osm
  const ISF_ICF_gradient = ISF_Osm - ICF_Osm

  // Calculate water shifts based on osmotic gradients
  // Water moves from lower to higher osmolality
  const IVF_ISF_shift = IVF_ISF_gradient * 0.01 // Scale factor for reasonable shifts
  const ISF_ICF_shift = ISF_ICF_gradient * 0.02 // ICF barrier is less permeable

  // Apply water shifts
  if (IVF_ISF_shift > 0) {
    // Water moves from ISF to IVF
    newState.ISF.H2O = Math.max(0, state.ISF.H2O - IVF_ISF_shift)
    newState.IVF.H2O = state.IVF.H2O + IVF_ISF_shift
  } else {
    // Water moves from IVF to ISF
    newState.IVF.H2O = Math.max(0, state.IVF.H2O + IVF_ISF_shift)
    newState.ISF.H2O = state.ISF.H2O - IVF_ISF_shift
  }

  if (ISF_ICF_shift > 0) {
    // Water moves from ICF to ISF
    newState.ICF.H2O = Math.max(0, state.ICF.H2O - ISF_ICF_shift)
    newState.ISF.H2O = newState.ISF.H2O + ISF_ICF_shift
  } else {
    // Water moves from ISF to ICF
    newState.ISF.H2O = Math.max(0, newState.ISF.H2O + ISF_ICF_shift)
    newState.ICF.H2O = state.ICF.H2O - ISF_ICF_shift
  }

  // Apply hormone effects
  const { ADH = 0, Aldosterone = 0 } = state.Hormones

  // ADH increases water reabsorption in collecting ducts
  if (ADH > 0) {
    const waterRetained = Math.min(state["4CF"].H2O, ADH * 0.1)
    newState["4CF"].H2O = state["4CF"].H2O - waterRetained
    newState.IVF.H2O = newState.IVF.H2O + waterRetained
  }

  // Aldosterone increases sodium reabsorption
  if (Aldosterone > 0) {
    const naRetained = Aldosterone * 0.5
    newState.IVF.Na = state.IVF.Na + naRetained
  }

  return newState
}

// Apply an action to a state and return the new state
function applyAction(currentState: CompartmentState, action: HydrationAction): CompartmentState {
  let newState = JSON.parse(JSON.stringify(currentState)) // Deep copy

  // Apply direct effects to compartments
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

  // Calculate secondary effects (fluid shifts between compartments)
  newState = calculateFluidShifts(newState)

  return newState
}

// Generate time slots for the 24-hour clock
function generateTimeSlots() {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
  }
  return slots
}

export default function AmnioticDialEnhanced() {
  // State for the current time and selected time
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:00`
  })
  const [selectedTime, setSelectedTime] = useState<string>(currentTime)
  const [scrubbing, setScrubbing] = useState(false)
  const [scrubAngle, setScrubAngle] = useState(0)

  // State for the compartment states and timeline
  const [initialState, setInitialState] = useState<CompartmentState>({
    IVF: { Na: 140, Albumin: 4, BUN: 15, Glucose: 90, H2O: 3 },
    ISF: { Na: 140, Cl: 100, Glucose: 90, H2O: 12 },
    ICF: { K: 140, Mg: 30, Pi: 100, Glucose: 20, H2O: 25 },
    "4CF": { ADH: 0, Urea: 0, Aquaporins: 0, Skin: 0, CollectingDuct: 0, Sweat: 0, Glucose: 0, H2O: 1 },
    Hormones: { Aldosterone: 0, ADH: 0, Cortisol: 0, Estrogen: 0, Testosterone: 0 },
  })

  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [currentState, setCurrentState] = useState<CompartmentState>(initialState)
  const [hydrationScore, setHydrationScore] = useState<number>(calculateHydrationScore(initialState))

  // State for UI interactions
  const [draggingAction, setDraggingAction] = useState<HydrationAction | null>(null)
  const [showActionDrawer, setShowActionDrawer] = useState<boolean>(true)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<TimelineEvent[]>([])
  const [showCompartmentDetails, setShowCompartmentDetails] = useState<boolean>(false)
  const [selectedCompartment, setSelectedCompartment] = useState<string | null>(null)
  const [showWaterBarLogo, setShowWaterBarLogo] = useState<boolean>(true)

  // Add this state for tab management near the other state declarations
  const [activeTab, setActiveTab] = useState<"drinks" | "foods" | "activities">("drinks")

  // Refs for the dial and canvas
  const dialRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  // Time slots for the 24-hour clock
  const timeSlots = generateTimeSlots()

  // Effect to update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(`${now.getHours().toString().padStart(2, "0")}:00`)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Effect to update the current state based on the selected time
  useEffect(() => {
    // Find all confirmed events up to the selected time
    const relevantEvents = timeline
      .filter((event) => event.confirmed && event.time <= selectedTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    if (relevantEvents.length === 0) {
      setCurrentState(initialState)
    } else {
      // Get the state from the most recent event
      setCurrentState(relevantEvents[relevantEvents.length - 1].state)
    }
  }, [selectedTime, timeline, initialState])

  // Effect to update the hydration score when the current state changes
  useEffect(() => {
    setHydrationScore(calculateHydrationScore(currentState))
  }, [currentState])

  // Effect to generate AI suggestions
  useEffect(() => {
    // This would normally be an API call to your AI service
    // For now, we'll generate some sample suggestions

    // Only generate suggestions if we have some timeline events
    if (timeline.length === 0) return

    // Get the latest state
    const latestState =
      timeline.filter((event) => event.confirmed).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
        ?.state || initialState

    // Calculate the current hydration score
    const score = calculateHydrationScore(latestState)

    // Generate suggestions based on the score and state
    const suggestions: TimelineEvent[] = []

    // If hydration score is low, suggest drinking water
    if (score < 70) {
      const waterAction = hydrationActions.find((a) => a.id === "water")
      if (waterAction) {
        // Suggest drinking water in the next hour
        const now = new Date()
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
        const suggestionTime = `${nextHour.getHours().toString().padStart(2, "0")}:00`

        suggestions.push({
          id: `suggestion-${Date.now()}-water`,
          time: suggestionTime,
          timestamp: nextHour,
          actionId: "water",
          state: applyAction(latestState, waterAction),
          source: "ai",
          confirmed: false,
        })
      }
    }

    // If sodium is low, suggest electrolyte drink
    if (latestState.IVF.Na < 135) {
      const electrolyteAction = hydrationActions.find((a) => a.id === "electrolyte")
      if (electrolyteAction) {
        // Suggest electrolyte drink in the next 2 hours
        const now = new Date()
        const nextTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
        const suggestionTime = `${nextTwoHours.getHours().toString().padStart(2, "0")}:00`

        suggestions.push({
          id: `suggestion-${Date.now()}-electrolyte`,
          time: suggestionTime,
          timestamp: nextTwoHours,
          actionId: "electrolyte",
          state: applyAction(latestState, electrolyteAction),
          source: "ai",
          confirmed: false,
        })
      }
    }

    setAiSuggestions(suggestions)
  }, [timeline, initialState])

  // Function to add an event to the timeline
  const addTimelineEvent = (time: string, actionId: string, source: "user" | "ai" | "planned" = "user") => {
    const action = hydrationActions.find((a) => a.id === actionId)
    if (!action) return

    // Find the most recent state before this time
    const previousEvents = timeline
      .filter((event) => event.confirmed && event.time <= time)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const previousState = previousEvents.length > 0 ? previousEvents[0].state : initialState

    // Apply the action to the previous state
    const newState = applyAction(previousState, action)

    // Create a new timeline event
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      time,
      timestamp: new Date(),
      actionId,
      state: newState,
      source,
      confirmed: source === "user", // User events are automatically confirmed
    }

    // Add the event to the timeline
    setTimeline((prev) => [...prev, newEvent])

    // If this is a current or past event, update the selected time to see its effects
    if (time <= currentTime) {
      setSelectedTime(time)
    }
  }

  // Function to confirm an AI suggestion
  const confirmSuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === suggestionId)
    if (!suggestion) return

    // Add the suggestion to the timeline as a confirmed event
    setTimeline((prev) => [
      ...prev,
      {
        ...suggestion,
        confirmed: true,
        source: "user", // Change source to user since it's now confirmed
      },
    ])

    // Remove the suggestion from the AI suggestions
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  // Function to handle dropping an action on the time wheel
  const handleActionDrop = (time: string) => {
    if (!draggingAction) return

    addTimelineEvent(time, draggingAction.id)
    setDraggingAction(null)
  }

  // Function to handle clicking on a time slot
  const handleTimeClick = (time: string) => {
    setSelectedTime(time)

    // Find events at this time
    const eventsAtTime = [...timeline, ...aiSuggestions].filter((event) => event.time === time)

    if (eventsAtTime.length > 0) {
      // If there are events at this time, select the first one
      setSelectedEvent(eventsAtTime[0])
    } else {
      // Otherwise, clear the selected event
      setSelectedEvent(null)
    }
  }

  // Function to get the angle for a time slot
  const getTimeAngle = (time: string) => {
    const [hours] = time.split(":").map(Number)
    return (hours / 24) * 360
  }

  // Function to get the position for a time slot on the dial
  const getTimePosition = (time: string, radius: number) => {
    const angle = getTimeAngle(time)
    const radians = (angle - 90) * (Math.PI / 180)
    return {
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians),
    }
  }

  // Function to handle scrubbing
  const handleScrubStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current) return
    setScrubbing(true)

    // Get the center of the dial
    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Get the current mouse/touch position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    // Calculate the angle
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
    const normalizedAngle = (angle + 90 + 360) % 360

    // Set the scrub angle
    setScrubAngle(normalizedAngle)

    // Calculate the time from the angle
    const hour = Math.floor((normalizedAngle / 360) * 24)
    const time = `${hour.toString().padStart(2, "0")}:00`

    // Update the selected time
    setSelectedTime(time)
  }

  const handleScrubMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrubbing || !dialRef.current) return

    // Get the center of the dial
    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Get the current mouse/touch position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    // Calculate the angle
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
    const normalizedAngle = (angle + 90 + 360) % 360

    // Set the scrub angle
    setScrubAngle(normalizedAngle)

    // Calculate the time from the angle
    const hour = Math.floor((normalizedAngle / 360) * 24)
    const time = `${hour.toString().padStart(2, "0")}:00`

    // Update the selected time
    setSelectedTime(time)
  }

  const handleScrubEnd = () => {
    setScrubbing(false)
  }

  // Function to render the compartment visualization
  const renderCompartmentVisualization = () => {
    // Draw the compartment visualization on the canvas
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    const size = Math.min(canvas.width, canvas.height)
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create a holographic background effect
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.5)
    bgGradient.addColorStop(0, "rgba(0, 255, 255, 0.2)")
    bgGradient.addColorStop(0.5, "rgba(255, 170, 0, 0.1)")
    bgGradient.addColorStop(1, "rgba(255, 100, 255, 0.05)")

    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add water droplet effect
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 3 + 1
      const opacity = Math.random() * 0.3 + 0.1

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.fill()
    }

    // Draw each compartment
    const compartmentKeys = Object.keys(compartments)
    const totalVolume = compartmentKeys.reduce((sum, key) => sum + compartments[key].volume, 0)

    let startAngle = 0
    compartmentKeys.forEach((key) => {
      const compartment = compartments[key]
      const volume = compartment.volume
      const ratio = volume / totalVolume
      const endAngle = startAngle + ratio * 2 * Math.PI

      // Calculate fill level based on current state
      const maxWater = compartment.volume * 1.2 // 120% is full
      const currentWater = currentState[key].H2O || 0
      const fillRatio = Math.min(1, currentWater / maxWater)

      // Draw compartment segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, size * 0.4, startAngle, endAngle)
      ctx.closePath()

      // Fill with gradient based on compartment
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.4)

      let color
      switch (key) {
        case "IVF":
          color = "#00AAFF"
          break
        case "ISF":
          color = "#00FFFF"
          break
        case "ICF":
          color = "#00FFAA"
          break
        case "4CF":
          color = "#FF9AAA"
          break
        default:
          color = "#AAAAAA"
      }

      gradient.addColorStop(0, `${color}33`) // 20% opacity at center
      gradient.addColorStop(fillRatio, `${color}99`) // 60% opacity at fill level
      gradient.addColorStop(1, `${color}11`) // 10% opacity at edge

      ctx.fillStyle = gradient
      ctx.fill()

      // Draw border with glow effect
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw label
      const labelAngle = startAngle + ratio * Math.PI
      const labelRadius = size * 0.25
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "white"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(key, labelX, labelY)

      // Move to next segment
      startAngle = endAngle
    })

    // Draw center circle with hydration score
    ctx.beginPath()
    ctx.arc(centerX, centerY, size * 0.15, 0, 2 * Math.PI)

    // Create gradient based on hydration score
    const scoreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.15)

    let scoreColor
    if (hydrationScore >= 80) {
      scoreColor = "#00FFAA" // Green for good hydration
    } else if (hydrationScore >= 60) {
      scoreColor = "#00FFFF" // Cyan for moderate hydration
    } else if (hydrationScore >= 40) {
      scoreColor = "#FFAA00" // Orange for low hydration
    } else {
      scoreColor = "#FF5555" // Red for poor hydration
    }

    scoreGradient.addColorStop(0, `${scoreColor}99`) // 60% opacity at center
    scoreGradient.addColorStop(1, `${scoreColor}33`) // 20% opacity at edge

    ctx.fillStyle = scoreGradient
    ctx.fill()

    // Add glow effect to the center circle
    ctx.shadowColor = scoreColor
    ctx.shadowBlur = 15
    ctx.strokeStyle = scoreColor
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw score text
    ctx.fillStyle = "white"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(hydrationScore.toString(), centerX, centerY)

    // Draw "Hydration" text
    ctx.font = "12px sans-serif"
    ctx.fillText("Hydration", centerX, centerY + 20)
  }

  // Effect to render the compartment visualization when the current state changes
  useEffect(() => {
    renderCompartmentVisualization()
  }, [currentState, hydrationScore])

  // Effect to resize the canvas when the window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      renderCompartmentVisualization()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Get the action for a timeline event
  const getActionForEvent = (event: TimelineEvent) => {
    return hydrationActions.find((a) => a.id === event.actionId)
  }

  // Get events for a specific time slot
  const getEventsForTime = (time: string) => {
    return [...timeline, ...aiSuggestions].filter((event) => event.time === time)
  }

  // Check if a time slot is in the past
  const isTimeInPast = (time: string) => {
    return time <= currentTime
  }

  // Check if a time slot is the current hour
  const isCurrentHour = (time: string) => {
    return time === currentTime
  }

  // Get the status text for the hydration score
  const getHydrationStatus = () => {
    if (hydrationScore >= 80) return "Well Hydrated"
    if (hydrationScore >= 60) return "Adequately Hydrated"
    if (hydrationScore >= 40) return "Mildly Dehydrated"
    return "Dehydrated"
  }

  // Function to increment or decrement the selected time by one hour
  // const adjustTime = (increment: boolean) => {
  //   const [hours] = selectedTime.split(":").map(Number)
  //   const newHour = (hours + (increment ? 1 : -1) + 24) % 24
  //   const newTime = `${newHour.toString().padStart(2, "0")}:00`
  //   setSelectedTime(newTime)
  // }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(255,170,0,0.2), rgba(255,100,255,0.2))",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}
    >
      {/* Water Bar Logo Overlay - shows briefly on load */}
      <AnimatePresence>
        {showWaterBarLogo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowWaterBarLogo(false), 2000)
            }}
          >
            <motion.div
              className="relative w-64 h-64 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-48 h-48 bg-[#00FFFF]/20 backdrop-blur-md rounded-diamond border border-white/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-diamond"
                    style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.6)" }}
                  />
                  <div className="text-center">
                    <h1
                      className="text-2xl font-light tracking-wider text-white"
                      style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
                    >
                      THE
                      <br />
                      WATER
                      <br />
                      BAR
                    </h1>
                    <div className="mt-2 w-12 h-12 mx-auto relative">
                      <div
                        className="absolute inset-0 rounded-full bg-[#00FFFF]/20"
                        style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.6)" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="text-white w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-xs mt-4 text-white/80">EXPERIENCE HIGHDRATION</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/10 backdrop-blur-sm border-b border-white/20">
        <h1
          className="text-2xl font-light tracking-wider"
          style={{ color: "#00FFFF", textShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
        >
          THE WATER BAR
        </h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0, 255, 255, 0.8))" }} />
          <span className="text-white" style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}>
            {currentTime}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Circular time wheel */}
        <div className="relative flex-1 flex items-center justify-center p-4">
          <div
            ref={dialRef}
            className="relative w-full max-w-[500px] aspect-square rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-sm shadow-lg"
            style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
            onMouseDown={handleScrubStart}
            onMouseMove={handleScrubMove}
            onMouseUp={handleScrubEnd}
            onMouseLeave={handleScrubEnd}
            onTouchStart={handleScrubStart}
            onTouchMove={handleScrubMove}
            onTouchEnd={handleScrubEnd}
          >
            {/* Holographic overlay */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,170,0,0.1), rgba(255,100,255,0.1))",
                backgroundSize: "200% 200%",
                animation: "gradient 10s ease infinite",
              }}
            >
              {/* Water droplet effect */}
              <div className="absolute inset-0 opacity-30">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/50"
                    style={{
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Time slots */}
            {timeSlots.map((time) => {
              const angle = getTimeAngle(time)
              const isPast = isTimeInPast(time)
              const isCurrent = isCurrentHour(time)
              const events = getEventsForTime(time)
              const hasEvents = events.length > 0

              return (
                <div
                  key={time}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all",
                    isPast ? "bg-white/20" : "bg-white/10",
                    isCurrent && "ring-2 ring-white/50",
                    selectedTime === time && "bg-white/30 ring-2 ring-[#00FFFF]",
                    hasEvents && "ring-2",
                  )}
                  style={{
                    left: `${50 + 42 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                    top: `${50 + 42 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                    boxShadow: hasEvents ? `0 0 10px ${events[0].source === "ai" ? "#FF9AAA" : "#00FFFF"}` : "none",
                    borderColor: hasEvents ? (events[0].source === "ai" ? "#FF9AAA" : "#00FFFF") : "transparent",
                    zIndex: 5,
                  }}
                  onClick={() => handleTimeClick(time)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (draggingAction) {
                      e.currentTarget.classList.add("bg-white/40")
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("bg-white/40")
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove("bg-white/40")
                    handleActionDrop(time)
                  }}
                >
                  <span className="text-xs font-medium text-white">{time.split(":")[0]}</span>

                  {/* Event indicators */}
                  {hasEvents && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
                      {events.map((event, index) => (
                        <div
                          key={event.id}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            event.source === "ai" ? "bg-[#FF9AAA]" : "bg-[#00FFFF]",
                            event.confirmed ? "opacity-100" : "opacity-50",
                          )}
                          style={{
                            boxShadow: `0 0 5px ${event.source === "ai" ? "#FF9AAA" : "#00FFFF"}`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Center compartment visualization */}
            <div className="absolute inset-[15%] rounded-full overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full" onClick={() => setShowCompartmentDetails(true)} />
            </div>

            {/* Scrubber handle */}
            <div
              ref={scrubberRef}
              className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
              style={{
                left: `${50 + 48 * Math.cos((getTimeAngle(selectedTime) - 90) * (Math.PI / 180))}%`,
                top: `${50 + 48 * Math.sin((getTimeAngle(selectedTime) - 90) * (Math.PI / 180))}%`,
                zIndex: 10,
              }}
            >
              <div
                className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                style={{
                  boxShadow: `0 0 15px ${scrubbing ? "#00FFFF" : "rgba(255, 255, 255, 0.3)"}`,
                  border: `2px solid ${scrubbing ? "#00FFFF" : "rgba(255, 255, 255, 0.5)"}`,
                }}
              >
                <div className="w-1.5 h-5 bg-white/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Selected event details */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/30"
                style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-white">
                    {getActionForEvent(selectedEvent)?.name || "Unknown Action"}
                  </h3>
                  <button className="text-white/70 hover:text-white" onClick={() => setSelectedEvent(null)}>
                    <X size={16} />
                  </button>
                </div>

                <p className="text-sm mb-3 text-white/80">
                  {getActionForEvent(selectedEvent)?.description || "No description available."}
                </p>

                <div className="text-xs text-white/60">
                  <div className="flex justify-between mb-1">
                    <span>Time:</span>
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Source:</span>
                    <span className="capitalize">{selectedEvent.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{selectedEvent.confirmed ? "Confirmed" : "Pending"}</span>
                  </div>
                </div>

                {!selectedEvent.confirmed && (
                  <button
                    className="mt-3 w-full py-1 px-3 bg-[#00FFAA]/30 hover:bg-[#00FFAA]/50 rounded-md text-sm font-medium transition-colors"
                    onClick={() => confirmSuggestion(selectedEvent.id)}
                    style={{ boxShadow: "0 0 10px rgba(0, 255, 170, 0.3)" }}
                  >
                    Confirm Action
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compartment details modal */}
          <AnimatePresence>
            {showCompartmentDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <div
                  className="bg-black/40 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className="text-xl font-light text-white"
                      style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}
                    >
                      Compartment Details
                    </h2>
                    <button className="text-white/70 hover:text-white" onClick={() => setShowCompartmentDetails(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-white">Hydration Score: {hydrationScore}</h3>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor:
                            hydrationScore >= 80
                              ? "#00FFAA33"
                              : hydrationScore >= 60
                                ? "#00FFFF33"
                                : hydrationScore >= 40
                                  ? "#FFAA0033"
                                  : "#FF555533",
                          color:
                            hydrationScore >= 80
                              ? "#00FFAA"
                              : hydrationScore >= 60
                                ? "#00FFFF"
                                : hydrationScore >= 40
                                  ? "#FFAA00"
                                  : "#FF5555",
                          boxShadow: `0 0 10px ${
                            hydrationScore >= 80
                              ? "#00FFAA"
                              : hydrationScore >= 60
                                ? "#00FFFF"
                                : hydrationScore >= 40
                                  ? "#FFAA00"
                                  : "#FF5555"
                          }33`,
                        }}
                      >
                        {getHydrationStatus()}
                      </span>
                    </div>
                    <p className="text-sm text-white/60">
                      Time: {selectedTime} {isTimeInPast(selectedTime) ? "(Past)" : "(Future)"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(compartments).map(([key, compartment]) => (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          selectedCompartment === key ? "bg-white/20 border-white/50" : "bg-black/30 border-white/20",
                        )}
                        onClick={() => setSelectedCompartment(selectedCompartment === key ? null : key)}
                        style={{
                          boxShadow: selectedCompartment === key ? "0 0 15px rgba(0, 255, 255, 0.3)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  key === "IVF"
                                    ? "#00AAFF"
                                    : key === "ISF"
                                      ? "#00FFFF"
                                      : key === "ICF"
                                        ? "#00FFAA"
                                        : "#FF9AAA",
                                boxShadow: `0 0 5px ${
                                  key === "IVF"
                                    ? "#00AAFF"
                                    : key === "ISF"
                                      ? "#00FFFF"
                                      : key === "ICF"
                                        ? "#00FFAA"
                                        : "#FF9AAA"
                                }`,
                              }}
                            />
                            <h4 className="font-medium text-white">
                              {compartment.label} ({key})
                            </h4>
                          </div>
                          <ChevronDown
                            size={16}
                            className={cn(
                              "transition-transform text-white/70",
                              selectedCompartment === key && "transform rotate-180",
                            )}
                          />
                        </div>

                        {selectedCompartment === key && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm text-white/80">
                              <span>Water Content:</span>
                              <span>
                                {currentState[key].H2O || 0} / {compartment.volume} L
                              </span>
                            </div>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(((currentState[key].H2O || 0) / compartment.volume) * 100, 100)}%`,
                                  backgroundColor:
                                    key === "IVF"
                                      ? "#00AAFF"
                                      : key === "ISF"
                                        ? "#00FFFF"
                                        : key === "ICF"
                                          ? "#00FFAA"
                                          : "#FF9AAA",
                                  boxShadow: `0 0 5px ${
                                    key === "IVF"
                                      ? "#00AAFF"
                                      : key === "ISF"
                                        ? "#00FFFF"
                                        : key === "ICF"
                                          ? "#00FFAA"
                                          : "#FF9AAA"
                                  }`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-sm text-white/80">
                              <span>Osmolality:</span>
                              <span>{calculateOsmolality(currentState[key])} mOsm/kg</span>
                            </div>

                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1 text-white/80">Solutes:</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {compartment.osmoles.map((osmole) => {
                                  const osmoleKey = osmole.replace("⁺", "").replace("²⁺", "")
                                  return (
                                    <div
                                      key={osmole}
                                      className="flex justify-between text-xs bg-white/10 p-1 rounded text-white/70"
                                    >
                                      <span>{osmole}:</span>
                                      <span>{currentState[key][osmoleKey] || 0}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action drawer */}
        <div
          className={cn(
            "bg-black/30 backdrop-blur-sm border-t md:border-t-0 md:border-l border-white/20 transition-all duration-300 overflow-hidden",
            showActionDrawer ? "w-full md:w-80" : "w-full md:w-12",
          )}
          style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" }}
        >
          <div
            className="p-3 flex justify-between items-center cursor-pointer border-b border-white/20"
            onClick={() => setShowActionDrawer(!showActionDrawer)}
          >
            <h3 className={cn("font-medium text-white transition-opacity", !showActionDrawer && "md:opacity-0")}>
              Hydration Actions
            </h3>
            <button className="text-white/70 hover:text-white">
              {showActionDrawer ? (
                <ChevronDown size={16} className="md:rotate-270" />
              ) : (
                <ChevronUp size={16} className="md:rotate-90" />
              )}
            </button>
          </div>

          {showActionDrawer && (
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {/* Tabs navigation */}
              <div className="border-b border-white/20 mb-4">
                <div className="flex">
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "drinks" ? "text-[#00FFFF] border-b-2 border-[#00FFFF]" : "text-white/70 hover:text-white"}`}
                    onClick={() => setActiveTab("drinks")}
                  >
                    Drinks
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "foods" ? "text-[#00FFFF] border-b-2 border-[#00FFFF]" : "text-white/70 hover:text-white"}`}
                    onClick={() => setActiveTab("foods")}
                  >
                    Foods
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "activities" ? "text-[#00FFFF] border-b-2 border-[#00FFFF]" : "text-white/70 hover:text-white"}`}
                    onClick={() => setActiveTab("activities")}
                  >
                    Activities
                  </button>
                </div>
              </div>

              {/* Filtered actions based on active tab */}
              <div className="space-y-2">
                {hydrationActions
                  .filter((action) => {
                    if (activeTab === "drinks")
                      return ["water", "electrolyte", "mineral", "coconut"].includes(action.id)
                    if (activeTab === "foods") return ["miso", "banana"].includes(action.id)
                    return ["run"].includes(action.id) // activities
                  })
                  .map((action) => {
                    // Check if this action is suggested by AI
                    const suggestion = aiSuggestions.find((s) => s.actionId === action.id)
                    const isRecommended = !!suggestion

                    return (
                      <motion.div
                        key={action.id}
                        className={`p-3 bg-black/40 rounded-lg border cursor-move relative ${
                          isRecommended ? "border-[#FF9AAA] ring-1 ring-[#FF9AAA]" : "border-white/30"
                        }`}
                        draggable
                        onDragStart={() => setDraggingAction(action)}
                        onDragEnd={() => setDraggingAction(null)}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          boxShadow: `0 0 10px ${isRecommended ? "#FF9AAA33" : action.color + "33"}`,
                          background: `linear-gradient(135deg, ${action.color}22, transparent)`,
                        }}
                      >
                        {isRecommended && (
                          <div
                            className="absolute -top-2 -right-2 bg-[#FF9AAA] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                            style={{ boxShadow: "0 0 5px rgba(255, 154, 170, 0.5)" }}
                          >
                            AI
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: action.color,
                              boxShadow: `0 0 5px ${action.color}`,
                            }}
                          />
                          <span className="font-medium text-white">{action.name}</span>
                        </div>
                        <p className="text-xs mt-1 text-white/70 line-clamp-2">{action.description}</p>
                        {isRecommended && (
                          <div className="mt-2 text-xs text-[#FF9AAA] italic">Recommended: {suggestion?.time}</div>
                        )}
                      </motion.div>
                    )
                  })}
              </div>

              {/* AI Suggestions Summary */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <h4 className="text-sm font-medium mb-2 flex items-center text-white">
                  <Info size={14} className="mr-1" />
                  AI Insights
                </h4>
                {aiSuggestions.length > 0 ? (
                  <div className="p-3 bg-black/40 rounded-lg border border-[#FF9AAA]/30">
                    <p className="text-sm text-white/80 mb-2">Based on your hydration status:</p>
                    <ul className="text-xs text-white/70 space-y-1 list-disc pl-4">
                      {aiSuggestions.map((suggestion) => {
                        const action = hydrationActions.find((a) => a.id === suggestion.actionId)
                        return (
                          <li key={suggestion.id}>
                            Try <span className="text-[#FF9AAA] font-medium">{action?.name}</span> at {suggestion.time}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 bg-black/40 rounded-lg border border-white/20 text-center">
                    <p className="text-sm text-white/60">Your hydration looks good! No suggestions at this time.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        .rounded-diamond {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
      `}</style>
    </div>
  )
}
