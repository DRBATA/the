"use client"

import { motion } from "framer-motion"
import { X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import GestureHandler from "./gesture-handler"
import { compartments } from "./constants"
import type { CompartmentState } from "./types"
import { calculateOsmolality, getHydrationStatus, isTimeInPast } from "./utils"

interface CompartmentDetailsModalProps {
  show: boolean
  onClose: () => void
  currentState: CompartmentState
  hydrationScore: number
  selectedTime: string
  currentTime: string
  selectedCompartment: string | null
  setSelectedCompartment: (compartment: string | null) => void
}

export default function CompartmentDetailsModal({
  show,
  onClose,
  currentState,
  hydrationScore,
  selectedTime,
  currentTime,
  selectedCompartment,
  setSelectedCompartment,
}: CompartmentDetailsModalProps) {
  if (!show) return null

  return (
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
        onSwipeDown={onClose}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-light text-white" style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}>
            Compartment Details
          </h2>
          <button className="text-white/70 hover:text-white" onClick={onClose}>
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
              {getHydrationStatus(hydrationScore)}
            </span>
          </div>
          <p className="text-sm text-white/60">
            Time: {selectedTime} {isTimeInPast(selectedTime, currentTime) ? "(Past)" : "(Future)"}
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
                      boxShadow: `0 0 5px ${key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"}`,
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
                        boxShadow: `0 0 5px ${key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"}`,
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
  )
}
