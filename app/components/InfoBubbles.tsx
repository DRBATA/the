"use client"

import { motion } from "framer-motion"

interface InfoBubblesProps {
  hydrationPercentage: number
  carbonSaved: number
  bottlesSaved: number
  size?: "small" | "medium" | "large"
}

export default function InfoBubbles({
  hydrationPercentage,
  carbonSaved,
  bottlesSaved,
  size = "medium",
}: InfoBubblesProps) {
  // Size mappings
  const sizeMap = {
    small: {
      container: "w-28 h-28",
      mainBubble: "w-16 h-16",
      secondaryBubble: "w-10 h-10",
      tertiaryBubble: "w-8 h-8",
      mainText: "text-lg",
      secondaryText: "text-xs",
      tertiaryText: "text-[10px]",
    },
    medium: {
      container: "w-40 h-40",
      mainBubble: "w-20 h-20",
      secondaryBubble: "w-14 h-14",
      tertiaryBubble: "w-10 h-10",
      mainText: "text-2xl",
      secondaryText: "text-sm",
      tertiaryText: "text-xs",
    },
    large: {
      container: "w-48 h-48",
      mainBubble: "w-24 h-24",
      secondaryBubble: "w-16 h-16",
      tertiaryBubble: "w-12 h-12",
      mainText: "text-3xl",
      secondaryText: "text-base",
      tertiaryText: "text-sm",
    },
  }

  const styles = sizeMap[size]

  return (
    <div className={`${styles.container} relative`}>
      {/* Main bubble - Hydration percentage */}
      <motion.div
        className={`${styles.mainBubble} absolute rounded-full flex items-center justify-center z-10 overflow-hidden`}
        style={{
          bottom: "5%",
          left: "50%",
          x: "-50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 255, 0.2))",
          boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {/* Bubble highlight effect */}
        <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full bg-white/60 blur-[1px]"></div>

        <div className="text-center z-10">
          <span className={`${styles.mainText} font-light text-white drop-shadow-sm`}>{hydrationPercentage}%</span>
        </div>
      </motion.div>

      {/* Secondary bubble - CO2 saved */}
      <motion.div
        className={`${styles.secondaryBubble} absolute rounded-full flex items-center justify-center overflow-hidden`}
        style={{
          top: "10%",
          right: "5%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3) 60%, rgba(255, 255, 255, 0.15))",
          boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
        }}
        animate={{
          y: [0, -8, 0],
          x: [0, 3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {/* Bubble highlight effect */}
        <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full bg-white/60 blur-[1px]"></div>

        <div className="text-center px-1 z-10">
          <span className={`${styles.secondaryText} font-light text-white drop-shadow-sm`}>
            CO<sub>2</sub>
          </span>
          <div className={`${styles.tertiaryText} text-white/90 drop-shadow-sm`}>{carbonSaved.toFixed(2)}kg</div>
        </div>
      </motion.div>

      {/* Tertiary bubble - Bottles saved */}
      <motion.div
        className={`${styles.tertiaryBubble} absolute rounded-full flex items-center justify-center overflow-hidden`}
        style={{
          top: "15%",
          left: "0%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.25) 60%, rgba(255, 255, 255, 0.1))",
          boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.2), 0 0 8px rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
        animate={{
          y: [0, -10, 0],
          x: [0, -2, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {/* Bubble highlight effect */}
        <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full bg-white/60 blur-[1px]"></div>

        <div className="text-center z-10">
          <span className={`${styles.tertiaryText} text-white/90 drop-shadow-sm`}>{bottlesSaved}</span>
          <div className={`${styles.tertiaryText} text-white/80 leading-tight drop-shadow-sm`}>bottles</div>
        </div>
      </motion.div>
    </div>
  )
}
