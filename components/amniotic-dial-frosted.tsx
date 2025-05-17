"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, X, Info, ChevronUp, ChevronDown, Droplets, MapPin, User, Mail, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

// Add these imports at the top with the other imports
import { useSwipeable } from "react-swipeable"

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

// Add this type definition after the other type definitions
type UserProfile = {
  username: string | null
  height: number | null // in cm
  weight: number | null // in kg
  age: number | null
  biologicalSex: "male" | "female" | null
  muscleMass: number | null // percentage
  supabaseId: string | null
  isLoggedIn: boolean
}

// Compartment definitions
const compartments: { [key: string]: Compartment } = {
  IVF: { label: "Blood Vessels", volume: 3, osmoles: ["Na⁺", "Albumin", "BUN", "Glucose"] },
  ISF: { label: "Between Cells", volume: 12, osmoles: ["Na⁺", "Cl⁻", "Glucose"] },
  ICF: { label: "Inside Cells", volume: 25, osmoles: ["K⁺", "Mg²⁺", "Pi", "Glucose"] },
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

// Calculate osmolality for a compartment
function calculateOsmolality(compartment: { [key: string]: number }) {
  const { Na = 0, K = 0, Cl = 0, Glucose = 0, BUN = 0 } = compartment
  return Math.round(2 * (Na + K + Cl) + Glucose / 18 + BUN / 2.8)
}

// Calculate hydration score based on compartment states
function calculateHydrationScore(state: CompartmentState) {
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
function applyAction(currentState: CompartmentState, action: HydrationAction): CompartmentState {
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
function generateTimeSlots() {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
  }
  return slots
}

// Custom hook for swipe gestures
const useSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onSwipeUp: () => void,
  onSwipeDown: () => void,
) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft(),
    onSwipedRight: () => onSwipeRight(),
    onSwipedUp: () => onSwipeUp(),
    onSwipedDown: () => onSwipeDown(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  })
  return swipeHandlers
}

// GestureHandler component to wrap swipeable areas
const GestureHandler: React.FC<{
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
  style?: React.CSSProperties
}> = ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, className, style }) => {
  const swipeHandlers = useSwipe(
    onSwipeLeft || (() => {}),
    onSwipeRight || (() => {}),
    onSwipeUp || (() => {}),
    onSwipeDown || (() => {}),
  )

  return (
    <div className={className} style={style} {...swipeHandlers}>
      {children}
    </div>
  )
}

