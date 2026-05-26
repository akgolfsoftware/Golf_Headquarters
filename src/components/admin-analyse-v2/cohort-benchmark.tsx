"use client";

/**
 * Cohort-benchmark — 5-akset radar vs PGA Top 40 + tabell + distribusjons-bars.
 */

import { useState } from "react";

type Cohort = "A1" | "A2" | "B1" | "B2";

const COHORTS: { key: Cohort; label: string; sub: string }[] = [
  { key: "A1", label: "A1 · Elite", sub: "HCP < 4" },
  { key: "A2", label: "A2 · Sub-elite", sub: "HCP 4-8" },
  { key: "B1", label: "B1 · Konkurranse", sub: "HCP 8-15" },
  { key: "B2", label: "B2 · Junior dev", sub: "HCP 15+" },
];

// PGA Top 40-benchmark per cohort
type BenchAkse = { key: string; label: string; cohort: number; pga: number; enhet: string };

const AKSER_PER_COHORT: Record<Cohort, BenchAkse[]> = {
  A1: [
    { key: "DRV", label: "Drv carry", cohort: 268, pga: 282, enhet: "m" },
    { key: "GIR", label: "GIR %", cohort: 64, pga: 71, enhet: "%" },
    { key: "SCRMB", label: "Scrambling", cohort: 58, pga: 63, enhet: "%" },
    { key: "PUTT", label: "Putts/runde", cohort: 30.2, pga: 29.1, enhet: "" },
    { key: "BBS", label: "Bird/runde", cohort: 3.4, pga: 4.1, enhet: "" },
  ],
  A2: [
    { key: "DRV", label: "Drv carry", cohort: 252, pga: 282, enhet: "m" },
    { key: "GIR", label: "GIR %", cohort: 56, pga: 71, enhet: "%" },
    { key: "SCRMB", label: "Scrambling", cohort: 52, pga: 63, enhet: "%" },
    { key: "PUTT", label: "Putts/runde", cohort: 31.4, pga: 29.1, enhet: "" },
    { key: "BBS", label: "Bird/runde", cohort: 2.6, pga: 4.1, enhet: "" },
  ],
  B1: [
    { key: "DRV", label: "Drv carry", cohort: 234, pga: 282, enhet: "m" },
    { key: "GIR", label: "GIR %", cohort: 44, pga: 71, enhet: "%" },
    { key: "SCRMB", label: "Scrambling", cohort: 42, pga: 63, enhet: "%" },
    { key: "PUTT", label: "Putts/runde", cohort: 33.1, pga: 29.1, enhet: "" },
    { key: "BBS", label: "Bird/runde", cohort: 1.8, pga: 4.1, enhet: "" },
  ],
  B2: [
    { key: "DRV", label: "Drv carry", cohort: 208, pga: 282, enhet: "m" },
    { key: "GIR", label: "GIR %", cohort: 30, pga: 71, enhet: "%" },
    { key: "SCRMB", label: "Scrambling", cohort: 32, pga: 63, enhet: "%" },
    { key: "PUTT", label: "Putts/runde", cohort: 35.6, pga: 29.1, enhet: "" },
    { key: "BBS", label: "Bird/runde", cohort: 1.1, pga: 4.1, enhet: "" },
  ],
};

// Distribusjon per metrikk (bins)
const DISTRIBUSJON: { metrikk: string; bins: number[]; label: string[] }[] = [
  { metrikk: "Drv carry (m)", bins: [2, 5, 12, 8, 3], label: ["200-220", "220-240", "240-260", "260-280", "280+"] },
  { metrikk: "GIR %", bins: [1, 4, 9, 11, 5], label: ["30-40", "40-50", "50-60", "60-70", "70+"] },
  { metrikk: "Putts/runde", bins: [3, 7, 12, 6, 2], label: ["<29", "29-30", "30-31", "31-32", "32+"] },
];

