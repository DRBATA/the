"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import FloatingBubbles from "../components/FloatingBubbles";

// Affirmation categories with 6 tags and 10 affirmations each
const affirmationCategories = {
  gratitude: [
    "With gratitude, I welcome this water.",
    "I am thankful for each refreshing sip.",
    "My heart overflows with appreciation.",
    "Gratitude nourishes my mind and body.",
    "I cherish the gift of hydration.",
    "May gratitude flow through this water.",
    "I give thanks for life's sustaining water.",
    "This drink is a blessing.",
    "I honor all hands that brought this water.",
    "Gratefulness amplifies my wellbeing."
  ],
  health: [
    "My body thrives with this water.",
    "I choose vibrant health.",
    "Each sip renews my cells.",
    "Water carries vitality within me.",
    "I am hydrated and healthy.",
    "Wellness flows through me.",
    "I support my immune strength.",
    "Hydration fuels my energy.",
    "I nurture my body with water.",
    "Health blossoms in every drop."
  ],
  clarity: [
    "Water clears my mind like a calm lake.",
    "Each sip sharpens my focus.",
    "I invite mental clarity.",
    "My thoughts flow with ease.",
    "Crystal clear insight fills me.",
    "I release all mental fog.",
    "Clarity rises with every drop.",
    "My intentions are transparent and pure.",
    "This water reflects clear purpose.",
    "I see my path with freshness."
  ],
  compassion: [
    "Kindness flows through me.",
    "May this water awaken empathy.",
    "I speak and act with love.",
    "I share compassion freely.",
    "My heart expands with each sip.",
    "I radiate gentle understanding.",
    "Water connects me to others.",
    "I honor all beings.",
    "Peace and compassion guide me.",
    "I am a source of comfort."
  ],
  strength: [
    "I drink in resilience.",
    "Each sip fuels my power.",
    "I stand strong and steady.",
    "Confidence rises within me.",
    "I overcome all challenges.",
    "My spirit is unbreakable.",
    "Water fortifies my body and mind.",
    "I persist with courage.",
    "I am grounded and stable.",
    "Strength flows in every cell."
  ],
  joy: [
    "I sip pure happiness.",
    "Joy bubbles within me.",
    "I celebrate this refreshing moment.",
    "This water sparkles with delight.",
    "My day is bright and cheerful.",
    "I laugh with each sip.",
    "I embrace playfulness.",
    "Happiness hydrates my soul.",
    "I shine with enthusiasm.",
    "Joyful energy fills my being."
  ]
} as const;

type Tag = keyof typeof affirmationCategories;

export default function PurposePage() {
  const [ritualStarted, setRitualStarted] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [selectedTag, setSelectedTag] = useState<Tag>("gratitude");

  const currentAffirmations = affirmationCategories[selectedTag];

  const startRitual = () => {
    setRitualStarted(true);
    setPulsing(true);

    let idx = Math.floor(Math.random() * currentAffirmations.length);
    setAffirmationIdx(idx);

    if (navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }

    const interval = setInterval(() => {
      idx = (idx + 1) % currentAffirmations.length;
      setAffirmationIdx(idx);
    }, 3000);

    setTimeout(() => {
      setPulsing(false);
      clearInterval(interval);
    }, 10000);
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      <FloatingBubbles count={10} maxSize={30} />
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 z-20 bg-white/80 rounded-full px-4 py-2 shadow hover:bg-white text-blue-700 flex items-center gap-2"
        onClick={() => window.location.assign('/')}
        aria-label="Back to main menu"
      >
        ← Main Menu
      </button>
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
        {/* Tag selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {Object.keys(affirmationCategories).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag as Tag)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedTag === tag
                  ? "bg-white/30 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
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
                  {currentAffirmations[affirmationIdx]}
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
