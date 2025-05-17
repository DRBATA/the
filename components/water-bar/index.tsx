"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

// Components
import AmnioticDial from "@/components/water-bar/amniotic-dial"
import ActionDrawer from "@/components/water-bar/action-drawer"
import ProfileButton from "@/components/water-bar/profile-button"
import ProfileModal from "@/components/water-bar/profile-modal"
import MobileActionBar from "@/components/water-bar/mobile-action-bar"

// Types
import type { UserProfile, CompartmentState, TimelineEvent } from "@/components/water-bar/types"
import { calculateTotalBodyWater, calculateHydrationScore } from "@/components/water-bar/utils"
import { applyAction, hydrationActions } from "@/components/water-bar/actions"

export default function WaterBar() {
  // State for the current time and selected time
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:00`
  })
  const [selectedTime, setSelectedTime] = useState<string>(currentTime)

  // State for the compartment states and timeline
  const [initialState, setInitialState] = useState<CompartmentState>({
    IVF: { Na: 140, Albumin: 4, BUN: 15, Glucose: 90, H2O: 3 },
    ISF: { Na: 140, Cl: 100, Glucose: 90, H2O: 12 },
    ICF: { K: 140, Mg: 30, Pi: 100, Glucose: 20, H2O: 25 },
    Hormones: { Aldosterone: 0, ADH: 0, Cortisol: 0, Estrogen: 0, Testosterone: 0 },
  })

  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [currentState, setCurrentState] = useState<CompartmentState>(initialState)
  const [hydrationScore, setHydrationScore] = useState<number>(calculateHydrationScore(currentState))

  // UI state
  const [showActionDrawer, setShowActionDrawer] = useState<boolean>(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCompartmentDetails, setShowCompartmentDetails] = useState<boolean>(false)
  const [showNearbyLocations, setShowNearbyLocations] = useState<boolean>(false)

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: null,
    height: null,
    weight: null,
    age: null,
    biologicalSex: null,
    muscleMass: null,
    supabaseId: null,
    isLoggedIn: false,
  })

  // Effect to update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(`${now.getHours().toString().padStart(2, "0")}:00`)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Effect to update the current state based on the selected time
  useEffect(() => {
    // Find all confirmed events up to the selected time
    const relevantEvents = timeline
      .filter((event) => event.confirmed && event.time <= selectedTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    if (relevantEvents.length === 0) {
      setCurrentState(initialState)
    } else {
      // Get the state from the most recent event
      setCurrentState(relevantEvents[relevantEvents.length - 1].state)
    }
  }, [selectedTime, timeline, initialState])

  // Effect to update the hydration score when the current state changes
  useEffect(() => {
    setHydrationScore(calculateHydrationScore(currentState))
  }, [currentState])

  // Effect to update compartment volumes based on user profile
  useEffect(() => {
    const tbw = calculateTotalBodyWater(userProfile)
    if (tbw) {
      // Update initial state based on calculated total body water
      const newInitialState = {
        ...initialState,
        IVF: { ...initialState.IVF, H2O: Math.round(tbw * 0.075 * 10) / 10 },
        ISF: { ...initialState.ISF, H2O: Math.round(tbw * 0.3 * 10) / 10 },
        ICF: { ...initialState.ICF, H2O: Math.round(tbw * 0.625 * 10) / 10 },
      }
      setInitialState(newInitialState)

      // Also update current state if no timeline events
      if (timeline.length === 0) {
        setCurrentState(newInitialState)
      }
    }
  }, [userProfile])

  // Toggle action drawer
  const toggleActionDrawer = () => {
    setShowActionDrawer((prev) => !prev)
  }

  // Function to add an event to the timeline
  const addTimelineEvent = (time: string, actionId: string, source: "user" | "ai" | "planned" = "user") => {
    const action = hydrationActions.find((a) => a.id === actionId)
    if (!action) return

    // Find the most recent state before this time
    const relevantEvents = timeline
      .filter((event) => event.confirmed && event.time <= time)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const previousState = relevantEvents.length > 0 ? relevantEvents[relevantEvents.length - 1].state : initialState

    // Apply the action to the previous state
    const newState = applyAction(previousState, action)

    // Create a new timeline event
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      time,
      timestamp: new Date(),
      actionId,
      state: newState,
      source,
      confirmed: source === "user", // User events are automatically confirmed
    }

    // Add the event to the timeline
    setTimeline([...timeline, newEvent])

    // If this is a current or past event, update the selected time to see its effects
    if (time <= currentTime) {
      setSelectedTime(time)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 z-10">
        <h1
          className="text-2xl font-light tracking-wider text-[#00FFFF]"
          style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
        >
          THE WATER BAR
        </h1>
        <div className="flex items-center space-x-4">
          {/* User Profile Button */}
          <ProfileButton userProfile={userProfile} onClick={() => setShowProfileModal(true)} />

          {/* Time */}
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0, 255, 255, 0.8))" }} />
            <span className="text-white" style={{ textShadow: "0 0 5px rgba(0, 255, 255, 0.5)" }}>
              {currentTime}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Amniotic Dial */}
        <AmnioticDial
          currentTime={currentTime}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          currentState={currentState}
          timeline={timeline}
          setTimeline={setTimeline}
          hydrationScore={hydrationScore}
          showActionDrawer={showActionDrawer}
          setShowActionDrawer={setShowActionDrawer}
          showCompartmentDetails={showCompartmentDetails}
          setShowCompartmentDetails={setShowCompartmentDetails}
          showNearbyLocations={showNearbyLocations}
          setShowNearbyLocations={setShowNearbyLocations}
        />

        {/* Mobile action bar - only visible on mobile */}
        <MobileActionBar
          showActionDrawer={showActionDrawer}
          toggleActionDrawer={toggleActionDrawer}
          setShowCompartmentDetails={setShowCompartmentDetails}
          setShowNearbyLocations={setShowNearbyLocations}
        />

        {/* Action drawer */}
        <ActionDrawer
          showActionDrawer={showActionDrawer}
          toggleActionDrawer={toggleActionDrawer}
          timeline={timeline}
          setTimeline={setTimeline}
          currentState={currentState}
          initialState={initialState}
          currentTime={currentTime}
          selectedTime={selectedTime}
          setShowNearbyLocations={setShowNearbyLocations}
          addTimelineEvent={addTimelineEvent}
        />
      </main>

      {/* Modals */}
      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {/* Global styles */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        .rounded-diamond {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
      `}</style>
    </div>
  )
}
