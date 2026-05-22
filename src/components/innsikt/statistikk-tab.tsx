"use client";

import { TrendingUp, BarChart2, Target } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type StatistikkTabRunde = {
  id: string;
  playedAt: string;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  sgTotal: number | null;
};

type PrioPunkt = {
  rang: "01" | "02" | "03";
  omraade: string;
  delta: string; // e.g. "-0.8"
  beskrivelse: string;
};

type DgRow = {
  omraade: string;
  spiller: number;
  dg: number;
};

export type StatistikkTabProps = {
  runder?: StatistikkTabRunde[];
  sgKpi?: {
    sgTotal: number | null;
    besteDisiplin: string | null;
    stoersteMulighet: string | null;
  };
};

// ---------------------------------------------------------------------------
// Demo-data
// ---------------------------------------------------------------------------

const DEMO_RUNDER: StatistikkTabRunde[] = [
  { id: "r1", playedAt: "2026-05-15", sgOtt: 0.3, sgApp: -0.2, sgArg: 0.1, sgPutt: -0.8, sgTotal: -0.6 },
  { id: "r2", playedAt: "2026-05-08", sgOtt: 0.5, sgApp: 0.1, sgArg: -0.3, sgPutt: -0.4, sgTotal: -0.1 },
  { id: "r3", playedAt: "2026-05-01", sgOtt: 0.2, sgApp: -0.4, sgArg: 0.2, sgPutt: -0.6, sgTotal: -0.6 },
  { id: "r4", playedAt: "2026-04-24", sgOtt: 0.6, sgApp: 0.3, sgArg: -0.1, sgPutt: -0.9, sgTotal: -0.1 },
  { id: "r5", playedAt: "2026-04-17", sgOtt: 0.1, sgApp: 0.0, sgArg: 0.4, sgPutt: -0.5, sgTotal: 0.0 },
  { id: "r6", playedAt: "2026-04-10", sgOtt: 0.4, sgApp: 0.2, sgArg: -0.2, sgPutt: -0.3, sgTotal: 0.1 },
];

const PRIO: PrioPunkt[] = [
  { rang: "01", omraade: "Putting 3—6m", delta: "-0.8", beskrivelse: "Lavest SG siste 10 runder" },
  { rang: "02", omraade: "Innspill 100—150m", delta: "-0.5", beskrivelse: "Konsistent svakt mot snitt" },
  { rang: "03", omraade: "Grovbunker", delta: "-0.3", beskrivelse: "Under DataGolf scratch-nivå" },
];

const DG_ROWS: DgRow[] = [
  { omraade: "OTT", spiller: 0.3, dg: 0.1 },
  { omraade: "APP", spiller: -0.2, dg: 0.4 },
  { omraade: "ARG", spiller: 0.0, dg: 0.2 },
  { omraade: "PUTT", spiller: -0.7, dg: 0.1 },
  { omraade: "TOTAL", spiller: -0.6, dg: 0.8 },
];

// ---------------------------------------------------------------------------
// SG-trend SVG (inline polyline per disiplin)
// ---------------------------------------------------------------------------

