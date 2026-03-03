"use client"

import { Slider } from "@/components/ui/slider"
import {
  Flame,
  RotateCcw,
  Thermometer,
  Droplets,
  Info,
  Route,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ControlPanelProps {
  temperature: number
  viscosity: number
  isTracing: boolean
  particleCount: number
  simTime: number
  onTemperatureChange: (val: number) => void
  onViscosityChange: (val: number) => void
  onHeatDrop: () => void
  onReset: () => void
}

export default function ControlPanel({
  temperature,
  viscosity,
  isTracing,
  particleCount,
  simTime,
  onTemperatureChange,
  onViscosityChange,
  onHeatDrop,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold tracking-wider uppercase text-foreground font-mono">
          Diffusion Lab
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-72 bg-card text-card-foreground border-border"
            >
              <p className="text-xs leading-relaxed font-mono">
                {"Langevin SDE: m dv = -\u03B3v dt + F dt + \u221A(2\u03B3k\u2099T) dW(t)"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Euler-Maruyama integration. Click a particle to trace its random walk.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {"N="}{particleCount}
        </span>
        <span className="text-border">|</span>
        <span>{"t="}{simTime.toFixed(1)}</span>
        {isTracing && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1 text-chart-5">
              <Route className="w-3 h-3" />
              Tracing
            </span>
          </>
        )}
      </div>

      {/* Temperature slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase tracking-wide">
            <Thermometer className="w-3.5 h-3.5 text-primary" />
            Temperature
          </label>
          <span className="text-xs font-mono text-foreground tabular-nums">
            {temperature.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={(val) => onTemperatureChange(val[0])}
          min={0.01}
          max={5}
          step={0.01}
          className="[&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-track]]:bg-secondary [&_[data-slot=slider-range]]:bg-primary"
        />
      </div>

      {/* Viscosity slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase tracking-wide">
            <Droplets className="w-3.5 h-3.5 text-chart-3" />
            Viscosity
          </label>
          <span className="text-xs font-mono text-foreground tabular-nums">
            {viscosity.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[viscosity]}
          onValueChange={(val) => onViscosityChange(val[0])}
          min={0.5}
          max={20}
          step={0.1}
          className="[&_[data-slot=slider-thumb]]:border-chart-3 [&_[data-slot=slider-thumb]]:bg-chart-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-track]]:bg-secondary [&_[data-slot=slider-range]]:bg-chart-3"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={onHeatDrop}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all text-xs font-mono uppercase tracking-wide"
        >
          <Flame className="w-3.5 h-3.5" />
          Heat Drop
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border hover:bg-border transition-all text-xs font-mono uppercase tracking-wide"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset System
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
          Legend
        </span>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Cool particles
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-accent" />
          Hot particles
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-chart-5" />
          Traced path
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full border border-primary/40 bg-transparent" />
          Mouse repulsion field
        </div>
      </div>
    </div>
  )
}
