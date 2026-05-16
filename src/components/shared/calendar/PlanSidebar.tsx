"use client";

// PlanSidebar — venstre sidemeny i kalender-vyer.
//
// Inneholder:
//   - Spiller-velger (dropdown)
//   - Aktiv plan + periode-status
//   - Filter (pyramide-toggle, praksis-toggle, vis avbrutte/skjulte)
//   - Stats: timer denne uken/måneden, økter, drill-fordeling

import { useMemo, useState } from "react";
import { User2, Calendar as CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { PyramideBar } from "./PyramideBar";
import { PraksistypeBadge } from "./PraksistypeBadge";
import { PYRAMIDE, PERIODE_LABELS, PERIODE_FARGER } from "@/lib/portal/training/ak-taxonomy";
import type { PyramidArea, PracticeType, PeriodeType } from "@/generated/prisma/client";

export type SpillerOption = {
  id: string;
  navn: string;
};

export type PeriodeStatus = {
  type: PeriodeType;
  navn: string;
  startDato: Date;
  sluttDato: Date;
  prosentFullført: number;
};

export type SidebarStats = {
  timerDenneUken: number;
  timerDenneMaaneden: number;
  antallOkter: number;
  fordeling: Record<PyramidArea, number>;
};

export type FilterState = {
  pyramide: Record<PyramidArea, boolean>;
  praksis: Record<PracticeType, boolean>;
  visAvbrutte: boolean;
  visSkjulte: boolean;
};

type Props = {
  spillere: SpillerOption[];
  valgtSpillerId: string | null;
  onValgSpiller: (id: string) => void;
  planNavn?: string;
  periode?: PeriodeStatus | null;
  stats: SidebarStats;
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  className?: string;
};

const PYRAMIDE_FARGE: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

const PRAKSIS_TYPER: PracticeType[] = ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"];

export function PlanSidebar({
  spillere,
  valgtSpillerId,
  onValgSpiller,
  planNavn,
  periode,
  stats,
  filter,
  onFilterChange,
  className,
}: Props) {
  const [filterApent, setFilterApent] = useState(true);

  function toggleArea(omr: PyramidArea) {
    onFilterChange({
      ...filter,
      pyramide: { ...filter.pyramide, [omr]: !filter.pyramide[omr] },
    });
  }

  function togglePraksis(p: PracticeType) {
    onFilterChange({
      ...filter,
      praksis: { ...filter.praksis, [p]: !filter.praksis[p] },
    });
  }

  const periodeFarge = useMemo(() => {
    if (!periode) return null;
    return PERIODE_FARGER[periode.type];
  }, [periode]);

  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col gap-4 border-r border-border bg-card p-4",
        className,
      )}
    >
      {/* Spiller-velger */}
      <section className="flex flex-col gap-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <User2 size={14} strokeWidth={1.5} />
          Spiller
        </label>
        <select
          value={valgtSpillerId ?? ""}
          onChange={(e) => onValgSpiller(e.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="" disabled>
            Velg spiller
          </option>
          {spillere.map((s) => (
            <option key={s.id} value={s.id}>
              {s.navn}
            </option>
          ))}
        </select>
      </section>

      {/* Periode-status */}
      {periode && (
        <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Aktiv periode</span>
            {planNavn && (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {planNavn}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium"
            style={
              periodeFarge
                ? { backgroundColor: periodeFarge.bg, color: periodeFarge.text }
                : undefined
            }
          >
            <CalendarIcon size={14} strokeWidth={1.5} />
            <span>{PERIODE_LABELS[periode.type]}</span>
            <span className="ml-auto tabular-nums">
              {periode.prosentFullført.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${periode.prosentFullført}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {periode.startDato.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}
            {" — "}
            {periode.sluttDato.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}
          </p>
        </section>
      )}

      {/* Stats */}
      <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <span className="text-xs font-medium text-muted-foreground">Stats</span>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-muted-foreground">Uke</dt>
            <dd className="font-mono text-lg tabular-nums text-foreground">
              {stats.timerDenneUken.toFixed(1)} t
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Måned</dt>
            <dd className="font-mono text-lg tabular-nums text-foreground">
              {stats.timerDenneMaaneden.toFixed(1)} t
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Økter</dt>
            <dd className="font-mono text-lg tabular-nums text-foreground">
              {stats.antallOkter}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Drill-fordeling</span>
          <PyramideBar fordeling={stats.fordeling} visTall />
        </div>
      </section>

      {/* Filter */}
      <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <button
          type="button"
          onClick={() => setFilterApent((v) => !v)}
          className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary"
        >
          <span className="flex items-center gap-1.5">
            <Filter size={14} strokeWidth={1.5} />
            Filter
          </span>
          <span className="text-muted-foreground">{filterApent ? "−" : "+"}</span>
        </button>

        {filterApent && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pyramide
              </span>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(PYRAMIDE) as PyramidArea[]).map((omr) => (
                  <button
                    key={omr}
                    type="button"
                    onClick={() => toggleArea(omr)}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium transition-opacity",
                      PYRAMIDE_FARGE[omr],
                      omr === "SLAG" ? "text-foreground" : "text-white",
                      filter.pyramide[omr] ? "opacity-100" : "opacity-30",
                    )}
                  >
                    {omr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Praksis
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRAKSIS_TYPER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePraksis(p)}
                    className={cn(
                      "rounded-full transition-opacity",
                      filter.praksis[p] ? "opacity-100" : "opacity-30",
                    )}
                    aria-label={p}
                  >
                    <PraksistypeBadge type={p} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px] text-foreground">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filter.visAvbrutte}
                  onChange={(e) =>
                    onFilterChange({ ...filter, visAvbrutte: e.target.checked })
                  }
                  className="h-3 w-3 rounded border-input"
                />
                Vis avbrutte
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filter.visSkjulte}
                  onChange={(e) =>
                    onFilterChange({ ...filter, visSkjulte: e.target.checked })
                  }
                  className="h-3 w-3 rounded border-input"
                />
                Vis skjulte
              </label>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
