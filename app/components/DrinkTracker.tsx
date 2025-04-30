"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, Minus } from "lucide-react";
import { useHydration } from "../../contexts/hydration-context";


interface HydrationLog {
  timestamp: string;
  volume_ml: number;
  drink_type: string;
  electrolyte_support: boolean;
  caffeine_present: boolean;
  hydration_multiplier: number;
}

interface DrinkTrackerProps {
  onCompleteAction: (confirmed: boolean, drinkInfo?: HydrationLog) => void;
  dragProgress: number;
}

export default function DrinkTracker({ onCompleteAction, dragProgress }: DrinkTrackerProps) {
  const { hydration, logDrink } = useHydration();
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [amount, setAmount] = useState(250); // Default to 250ml
  const [confirmed, setConfirmed] = useState(false);
  const [effectiveAmount, setEffectiveAmount] = useState(0);

  // Common drink options with properties
  const drinkOptions = [
    { id: "water", name: "Water", icon: "💧", hasElectrolytes: false, hasCaffeine: false, hydrationMultiplier: 1.0 },
    { id: "sparkling", name: "Sparkling", icon: "🫧", hasElectrolytes: false, hasCaffeine: false, hydrationMultiplier: 1.0 },
    { id: "tea", name: "Tea", icon: "🍵", hasElectrolytes: false, hasCaffeine: true, hydrationMultiplier: 0.8 },
    { id: "coffee", name: "Coffee", icon: "☕", hasElectrolytes: false, hasCaffeine: true, hydrationMultiplier: 0.6 },
    { id: "sports", name: "Sports Drink", icon: "⚡", hasElectrolytes: true, hasCaffeine: false, hydrationMultiplier: 1.2 },
    { id: "coconut", name: "Coconut Water", icon: "🥥", hasElectrolytes: true, hasCaffeine: false, hydrationMultiplier: 1.1 },
  ];

  const handleConfirm = async () => {
    if (selectedDrink) {
      const selectedOption = drinkOptions.find((d) => d.id === selectedDrink)!;
      // Calculate effective hydration amount
      const effectiveHydration = Math.round(amount * selectedOption.hydrationMultiplier);
      setEffectiveAmount(effectiveHydration);
      const hydrationLog: HydrationLog = {
        timestamp: new Date().toISOString(),
        volume_ml: amount,
        drink_type: selectedOption.name,
        electrolyte_support: selectedOption.hasElectrolytes,
        caffeine_present: selectedOption.hasCaffeine,
        hydration_multiplier: selectedOption.hydrationMultiplier,
      };
      // TODO: Call your new orchestration endpoint or Supabase directly here to log hydration
      // Example (pseudo): await supabase.from('hydration_logs').insert({ ...hydrationLog, user_id });
      // Or use your orchestration endpoint via fetch('/api/chat', ...)
      await logDrink(effectiveHydration);
      setConfirmed(true);
      setTimeout(() => {
        onCompleteAction(true, hydrationLog);
      }, 1500);
    }
  };

  const handleCancel = () => {
    onCompleteAction(false);
  };

  const increaseAmount = () => {
    setAmount((prev) => Math.min(prev + 50, 1000)); // Max 1000ml
  };

  const decreaseAmount = () => {
    setAmount((prev) => Math.max(prev - 50, 50)); // Min 50ml
  };

  const selectedDrinkInfo = drinkOptions.find((d) => d.id === selectedDrink);


  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background that becomes more visible as you drag down */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: Math.min(dragProgress, 1) }}
      />
      {/* Drink tracker UI */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: -100 }}
        animate={{
          opacity: dragProgress >= 0.7 ? 1 : dragProgress / 0.7,
          y: -100 + dragProgress * 100,
        }}
      >
        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="confirmed"
              className="bg-white/20 backdrop-blur-md rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl text-white font-medium mb-2 text-center">Drink Logged!</h2>
              <div className="text-white/80 text-center mb-4">
                <p>
                  {amount}ml of {selectedDrinkInfo?.name}
                </p>
                <p className="text-sm mt-1">
                  Effective hydration: {effectiveAmount}ml
                  {selectedDrinkInfo &&
                    selectedDrinkInfo.hydrationMultiplier !== 1.0 &&
                    ` (${selectedDrinkInfo.hydrationMultiplier > 1 ? "+" : ""}${Math.round(
                      (selectedDrinkInfo.hydrationMultiplier - 1) * 100,
                    )}%)`}
                </p>
              </div>
              {/* CO2 saved display */}
              <div className="space-y-2">
                <div className="flex flex-col items-center text-white/90">
                  <span className="text-lg font-semibold">CO₂ saved</span>
                  <span className="text-2xl mt-1">{Math.round(hydration.co2Saved)}g</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              className="bg-white/20 backdrop-blur-md rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-white font-medium">Quick Hydration Log</h2>
                <button
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Drink type selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {drinkOptions.map((drink) => (
                  <motion.button
                    key={drink.id}
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      selectedDrink === drink.id
                        ? "bg-blue-600/50 border border-white/40"
                        : "bg-white/10 border border-white/20"
                    }`}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDrink(drink.id)}
                  >
                    <span className="text-2xl mb-1">{drink.icon}</span>
                    <span className="text-white text-xs">{drink.name}</span>
                  </motion.button>
                ))}
              </div>
              {/* Amount selection */}
              {selectedDrink && (
                <motion.div
                  className="mb-4 bg-white/10 rounded-lg p-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="text-white text-sm mb-2">Amount (ml):</div>
                  <div className="flex items-center justify-between">
                    <button
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                      onClick={decreaseAmount}
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <div className="text-white text-xl font-medium">{amount}</div>
                    <button
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                      onClick={increaseAmount}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  {/* Bottle visualization */}
                  <div className="mt-2 h-6 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-400/50"
                      initial={{ width: "25%" }}
                      animate={{ width: `${Math.min(amount / 10, 100)}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    />
                  </div>
                  {/* Hydration multiplier info */}
                  {selectedDrinkInfo && (
                    <div className="mt-2 text-white/80 text-xs">
                      {selectedDrinkInfo.hydrationMultiplier !== 1.0 ? (
                        <div className="flex items-center">
                          <span>Hydration effectiveness: </span>
                          <span
                            className={`ml-1 ${
                              selectedDrinkInfo.hydrationMultiplier > 1 ? "text-green-300" : "text-yellow-300"
                            }`}
                          >
                            {selectedDrinkInfo.hydrationMultiplier > 1 ? "+" : ""}
                            {Math.round((selectedDrinkInfo.hydrationMultiplier - 1) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <div>100% hydration effectiveness</div>
                      )}
                      {selectedDrinkInfo.hasElectrolytes && <div className="mt-1">⚡ Contains electrolytes</div>}
                      {selectedDrinkInfo.hasCaffeine && <div className="mt-1">☕ Contains caffeine</div>}
                    </div>
                  )}
                </motion.div>
              )}
              <motion.button
                className={`w-full py-3 rounded-lg ${
                  selectedDrink ? "bg-blue-500/60 text-white" : "bg-white/10 text-white/50"
                }`}
                whileHover={selectedDrink ? { scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.7)" } : {}}
                whileTap={selectedDrink ? { scale: 0.98 } : {}}
                onClick={handleConfirm}
                disabled={!selectedDrink}
              >
                Log Hydration
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
