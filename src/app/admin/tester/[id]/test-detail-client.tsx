"use client";

/**
 * Test-detalj · trend-graf + nivå-stige + historikk + coach-notater.
 *
 * Nivå/benchmark vises KUN når testen har ekte referanse (test-benchmarks).
 * Tester uten (f.eks. FYS — formel ikke låst) viser rå score + egen progresjon,
 * aldri et fabrikkert nivå. «Din snitt»-linjen er spillerens egen historikk-snitt.
 */
import { useState, useTransition } from "react";
import { Pencil, Save, X } from "lucide-react";
import { lagreCoachNotat } from "./actions";

export type TestPoint = {
  id: string;
  iso: string;
  date: string;
  score: number;
  scoreLabel: string;
  notes: string | null;
  isCurrent: boolean;
};

/** Ekte referanse-nivå for en test (fra test-benchmarks). null = ingen referanse. */
export type BenchmarkView = {
  eliteValue: number;
  eliteLabel: string;
  achievedLabel: string | null;
  lowerBetter: boolean;
  unitSuffix: string;
  ladder: string;
};

type Props = {
  points: TestPoint[];
  currentIso: string;
  resultId: string;
  egetSnitt: number;
  benchmark: BenchmarkView | null;
  coachNotes: string | null;
};

function fmt(n: number): string {
  return n.toFixed(1).replace(".", ",").replace(/,0$/, "");
}

