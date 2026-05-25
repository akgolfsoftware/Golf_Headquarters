"use client";

import { Clock, Sun } from "lucide-react";
import type { Session, Weather } from "@/lib/v2-fixtures";

export type LiveBarNowTime = {
  decimal: number;
  hh: number;
  mm: number;
  ss: number;
  label: string;
  labelShort: string;
};

export type LiveBarProps = {
  nowTime: LiveBarNowTime;
  sessions: Session[];
  weather: Weather;
  critical?: boolean;
  onClick?: () => void;
};

export default function LiveBar({
  nowTime,
  sessions,
  weather,
  critical = false,
  onClick,
}: LiveBarProps) {
  const next = sessions.find((s) => s.startH > nowTime.decimal);

  let nextLabel = "Ingen flere økter i dag";
  let minutesAway: number | null = null;

  if (next) {
    const diffH = next.startH - nowTime.decimal;
    minutesAway = Math.round(diffH * 60);
    const hh = Math.floor(minutesAway / 60);
    const mm = minutesAway % 60;
    const timeStr = hh > 0 ? `${hh}t ${mm}min` : `${mm}min`;
    nextLabel = `Neste · ${next.axis}-økt · om ${timeStr}`;
  }

  const displayLabel =
    critical && minutesAway !== null && minutesAway <= 30
      ? `Økt starter om ${minutesAway} min — klikk for detaljer`
      : nextLabel;

  return (
    <div
      onClick={critical ? onClick : undefined}
      className={[
        "flex items-center gap-4 px-6 py-[10px]",
        "font-mono text-[11px] font-semibold tracking-[0.06em] uppercase",
        "border-b border-border overflow-x-auto whitespace-nowrap",
        critical
          ? "bg-[color-mix(in_oklab,var(--destructive)_12%,var(--background))] text-destructive [animation:criticalPulse_1.6s_ease-in-out_infinite]"
          : "bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)] text-foreground",
        critical && onClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="live-dot"
          style={critical ? { background: "var(--destructive)" } : undefined}
        />
        <span>
          Nå{" "}
          <span className="tabular ml-1">{nowTime.labelShort}</span>
        </span>
      </span>

      <span
        className="opacity-40"
        aria-hidden
      >
        ·
      </span>

      <span className="inline-flex items-center gap-[6px]">
        <Clock size={12} />
        {displayLabel}
      </span>

      <span className="opacity-40" aria-hidden>
        ·
      </span>

      <span className="inline-flex items-center gap-[6px]">
        <Sun size={12} />
        {weather.club} {weather.tempC}°C {weather.summary} · {weather.wind}
      </span>
    </div>
  );
}
