"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Flag } from "lucide-react";
import { PeriodiseringPopup } from "./periodisering-popup";

// ---------------------------------------------------------------------------
// Periodeblokk-definisjon (synkronisert med GanttStrip i workbench-dashboard)
// ---------------------------------------------------------------------------

type PeriodeBlokk = {
  id: string;            // PeriodBlock.id fra DB (tom = bare visuell)
  label: string;
  cssKlasse: string;     // "b1" | "b2" | ...
  leftPct: number;
  widthPct: number;
  uker: number;
};

// Statiske blokker — tilsvarer workbench-dashboard.tsx GanttStrip
// id er satt til "" for blokker uten DB-kobling.
// Legg inn ekte PeriodBlock-id fra DB ved behov (sendes via props).
const PERIODE_BLOKKER: PeriodeBlokk[] = [
  { id: "", label: "GRUNNTRENING", cssKlasse: "b1", leftPct: 0, widthPct: 25, uker: 13 },
  { id: "", label: "OPPBYGGING", cssKlasse: "b2", leftPct: 16.66, widthPct: 12.5, uker: 7 },
  { id: "", label: "SPESIALISERING · AKTIV", cssKlasse: "b3", leftPct: 25, widthPct: 16.66, uker: 8 },
  { id: "", label: "KONKURRANSE", cssKlasse: "b4", leftPct: 41.66, widthPct: 20.83, uker: 10 },
  { id: "", label: "OVERGANG", cssKlasse: "b5", leftPct: 66.66, widthPct: 16.66, uker: 8 },
  { id: "", label: "HVILE", cssKlasse: "b6", leftPct: 83.33, widthPct: 16.66, uker: 8 },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type GanttStripInteraktivProps = {
  todayLeftPct: number;
  weekNumber: number;
  // Valgfri: erstatt tom id med ekte PeriodBlock-ider fra server
  periodeIder?: Record<number, string>; // { 0: "cuid...", 2: "cuid...", ... }
};

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function GanttStripInteraktiv({
  todayLeftPct,
  weekNumber,
  periodeIder = {},
}: GanttStripInteraktivProps) {
  const router = useRouter();
  const [valgtPeriode, setValgtPeriode] = useState<{
    id: string;
    label: string;
    uker: number;
  } | null>(null);

  const blokker = PERIODE_BLOKKER.map((b, i) => ({
    ...b,
    id: periodeIder[i] ?? b.id,
  }));

  function handleBlokk(blokk: PeriodeBlokk) {
    if (!blokk.id) {
      // Ingen DB-kobling — lenk til årsplan-siden i stedet
      router.push("/portal/tren/aarsplan");
      return;
    }
    setValgtPeriode({ id: blokk.id, label: blokk.label, uker: blokk.uker });
  }

  return (
    <section className="phq-gantt">
      <div className="phq-gantt-head">
        <h3>Sesong 2026 · min årsplan</h3>
        <div className="phq-gantt-legend">
          <span><i style={{ background: "var(--phq-brand)" }} />Aktiv periode</span>
          <span><i style={{ background: "var(--phq-accent)" }} />Hovedmål-turnering</span>
          <span><i style={{ background: "var(--phq-danger)" }} />Konkurranse</span>
          <span><i style={{ background: "var(--phq-danger)" }} />I dag</span>
        </div>
      </div>

      <div className="phq-gantt-months">
        {["JAN","FEB","MAR","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DES"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <div className="phq-gantt-track">
          {blokker.map((blokk, i) => (
            <button
              key={i}
              type="button"
              className={`phq-gantt-block ${blokk.cssKlasse} clickable`}
              style={{ left: `${blokk.leftPct}%`, width: `${blokk.widthPct}%` }}
              onClick={() => handleBlokk(blokk)}
              title={blokk.id ? `Klikk for å sette opp periodisering: ${blokk.label}` : `Åpne årsplan`}
            >
              {blokk.label}
            </button>
          ))}
          <div className="phq-gantt-today" style={{ left: `${todayLeftPct}%` }} />
        </div>

        <div className="phq-gantt-flags">
          <div className="phq-gantt-flag star" style={{ left: "calc(41.66% + (9/30)*8.33%)" }}>
            <Star size={14} aria-hidden />
            <span className="lbl">10. JUN · SØRLANDSÅPENT</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(41.66% + (23/30)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">24. JUN · BOSSUM</span>
          </div>
          <div className="phq-gantt-flag star" style={{ left: "calc(50% + (7/31)*8.33%)" }}>
            <Star size={14} aria-hidden />
            <span className="lbl">8. JUL · NM SLAG</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(50% + (21/31)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">22. JUL · TRONDHEIM</span>
          </div>
          <div className="phq-gantt-flag" style={{ left: "calc(58.33% + (4/31)*8.33%)" }}>
            <Flag size={14} aria-hidden />
            <span className="lbl">5. AUG · GFGK MESTERSKAP</span>
          </div>
        </div>
      </div>

      <div className="phq-gantt-weeks">
        <div className="phq-week-strip">
          {[-3, -2, -1, 0, 1].map((diff) => {
            const w = weekNumber + diff;
            const active = diff === 0;
            return (
              <span key={diff} className={`phq-week-cell ${active ? "active" : ""}`}>U{w}</span>
            );
          })}
        </div>
      </div>

      {/* Periodisering-popup */}
      <PeriodiseringPopup
        periode={valgtPeriode}
        onClose={() => setValgtPeriode(null)}
      />
    </section>
  );
}
