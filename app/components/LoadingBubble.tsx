"use client"

import { motion } from "framer-motion"

export default function LoadingBubble() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-blue-700 z-50">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          🫧
        </motion.div>
        <motion.div
          className="text-white text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          Loading...
        </motion.div>

        {/* Small bubbles animation */}
        <div className="relative h-20 w-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 bottom-0 w-3 h-3 rounded-full bg-white/30 backdrop-blur-sm"
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{
                y: [-10 * (i + 1), -60],
                x: [0, (i % 2 === 0 ? 15 : -15) * Math.random()],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 1 + i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
