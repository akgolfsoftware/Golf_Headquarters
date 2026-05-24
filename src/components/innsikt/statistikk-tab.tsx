"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart2, Target } from "lucide-react";

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

export type StatistikkTabProps = {
  runder?: StatistikkTabRunde[];
};

type SubTab = "total" | "tee" | "app" | "around" | "putt";

// ---------------------------------------------------------------------------
// Demo-data
// ---------------------------------------------------------------------------

const DEMO_RUNDER: StatistikkTabRunde[] = [
  { id: "r1", playedAt: "2026-05-15", sgOtt: 0.3, sgApp: -0.2, sgArg: 0.1, sgPutt: -0.8, sgTotal: -0.6 },
  { id: "r2", playedAt: "2026-05-08", sgOtt: 0.5, sgApp: 0.1, sgArg: -0.3, sgPutt: -0.4, sgTotal: -0.1 },
  { id: "r3", playedAt: "2026-05-01", sgOtt: 0.2, sgApp: -0.4, sgArg: 0.2, sgPutt: -0.6, sgTotal: -0.6 },
  { id: "r4", playedAt: "2026-04-24", sgOtt: 0.6, sgApp: 0.3, sgArg: -0.1, sgPutt: -0.9, sgTotal: -0.1 },
  { id: "r5", playedAt: "2026-04-17", sgOtt: 0.1, sgApp: 0.0, sgArg: 0.4, sgPutt: -0.5, sgTotal: 0.0 },
];

// SG-fordeling per akse (5-akset): spiller vs cohort-snitt
type Akse = { key: string; label: string; spiller: number; cohort: number };

const SG_AKSER: Akse[] = [
  { key: "OTT", label: "Tee", spiller: 0.34, cohort: 0.10 },
  { key: "APP", label: "App", spiller: -0.16, cohort: 0.40 },
  { key: "ARG", label: "Around", spiller: 0.06, cohort: 0.20 },
  { key: "PUTT", label: "Putt", spiller: -0.62, cohort: 0.05 },
  { key: "TOT", label: "Total", spiller: -0.38, cohort: 0.75 },
];

// Distance per kølle
type Club = { club: string; meter: number; pgaSnitt: number };

const CLUBS: Club[] = [
  { club: "DRV", meter: 268, pgaSnitt: 282 },
  { club: "3W", meter: 234, pgaSnitt: 254 },
  { club: "5I", meter: 186, pgaSnitt: 198 },
  { club: "7I", meter: 158, pgaSnitt: 172 },
  { club: "9I", meter: 132, pgaSnitt: 142 },
  { club: "PW", meter: 116, pgaSnitt: 128 },
  { club: "52°", meter: 92, pgaSnitt: 105 },
  { club: "58°", meter: 64, pgaSnitt: 74 },
];

// ---------------------------------------------------------------------------
// SG Radar (5-akset SVG pentagon)
// ---------------------------------------------------------------------------

function SgRadar({ akser }: { akser: Akse[] }) {
  const N = 5;
  const cx = 160, cy = 160, R = 110;
  const angles = Array.from({ length: N }, (_, i) => (-Math.PI / 2) + (i * 2 * Math.PI) / N);

  // Skala: -1.0 til +1.0 SG → radius 0..R
  function scale(v: number): number {
    const clamped = Math.max(-1, Math.min(1, v));
    return ((clamped + 1) / 2) * R;
  }

  function pointAt(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Bakgrunn-ringer
  const rings = [0.25, 0.5, 0.75, 1].map((f) => {
    const pts = angles.map((a) => pointAt(a, R * f)).map((p) => `${p.x},${p.y}`).join(" ");
    return pts;
  });

  // Spiller
  const playerPts = akser.map((a, i) => pointAt(angles[i], scale(a.spiller))).map((p) => `${p.x},${p.y}`).join(" ");
  // Cohort
  const cohortPts = akser.map((a, i) => pointAt(angles[i], scale(a.cohort))).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="in-radar-wrap">
      <svg viewBox="0 0 320 320" className="in-radar-svg" aria-label="SG-fordeling radar">
        {/* Bakgrunn-pentagoner */}
        {rings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#E5E3DD"
            strokeWidth={1}
          />
        ))}
        {/* Akse-linjer */}
        {angles.map((a, i) => {
          const p = pointAt(a, R);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#EFEDE6" strokeWidth={1} />;
        })}
        {/* Cohort (fyll) */}
        <polygon
          points={cohortPts}
          fill="rgba(209,248,67,0.20)"
          stroke="#BFE933"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        {/* Spiller (fyll) */}
        <polygon
          points={playerPts}
          fill="rgba(0,88,64,0.18)"
          stroke="#005840"
          strokeWidth={2}
        />
        {/* Akse-labels */}
        {akser.map((a, i) => {
          const p = pointAt(angles[i], R + 18);
          return (
            <text
              key={a.key}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill="#5E5C57"
              letterSpacing="0.08em"
              style={{ textTransform: "uppercase" }}
            >
              {a.key}
            </text>
          );
        })}
        {/* Verdi-prikker spiller */}
        {akser.map((a, i) => {
          const p = pointAt(angles[i], scale(a.spiller));
          return <circle key={a.key} cx={p.x} cy={p.y} r={3.5} fill="#005840" />;
        })}
      </svg>
      <div className="in-radar-legend">
        <span><i style={{ background: "#005840" }} />Du</span>
        <span><i style={{ background: "#BFE933" }} />Cohort A2</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distance bar-chart per kølle
