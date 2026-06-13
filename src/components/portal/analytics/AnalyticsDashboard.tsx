"use client";

/**
 * AnalyticsDashboard — hovedinnhold i Analytics Workbench.
 * Viser KPI-kort, grafer og tabeller basert på valgt kategori.
 */

import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Flag,
  Target,
  Trophy,
  ClipboardCheck,
  BarChart3,
  GitCompare,
  TrendingUp,
  Plus,
} from "lucide-react";
import { StatChart } from "./StatChart";
import { TrackManView } from "./TrackManView";
import { RoundStatsForm } from "./RoundStatsForm";
import type { AnalyticsWorkbenchData, PeriodFilter } from "./AnalyticsWorkbenchShell";
import type { AnalyticsCategory } from "./categories";

export type AnalyticsDashboardProps = {
  category: AnalyticsCategory;
  period: PeriodFilter;
  data: AnalyticsWorkbenchData;
  selectedRoundId: string | null;
  onSelectRound: (id: string | null) => void;
};

export function AnalyticsDashboard({
  category,
  period,
  data,
  selectedRoundId,
  onSelectRound,
}: AnalyticsDashboardProps) {
  const [showRoundForm, setShowRoundForm] = useState(false);

  const selectedRound = data.rounds.rounds.find((r) => r.id === selectedRoundId);

  if (category === "runder" && showRoundForm) {
    return (
      <main className="cal overflow-hidden bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Registrer ny runde</h2>
          <button
            type="button"
            onClick={() => setShowRoundForm(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Tilbake til oversikt
          </button>
        </div>
        <RoundStatsForm courses={data.courses} onSaved={() => setShowRoundForm(false)} />
      </main>
    );
  }

  return (
    <main className="cal overflow-y-auto bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {period === "all" ? "Alle perioder" : `Siste ${period.replace("d", " dager").replace("1y", "1 år")}`}
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{categoryLabel(category)}</h2>
        </div>
        {category === "runder" && (
          <button
            type="button"
            onClick={() => setShowRoundForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ny runde
          </button>
        )}
      </div>

      {category === "trening-total" && <TrainingTotalView data={data} />}
      {category === "runder" && (
        <RoundsView data={data} selectedRound={selectedRound ?? null} onSelectRound={onSelectRound} />
      )}
      {category === "trackman" && <TrackManView data={data.trackman} />}
      {category === "konkurranse" && <TournamentsView data={data} />}
      {category === "testresultater" && <TestsView data={data} />}
      {category === "malsetninger" && <GoalsView data={data} />}
      {(category === "fysisk" || category === "teknikk" || category === "golfslag" || category === "spill") && (
        <AxisDetailView category={category} data={data} />
      )}
      {(category === "sammenligning" || category === "strokes-gained") && <PlaceholderView category={category} />}
    </main>
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

// ── Trening totalt ──────────────────────────────────────────────────────────

function TrainingTotalView({ data }: { data: AnalyticsWorkbenchData }) {
  const hours = Math.round(data.training.minutes / 60 * 10) / 10;
  const axisChartData = data.training.byAxis.map((a) => ({
    label: a.axis,
    value: a.minutes,
    color: axisColor(a.axis),
  }));

  const sessionChartData = data.training.recentSessions.slice(0, 6).reverse().map((s) => ({
    label: `${s.date.getDate()}/${s.date.getMonth() + 1}`,
    value: s.durationMin,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Økter" value={String(data.training.sessions)} icon={Activity} />
        <KpiCard label="Reps" value={String(data.training.reps)} icon={Target} />
        <KpiCard label="Timer" value={String(hours)} icon={CalendarDays} />
        <KpiCard label="Snitt per økt" value={`${Math.round(data.training.minutes / Math.max(1, data.training.sessions))} m`} icon={BarChart3} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatChart
          type="bar"
          data={axisChartData}
          title="Minutter per akse"
          subtitle="Fordeling etter pyramide"
          height={220}
        />
        <StatChart
          type="line"
          data={sessionChartData}
          title="Øktvarighet"
          subtitle="Siste registrerte økter"
          height={220}
          valueFormatter={(v) => `${v} m`}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Siste økter
        </h3>
        {data.training.recentSessions.length ? (
          <div className="divide-y divide-border">
            {data.training.recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.date.toLocaleDateString("nb-NO")} · {s.durationMin} min · {s.reps} reps
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                  {s.pyramidArea}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Activity}>Ingen økter registrert i perioden.</EmptyState>
        )}
      </div>
    </div>
  );
}

// ── Runder ──────────────────────────────────────────────────────────────────

function RoundsView({
  data,
  selectedRound,
  onSelectRound,
}: {
  data: AnalyticsWorkbenchData;
  selectedRound: { id: string; courseName: string; score: number; par: number; playedAt: Date; shots: number; sgTotal: number | null } | null;
  onSelectRound: (id: string | null) => void;
}) {
  const chartData = data.rounds.rounds.slice(0, 8).reverse().map((r) => ({
    label: `${r.playedAt.getDate()}/${r.playedAt.getMonth() + 1}`,
    value: r.score,
    secondaryValue: r.par,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Runder" value={String(data.rounds.totalRounds)} icon={Flag} />
        <KpiCard label="Best" value={data.rounds.bestScore != null ? String(data.rounds.bestScore) : "—"} icon={Target} />
        <KpiCard label="Snitt" value={data.rounds.avgScore != null ? String(data.rounds.avgScore) : "—"} icon={BarChart3} />
        <KpiCard label="Hull spilt" value={String(data.rounds.totalRounds * 18)} icon={CalendarDays} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatChart
          type="bar"
          data={chartData}
          title="Score per runde"
          subtitle="Siste runder"
          height={220}
          valueFormatter={(v) => String(v)}
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Runder
          </h3>
          {data.rounds.rounds.length === 0 ? (
            <EmptyState icon={Flag}>Ingen runder registrert.</EmptyState>
          ) : (
            <div className="divide-y divide-border">
              {data.rounds.rounds.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectRound(r.id)}
                  className={
                    "flex w-full items-center justify-between py-2 text-left " +
                    (selectedRound?.id === r.id ? "text-primary" : "")
                  }
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.courseName}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.playedAt.toLocaleDateString("nb-NO")} · {r.shots} slag
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold">{r.score}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.score - r.par === 0 ? "E" : r.score - r.par > 0 ? `+${r.score - r.par}` : r.score - r.par}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRound && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Valgt runde
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-foreground">{selectedRound.courseName}</div>
              <div className="text-xs text-muted-foreground">{selectedRound.playedAt.toLocaleDateString("nb-NO")}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-semibold">{selectedRound.score}</div>
              <div className="text-xs text-muted-foreground">{selectedRound.shots} slag</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Turneringer ─────────────────────────────────────────────────────────────

function TournamentsView({ data }: { data: AnalyticsWorkbenchData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Påmeldte" value={String(data.tournaments.length)} icon={Trophy} />
        <KpiCard label="Best plassering" value={bestPosition(data.tournaments)} icon={Target} />
        <KpiCard label="Gj.snitt score" value={avgTournamentScore(data.tournaments)} icon={BarChart3} />
        <KpiCard label="Sesong" value={new Date().getFullYear().toString()} icon={CalendarDays} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Turneringer
        </h3>
        {data.tournaments.length ? (
          <div className="divide-y divide-border">
            {data.tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.startDate.toLocaleDateString("nb-NO")}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {t.position ? `${t.position}. plass` : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t.score ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Trophy}>Ingen turneringer registrert.</EmptyState>
        )}
      </div>
    </div>
  );
}

function bestPosition(tournaments: { position: number | null }[]): string {
  const positions = tournaments.map((t) => t.position).filter((p): p is number => p != null);
  return positions.length ? String(Math.min(...positions)) : "—";
}

function avgTournamentScore(tournaments: { score: number | null }[]): string {
  const scores = tournaments.map((t) => t.score).filter((s): s is number => s != null);
  if (!scores.length) return "—";
  return (Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10).toString();
}

// ── Tester ──────────────────────────────────────────────────────────────────

function TestsView({ data }: { data: AnalyticsWorkbenchData }) {
  const chartData = data.tests.slice(0, 8).reverse().map((t) => ({
    label: t.name.slice(0, 10),
    value: t.score,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Tester" value={String(data.tests.length)} icon={ClipboardCheck} />
        <KpiCard label="Beste" value={bestTest(data.tests)} icon={Target} />
        <KpiCard label="Snitt" value={avgTest(data.tests)} icon={BarChart3} />
        <KpiCard label="Siste" value={data.tests[0]?.score.toString() ?? "—"} icon={CalendarDays} />
      </div>
      {data.tests.length === 0 ? (
        <EmptyState icon={ClipboardCheck}>Ingen tester registrert.</EmptyState>
      ) : (
        <StatChart type="bar" data={chartData} title="Testresultater" subtitle="Siste tester" height={240} />
      )}
    </div>
  );
}

function bestTest(tests: { score: number }[]): string {
  if (!tests.length) return "—";
  return String(Math.max(...tests.map((t) => t.score)));
}

function avgTest(tests: { score: number }[]): string {
  if (!tests.length) return "—";
  return (Math.round((tests.reduce((a, b) => a + b.score, 0) / tests.length) * 10) / 10).toString();
}

// ── Mål ─────────────────────────────────────────────────────────────────────

function GoalsView({ data }: { data: AnalyticsWorkbenchData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Aktive mål" value={String(data.goals.filter((g) => g.status === "ACTIVE").length)} icon={Target} />
        <KpiCard label="Nådd" value={String(data.goals.filter((g) => g.status === "ACHIEVED").length)} icon={Activity} />
        <KpiCard label="Resultatmål" value={String(data.goals.filter((g) => g.category === "OUTCOME").length)} icon={Trophy} />
        <KpiCard label="Prosesmål" value={String(data.goals.filter((g) => g.category === "PROCESS").length)} icon={BarChart3} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Målsetninger
        </h3>
        {data.goals.length ? (
          <div className="divide-y divide-border">
            {data.goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{g.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.category} {g.targetDate ? `· ${g.targetDate.toLocaleDateString("nb-NO")}` : ""}
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " +
                    (g.status === "ACHIEVED"
                      ? "bg-success/10 text-success"
                      : g.status === "ACTIVE"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Target}>Ingen mål registrert.</EmptyState>
        )}
      </div>
    </div>
  );
}

// ── Akse-detalj (FYS/TEK/SLAG/SPILL) ────────────────────────────────────────

function AxisDetailView({ category, data }: { category: AnalyticsCategory; data: AnalyticsWorkbenchData }) {
  const axisMap: Record<string, string> = {
    fysisk: "FYS",
    teknikk: "TEK",
    golfslag: "SLAG",
    spill: "SPILL",
  };
  const axis = axisMap[category];
  const axisData = data.training.byAxis.find((a) => a.axis === axis);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Økter" value={String(axisData?.sessions ?? 0)} icon={Activity} />
        <KpiCard label="Minutter" value={String(axisData?.minutes ?? 0)} icon={CalendarDays} />
        <KpiCard label="Testresultater" value={String(data.tests.filter((t) => t.pyramidArea === axis).length)} icon={ClipboardCheck} />
        <KpiCard label="Runder koblet" value={String(data.rounds.totalRounds)} icon={Flag} />
      </div>
      <StatChart
        type="pie"
        data={data.training.byAxis.map((a) => ({ label: a.axis, value: a.minutes, color: axisColor(a.axis) }))}
        title="Treningsfordeling"
        subtitle="Andel minutter per akse"
        height={240}
      />
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="mt-3 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

// ── Placeholder for V2-kategorier ───────────────────────────────────────────

function PlaceholderView({ category }: { category: AnalyticsCategory }) {
  const icon = category === "sammenligning" ? GitCompare : TrendingUp;
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/40" />
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{categoryLabel(category)}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Denne analysen bygges ut i neste runde. Foreløpig er Trening totalt, Runder og TrackMan live.
      </p>
    </div>
  );
}

// ── Pyramide-fargehjelp ─────────────────────────────────────────────────────

function axisColor(axis: string): string {
  switch (axis) {
    case "FYS":
      return "var(--pyr-fys)";
    case "TEK":
      return "var(--pyr-tek)";
    case "SLAG":
      return "var(--pyr-slag)";
    case "SPILL":
      return "var(--pyr-spill)";
    case "TURN":
      return "var(--pyr-turn)";
    default:
      return "hsl(var(--chart-1))";
  }
}

// ── KPI-kort ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground">{value}</div>
    </div>
  );
}
