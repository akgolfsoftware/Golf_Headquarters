"use client";

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DPlanePoint, DPlaneResult } from "@/lib/sg-hub/d-plane";
import { DPLANE_COLORS, DPLANE_LABELS } from "@/lib/sg-hub/d-plane";

type Props = {
  result: DPlaneResult;
  advanced?: boolean;
};

const CLASSIFICATIONS = [
  "PULL_HOOK",
  "PULL_FADE",
  "PUSH_DRAW",
  "PUSH_FADE",
  "STRAIGHT",
] as const;

export function DPlanePlot({ result, advanced = false }: Props) {
  const byClass = new Map<string, DPlanePoint[]>();
  for (const cls of CLASSIFICATIONS) byClass.set(cls, []);
  for (const p of result.points) {
    byClass.get(p.classification)?.push(p);
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={advanced ? 300 : 220}>
        <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="faceAngle"
            name="Face Angle"
            domain={[-6, 6]}
            tickCount={7}
            label={{ value: "Face Angle (°)", position: "insideBottom", offset: -8, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="number"
            dataKey="clubPath"
            name="Club Path"
            domain={[-6, 6]}
            tickCount={7}
            label={{ value: "Club Path (°)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as DPlanePoint;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                  <p className="font-semibold">{DPLANE_LABELS[d.classification]}</p>
                  <p className="text-muted-foreground">Face: {d.faceAngle.toFixed(1)}°</p>
                  <p className="text-muted-foreground">Path: {d.clubPath.toFixed(1)}°</p>
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
          {CLASSIFICATIONS.map((cls) => {
            const pts = byClass.get(cls) ?? [];
            if (pts.length === 0) return null;
            return (
              <Scatter
                key={cls}
                name={DPLANE_LABELS[cls]}
                data={pts}
                fill={DPLANE_COLORS[cls]}
                fillOpacity={0.75}
                r={5}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
      {advanced && (
        <div className="mt-3 flex flex-wrap gap-3">
          {CLASSIFICATIONS.map((cls) => {
            const count = byClass.get(cls)?.length ?? 0;
            if (count === 0) return null;
            return (
              <div key={cls} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: DPLANE_COLORS[cls] }}
                />
                <span className="text-xs text-muted-foreground">
                  {DPLANE_LABELS[cls]} ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
