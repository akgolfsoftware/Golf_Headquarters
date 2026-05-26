"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, TrendingDown } from "lucide-react";
import type { FatigueResult } from "@/lib/sg-hub/fatigue";

type Props = {
  result: FatigueResult;
  advanced?: boolean;
};

const numberFmt = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function FatigueChart({ result, advanced = false }: Props) {
  const hasData = result.points.length > 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <Activity className="h-3 w-3" />
          {result.shotCount} slag
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Target {numberFmt.format(result.targetSpeed)} mph
        </span>
        {result.fatigueDetected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-destructive">
            <TrendingDown className="h-3 w-3" />
            Drop {numberFmt.format(result.dropPer10)} mph / 10 slag
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
            Stabil hastighet
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={advanced ? 300 : 220}>
        <ComposedChart
          data={result.points}
          margin={{ top: 16, right: 16, bottom: 24, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="shotNumber"
            name="Slag"
            domain={["dataMin", "dataMax"]}
            label={{
              value: "Slag nr.",
              position: "insideBottom",
              offset: -10,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="number"
            dataKey="clubSpeed"
            name="Club Speed"
            domain={["auto", "auto"]}
            label={{
              value: "Club Speed (mph)",
              angle: -90,
              position: "insideLeft",
              offset: 12,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as {
                shotNumber: number;
                clubSpeed: number;
                rolling: number;
              };
              return (
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-xs shadow-md">
                  <p className="font-semibold">Slag {d.shotNumber}</p>
                  <p className="text-muted-foreground">
                    Hastighet: {numberFmt.format(d.clubSpeed)} mph
                  </p>
                  <p className="text-muted-foreground">
                    Rullende snitt: {numberFmt.format(d.rolling)} mph
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={result.targetSpeed}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 2"
            label={{
              value: `Target ${numberFmt.format(result.targetSpeed)} mph`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "hsl(var(--primary))",
            }}
          />
          {result.inflectionShot !== null && (
            <ReferenceLine
              x={result.inflectionShot}
              stroke="hsl(var(--destructive))"
              strokeDasharray="2 4"
              label={{
                value: `Inflection · slag ${result.inflectionShot}`,
                position: "top",
                fontSize: 10,
                fill: "hsl(var(--destructive))",
              }}
            />
          )}
          {hasData && (
            <Scatter
              name="Slag"
              dataKey="clubSpeed"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.45}
              r={3}
            />
          )}
          {hasData && (
            <Line
              type="monotone"
              dataKey="rolling"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Rullende snitt"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
