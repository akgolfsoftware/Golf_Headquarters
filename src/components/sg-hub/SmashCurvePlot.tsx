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
import type { SmashCurveResult } from "@/lib/sg-hub/smash-curve";

type Props = {
  result: SmashCurveResult;
  advanced?: boolean;
};

export function SmashCurvePlot({ result, advanced = false }: Props) {
  const hasData = result.points.length > 0;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={advanced ? 280 : 220}>
        <ComposedChart margin={{ top: 16, right: 16, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="clubSpeed"
            name="Club Speed"
            domain={["auto", "auto"]}
            label={{ value: "Club Speed (mph)", position: "insideBottom", offset: -10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="number"
            dataKey="smashFactor"
            name="Smash Factor"
            domain={["auto", "auto"]}
            label={{ value: "Smash Factor", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as { clubSpeed: number; smashFactor: number };
              return (
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-xs shadow-md">
                  <p className="text-muted-foreground">Speed: {d.clubSpeed} mph</p>
                  <p className="font-semibold">Smash: {d.smashFactor}</p>
                </div>
              );
            }}
          />
          {result.optimumSpeed > 0 && (
            <ReferenceLine
              x={result.optimumSpeed}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 2"
              label={{
                value: `Opt: ${result.optimumSpeed} mph`,
                position: "top",
                fontSize: 10,
                fill: "hsl(var(--primary))",
              }}
            />
          )}
          {hasData && (
            <Scatter
              name="Slag"
              data={result.points}
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.5}
              r={4}
            />
          )}
          {result.curvePoints.length > 0 && (
            <Line
              data={result.curvePoints}
              type="monotone"
              dataKey="smashFactor"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
