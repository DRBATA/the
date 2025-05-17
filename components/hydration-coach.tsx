"use client"

import { useState, useEffect } from "react"
import CompartmentWell from "@/components/compartment-well"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Info, Droplets, Activity, Coffee } from "lucide-react"

const compartments = {
  IVF: {
    label: "Blood Vessels",
    volume: 3,
    description: "Blood plasma that carries nutrients and electrolytes throughout your body.",
    key_electrolytes: ["Na⁺", "Albumin"],
  },
  ISF: {
    label: "Between Cells",
    volume: 12,
    description: "Fluid surrounding your cells, delivering nutrients and removing waste.",
    key_electrolytes: ["Na⁺", "Cl⁻"],
  },
  ICF: {
    label: "Inside Cells",
    volume: 25,
    description: "Fluid inside your cells where metabolism occurs.",
    key_electrolytes: ["K⁺", "Mg²⁺"],
  },
}

const hydrationActions = [
  {
    name: "Drink Water",
    effects: { IVF: { H2O: 2 } },
    hormones: { ADH: -1 },
    description: "Pure water is quickly absorbed into your bloodstream, then distributed to other compartments.",
  },
  {
    name: "Sports Drink",
    effects: { IVF: { Na: 3, H2O: 2 }, ISF: { H2O: 1 } },
    hormones: { ADH: -1 },
    description: "Electrolytes help retain water in your blood vessels and between cells.",
  },
  {
    name: "Exercise",
    effects: { ISF: { Na: -2, H2O: -3 }, IVF: { H2O: -1 } },
    hormones: { Aldosterone: 2, ADH: 2 },
    description: "Sweating depletes water and sodium from your interstitial fluid.",
  },
  {
    name: "Salty Snack",
    effects: { IVF: { Na: 4 }, ISF: { Na: 2 } },
    hormones: { ADH: 1 },
    description: "Sodium pulls water into your blood vessels, increasing thirst.",
  },
  {
    name: "Coffee",
    effects: { IVF: { H2O: -1 }, ISF: { H2O: -1 } },
    hormones: { ADH: -2 },
    description: "Caffeine has a mild diuretic effect, reducing water retention.",
  },
]

function calculateHydrationStatus(state) {
  // Calculate overall hydration percentage (0-100)
  const totalWater = state.IVF.H2O + state.ISF.H2O + state.ICF.H2O
  const idealWater = 40 // Ideal total water
  const hydrationPercent = Math.min(100, Math.max(0, (totalWater / idealWater) * 100))

  // Calculate balance between compartments (0-100)
  const idealRatio = [0.075, 0.3, 0.625] // Ideal IVF:ISF:ICF ratio
  const actualRatio = [state.IVF.H2O / totalWater, state.ISF.H2O / totalWater, state.ICF.H2O / totalWater]

  // Calculate how close the actual ratio is to ideal (100 = perfect)
  const ratioScore =
    100 -
    (Math.abs(actualRatio[0] - idealRatio[0]) +
      Math.abs(actualRatio[1] - idealRatio[1]) +
      Math.abs(actualRatio[2] - idealRatio[2])) *
      100

  // Calculate electrolyte balance (0-100)
  const naBalance = Math.min(100, Math.max(0, 100 - Math.abs(state.IVF.Na - 140) / 2))
  const kBalance = Math.min(100, Math.max(0, 100 - Math.abs(state.ICF.K - 140) / 2))
  const electrolyteScore = (naBalance + kBalance) / 2

  // Overall score
  const overallScore = hydrationPercent * 0.5 + ratioScore * 0.3 + electrolyteScore * 0.2

  // Status message
  let status = "Well Hydrated"
  let advice = "Keep up the good work!"

  if (overallScore < 40) {
    status = "Severely Dehydrated"
    advice = "Drink water with electrolytes immediately!"
  } else if (overallScore < 60) {
    status = "Dehydrated"
    advice = "Drink more water and consider adding electrolytes."
  } else if (overallScore < 80) {
    status = "Mildly Dehydrated"
    advice = "Have a glass of water soon."
  }

  return {
    score: Math.round(overallScore),
    status,
    advice,
    details: {
      hydrationPercent: Math.round(hydrationPercent),
      ratioScore: Math.round(ratioScore),
      electrolyteScore: Math.round(electrolyteScore),
    },
  }
}

