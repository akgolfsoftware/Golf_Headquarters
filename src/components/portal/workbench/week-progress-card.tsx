/**
 * WeekProgressCard — ukentlig progresjonsoversikt for Player Workbench.
 *
 * Viser pyramide-vekting (faktisk vs ideell) som horisontale progress-barer
 * med markering for over/under-fordeling, en tekstlig anbefaling, og en
 * ukens sammendrag-blokk med stats (økter, runder, drills, tester).
 *
 * 2-kolonne layout på desktop (pyramide venstre, stats høyre).
 * 1-kolonne stack på mobile.
 *
 * Referanse: Sprint 1 Spor B (Player Workbench v2).
 */

import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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

const KATEGORIER: ReadonlyArray<{ key: Kategori; label: string; bg: string }> = [
  { key: "fys", label: "FYS", bg: "bg-pyr-fys" },
  { key: "tek", label: "TEK", bg: "bg-pyr-tek" },
  { key: "slag", label: "SLAG", bg: "bg-pyr-slag" },
  { key: "spill", label: "SPILL", bg: "bg-pyr-spill" },
  { key: "turn", label: "TURN", bg: "bg-pyr-turn" },
];

/** Terskel (i prosentpoeng) før vi markerer "over"/"under" mot ideal. */
const AVVIK_TERSKEL = 0.05;

// ---------- Hjelpere ----------

function tilProsent(verdi: number): number {
  return Math.round(verdi * 100);
}

function formatTimer(timer: number): string {
  if (timer === 0) return "0 timer";
  if (Number.isInteger(timer)) return `${timer} timer`;
  return `${timer.toFixed(1)} timer`;
}

// ---------- Sub-komponenter ----------

function PyramidBar({
  label,
  bg,
  actual,
  ideal,
}: {
  label: string;
  bg: string;
  actual: number;
  ideal: number;
}) {
  const aktualPct = tilProsent(actual);
  const idealPct = tilProsent(ideal);
  const avvik = actual - ideal;

  const erOver = avvik > AVVIK_TERSKEL;
  const erUnder = avvik < -AVVIK_TERSKEL;

  // Bar-bredde basert på faktisk, men minst 1% for visibilitet hvis verdi > 0.
  const barWidth = actual === 0 ? 0 : Math.max(aktualPct, 1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground">
          <span className="text-foreground">{aktualPct}%</span>
          <span className="text-muted-foreground/60">/ mål {idealPct}%</span>
          {erOver && (
            <span className="inline-flex items-center gap-0.5 text-destructive">
              <ChevronUp className="size-3" strokeWidth={2} aria-hidden />
              <span className="text-[10px] uppercase">over</span>
            </span>
          )}
          {erUnder && (
            <span className="inline-flex items-center gap-0.5 text-destructive">
              <ChevronDown className="size-3" strokeWidth={2} aria-hidden />
              <span className="text-[10px] uppercase">under</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", bg)}
          style={{ width: `${barWidth}%` }}
          aria-label={`${label}: ${aktualPct}% (mål ${idealPct}%)`}
        />
        {/* Ideal-markør som vertikal linje */}
        {idealPct > 0 && (
          <div
            className="absolute top-0 h-full w-px bg-foreground/40"
            style={{ left: `${idealPct}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/50 py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </li>
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
        "space-y-6 rounded-lg border border-border bg-card p-6",
        className,
      )}
      aria-label="Ukas progresjon"
    >
      <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Ukas progresjon
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Venstre: Pyramide-vekting */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-card-foreground">
            Pyramide-vekting denne uka
          </div>

          <div className="space-y-3">
            {KATEGORIER.map((kat) => (
              <PyramidBar
                key={kat.key}
                label={kat.label}
                bg={kat.bg}
                actual={fordeling.actual[kat.key]}
                ideal={fordeling.ideal[kat.key]}
              />
            ))}
          </div>

          <div className="rounded-md border border-border bg-muted/50 p-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Anbefaling
            </div>
            <p className="mt-1 text-sm text-foreground">{anbefaling}</p>
          </div>
        </div>

        {/* Hoyre: Ukens stats */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-card-foreground">
            Ukens sammendrag
          </div>

          <ul className="rounded-md border border-border bg-background/50 px-4">
            <StatRow
              label="Økter"
              value={`${ukens_stats.okter} (${formatTimer(ukens_stats.okter_timer)})`}
            />
            <StatRow
              label="Runder loggført"
              value={`${ukens_stats.runder}`}
            />
            <StatRow
              label="Drills fullført"
              value={`${ukens_stats.drills}`}
            />
            <StatRow
              label="Tester gjennomført"
              value={`${ukens_stats.tester}`}
            />
          </ul>

          {ukens_stats.okter === 0 && ukens_stats.runder === 0 && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>Ingen aktivitet registrert denne uka.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
