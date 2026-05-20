"use client";

/**
 * Test-detalj · trend-graf + tabell + coach-notater
 *
 * Trend-grafen tegnes som SVG fra Prismas TestResult-historikk. Punktet
 * for "denne testen" markeres med en avvikende ring slik at coach raskt
 * ser hvor i forløpet han er.
 */
import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";

export type TestPoint = {
  id: string;
  iso: string;
  date: string;
  score: number;
  scoreLabel: string;
  notes: string | null;
  isCurrent: boolean;
};

type Props = {
  points: TestPoint[];
  currentIso: string;
  benchmark: { snitt: number; elite: number; enhet: string };
  coachNotes: string | null;
};

export function TestDetailClient({
  points,
  benchmark,
  coachNotes,
}: Props) {
  const [redigerer, setRedigerer] = useState(false);
  const [notater, setNotater] = useState(coachNotes ?? "");

  return (
    <div className="space-y-6">
      {/* Trend-chart */}
      <TrendChart points={points} benchmark={benchmark} />

      {/* Benchmark-skala */}
      <BenchmarkScale points={points} benchmark={benchmark} />

      {/* Historikk-tabell */}
      <Historikk points={points} />

      {/* Coach-notater */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              Coach-notater
            </h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Privat — kun synlig for coach-teamet
            </p>
          </div>
          {!redigerer ? (
            <button
              type="button"
              onClick={() => setRedigerer(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Pencil size={12} strokeWidth={1.75} />
              Rediger
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRedigerer(false);
                  setNotater(coachNotes ?? "");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={12} strokeWidth={1.75} />
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => setRedigerer(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Save size={12} strokeWidth={1.75} />
                Lagre
              </button>
            </div>
          )}
        </header>
        <div className="p-4">
          {redigerer ? (
            <textarea
              value={notater}
              onChange={(e) => setNotater(e.target.value)}
              rows={4}
              placeholder="Skriv en kort observasjon — fokus-områder, protokoll-avvik, neste steg…"
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {coachNotes ?? "Ingen notater registrert ennå."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// --------- Trend-chart ---------

function TrendChart({
  points,
  benchmark,
}: {
  points: TestPoint[];
  benchmark: { snitt: number; elite: number };
}) {
  if (points.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
          Ingen historikk å plotte
        </p>
      </section>
    );
  }

  const w = 760;
  const h = 240;
  const padL = 36;
  const padR = 24;
  const padT = 20;
  const padB = 30;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const allScores = points.map((p) => p.score);
  const min = Math.min(...allScores, benchmark.snitt) * 0.95;
  const max = Math.max(...allScores, benchmark.elite) * 1.05;
  const range = max - min || 1;

  const toX = (i: number) =>
    padL + (i / Math.max(1, points.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - min) / range) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.score).toFixed(1)}`)
    .join(" ");

  const eliteY = toY(benchmark.elite);
  const snittY = toY(benchmark.snitt);

  // Y-ticks
  const ticks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Trend · {points.length} målinger
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Mørk linje = spiller · stiplet = kategori-snitt + elite
          </p>
        </div>
        <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-primary" />
            Måling
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dashed border-muted-foreground" />
            Snitt / elite
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent ring-2 ring-primary" />
            Denne testen
          </span>
        </div>
      </header>

      <div className="bg-gradient-to-b from-secondary/10 to-card p-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="block w-full"
          style={{ maxHeight: 320 }}
          aria-label="Trend-graf"
        >
          {/* Y-tick-linjer */}
          {ticks.map((t, i) => {
            const y = toY(t);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border"
                  opacity="0.5"
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground"
                  fontFamily="JetBrains Mono"
                  fontSize="9"
                >
                  {t.toFixed(1).replace(".", ",").replace(/,0$/, "")}
                </text>
              </g>
            );
          })}

          {/* Elite-linje */}
          <line
            x1={padL}
            y1={eliteY}
            x2={w - padR}
            y2={eliteY}
            stroke="currentColor"
            strokeDasharray="4 4"
            strokeWidth="1.25"
            className="text-primary/40"
          />
          <text
            x={w - padR}
            y={eliteY - 4}
            textAnchor="end"
            className="fill-primary"
            fontFamily="JetBrains Mono"
            fontSize="9"
            fontWeight="700"
            opacity="0.7"
          >
            ELITE
          </text>

          {/* Snitt-linje */}
          <line
            x1={padL}
            y1={snittY}
            x2={w - padR}
            y2={snittY}
            stroke="currentColor"
            strokeDasharray="3 5"
            strokeWidth="1"
            className="text-muted-foreground"
            opacity="0.5"
          />
          <text
            x={w - padR}
            y={snittY - 4}
            textAnchor="end"
            className="fill-muted-foreground"
            fontFamily="JetBrains Mono"
            fontSize="9"
            fontWeight="700"
          >
            SNITT
          </text>

          {/* Trendlinje */}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          {/* Punkter */}
          {points.map((p, i) => {
            const x = toX(i);
            const y = toY(p.score);
            if (p.isCurrent) {
              return (
                <g key={p.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    className="fill-accent"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </g>
              );
            }
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r="3.5"
                className="fill-card"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity={0.9}
              />
            );
          })}
        </svg>

        {/* X-akse */}
        <div className="ml-[36px] mr-[24px] mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
          {points.length > 8
            ? points
                .filter((_, i) => i % Math.ceil(points.length / 6) === 0)
                .map((p) => <span key={p.id}>{p.date.slice(3, 8)}</span>)
            : points.map((p) => <span key={p.id}>{p.date.slice(3, 8)}</span>)}
        </div>
      </div>
    </section>
  );
}

// --------- Benchmark-skala ---------

function BenchmarkScale({
  points,
  benchmark,
}: {
  points: TestPoint[];
  benchmark: { snitt: number; elite: number };
}) {
  const current = points.find((p) => p.isCurrent) ?? points[points.length - 1];
  if (!current) return null;

  const minScale = Math.min(benchmark.snitt * 0.6, current.score * 0.8);
  const maxScale = Math.max(benchmark.elite * 1.15, current.score * 1.15);
  const range = maxScale - minScale || 1;
  const pct = (v: number) => ((v - minScale) / range) * 100;

  const overElite = current.score >= benchmark.elite;
  const overSnitt = current.score >= benchmark.snitt;

  return (
    <section className="grid gap-6 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/5 to-card p-4 sm:p-6 sm:grid-cols-[1fr_1.4fr] sm:items-center">
      <div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
          Benchmark · kategori-elite
        </span>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
          {overElite
            ? "På elite-nivå"
            : overSnitt
              ? "Over gjennomsnittet"
              : "Under gjennomsnittet"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Spiller ligger på <strong className="text-foreground">{current.scoreLabel}</strong>.
          Snitt for kategori er <strong className="text-foreground">{benchmark.snitt.toFixed(1).replace(".", ",")}</strong>,
          elite ligger på <strong className="text-foreground">{benchmark.elite.toFixed(1).replace(".", ",")}</strong>.
        </p>
      </div>

      <div className="relative pb-12 pt-8">
        <div className="relative h-2 rounded-full bg-gradient-to-r from-destructive/30 via-accent/60 to-primary">
          <Pin
            value={benchmark.snitt}
            label="Snitt"
            pct={pct(benchmark.snitt)}
          />
          <Pin value={current.score} label="Spiller" pct={pct(current.score)} highlight />
          <Pin value={benchmark.elite} label="Elite" pct={pct(benchmark.elite)} />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          <span>{minScale.toFixed(0)}</span>
          <span>{maxScale.toFixed(0)}</span>
        </div>
      </div>
    </section>
  );
}

function Pin({
  value,
  label,
  pct,
  highlight,
}: {
  value: number;
  label: string;
  pct: number;
  highlight?: boolean;
}) {
  return (
    <div
      className="absolute -top-7 flex -translate-x-1/2 flex-col items-center gap-1"
      style={{ left: `${Math.max(0, Math.min(100, pct))}%` }}
    >
      <span
        className={`font-mono text-[12px] font-semibold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value.toFixed(1).replace(".", ",").replace(/,0$/, "")}
      </span>
      <span
        className={`font-mono text-[8px] font-semibold uppercase tracking-[0.10em] ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`absolute top-full mt-0.5 h-3 w-0.5 ${
          highlight ? "bg-primary" : "bg-muted-foreground/50"
        }`}
      />
    </div>
  );
}

// --------- Historikk ---------

function Historikk({ points }: { points: TestPoint[] }) {
  if (points.length === 0) return null;

  const reversed = [...points].reverse();

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Historikk · alle målinger
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {points.length} målinger
        </span>
      </header>
      <ul className="divide-y divide-border">
        {reversed.map((p, i) => {
          const forrige = reversed[i + 1];
          const delta = forrige ? p.score - forrige.score : null;
          return (
            <li
              key={p.id}
              className={`grid grid-cols-[110px_100px_100px_1fr] items-center gap-4 px-4 py-3 ${
                p.isCurrent ? "bg-accent/10" : ""
              }`}
            >
              <span className="font-mono text-[12px] tabular-nums text-foreground">
                {p.date}
              </span>
              <span className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
                {p.scoreLabel}
                {p.isCurrent && (
                  <span className="ml-2 inline-flex items-center rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-accent-foreground">
                    NÅ
                  </span>
                )}
              </span>
              <span
                className={`font-mono text-[12px] tabular-nums ${
                  delta == null
                    ? "text-muted-foreground"
                    : delta > 0
                      ? "text-primary"
                      : delta < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                }`}
              >
                {delta == null
                  ? "—"
                  : `${delta > 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",").replace(/,0$/, "")}`}
              </span>
              <span className="truncate text-[12px] text-muted-foreground">
                {p.notes ?? "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
