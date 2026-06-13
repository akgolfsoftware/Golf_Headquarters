"use client";

/**
 * StatChart — gjenbrukbar kartkomponent for Analytics Workbench.
 * Støtter bar, line og pie via Recharts.
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type StatChartType = "bar" | "line" | "pie";

export type StatChartDataPoint = {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
};

export type StatChartProps = {
  type: StatChartType;
  data: StatChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  valueFormatter?: (v: number) => string;
};

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function StatChart({
  type,
  data,
  title,
  subtitle,
  height = 260,
  colors = DEFAULT_COLORS,
  showLegend = true,
  valueFormatter = (v) => String(v),
}: StatChartProps) {
  const colorFor = (i: number) => data[i]?.color ?? colors[i % colors.length];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{title}</div>}
          {subtitle && <div className="text-[12px] text-muted-foreground">{subtitle}</div>}
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [valueFormatter(typeof value === "number" ? value : 0), ""]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={colorFor(i)} />
                ))}
              </Bar>
              {data[0]?.secondaryValue !== undefined && (
                <Bar dataKey="secondaryValue" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => (
                    <Cell key={`cell2-${i}`} fill={colorFor(i + 1)} />
                  ))}
                </Bar>
              )}
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [valueFormatter(typeof value === "number" ? value : 0), ""]}
              />
              <Line type="monotone" dataKey="value" stroke={colorFor(0)} strokeWidth={2} dot={{ r: 3, fill: colorFor(0) }} />
              {data[0]?.secondaryValue !== undefined && (
                <Line type="monotone" dataKey="secondaryValue" stroke={colorFor(1)} strokeWidth={2} dot={{ r: 3, fill: colorFor(1) }} />
              )}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={colorFor(i)} />
                ))}
              </Pie>
              {showLegend && <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />}
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, _name, props) => [
                  valueFormatter(typeof value === "number" ? value : 0),
                  (props as { payload?: { label?: string } })?.payload?.label ?? "",
                ]}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
