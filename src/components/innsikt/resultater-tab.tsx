"use client";

import Link from "next/link";
import { Trophy, Plus, ArrowRight } from "lucide-react";

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
  kpi?: {
    sisteRunde: number | null; // score vs par
    snitt10: number | null;    // snitt score vs par
    besteIAar: number | null;  // beste score vs par
  };
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
];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function formatDato(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scoreTilPar(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

// ---------------------------------------------------------------------------
// Runde-rad
// ---------------------------------------------------------------------------

function RundeRad({ runde }: { runde: ResultaterRunde }) {
  const relScore = runde.score - runde.par;
  const positiv = relScore <= 0;

  return (
    <div className="in-result-row">
      <div className="dato">{formatDato(runde.playedAt)}</div>
      <div className="bane">{runde.courseName}</div>
      <div className={`score ${positiv ? "pos" : "neg"}`}>
        {scoreTilPar(runde.score, runde.par)}
      </div>
      <div className="sg">
        {runde.sgTotal != null ? (
          <span className={runde.sgTotal >= 0 ? "pos" : "neg"}>
            {runde.sgTotal >= 0 ? "+" : ""}{runde.sgTotal.toFixed(1)} SG
          </span>
        ) : (
          <span className="ingen">—</span>
        )}
      </div>
      <Link href={`/portal/mal/runder/${runde.id}`} className="detalj">
        Detalj <ArrowRight size={10} aria-hidden />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Turnering-rad
// ---------------------------------------------------------------------------

function TurneringRad({ t }: { t: ResultaterTurnering }) {
  return (
    <div className="in-result-row">
      <div className="dato">{formatDato(t.startDate)}</div>
      <div className="bane">{t.tournamentName}</div>
      <div className="score pos">{t.score != null ? t.score : "—"}</div>
      <div className="sg">
        {t.position != null ? (
          <span className="pos">#{t.position}</span>
        ) : (
          <span className="ingen">—</span>
        )}
      </div>
      <div className="detalj" style={{ opacity: 0.4 }}>—</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function ResultaterTab({ runder, turneringer, kpi }: ResultaterTabProps) {
  const visRunder = runder && runder.length > 0 ? runder : DEMO_RUNDER;
  const visTurneringer = turneringer && turneringer.length > 0 ? turneringer : DEMO_TURNERINGER;

  const sisteRunde = kpi?.sisteRunde ?? (visRunder[0].score - visRunder[0].par);
  const snitt10 =
    kpi?.snitt10 ??
    Math.round(
      (visRunder.reduce((s, r) => s + (r.score - r.par), 0) / visRunder.length) * 10
    ) / 10;
  const besteIAar = kpi?.besteIAar ?? Math.min(...visRunder.map((r) => r.score - r.par));

  function fmt(n: number): string {
    if (n === 0) return "E";
    return n > 0 ? `+${n}` : `${n}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">Siste runde</div>
          <div className={`in-kpi-val ${sisteRunde <= 0 ? "" : ""}`}>
            {fmt(sisteRunde)}
          </div>
          <div className={`in-kpi-delta ${sisteRunde <= 0 ? "" : "muted"}`}>
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

      {/* Siste runder */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Siste {visRunder.length} runder</h2>
          <Link href="/portal/mal/runder" className="in-sec-link">
            <Trophy size={11} aria-hidden />
            Alle runder
          </Link>
        </div>
        <div className="in-result-table">
          <div className="in-result-header">
            <span>Dato</span>
            <span>Bane</span>
            <span>Score</span>
            <span>SG</span>
            <span />
          </div>
          {visRunder.map((r) => (
            <RundeRad key={r.id} runde={r} />
          ))}
        </div>
      </section>

      {/* Turneringer */}
      {visTurneringer.length > 0 && (
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">Turneringsresultater</h2>
          </div>
          <div className="in-result-table">
            <div className="in-result-header">
              <span>Dato</span>
              <span>Turnering</span>
              <span>Score</span>
              <span>Plass</span>
              <span />
            </div>
            {visTurneringer.map((t) => (
              <TurneringRad key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Legg til runde CTA */}
      <div>
        <Link href="/portal/mal/runder/ny" className="in-sec-cta">
          <Plus size={13} aria-hidden />
          Legg til runde manuelt
        </Link>
      </div>

    </div>
  );
}
