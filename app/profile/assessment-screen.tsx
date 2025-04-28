"use client";
import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";
import FloatingBubbles from "../../components/FloatingBubbles";
import { useHydration } from "@/contexts/hydration-context";

interface AssessmentScreenProps {
  onBack: () => void;
}

export default function AssessmentScreen({ onBack }: AssessmentScreenProps) {
  const { updateUserProfile, state } = useHydration();
  const [profile, setProfile] = useState({
    height: state.userProfile?.height || 170,
    weight: state.userProfile?.weight || 70,
    age: state.userProfile?.age || 30,
    gender: state.userProfile?.gender || "male",
    activityLevel: state.userProfile?.activityLevel || "moderate",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hydrationState = calculateHydrationState(profile);
    updateUserProfile(profile, hydrationState.totalRequired);
    onBack();
  };

  const calculateHydrationState = (profile: any) => {
    let baseAmount = profile.weight * 0.033;
    const activityMultipliers = {
      sedentary: 1,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      "very active": 1.4,
    };
    baseAmount *= activityMultipliers[profile.activityLevel];
    if (profile.age > 60) baseAmount *= 1.1;
    const totalRequired = Math.round(baseAmount * 1000);
    return {
      totalRequired,
      breakdown: [
        {
          category: "Base Hydration",
          amount: Math.round(profile.weight * 0.033 * 1000),
          color: "bg-primary/50",
        },
        {
          category: "Activity Adjustment",
          amount: totalRequired - Math.round(profile.weight * 0.033 * 1000),
          color: "bg-primary",
        },
      ],
    };
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      <FloatingBubbles count={10} maxSize={30} />
      <motion.div
        className="flex items-center p-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-2xl font-light text-white ml-4">Hydration Assessment</h1>
      </motion.div>
      <div className="flex-1 overflow-y-auto p-6 z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white text-lg font-medium">Your Details</h2>
            </div>
            <p className="text-white/80 text-sm mb-2">
              We'll use this information to calculate your personalized hydration requirements.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white text-sm">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm">Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value as "male" | "female" })}
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-white text-sm">Activity Level</label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        activityLevel: e.target.value as
                          | "sedentary"
                          | "light"
                          | "moderate"
                          | "active"
                          | "very active",
                      })
                    }
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very active">Very Active</option>
                  </select>
                </div>
              </div>
            </div>
            <motion.button
              type="submit"
              className="w-full py-4 rounded-full bg-blue-500/60 backdrop-blur-sm border border-white/30 text-white font-medium"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.7)" }}
              whileTap={{ scale: 0.98 }}
            >
              Calculate My Hydration Needs
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
