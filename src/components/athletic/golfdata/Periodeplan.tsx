"use client";

import React from "react";
import { DataPreview } from "./DataPreview";

/**
 * AK Golf HQ — Periodeplan
 * Portet 1:1 fra design-handover v13 (components/calendar/Periodeplan.jsx).
 * Horisontal sesongtidslinje: L-faser som fargede bånd + turneringsmarkører
 * (A/B/C-prioritet). Fargene følger den sekvensielle forest→lime fase-rampen
 * (--phase-base → --phase-peak). Turnering A = --axis-turn, B = --axis-spill,
 * C = --axis-slag.
 * CSS: ./golfdata.css (.ak-pp).
 */

export type LFase = "Base" | "Forberedelse" | "Spesialisering" | "Taper" | "Peak";

export type Phase = { label: LFase; startWeek: number; durationWeeks: number };

export type Tournament = { name?: string; week: number; prio: "A" | "B" | "C" };

export type PeriodeplanProps = {
  phases?: Phase[];
  tournaments?: Tournament[];
  totalWeeks?: number;
  months?: string[];
  className?: string;
  style?: React.CSSProperties;
};

const PHASE_TOKEN: Record<LFase, string> = {
  Base: "--phase-base",
  Forberedelse: "--phase-forberedelse",
  Spesialisering: "--phase-spesialisering",
  Taper: "--phase-taper",
  Peak: "--phase-peak",
};
const TOURN_COLOR: Record<"A" | "B" | "C", string> = {
  A: "--axis-turn",
  B: "--axis-spill",
  C: "--axis-slag",
};

const MONTHS_NO = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

export function Periodeplan({
  phases = [],
  tournaments = [],
  totalWeeks = 52,
  months = MONTHS_NO,
  className = "",
  style,
}: PeriodeplanProps) {
  const pct = (w: number) => `${((w - 1) / totalWeeks) * 100}%`;
  const pctW = (w: number) => `${(w / totalWeeks) * 100}%`;
  const [hoverBand, setHoverBand] = React.useState<number | null>(null);
  const [hoverTourn, setHoverTourn] = React.useState<number | null>(null);

  return (
    <div className={`ak-pp ${className}`} style={style}>
      <div className="ak-pp__band-row">
        {phases.map((p, i) => (
          <div
            key={i}
            className="ak-pp__band"
            style={{
              left: pct(p.startWeek),
              width: pctW(p.durationWeeks),
              background: `var(${PHASE_TOKEN[p.label] || "--phase-base"})`,
            }}
            onMouseEnter={() => setHoverBand(i)}
            onMouseLeave={() => setHoverBand((h) => (h === i ? null : h))}
          >
            <span className="ak-pp__band-lbl">{p.label}</span>
            {hoverBand === i && (
              <DataPreview
                visible
                x="50%"
                y={0}
                placement="top"
                label={p.label}
                value={`${p.durationWeeks} uker`}
                note={`Uke ${p.startWeek}–${p.startWeek + p.durationWeeks - 1}`}
              />
            )}
          </div>
        ))}
      </div>

      {tournaments.length > 0 && (
        <div className="ak-pp__tourn-row">
          {tournaments.map((t, i) => (
            <div
              key={i}
              className="ak-pp__tourn"
              style={{
                left: pct(t.week),
                background: `var(${TOURN_COLOR[t.prio] || "--text-muted"})`,
                padding: "0 5px",
              }}
              onMouseEnter={() => setHoverTourn(i)}
              onMouseLeave={() => setHoverTourn((h) => (h === i ? null : h))}
            >
              {t.prio}
              {hoverTourn === i && (
                <DataPreview
                  visible
                  x="50%"
                  y={0}
                  placement="top"
                  label={`Prioritet ${t.prio}`}
                  value={t.name || `Uke ${t.week}`}
                  note={t.name ? `Uke ${t.week}` : null}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="ak-pp__axis">
        {months.map((m, i) => (
          <span key={i} className="ak-pp__mo">{m}</span>
        ))}
      </div>
    </div>
  );
}
