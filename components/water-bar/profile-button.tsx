"use client"

import { User } from "lucide-react"
import type { UserProfile } from "./types"

interface ProfileButtonProps {
  userProfile: UserProfile
  onClick: () => void
}

export default function ProfileButton({ userProfile, onClick }: ProfileButtonProps) {
  return (
    <button
      className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
      onClick={onClick}
    >
      <User className="h-4 w-4 text-[#00FFFF]" />
      <span className="text-white text-sm hidden md:inline">{userProfile.username || "Guest"}</span>
      {userProfile.isLoggedIn ? (
        <div className="w-2 h-2 rounded-full bg-[#00FFAA]" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-[#FFAA00]" />
      )}
    </button>
  )
}
