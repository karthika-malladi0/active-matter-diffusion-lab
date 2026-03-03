"use client"

import { useRef, useEffect, useCallback } from "react"
import type { Particle } from "@/lib/physics-engine"

interface HeatSpot {
  x: number
  y: number
  energy: number
  decay: number
}

interface SimulationCanvasProps {
  particles: Particle[]
  mousePos: { x: number; y: number } | null
  heatSpots: HeatSpot[]
  trackedParticleId: number | null
  onMouseMove: (pos: { x: number; y: number } | null) => void
  onMouseLeave: () => void
  onParticleClick: (id: number | null) => void
  canvasWidth: number
  canvasHeight: number
}

export default function SimulationCanvas({
  particles,
  mousePos,
  heatSpots,
  trackedParticleId,
  onMouseMove,
  onMouseLeave,
  onParticleClick,
  canvasWidth,
  canvasHeight,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const scaleX = canvasWidth / rect.width
      const scaleY = canvasHeight / rect.height
      onMouseMove({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      })
    },
    [onMouseMove, canvasWidth, canvasHeight]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const scaleX = canvasWidth / rect.width
      const scaleY = canvasHeight / rect.height
      const clickX = (e.clientX - rect.left) * scaleX
      const clickY = (e.clientY - rect.top) * scaleY

      let closestId: number | null = null
      let closestDist = 20 // click radius threshold

      for (const p of particles) {
        const dx = p.x - clickX
        const dy = p.y - clickY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < closestDist) {
          closestDist = dist
          closestId = p.id
        }
      }

      onParticleClick(closestId === trackedParticleId ? null : closestId)
    },
    [particles, onParticleClick, trackedParticleId, canvasWidth, canvasHeight]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear
    ctx.fillStyle = "#0a0c10"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw subtle grid
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)"
    ctx.lineWidth = 0.5
    const gridSize = 50
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // Draw heat spots
    for (const spot of heatSpots) {
      const gradient = ctx.createRadialGradient(
        spot.x,
        spot.y,
        0,
        spot.x,
        spot.y,
        120
      )
      const alpha = Math.min(spot.energy * 0.08, 0.35)
      gradient.addColorStop(0, `rgba(249, 115, 22, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(249, 115, 22, ${alpha * 0.4})`)
      gradient.addColorStop(1, "rgba(249, 115, 22, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(spot.x - 120, spot.y - 120, 240, 240)
    }

    // Draw mouse repulsion field
    if (mousePos) {
      const gradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        100
      )
      gradient.addColorStop(0, "rgba(6, 214, 160, 0.08)")
      gradient.addColorStop(0.6, "rgba(6, 214, 160, 0.03)")
      gradient.addColorStop(1, "rgba(6, 214, 160, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(mousePos.x, mousePos.y, 100, 0, Math.PI * 2)
      ctx.fill()

      // Ring
      ctx.strokeStyle = "rgba(6, 214, 160, 0.15)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(mousePos.x, mousePos.y, 100, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw tracked particle trail
    if (trackedParticleId !== null) {
      const tracked = particles.find((p) => p.id === trackedParticleId)
      if (tracked && tracked.trail.length > 1) {
        for (let i = 1; i < tracked.trail.length; i++) {
          const alpha = i / tracked.trail.length
          ctx.strokeStyle = `rgba(251, 113, 133, ${alpha * 0.9})`
          ctx.lineWidth = 1.5 * alpha + 0.5
          ctx.beginPath()
          ctx.moveTo(tracked.trail[i - 1].x, tracked.trail[i - 1].y)
          ctx.lineTo(tracked.trail[i].x, tracked.trail[i].y)
          ctx.stroke()
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      const isTracked = p.id === trackedParticleId

      if (isTracked) {
        // Glowing tracked particle
        ctx.shadowColor = "#fb7185"
        ctx.shadowBlur = 12
        ctx.fillStyle = "#fb7185"
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        // Speed-based color modulation
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const heatFactor = Math.min(speed / 6, 1)

        // Interpolate from teal to orange based on speed
        const r = Math.floor(6 + heatFactor * 243)
        const g = Math.floor(214 - heatFactor * 99)
        const b = Math.floor(160 - heatFactor * 138)

        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`
        ctx.shadowBlur = 4
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Border glow
    ctx.strokeStyle = "rgba(6, 214, 160, 0.15)"
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1)
  }, [particles, mousePos, heatSpots, trackedParticleId, canvasWidth, canvasHeight])

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="w-full h-auto rounded-lg cursor-crosshair"
      style={{ imageRendering: "auto" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    />
  )
}
