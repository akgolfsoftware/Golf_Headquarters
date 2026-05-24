"use client";

import Link from "next/link";
import { Crosshair, Plus, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type TrackManTabSession = {
  id: string;
  recordedAt: string; // ISO-string
  shotCount: number;
  environment?: string | null;
  tittel?: string;
  carryM?: number | null;
  smashFactor?: number | null;
  clubSpeedKmh?: number | null;
};

export type TrackManTabProps = {
  sessions?: TrackManTabSession[];
};

// ---------------------------------------------------------------------------
// Demo-data
// ---------------------------------------------------------------------------

const DEMO_SESSIONS: TrackManTabSession[] = [
  { id: "tm-1", recordedAt: "2026-05-18T10:00:00", shotCount: 48, tittel: "Driver-økt", carryM: 268, smashFactor: 1.48, clubSpeedKmh: 162 },
  { id: "tm-2", recordedAt: "2026-05-14T09:30:00", shotCount: 36, tittel: "7-jern teknikk", carryM: 172, smashFactor: 1.44, clubSpeedKmh: 143 },
  { id: "tm-3", recordedAt: "2026-05-10T11:00:00", shotCount: 52, tittel: "5—8 jern", carryM: 186, smashFactor: 1.42, clubSpeedKmh: 148 },
  { id: "tm-4", recordedAt: "2026-04-28T14:00:00", shotCount: 40, tittel: "Driver + 3-wood", carryM: 255, smashFactor: 1.47, clubSpeedKmh: 159 },
  { id: "tm-5", recordedAt: "2026-04-21T10:30:00", shotCount: 44, tittel: "Kile-økt", carryM: 130, smashFactor: 1.40, clubSpeedKmh: 128 },
];

// 4 hovedmetrikker
type Metric = {
  key: string;
  label: string;
  value: number;
  unit: string;
  // sparkline-verdier: siste 8 økter
  spark: number[];
};

const METRICS: Metric[] = [
  { key: "smash", label: "Smash factor", value: 1.46, unit: "", spark: [1.42, 1.44, 1.43, 1.45, 1.44, 1.47, 1.45, 1.46] },
  { key: "ballspeed", label: "Ball speed", value: 238, unit: "km/t", spark: [225, 228, 232, 230, 234, 236, 237, 238] },
  { key: "spin", label: "Spin rate", value: 2840, unit: "rpm", spark: [2700, 2750, 2820, 2790, 2810, 2830, 2850, 2840] },
  { key: "launch", label: "Launch angle", value: 12.4, unit: "°", spark: [11.8, 12.0, 12.2, 12.1, 12.3, 12.4, 12.3, 12.4] },
];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function formatDato(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }).toUpperCase();
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

function Sparkline({ values }: { values: number[] }) {
  const W = 140, H = 28, PAD = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(" ");

  // Smooth area under
  const areaPts = `${PAD},${H} ${pts} ${W - PAD},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="in-tm-spark" aria-label="Trend">
      <polygon points={areaPts} fill="rgba(0,88,64,0.10)" />
      <polyline points={pts} fill="none" stroke="#005840" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function TrackManTab({ sessions }: TrackManTabProps) {
  const visSessions = sessions && sessions.length > 0 ? sessions : DEMO_SESSIONS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* 4-metric grid */}
      <div className="in-tm-metrics-grid">
        {METRICS.map((m) => (
          <div key={m.key} className="in-tm-metric-card">
            <div className="in-tm-metric-label">{m.label}</div>
            <div className="in-tm-metric-val">
              {m.value.toLocaleString("nb-NO", { maximumFractionDigits: 2 })}
              {m.unit && <small>{m.unit}</small>}
            </div>
            <Sparkline values={m.spark} />
          </div>
        ))}
      </div>

      {/* Timeline siste 5 økter */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Siste {visSessions.length} TrackMan-økter</h2>
          <Link href="/portal/mal/trackman" className="in-sec-link">
            <Crosshair size={11} aria-hidden />
            Alle økter
          </Link>
        </div>
        <div className="in-stat-card">
          <div className="in-tm-timeline">
            {visSessions.map((s) => (
              <div key={s.id} className="in-tm-timeline-row">
                <span className="in-tm-timeline-date">{formatDato(s.recordedAt)}</span>
                <div>
                  <div className="in-tm-timeline-title">{s.tittel ?? `${s.shotCount} slag`}</div>
                  <div className="in-tm-timeline-meta">
                    {s.shotCount} slag
                    {s.carryM != null ? ` · ${s.carryM}m carry` : ""}
                    {s.smashFactor != null ? ` · smash ${s.smashFactor.toFixed(2)}` : ""}
                    {s.clubSpeedKmh != null ? ` · ${s.clubSpeedKmh} km/t` : ""}
                  </div>
                </div>
                <Link href={`/portal/trackman/${s.id}`} className="in-sec-link">
                  Åpne <ArrowRight size={11} aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div>
        <Link href="/portal/mal/trackman" className="in-sec-cta">
          <Plus size={13} aria-hidden />
          Importer ny økt
        </Link>
      </div>
    </div>
  );
}
