"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export type SessionVolumeWeek = {
  week: string; // "U18", "U19" etc
  FYS?: number;
  TEK?: number;
  SLAG?: number;
  SPILL?: number;
  TURN?: number;
};

type SessionVolumeChartProps = {
  weeks: SessionVolumeWeek[];
  unit?: string;
  title?: string;
  className?: string;
};

const COLORS = {
  FYS: "hsl(var(--success))",
  TEK: "hsl(var(--primary))",
  SLAG: "#003D2C",
  SPILL: "hsl(var(--warning))",
  TURN: "hsl(var(--accent))",
};

export function SessionVolumeChart({
  weeks,
  unit = "min",
  title = "Treningsvolum per uke",
  className,
}: SessionVolumeChartProps) {
  const total = weeks.reduce(
    (acc, w) => acc + (w.FYS ?? 0) + (w.TEK ?? 0) + (w.SLAG ?? 0) + (w.SPILL ?? 0) + (w.TURN ?? 0),
    0,
  );

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {total} {unit} totalt
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
              width={30}
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
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)", textTransform: "uppercase" }}
              iconType="square"
            />
            <Bar dataKey="FYS" stackId="a" fill={COLORS.FYS} />
            <Bar dataKey="TEK" stackId="a" fill={COLORS.TEK} />
            <Bar dataKey="SLAG" stackId="a" fill={COLORS.SLAG} />
            <Bar dataKey="SPILL" stackId="a" fill={COLORS.SPILL} />
            <Bar dataKey="TURN" stackId="a" fill={COLORS.TURN} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
