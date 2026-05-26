"use client";

import { Activity, AlertTriangle } from "lucide-react";

import {
  computeTempo,
  TEMPO_OPTIMAL_RATIO,
  TEMPO_ZONE_COLORS,
  type TempoResult,
} from "@/lib/sg-hub/tempo";
import type { ShotData } from "@/lib/sg-hub/extract-shots";

type Props = {
  shots: ShotData[];
  advanced?: boolean;
};

// Vannrett ribbon der hvert slag fargelegges etter tempo-konsistens.
// Smash Factor vises som korrelert linje under.
export function TempoRibbon({ shots, advanced = false }: Props) {
  const result: TempoResult = computeTempo(shots);

  if (!result.hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Activity
          className="mx-auto mb-2 h-6 w-6 text-muted-foreground"
          strokeWidth={1.5}
        />
        <p className="text-sm font-semibold text-foreground">
          Ingen tempo-data tilgjengelig
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
          Aktiver tempo i TrackMan-eksport for å se denne analysen.
          HTML-rapporter inneholder ikke tempo — bruk CSV-eksport med kolonnene{" "}
          <span className="font-mono">Tempo</span>,{" "}
          <span className="font-mono">BackswingTime</span> eller{" "}
          <span className="font-mono">DownswingTime</span>.
        </p>
      </div>
    );
  }

  const { points, avgRatio, sigmaRatio, variancePct, consistencyPct } = result;
  const inconsistent = variancePct > 5;

  const smashMin = Math.min(...points.map((p) => p.smashFactor));
  const smashMax = Math.max(...points.map((p) => p.smashFactor));
  const smashRange = smashMax - smashMin || 0.1;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Tempo / Rhythm
          </p>
          <h4 className="mt-1 text-base font-semibold">
            Snitt-ratio{" "}
            <span className="font-mono tabular-nums">{avgRatio.toFixed(2)}</span>
            <span className="text-muted-foreground"> : 1</span>
          </h4>
          {!advanced && (
            <p className="mt-1 text-xs text-muted-foreground">
              Optimal ratio 3:1.{" "}
              {inconsistent
                ? "Tempo varierer mer enn anbefalt."
                : "Tempo er konsistent."}
            </p>
          )}
        </div>
        {inconsistent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-foreground">
            <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
            Varierende
          </span>
        )}
      </div>

      {/* Ribbon: ett segment per slag */}
      <div className="flex h-8 w-full overflow-hidden rounded-md">
        {points.map((p, i) => (
          <div
            key={i}
            className="h-full flex-1"
            style={{ backgroundColor: TEMPO_ZONE_COLORS[p.zone] }}
            title={`Slag ${p.shotNumber} — ratio ${p.ratio.toFixed(2)}:1, smash ${p.smashFactor.toFixed(2)}`}
          />
        ))}
      </div>

      {/* Smash Factor-linje under, korrelert med tempo-ribbon */}
      <div className="relative h-12 w-full">
        <svg
          viewBox={`0 0 ${points.length} 100`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            points={points
              .map((p, i) => {
                const y =
                  100 - ((p.smashFactor - smashMin) / smashRange) * 100;
                return `${i + 0.5},${y}`;
              })
              .join(" ")}
            className="text-foreground"
          />
        </svg>
        <p className="absolute left-0 top-0 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          Smash
        </p>
      </div>

      {advanced && (
        <dl className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
          <Stat label="Snitt-ratio" value={`${avgRatio.toFixed(2)}:1`} />
          <Stat
            label="Optimal"
            value={`${TEMPO_OPTIMAL_RATIO.toFixed(1)}:1`}
          />
          <Stat label="σ" value={sigmaRatio.toFixed(3)} />
          <Stat
            label="Variasjon"
            value={`${variancePct.toFixed(1)}%`}
            warn={inconsistent}
          />
          <Stat label="Konsistens" value={`${consistencyPct}%`} />
          <Stat label="Slag analysert" value={points.length.toString()} />
        </dl>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
          warn ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
