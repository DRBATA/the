"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import FloatingBubbles from "../../components/FloatingBubbles";

const affirmations = [
  "May this water nourish my body and spirit.",
  "I am grateful for this moment.",
  "I infuse my water with positivity and health.",
  "Every sip supports my wellbeing.",
  "I honor the earth with my choices.",
];

export default function PurposePage() {
  const [ritualStarted, setRitualStarted] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  const startRitual = () => {
    setRitualStarted(true);
    setPulsing(true);
    setAffirmationIdx(0);

    if (navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }

    // Cycle through affirmations
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % affirmations.length;
      setAffirmationIdx(idx);
    }, 3000);

    // Stop pulsing and cycling after 10 seconds
    setTimeout(() => {
      setPulsing(false);
      clearInterval(interval);
    }, 10000);
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      <FloatingBubbles count={10} maxSize={30} />
      {/* Header */}
      <motion.div
        className="flex items-center p-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-light text-white ml-2">Purposeful Water</h1>
      </motion.div>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl text-white font-light mb-2">Place your water on the screen</h2>
          <p className="text-white/80 text-sm max-w-xs mx-auto">
            Set an intention for your water and infuse it with positive energy
          </p>
        </motion.div>
        {/* Ritual bubble */}
        <motion.div
          className="relative w-48 h-48 flex items-center justify-center mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Pulsing rings */}
          {pulsing && (
            <>
              <motion.div
                className="absolute w-full h-full rounded-full bg-white/10"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-full h-full rounded-full bg-white/10"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0] }}
                transition={{ duration: 2, delay: 0.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-full h-full rounded-full bg-white/10"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0] }}
                transition={{ duration: 2, delay: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </>
          )}
          {/* Main bubble */}
          <motion.div
            className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
            animate={
              pulsing
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px 5px rgba(255, 255, 255, 0.3)",
                      "0 0 30px 10px rgba(255, 255, 255, 0.5)",
                      "0 0 20px 5px rgba(255, 255, 255, 0.3)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {ritualStarted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Heart className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm px-4 min-h-[48px]">
                  {affirmations[affirmationIdx]}
                </p>
              </motion.div>
            ) : (
              <Heart className="w-12 h-12 text-white/70" />
            )}
          </motion.div>
        </motion.div>
        {/* Button */}
        <motion.button
          className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={startRitual}
        >
          {ritualStarted ? "Refresh Intention" : "Begin Ritual"}
        </motion.button>
      </div>
    </div>
  );
}
