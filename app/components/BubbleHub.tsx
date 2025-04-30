"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useGesture } from "@use-gesture/react"
import { Droplet, MapPin, User, X, Heart, BarChart3 } from "lucide-react"
import FloatingBubbles from "./FloatingBubbles"
import InfoBubbles from "./InfoBubbles"

// Core screens/modal triggers will be passed via props or context in the main page

interface BubbleHubProps {
  hydrationPercentage: number
  carbonSaved: number
  bottlesSaved: number
  initialBubblesPosition: "center" | "corner" | "hidden"
  initialBubblePosition: { x: number; y: number }
  onHydrateAction: () => void
  onPurposeAction: () => void
  onRefillAction: () => void
  onProfileAction: () => void
  onHistoryAction: () => void
  onCentralDragUpAction: () => void
  onCentralDragDownAction: () => void
}

export default function BubbleHub({
  hydrationPercentage,
  carbonSaved = 0.91,
  bottlesSaved = 11,
  initialBubblesPosition,
  initialBubblePosition,
  onHydrateAction,
  onPurposeAction,
  onRefillAction,
  onProfileAction,
  onHistoryAction,
  onCentralDragUpAction,
  onCentralDragDownAction,
}: BubbleHubProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [initialAnimation, setInitialAnimation] = useState(true)
  const [entryAnimationComplete, setEntryAnimationComplete] = useState(false)
  const mainBubbleControls = useAnimation()
  const centralBubbleRef = useRef<HTMLDivElement>(null)
  const [centralBubblePosition, setCentralBubblePosition] = useState(initialBubblePosition.x !== 0 ? initialBubblePosition : { x: 0, y: 0 })

  // Position helpers
  const calculateCirclePosition = (index: number, totalItems: number, radius: number) => {
    const angleInRadians = ((270 + (index * 360) / totalItems) * Math.PI) / 180
    return {
      x: radius * Math.cos(angleInRadians),
      y: radius * Math.sin(angleInRadians),
    }
  }

  // Update central bubble position
  const updateCentralBubblePosition = () => {
    if (centralBubbleRef.current) {
      const rect = centralBubbleRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      setCentralBubblePosition({ x: centerX, y: centerY })
    }
  }

  // Entry animation
  useEffect(() => {
    if (initialBubblePosition.x !== 0 && !entryAnimationComplete) {
      mainBubbleControls.start({ opacity: [0, 1], scale: [0.9, 1], transition: { duration: 0.5 } }).then(() => {
        setEntryAnimationComplete(true)
        updateCentralBubblePosition()
      })
    }
  }, [initialBubblePosition, mainBubbleControls, entryAnimationComplete])

  useEffect(() => {
    updateCentralBubblePosition()
    if (initialBubblesPosition === "corner" && entryAnimationComplete) {
      setTimeout(() => { setMenuOpen(true) }, 500)
    }
    window.addEventListener("resize", updateCentralBubblePosition)
    setTimeout(() => { setInitialAnimation(false) }, 1000)
    return () => {
      window.removeEventListener("resize", updateCentralBubblePosition)
    }
  }, [initialBubblesPosition, entryAnimationComplete])

  useEffect(() => { if (menuOpen) updateCentralBubblePosition() }, [menuOpen])

  // Gesture logic (drag up/down)
  const gesturePathRef = useRef<{ x: number; y: number }[]>([])
  const [dragActive, setDragActive] = useState<null | "up" | "down">(null)
  const [dragProgress, setDragProgress] = useState(0)
  const bindGesture = useGesture({
    onDrag: ({ movement: [mx, my], first, last, event }) => {
      event.preventDefault()
      if (first) gesturePathRef.current = []
      gesturePathRef.current.push({ x: mx, y: my })
      if (my < -20) {
        setDragActive("up")
        setDragProgress(Math.min(Math.abs(my) / 150, 1))
      } else if (my > 20) {
        setDragActive("down")
        setDragProgress(Math.min(Math.abs(my) / 150, 1))
      }
      if (last) {
        if (dragActive === "up" && dragProgress > 0.7) onCentralDragUpAction()
        else if (dragActive === "down" && dragProgress > 0.7) onCentralDragDownAction()
        setDragActive(null)
        setDragProgress(0)
      }
    }
  })

  // Bubble menu items (core only)
  const bubbleItems = [
    { id: "hydrate", label: "Hydrate", icon: <Droplet className="w-5 h-5" />, action: onHydrateAction, index: 0 },
    { id: "purpose", label: "Purpose", icon: <Heart className="w-5 h-5" />, action: onPurposeAction, index: 1 },
    { id: "refill", label: "Refill", icon: <MapPin className="w-5 h-5" />, action: onRefillAction, index: 2 },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, action: onProfileAction, index: 3 },
    { id: "history", label: "History", icon: <BarChart3 className="w-5 h-5" />, action: onHistoryAction, index: 4 },
  ]
  const totalBubbles = bubbleItems.length
  const circleRadius = 140

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-blue-400 to-blue-700 flex items-center justify-center overflow-hidden">
      <FloatingBubbles count={15} maxSize={40} />
      <AnimatePresence mode="wait">
        <motion.div key="hub" className="relative h-full w-full flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Main central bubble */}
          <motion.div className="relative z-10" animate={mainBubbleControls}>
            <div {...bindGesture()}>
              <motion.div ref={centralBubbleRef} className="w-32 h-32 rounded-full bg-transparent flex items-center justify-center cursor-pointer" initial={{ scale: 1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMenuOpen(!menuOpen)}>
                <InfoBubbles hydrationPercentage={hydrationPercentage} carbonSaved={carbonSaved} bottlesSaved={bottlesSaved} />
              </motion.div>
            </div>
            {/* Gesture hint */}
            {!menuOpen && !initialAnimation && !dragActive && (
              <motion.div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center w-48" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                Trace a circle to open menu<br />Swipe up for refill<br />Swipe down to log hydration
              </motion.div>
            )}
          </motion.div>
          {/* Bubble menu items */}
          <AnimatePresence>
            {menuOpen && bubbleItems.map((item) => {
              const position = calculateCirclePosition(item.index, totalBubbles, circleRadius)
              return (
                <motion.div key={item.id} className="fixed z-0" style={{ top: 0, left: 0, margin: 0 }} initial={initialAnimation ? { x: 32, y: 32, opacity: 1, scale: 1 } : { x: centralBubblePosition.x - 32, y: centralBubblePosition.y - 32, opacity: 0, scale: 0.5 }} animate={{ x: centralBubblePosition.x - 32 + position.x, y: centralBubblePosition.y - 32 + position.y, opacity: 1, scale: 1 }} exit={{ x: centralBubblePosition.x - 32, y: centralBubblePosition.y - 32, opacity: 0, scale: 0.5 }} transition={{ duration: 0.5, delay: item.index * 0.05, type: "spring", stiffness: 150, damping: 15 }} onClick={item.action}>
                  <motion.div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center cursor-pointer" whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }} whileTap={{ scale: 0.95 }}>
                    <div className="flex items-center justify-center">{item.icon}</div>
                  </motion.div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-white text-xs whitespace-nowrap">{item.label}</div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {/* Close button for menu */}
          <AnimatePresence>
            {menuOpen && !initialAnimation && (
              <motion.button className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center z-20" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => setMenuOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
