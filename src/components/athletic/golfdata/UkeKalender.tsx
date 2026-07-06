"use client";

import React from "react";
import { DataPreview, type DataPreviewRow } from "./DataPreview";

/**
 * AK Golf HQ — UkeKalender
 * Portet 1:1 fra design-handover v13 (components/calendar/UkeKalender.jsx).
 * 7-kolonners ukegrid. Hver kolonne er én dag; økter inni farges etter akse
 * (FYS/TEK/SLAG/SPILL/TURN) og bærer en compliance-prikk.
 * CSS: ./golfdata.css (.ak-ukek / .ak-uks).
 */

export type Compliance = "on" | "off" | "none" | "planned";
export type UkeAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type UkeSession = {
  time?: string;
  title: string;
  axis?: UkeAkse;
  compliance?: Compliance;
  /** AK-formel-detaljer vist i hover-preview (fra jsx-kilden, utover .d.ts). */
  cs?: React.ReactNode;
  csNivaa?: React.ReactNode;
  arena?: React.ReactNode;
  trinn?: React.ReactNode;
};

export type UkeDag = {
  date: number | null;
  today?: boolean;
  sessions?: UkeSession[];
};

export type UkeKalenderProps = {
  week?: UkeDag[];
  onSessionClick?: (session: UkeSession) => void;
  className?: string;
  style?: React.CSSProperties;
};

const DAYS_NO = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const AXIS_COLOR: Record<UkeAkse, string> = {
  FYS: "--axis-fys",
  TEK: "--axis-tek",
  SLAG: "--axis-slag",
  SPILL: "--axis-spill",
  TURN: "--axis-turn",
};
const AXIS_SOFT: Record<UkeAkse, string> = {
  FYS: "--axis-fys-soft",
  TEK: "--axis-tek-soft",
  SLAG: "--axis-slag-soft",
  SPILL: "--axis-spill-soft",
  TURN: "--axis-turn-soft",
};
const COMP_COLOR: Record<Compliance, string> = {
  on: "var(--compliance-on)",
  off: "var(--compliance-off)",
  none: "var(--compliance-none)",
  planned: "var(--text-faint)",
};

function SessionCard({ s, onClick }: { s: UkeSession; onClick?: (session: UkeSession) => void }) {
  const axisVar = s.axis ? AXIS_COLOR[s.axis] : null;
  const softVar = s.axis ? AXIS_SOFT[s.axis] : null;
  const compColor = COMP_COLOR[s.compliance || "planned"];
  const [hover, setHover] = React.useState(false);
  const rows: DataPreviewRow[] = [];
  if (s.axis) rows.push({ color: `var(${axisVar})`, label: s.axis, value: s.cs || s.csNivaa || "—" });
  if (s.arena != null) rows.push({ label: "Arena", value: s.arena });
  if (s.trinn != null) rows.push({ label: "Trinn", value: s.trinn });
  return (
    <button
      type="button"
      className="ak-uks"
      onClick={() => onClick && onClick(s)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: softVar ? `var(${softVar})` : "var(--surface)" }}
    >
      {axisVar && <span className="ak-uks__bar" style={{ background: `var(${axisVar})` }} />}
      {s.time && <span className="ak-uks__time">{s.time}</span>}
      <span className="ak-uks__row">
        <span className="ak-uks__dot" style={{ background: compColor }} />
        <span className="ak-uks__title">{s.title}</span>
      </span>
      {hover && (
        <DataPreview
          visible
          x="50%"
          y={-4}
          placement="top"
          label={s.time ? `${s.title} · ${s.time}` : s.title}
          rows={rows.length ? rows : undefined}
          value={rows.length ? undefined : s.title || "Økt"}
        />
      )}
    </button>
  );
}

export function UkeKalender({ week = [], onSessionClick, className = "", style }: UkeKalenderProps) {
  const days: UkeDag[] = week.slice(0, 7);
  while (days.length < 7) days.push({ date: null, sessions: [] });

  return (
    <div className={`ak-ukek ${className}`} style={style} role="grid" aria-label="Ukekalender">
      {days.map((day, i) => (
        <div key={i} className="ak-ukek__col" role="gridcell">
          <div className="ak-ukek__hd">
            <span className="ak-ukek__dow">{DAYS_NO[i]}</span>
            <span className={`ak-ukek__num${day.today ? " ak-ukek__num--today" : ""}`}>
              {day.date != null ? day.date : ""}
            </span>
          </div>
          <div className="ak-ukek__body">
            {(day.sessions || []).map((s, j) => (
              <SessionCard key={j} s={s} onClick={onSessionClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
