"use client";

/* AK Golf HQ v2 — HjelpTips («?»-hjelpesystem, Anders-krav 9. juli).
   Lite help-circle-ikon som forklarer et tall/begrep i klarspråk. Desktop
   (ekte hover-enhet) åpner ved museover; mobil/touch åpner/lukker ved trykk.
   Alltid tastatur-tilgjengelig: fokus åpner, Escape lukker. Innhold hentes
   FRA hjelpetekster.ts — aldri ad-hoc forklaringstekst i skjermfiler. */

import { useEffect, useRef, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { HJELPETEKSTER, type HjelpNokkel } from "@/lib/v2/hjelpetekster";

/** Delt med andre v2-tap/hover-popovere (bl.a. VarmeKart-celler i datavis.tsx)
 *  slik at «ekte hover-enhet åpner ved museover, touch åpner ved trykk»-logikken
 *  ikke dupliseres. */
export function hoverKapabel(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export interface HjelpTipsProps {
  k: HjelpNokkel;
  size?: number;
  align?: "left" | "right";
}

export function HjelpTips({ k, size = 13, align = "left" }: HjelpTipsProps) {
  const [open, setOpen] = useState(false);
  const kanHover = useRef(false);
  useEffect(() => {
    kanHover.current = hoverKapabel();
  }, []);
  const tekst = HJELPETEKSTER[k];
  if (!tekst) return null;

  return (
    <span
      style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
      onMouseEnter={() => { if (kanHover.current) setOpen(true); }}
      onMouseLeave={() => { if (kanHover.current) setOpen(false); }}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={`Hjelp: ${tekst.tittel}`}
        aria-expanded={open}
        className="v2-focus"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", borderRadius: 9999 }}
      >
        <Icon name="help-circle" size={size} style={{ color: T.mut }} />
      </span>
      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            [align === "right" ? "right" : "left"]: 0,
            zIndex: 50,
            width: "max-content",
            maxWidth: 260,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "11px 13px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{tekst.tittel}</div>
          <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, lineHeight: 1.55, margin: "5px 0 0" }}>{tekst.forklaring}</p>
          {tekst.mobilTips && (
            <p style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.5, margin: "7px 0 0", paddingTop: 7, borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontWeight: 700, color: T.fg2 }}>Mobil: </span>{tekst.mobilTips}
            </p>
          )}
        </div>
      )}
    </span>
  );
}
