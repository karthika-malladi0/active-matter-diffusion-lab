"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import SimulationCanvas from "@/components/simulation-canvas"
import ControlPanel from "@/components/control-panel"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import {
  createParticles,
  stepSimulation,
  type SimulationState,
  type SimulationParams,
} from "@/lib/physics-engine"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 560
const NUM_PARTICLES = 200
const DT = 0.15

interface HeatSpot {
  x: number
  y: number
  energy: number
  decay: number
}

export default function DiffusionLab() {
  const [temperature, setTemperature] = useState(1.0)
  const [viscosity, setViscosity] = useState(5.0)
  const [trackedParticleId, setTrackedParticleId] = useState<number | null>(null)
  const [renderTick, setRenderTick] = useState(0)

  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const heatSpotsRef = useRef<HeatSpot[]>([])
  const stateRef = useRef<SimulationState | null>(null)
  const paramsRef = useRef<SimulationParams>({
    temperature,
    viscosity,
    dt: DT,
    numParticles: NUM_PARTICLES,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
  })
  const trackedIdRef = useRef<number | null>(null)
  const animFrameRef = useRef<number>(0)

  // Sync refs with state
  useEffect(() => {
    paramsRef.current.temperature = temperature
    paramsRef.current.viscosity = viscosity
  }, [temperature, viscosity])

  useEffect(() => {
    trackedIdRef.current = trackedParticleId
  }, [trackedParticleId])

  // Initialize simulation
  const initSimulation = useCallback(() => {
    const params = paramsRef.current
    const particles = createParticles(params)
    stateRef.current = {
      particles,
      time: 0,
      step: 0,
      msdHistory: [],
      velocityHistogram: [],
    }
    heatSpotsRef.current = []
    setTrackedParticleId(null)
    trackedIdRef.current = null
  }, [])

  // Animation loop
  useEffect(() => {
    initSimulation()

    let lastRender = 0
    const RENDER_INTERVAL = 1000 / 60 // Cap at 60fps render

    const loop = (timestamp: number) => {
      if (!stateRef.current) return

      // Step physics (multiple sub-steps for stability)
      const subSteps = 2
      for (let i = 0; i < subSteps; i++) {
        // Decay heat spots
        heatSpotsRef.current = heatSpotsRef.current
          .map((s) => ({ ...s, energy: s.energy * s.decay }))
          .filter((s) => s.energy > 0.05)

        stateRef.current = stepSimulation(
          stateRef.current,
          paramsRef.current,
          mousePosRef.current,
          heatSpotsRef.current,
          trackedIdRef.current
        )
      }

      // Throttle React re-renders
      if (timestamp - lastRender >= RENDER_INTERVAL) {
        lastRender = timestamp
        setRenderTick((t) => t + 1)
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [initSimulation])

  const handleMouseMove = useCallback((pos: { x: number; y: number } | null) => {
    mousePosRef.current = pos
  }, [])

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current = null
  }, [])

  const handleParticleClick = useCallback((id: number | null) => {
    setTrackedParticleId(id)
    trackedIdRef.current = id
  }, [])

  const handleHeatDrop = useCallback(() => {
    // Drop heat at center or random position
    const x = CANVAS_WIDTH * (0.3 + Math.random() * 0.4)
    const y = CANVAS_HEIGHT * (0.3 + Math.random() * 0.4)
    heatSpotsRef.current.push({
      x,
      y,
      energy: 8 + Math.random() * 4,
      decay: 0.995,
    })
  }, [])

  const handleReset = useCallback(() => {
    initSimulation()
  }, [initSimulation])

  const state = stateRef.current

  // Suppress unused warning - renderTick forces re-render
  void renderTick

  return (
    <main className="min-h-screen bg-background text-foreground p-3 md:p-4 lg:p-5">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4">
        {/* Left: Controls */}
        <aside className="lg:w-56 shrink-0 bg-card rounded-lg border border-border p-4">
          <ControlPanel
            temperature={temperature}
            viscosity={viscosity}
            isTracing={trackedParticleId !== null}
            particleCount={NUM_PARTICLES}
            simTime={state?.time ?? 0}
            onTemperatureChange={setTemperature}
            onViscosityChange={setViscosity}
            onHeatDrop={handleHeatDrop}
            onReset={handleReset}
          />
        </aside>

        {/* Center: Canvas */}
        <section className="flex-1 min-w-0">
          <div className="bg-card rounded-lg border border-border p-2">
            <SimulationCanvas
              particles={state?.particles ?? []}
              mousePos={mousePosRef.current}
              heatSpots={heatSpotsRef.current}
              trackedParticleId={trackedParticleId}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onParticleClick={handleParticleClick}
              canvasWidth={CANVAS_WIDTH}
              canvasHeight={CANVAS_HEIGHT}
            />
          </div>
          {/* Subtle instruction */}
          <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
            Move cursor to repel particles. Click a particle to trace its random walk.
          </p>
        </section>

        {/* Right: Analytics */}
        <aside className="lg:w-64 shrink-0 bg-card rounded-lg border border-border p-4">
          <AnalyticsDashboard
            msdHistory={state?.msdHistory ?? []}
            velocityHistogram={state?.velocityHistogram ?? []}
            temperature={temperature}
            particleCount={NUM_PARTICLES}
          />
        </aside>
      </div>
    </main>
  )
}
