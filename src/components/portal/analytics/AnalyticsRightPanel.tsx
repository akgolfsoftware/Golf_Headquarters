"use client";

/**
 * AnalyticsRightPanel — høyre panel med filtre, detaljer og sammenligninger.
 */

import { Filter, Clock, Layers, Club, Calendar } from "lucide-react";
import type { AnalyticsWorkbenchData, PeriodFilter } from "./AnalyticsWorkbenchShell";
import type { AnalyticsCategory } from "./categories";

export type AnalyticsRightPanelProps = {
  category: AnalyticsCategory;
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  data: AnalyticsWorkbenchData;
  selectedRoundId: string | null;
};

const PERIODS: { key: PeriodFilter; label: string }[] = [
  { key: "7d", label: "Siste 7 dager" },
  { key: "30d", label: "Siste 30 dager" },
  { key: "90d", label: "Siste 90 dager" },
  { key: "1y", label: "Siste år" },
  { key: "all", label: "Alle" },
];

export function AnalyticsRightPanel({
  category,
  period,
  onPeriodChange,
  data,
  selectedRoundId,
}: AnalyticsRightPanelProps) {
  const selectedRound = data.rounds.rounds.find((r) => r.id === selectedRoundId);

  return (
    <aside className="border-l border-border bg-card p-4">
      <div className="mb-4 border-b border-border pb-4">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <Filter className="h-3 w-3" />
          Filter
        </div>
        <div className="font-display text-lg font-semibold text-foreground">Innstillinger</div>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Periode</div>
        <div className="space-y-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPeriodChange(p.key)}
              className={
                "flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-xs transition-colors " +
                (period === p.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary")
              }
            >
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {p.label}
              </span>
              {period === p.key && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Aktiv kategori</div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            {categoryLabel(category)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Viser data filtrert på valgt periode. V2 får flere filtre som kølle, bane og pyramide-akse.
          </p>
        </div>
      </div>

      {selectedRound && (
        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Valgt runde</div>
          <div className="space-y-2 rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {selectedRound.courseName}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-secondary p-2 text-center">
                <div className="font-mono text-lg font-semibold">{selectedRound.score}</div>
                <div className="text-muted-foreground">Score</div>
              </div>
              <div className="rounded bg-secondary p-2 text-center">
                <div className="font-mono text-lg font-semibold">{selectedRound.shots}</div>
                <div className="text-muted-foreground">Slag</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Sammenligning</div>
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary"
            disabled
          >
            <Club className="h-3.5 w-3.5" />
            Forrige periode
            <span className="ml-auto text-[10px]">V2</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary"
            disabled
          >
            <Layers className="h-3.5 w-3.5" />
            Snitt i akademiet
            <span className="ml-auto text-[10px]">V2</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function categoryLabel(c: AnalyticsCategory): string {
  const map: Record<AnalyticsCategory, string> = {
    "trening-total": "Trening totalt",
    fysisk: "Fysisk trening",
    teknikk: "Teknikk",
    golfslag: "Golfslag",
    spill: "Spill",
    sammenligning: "Sammenligning",
    "strokes-gained": "Strokes Gained",
    konkurranse: "Konkurranse / Turneringer",
    runder: "Runder",
    testresultater: "Testresultater",
    malsetninger: "Målsetninger",
    trackman: "TrackMan",
  };
  return map[c];
}
