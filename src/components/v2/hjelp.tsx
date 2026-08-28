"use client";

/* AK Golf HQ v2 — HjelpTips («?»-hjelpesystem, Anders-krav 9. juli).
   Lite help-circle-ikon som forklarer et tall/begrep i klarspråk. Desktop
   (ekte hover-enhet) åpner ved museover; mobil/touch åpner/lukker ved trykk.
   Alltid tastatur-tilgjengelig: fokus åpner, Escape lukker. Innhold hentes
   FRA hjelpetekster.ts — aldri ad-hoc forklaringstekst i skjermfiler. */

import { useEffect, useRef, useState } from "react";
import { TL } from "@/lib/v2/train-lock";

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
        <Icon name="help-circle" size={size} style={{ color: TL.mute }} />
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
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
            borderRadius: 12,
            padding: "11px 13px",
            boxShadow: `0 12px 32px ${TL.scrim}`,
          }}
        >
          <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 700, color: TL.text }}>{tekst.tittel}</div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.55, margin: "5px 0 0" }}>{tekst.forklaring}</p>
          {tekst.mobilTips && (
            <p style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, lineHeight: 1.5, margin: "7px 0 0", paddingTop: 7, borderTop: `1px solid ${TL.hair}` }}>
              <span style={{ fontWeight: 700, color: TL.mute }}>Mobil: </span>{tekst.mobilTips}
            </p>
          )}
        </div>
      )}
    </span>
  );
}

/** HvorforDette — «Hvorfor dette tallet»-utvidelsen fra Paper-fasiten
 *  (`.why` i designsystem/paper/fase1/playerhq-analyse.html): kilde /
 *  beregning / forbehold under et regnet tall. Generisk versjon av
 *  PortalHvorforDette (som er bundet til portal-chat sine verktøykall) —
 *  denne tar innholdet direkte som props, for bruk i alle v2-skjermer. */
export interface HvorforDetteProps {
  kilde: string;
  beregning: string;
  forbehold: string;
}

export function HvorforDette({ kilde, beregning, forbehold }: HvorforDetteProps) {
  return (
    <details style={{ margin: "12px 0 0", border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, background: TL.elev }}>
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: 44,
          padding: "0 16px",
          cursor: "pointer",
          listStyle: "none",
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          fontWeight: 500,
          color: TL.mute,
        }}
      >
        Hvorfor dette tallet
      </summary>
      <ul style={{ margin: 0, padding: "12px 16px 16px 24px", fontSize: 13.5, color: TL.mute, lineHeight: 1.6 }}>
        <li style={{ marginBottom: 8 }}>
          <strong style={{ color: TL.text, fontWeight: 500 }}>Kilde: </strong>
          {kilde}
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong style={{ color: TL.text, fontWeight: 500 }}>Beregning: </strong>
          {beregning}
        </li>
        <li>
          <strong style={{ color: TL.text, fontWeight: 500 }}>Forbehold: </strong>
          {forbehold}
        </li>
      </ul>
    </details>
  );
}
