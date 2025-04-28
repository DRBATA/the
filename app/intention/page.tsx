"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function IntentionPage() {
  const [intention, setIntention] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (intention.trim().length === 0) return
    setSubmitted(true)
    // In a real app, save intention to backend or local state here
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 relative overflow-hidden">
      <motion.div
        className="bg-white/70 rounded-3xl shadow-xl p-8 max-w-md w-full flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <h1 className="text-3xl font-bold mb-2 text-blue-700 text-center drop-shadow">Set Your Intention</h1>
        <p className="text-blue-900/80 mb-6 text-center text-lg">Before you refill, take a moment to put a positive intention or word into your water. Science shows intention matters!</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <input
            type="text"
            className="w-full px-5 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white/90 text-lg shadow"
            placeholder="e.g. Clarity, Energy, Calm..."
            value={intention}
            onChange={e => setIntention(e.target.value)}
            maxLength={40}
            disabled={submitted}
            required
          />
          <motion.button
            type="submit"
            className="btn w-full text-lg py-3 mt-2"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            disabled={submitted}
          >
            {submitted ? "Intention Set!" : "Set Intention"}
          </motion.button>
        </form>
        {submitted && (
          <motion.div
            className="mt-6 text-2xl text-emerald-700 font-semibold drop-shadow"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            "{intention}"
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
