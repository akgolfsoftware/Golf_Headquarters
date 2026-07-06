"use client";

import React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — VisningsVelger
 * Portet 1:1 fra design-handover v13 (components/calendar/VisningsVelger.jsx).
 * Notion-inspirert kalenderhode: flate tekst-tabs med aktiv understrek
 * (ikke boks-tabs), periode-etikett i display-font, forrige/neste/I dag.
 * Kontrollert komponent — eier ingen kalenderdata. Visning + dato bør speiles i URL.
 * CSS: ./golfdata.css (.ak-visv).
 */

export type KalenderVisning = "agenda" | "uke" | "maned" | "tidslinje";

export type VisningsVelgerProps = {
  /** Aktiv visning (kontrollert). */
  visning: KalenderVisning;
  onVisning: (v: KalenderVisning) => void;
  /** Hvilke visninger som tilbys, i rekkefølge. Default alle fire. */
  visninger?: KalenderVisning[];
  /** Periode-etikett, f.eks. "Uke 25 · juni 2026". */
  periode?: React.ReactNode;
  /** Forrige/neste periode. Pilene skjules om utelatt. */
  onForrige?: () => void;
  onNeste?: () => void;
  /** «I dag»-knappen. Skjules om utelatt. */
  onIdag?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const NAVN: Record<KalenderVisning, string> = { agenda: "Agenda", uke: "Uke", maned: "Måned", tidslinje: "Tidslinje" };

export function VisningsVelger({
  visning,
  onVisning,
  visninger = ["agenda", "uke", "maned", "tidslinje"],
  periode,
  onForrige,
  onNeste,
  onIdag,
  className = "",
  style,
}: VisningsVelgerProps) {
  return (
    <div className={`ak-visv ${className}`} style={style}>
      <div className="ak-visv__tabs" role="tablist" aria-label="Kalendervisning">
        {visninger.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={visning === v}
            className={`ak-visv__tab${visning === v ? " ak-visv__tab--aktiv" : ""}`}
            onClick={() => onVisning && onVisning(v)}
          >
            {NAVN[v] || v}
          </button>
        ))}
      </div>
      {periode && <span className="ak-visv__periode">{periode}</span>}
      {(onForrige || onNeste || onIdag) && (
        <div className="ak-visv__nav">
          {onIdag && <button type="button" className="ak-visv__idag" onClick={onIdag}>I dag</button>}
          {onForrige && (
            <button type="button" className="ak-visv__pil" onClick={onForrige} aria-label="Forrige periode">
              <Icon name="chevron-left" size={16} />
            </button>
          )}
          {onNeste && (
            <button type="button" className="ak-visv__pil" onClick={onNeste} aria-label="Neste periode">
              <Icon name="chevron-right" size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
