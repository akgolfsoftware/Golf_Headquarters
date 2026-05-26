/**
 * WeekProgressCard — ukentlig progresjonsoversikt for Player Workbench.
 *
 * Viser pyramide-vekting (faktisk vs ideell) som horisontale progress-barer
 * med markering for over/under-fordeling, en tekstlig anbefaling, og en
 * ukens sammendrag-blokk med stats (økter, runder, drills, tester).
 *
 * Athletic editorial: store display-tall i stats, subtile dots på progress
 * barer, mer dramatisk pyramid-label-rad. 2-kolonne layout på desktop.
 *
 * Referanse: Sprint 1 Spor B (Player Workbench v2).
 */

import { CheckCircle2, ChevronDown, ChevronUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type PyramidFordeling = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

export type UkensStats = {
  okter: number;
  okter_timer: number;
  runder: number;
  drills: number;
  tester: number;
};

export type WeekProgressCardProps = {
  fordeling: {
    /** Faktisk fordeling siste 7 dager. Verdier 0–1 som summerer til 1 (eller 0 hvis ingen okter). */
    actual: PyramidFordeling;
    /** Ideell fordeling (mål). Verdier 0–1 som summerer til 1. */
    ideal: PyramidFordeling;
  };
  /** Tekstlig anbefaling fra `vurderPyramide()` i pyramid-weighting.ts. */
  anbefaling: string;
  ukens_stats: UkensStats;
  className?: string;
};

// ---------- Konstanter ----------

type Kategori = "fys" | "tek" | "slag" | "spill" | "turn";

const KATEGORIER: ReadonlyArray<{ key: Kategori; label: string; bg: string; text: string }> = [
  { key: "fys", label: "FYS", bg: "bg-primary", text: "text-primary" },
  { key: "tek", label: "TEK", bg: "bg-warning", text: "text-warning" },
  { key: "slag", label: "SLAG", bg: "bg-info", text: "text-info" },
  { key: "spill", label: "SPILL", bg: "bg-accent-foreground", text: "text-accent-foreground" },
  { key: "turn", label: "TURN", bg: "bg-destructive", text: "text-destructive" },
];

/** Terskel (i prosentpoeng) før vi markerer "over"/"under" mot ideal. */
const AVVIK_TERSKEL = 0.05;

// ---------- Hjelpere ----------

function tilProsent(verdi: number): number {
  return Math.round(verdi * 100);
}

function formatTimer(timer: number): string {
  if (timer === 0) return "0";
  if (Number.isInteger(timer)) return String(timer);
  return timer.toFixed(1);
}

// ---------- Sub-komponenter ----------

function PyramidBar({
  label,
  bg,
  text,
  actual,
  ideal,
}: {
  label: string;
  bg: string;
  text: string;
  actual: number;
  ideal: number;
}) {
  const aktualPct = tilProsent(actual);
  const idealPct = tilProsent(ideal);
  const avvik = actual - ideal;

  const erOver = avvik > AVVIK_TERSKEL;
  const erUnder = avvik < -AVVIK_TERSKEL;
  const erBalansert = !erOver && !erUnder;

  // Bar-bredde basert på faktisk, men minst 1% for visibilitet hvis verdi > 0.
  const barWidth = actual === 0 ? 0 : Math.max(aktualPct, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2.5">
          <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.12em]", text)}>
            {label}
          </span>
          <span className="font-display text-base font-bold tabular-nums text-foreground">
            {aktualPct}
            <span className="text-xs text-muted-foreground">%</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
          <span className="text-muted-foreground/70">mål {idealPct}%</span>
          {erOver && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-destructive">
              <ChevronUp className="size-3" strokeWidth={2.5} aria-hidden />
              <span className="font-bold uppercase tracking-wider">over</span>
            </span>
          )}
          {erUnder && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-warning">
              <ChevronDown className="size-3" strokeWidth={2.5} aria-hidden />
              <span className="font-bold uppercase tracking-wider">under</span>
            </span>
          )}
          {erBalansert && actual > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
              <Minus className="size-3" strokeWidth={2.5} aria-hidden />
              <span className="font-bold uppercase tracking-wider">ok</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", bg)}
          style={{ width: `${barWidth}%` }}
          aria-label={`${label}: ${aktualPct}% (mål ${idealPct}%)`}
        />
        {/* Ideal-markør som vertikal linje */}
        {idealPct > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/50"
            style={{ left: `${idealPct}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-background/50 p-4",
        highlight && "border-foreground/15 bg-foreground/[0.03]",
      )}
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold leading-none tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ---------- Hovedkomponent ----------

export function WeekProgressCard({
  fordeling,
  anbefaling,
  ukens_stats,
  className,
}: WeekProgressCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-6 sm:p-8",
        className,
      )}
      aria-labelledby="week-progress-heading"
    >
      {/* Header med eyebrow + uke-pill */}
      <div className="mb-6 flex items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ukas progresjon
          </p>
          <h2
            id="week-progress-heading"
            className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Pyramide-balanse + sammendrag
          </h2>
        </div>
        <span className="hidden rounded-full bg-foreground px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background sm:inline-block">
          Siste 7 dager
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-6">
        {/* Venstre: Pyramide-vekting — 3 kolonner */}
        <div className="space-y-6 md:col-span-3">
          <div className="space-y-4">
            {KATEGORIER.map((kat) => (
              <PyramidBar
                key={kat.key}
                label={kat.label}
                bg={kat.bg}
                text={kat.text}
                actual={fordeling.actual[kat.key]}
                ideal={fordeling.ideal[kat.key]}
              />
            ))}
          </div>

          {/* Anbefaling — editorial italic accent */}
          <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Anbefaling fra Caddie
            </p>
            <p className="mt-1.5 font-display text-[15px] font-medium italic leading-snug text-foreground">
              {anbefaling}
            </p>
          </div>
        </div>

        {/* Høyre: Ukens stats — 2 kolonner med store tall */}
        <div className="space-y-2 md:col-span-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sammendrag
          </p>

          <div className="grid grid-cols-2 gap-2">
            <StatBlock
              label="Økter"
              value={String(ukens_stats.okter)}
              unit={`/${formatTimer(ukens_stats.okter_timer)}t`}
              highlight={ukens_stats.okter > 0}
            />
            <StatBlock
              label="Runder"
              value={String(ukens_stats.runder)}
            />
            <StatBlock
              label="Drills"
              value={String(ukens_stats.drills)}
            />
            <StatBlock
              label="Tester"
              value={String(ukens_stats.tester)}
            />
          </div>

          {ukens_stats.okter === 0 && ukens_stats.runder === 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-secondary/40 p-4">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-xs text-muted-foreground">
                Ingen aktivitet logget denne uka. Start med å logge en runde
                eller starte en økt.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
