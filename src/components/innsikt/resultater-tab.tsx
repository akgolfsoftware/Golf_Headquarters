"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Plus, ArrowRight, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type ResultaterRunde = {
  id: string;
  playedAt: string; // ISO
  courseName: string;
  score: number;
  par: number;
  sgTotal: number | null;
};

export type ResultaterTurnering = {
  id: string;
  tournamentName: string;
  startDate: string;
  position: number | null;
  score: number | null;
};

export type ResultaterTabProps = {
  runder?: ResultaterRunde[];
  turneringer?: ResultaterTurnering[];
};

// ---------------------------------------------------------------------------
// Demo-data
// ---------------------------------------------------------------------------

const DEMO_RUNDER: ResultaterRunde[] = [
  { id: "r1", playedAt: "2026-05-17", courseName: "Bossum Golf", score: 72, par: 72, sgTotal: 0.1 },
  { id: "r2", playedAt: "2026-05-10", courseName: "GFGK", score: 74, par: 72, sgTotal: -0.6 },
  { id: "r3", playedAt: "2026-05-03", courseName: "Fredrikstad GK", score: 71, par: 72, sgTotal: 0.4 },
  { id: "r4", playedAt: "2026-04-26", courseName: "Bossum Golf", score: 73, par: 72, sgTotal: -0.2 },
  { id: "r5", playedAt: "2026-04-19", courseName: "Oslo GK", score: 70, par: 72, sgTotal: 0.8 },
];

const DEMO_TURNERINGER: ResultaterTurnering[] = [
  { id: "t1", tournamentName: "Bossum Open", startDate: "2026-05-04", position: 8, score: 70 },
  { id: "t2", tournamentName: "Krets-NM Slag", startDate: "2026-04-12", position: 3, score: 68 },
  { id: "t3", tournamentName: "Junior Tour #4", startDate: "2026-06-15", position: null, score: null },
  { id: "t4", tournamentName: "Klubbmesterskap", startDate: "2026-07-20", position: null, score: null },
];

const MND_LABELS = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function formatDato(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("nb-NO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function scoreTilPar(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

// ---------------------------------------------------------------------------
// Runde grid
// ---------------------------------------------------------------------------

function RundeKort({ runde }: { runde: ResultaterRunde }) {
  const rel = runde.score - runde.par;
  const positiv = rel <= 0;
  return (
    <Link href={`/portal/mal/runder/${runde.id}`} className="in-stat-card" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, textDecoration: "none", color: "inherit" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--in-muted)" }}>
        {formatDato(runde.playedAt)}
      </div>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 15, fontWeight: 600 }}>
        {runde.courseName}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 600, color: positiv ? "var(--in-success)" : "var(--in-danger)" }}>
          {scoreTilPar(runde.score, runde.par)}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--in-muted)", fontVariantNumeric: "tabular-nums" }}>
          {runde.score}/{runde.par}
        </span>
      </div>
      {runde.sgTotal != null && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: runde.sgTotal >= 0 ? "var(--in-success)" : "var(--in-danger)" }}>
          {runde.sgTotal >= 0 ? "+" : ""}{runde.sgTotal.toFixed(1)} SG
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Turnerings-gantt (12 mnd)
// ---------------------------------------------------------------------------

function TurneringsGantt({ turneringer, nowMs }: { turneringer: ResultaterTurnering[]; nowMs: number }) {
  return (
    <div className="in-gantt-wrap">
      <div className="in-gantt">
        <div className="in-gantt-head">
          <div>Turnering</div>
          {MND_LABELS.map((m) => <div key={m}>{m}</div>)}
        </div>
        {turneringer.map((t, idx) => {
          const dato = new Date(t.startDate);
          const mnd = dato.getMonth();
          const variant = idx % 3 === 0 ? "a" : idx % 3 === 1 ? "b" : "c";
          const erFremtid = dato.getTime() > nowMs;
          const label = t.position != null ? `#${t.position}` : erFremtid ? "Påmeldt" : "Spilt";
          return (
            <div key={t.id} className="in-gantt-row">
              <div className="lbl">{t.tournamentName}</div>
              {MND_LABELS.map((_, i) => (
                <div key={i} className="in-gantt-cell">
                  {i === mnd && (
                    <div className={`in-gantt-bar ${variant}`}>
                      {label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function ResultaterTab({ runder, turneringer }: ResultaterTabProps) {
  const visRunder = runder && runder.length > 0 ? runder : DEMO_RUNDER;
  const visTurneringer = turneringer && turneringer.length > 0 ? turneringer : DEMO_TURNERINGER;
  const [nowMs] = useState(() => Date.now());

  const sisteRunde = visRunder[0].score - visRunder[0].par;
  const snitt10 = Math.round((visRunder.reduce((s, r) => s + (r.score - r.par), 0) / visRunder.length) * 10) / 10;
  const besteIAar = Math.min(...visRunder.map((r) => r.score - r.par));

  function fmt(n: number): string {
    if (n === 0) return "E";
    return n > 0 ? `+${n}` : `${n}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">Siste runde</div>
          <div className="in-kpi-val">{fmt(sisteRunde)}</div>
          <div className={`in-kpi-delta${sisteRunde <= 0 ? "" : " muted"}`}>
            {sisteRunde <= 0 ? "under par" : "over par"}
          </div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Snitt 10 siste</div>
          <div className="in-kpi-val">{fmt(snitt10)}</div>
          <div className="in-kpi-delta muted">per runde</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Beste i år</div>
          <div className="in-kpi-val">{fmt(besteIAar)}</div>
          <div className="in-kpi-delta">personlig rekord</div>
        </div>
      </div>

      {/* Runde-grid */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Siste runder</h2>
          <Link href="/portal/mal/runder" className="in-sec-link">
            <Trophy size={11} aria-hidden />
            Alle runder
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {visRunder.map((r) => (
            <RundeKort key={r.id} runde={r} />
          ))}
        </div>
      </section>

      {/* Turnerings-gantt */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Turneringssesong 2026</h2>
        </div>
        <TurneringsGantt turneringer={visTurneringer} nowMs={nowMs} />
      </section>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/portal/mal/runder/ny" className="in-sec-cta">
          <Plus size={13} aria-hidden />
          Legg til runde
        </Link>
        <button
          type="button"
          className="in-sec-cta"
          style={{
            background: "var(--in-card)",
            color: "var(--in-brand)",
            border: "1px solid var(--in-border)",
          }}
        >
          <Download size={13} aria-hidden />
          Eksporter rapport (PDF)
        </button>
        <Link href="/portal/mal/runder/ny" className="in-sec-cta" style={{ background: "var(--in-card)", color: "var(--in-brand)", border: "1px solid var(--in-border)" }}>
          <ArrowRight size={13} aria-hidden />
          Detaljert analyse
        </Link>
      </div>
    </div>
  );
}