export function TestDetailClient({ points, resultId, egetSnitt, benchmark, coachNotes }: Props) {
  const [redigerer, setRedigerer] = useState(false);
  const [lagret, setLagret] = useState(coachNotes ?? "");
  const [notater, setNotater] = useState(coachNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const current = points.find((p) => p.isCurrent) ?? points[points.length - 1] ?? null;

  function lagreNotat() {
    setFeil(null);
    startTransition(async () => {
      const res = await lagreCoachNotat({ resultId, notes: notater });
      if (res.ok) {
        setLagret(notater.trim());
        setRedigerer(false);
      } else {
        setFeil(res.error ?? "Kunne ikke lagre notatet.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <TrendChart points={points} egetSnitt={egetSnitt} eliteValue={benchmark?.eliteValue} />

      {benchmark && current && <BenchmarkScale current={current} benchmark={benchmark} />}

      <Historikk points={points} />

      {/* Coach-notater */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">Coach-notater</h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Privat — kun synlig for coach-teamet
            </p>
          </div>
          {!redigerer ? (
            <button
              type="button"
              onClick={() => setRedigerer(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Pencil size={12} strokeWidth={1.75} />
              Rediger
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setRedigerer(false);
                  setNotater(lagret);
                  setFeil(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <X size={12} strokeWidth={1.75} />
                Avbryt
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={lagreNotat}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Save size={12} strokeWidth={1.75} />
                {pending ? "Lagrer…" : "Lagre"}
              </button>
            </div>
          )}
        </header>
        <div className="p-4">
          {redigerer ? (
            <textarea
              value={notater}
              onChange={(e) => setNotater(e.target.value.slice(0, 2000))}
              rows={4}
              placeholder="Skriv en kort observasjon — fokus-områder, protokoll-avvik, neste steg…"
              className="w-full resize-none rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground focus:border-primary"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {lagret ? lagret : "Ingen notater registrert ennå."}
            </p>
          )}
          {feil && <p className="mt-2 text-sm text-destructive">{feil}</p>}
        </div>
      </section>
    </div>
  );
}

// --------- Trend-chart ---------

function TrendChart({
  points,
  egetSnitt,
  eliteValue,
}: {
  points: TestPoint[];
  egetSnitt: number;
  eliteValue?: number;
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

  const refValues = [...points.map((p) => p.score), egetSnitt, ...(eliteValue != null ? [eliteValue] : [])];
  const min = Math.min(...refValues) * 0.95;
  const max = Math.max(...refValues) * 1.05;
  const range = max - min || 1;

  const toX = (i: number) => padL + (i / Math.max(1, points.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - min) / range) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.score).toFixed(1)}`)
    .join(" ");

  const snittY = toY(egetSnitt);
  const eliteY = eliteValue != null ? toY(eliteValue) : null;
  const ticks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-2">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Trend · {points.length} målinger
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Mørk linje = spiller · stiplet = din snitt{eliteValue != null ? " + referanse" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-primary" />
            Måling
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dashed border-muted-foreground" />
            {eliteValue != null ? "Snitt / referanse" : "Din snitt"}
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
          {ticks.map((t, i) => {
            const y = toY(t);
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-border" opacity="0.5" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontFamily="var(--font-jetbrains-mono)" fontSize="9">
                  {t.toFixed(1).replace(".", ",").replace(/,0$/, "")}
                </text>
              </g>
            );
          })}

          {eliteY != null && (
            <>
              <line x1={padL} y1={eliteY} x2={w - padR} y2={eliteY} stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.25" className="text-primary/40" />
              <text x={w - padR} y={eliteY - 4} textAnchor="end" className="fill-primary" fontFamily="var(--font-jetbrains-mono)" fontSize="9" fontWeight="700" opacity="0.7">
                REFERANSE
              </text>
            </>
          )}

          <line x1={padL} y1={snittY} x2={w - padR} y2={snittY} stroke="currentColor" strokeDasharray="3 5" strokeWidth="1" className="text-muted-foreground" opacity="0.5" />
          <text x={w - padR} y={snittY - 4} textAnchor="end" className="fill-muted-foreground" fontFamily="var(--font-jetbrains-mono)" fontSize="9" fontWeight="700">
            DIN SNITT
          </text>

          <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />

          {points.map((p, i) => {
            const x = toX(i);
            const y = toY(p.score);
            if (p.isCurrent) {
              return (
                <circle key={p.id} cx={x} cy={y} r="7" className="fill-accent" stroke="currentColor" strokeWidth="2.5" />
              );
            }
            return (
              <circle key={p.id} cx={x} cy={y} r="3.5" className="fill-card" stroke="currentColor" strokeWidth="2" strokeOpacity={0.9} />
            );
          })}
        </svg>

        <div className="ml-[36px] mr-[24px] mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
          {points.length > 8
            ? points.filter((_, i) => i % Math.ceil(points.length / 6) === 0).map((p) => <span key={p.id}>{p.date.slice(3, 8)}</span>)
            : points.map((p) => <span key={p.id}>{p.date.slice(3, 8)}</span>)}
        </div>
      </div>
    </section>
  );
}

// --------- Nivå-stige (kun med ekte referanse) ---------

function BenchmarkScale({ current, benchmark }: { current: TestPoint; benchmark: BenchmarkView }) {
  const ladderLinjer = benchmark.ladder.split("\n").filter(Boolean);
  return (
    <section className="grid gap-6 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/5 to-card p-4 sm:p-6 sm:grid-cols-[1fr_1.4fr] sm:items-start">
      <div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
          Nivå · referanse
        </span>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
          {benchmark.achievedLabel ? `På ${benchmark.achievedLabel}-nivå` : "Under laveste referansenivå"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Spiller ligger på <strong className="text-foreground">{current.scoreLabel}</strong>.
          Referanse-topp ({benchmark.eliteLabel}):{" "}
          <strong className="text-foreground">{fmt(benchmark.eliteValue)}{benchmark.unitSuffix}</strong>.
        </p>
      </div>

      <ul className="space-y-1">
        {ladderLinjer.map((linje) => {
          const aktiv = benchmark.achievedLabel != null && linje.startsWith(`${benchmark.achievedLabel}:`);
          return (
            <li
              key={linje}
              className={`flex items-baseline justify-between gap-3 rounded-md px-2.5 py-1.5 font-mono text-[12px] tabular-nums ${
                aktiv ? "bg-primary/10 text-foreground" : "text-muted-foreground"
              }`}
            >
              <span>{linje.split(":")[0]}</span>
              <span>{linje.split(":").slice(1).join(":").trim()}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// --------- Historikk ---------

function Historikk({ points }: { points: TestPoint[] }) {
  if (points.length === 0) return null;

  const reversed = [...points].reverse();

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-2">
        <h2 className="font-display text-base font-semibold tracking-tight">Historikk · alle målinger</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{points.length} målinger</span>
      </header>
      <ul className="divide-y divide-border">
        {reversed.map((p, i) => {
          const forrige = reversed[i + 1];
          const delta = forrige ? p.score - forrige.score : null;
          return (
            <li
              key={p.id}
              className={`grid grid-cols-[110px_100px_100px_1fr] items-center gap-4 px-4 py-2 ${p.isCurrent ? "bg-accent/10" : ""}`}
            >
              <span className="font-mono text-[12px] tabular-nums text-foreground">{p.date}</span>
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
                {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",").replace(/,0$/, "")}`}
              </span>
              <span className="truncate text-[12px] text-muted-foreground">{p.notes ?? "—"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
