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
import type { DriftMetric, DriftTrendPoint } from "@/lib/sg-hub/drift-detection";

type Props = {
  club: string;
  metric: DriftMetric;
  trend: DriftTrendPoint[];
};

const METRIC_LABEL: Record<DriftMetric, string> = {
  clubPath: "Club Path",
  faceAngle: "Face Angle",
  totalDistance: "Total Distance",
};

const METRIC_UNIT: Record<DriftMetric, string> = {
  clubPath: "°",
  faceAngle: "°",
  totalDistance: "m",
};

const numberFmt = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

export function ClubTrendChart({ club, metric, trend }: Props) {
  const data = trend.map((p) => ({
    ...p,
    label: dateFmt.format(new Date(p.weekStart)),
  }));

  return (
    <div className="w-full space-y-2">
      <header className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {club} · {METRIC_LABEL[metric]} ({METRIC_UNIT[metric]})
        </p>
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {trend.length} uker
        </p>
      </header>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 16, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            width={40}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as DriftTrendPoint & {
                label: string;
              };
              return (
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-xs shadow-md">
                  <p className="font-semibold">{d.label}</p>
                  <p className="text-muted-foreground">
                    {METRIC_LABEL[metric]}: {numberFmt.format(d.value)}{" "}
                    {METRIC_UNIT[metric]}
                  </p>
                  <p className="text-muted-foreground">
                    {d.shotCount} slag denne uken
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
