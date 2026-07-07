"use client";

import React from "react";
import { DataPreview, type DataPreviewRow } from "./DataPreview";

/**
 * AK Golf HQ — DayStrip
 * Portet 1:1 fra design-handover v13 (components/calendar/DayStrip.jsx).
 * Ukens dag-stripe: M T O T F L S med dato-piller. Valgt dag er en hvit pille
 * (mørk tekst); i dag bærer en lime prikk; fullførte dager en svak prikk.
 * Norsk uke (starter mandag).
 * CSS: ./golfdata.css (.ak-daystrip / .ak-day).
 */

export type DayStripDay = {
  /** Én-bokstavs ukedag (M T O T F L S). */
  dow: string;
  date: number;
  /** Visuell markør: "done" (svak prikk). */
  state?: "done";
  /** Lime prikk for i dag. */
  today?: boolean;
  /** Hover-preview-detaljer (fra jsx-kilden, utover .d.ts). */
  okter?: React.ReactNode;
  volum?: React.ReactNode;
  note?: React.ReactNode;
};

export type DayStripProps = {
  /** Dager, mandag først. Default er en eksempeluke. */
  days?: DayStripDay[];
  /** Valgt dato (matcher en dags `date`). */
  value?: number;
  onChange?: (date: number, day: DayStripDay) => void;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_DAYS: DayStripDay[] = [
  { dow: "M", date: 17 },
  { dow: "T", date: 18 },
  { dow: "O", date: 19 },
  { dow: "T", date: 20 },
  { dow: "F", date: 21 },
  { dow: "L", date: 22 },
  { dow: "S", date: 23 },
];

const DOW: Record<string, string> = { M: "Mandag", T: "Tirsdag", O: "Onsdag", F: "Fredag", L: "Lørdag", S: "Søndag" };

function dagRows(d: DayStripDay): DataPreviewRow[] {
  const rows: DataPreviewRow[] = [];
  if (d.okter != null) rows.push({ label: "Økter", value: d.okter });
  if (d.volum != null) rows.push({ label: "Volum", value: d.volum });
  return rows;
}

export function DayStrip({ days = DEFAULT_DAYS, value, onChange, className = "", style }: DayStripProps) {
  const activeDate = value != null ? value : days[0] && days[0].date;
  const [hover, setHover] = React.useState<number | null>(null);
  return (
    <div className={`ak-daystrip ${className}`} style={style} role="tablist">
      {days.map((d, i) => {
        const isActive = d.date === activeDate;
        const cls = [
          "ak-day",
          isActive ? "ak-day--active" : "",
          d.state === "done" ? "ak-day--done" : "",
          d.today ? "ak-day--today" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cls}
            onClick={() => onChange && onChange(d.date, d)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <span className="ak-day__dow">{d.dow}</span>
            <span className="ak-day__num">{d.date}</span>
            <span className="ak-day__mark" />
            {hover === i && (d.okter != null || d.volum != null || d.note != null || d.today) && (
              <DataPreview
                visible
                x="50%"
                y={-4}
                placement="top"
                label={`${DOW[d.dow] || d.dow} ${d.date}`}
                rows={dagRows(d)}
                value={d.okter == null && d.volum == null ? (d.today ? "I dag" : d.state === "done" ? "Fullført" : "—") : undefined}
                note={d.note}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
