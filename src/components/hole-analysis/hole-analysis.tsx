"use client";

import { useState } from "react";
import Image from "next/image";
import { Target, Wind, TrendingUp, Crosshair, Flag, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { FilterPillBar, type FilterPill } from "@/components/athletic/filter-pill-bar";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — interaktivt hull-kart på foto.
   Markører plassert på sonene (normaliserte %): Tee total = landingssone,
   Tee = utslagssted. Tap "Tee total" → enten spredning på fairway, eller
   SG + treningsdata for sonen.
   Overlay-koordinater: viewBox 100 bred × 179.3 høy (matcher foto-aspekt 781:1400).
   ───────────────────────────────────────────────────────────────────────── */

const ASPECT = 1400 / 781; // 1.792 — høyde / bredde
const VB_H = 100 * ASPECT; // 179.26

// Landingssone (stor sirkel i bildet) og tee (liten pille nederst), i %.
const LZ = { xPct: 50, yPct: 63 };
const TEE = { xPct: 49.5, yPct: 91 };

// Landingssone i overlay-koordinater.
const LZ_O = { x: LZ.xPct, y: (LZ.yPct / 100) * VB_H };
const TEE_O = { x: TEE.xPct, y: (TEE.yPct / 100) * VB_H };

// 95%-ellipse rundt landingssonen.
const ELL = { rx: 10.5, ry: 19 };

// Deterministisk spredning (seedet PRNG) — stabil mellom renders.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const DOTS = (() => {
  const rng = mulberry32(7);
  return Array.from({ length: 27 }, () => ({
    x: LZ_O.x + gauss(rng) * (ELL.rx / 2.4),
    y: LZ_O.y + gauss(rng) * (ELL.ry / 2.4),
  }));
})();

type Mode = "spredning" | "sg";
const modePills: FilterPill[] = [
  { key: "spredning", label: "Spredning" },
  { key: "sg", label: "SG + trening" },
];

const sgStats = [
  { label: "SG OTT", value: "+0,31", icon: TrendingUp, good: true },
  { label: "Snittlengde", value: "248 m", icon: Activity },
  { label: "Fairway", value: "64 %", icon: Target },
  { label: "Spredning", value: "±14 m", icon: Crosshair },
];

const zones = [
  { label: "Fairway", pct: 64, cls: "bg-success" },
  { label: "Rough", pct: 22, cls: "bg-warning" },
  { label: "Bunker", pct: 9, cls: "bg-pyr-slag" },
  { label: "Trær / OB", pct: 5, cls: "bg-destructive" },
];

export function HoleAnalysis() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("spredning");
  const showDispersion = open && mode === "spredning";

  return (
    <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card">
      {/* Foto */}
      <Image
        src="/images/akademy/hull-ovenfra.jpg"
        alt="Hull ovenfra — fairway"
        width={781}
        height={1400}
        priority
        className="block h-auto w-full select-none"
      />

      {/* Topp-eyebrow */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span className="rounded-full bg-coach-sidebar/70 px-2.5 py-1 backdrop-blur-sm">
          <AthleticEyebrow tone="light">Hull 4 · 392 m · par 4</AthleticEyebrow>
        </span>
      </div>

      {/* Vind-indikator */}
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-coach-sidebar/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white/90 backdrop-blur-sm">
        <Wind className="h-3 w-3" strokeWidth={1.5} />
        4 m/s · motvind
      </div>

      {/* ── SVG-overlay: siktelinje + spredning ── */}
      <svg
        viewBox={`0 0 100 ${VB_H.toFixed(2)}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* Siktelinje fra tee til landingssone (alltid synlig, dempet) */}
        <line
          x1={TEE_O.x}
          y1={TEE_O.y}
          x2={LZ_O.x}
          y2={LZ_O.y}
          stroke="hsl(var(--accent))"
          strokeWidth={0.5}
          strokeDasharray="2 2"
          opacity={showDispersion ? 0.9 : 0.4}
        />
        {showDispersion && (
          <>
            {/* 95%-ellipse */}
            <ellipse
              cx={LZ_O.x}
              cy={LZ_O.y}
              rx={ELL.rx}
              ry={ELL.ry}
              fill="hsl(var(--accent))"
              fillOpacity={0.18}
              stroke="hsl(var(--accent))"
              strokeWidth={0.6}
              strokeOpacity={0.8}
            />
            {/* Slag-prikker */}
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={0.9} fill="#fff" fillOpacity={0.9} stroke="hsl(var(--primary))" strokeWidth={0.2} />
            ))}
            {/* Senter-snitt */}
            <circle cx={LZ_O.x} cy={LZ_O.y} r={1.6} fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth={0.4} />
          </>
        )}
      </svg>

      {/* ── Tee-markør (utslagssted) ── */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${TEE.xPct}%`, top: `${TEE.yPct}%` }}
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-coach-sidebar/80 px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-white/90 backdrop-blur-sm">
          <Flag className="h-2.5 w-2.5 text-accent" strokeWidth={2} />Tee
        </span>
      </div>

      {/* ── Tee total-markør (landingssone) ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Åpne Tee total"
        className="group absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${LZ.xPct}%`, top: `${LZ.yPct}%` }}
      >
        {/* Mål-ring */}
        <span className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent/40 motion-safe:animate-ping" />
          <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent ring-2 ring-coach-sidebar" />
        </span>
        {/* Etikett-pille */}
        <span className="absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-2.5 py-1 shadow-card">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Tee total</span>
            <span className="font-mono text-[11px] font-bold tabular-nums text-foreground">+0,3</span>
          </span>
        </span>
      </button>

      {/* ── Drill-down bottom-sheet ── */}
      {open && (
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 shadow-deck">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <AthleticEyebrow>Tee total · landingssone</AthleticEyebrow>
              <h3 className="mt-0.5 font-display text-base font-bold tracking-tight text-foreground">
                28 slag · <em className="font-normal italic text-primary">driver</em>
              </h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Lukk" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <FilterPillBar pills={modePills} active={mode} onSelect={(k) => setMode(k as Mode)} className="mb-4" />

          {mode === "spredning" ? (
            <div className="space-y-2.5">
              <p className="text-xs leading-[1.5] text-muted-foreground">
                95 %-ellipsen ligger på fairway over. Sone-fordeling av de 28 slagene:
              </p>
              {zones.map((z) => (
                <div key={z.label} className="flex items-center gap-3">
                  <span className="w-20 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{z.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span className={cn("block h-full rounded-full", z.cls)} style={{ width: `${z.pct}%` }} />
                  </div>
                  <span className="w-9 text-right font-mono text-[11px] font-bold tabular-nums text-foreground">{z.pct} %</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {sgStats.map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-background px-2 py-2">
                    <div className="flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                      <s.icon className="h-2.5 w-2.5" strokeWidth={1.5} />{s.label}
                    </div>
                    <div className={cn("mt-1 font-mono text-base font-bold tabular-nums leading-none", s.good ? "text-success" : "text-foreground")}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                <div>
                  <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">Trening · driver · 30 d</div>
                  <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">8 økter · 142 slag</div>
                </div>
                <Sparkline values={[3, 4, 3, 5, 6, 5, 7, 8]} width={96} height={32} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