export default function HydrationCoach() {
  const [state, setState] = useState({
    IVF: { Na: 140, Albumin: 4, H2O: 3 },
    ISF: { Na: 140, Cl: 100, H2O: 12 },
    ICF: { K: 140, Mg: 30, H2O: 25 },
    Hormones: { Aldosterone: 0, ADH: 0 },
  })

  const [activeCompartment, setActiveCompartment] = useState<"IVF" | "ISF" | "ICF" | null>(null)
  const [wellIntensity, setWellIntensity] = useState(0.8)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [actionEffect, setActionEffect] = useState<string | null>(null)
  const [hydrationStatus, setHydrationStatus] = useState(calculateHydrationStatus(state))
  const [showTip, setShowTip] = useState(false)

  // Update hydration status when state changes
  useEffect(() => {
    setHydrationStatus(calculateHydrationStatus(state))
  }, [state])

  const applyAction = (action) => {
    const newState = { ...state }
    for (const [comp, changes] of Object.entries(action.effects)) {
      for (const [solute, delta] of Object.entries(changes)) {
        newState[comp][solute] = (newState[comp][solute] || 0) + delta
      }
    }
    if (action.hormones) {
      for (const [hormone, delta] of Object.entries(action.hormones)) {
        newState.Hormones[hormone] = (newState.Hormones[hormone] || 0) + delta
      }
    }
    setState(newState)

    // Set the active compartment based on which one was most affected
    const affectedCompartments = Object.keys(action.effects)
    if (affectedCompartments.length > 0) {
      // Find the compartment with the most changes
      let maxChanges = 0
      let mostAffectedComp = null

      for (const comp of affectedCompartments) {
        const changeCount = Object.keys(action.effects[comp]).length
        if (changeCount > maxChanges) {
          maxChanges = changeCount
          mostAffectedComp = comp
        }
      }

      setActiveCompartment(mostAffectedComp as "IVF" | "ISF" | "ICF")
    }

    // Animate well intensity
    setWellIntensity(1)
    setTimeout(() => setWellIntensity(0.8), 1000)

    // Set last action and effect
    setLastAction(action.name)
    setActionEffect(action.description)

    // Show effect for a few seconds
    setTimeout(() => {
      setActionEffect(null)
    }, 4000)
  }

  // Reset active compartment after a delay
  useEffect(() => {
    if (activeCompartment) {
      const timer = setTimeout(() => {
        setActiveCompartment(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [activeCompartment])

  return (
    <div className="p-4 space-y-6 bg-[#c2e9fb] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold neon-text">💧 Hydration Coach</h1>
        <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowTip(!showTip)}>
          <Info size={16} />
          <span>How it works</span>
        </Button>
      </div>

      {/* Hydration Status */}
      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Hydration Status</h2>
          <div
            className="text-xl font-bold"
            style={{
              color:
                hydrationStatus.score > 80
                  ? "#00FFAA"
                  : hydrationStatus.score > 60
                    ? "#00FFFF"
                    : hydrationStatus.score > 40
                      ? "#FFAA00"
                      : "#FF5555",
            }}
          >
            {hydrationStatus.score}%
          </div>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full mb-2">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${hydrationStatus.score}%`,
              background: `linear-gradient(90deg, 
                ${hydrationStatus.score > 80 ? "#00FFAA" : "#FF5555"}, 
                ${hydrationStatus.score > 60 ? "#00FFFF" : "#FFAA00"})`,
              boxShadow: `0 0 10px ${hydrationStatus.score > 70 ? "#00FFAA" : "#FFAA00"}`,
            }}
          />
        </div>

        <div className="flex justify-between text-sm font-medium">
          <span>{hydrationStatus.status}</span>
          <span>{hydrationStatus.advice}</span>
        </div>
      </div>

      {/* Tip Popup */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/30 text-slate-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="font-bold mb-2">How Hydration Works</h3>
            <p className="text-sm mb-2">Your body's water is distributed across three compartments:</p>
            <ul className="text-sm list-disc pl-5 mb-3 space-y-1">
              <li>
                <span className="font-medium text-[#00AAFF]">Blood Vessels (IVF)</span> - 7.5% of total water
              </li>
              <li>
                <span className="font-medium text-[#00FFFF]">Between Cells (ISF)</span> - 30% of total water
              </li>
              <li>
                <span className="font-medium text-[#00FFAA]">Inside Cells (ICF)</span> - 62.5% of total water
              </li>
            </ul>
            <p className="text-sm mb-2">Proper hydration requires:</p>
            <ul className="text-sm list-disc pl-5 mb-2">
              <li>Adequate total water</li>
              <li>Balanced distribution between compartments</li>
              <li>Proper electrolyte levels (sodium, potassium, etc.)</li>
            </ul>
            <p className="text-sm italic">Click on actions below to see how they affect your hydration status!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sacred Well Visualization */}
      <div className="w-full h-[400px] mb-4 rounded-lg overflow-hidden shadow-lg relative">
        <CompartmentWell
          compartment={activeCompartment}
          compartmentData={activeCompartment ? state[activeCompartment] : null}
          intensity={wellIntensity}
          hormones={state.Hormones}
        />

        {/* Action effect popup */}
        <AnimatePresence>
          {actionEffect && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm p-3 rounded-lg max-w-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-white font-medium mb-1">{lastAction}</h3>
              <p className="text-white/90 text-sm">{actionEffect}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compartment highlight */}
        <AnimatePresence>
          {activeCompartment && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-white font-medium">{compartments[activeCompartment].label} Affected</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fluid Compartments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(compartments).map(([key, comp]) => (
          <motion.div
            key={key}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/30 neon-card"
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveCompartment(key as "IVF" | "ISF" | "ICF")}
            style={{
              boxShadow:
                activeCompartment === key
                  ? `0 0 15px ${key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"}`
                  : "0 0 10px rgba(0, 200, 255, 0.2)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA",
                  boxShadow: `0 0 5px ${key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"}`,
                }}
              />
              <h2 className="font-semibold text-lg">{comp.label}</h2>
            </div>

            <p className="text-xs mt-1 text-slate-700">{comp.description}</p>

            <div className="mt-3">
              <div className="flex justify-between text-sm">
                <span>Water Content:</span>
                <span className="font-medium">{state[key].H2O} L</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full my-1">
                <div
                  className="h-3 rounded-full animate-pulse-neon"
                  style={{
                    width: `${Math.min((state[key].H2O / (comp.volume * 1.2)) * 100, 100)}%`,
                    background: key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA",
                    boxShadow: `0 0 10px ${key === "IVF" ? "#00AAFF" : key === "ISF" ? "#00FFFF" : "#00FFAA"}`,
                  }}
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {comp.key_electrolytes.map((electrolyte) => (
                <div key={electrolyte} className="bg-white/30 rounded px-2 py-1 text-xs">
                  <div className="flex justify-between">
                    <span>{electrolyte}:</span>
                    <span className="font-medium">
                      {state[key][electrolyte.replace("⁺", "").replace("²⁺", "")] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Activity size={18} />
          <span>Hydration Actions:</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {hydrationActions.map((action) => (
            <motion.button
              key={action.name}
              onClick={() => applyAction(action)}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-md border border-white/30 flex flex-col items-center justify-center gap-2 h-24"
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(0, 170, 255, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              {action.name === "Drink Water" ? (
                <Droplets className="text-[#00AAFF]" size={24} />
              ) : action.name === "Coffee" ? (
                <Coffee className="text-[#8B4513]" size={24} />
              ) : action.name === "Exercise" ? (
                <Activity className="text-[#FF9AAA]" size={24} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00FFAA] to-[#00AAFF]" />
              )}
              <span className="font-medium text-sm">{action.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