function BenchRadar({ akser }: { akser: BenchAkse[] }) {
  const N = 5;
  const cx = 150, cy = 150, R = 100;
  const angles = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

  // Normaliser hver akse til 0..1 (cohort/pga)
  function norm(a: BenchAkse, raw: number): number {
    // Antar PGA er "topp" — for putts er lavere bedre
    if (a.key === "PUTT") {
      const min = 28, max = 36;
      return 1 - Math.max(0, Math.min(1, (raw - min) / (max - min)));
    }
    return Math.max(0, Math.min(1, raw / a.pga));
  }

  function pointAt(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const rings = [0.25, 0.5, 0.75, 1].map((f) =>
    angles.map((a) => pointAt(a, R * f)).map((p) => `${p.x},${p.y}`).join(" ")
  );

  const pgaPts = akser.map((a, i) => pointAt(angles[i], norm(a, a.pga))).map((p) => `${p.x},${p.y}`).join(" ");
  const cohortPts = akser.map((a, i) => pointAt(angles[i], norm(a, a.cohort))).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 300 }} aria-label="Cohort vs PGA radar">
        {rings.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#E5E3DD" strokeWidth={1} />
        ))}
        {angles.map((a, i) => {
          const p = pointAt(a, R);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#EFEDE6" />;
        })}
        <polygon points={pgaPts} fill="rgba(184,133,42,0.18)" stroke="#B8852A" strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon points={cohortPts} fill="rgba(0,88,64,0.20)" stroke="#005840" strokeWidth={2} />
        {akser.map((a, i) => {
          const p = pointAt(angles[i], R + 18);
          return (
            <text
              key={a.key}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="#5E5C57"
              letterSpacing="0.08em"
              style={{ textTransform: "uppercase" }}
            >
              {a.key}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(var(--primary))" }} />
          Cohort
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(var(--warning))" }} />
          PGA Top 40
        </span>
      </div>
    </div>
  );
}

export function CohortBenchmark() {
  const [cohort, setCohort] = useState<Cohort>("A2");
  const akser = AKSER_PER_COHORT[cohort];

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      {/* Cohort-velger */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="font-display text-lg font-semibold tracking-tight">Cohort-benchmark vs PGA Top 40</div>
        <div className="ml-auto inline-flex gap-1 rounded-full bg-secondary p-1">
          {COHORTS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCohort(c.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                cohort === c.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-mono">{c.key}</span>
              <span className="ml-2 text-muted-foreground">{c.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <BenchRadar akser={akser} />

        {/* Per-metrikk tabell + distribusjon */}
        <div className="space-y-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Metrikk</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Cohort</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">PGA T40</th>
                <th className="py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Δ</th>
              </tr>
            </thead>
            <tbody>
              {akser.map((a) => {
                const diff = a.cohort - a.pga;
                const positiv = a.key === "PUTT" ? diff < 0 : diff > 0;
                return (
                  <tr key={a.key} className="border-b border-border last:border-b-0">
                    <td className="py-2.5">
                      <div className="font-medium text-foreground">{a.label}</div>
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-foreground">
                      {a.cohort}{a.enhet}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {a.pga}{a.enhet}
                    </td>
                    <td className={`py-2.5 text-right font-mono tabular-nums ${positiv ? "text-success" : "text-destructive"}`}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Distribusjons-bars */}
          <div className="mt-6 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Distribusjon i cohorten
            </div>
            {DISTRIBUSJON.map((d) => {
              const max = Math.max(...d.bins);
              return (
                <div key={d.metrikk}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{d.metrikk}</span>
                  </div>
                  <div className="flex h-8 items-end gap-1">
                    {d.bins.map((v, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm"
                          style={{
                            height: `${(v / max) * 100}%`,
                            background: "linear-gradient(180deg, #D1F843 0%, #005840 100%)",
                            minHeight: 4,
                          }}
                          title={`${v} spillere`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {d.label.map((l, i) => (
                      <div key={i} className="flex-1 text-center font-mono text-[9px] text-muted-foreground">
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
