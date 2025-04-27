"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FloatingBubbles from "./FloatingBubbles"

interface SplashScreenProps {
  onCompleteAction: () => void
  hydrationPercentage: number
  carbonSaved: number
  bottlesSaved: number
  bubblesPosition: "center" | "corner" | "hidden"
  onBubblePositionUpdateAction: (position: { x: number; y: number }) => void
  isTransitioning: boolean
}

export default function SplashScreen({
  onCompleteAction,
  hydrationPercentage,
  carbonSaved,
  bottlesSaved,
  bubblesPosition,
  onBubblePositionUpdateAction,
  isTransitioning,
}: SplashScreenProps) {
  const [showText, setShowText] = useState(false)
  const [centralBubblePosition, setCentralBubblePosition] = useState({ x: 0, y: 0 })
  const centralBubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Show text after a short delay
    const timer = setTimeout(() => {
      setShowText(true)
    }, 800)

    // Automatically complete splash after 2.7 seconds
    const completeTimer = setTimeout(() => {
      onCompleteAction()
    }, 2700)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onCompleteAction])

  // Update central bubble position
  useEffect(() => {
    const updatePosition = () => {
      if (centralBubbleRef.current) {
        const rect = centralBubbleRef.current.getBoundingClientRect()
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
        setCentralBubblePosition(position)
        onBubblePositionUpdateAction(position)
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
    }
  }, [onBubblePositionUpdateAction])

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-blue-400 to-blue-700 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background bubbles */}
      <FloatingBubbles count={18} minSize={10} maxSize={40} />
      {/* Floating bubbles and central hydration bubble would go here if implemented */}
      <AnimatePresence>
        {showText && !isTransitioning && (
          <motion.div
            className="text-center text-white z-10 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              One breath.
            </motion.h1>
            <motion.h1
              className="text-4xl font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              One bottle.
            </motion.h1>
            <motion.h1
              className="text-4xl font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              One world.
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Central Hydration Bubble placeholder */}
      <motion.div
        ref={centralBubbleRef}
        className="absolute w-32 h-32 rounded-full flex items-center justify-center"
        style={{
          bottom: isTransitioning ? "50%" : "30%",
          marginBottom: isTransitioning ? "-64px" : "0",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: isTransitioning ? [1, 0] : 1, // Fade out during transition
          y: isTransitioning ? [0, -100] : 0,
        }}
        transition={{
          duration: isTransitioning ? 1 : 1,
          delay: isTransitioning ? 0 : 1.5,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        {/* InfoBubbles or stats can be added here */}
        <span className="text-white text-2xl">💧</span>
      </motion.div>
    </div>
  )
}