function SgTrendSvg({ runder }: { runder: StatistikkTabRunde[] }) {
  const COLORS = {
    ott: "#005840",
    app: "#D1F843",
    arg: "#6FA686",
    putt: "#A32D2D",
  };

  const N = runder.length;
  if (N < 2) {
    return (
      <div className="in-sg-svg-empty">
        Trenger minst 2 runder for å vise trend.
      </div>
    );
  }

  const W = 280;
  const H = 80;
  const PAD = 8;

  type DisiplinKey = "ott" | "app" | "arg" | "putt";
  const prismaKey: Record<DisiplinKey, keyof StatistikkTabRunde> = {
    ott: "sgOtt",
    app: "sgApp",
    arg: "sgArg",
    putt: "sgPutt",
  };

  function toPoints(key: DisiplinKey): string {
    return runder
      .map((r, i) => {
        const val = (r[prismaKey[key]] as number | null) ?? 0;
        const x = PAD + (i / (N - 1)) * (W - PAD * 2);
        const y = H / 2 - val * 18; // scale: 1 SG = 18px
        return `${x},${Math.max(PAD, Math.min(H - PAD, y))}`;
      })
      .join(" ");
  }

  return (
    <div className="in-sg-svg-wrap">
      <svg
        className="in-sg-svg"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-label="SG-trend siste runder"
      >
        {/* Zero-line */}
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="#E5E3DD"
          strokeWidth={1}
        />
        {(["ott", "app", "arg", "putt"] as DisiplinKey[]).map((k) => (
          <polyline
            key={k}
            points={toPoints(k)}
            fill="none"
            stroke={COLORS[k]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="in-sg-legend">
        {(["ott", "app", "arg", "putt"] as DisiplinKey[]).map((k) => (
          <span key={k} className="in-sg-legend-item">
            <i style={{ background: COLORS[k] }} />
            {k.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slag-prioriteringskort
// ---------------------------------------------------------------------------

function PrioList() {
  return (
    <div className="in-prio-list">
      {PRIO.map((p) => (
        <div key={p.rang} className="in-prio-row">
          <span className="rang">{p.rang}</span>
          <div className="body">
            <div className="omraade">{p.omraade}</div>
            <div className="beskrivelse">{p.beskrivelse}</div>
          </div>
          <span className="delta">{p.delta}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Du vs DataGolf
// ---------------------------------------------------------------------------

function DgSammenlign() {
  return (
    <div className="in-dg-list">
      {DG_ROWS.map((row) => {
        const diff = row.spiller - row.dg;
        const positive = diff >= 0;
        const maxAbs = 1.2;
        const spillerPct = Math.round(((row.spiller + maxAbs) / (maxAbs * 2)) * 100);
        const dgPct = Math.round(((row.dg + maxAbs) / (maxAbs * 2)) * 100);
        return (
          <div key={row.omraade} className="in-dg-row">
            <span className="lbl">{row.omraade}</span>
            <div className="bars">
              <div className="in-dg-bar player" style={{ width: `${spillerPct}%` }} />
              <div className="in-dg-bar dg" style={{ width: `${dgPct}%` }} />
            </div>
            <span className={`diff ${positive ? "pos" : "neg"}`}>
              {positive ? "+" : ""}{diff.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function StatistikkTab({ runder, sgKpi }: StatistikkTabProps) {
  const visRunder = runder && runder.length > 0 ? runder : DEMO_RUNDER;

  // Avled KPI fra data
  const sgTotalSnitt =
    sgKpi?.sgTotal ??
    (visRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / visRunder.length);

  const besteDisiplin = sgKpi?.besteDisiplin ?? "OTT";
  const stoersteMulighet = sgKpi?.stoersteMulighet ?? "PUTT 3—6M";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">SG total (snitt)</div>
          <div className="in-kpi-val">
            {sgTotalSnitt >= 0 ? "+" : ""}{sgTotalSnitt.toFixed(1)}
          </div>
          <div className={`in-kpi-delta ${sgTotalSnitt >= 0 ? "" : "muted"}`}>
            siste {visRunder.length} runder
          </div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Beste disiplin</div>
          <div className="in-kpi-val" style={{ fontSize: 16 }}>{besteDisiplin}</div>
          <div className="in-kpi-delta">styrke</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Største mulighet</div>
          <div className="in-kpi-val" style={{ fontSize: 14 }}>{stoersteMulighet}</div>
          <div className="in-kpi-delta muted">fokusområde</div>
        </div>
      </div>

      {/* 3-kolonne grid */}
      <div className="in-stat-grid">

        {/* Kolonne 1: SG-trend */}
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">SG-trend · 90 dager</h2>
            <Link href="/portal/mal/sg-hub" className="in-sec-link">
              <TrendingUp size={11} aria-hidden />
              Detaljer
            </Link>
          </div>
          <div className="in-stat-card">
            <SgTrendSvg runder={visRunder} />
          </div>
        </section>

        {/* Kolonne 2: Slag-prioritering */}
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">Slag-prioritering</h2>
          </div>
          <div className="in-stat-card">
            <PrioList />
          </div>
        </section>

        {/* Kolonne 3: Du vs DataGolf */}
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">Du vs DataGolf</h2>
          </div>
          <div className="in-stat-card">
            <DgSammenlign />
          </div>
        </section>

      </div>

      {/* Lenke til full SG-analyse */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/portal/mal/sg-hub" className="in-sec-cta">
          <BarChart2 size={13} aria-hidden />
          Full SG-analyse
        </Link>
        <Link href="/portal/statistikk" className="in-sec-cta" style={{
          background: "var(--in-card)",
          color: "var(--in-brand)",
          border: "1px solid var(--in-border)",
        }}>
          <Target size={13} aria-hidden />
          Legg inn statistikk
        </Link>
      </div>

    </div>
  );
}
