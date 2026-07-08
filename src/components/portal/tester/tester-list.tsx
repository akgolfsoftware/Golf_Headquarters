"use client";

/**
 * Tester-liste — queue-mønster med filter per pyramide-akse + inline-utvidelse.
 *
 * Porten av eval-tabellens R30-interaksjon (rad → drawer med tre baselines +
 * trend-sparkline) tilpasset mobil (430px). Hver rad:
 *   akse-kant · navn · siste verdi · delta · progresjon-bar.
 * Klikk utvider inline: NÅ / FORRIGE / forsøk + historikk-sparkline + verdikt-note.
 */

import { Sparkline } from "@/components/athletic/golfdata";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Axis, TestRow, Verdict } from "@/lib/portal-tester/tester-data";

const AXIS_BAR: Record<Axis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const AXIS_PILL: Record<Axis, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-[var(--color-pyr-turn-track)] text-destructive",
};

// Sparkline tar en rå CSS-farge. --pyr-* er HEX (ikke HSL-trippel),
// så de brukes direkte uten hsl()-wrapper. Spill (lime) er for lyst som
// strek — bruk forest for lesbarhet, ellers akse-fargen.
const AXIS_LINE: Record<Axis, string> = {
  fys: "var(--pyr-fys)",
  tek: "var(--pyr-tek)",
  slag: "var(--pyr-slag)",
  spill: "var(--pyr-spill-line, var(--primary))",
  turn: "var(--pyr-turn)",
};

const VERDICT_META: Record<Verdict, { label: string; cls: string; note: string }> = {
  gain: {
    label: "Framgang",
    cls: "bg-success/10 text-success",
    note: "Over forrige syklus — hold treningsdosen og re-test neste runde.",
  },
  hold: {
    label: "Holdt",
    cls: "bg-secondary text-muted-foreground",
    note: "Verken opp eller ned. Vurder ny stimulus hvis det er flatt også neste gang.",
  },
  drop: {
    label: "Tilbake",
    cls: "bg-destructive/10 text-destructive",
    note: "Tilbakegang siden forrige måling — verdt å ta opp med coachen.",
  },
  signal: {
    label: "Baseline",
    cls: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
    note: "Første måling registrert — baseline satt. Ta testen igjen for å se trenden.",
  },
  new: {
    label: "Ikke tatt",
    cls: "bg-secondary text-muted-foreground",
    note: "Ingen målinger ennå. Start testen for å sette en baseline.",
  },
};

const DELTA_ICON: Record<"pos" | "neg" | "flat", LucideIcon> = {
  pos: TrendingUp,
  neg: TrendingDown,
  flat: Minus,
};

const DELTA_CLS: Record<"pos" | "neg" | "flat", string> = {
  pos: "text-success",
  neg: "text-destructive",
  flat: "text-muted-foreground",
};

type FilterAxis = "all" | Axis;

const FILTERS: { key: FilterAxis; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "fys", label: "Fys" },
  { key: "tek", label: "Tek" },
  { key: "slag", label: "Slag" },
  { key: "spill", label: "Spill" },
  { key: "turn", label: "Turn" },
];

function Row({ row }: { row: TestRow }) {
  const [open, setOpen] = useState(false);
  const v = VERDICT_META[row.verdict];
  const hasData = row.attempts > 0;
  const canExpand = hasData;
  const DeltaIcon = row.delta ? DELTA_ICON[row.delta.tone] : null;

  return (
    <li className="overflow-hidden border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => canExpand && setOpen((o) => !o)}
        aria-expanded={canExpand ? open : undefined}
        disabled={!canExpand}
        className={cn(
          "grid w-full grid-cols-[3px_1fr_auto] items-center gap-x-3 px-1 py-3 text-left",
          canExpand && "cursor-pointer hover:bg-secondary/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        )}
      >
        {/* akse-kant */}
        <span className={cn("h-9 w-[3px] rounded-full", AXIS_BAR[row.axis])} aria-hidden />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {canExpand && (
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform",
                  open && "rotate-90 text-primary",
                )}
                strokeWidth={2}
                aria-hidden
              />
            )}
            <span className="truncate text-[13px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
              {row.name}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                AXIS_PILL[row.axis],
              )}
            >
              {row.axis}
            </span>
          </div>
          <p className="mt-0.5 truncate pl-[22px] font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
            {hasData ? (
              <>
                Sist <span className="font-bold text-foreground">{row.latestDate}</span> ·{" "}
                {row.attempts} forsøk
              </>
            ) : (
              "Ingen målinger ennå"
            )}
          </p>
        </div>

        {/* siste verdi + delta */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {hasData ? (
            <span className="font-mono text-[17px] font-bold leading-none tracking-[-0.015em] tabular-nums text-foreground">
              {row.latest}
            </span>
          ) : (
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Ikke tatt
            </span>
          )}
          {row.delta && DeltaIcon && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-[0.02em] tabular-nums",
                DELTA_CLS[row.delta.tone],
              )}
            >
              <DeltaIcon className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
              {row.delta.text}
            </span>
          )}
        </div>
      </button>

      {/* inline drawer */}
      {canExpand && (
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0">
            <div className="mb-1 ml-[15px] rounded-lg border border-border bg-secondary/40 px-3.5 py-3">
              {/* tre baselines */}
              <div className="flex flex-wrap gap-x-7 gap-y-2">
                <Baseline k="Nå" v={row.latest} />
                <Baseline
                  k="Forrige"
                  v={
                    row.history.length > 1
                      ? row.history[row.history.length - 2].toLocaleString("nb-NO", {
                          maximumFractionDigits: 2,
                        })
                      : null
                  }
                />
                <Baseline k="Forsøk" v={String(row.attempts)} />
              </div>

              <div className="mt-3 flex items-center gap-3.5">
                <div className="shrink-0">
                  <p className="mb-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                    Trend
                  </p>
                  <Sparkline
                    data={row.history}
                    color={AXIS_LINE[row.axis]}
                    width={120}
                    height={36}
                    className="h-9 w-[120px]"
                  />
                </div>
                <p className="flex-1 text-[12px] leading-snug tracking-[-0.005em] text-muted-foreground">
                  <span className="font-bold text-foreground">{v.label}.</span> {v.note}
                </p>
              </div>

              <a
                href={row.href}
                className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Se full historikk
                <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Baseline({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <p className="mb-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </p>
      <p className="font-mono text-[15px] font-bold leading-none tracking-[-0.015em] tabular-nums text-foreground">
        {v ?? "—"}
      </p>
    </div>
  );
}

export function TesterList({ rows }: { rows: TestRow[] }) {
  const [filter, setFilter] = useState<FilterAxis>("all");

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.axis === filter)),
    [filter, rows],
  );

  // Skjul filtre uten tester for å unngå tomme valg.
  const available = useMemo(() => {
    const present = new Set(rows.map((r) => r.axis));
    return FILTERS.filter((f) => f.key === "all" || present.has(f.key));
  }, [rows]);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* filter-rad */}
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          Alle tester
        </span>
        <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          {rows.length}
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
          {available.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex h-[22px] items-center rounded-full px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] transition-colors",
                filter === f.key
                  ? "bg-primary text-accent"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={filter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-3.5 py-10 text-center text-[13px] text-muted-foreground">
          Ingen tester i denne kategorien ennå.
        </p>
      ) : (
        <ul className="px-2.5 py-1">
          {visible.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