// ---------------------------------------------------------------------------

function DistanceBars() {
  const maxM = Math.max(...CLUBS.map((c) => Math.max(c.meter, c.pgaSnitt)));
  return (
    <div className="in-dist-list">
      {CLUBS.map((c) => {
        const pct = (c.meter / maxM) * 100;
        const isFlagship = c.club === "DRV";
        return (
          <div key={c.club} className="in-dist-row">
            <span className="club">{c.club}</span>
            <div className="in-dist-bar-wrap">
              <div
                className={`in-dist-bar${isFlagship ? " accent" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="val">{c.meter}m</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-tab content
// ---------------------------------------------------------------------------

function SubTabContent({ tab, runder }: { tab: SubTab; runder: StatistikkTabRunde[] }) {
  if (tab === "total") {
    return (
      <div className="in-2col">
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">SG-fordeling · vs cohort A2</h2>
          </div>
          <div className="in-stat-card">
            <SgRadar akser={SG_AKSER} />
          </div>
        </section>
        <section>
          <div className="in-sec-header">
            <h2 className="in-sec-title">Distance per kølle</h2>
          </div>
          <div className="in-stat-card">
            <DistanceBars />
          </div>
        </section>
      </div>
    );
  }

  // For sub-tabs (tee/app/around/putt): vis SG-trend per disiplin
  const key: keyof StatistikkTabRunde =
    tab === "tee" ? "sgOtt" :
    tab === "app" ? "sgApp" :
    tab === "around" ? "sgArg" : "sgPutt";

  const label =
    tab === "tee" ? "Tee til green (OTT)" :
    tab === "app" ? "Innspill (APP)" :
    tab === "around" ? "Around the green (ARG)" : "Putting (PUTT)";

  const verdier = runder.map((r) => (r[key] as number | null) ?? 0);
  const snitt = verdier.reduce((s, v) => s + v, 0) / verdier.length;
  const beste = Math.max(...verdier);
  const verste = Math.min(...verdier);

  return (
    <div className="in-stat-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 className="in-sec-title">{label} — siste {runder.length} runder</h2>
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">SG snitt</div>
          <div className="in-kpi-val">{snitt >= 0 ? "+" : ""}{snitt.toFixed(2)}</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Beste</div>
          <div className="in-kpi-val">{beste >= 0 ? "+" : ""}{beste.toFixed(2)}</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Verste</div>
          <div className="in-kpi-val">{verste >= 0 ? "+" : ""}{verste.toFixed(2)}</div>
        </div>
      </div>
      <div className="in-dist-list" style={{ marginTop: 8 }}>
        {runder.map((r, i) => {
          const v = verdier[i];
          return (
            <div key={r.id} className="in-dist-row">
              <span className="club">R{runder.length - i}</span>
              <div className="in-dist-bar-wrap" style={{ position: "relative" }}>
                <div
                  className="in-dist-bar"
                  style={{
                    width: `${Math.abs(v) / 1.0 * 50}%`,
                    marginLeft: v < 0 ? `${50 - Math.abs(v) * 50}%` : "50%",
                    background: v >= 0 ? "var(--in-success)" : "var(--in-danger)",
                  }}
                />
                <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "var(--in-border)" }} />
              </div>
              <span className="val">{v >= 0 ? "+" : ""}{v.toFixed(2)}</span>
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

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "tee", label: "Tee-Total" },
  { key: "app", label: "App" },
  { key: "around", label: "Around" },
  { key: "putt", label: "Putt" },
];

export function StatistikkTab({ runder }: StatistikkTabProps) {
  const visRunder = runder && runder.length > 0 ? runder : DEMO_RUNDER;
  const [sub, setSub] = useState<SubTab>("total");

  const sgTotalSnitt = visRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / visRunder.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">SG total (snitt)</div>
          <div className="in-kpi-val">
            {sgTotalSnitt >= 0 ? "+" : ""}{sgTotalSnitt.toFixed(2)}
          </div>
          <div className="in-kpi-delta">siste {visRunder.length} runder</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Beste disiplin</div>
          <div className="in-kpi-val" style={{ fontSize: 16 }}>OTT</div>
          <div className="in-kpi-delta">styrke</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Største mulighet</div>
          <div className="in-kpi-val" style={{ fontSize: 14 }}>PUTT 3—6M</div>
          <div className="in-kpi-delta muted">fokusområde</div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="in-subtab-bar">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`in-subtab${sub === t.key ? " active" : ""}`}
            onClick={() => setSub(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab innhold */}
      <SubTabContent tab={sub} runder={visRunder} />

      {/* CTA */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/portal/mal/sg-hub" className="in-sec-cta">
          <BarChart2 size={13} aria-hidden />
          Full SG-analyse
        </Link>
        <Link
          href="/portal/statistikk"
          className="in-sec-cta"
          style={{
            background: "var(--in-card)",
            color: "var(--in-brand)",
            border: "1px solid var(--in-border)",
          }}
        >
          <Target size={13} aria-hidden />
          Legg inn statistikk
        </Link>
      </div>
    </div>
  );
}
