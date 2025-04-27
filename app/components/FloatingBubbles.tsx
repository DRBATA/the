"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Bubble {
  id: number
  size: number
  x: number
  y: number
  duration: number
  delay: number
}

interface FloatingBubblesProps {
  count?: number
  minSize?: number
  maxSize?: number
}

export default function FloatingBubbles({ count = 15, minSize = 10, maxSize = 60 }: FloatingBubblesProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const newBubbles: Bubble[] = []

    for (let i = 0; i < count; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * (maxSize - minSize) + minSize,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
      })
    }

    setBubbles(newBubbles)
  }, [count, minSize, maxSize])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-white/20 backdrop-blur-[1px]"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          animate={{
            y: [0, -1000],
            x: [0, Math.random() * 50 - 25],
            opacity: [0.7, 0.5, 0.3, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
