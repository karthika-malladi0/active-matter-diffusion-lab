"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts"
import { getMaxwellBoltzmannTheory, MAX_VELOCITY, VELOCITY_BINS } from "@/lib/physics-engine"

interface AnalyticsDashboardProps {
  msdHistory: { time: number; msd: number }[]
  velocityHistogram: number[]
  temperature: number
  particleCount: number
}

export default function AnalyticsDashboard({
  msdHistory,
  velocityHistogram,
  temperature,
  particleCount,
}: AnalyticsDashboardProps) {
  const msdData = useMemo(() => {
    return msdHistory.map((d) => ({
      time: parseFloat(d.time.toFixed(1)),
      msd: parseFloat(d.msd.toFixed(1)),
    }))
  }, [msdHistory])

  const velocityData = useMemo(() => {
    const theory = getMaxwellBoltzmannTheory(temperature, VELOCITY_BINS)
    const dv = MAX_VELOCITY / VELOCITY_BINS
    const totalParticles = particleCount > 0 ? particleCount : 1

    return Array.from({ length: VELOCITY_BINS }, (_, i) => ({
      v: parseFloat(((i + 0.5) * dv).toFixed(2)),
      count: velocityHistogram[i] || 0,
      theory: parseFloat((theory[i] * totalParticles).toFixed(2)),
    }))
  }, [velocityHistogram, temperature, particleCount])

  // Compute current stats
  const currentMSD = msdHistory.length > 0 ? msdHistory[msdHistory.length - 1].msd : 0
  const avgSpeed = useMemo(() => {
    const dv = MAX_VELOCITY / VELOCITY_BINS
    let sum = 0
    let count = 0
    for (let i = 0; i < VELOCITY_BINS; i++) {
      sum += (velocityHistogram[i] || 0) * (i + 0.5) * dv
      count += velocityHistogram[i] || 0
    }
    return count > 0 ? sum / count : 0
  }, [velocityHistogram])

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary rounded-md px-3 py-2 border border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            MSD
          </span>
          <span className="text-sm font-mono text-foreground tabular-nums">
            {currentMSD.toFixed(1)}
          </span>
        </div>
        <div className="bg-secondary rounded-md px-3 py-2 border border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            {"<v>"}
          </span>
          <span className="text-sm font-mono text-foreground tabular-nums">
            {avgSpeed.toFixed(2)}
          </span>
        </div>
      </div>

      {/* MSD Chart */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {"Mean Squared Displacement \u27E8r\u00B2(t)\u27E9"}
        </span>
        <div className="bg-secondary/50 rounded-md border border-border p-2">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={msdData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.6)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={{ stroke: "#1e293b" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={{ stroke: "#1e293b" }}
              />
              <Line
                type="monotone"
                dataKey="msd"
                stroke="#06d6a0"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Velocity Distribution */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Velocity Distribution f(v)
        </span>
        <div className="bg-secondary/50 rounded-md border border-border p-2">
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.6)" />
              <XAxis
                dataKey="v"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={{ stroke: "#1e293b" }}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={{ stroke: "#1e293b" }}
              />
              <Bar
                dataKey="count"
                fill="#06d6a0"
                opacity={0.6}
                radius={[1, 1, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="theory"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-primary/60 inline-block" />
            Measured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-sm bg-accent inline-block" />
            Maxwell-Boltzmann
          </span>
        </div>
      </div>
    </div>
  )
}
