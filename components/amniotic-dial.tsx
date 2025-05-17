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

// Sample hydration actions
const hydrationActions: HydrationAction[] = [
  {
    id: "water",
    name: "Drink Water",
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
]

// Calculate osmolality for a compartment
function calculateOsmolality(compartment: { [key: string]: number }) {
  const { Na = 0, K = 0, Cl = 0, Glucose = 0, BUN = 0 } = compartment
  return Math.round(2 * (Na + K + Cl) + Glucose / 18 + BUN / 2.8)
}

// Calculate hydration score based on compartment states
function calculateHydrationScore(state: CompartmentState) {
  // Total water content (50% of score)
  const totalH2O = state.IVF.H2O + state.ISF.H2O + state.ICF.H2O + (state["4CF"].H2O || 0)
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

export default function AmnioticDial() {
  // State for the current time and selected time
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:00`
  })
  const [selectedTime, setSelectedTime] = useState<string>(currentTime)

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

      // Draw border
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

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

  return (
    <div className="flex flex-col h-screen bg-[#c2e9fb] text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-light tracking-wider neon-text">AMNIOTIC DIAL</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-slate-600" />
          <span className="text-slate-600">{currentTime}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Circular time wheel */}
        <div className="relative flex-1 flex items-center justify-center p-4">
          <div
            ref={dialRef}
            className="relative w-full max-w-[500px] aspect-square rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm shadow-lg"
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
                  <span className="text-xs font-medium">{time.split(":")[0]}</span>

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

            {/* Current time indicator */}
            <div
              className="absolute w-1 h-8 bg-white/70 rounded-full"
              style={{
                left: `${50 + 46 * Math.cos((getTimeAngle(currentTime) - 90) * (Math.PI / 180))}%`,
                top: `${50 + 46 * Math.sin((getTimeAngle(currentTime) - 90) * (Math.PI / 180))}%`,
                transform: `translate(-50%, -50%) rotate(${getTimeAngle(currentTime)}deg)`,
                boxShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
              }}
            />

            {/* Selected time indicator */}
            {selectedTime !== currentTime && (
              <div
                className="absolute w-1 h-8 bg-[#00FFFF]/70 rounded-full"
                style={{
                  left: `${50 + 46 * Math.cos((getTimeAngle(selectedTime) - 90) * (Math.PI / 180))}%`,
                  top: `${50 + 46 * Math.sin((getTimeAngle(selectedTime) - 90) * (Math.PI / 180))}%`,
                  transform: `translate(-50%, -50%) rotate(${getTimeAngle(selectedTime)}deg)`,
                  boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
                }}
              />
            )}
          </div>

          {/* Selected event details */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/30"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{getActionForEvent(selectedEvent)?.name || "Unknown Action"}</h3>
                  <button className="text-slate-500 hover:text-slate-700" onClick={() => setSelectedEvent(null)}>
                    <X size={16} />
                  </button>
                </div>

                <p className="text-sm mb-3">
                  {getActionForEvent(selectedEvent)?.description || "No description available."}
                </p>

                <div className="text-xs text-slate-600">
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              >
                <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-light">Compartment Details</h2>
                    <button
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => setShowCompartmentDetails(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Hydration Score: {hydrationScore}</h3>
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
                        }}
                      >
                        {getHydrationStatus()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Time: {selectedTime} {isTimeInPast(selectedTime) ? "(Past)" : "(Future)"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(compartments).map(([key, compartment]) => (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          selectedCompartment === key ? "bg-white/30 border-white/50" : "bg-white/10 border-white/20",
                        )}
                        onClick={() => setSelectedCompartment(selectedCompartment === key ? null : key)}
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
                            <h4 className="font-medium">
                              {compartment.label} ({key})
                            </h4>
                          </div>
                          <ChevronDown
                            size={16}
                            className={cn(
                              "transition-transform",
                              selectedCompartment === key && "transform rotate-180",
                            )}
                          />
                        </div>

                        {selectedCompartment === key && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Water Content:</span>
                              <span>
                                {currentState[key].H2O || 0} / {compartment.volume} L
                              </span>
                            </div>

                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
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
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-sm">
                              <span>Osmolality:</span>
                              <span>{calculateOsmolality(currentState[key])} mOsm/kg</span>
                            </div>

                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1">Solutes:</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {compartment.osmoles.map((osmole) => {
                                  const osmoleKey = osmole.replace("⁺", "").replace("²⁺", "")
                                  return (
                                    <div key={osmole} className="flex justify-between text-xs bg-white/10 p-1 rounded">
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
            "bg-white/10 backdrop-blur-sm border-t md:border-t-0 md:border-l border-white/20 transition-all duration-300 overflow-hidden",
            showActionDrawer ? "w-full md:w-80" : "w-full md:w-12",
          )}
        >
          <div
            className="p-3 flex justify-between items-center cursor-pointer border-b border-white/20"
            onClick={() => setShowActionDrawer(!showActionDrawer)}
          >
            <h3 className={cn("font-medium transition-opacity", !showActionDrawer && "md:opacity-0")}>Actions</h3>
            <button className="text-slate-500 hover:text-slate-700">
              {showActionDrawer ? (
                <ChevronDown size={16} className="md:rotate-270" />
              ) : (
                <ChevronUp size={16} className="md:rotate-90" />
              )}
            </button>
          </div>

          {showActionDrawer && (
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Droplets size={14} className="mr-1" />
                  Hydration Actions
                </h4>
                <div className="space-y-2">
                  {hydrationActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-3 bg-white/20 rounded-lg border border-white/30 cursor-move"
                      draggable
                      onDragStart={() => setDraggingAction(action)}
                      onDragEnd={() => setDraggingAction(null)}
                      style={{
                        boxShadow: `0 0 10px ${action.color}33`,
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: action.color }} />
                        <span className="font-medium">{action.name}</span>
                      </div>
                      <p className="text-xs mt-1 text-slate-600 line-clamp-2">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Info size={14} className="mr-1" />
                  AI Suggestions
                </h4>
                {aiSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion) => {
                      const action = getActionForEvent(suggestion)
                      return (
                        <div
                          key={suggestion.id}
                          className="p-3 bg-white/10 rounded-lg border border-[#FF9AAA]/50 cursor-pointer"
                          onClick={() => confirmSuggestion(suggestion.id)}
                          style={{
                            boxShadow: "0 0 10px rgba(255, 154, 170, 0.2)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: action?.color || "#FF9AAA" }}
                              />
                              <span className="font-medium">{action?.name || "Unknown Action"}</span>
                            </div>
                            <span className="text-xs">{suggestion.time}</span>
                          </div>
                          <p className="text-xs mt-1 text-slate-600 line-clamp-2">
                            {action?.description || "No description available."}
                          </p>
                          <button className="mt-2 w-full py-1 px-2 bg-[#FF9AAA]/20 hover:bg-[#FF9AAA]/30 rounded text-xs font-medium transition-colors">
                            Confirm Suggestion
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-center">
                    <p className="text-sm text-slate-600">No suggestions available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
