"use client";

import { useMemo, useState } from "react";
import { Target, Award, ArrowDown, ArrowUp } from "lucide-react";
import type { YardageRow } from "@/lib/sg-hub/yardage-calc";
import {
  buildStrategy,
  makeBaselineLookup,
  type StrategyOption,
} from "@/lib/sg-hub/same-distance-strategy";
import { formatNumber } from "@/lib/sg-hub/format";

type Props = {
  rows: YardageRow[];
  baselines: { distanceBucket: string; expectedStrokes: number }[];
  initialTargetM?: number;
};

const MODE_LABEL: Record<StrategyOption["mode"], string> = {
  full: "Full",
  "three-quarter": "3/4",
  soft: "Soft",
};

export function StrategyCards({
  rows,
  baselines,
  initialTargetM = 150,
}: Props) {
  const [targetM, setTargetM] = useState(initialTargetM);
  const [tolerance, setTolerance] = useState(10);

  const lookup = useMemo(() => makeBaselineLookup(baselines), [baselines]);

  const options = useMemo(
    () => buildStrategy(rows, targetM, tolerance, lookup),
    [rows, targetM, tolerance, lookup],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Mål-distanse
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tabular-nums">
                {formatNumber(targetM, 0)}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                meter
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={280}
              step={5}
              value={targetM}
              onChange={(e) => setTargetM(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer accent-primary"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>20 m</span>
              <span>280 m</span>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Toleranse
            </p>
            <div className="mt-2 inline-flex rounded-full border border-border bg-card p-1">
              {[5, 10, 15].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTolerance(t)}
                  className={`rounded-full px-3 py-1 font-mono text-xs tabular-nums transition-colors ${
                    tolerance === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ±{t} m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Target className="mx-auto h-6 w-6 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Ingen køller innenfor ±{tolerance} m fra {formatNumber(targetM, 0)} m.
            Øk toleransen eller importér flere TrackMan-økter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((opt) => (
            <OptionCard key={`${opt.club}-${opt.mode}`} option={opt} />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionCard({ option }: { option: StrategyOption }) {
  const recommended = option.rank === 1;
  const distanceDelta = option.deltaFromTarget;

  return (
    <article
      className={`relative flex flex-col gap-4 rounded-xl border p-5 transition-shadow ${
        recommended
          ? "border-primary bg-card shadow-sm ring-1 ring-primary/20"
          : "border-border bg-card"
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
          <Award className="h-3 w-3" />
          Anbefalt
        </div>
      )}

      <header className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            #{option.rank}
          </p>
          <h4 className="font-mono text-2xl font-semibold leading-tight">
            {option.club}
          </h4>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {MODE_LABEL[option.mode]}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat
          label="Forventet"
          value={`${formatNumber(option.expectedDistance, 0)} m`}
        />
        <Stat
          label="Avvik"
          value={
            <span className="inline-flex items-center gap-1">
              {distanceDelta > 0 ? (
                <ArrowUp className="h-3 w-3 text-muted-foreground" />
              ) : distanceDelta < 0 ? (
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              ) : null}
              {formatNumber(Math.abs(distanceDelta), 1)} m
            </span>
          }
        />
        <Stat label="±1σ" value={`${formatNumber(option.sigma, 1)} m`} />
        <Stat label="Apex" value={`${option.apex} m`} />
      </div>

      {option.expectedStrokes != null && (
        <footer className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              PGA exp. strokes
            </span>
            <span className="font-mono text-sm tabular-nums">
              {formatNumber(option.expectedStrokes, 2)}
            </span>
          </div>
          {option.expectedSgVsBest != null && option.expectedSgVsBest !== 0 && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              SG vs #1: {option.expectedSgVsBest > 0 ? "+" : ""}
              {formatNumber(option.expectedSgVsBest, 2)}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-base tabular-nums">{value}</p>
    </div>
  );
}
