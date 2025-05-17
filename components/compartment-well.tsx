"use client"

import { useEffect, useRef } from "react"

export default function CompartmentWell({ compartment, compartmentData, intensity, hormones }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const drawWell = () => {
      ctx.clearRect(0, 0, width, height)

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, "#03a1c9")
      bgGradient.addColorStop(1, "#c2e9fb")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Well color based on compartment
      let wellColor = "#00FFFF"
      let borderColor = "rgba(0, 255, 255, 0.3)"
      if (compartment === "IVF") {
        wellColor = "#00AAFF"
        borderColor = "rgba(0, 170, 255, 0.3)"
      } else if (compartment === "ICF") {
        wellColor = "#00FFAA"
        borderColor = "rgba(0, 255, 170, 0.3)"
      }

      // Draw the well
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.35

      // Pulsating glow effect
      ctx.shadowColor = wellColor
      ctx.shadowBlur = 20 * intensity

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = wellColor
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      // Draw border
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 8
      ctx.stroke()

      // Draw water level
      if (compartmentData) {
        const waterLevel = Math.min(1, compartmentData.H2O / 20) // Normalize water level
        const waterHeight = radius * waterLevel

        const waterGradient = ctx.createLinearGradient(0, centerY, 0, centerY + waterHeight)
        waterGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
        waterGradient.addColorStop(1, "rgba(255, 255, 255, 0.5)")

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fillStyle = waterGradient
        ctx.globalCompositeOperation = "source-atop" // Only fill within the circle
        ctx.fill()
        ctx.globalCompositeOperation = "source-over" // Reset composite operation
      }

      // Draw hormone effects
      if (hormones) {
        const aldosteroneEffect = hormones.Aldosterone || 0
        const adhEffect = hormones.ADH || 0

        // Example: Adjust glow intensity based on hormone levels
        ctx.shadowBlur += aldosteroneEffect * 2
        ctx.shadowBlur += adhEffect * 2
      }
    }

    drawWell()
  }, [compartment, compartmentData, intensity, hormones])

  return <canvas ref={canvasRef} width={400} height={400} />
}
