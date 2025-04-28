"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Utensils, Droplet } from "lucide-react";
import FloatingBubbles from "../floating-bubbles";
import { useHydration } from "@/contexts/hydration-context";

interface DietaryAdviceScreenProps {
  onBack?: () => void;
}

export default function DietaryAdviceScreen({ onBack }: DietaryAdviceScreenProps) {
  const { state } = useHydration();
  const { userProfile, wellnessState } = state;

  const getDietaryAdvice = () => {
    if (!userProfile) return "Complete the hydration assessment to receive personalized dietary advice.";
    const advice = [];
    if (state.hydrationPercentage < 50) {
      advice.push("Increase your water intake. Try to drink water regularly throughout the day.");
    }
    if (userProfile.activityLevel === "active" || userProfile.activityLevel === "very active") {
      advice.push("Consider sports drinks or electrolyte-rich foods to replenish minerals lost through sweat.");
    }
    if (userProfile.age > 60) {
      advice.push("As we age, our thirst sensation decreases. Make a conscious effort to drink water regularly.");
    }
    if (wellnessState?.reportedSymptoms.includes("dark_urine")) {
      advice.push("Your urine is dark, indicating possible dehydration. Increase your fluid intake immediately.");
    }
    if (wellnessState?.reportedSymptoms.includes("fatigue")) {
      advice.push("Fatigue can be a sign of dehydration. Try drinking some water and see if you feel better.");
    }
    if (advice.length === 0) {
      advice.push("You're doing well with your hydration. Keep it up and remember to drink water regularly.");
    }
    return advice.join(" ");
  };

  const getElectrolyteAdvice = () => {
    if (!userProfile) return null;
    const advice = [
      {
        electrolyte: "Sodium",
        range: "1500-2300 mg/day",
        foods: "Table salt, pickles, olives, cheese",
        note: "Essential for fluid balance",
      },
      {
        electrolyte: "Potassium",
        range: "2600-3400 mg/day",
        foods: "Bananas, potatoes, spinach, yogurt",
        note: "Helps regulate heart rhythm",
      },
      {
        electrolyte: "Magnesium",
        range: "310-420 mg/day",
        foods: "Nuts, seeds, whole grains",
        note: "Supports muscle function",
      },
    ];
    return advice;
  };

  const getHydratingFoods = () => {
    return [
      { name: "Cucumber", hydration: "96%", benefits: "Vitamins K, B, C, and potassium" },
      { name: "Watermelon", hydration: "92%", benefits: "Vitamins A, B6, C, and antioxidants" },
      { name: "Strawberries", hydration: "91%", benefits: "Vitamin C, manganese, and folate" },
      { name: "Coconut Water", hydration: "95%", benefits: "Electrolytes and potassium" },
    ];
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
        {onBack && (
          <button
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <h1 className="text-2xl font-light text-white ml-4">Dietary Advice</h1>
      </motion.div>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white text-lg font-medium">Personalized Hydration Advice</h2>
            </div>
            <p className="text-white/90 text-sm">{getDietaryAdvice()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5">
            <h3 className="text-lg font-medium text-white mb-3">Hydrating Foods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getHydratingFoods().map((food, index) => (
                <motion.div
                  key={food.name}
                  className="bg-white/10 backdrop-blur-sm p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-1">
                    <Droplet className="w-4 h-4 text-blue-300 mr-2" />
                    <h4 className="font-medium text-white">{food.name}</h4>
                    <span className="ml-auto text-blue-200 text-sm">{food.hydration}</span>
                  </div>
                  <p className="text-white/80 text-xs">{food.benefits}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5">
            <h3 className="text-lg font-medium text-white mb-3">Electrolyte Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {getElectrolyteAdvice()?.map((item, index) => (
                <motion.div
                  key={item.electrolyte}
                  className="bg-white/10 backdrop-blur-sm p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-medium text-white mb-1">{item.electrolyte}</h4>
                  <div className="space-y-1 text-xs text-white/80">
                    <p>
                      <span className="text-blue-200">Daily Range:</span> {item.range}
                    </p>
                    <p>
                      <span className="text-blue-200">Food Sources:</span> {item.foods}
                    </p>
                    <p>
                      <span className="text-blue-200">Note:</span> {item.note}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {wellnessState?.dehydrationLevel && wellnessState.dehydrationLevel !== "None" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 ${
                wellnessState.dehydrationLevel === "Mild"
                  ? "border-orange-400/50"
                  : wellnessState.dehydrationLevel === "Moderate"
                  ? "border-orange-500/50"
                  : "border-purple-500/50"
              }`}
            >
              <h3 className="text-lg font-medium text-white mb-3">
                Advice for {wellnessState.dehydrationLevel} Dehydration
              </h3>
              <div className="bg-white/10 rounded-lg p-3 text-white/90 text-sm">
                {wellnessState.dehydrationLevel === "Mild" && (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Drink a glass of water with a pinch of salt</li>
                    <li>Consume water-rich fruits like watermelon or oranges</li>
                    <li>Avoid caffeine and alcohol</li>
                  </ul>
                )}
                {wellnessState.dehydrationLevel === "Moderate" && (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Drink an electrolyte solution or sports drink</li>
                    <li>Consume clear broth or coconut water</li>
                    <li>Eat small amounts of fruits with high water content</li>
                    <li>Avoid dairy, caffeine, and alcohol</li>
                  </ul>
                )}
                {wellnessState.dehydrationLevel === "Severe" && (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Seek medical attention immediately</li>
                    <li>Do not attempt to treat severe dehydration at home</li>
                    <li>Medical professionals may provide IV fluids</li>
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
