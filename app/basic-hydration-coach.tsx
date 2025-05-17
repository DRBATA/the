"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Recycle, Coffee, ArrowRight, History } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Common emoji options for feeling selector
const EMOJI_OPTIONS = ["😊", "😀", "😐", "😓", "😫", "🥵", "🥶", "🤢", "🤮", "🏃", "💪", "🏋️"]

// Mock data for nearby partners
const NEARBY_PARTNERS = [
  { name: "Café GreenFuel", distanceM: 140, dish: "Recovery Bowl" },
  { name: "Hydration Station", distanceM: 220, dish: "Electrolyte Smoothie" },
  { name: "Fitness Fuel", distanceM: 350, dish: "Protein Power Plate" },
]

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function BasicHydrationCoach() {
  // Form inputs
  const [email, setEmail] = useState<string>("")
  const [preWeight, setPreWeight] = useState<number | "">("")
  const [postWeight, setPostWeight] = useState<number | "">("")
  const [activityDuration, setActivityDuration] = useState<number | "">(60)
  const [bottlesRecycled, setBottlesRecycled] = useState<number | "">(0)
  const [feelingEmoji, setFeelingEmoji] = useState<string>("😊")

  // UI states
  const [showResults, setShowResults] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [userHistory, setUserHistory] = useState<any[]>([])

  // Results
  const [results, setResults] = useState<{
    bottleCount: number
    stickNaCount: number
    stickKCount: number
    fluidNeededL: number
    weightLossL: number
    naLostMmol: number
    kLostMmol: number
    nearestPartner: (typeof NEARBY_PARTNERS)[0]
  } | null>(null)

  // Fetch user history when email changes
  useEffect(() => {
    if (email) {
      fetchUserHistory(email)
    }
  }, [email])

  // Fetch user history from Supabase
  const fetchUserHistory = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("pos_user_log")
        .select("*")
        .eq("email", userEmail)
        .order("entry_ts", { ascending: false })

      if (error) {
        console.error("Error fetching history:", error)
        return
      }

      setUserHistory(data || [])
    } catch (err) {
      console.error("Failed to fetch history:", err)
    }
  }

  // Calculate hydration needs with simplified decision card approach
  const calculateHydration = () => {
    if (typeof preWeight !== "number" || typeof postWeight !== "number") return;

    // 1) Fluid needed
    const weightLossL = preWeight - postWeight; // kg ≈ L lost
    const fluidNeededL = weightLossL * 1.25; // 125% replacement
    const bottleCount = Math.ceil(fluidNeededL / 0.5); // 0.5 L bottles

    // 2) Electrolytes
    const sweatNaConc = 50; // mmol/L
    const sweatKConc = 10; // mmol/L (example)
    const naLostMmol = weightLossL * sweatNaConc; // mmol
    const kLostMmol = weightLossL * sweatKConc; // mmol

    // Replace all lost sodium & potassium
    const sticksNa = Math.ceil(naLostMmol / 8.7); // Humantra sticks (8.7 mmol Na each)
    const sticksK = Math.ceil(kLostMmol / 2.7); // if each stick has ~2.7 mmol K

    // Find nearest partner (first one in our mock data)
    const nearestPartner = NEARBY_PARTNERS[0];

    setResults({
      bottleCount,
      stickNaCount: sticksNa,
      stickKCount: sticksK,
      fluidNeededL: Number(fluidNeededL.toFixed(2)),
      weightLossL: Number(weightLossL.toFixed(2)),
      naLostMmol: Math.round(naLostMmol),
      kLostMmol: Math.round(kLostMmol),
      nearestPartner,
    });
    setShowResults(true);
  }

  // Submit form data to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || typeof preWeight !== "number" || typeof postWeight !== "number") {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Insert data into Supabase
      const { error } = await supabase.from("pos_user_log").insert({
        email,
        pre_weight_kg: preWeight,
        post_weight_kg: postWeight,
        activity_duration_min: activityDuration,
        bottles_recycled: bottlesRecycled || 0,
        feeling_emoji: feelingEmoji,
      })

      if (error) {
        throw error
      }

      // Calculate hydration plan
      calculateHydration()

      // Refresh history
      fetchUserHistory(email)

      toast({
        title: "Success!",
        description: "Your hydration data has been saved.",
      })
    } catch (err: any) {
      console.error("Error saving data:", err)
      toast({
        title: "Error saving data",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setShowResults(false)
    setPostWeight("")
    setBottlesRecycled(0)
    setFeelingEmoji("😊")
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/placeholder.svg?key=p8kya')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md relative">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-cyan-400 opacity-30 blur-md water-bar-glow"></div>

        {/* Frosted glass card */}
        <div className="relative backdrop-blur-md bg-white/30 rounded-3xl border border-white/40 shadow-lg overflow-hidden p-6 water-bar-card">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-8">
            <div className="text-cyan-400 mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L20 18H4L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white text-center uppercase tracking-wider">WATER BAR</h1>
          </div>

          {!showResults ? (
            <>
              <h2 className="text-xl text-white text-center mb-6">Hydration Calculator</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 water-bar-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pre-weight" className="text-white">
                    Pre-Activity Weight (kg)
                  </Label>
                  <Input
                    id="pre-weight"
                    type="number"
                    placeholder="70.0"
                    value={preWeight}
                    onChange={(e) => setPreWeight(e.target.value ? Number(e.target.value) : "")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 water-bar-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-weight" className="text-white">
                    Post-Activity Weight (kg)
                  </Label>
                  <Input
                    id="post-weight"
                    type="number"
                    placeholder="69.0"
                    value={postWeight}
                    onChange={(e) => setPostWeight(e.target.value ? Number(e.target.value) : "")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 water-bar-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-duration" className="text-white">
                    Activity Duration (minutes)
                  </Label>
                  <Input
                    id="activity-duration"
                    type="number"
                    placeholder="60"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value ? Number(e.target.value) : "")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 water-bar-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bottles-recycled" className="text-white">
                    Bottles Recycled
                  </Label>
                  <Input
                    id="bottles-recycled"
                    type="number"
                    placeholder="0"
                    value={bottlesRecycled}
                    onChange={(e) => setBottlesRecycled(e.target.value ? Number(e.target.value) : "")}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 water-bar-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeling-emoji" className="text-white">
                    How are you feeling?
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFeelingEmoji(emoji)}
                        className={`h-10 flex items-center justify-center rounded-md text-xl ${
                          feelingEmoji === emoji
                            ? "bg-cyan-500/50 border-2 border-white"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="submit"
                    disabled={loading || typeof preWeight !== "number" || typeof postWeight !== "number"}
                    className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white border-none water-bar-button"
                  >
                    {loading ? "Saving..." : "Calculate & Save"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white border-none"
                  >
                    <History className="h-5 w-5" />
                  </Button>
                </div>
              </form>

              {/* History Section */}
              {showHistory && userHistory.length > 0 && (
                <div className="mt-6 bg-white/20 rounded-xl p-4 overflow-hidden">
                  <h3 className="text-white font-medium mb-3">Your History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-white/90 text-sm water-bar-table">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-2">Date</th>
                          <th className="text-right py-2">Pre</th>
                          <th className="text-right py-2">Post</th>
                          <th className="text-right py-2">Mins</th>
                          <th className="text-center py-2">Feel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userHistory.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/10">
                            <td className="py-2">{formatDate(entry.entry_ts)}</td>
                            <td className="text-right py-2">{entry.pre_weight_kg} kg</td>
                            <td className="text-right py-2">{entry.post_weight_kg} kg</td>
                            <td className="text-right py-2">{entry.activity_duration_min}</td>
                            <td className="text-center py-2">{entry.feeling_emoji}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl text-white text-center mb-6">Your Hydration Plan</h2>

              {/* Decision Card */}
              <div className="space-y-6">
                {/* Step 1 */}
                {results && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-white/10 rounded-xl p-4 flex flex-col gap-2">
                      <div className="text-cyan-300 font-bold text-lg">Step 1 &mdash; RIGHT NOW</div>
                      <div>
                        <span className="font-bold text-white">Water Needed:</span> {results.fluidNeededL} L ({results.bottleCount} × 500 mL bottles)
                      </div>
                      <div>
                        <span className="font-bold text-white">Sodium:</span> {results.stickNaCount} Humantra sticks (~8.7 mmol Na each, {results.naLostMmol} mmol lost)
                      </div>
                      <div>
                        <span className="font-bold text-white">Potassium:</span> {results.stickKCount} sticks (~2.7 mmol K each, {results.kLostMmol} mmol lost)
                      </div>
                      <div className="text-white/70 text-xs mt-2">
                        Sip it over the next 30 minutes
                      </div>
                    </div>
                  </div>
                )}
                {/* Step 2 */}
                {results && (
                  <div className="bg-white/20 rounded-xl overflow-hidden mt-4">
                    <div className="bg-cyan-500/50 px-4 py-2">
                      <h3 className="text-white font-medium">Step 2 &nbsp;&nbsp; WITHIN 2 HOURS</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-cyan-300" />
                        <div className="flex-1">
                          <p className="text-white">
                            Scan this QR at <span className="font-bold">◉ {results.nearestPartner.name}</span> (
                            {results.nearestPartner.distanceM} m away)
                          </p>
                          <p className="text-white/80 text-sm">to claim your FREE "{results.nearestPartner.dish}"</p>
                          <p className="text-white/70 text-xs italic">(✓ adds the rest of today's salt & potassium)</p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-2">
                        <div className="bg-white p-2 rounded-lg">
                          {/* Placeholder for QR code */}
                          <div className="w-20 h-20 bg-gray-800 flex items-center justify-center">
                            <span className="text-white text-xs">QR Code</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Recycling Reminder */}
                <div className="bg-white/20 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Recycle className="h-5 w-5 text-green-300" />
                    <p className="text-white">Return bottle at Sparklo bin by Exit B</p>
                  </div>
                </div>
                {/* Recycling Info Toggle */}
                <div className="mt-4">
                  <details className="text-white/90">
                    <summary className="cursor-pointer text-sm flex items-center gap-1">
                      <ArrowRight className="h-4 w-4" />
                      <span>How to recycle your bottle</span>
                    </summary>
                    <div className="mt-2 text-xs space-y-2 bg-white/10 p-3 rounded-lg">
                      <p className="font-medium">♻ Recycle your bottle in three super-quick steps:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>
                          <span className="font-medium">Drink → Empty → Cap back on</span> (prevents tiny plastics in the shredder)
                        </li>
                        <li>
                          <span className="font-medium">Squash it flat</span> - Saves space in the reverse-vending machine
                        </li>
                        <li>
                          <span className="font-medium">Drop it at any Sparklo "Sparklomat"</span> or schedule a free RECAPP pick-up
                        </li>
                      </ol>
                      <div className="flex justify-between mt-3">
                        <div className="bg-green-100 p-1 rounded-lg">
                          {/* Placeholder for Recycle QR code */}
                          <div className="w-12 h-12 bg-gray-800 flex items-center justify-center">
                            <span className="text-white text-[8px]">Recycle QR</span>
                          </div>
                        </div>
                        <div className="bg-blue-100 p-1 rounded-lg">
                          {/* Placeholder for Refill QR code */}
                          <div className="w-12 h-12 bg-gray-800 flex items-center justify-center">
                            <span className="text-white text-[8px]">Refill QR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={resetForm} className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white border-none water-bar-button">
                    Calculate Again
                  </Button>
                  <Button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white border-none"
                  >
                    <History className="h-5 w-5" />
                  </Button>
                </div>
                {/* History Section (Results View) */}
                {showHistory && userHistory.length > 0 && (
                  <div className="mt-4 bg-white/20 rounded-xl p-4 overflow-hidden">
                    <h3 className="text-white font-medium mb-3">Your History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-white/90 text-sm water-bar-table">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-2">Date</th>
                            <th className="text-right py-2">Pre</th>
                            <th className="text-right py-2">Post</th>
                            <th className="text-right py-2">Mins</th>
                            <th className="text-center py-2">Feel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userHistory.map((entry) => (
                            <tr key={entry.id} className="border-b border-white/10">
                              <td className="py-2">{formatDate(entry.entry_ts)}</td>
                              <td className="text-right py-2">{entry.pre_weight_kg} kg</td>
                              <td className="text-right py-2">{entry.post_weight_kg} kg</td>
                              <td className="text-right py-2">{entry.activity_duration_min}</td>
                              <td className="text-center py-2">{entry.feeling_emoji}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}   
