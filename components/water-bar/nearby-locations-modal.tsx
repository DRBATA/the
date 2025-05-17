"use client"

import { motion } from "framer-motion"
import { X, MapPin } from "lucide-react"

import GestureHandler from "./gesture-handler"
import { nearbyLocations } from "./constants"

interface NearbyLocationsModalProps {
  show: boolean
  onClose: () => void
}

export default function NearbyLocationsModal({ show, onClose }: NearbyLocationsModalProps) {
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
            Nearby Hydration Spots
          </h2>
          <button className="text-white/70 hover:text-white" onClick={onClose}>
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
                      location.type === "water" ? "#00FFFF" : location.type === "electrolyte" ? "#00AAFF" : "#AAFFAA"
                    }33`,
                  }}
                >
                  <MapPin
                    size={16}
                    className="text-white"
                    style={{
                      filter: `drop-shadow(0 0 2px ${
                        location.type === "water" ? "#00FFFF" : location.type === "electrolyte" ? "#00AAFF" : "#AAFFAA"
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
  )
}
