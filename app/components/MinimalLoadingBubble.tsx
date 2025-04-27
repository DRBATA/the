"use client"

import { motion } from "framer-motion"
import FloatingBubbles from "./FloatingBubbles"

export default function MinimalLoadingBubble() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-blue-700 z-50">
      {/* Animated background bubbles */}
      <FloatingBubbles count={18} minSize={10} maxSize={40} />

      {/* Main loading bubble */}
      <motion.div
        className="flex flex-col items-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-blue-300/60 flex items-center justify-center mb-4 shadow-lg"
          animate={{
            scale: [1, 1.08, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <span className="text-3xl">💧</span>
        </motion.div>
        <motion.div
          className="text-white text-sm font-light tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          Loading...
        </motion.div>
      </motion.div>
    </div>
  )
}
