"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export type SgTrendPoint = {
  date: string; // ISO eller dd.MM
  sgOtt?: number | null;
  sgApp?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
  sgTotal?: number | null;
};

type SgTrendLineProps = {
  points: SgTrendPoint[];
  showTotal?: boolean;
  title?: string;
  className?: string;
};

const COLORS = {
  sgOtt: "hsl(var(--primary))",
  sgApp: "hsl(var(--success))",
  sgArg: "hsl(var(--warning))",
  sgPutt: "hsl(var(--accent))",
  sgTotal: "hsl(var(--foreground))",
};

const LABELS = {
  sgOtt: "OTT",
  sgApp: "APP",
  sgArg: "ARG",
  sgPutt: "PUTT",
  sgTotal: "Total",
};

export function SgTrendLine({
  points,
  showTotal = true,
  title = "Strokes Gained — trend",
  className,
}: SgTrendLineProps) {
  const latest = points[points.length - 1] ?? {};
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.08em]">
          {(["sgOtt", "sgApp", "sgArg", "sgPutt"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[k] }} />
              {LABELS[k]}
              <b className="text-foreground">
                {latest[k] != null ? (latest[k]! > 0 ? "+" : "") + latest[k]!.toFixed(2) : "—"}
              </b>
            </span>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
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
            {showTotal && (
              <Line type="monotone" dataKey="sgTotal" stroke={COLORS.sgTotal} strokeWidth={2} dot={false} />
            )}
            <Line type="monotone" dataKey="sgOtt" stroke={COLORS.sgOtt} strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sgApp" stroke={COLORS.sgApp} strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sgArg" stroke={COLORS.sgArg} strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sgPutt" stroke={COLORS.sgPutt} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
