"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Info, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

import GestureHandler from "./gesture-handler"
import { hydrationActions } from "./constants"
import type { CompartmentState, TimelineEvent } from "./types"

// Update the ActionDrawerProps interface to include the addTimelineEvent function
interface ActionDrawerProps {
  showActionDrawer: boolean
  toggleActionDrawer: () => void
  timeline: TimelineEvent[]
  setTimeline: (timeline: TimelineEvent[]) => void
  currentState: CompartmentState
  initialState: CompartmentState
  currentTime: string
  selectedTime: string
  setShowNearbyLocations: (show: boolean) => void
  addTimelineEvent: (time: string, actionId: string, source?: "user" | "ai" | "planned") => void
}

// Update the function parameters to include the new prop
export default function ActionDrawer({
  showActionDrawer,
  toggleActionDrawer,
  timeline,
  setTimeline,
  currentState,
  initialState,
  currentTime,
  selectedTime,
  setShowNearbyLocations,
  addTimelineEvent,
}: ActionDrawerProps) {
  const [activeTab, setActiveTab] = useState<"drinks" | "foods" | "activities">("drinks")
  const [aiSuggestions, setAiSuggestions] = useState<TimelineEvent[]>([])

  // Function to confirm an AI suggestion
  const confirmSuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === suggestionId)
    if (!suggestion) return

    // Add the suggestion to the timeline as a confirmed event
    setTimeline([
      ...timeline,
      {
        ...suggestion,
        confirmed: true,
        source: "user", // Change source to user since it's now confirmed
      },
    ])

    // Remove the suggestion from the AI suggestions
    setAiSuggestions(aiSuggestions.filter((s) => s.id !== suggestionId))
  }

  const generateTimeSlots = () => {
    const times = []
    let hour = 0
    let minute = 0

    for (let i = 0; i < 48; i++) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      times.push(time)

      minute += 30
      if (minute === 60) {
        minute = 0
        hour++
        if (hour === 24) {
          hour = 0
        }
      }
    }
    return times
  }

  return (
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
          onSwipeDown={() => toggleActionDrawer()}
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

          {/* Time selector */}
          <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <h4 className="text-sm font-medium mb-2 text-white">Add to Timeline</h4>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Time:</span>
              <select
                className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white text-sm"
                value={selectedTime}
                onChange={(e) => {
                  // This would normally update the selected time in the parent component
                  // For now, we'll just use the value directly when adding actions
                }}
              >
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/50 mt-2">
              Click on any action below to add it to the timeline at the selected time.
            </p>
          </div>

          {/* Filtered actions based on active tab */}
          <div className="space-y-2">
            {hydrationActions
              .filter((action) => {
                if (activeTab === "drinks") return ["water", "electrolyte", "mineral", "coconut"].includes(action.id)
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
                    } cursor-pointer`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      boxShadow: `0 0 10px ${isRecommended ? "#FF9AAA33" : action.color + "33"}`,
                      background: `linear-gradient(135deg, ${action.color}22, transparent)`,
                    }}
                    onClick={() => {
                      // Add the action to the selected time when clicked
                      addTimelineEvent(selectedTime, action.id)

                      // Add visual feedback
                      const element = document.activeElement as HTMLElement
                      if (element) element.blur()

                      // Show a brief flash effect
                      const flashElement = document.createElement("div")
                      flashElement.className = "fixed inset-0 bg-white/20 z-50 pointer-events-none"
                      document.body.appendChild(flashElement)
                      setTimeout(() => {
                        flashElement.style.opacity = "0"
                        flashElement.style.transition = "opacity 300ms"
                        setTimeout(() => {
                          document.body.removeChild(flashElement)
                        }, 300)
                      }, 50)
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
  )
}