export default function AmnioticDialFrosted() {
  // State for the current time and selected time
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:00`
  })
  const [selectedTime, setSelectedTime] = useState<string>(currentTime)
  const [scrubbing, setScrubbing] = useState(false)

  // State for the compartment states and timeline
  const [initialState, setInitialState] = useState<CompartmentState>({
    IVF: { Na: 140, Albumin: 4, BUN: 15, Glucose: 90, H2O: 3 },
    ISF: { Na: 140, Cl: 100, Glucose: 90, H2O: 12 },
    ICF: { K: 140, Mg: 30, Pi: 100, Glucose: 20, H2O: 25 },
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
  const [showNearbyLocations, setShowNearbyLocations] = useState<boolean>(false)

  // Add this state for tab management
  const [activeTab, setActiveTab] = useState<"drinks" | "foods" | "activities">("drinks")

  // Add this state after the other state declarations in the component
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: null,
    height: null,
    weight: null,
    age: null,
    biologicalSex: null,
    muscleMass: null,
    supabaseId: null,
    isLoggedIn: false,
  })

  const [showProfileModal, setShowProfileModal] = useState(false)

  // Refs for the dial and canvas
  const dialRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Modify the handleActionDrop function to improve drag and drop
  const handleActionDrop = (time: string) => {
    if (!draggingAction) return

    // Add visual feedback
    const timeSlotElement = document.querySelector(`[data-time="${time}"]`)
    if (timeSlotElement) {
      timeSlotElement.classList.add("bg-white/50")
      setTimeout(() => {
        timeSlotElement.classList.remove("bg-white/50")
      }, 300)
    }

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

  // Sample nearby locations data
  const nearbyLocations = [
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

  // Add this function before the return statement
  const calculateTotalBodyWater = () => {
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

  // Add this effect to update compartment volumes based on user profile
  useEffect(() => {
    const tbw = calculateTotalBodyWater()
    if (tbw) {
      // Update initial state based on calculated total body water
      const newInitialState = {
        ...initialState,
        IVF: { ...initialState.IVF, H2O: Math.round(tbw * 0.075 * 10) / 10 },
        ISF: { ...initialState.ISF, H2O: Math.round(tbw * 0.3 * 10) / 10 },
        ICF: { ...initialState.ICF, H2O: Math.round(tbw * 0.625 * 10) / 10 },
      }
      setInitialState(newInitialState)

      // Also update current state if no timeline events
      if (timeline.length === 0) {
        setCurrentState(newInitialState)
      }
    }
  }, [userProfile])

  // Fix the sidebar toggle function
  const toggleActionDrawer = () => {
    setShowActionDrawer((prev) => !prev)
  }

  // Replace the existing return statement with this enhanced version that includes gesture controls
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 z-10">
        <h1
          className="text-2xl font-light tracking-wider text-[#00FFFF]"
          style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
        >
          THE WATER BAR
        </h1>
        <div className="flex items-center space-x-4">
          {/* User Profile Button */}
          <button
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
            onClick={() => setShowProfileModal(true)}
          >
            <User className="h-4 w-4 text-[#00FFFF]" />
            <span className="text-white text-sm hidden md:inline">{userProfile.username || "Guest"}</span>
            {userProfile.isLoggedIn ? (
              <div className="w-2 h-2 rounded-full bg-[#00FFAA]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#FFAA00]" />
            )}
          </button>

          {/* Time */}
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0, 255, 255, 0.8))" }} />
            <span className="text-white" style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}>
              {currentTime}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Circular time wheel */}
        <GestureHandler
          className="relative flex-1 flex items-center justify-center p-4"
          onSwipeLeft={() => setShowActionDrawer(true)}
          onSwipeRight={() => setShowActionDrawer(false)}
        >
          <div
            ref={dialRef}
            className="relative w-full max-w-[500px] aspect-square rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md shadow-lg"
            style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
            onMouseDown={handleScrubStart}
            onMouseMove={handleScrubMove}
            onMouseUp={handleScrubEnd}
            onMouseLeave={handleScrubEnd}
            onTouchStart={handleScrubStart}
            onTouchMove={handleScrubMove}
            onTouchEnd={handleScrubEnd}
          >
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
                  data-time={time}
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
                className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/30"
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

          {/* Mobile bottom action bar (visible only on mobile) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 p-2 z-20">
            <div className="flex justify-around">
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setShowCompartmentDetails(true)}
              >
                <Droplets className="h-6 w-6 text-[#00FFFF]" />
              </button>
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={toggleActionDrawer}
              >
                {showActionDrawer ? (
                  <ChevronDown className="h-6 w-6 text-white" />
                ) : (
                  <ChevronUp className="h-6 w-6 text-white" />
                )}
              </button>
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setShowNearbyLocations(true)}
              >
                <MapPin className="h-6 w-6 text-[#00FFFF]" />
              </button>
            </div>
          </div>

          {/* Compartment details modal */}
          <AnimatePresence>
            {showCompartmentDetails && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <GestureHandler
                  className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
                  onSwipeDown={() => setShowCompartmentDetails(false)}
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

                  {/* Swipe indicator for mobile */}
                  <div className="md:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />

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
                                backgroundColor: key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA",
                                boxShadow: `0 0 5px ${
                                  key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"
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
                                  backgroundColor: key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA",
                                  boxShadow: `0 0 5px ${
                                    key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"
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
                </GestureHandler>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nearby locations modal */}
          <AnimatePresence>
            {showNearbyLocations && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <GestureHandler
                  className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
                  onSwipeDown={() => setShowNearbyLocations(false)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className="text-xl font-light text-white"
                      style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}
                    >
                      Nearby Hydration Spots
                    </h2>
                    <button className="text-white/70 hover:text-white" onClick={() => setShowNearbyLocations(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Swipe indicator for mobile */}
                  <div className="md:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />

                  <div className="space-y-4">
                    {nearbyLocations.map((location) => (
                      <div
                        key={location.id}
                        className="p-4 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1"
                            style={{
                              backgroundColor:
                                location.type === "water"
                                  ? "#00FFFF33"
                                  : location.type === "electrolyte"
                                    ? "#00AAFF33"
                                    : "#AAFFAA33",
                              boxShadow: `0 0 10px ${
                                location.type === "water"
                                  ? "#00FFFF"
                                  : location.type === "electrolyte"
                                    ? "#00AAFF"
                                    : "#AAFFAA"
                              }33`,
                            }}
                          >
                            <MapPin
                              size={16}
                              className="text-white"
                              style={{
                                filter: `drop-shadow(0 0 2px ${
                                  location.type === "water"
                                    ? "#00FFFF"
                                    : location.type === "electrolyte"
                                      ? "#00AAFF"
                                      : "#AAFFAA"
                                })`,
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-white">{location.name}</h3>
                              <span
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{
                                  backgroundColor:
                                    location.type === "water"
                                      ? "#00FFFF33"
                                      : location.type === "electrolyte"
                                        ? "#00AAFF33"
                                        : "#AAFFAA33",
                                  color:
                                    location.type === "water"
                                      ? "#00FFFF"
                                      : location.type === "electrolyte"
                                        ? "#00AAFF"
                                        : "#AAFFAA",
                                }}
                              >
                                {location.type}
                              </span>
                            </div>
                            <p className="text-sm text-white/70 mb-2">{location.distance}</p>
                            {location.offer && (
                              <div className="bg-white/10 rounded p-2 mb-2">
                                <p className="text-sm text-white/90">
                                  <span className="font-medium">Offer:</span> {location.offer}
                                </p>
                                {location.code && (
                                  <p className="text-xs text-white/70">
                                    <span className="font-medium">Code:</span> {location.code}
                                  </p>
                                )}
                              </div>
                            )}
                            {location.recommendation && (
                              <div className="flex items-center mt-2">
                                <span className="text-xs text-white/70 mr-2">Try:</span>
                                <span className="text-sm text-white">{location.recommendation}</span>
                                {location.tags && (
                                  <div className="flex ml-2">
                                    {location.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 ml-1"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GestureHandler>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile Modal */}
          <AnimatePresence>
            {showProfileModal && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <GestureHandler
                  className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
                  onSwipeDown={() => setShowProfileModal(false)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className="text-xl font-light text-white"
                      style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}
                    >
                      User Profile
                    </h2>
                    <button className="text-white/70 hover:text-white" onClick={() => setShowProfileModal(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Swipe indicator for mobile */}
                  <div className="md:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />

                  {userProfile.isLoggedIn ? (
                    <div className="space-y-4">
                      {/* Profile Information */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                          <User size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">{userProfile.username || "User"}</h3>
                          <p className="text-sm text-white/70">ID: {userProfile.supabaseId || "Not available"}</p>
                        </div>
                      </div>

                      {/* Body Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-xs text-white/70 mb-1">Height</p>
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium">{userProfile.height || "—"}</p>
                            <p className="text-xs text-white/70">cm</p>
                          </div>
                        </div>

                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-xs text-white/70 mb-1">Weight</p>
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium">{userProfile.weight || "—"}</p>
                            <p className="text-xs text-white/70">kg</p>
                          </div>
                        </div>

                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-xs text-white/70 mb-1">Age</p>
                          <p className="text-white font-medium">{userProfile.age || "—"}</p>
                        </div>

                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-xs text-white/70 mb-1">Biological Sex</p>
                          <p className="text-white font-medium capitalize">{userProfile.biologicalSex || "—"}</p>
                        </div>

                        <div className="p-3 bg-white/10 rounded-lg col-span-2">
                          <p className="text-xs text-white/70 mb-1">Muscle Mass</p>
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium">{userProfile.muscleMass || "—"}</p>
                            <p className="text-xs text-white/70">%</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Body Water Calculation */}
                      <div className="p-4 bg-[#00FFFF]/10 rounded-lg border border-[#00FFFF]/30 mt-4">
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <Droplets size={16} className="mr-2 text-[#00FFFF]" />
                          Total Body Water
                        </h4>

                        {calculateTotalBodyWater() ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/80">Total</span>
                              <span className="text-white font-medium">{calculateTotalBodyWater()} L</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/80">Blood (IVF)</span>
                              <span className="text-white/80">
                                {Math.round(calculateTotalBodyWater()! * 0.075 * 10) / 10} L
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/80">Between Cells (ISF)</span>
                              <span className="text-white/80">
                                {Math.round(calculateTotalBodyWater()! * 0.3 * 10) / 10} L
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/80">Inside Cells (ICF)</span>
                              <span className="text-white/80">
                                {Math.round(calculateTotalBodyWater()! * 0.625 * 10) / 10} L
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/70 text-sm">
                            Complete your profile to see your total body water calculation.
                          </p>
                        )}
                      </div>

                      {/* Edit Profile Button */}
                      <button
                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 text-white font-medium"
                        onClick={() => {
                          // This would open a form to edit profile
                          // For now, let's just add some sample data
                          setUserProfile({
                            ...userProfile,
                            height: 175,
                            weight: 70,
                            age: 30,
                            biologicalSex: "male",
                            muscleMass: 35,
                          })
                        }}
                      >
                        Edit Profile
                      </button>

                      {/* Logout Button */}
                      <button
                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 text-white/70 font-medium"
                        onClick={() => {
                          setUserProfile({
                            ...userProfile,
                            isLoggedIn: false,
                            username: null,
                            supabaseId: null,
                          })
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                          <User size={32} className="text-white/50" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Sign In to Track Your Hydration</h3>
                        <p className="text-sm text-white/70">
                          Create a profile to get personalized hydration recommendations based on your body metrics.
                        </p>
                      </div>

                      {/* Magic Link Login */}
                      <div className="p-4 bg-white/10 rounded-lg">
                        <h4 className="text-white font-medium mb-3">Sign in with Magic Link</h4>
                        <div className="flex">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-white/10 border border-white/30 rounded-l-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                          />
                          <button className="bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 text-white px-4 rounded-r-lg border border-[#00FFFF]/30 flex items-center">
                            <Mail size={16} className="mr-2" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>

                      {/* Demo Login */}
                      <button
                        className="w-full p-3 bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 rounded-lg border border-[#00FFFF]/30 text-white font-medium flex items-center justify-center"
                        onClick={() => {
                          setUserProfile({
                            username: "DemoUser",
                            height: 175,
                            weight: 70,
                            age: 30,
                            biologicalSex: "male",
                            muscleMass: 35,
                            supabaseId: "demo-123456",
                            isLoggedIn: true,
                          })
                        }}
                      >
                        <LogIn size={16} className="mr-2" />
                        Try Demo Account
                      </button>
                    </div>
                  )}
                </GestureHandler>
              </motion.div>
            )}
          </AnimatePresence>
        </GestureHandler>

        {/* Action drawer - transforms to bottom sheet on mobile */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            showActionDrawer
              ? "bg-white/10 backdrop-blur-md border-t md:border-t-0 md:border-l border-white/20 md:w-80 h-[60vh] md:h-auto"
              : "h-0 md:h-auto md:w-12 bg-transparent md:bg-white/10 md:backdrop-blur-md md:border-l md:border-white/20",
            "fixed bottom-0 left-0 right-0 z-30 md:relative md:bottom-auto md:left-auto md:right-auto",
          )}
          style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" }}
        >
          {/* Drawer handle for mobile */}
          <div
            className="md:hidden w-12 h-1 bg-white/30 rounded-full mx-auto my-2 cursor-pointer"
            onClick={toggleActionDrawer}
          />

          <div
            className="hidden md:flex p-3 justify-between items-center cursor-pointer border-b border-white/20"
            onClick={toggleActionDrawer}
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
            <GestureHandler
              className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-2rem)] md:max-h-[calc(100vh-4rem)]"
              onSwipeDown={() => setShowActionDrawer(false)}
            >
              {/* Tabs navigation with swipe support */}
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
                        className={`p-3 bg-white/10 rounded-lg border relative ${
                          isRecommended ? "border-[#FF9AAA] ring-1 ring-[#FF9AAA]" : "border-white/30"
                        } active:cursor-grabbing`}
                        draggable="true"
                        onDragStart={(e) => {
                          setDraggingAction(action)
                          // Set a ghost drag image
                          const ghost = document.createElement("div")
                          ghost.classList.add("w-12", "h-12", "rounded-full", "bg-white/50")
                          ghost.style.position = "absolute"
                          ghost.style.top = "-1000px"
                          document.body.appendChild(ghost)
                          e.dataTransfer.setDragImage(ghost, 20, 20)

                          // Add visual feedback
                          e.currentTarget.style.opacity = "0.6"
                          e.currentTarget.style.transform = "scale(1.05)"
                          e.currentTarget.style.boxShadow = `0 0 20px ${action.color}`
                        }}
                        onDragEnd={(e) => {
                          setDraggingAction(null)
                          // Remove visual feedback
                          e.currentTarget.style.opacity = "1"
                          e.currentTarget.style.transform = "scale(1)"
                          e.currentTarget.style.boxShadow = `0 0 10px ${isRecommended ? "#FF9AAA33" : action.color + "33"}`
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                  <div className="p-3 bg-white/10 rounded-lg border border-[#FF9AAA]/30">
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
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-center">
                    <p className="text-sm text-white/60">Your hydration looks good! No suggestions at this time.</p>
                  </div>
                )}
              </div>

              {/* Nearby Locations Button */}
              <button
                className="w-full mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 transition-colors flex items-center justify-center"
                onClick={() => setShowNearbyLocations(true)}
                style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.1)" }}
              >
                <MapPin size={16} className="mr-2 text-[#00FFFF]" />
                <span className="text-white font-medium">Find Nearby Hydration Spots</span>
              </button>
            </GestureHandler>
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
