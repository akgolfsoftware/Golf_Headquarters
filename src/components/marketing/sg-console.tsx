"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Category = "OTT" | "APP" | "ARG" | "PUTT";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "OTT", label: "OTT" },
  { key: "APP", label: "APP" },
  { key: "ARG", label: "ARG" },
  { key: "PUTT", label: "PUTT" },
];

const BASE_DATA: Record<Category, { val: string; delta: string; pct: number; color: string }> = {
  OTT: { val: "+1.8", delta: "+0.4", pct: 78, color: "var(--accent)" },
  APP: { val: "-0.6", delta: "-0.2", pct: 32, color: "var(--destructive)" },
  ARG: { val: "+0.9", delta: "+1.1", pct: 61, color: "var(--accent)" },
  PUTT: { val: "+2.1", delta: "+0.7", pct: 85, color: "var(--accent)" },
};

export function SGConsole() {
  const [active, setActive] = useState<Category>("OTT");
  const data = BASE_DATA[active];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-6 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white/10">
            <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-accent">SG</span>
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
              LIVE · SG KONSOLL
            </div>
            <div className="text-xs text-white/40">Øyvind Rohjan · 2026-06-25</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          LIVE
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={cn(
              "font-mono rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition",
              active === c.key
                ? "bg-accent text-[#005840]"
                : "border border-white/15 text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Big number */}
      <div className="mb-1 flex items-baseline gap-2">
        <div className="font-mono text-[72px] font-semibold leading-none tracking-[-0.03em]">
          {data.val}
        </div>
        <div className="font-mono text-sm font-semibold" style={{ color: data.color }}>
          {data.delta}
        </div>
      </div>
      <div className="mb-5 text-sm text-white/60">Strokes gained over tour-snitt (18 hull)</div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
          <span>EFFEKTIVITET</span>
          <span>{data.pct}%</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${data.pct}%`,
              background: `linear-gradient(90deg, var(--accent), #B7E86B)`,
            }}
          />
          {/* zero line reference */}
          <div className="absolute left-1/2 top-[-2px] h-[calc(100%+4px)] w-px bg-white/25" />
        </div>
      </div>

      {/* Mini bars for all categories */}
      <div className="space-y-3">
        {CATEGORIES.map((c) => {
          const d = BASE_DATA[c.key];
          const isActive = c.key === active;
          return (
            <div key={c.key} className={cn("flex items-center gap-3", isActive && "opacity-100")}>
              <div className="w-9 font-mono text-[11px] font-semibold text-white/60">{c.key}</div>
              <div className="flex-1">
                <div className="relative h-[5px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                    style={{
                      width: `${d.pct}%`,
                      background: isActive ? "var(--accent)" : "rgba(209,248,67,0.55)",
                    }}
                  />
                </div>
              </div>
              <div className="w-11 text-right font-mono text-[12px] font-semibold tabular-nums text-white/80">
                {d.val}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 text-[10px] font-medium text-white/40">
        Basert på 14 runder siste 30 dager · oppdatert for 8 min siden
      </div>
    </div>
  );
}
