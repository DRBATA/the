"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

import GestureHandler from "./gesture-handler"
import CompartmentDetailsModal from "./compartment-details-modal"
import NearbyLocationsModal from "./nearby-locations-modal"
import { compartments } from "./constants"
import type { CompartmentState, TimelineEvent } from "./types"
import { generateTimeSlots, getTimeAngle, isTimeInPast, isCurrentHour } from "./utils"

interface AmnioticDialProps {
  currentTime: string
  selectedTime: string
  setSelectedTime: (time: string) => void
  currentState: CompartmentState
  timeline: TimelineEvent[]
  setTimeline: (timeline: TimelineEvent[]) => void
  hydrationScore: number
  showActionDrawer: boolean
  setShowActionDrawer: (show: boolean) => void
  showCompartmentDetails: boolean
  setShowCompartmentDetails: (show: boolean) => void
  showNearbyLocations: boolean
  setShowNearbyLocations: (show: boolean) => void
}

export default function AmnioticDial({
  currentTime,
  selectedTime,
  setSelectedTime,
  currentState,
  timeline,
  setTimeline,
  hydrationScore,
  showActionDrawer,
  setShowActionDrawer,
  showCompartmentDetails,
  setShowCompartmentDetails,
  showNearbyLocations,
  setShowNearbyLocations,
}: AmnioticDialProps) {
  const [scrubbing, setScrubbing] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [draggingAction, setDraggingAction] = useState(null)
  const [selectedCompartment, setSelectedCompartment] = useState<string | null>(null)

  // Refs for the dial and canvas
  const dialRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Time slots for the 24-hour clock
  const timeSlots = generateTimeSlots()

  // Function to handle clicking on a time slot
  const handleTimeClick = (time: string) => {
    setSelectedTime(time)

    // Find events at this time
    const eventsAtTime = timeline.filter((event) => event.time === time)

    if (eventsAtTime.length > 0) {
      // If there are events at this time, select the first one
      setSelectedEvent(eventsAtTime[0])
    } else {
      // Otherwise, clear the selected event
      setSelectedEvent(null)
    }
  }

  // Function to handle dropping an action on the time wheel
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

    // This would call a function passed from the parent to add the action
    // addTimelineEvent(time, draggingAction.id)
    setDraggingAction(null)
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

  // Get events for a specific time slot
  const getEventsForTime = (time: string) => {
    return timeline.filter((event) => event.time === time)
  }

  return (
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
          const isPast = isTimeInPast(time, currentTime)
          const isCurrent = isCurrentHour(time, currentTime)
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
              <h3 className="font-medium text-white">{selectedEvent.actionId}</h3>
              <button className="text-white/70 hover:text-white" onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>

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
                onClick={() => {
                  // confirmSuggestion(selectedEvent.id)
                }}
                style={{ boxShadow: "0 0 10px rgba(0, 255, 170, 0.3)" }}
              >
                Confirm Action
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CompartmentDetailsModal
        show={showCompartmentDetails}
        onClose={() => setShowCompartmentDetails(false)}
        currentState={currentState}
        hydrationScore={hydrationScore}
        selectedTime={selectedTime}
        currentTime={currentTime}
        selectedCompartment={selectedCompartment}
        setSelectedCompartment={setSelectedCompartment}
      />

      <NearbyLocationsModal show={showNearbyLocations} onClose={() => setShowNearbyLocations(false)} />
    </GestureHandler>
  )
}
