"use client";

/**
 * StatsBigRadar — 4-axis radar chart with two overlapping polygons.
 * Animated on mount. Forest fill for "you", lime dashed for "them".
 * Uses recharts RadarChart under the hood via a client component wrapper.
 */

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatsBigRadarProps {
  axes?: string[];
  you?: number[]; // normalized 0-1
  them?: number[]; // normalized 0-1
  youLabel?: string;
  themLabel?: string;
  youRaw?: number[]; // actual SG values for tooltip
  themRaw?: number[]; // actual SG values for tooltip
  size?: number;
}

type TooltipPayloadItem = {
  name: string;
  value: number;
  payload: {
    duRaw?: number;
    refRaw?: number;
  };
};

function RadarTooltip({
  active,
  payload,
  label,
  youLabel,
  themLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  youLabel: string;
  themLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const duRaw = payload[0]?.payload?.duRaw;
  const refRaw = payload[0]?.payload?.refRaw;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E3DD",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
        boxShadow: "0 2px 8px rgba(10,31,23,0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          letterSpacing: "0.08em",
          marginBottom: 6,
          color: "hsl(var(--foreground))",
        }}
      >
        {label}
      </div>
      <div style={{ color: "hsl(var(--primary))" }}>
        {youLabel}:{" "}
        {duRaw !== undefined
          ? (duRaw >= 0 ? "+" : "") + duRaw.toFixed(2)
          : "—"}
      </div>
      <div style={{ color: "#8A9940" }}>
        {themLabel}:{" "}
        {refRaw !== undefined
          ? (refRaw >= 0 ? "+" : "") + refRaw.toFixed(2)
          : "—"}
      </div>
    </div>
  );
}

export function StatsBigRadar({
  axes = ["OTT", "APP", "ARG", "PUTT"],
  you = [0.55, 0.38, 0.50, 0.45],
  them = [0.92, 0.95, 0.88, 0.85],
  youLabel = "Du",
  themLabel = "Rory McIlroy",
  youRaw,
  themRaw,
}: StatsBigRadarProps) {
  // Scale 0-1 to 0-100 for recharts
  const data = axes.map((a, i) => ({
    kategori: a,
    du: Math.round((you[i] ?? 0.5) * 100),
    ref: Math.round((them[i] ?? 0.5) * 100),
    duRaw: youRaw?.[i],
    refRaw: themRaw?.[i],
  }));

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="#E5E3DD" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="kategori"
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 13,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          />
          <Tooltip content={<RadarTooltip youLabel={youLabel} themLabel={themLabel} />} />
          <Radar
            name={youLabel}
            dataKey="du"
            stroke="#005840"
            fill="#005840"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Radar
            name={themLabel}
            dataKey="ref"
            stroke="#D1F843"
            fill="#D1F843"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="5 3"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
