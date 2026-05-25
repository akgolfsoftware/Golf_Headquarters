"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Row = {
  kategori: string;
  du: number;
  ref: number;
};

export function SgResultatView({
  data,
  duLabel,
  refLabel,
}: {
  data: Row[];
  duLabel: string;
  refLabel: string;
}) {
  // Shift med +5 så alle verdier blir positive på radar
  const SHIFT = 5;
  const normalized = data.map((d) => ({
    kategori: d.kategori,
    du: d.du + SHIFT,
    ref: d.ref + SHIFT,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={normalized} outerRadius="80%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="kategori"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Radar
            name={duLabel}
            dataKey="du"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Radar
            name={refLabel}
            dataKey="ref"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-primary" /> {duLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-accent" /> {refLabel}
        </span>
      </div>
    </div>
  );
}
