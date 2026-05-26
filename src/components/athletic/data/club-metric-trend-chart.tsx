"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export type ClubTrendPoint = {
  weekStart: string;
  avgTotal?: number;
  avgSmash?: number;
  sigmaBall?: number;
};

type ClubMetricTrendChartProps = {
  club: string;
  points: ClubTrendPoint[];
  metric?: "avgTotal" | "avgSmash" | "sigmaBall";
  className?: string;
};

const METRIC_LABEL: Record<NonNullable<ClubMetricTrendChartProps["metric"]>, string> = {
  avgTotal: "Total carry (m)",
  avgSmash: "Smash factor",
  sigmaBall: "σ Ball (yards)",
};

export function ClubMetricTrendChart({
  club,
  points,
  metric = "avgTotal",
  className,
}: ClubMetricTrendChartProps) {
  const latest = points[points.length - 1]?.[metric];
  const first = points[0]?.[metric];
  const delta = typeof latest === "number" && typeof first === "number" ? latest - first : null;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{club}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {METRIC_LABEL[metric]}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold tabular-nums leading-none">
            {typeof latest === "number" ? latest.toFixed(metric === "avgSmash" ? 3 : 1) : "—"}
          </p>
          {delta !== null && (
            <p
              className={cn(
                "mt-0.5 font-mono text-[10px] font-semibold",
                delta > 0
                  ? metric === "sigmaBall"
                    ? "text-destructive"
                    : "text-primary"
                  : metric === "sigmaBall"
                    ? "text-primary"
                    : "text-destructive",
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(metric === "avgSmash" ? 3 : 1)} vs start
            </p>
          )}
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="weekStart"
              tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
              width={32}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#005840"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 5, fill: "hsl(var(--accent))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
