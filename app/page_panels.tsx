"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import HydrationPlanCard from "@/components/hydration-plan-card"
import RefillLogCard from "@/components/refill-log-card"
import CarbonSavingsCard from "@/components/carbon-savings-card"
import VenueSuggestionsCard from "@/components/venue-suggestions-card"
import NutritionCard from "@/components/nutrition-card"
import type { HydrationPlan, Venue, NutritionState, CarbonSavings } from "@/types/hydration-types"
import CarbonToast from "@/components/carbon-toast"
import { motion } from "framer-motion"
import { ChevronUp, ChevronDown, Mic, MessageSquare } from "lucide-react"

// Message type for chat
type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  visualization?: "hydration" | "electrolytes" | "activity" | null
  action?: {
    type: "add_drink" | "update_goal" | "log_activity"
    data: any
  } | null
}

// Add these new types to the existing types at the top of the file
type Recipe = {
  id: string
  name: string
  description: string
  ingredients: string[]
  hydrationImpact: number
  electrolytes: number
  image: string
  selected: boolean
}

type Ingredient = {
  id: string
  name: string
  category: "protein" | "vegetable" | "fruit" | "grain" | "dairy" | "other"
}

export default function Dashboard() {
  // Canvas refs for animations
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State for API data
  const [hydrationPlan, setHydrationPlan] = useState<HydrationPlan | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [nutritionState, setNutritionState] = useState<NutritionState | null>(null)
  const [carbonSavings, setCarbonSavings] = useState<CarbonSavings | null>(null)
  const [isLoading, setIsLoading] = useState({
    plan: true,
    venues: true,
    carbon: true,
  })
  const [error, setError] = useState({
    plan: null,
    venues: null,
    carbon: null,
  })
  const [userId, setUserId] = useState("user123") // In a real app, this would come from auth

  // Fetch data from APIs
  useEffect(() => {
    const fetchHydrationPlan = async () => {
      try {
        // In a real app, this would be an actual API call
        // const response = await fetch('/api/plan')
        // const data = await response.json()

        // Demo data
        const demoData = {
          plan: {
            goal_ml: 2500,
            remaining_ml: 1200,
            current_ml: 1300,
            percent_complete: 52,
            advice: "Drink 500ml water before noon. Consider an electrolyte beverage after your workout.",
            nutrition: {
              sodium_mg: { current: 800, target: 1500 },
              potassium_mg: { current: 350, target: 600 },
              magnesium_mg: { current: 120, target: 200 },
            },
            recommendations: [
              { id: "1", name: "Water", amount: 250, time: "Now", completed: false, color: "#00FFFF" },
              { id: "2", name: "Electrolyte Drink", amount: 330, time: "2:00 PM", completed: false, color: "#00AAFF" },
              { id: "3", name: "Water", amount: 250, time: "4:30 PM", completed: false, color: "#00FFFF" },
            ],
          },
        }

        setHydrationPlan(demoData.plan)
        setNutritionState(demoData.plan.nutrition)
        setIsLoading((prev) => ({ ...prev, plan: false }))
      } catch (err) {
        console.error("Error fetching hydration plan:", err)
        setError((prev) => ({ ...prev, plan: "Failed to load hydration plan" }))
        setIsLoading((prev) => ({ ...prev, plan: false }))
      }
    }

    const fetchVenues = async () => {
      try {
        // In a real app, this would be an actual API call with user location
        // const response = await fetch('/api/should_ping', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     userId,
        //     location: { lat: 25.20, lon: 55.27 },
        //     hydrationLevel: 0.5,
        //     threshold: 0.7
        //   })
        // })
        // const data = await response.json()

        // Demo data
        const demoData = {
          venues: [
            {
              id: "cna1",
              name: "CNA Water Filling Station",
              coordinates: { latitude: 25.21, longitude: 55.28 },
              type: "water",
              offer: null,
              menu: null,
              distance: 90,
            },
            {
              id: "gym1",
              name: "FitLab Gym",
              coordinates: { latitude: 25.205, longitude: 55.275 },
              type: "electrolyte",
              offer: { title: "Free Electrolyte Shot with Refill!", voucher: null },
              menu: null,
              distance: 75,
            },
            {
              id: "cafe1",
              name: "Soulgreen Cafe",
              coordinates: { latitude: 25.202, longitude: 55.271 },
              type: "food",
              offer: { title: "10% Off Hydration Meal", voucher: "SOUL10" },
              menu: { item: "Watermelon Feta Salad", meets: "hydration+electrolyte" },
              distance: 60,
            },
          ],
        }

        setVenues(demoData.venues)
        setIsLoading((prev) => ({ ...prev, venues: false }))
      } catch (err) {
        console.error("Error fetching venues:", err)
        setError((prev) => ({ ...prev, venues: "Failed to load venue suggestions" }))
        setIsLoading((prev) => ({ ...prev, venues: false }))
      }
    }

    const fetchCarbonSavings = async () => {
      try {
        // In a real app, this would be an actual API call
        // const response = await fetch(`/api/carbon?userId=${userId}`)
        // const data = await response.json()

        // Demo data
        const demoData = {
          carbon: {
            total_kg_saved: 5.67,
            bottles_saved: 42,
            trees_equivalent: 3,
            recent_saving: {
              amount_kg: 0.33,
              timestamp: new Date().toISOString(),
            },
          },
        }

        setCarbonSavings(demoData.carbon)
        setIsLoading((prev) => ({ ...prev, carbon: false }))
      } catch (err) {
        console.error("Error fetching carbon savings:", err)
        setError((prev) => ({ ...prev, carbon: "Failed to load carbon savings" }))
        setIsLoading((prev) => ({ ...prev, carbon: false }))
      }
    }

    fetchHydrationPlan()
    fetchVenues()
    fetchCarbonSavings()
  }, [userId])

  // Handle logging a beverage or refill
  const handleLogBeverage = async (logData) => {
    try {
      // In a real app, this would be an actual API call
      // const response = await fetch('/api/log', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     userId,
      //     timestamp: new Date().toISOString(),
      //     logType: 'beverage',
      //     details: logData
      //   })
      // })
      // const data = await response.json()

      // For demo, we'll update the state directly
      // In a real app, we would refetch from the API
      if (logData.refillStation) {
        setCarbonSavings((prev) => ({
          ...prev,
          total_kg_saved: prev.total_kg_saved + 0.33,
          bottles_saved: prev.bottles_saved + 1,
          recent_saving: {
            amount_kg: 0.33,
            timestamp: new Date().toISOString(),
          },
        }))
      }

      setHydrationPlan((prev) => {
        const newRemaining = Math.max(0, prev.remaining_ml - logData.volume_ml)
        const newCurrent = prev.current_ml + logData.volume_ml
        const newPercent = Math.min(100, Math.round((newCurrent / prev.goal_ml) * 100))

        return {
          ...prev,
          remaining_ml: newRemaining,
          current_ml: newCurrent,
          percent_complete: newPercent,
        }
      })

      // Update nutrition if the beverage contains electrolytes
      if (logData.sodium_mg || logData.potassium_mg) {
        setNutritionState((prev) => ({
          ...prev,
          sodium_mg: {
            ...prev.sodium_mg,
            current: prev.sodium_mg.current + (logData.sodium_mg || 0),
          },
          potassium_mg: {
            ...prev.potassium_mg,
            current: prev.potassium_mg.current + (logData.potassium_mg || 0),
          },
        }))
      }
    } catch (err) {
      console.error("Error logging beverage:", err)
    }
  }

  // Create a reference for the triangle canvas
  const hydrationCanvasRef = useRef<HTMLCanvasElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatHeight, setChatHeight] = useState("50vh")
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  // Add these to the state declarations after the other useState hooks
  const [activeSection, setActiveSection] = useState<"hydration" | "electrolytes" | "activity" | "meal-plan">(
    "hydration",
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null)
  const [rippleEffect, setRippleEffect] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const [showIngredientsModal, setShowIngredientsModal] = useState(false)
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([
    { id: "1", name: "Chicken", category: "protein" },
    { id: "2", name: "Spinach", category: "vegetable" },
    { id: "3", name: "Cucumber", category: "vegetable" },
    { id: "4", name: "Yogurt", category: "dairy" },
  ])
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: "1",
      name: "Hydrating Cucumber Salad",
      description: "A refreshing salad with high water content vegetables",
      ingredients: ["Cucumber", "Tomato", "Lettuce", "Feta Cheese"],
      hydrationImpact: 85,
      electrolytes: 120,
      image: "/placeholder.svg?key=714nu",
      selected: true,
    },
    {
      id: "2",
      name: "Watermelon Smoothie",
      description: "Hydrating smoothie with electrolyte-rich ingredients",
      ingredients: ["Watermelon", "Coconut Water", "Mint", "Lime"],
      hydrationImpact: 95,
      electrolytes: 200,
      image: "/placeholder.svg?key=yeyy4",
      selected: false,
    },
    {
      id: "3",
      name: "Yogurt Berry Bowl",
      description: "Protein-rich bowl with hydrating berries",
      ingredients: ["Greek Yogurt", "Strawberries", "Blueberries", "Honey"],
      hydrationImpact: 75,
      electrolytes: 150,
      image: "/placeholder.svg?key=i4bpm",
      selected: true,
    },
  ])
  const [newIngredient, setNewIngredient] = useState("")
  const [ingredientCategory, setIngredientCategory] = useState<Ingredient["category"]>("other")

  // New state for carbon tracking and login
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [carbonSaved, setCarbonSaved] = useState(0)
  const [showCarbonSavedToast, setShowCarbonSavedToast] = useState(false)
  const [recentCarbonSaving, setRecentCarbonSaving] = useState(0)

  // Hydration data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your hydration assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])

  // Drink options
  const drinks = [
    { id: "water", name: "Water", color: "#00FFFF", electrolytes: 0, volume: 250, carbonSaving: 0.33 },
    { id: "sport", name: "Sport Drink", color: "#00AAFF", electrolytes: 150, volume: 330, carbonSaving: 0.45 },
    { id: "coconut", name: "Coconut Water", color: "#00FFAA", electrolytes: 200, volume: 300, carbonSaving: 0.4 },
    { id: "mineral", name: "Mineral Water", color: "#FF9AAA", electrolytes: 50, volume: 250, carbonSaving: 0.33 },
  ]

  // Handle login/logout
  const handleLogin = () => {
    // In a real app, this would open a login modal or redirect to login page
    // For demo purposes, we'll just set the logged in state
    setIsLoggedIn(true)

    // Simulate loading carbon data from Supabase
    setCarbonSaved(5.67) // Example value
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  // Add this function to handle recipe selection
  const toggleRecipeSelection = (id: string) => {
    setRecipes(recipes.map((recipe) => (recipe.id === id ? { ...recipe, selected: !recipe.selected } : recipe)))
  }

  // Add this function to regenerate a recipe
  const regenerateRecipe = (id: string) => {
    // In a real app, this would call an API to generate a new recipe
    // For now, we'll just simulate it by updating the existing recipe
    setRecipes(
      recipes.map((recipe) => {
        if (recipe.id === id) {
          return {
            ...recipe,
            name: `Regenerated ${recipe.name}`,
            description: `New version of ${recipe.description}`,
            hydrationImpact: Math.min(100, recipe.hydrationImpact + 5),
            electrolytes: Math.min(300, recipe.electrolytes + 20),
          }
        }
        return recipe
      }),
    )
  }

  // Add this function to add a new ingredient
  const addIngredient = () => {
    if (!newIngredient.trim()) return

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.trim(),
      category: ingredientCategory,
    }

    setAvailableIngredients([...availableIngredients, newItem])
    setNewIngredient("")
    setIngredientCategory("other")
  }

  // Add this function to remove an ingredient
  const removeIngredient = (id: string) => {
    setAvailableIngredients(availableIngredients.filter((ing) => ing.id !== id))
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isChatOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      inputRef.current?.focus()
    }
  }, [isChatOpen])

  // Neon triangle animation for the logo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 150
    canvas.height = 150

    // Animation variables
    let hue = 180 // Starting hue
    let opacity = 0.8

    // Draw triangle
    const drawTriangle = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const size = 60

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Main outer triangle
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - size)
      ctx.lineTo(centerX - size * 0.866, centerY + size / 2)
      ctx.lineTo(centerX + size * 0.866, centerY + size / 2)
      ctx.closePath()

      // Create gradient for triangle
      const gradient = ctx.createLinearGradient(centerX - size, centerY - size, centerX + size, centerY + size)
      gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${opacity})`)
      gradient.addColorStop(0.5, `hsla(${hue + 60}, 100%, 80%, ${opacity})`)
      gradient.addColorStop(1, `hsla(${hue + 120}, 100%, 80%, ${opacity})`)

      // Draw with glow
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`
      ctx.shadowBlur = 15
      ctx.stroke()

      // Inner triangles
      drawInnerTriangles(centerX, centerY, size, gradient)

      // Update animation variables
      hue = (hue + 0.5) % 360
      opacity = 0.7 + Math.sin(Date.now() / 1000) * 0.2

      requestAnimationFrame(drawTriangle)
    }

    const drawInnerTriangles = (centerX, centerY, size, gradient) => {
      // Calculate points for inner triangles
      const topY = centerY - size
      const leftX = centerX - size * 0.866
      const rightX = centerX + size * 0.866
      const bottomY = centerY + size / 2

      // Middle horizontal line
      ctx.beginPath()
      ctx.moveTo(leftX, bottomY)
      ctx.lineTo(rightX, bottomY)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Middle point
      const midY = (topY + bottomY) / 2

      // Left diagonal
      ctx.beginPath()
      ctx.moveTo(centerX, midY)
      ctx.lineTo(rightX, bottomY)
      ctx.stroke()

      // Right diagonal
      ctx.beginPath()
      ctx.moveTo(centerX, midY)
      ctx.lineTo(leftX, bottomY)
      ctx.stroke()

      // Top to middle
      ctx.beginPath()
      ctx.moveTo(centerX, topY)
      ctx.lineTo(centerX, midY)
      ctx.stroke()
    }

    drawTriangle()
  }, [])

  // Interactive hydration visualization
  useEffect(() => {
    const canvas = hydrationCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Water properties
    const waterHeight = (canvas.height * (hydrationPlan?.percent_complete || 0)) / 100
    const waterY = canvas.height - waterHeight

    // Wave properties
    let waveAmplitude = 5
    const waveFrequency = 0.02
    let wavePhase = 0
    const waveSpeed = 0.05

    // Ripple properties
    const ripples = []
    const addRipple = (x, y) => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: 50 + Math.random() * 30,
        speed: 1 + Math.random() * 1,
        opacity: 0.8,
      })
    }

    // Add initial ripple if effect is active
    if (rippleEffect) {
      addRipple(ripplePosition.x * canvas.width, waterY - 10)
      setRippleEffect(false)
    }

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw water background
      const waterGradient = ctx.createLinearGradient(0, waterY, 0, canvas.height)
      waterGradient.addColorStop(0, "rgba(0, 180, 255, 0.4)")
      waterGradient.addColorStop(1, "rgba(0, 140, 255, 0.6)")

      ctx.fillStyle = waterGradient
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      ctx.lineTo(0, waterY)

      // Draw wavy water surface
      for (let x = 0; x <= canvas.width; x += 5) {
        const y = waterY + Math.sin(x * waveFrequency + wavePhase) * waveAmplitude
        ctx.lineTo(x, y)
      }

      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Draw water glow
      ctx.shadowColor = "rgba(0, 200, 255, 0.8)"
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.moveTo(0, waterY)
      for (let x = 0; x <= canvas.width; x += 5) {
        const y = waterY + Math.sin(x * waveFrequency + wavePhase) * waveAmplitude
        ctx.lineTo(x, y)
      }
      ctx.lineTo(canvas.width, waterY)
      ctx.strokeStyle = "rgba(180, 240, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw ripples
      ripples.forEach((ripple, index) => {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`
        ctx.lineWidth = 2
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Update ripple
        ripple.radius += ripple.speed
        ripple.opacity -= 0.01

        // Remove faded ripples
        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
          ripples.splice(index, 1)
        }
      })

      // Update wave phase for animation
      wavePhase += waveSpeed
      waveAmplitude = 3 + Math.sin(Date.now() / 1000) * 2

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [hydrationPlan?.percent_complete, rippleEffect, ripplePosition])

  // Add water with ripple effect and track carbon savings
  const addWater = (drinkId: string) => {
    const drink = drinks.find((d) => d.id === drinkId)
    if (!drink) return

    // Calculate new hydration level
    const newIntake = Math.min(2500, (hydrationPlan?.current_ml || 0) + drink.volume)
    const newPercentComplete = Math.round((newIntake / 2500) * 100)

    // Update the state
    setHydrationPlan({
      ...hydrationPlan,
      current_ml: newIntake,
      percent_complete: newPercentComplete,
      nutrition: {
        ...nutritionState,
        sodium_mg: {
          ...nutritionState?.sodium_mg,
          current: Math.min(
            nutritionState?.sodium_mg.target || 0,
            (nutritionState?.sodium_mg.current || 0) + drink.electrolytes,
          ),
        },
      },
    })

    // Add ripple effect
    setRippleEffect(true)
    setRipplePosition({ x: 0.5 + (Math.random() * 0.4 - 0.2), y: 0 })

    // Close modal
    setShowAddModal(false)
    setSelectedDrink(null)

    // Add a message about the added drink
    const newAssistantMessage: Message = {
      id: Date.now().toString(),
      content: `Great! You've added ${drink.volume}mL of ${drink.name}. You're now at ${newPercentComplete}% of your daily goal.`,
      sender: "assistant",
      timestamp: new Date(),
      visualization: "hydration",
    }

    setMessages((prev) => [...prev, newAssistantMessage])

    // Update carbon savings if logged in
    if (isLoggedIn) {
      const newSaving = drink.carbonSaving
      setRecentCarbonSaving(newSaving)
      setCarbonSaved((prev) => prev + newSaving)
      setShowCarbonSavedToast(true)
    }
  }

  // Simulate completing a recommendation
  const completeRecommendation = (id: string) => {
    const recommendation = hydrationPlan?.recommendations?.find((r) => r.id === id)
    if (!recommendation || recommendation.completed) return

    // Update the recommendation
    const updatedRecommendations = hydrationPlan?.recommendations?.map((r) =>
      r.id === id ? { ...r, completed: true } : r,
    )

    // Update the hydration stats
    const newIntake = (hydrationPlan?.current_ml || 0) + recommendation.amount
    const newPercentComplete = Math.round((newIntake / 2500) * 100)

    // Update the state
    setHydrationPlan({
      ...hydrationPlan,
      current_ml: newIntake,
      percent_complete: newPercentComplete,
      recommendations: updatedRecommendations,
    })

    // Add ripple effect
    setRippleEffect(true)
    setRipplePosition({ x: 0.5 + (Math.random() * 0.4 - 0.2), y: 0 })

    // Add a message about the completed recommendation
    const newAssistantMessage: Message = {
      id: Date.now().toString(),
      content: `Great! You've added ${recommendation.amount}mL of ${recommendation.name}. You're now at ${newPercentComplete}% of your daily goal.`,
      sender: "assistant",
      timestamp: new Date(),
      visualization: "hydration",
    }

    setMessages((prev) => [...prev, newAssistantMessage])

    // Update carbon savings if logged in
    if (isLoggedIn) {
      const newSaving = 0.33 // Default carbon saving for a recommendation
      setRecentCarbonSaving(newSaving)
      setCarbonSaved((prev) => prev + newSaving)
      setShowCarbonSavedToast(true)
    }
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")

    // Process the message and generate a response
    processUserMessage(inputValue)
  }

  // Process user message and generate appropriate response
  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Simulate AI response with different visualizations based on keywords
    setTimeout(() => {
      let responseContent = ""
      let visualization: Message["visualization"] = null
      const action = null

      if (lowerMessage.includes("hydration") || lowerMessage.includes("water") || lowerMessage.includes("drink")) {
        responseContent = `You're currently at ${hydrationPlan?.percent_complete}% of your daily hydration goal. You need ${2500 - (hydrationPlan?.current_ml || 0)}mL more today.`
        visualization = "hydration"
        setActiveSection("hydration")
      } else if (
        lowerMessage.includes("electrolyte") ||
        lowerMessage.includes("sodium") ||
        lowerMessage.includes("potassium")
      ) {
        responseContent =
          "Your electrolyte levels are below target. Consider adding a sports drink to your next hydration."
        visualization = "electrolytes"
        setActiveSection("electrolytes")
      } else if (
        lowerMessage.includes("run") ||
        lowerMessage.includes("exercise") ||
        lowerMessage.includes("activity")
      ) {
        responseContent =
          "Based on your running activity, I recommend drinking an additional 400mL of water with electrolytes."
        visualization = "activity"
        setActiveSection("activity")
      } else if (
        lowerMessage.includes("carbon") ||
        lowerMessage.includes("environment") ||
        lowerMessage.includes("eco")
      ) {
        if (isLoggedIn) {
          responseContent = `You've saved ${carbonSaved.toFixed(2)} kg of CO₂ by using refill stations. That's equivalent to planting about ${Math.round(carbonSaved / 0.06)} trees!`
        } else {
          responseContent = "Login to track your carbon savings from using refill stations!"
        }
      } else {
        responseContent =
          "How else can I help with your hydration today? You can ask about your hydration status, electrolytes, or activity impact."
      }

      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date(),
        visualization,
        action,
      }

      setMessages((prev) => [...prev, newAssistantMessage])
    }, 1000)
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  // Simulate voice recording
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setIsRecording(false)
        setInputValue("I'm going for a run today")
      }, 2000)
    }
  }

  // Toggle chat panel size
  const toggleChatSize = () => {
    setChatHeight(chatHeight === "50vh" ? "80vh" : "50vh")
  }

  return (
    <div
      className="min-h-screen relative text-slate-800 overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(194, 233, 251, 0.7), rgba(161, 196, 253, 0.7))",
      }}
    >
      {/* Background image with the man */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-90"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-Qe3ko5ZImDFe4txiZ9Pi2nTsq1GWDu.png')",
          backgroundPosition: "center 30%",
          filter: "saturate(1.1)",
        }}
      />

      {/* Carbon Toast and Login Status */}
      <CarbonToast
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        carbonSaved={carbonSaved}
        showCarbonSavedToast={showCarbonSavedToast}
        setShowCarbonSavedToast={setShowCarbonSavedToast}
        recentSaving={recentCarbonSaving}
      />

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with logo */}
        <header className="pt-6 pb-2 px-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-[150px] h-[150px] flex items-center justify-center">
              <canvas ref={canvasRef} className="absolute inset-0" />
              <h1
                className="text-2xl font-light tracking-wider text-white z-10 neon-text"
                style={{
                  textShadow:
                    "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4)",
                }}
              >
                WATER BAR
              </h1>
            </div>
          </div>
        </header>

        {/* Main content - Card Grid */}
        <main className="px-4 pb-24 flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hydration Plan Card */}
            <div className="md:col-span-2">
              <HydrationPlanCard plan={hydrationPlan} isLoading={isLoading.plan} error={error.plan} />
            </div>

            {/* Refill Log Card */}
            <RefillLogCard onLogBeverage={handleLogBeverage} />

            {/* Carbon Savings Card */}
            <CarbonSavingsCard carbonSavings={carbonSavings} isLoading={isLoading.carbon} error={error.carbon} />

            {/* Venue Suggestions Card */}
            <div className="md:col-span-2">
              <VenueSuggestionsCard venues={venues} isLoading={isLoading.venues} error={error.venues} />
            </div>

            {/* Nutrition/Electrolyte Card */}
            <div className="md:col-span-2">
              <NutritionCard nutrition={nutritionState} isLoading={isLoading.plan} error={error.plan} />
            </div>
          </div>
        </main>
      </div>

      {/* Persistent Mini-Chat */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        {/* Chat panel with expandable design */}
        <motion.div
          className="w-full rounded-t-2xl flex flex-col overflow-hidden relative"
          animate={{
            height: isChatOpen ? chatHeight : "70px",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderBottom: "none",
          }}
        >
          {/* Neon border effect */}
          <div
            className="absolute inset-0 rounded-t-2xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 15px rgba(0, 255, 255, 0.3), 0 0 15px rgba(0, 255, 255, 0.5)",
            }}
          />

          {/* Chat header - always visible */}
          <div
            className="p-3 flex justify-between items-center cursor-pointer"
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{
              borderBottom: isChatOpen ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
              background: "rgba(0, 170, 255, 0.1)",
            }}
          >
            <h3
              className="text-lg font-light"
              style={{
                color: "#00FFFF",
                textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
              }}
            >
              Hydration Assistant
            </h3>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ y: isChatOpen ? (chatHeight === "50vh" ? -2 : 2) : -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-white opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  if (isChatOpen) {
                    toggleChatSize()
                  } else {
                    setIsChatOpen(true)
                  }
                }}
              >
                {isChatOpen ? (
                  chatHeight === "50vh" ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )
                ) : (
                  <ChevronUp size={18} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Messages container - only visible when expanded */}
          {isChatOpen && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl relative ${
                        message.sender === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                      style={{
                        background:
                          message.sender === "user"
                            ? "linear-gradient(135deg, rgba(0, 255, 170, 0.4), rgba(0, 170, 255, 0.4))"
                            : "linear-gradient(135deg, rgba(0, 170, 255, 0.4), rgba(0, 255, 255, 0.4))",
                        backdropFilter: "blur(5px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow:
                          message.sender === "user"
                            ? "0 0 10px rgba(0, 255, 170, 0.3)"
                            : "0 0 10px rgba(0, 255, 255, 0.3)",
                      }}
                    >
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area - always visible */}
          <div
            className="p-3 flex items-center space-x-2"
            style={{
              borderTop: isChatOpen ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
              background: "rgba(0, 170, 255, 0.1)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your hydration..."
              className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/50 text-sm"
              style={{
                backdropFilter: "blur(5px)",
                boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
              }}
              onFocus={() => !isChatOpen && setIsChatOpen(true)}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceRecord}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRecording ? "bg-pink-500/50" : "bg-white/20"
              }`}
              style={{
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: isRecording ? "0 0 15px rgba(255, 154, 170, 0.5)" : "0 0 10px rgba(0, 255, 255, 0.2)",
              }}
            >
              <Mic
                size={18}
                className={isRecording ? "text-white animate-pulse" : "text-white"}
                style={{
                  filter: isRecording
                    ? "drop-shadow(0 0 5px rgba(255, 154, 170, 0.8))"
                    : "drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))",
                }}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#00FFAA] to-[#00AAFF]"
              style={{
                opacity: inputValue.trim() ? 1 : 0.5,
                boxShadow: "0 0 15px rgba(0, 255, 170, 0.3)",
              }}
            >
              <MessageSquare
                size={18}
                className="text-white"
                style={{
                  filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                }}
              />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
