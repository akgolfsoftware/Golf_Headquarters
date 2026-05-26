"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export type HcpPoint = { date: string; hcp: number };

type HcpTrendProps = {
  points: HcpPoint[];
  goalHcp?: number;
  startHcp?: number;
  title?: string;
  className?: string;
};

export function HcpTrend({
  points,
  goalHcp,
  startHcp,
  title = "HCP-utvikling",
  className,
}: HcpTrendProps) {
  const latest = points[points.length - 1]?.hcp;
  const first = points[0]?.hcp;
  const delta = latest != null && first != null ? latest - first : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <div className="flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <span>
            Nå <b className="text-lg font-bold text-primary">{latest?.toFixed(1) ?? "—"}</b>
          </span>
          {goalHcp != null && (
            <span>
              Mål <b className="text-lg font-bold text-foreground">{goalHcp.toFixed(1)}</b>
            </span>
          )}
          <span
            className={cn(
              delta <= 0 ? "text-primary" : "text-destructive",
            )}
          >
            <b>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</b>
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hcpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              reversed
              tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
              width={30}
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "var(--font-jetbrains-mono)",
              }}
              formatter={(v) => (typeof v === "number" ? v.toFixed(1) : String(v))}
            />
            <Area
              type="monotone"
              dataKey="hcp"
              stroke="#005840"
              strokeWidth={2}
              fill="url(#hcpFill)"
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 5, fill: "hsl(var(--accent))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {(startHcp != null || goalHcp != null) && (
        <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {startHcp != null && <span>Start: {startHcp.toFixed(1)}</span>}
          {goalHcp != null && <span>Mål: {goalHcp.toFixed(1)}</span>}
        </div>
      )}
    </div>
  );
}
