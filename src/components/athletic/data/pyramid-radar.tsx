"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export type RadarMetric = {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  current: number; // 0-100
  goal?: number; // 0-100
};

const LABELS: Record<RadarMetric["area"], string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

type PyramidRadarProps = {
  metrics: RadarMetric[];
  title?: string;
  className?: string;
};

export function PyramidRadar({
  metrics,
  title = "Pyramide-radar",
  className,
}: PyramidRadarProps) {
  const data = metrics.map((m) => ({
    area: LABELS[m.area],
    current: m.current,
    goal: m.goal ?? null,
  }));

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Nå
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Mål
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis
              dataKey="area"
              tick={{ fontSize: 11, fontFamily: "var(--font-inter-tight)", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }}
              axisLine={false}
            />
            <Radar
              dataKey="goal"
              stroke="#D1F843"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="#D1F843"
              fillOpacity={0.1}
            />
            <Radar
              dataKey="current"
              stroke="#005840"
              strokeWidth={2}
              fill="#005840"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
