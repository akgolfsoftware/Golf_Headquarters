"use client";

/**
 * Stall-heatmap — spillere × pyramide-områder, fargekodet etter hit-rate.
 * Pixel-perfekt PR4-implementasjon.
 */

import { useState } from "react";
import Link from "next/link";
import { Filter, Calendar, Users2 } from "lucide-react";

type Spiller = {
  id: string;
  name: string;
  hcp: number | null;
  avatarUrl: string | null;
};

type PyramideKol = {
  key: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  label: string;
  color: string;
};

const KOLONNER: PyramideKol[] = [
  { key: "FYS", label: "FYS", color: "hsl(var(--primary))" },
  { key: "TEK", label: "TEK", color: "hsl(var(--success))" },
  { key: "SLAG", label: "SLAG", color: "hsl(var(--accent))" },
  { key: "SPILL", label: "SPILL", color: "hsl(var(--warning))" },
  { key: "TURN", label: "TURN", color: "hsl(var(--muted-foreground))" },
];

// hit-rate 0..1 → bakgrunn + tekst-farge
function hitRateColor(rate: number): { bg: string; fg: string } {
  if (rate >= 0.85) return { bg: "hsl(var(--primary))", fg: "hsl(var(--accent))" };
  if (rate >= 0.70) return { bg: "hsl(var(--success))", fg: "#FFFFFF" };
  if (rate >= 0.55) return { bg: "rgba(209,248,67,0.45)", fg: "hsl(var(--foreground))" };
  if (rate >= 0.40) return { bg: "rgba(184,133,42,0.30)", fg: "hsl(var(--foreground))" };
  return { bg: "#F5E8E4", fg: "hsl(var(--destructive))" };
}

// Deterministisk hit-rate per (spiller × pyramide)
function pseudoHitRate(playerId: string, kol: string): number {
  let h = 0;
  const seed = playerId + kol;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 0.30 + ((h % 1000) / 1000) * 0.65;
}

export function StallHeatmap({ spillere }: { spillere: Spiller[] }) {
  const [cohort, setCohort] = useState<"alle" | "A1" | "A2" | "B1" | "B2">("alle");
  const [periode, setPeriode] = useState<"30d" | "90d" | "365d">("30d");
  const [miljo, setMiljo] = useState<"alle" | "indoor" | "bane">("alle");
  const [valgtCelle, setValgtCelle] = useState<{ spiller: Spiller; kol: PyramideKol; rate: number } | null>(null);

  return (
    <div className="space-y-6">
      {/* Filter-strip */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Filtre</span>
          </div>
          <FilterPills
            label="Cohort"
            value={cohort}
            options={[
              { key: "alle", label: "Alle" },
              { key: "A1", label: "A1" },
              { key: "A2", label: "A2" },
              { key: "B1", label: "B1" },
              { key: "B2", label: "B2" },
            ]}
            onChange={(v) => setCohort(v as typeof cohort)}
          />
          <FilterPills
            label="Periode"
            value={periode}
            options={[
              { key: "30d", label: "30d" },
              { key: "90d", label: "90d" },
              { key: "365d", label: "365d" },
            ]}
            onChange={(v) => setPeriode(v as typeof periode)}
          />
          <FilterPills
            label="Miljø"
            value={miljo}
            options={[
              { key: "alle", label: "Alle" },
              { key: "indoor", label: "Indoor" },
              { key: "bane", label: "Bane" },
            ]}
            onChange={(v) => setMiljo(v as typeof miljo)}
          />
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users2 size={12} /> {spillere.length} spillere</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Heatmap */}
        <div className="rounded-2xl border border-border bg-card p-6 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Stall-heatmap
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <Legend />
            </div>
          </div>
          <div className="grid min-w-[640px]" style={{ gridTemplateColumns: `200px repeat(${KOLONNER.length}, minmax(80px, 1fr))` }}>
            {/* Header-row */}
            <div className="sticky left-0 z-10 bg-card pb-2" />
            {KOLONNER.map((k) => (
              <div key={k.key} className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: k.color }} />
                  {k.label}
                </span>
              </div>
            ))}
            {/* Rader */}
            {spillere.map((s) => (
              <div key={s.id} className="contents">
                <div className="sticky left-0 z-10 flex items-center gap-3 border-t border-border bg-card py-3 pr-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono text-[10px] text-foreground">
                    {(s.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                    {s.hcp != null && (
                      <div className="font-mono text-[10px] text-muted-foreground">HCP {s.hcp.toFixed(1)}</div>
                    )}
                  </div>
                </div>
                {KOLONNER.map((k) => {
                  const rate = pseudoHitRate(s.id, k.key);
                  const c = hitRateColor(rate);
                  const aktiv = valgtCelle?.spiller.id === s.id && valgtCelle.kol.key === k.key;
                  return (
                    <button
                      key={`${s.id}-${k.key}`}
                      type="button"
                      onClick={() => setValgtCelle({ spiller: s, kol: k, rate })}
                      className={`border-t border-border py-3 text-center font-mono text-xs font-semibold transition ${aktiv ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                      style={{ background: c.bg, color: c.fg }}
                    >
                      {Math.round(rate * 100)}%
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Drill-down panel */}
        <aside className="rounded-2xl border border-border bg-card p-6">
          {valgtCelle ? (
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Drill-down · {valgtCelle.kol.label}
                </div>
                <div className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
                  {valgtCelle.spiller.name}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-primary">
                  {Math.round(valgtCelle.rate * 100)}%
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">hit-rate</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Topp 3 i kategori
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {spillere.slice(0, 3).map((p, i) => (
                    <li key={p.id} className="flex items-center justify-between gap-2">
                      <span className="text-foreground">{i + 1}. {p.name}</span>
                      <span className="font-mono text-xs text-primary">
                        {Math.round(pseudoHitRate(p.id, valgtCelle.kol.key) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/admin/analyse?studentId=${valgtCelle.spiller.id}&view=oversikt`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary"
              >
                Åpne spillerprofil
              </Link>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Calendar size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Klikk en celle for å se drill-down</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em]">spiller-snitt + topp 3 i kategori</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterPills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">{label}</span>
      <div className="inline-flex gap-1 rounded-full bg-secondary p-1">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              value === o.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const tiers = [
    { label: "≥85%", color: "hsl(var(--primary))", fg: "hsl(var(--accent))" },
    { label: "70-85", color: "hsl(var(--success))", fg: "#fff" },
    { label: "55-70", color: "rgba(209,248,67,0.45)", fg: "hsl(var(--foreground))" },
    { label: "40-55", color: "rgba(184,133,42,0.30)", fg: "hsl(var(--foreground))" },
    { label: "<40%", color: "#F5E8E4", fg: "hsl(var(--destructive))" },
  ];
  return (
    <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
      {tiers.map((t) => (
        <span
          key={t.label}
          className="rounded px-1.5 py-0.5"
          style={{ background: t.color, color: t.fg }}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}
