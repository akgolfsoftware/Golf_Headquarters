"use client";

import { CheckCircle2, Calendar, Plus, Target } from "lucide-react";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type MalTabGoal = {
  id: string;
  title: string;
  category: "OUTCOME" | "PROCESS";
  progressPct: number;
  targetDate: string | null;
  displayType: "ring" | "bar";
};

type KpiData = {
  aktive: number;
  oppnaaddSiste30d: number;
  nesteMilepael: number | null;
};

type ArkivertGoal = {
  id: string;
  title: string;
  oppnaaddDato: string;
  type: string;
};

// ---------------------------------------------------------------------------
// Demo-data (brukes når DB er tom)
// ---------------------------------------------------------------------------

const DEMO_GOALS: MalTabGoal[] = [
  {
    id: "demo-1",
    title: "Top 10 NM Slag",
    category: "OUTCOME",
    progressPct: 38,
    targetDate: "2026-08-15",
    displayType: "ring",
  },
  {
    id: "demo-2",
    title: "HCP +3,0 innen sesongslutt",
    category: "PROCESS",
    progressPct: 60,
    targetDate: "2026-10-01",
    displayType: "bar",
  },
  {
    id: "demo-3",
    title: "Bryte 70 på Bossum",
    category: "OUTCOME",
    progressPct: 80,
    targetDate: null,
    displayType: "bar",
  },
];

const DEMO_ARKIVERT: ArkivertGoal[] = [
  {
    id: "a1",
    title: "Delta i Bossum Open",
    oppnaaddDato: "Apr 2026",
    type: "Resultatmål",
  },
  {
    id: "a2",
    title: "3 treningsøkter per uke i 8 uker",
    oppnaaddDato: "Mar 2026",
    type: "Prosessmål",
  },
  {
    id: "a3",
    title: "HCP under 12,0",
    oppnaaddDato: "Jan 2026",
    type: "Resultatmål",
  },
];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function dagerTilFrist(dateStr: string): number {
  const naa = new Date();
  const frist = new Date(dateStr);
  return Math.max(
    0,
    Math.round((frist.getTime() - naa.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function kortDato(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Progress-ring (SVG)
// ---------------------------------------------------------------------------

function ProgressRing({ pct }: { pct: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="in-ring-wrap">
      <svg
        className="in-ring-svg"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        aria-label={`${pct} prosent fullført`}
      >
        <circle className="in-ring-track" cx="28" cy="28" r={radius} />
        <circle
          className="in-ring-fill"
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="in-ring-info">
        <span className="in-ring-pct">{pct}%</span>
        <span className="in-ring-sub">fullført</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mål-card
// ---------------------------------------------------------------------------

function GoalCard({ goal }: { goal: MalTabGoal }) {
  const erOutcome = goal.category === "OUTCOME";

  return (
    <article className="in-goal-card">
      <div className="in-goal-card-head">
        <h3 className="in-goal-title">{goal.title}</h3>
        <span className={`in-goal-badge ${erOutcome ? "outcome" : "process"}`}>
          {erOutcome ? "Resultatmål" : "Prosessmål"}
        </span>
      </div>

      {goal.displayType === "ring" ? (
        <ProgressRing pct={goal.progressPct} />
      ) : (
        <div className="in-progress-bar-wrap">
          <div className="in-progress-bar">
            <div
              className="in-progress-fill"
              style={{ width: `${goal.progressPct}%` }}
            />
          </div>
          <div className="in-progress-meta">
            <span>{goal.progressPct}% fullført</span>
            {goal.targetDate && (
              <span>{dagerTilFrist(goal.targetDate)}d igjen</span>
            )}
          </div>
        </div>
      )}

      {goal.targetDate && (
        <div className="in-date-chip">
          <Calendar />
          Frist {kortDato(goal.targetDate)}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Arkivert-rad
// ---------------------------------------------------------------------------

function ArkivertRad({ goal }: { goal: ArkivertGoal }) {
  return (
    <div className="in-archived-row">
      <div className="in-archived-icon">
        <CheckCircle2 />
      </div>
      <div className="in-archived-body">
        <div className="in-archived-title">{goal.title}</div>
        <div className="in-archived-meta">
          {goal.type} · Oppnådd {goal.oppnaaddDato}
        </div>
      </div>
      <div className="in-archived-chip">
        <CheckCircle2 />
        Oppnådd
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function MalTab({
  goals,
  kpi,
  arkivert,
}: {
  goals?: MalTabGoal[];
  kpi?: KpiData;
  arkivert?: ArkivertGoal[];
}) {
  const visGoals = goals && goals.length > 0 ? goals : DEMO_GOALS;
  const visArkivert = arkivert && arkivert.length > 0 ? arkivert : DEMO_ARKIVERT;

  const aktiveCount = kpi?.aktive ?? visGoals.length;
  const oppnaaddCount = kpi?.oppnaaddSiste30d ?? 1;
  const nesteMilepael = kpi?.nesteMilepael ?? 28;

  function handleNyttMal() {
    // Fase 1: stub — åpner modal i fase 2
    console.log("Nytt mål — åpner modal (fase 2)");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">Aktive mål</div>
          <div className="in-kpi-val">{aktiveCount}</div>
          <div className="in-kpi-delta">
            {aktiveCount === 1 ? "1 pågår" : `${aktiveCount} pågår`}
          </div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Oppnådd siste 30d</div>
          <div className="in-kpi-val">{oppnaaddCount}</div>
          <div className="in-kpi-delta">
            {oppnaaddCount > 0 ? "Godt jobbet" : "Ingen ennå"}
          </div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Neste milepæl</div>
          <div className="in-kpi-val">
            {nesteMilepael}
            <small>d</small>
          </div>
          <div className="in-kpi-delta muted">til frist</div>
        </div>
      </div>

      {/* Aktive mål */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Aktive mål</h2>
          <button className="in-sec-cta" onClick={handleNyttMal} type="button">
            <Plus />
            Nytt mål
          </button>
        </div>
        <div className="in-goal-grid">
          {visGoals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      </section>

      {/* Arkivert */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">
            <Target style={{ display: "inline", width: 12, height: 12, marginRight: 6 }} />
            Arkivert — oppnådde mål
          </h2>
        </div>
        <div className="in-archived-list">
          {visArkivert.map((g) => (
            <ArkivertRad key={g.id} goal={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
