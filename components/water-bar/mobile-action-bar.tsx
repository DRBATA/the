"use client"

import { Droplets, ChevronDown, ChevronUp, MapPin } from "lucide-react"

interface MobileActionBarProps {
  showActionDrawer: boolean
  toggleActionDrawer: () => void
  setShowCompartmentDetails: (show: boolean) => void
  setShowNearbyLocations: (show: boolean) => void
}

export default function MobileActionBar({
  showActionDrawer,
  toggleActionDrawer,
  setShowCompartmentDetails,
  setShowNearbyLocations,
}: MobileActionBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 p-2 z-20">
      <div className="flex justify-around">
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setShowCompartmentDetails(true)}
        >
          <Droplets className="h-6 w-6 text-[#00FFFF]" />
        </button>
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={toggleActionDrawer}
        >
          {showActionDrawer ? (
            <ChevronDown className="h-6 w-6 text-white" />
          ) : (
            <ChevronUp className="h-6 w-6 text-white" />
          )}
        </button>
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setShowNearbyLocations(true)}
        >
          <MapPin className="h-6 w-6 text-[#00FFFF]" />
        </button>
      </div>
    </div>
  )
}
