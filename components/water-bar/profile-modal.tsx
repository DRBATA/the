"use client"

import { motion } from "framer-motion"
import { X, User, Droplets, Mail, LogIn } from "lucide-react"

import GestureHandler from "./gesture-handler"
import type { UserProfile } from "./types"
import { calculateTotalBodyWater } from "./utils"

interface ProfileModalProps {
  show: boolean
  onClose: () => void
  userProfile: UserProfile
  setUserProfile: (profile: UserProfile) => void
}

export default function ProfileModal({ show, onClose, userProfile, setUserProfile }: ProfileModalProps) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <GestureHandler
        className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/30 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
        onSwipeDown={onClose}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-light text-white" style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}>
            User Profile
          </h2>
          <button className="text-white/70 hover:text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Swipe indicator for mobile */}
        <div className="md:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />

        {userProfile.isLoggedIn ? (
          <div className="space-y-4">
            {/* Profile Information */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{userProfile.username || "User"}</h3>
                <p className="text-sm text-white/70">ID: {userProfile.supabaseId || "Not available"}</p>
              </div>
            </div>

            {/* Body Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/70 mb-1">Height</p>
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">{userProfile.height || "—"}</p>
                  <p className="text-xs text-white/70">cm</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/70 mb-1">Weight</p>
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">{userProfile.weight || "—"}</p>
                  <p className="text-xs text-white/70">kg</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/70 mb-1">Age</p>
                <p className="text-white font-medium">{userProfile.age || "—"}</p>
              </div>

              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/70 mb-1">Biological Sex</p>
                <p className="text-white font-medium capitalize">{userProfile.biologicalSex || "—"}</p>
              </div>

              <div className="p-3 bg-white/10 rounded-lg col-span-2">
                <p className="text-xs text-white/70 mb-1">Muscle Mass</p>
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">{userProfile.muscleMass || "—"}</p>
                  <p className="text-xs text-white/70">%</p>
                </div>
              </div>
            </div>

            {/* Total Body Water Calculation */}
            <div className="p-4 bg-[#00FFFF]/10 rounded-lg border border-[#00FFFF]/30 mt-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Droplets size={16} className="mr-2 text-[#00FFFF]" />
                Total Body Water
              </h4>

              {calculateTotalBodyWater(userProfile) ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total</span>
                    <span className="text-white font-medium">{calculateTotalBodyWater(userProfile)} L</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/80">Blood (IVF)</span>
                    <span className="text-white/80">
                      {Math.round(calculateTotalBodyWater(userProfile)! * 0.075 * 10) / 10} L
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/80">Between Cells (ISF)</span>
                    <span className="text-white/80">
                      {Math.round(calculateTotalBodyWater(userProfile)! * 0.3 * 10) / 10} L
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/80">Inside Cells (ICF)</span>
                    <span className="text-white/80">
                      {Math.round(calculateTotalBodyWater(userProfile)! * 0.625 * 10) / 10} L
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-white/70 text-sm">Complete your profile to see your total body water calculation.</p>
              )}
            </div>

            {/* Edit Profile Button */}
            <button
              className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 text-white font-medium"
              onClick={() => {
                // This would open a form to edit profile
                // For now, let's just add some sample data
                setUserProfile({
                  ...userProfile,
                  height: 175,
                  weight: 70,
                  age: 30,
                  biologicalSex: "male",
                  muscleMass: 35,
                })
              }}
            >
              Edit Profile
            </button>

            {/* Logout Button */}
            <button
              className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 text-white/70 font-medium"
              onClick={() => {
                setUserProfile({
                  ...userProfile,
                  isLoggedIn: false,
                  username: null,
                  supabaseId: null,
                })
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white/50" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Sign In to Track Your Hydration</h3>
              <p className="text-sm text-white/70">
                Create a profile to get personalized hydration recommendations based on your body metrics.
              </p>
            </div>

            {/* Magic Link Login */}
            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="text-white font-medium mb-3">Sign in with Magic Link</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/30 rounded-l-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                />
                <button className="bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 text-white px-4 rounded-r-lg border border-[#00FFFF]/30 flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            {/* Demo Login */}
            <button
              className="w-full p-3 bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 rounded-lg border border-[#00FFFF]/30 text-white font-medium flex items-center justify-center"
              onClick={() => {
                setUserProfile({
                  username: "DemoUser",
                  height: 175,
                  weight: 70,
                  age: 30,
                  biologicalSex: "male",
                  muscleMass: 35,
                  supabaseId: "demo-123456",
                  isLoggedIn: true,
                })
              }}
            >
              <LogIn size={16} className="mr-2" />
              Try Demo Account
            </button>
          </div>
        )}
      </GestureHandler>
    </motion.div>
  )
}
