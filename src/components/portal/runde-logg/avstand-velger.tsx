"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Avstandsvelger for slag-editoren (B3-interaksjonen, gjenbrukes i
 * «Fullfør kjeden»): kontekst-chips + stegteller + tall.
 * Meter lagres ALLTID; fot vises kun som undertekst på green (kanon).
 */

import { useState } from "react";
import { Icon } from "@/components/v2";

export type AvstandKontekst = "TEE" | "LANGT" | "APP" | "ARG" | "GREEN";

const fot = (m: number) => Math.round(m * 3.28084);
const fotTilMeter = (ft: number) => Math.round((ft / 3.28084) * 10) / 10;
const komma = (n: number) => String(n).replace(".", ",");

const PUTT_FOT_CHIPS = [3, 6, 10, 15, 25, 40];

/** Kontekst-chips: tee = gjenstående fra hullengde, ellers avstand til hull. */
function chipsFor(kontekst: AvstandKontekst, hullLengde?: number): number[] {
  if (kontekst === "TEE") {
    const l = hullLengde ?? 350;
    return [260, 240, 220, 200, 180]
      .map((carry) => Math.round((l - carry) / 5) * 5)
      .filter((rest) => rest >= 30)
      .sort((a, b) => a - b);
  }
  if (kontekst === "GREEN") return [1, 1.5, 3, 5, 8, 12];
  if (kontekst === "ARG") return [2, 5, 10, 15];
  // Lang startposisjon (par 5-layup o.l.): typiske gjenværende avstander.
  if (kontekst === "LANGT") return [50, 70, 90, 110, 130];
  return [5, 10, 15, 20, 30];
}

type AvstandVelgerProps = {
  kontekst: AvstandKontekst;
  /** Hull-lengde i meter — trengs kun for TEE-chips. */
  hullLengde?: number;
  verdi: number | null;
  onVerdi: (m: number) => void;
};

export function AvstandVelger({ kontekst, hullLengde, verdi, onVerdi }: AvstandVelgerProps) {
  const [visFot, setVisFot] = useState(kontekst === "GREEN");
  const chips = chipsFor(kontekst, hullLengde);
  const steg = kontekst === "GREEN" ? 0.5 : 5;
  const enhet =
    kontekst === "TEE" ? "m gjenstående" : "m til hull";

  const juster = (retning: 1 | -1) => {
    if (kontekst === "GREEN" && visFot) {
      const currentFt = verdi != null ? fot(verdi) : 10;
      const nyFt = Math.max(1, currentFt + retning);
      onVerdi(fotTilMeter(nyFt));
      return;
    }
    const naa = verdi ?? chips[Math.floor(chips.length / 2)] ?? 10;
    const ny = Math.round((naa + retning * steg) * 10) / 10;
    if (ny >= 0.5 && ny <= 700) onVerdi(ny);
  };

  const stegKnapp = (retning: 1 | -1) => (
    <button
      type="button"
      aria-label={retning === 1 ? `Øk ${komma(steg)} m` : `Reduser ${komma(steg)} m`}
      onClick={() => juster(retning)}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        width: 48,
        height: 48,
        borderRadius: 12,
        background: TL.dock,
        border: `1px solid ${TL.hair}`,
        color: TL.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={retning === 1 ? "plus" : "minus"} size={18} />
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {kontekst === "GREEN" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, color: TL.mute, textTransform: "uppercase" }}>
            Puttavstand
          </span>
          <div style={{ display: "inline-flex", borderRadius: 8, background: TL.dock, border: `1px solid ${TL.hair}`, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setVisFot(true)}
              style={{
                padding: "3px 8px",
                border: "none",
                background: visFot ? TL.dim : "transparent",
                color: visFot ? TL.text : TL.mute,
                fontFamily: TL.font.mono,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Fot (ft)
            </button>
            <button
              type="button"
              onClick={() => setVisFot(false)}
              style={{
                padding: "3px 8px",
                border: "none",
                background: !visFot ? TL.dim : "transparent",
                color: !visFot ? TL.text : TL.mute,
                fontFamily: TL.font.mono,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Meter (m)
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {kontekst === "GREEN" && visFot
          ? PUTT_FOT_CHIPS.map((ftVal) => {
              const on = verdi != null && fot(verdi) === ftVal;
              return (
                <button
                  key={ftVal}
                  type="button"
                  onClick={() => onVerdi(fotTilMeter(ftVal))}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 0",
                    width: 52,
                    borderRadius: 10,
                    fontFamily: TL.font.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    background: on ? "color-mix(in srgb, var(--tl-fill) 12%, transparent)" : TL.dock,
                    color: on ? TL.fill : TL.mute,
                    border: `1px solid ${on ? "color-mix(in srgb, var(--tl-fill) 40%, transparent)" : TL.hair}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {ftVal} ft
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 8,
                      fontWeight: 600,
                      color: on ? "color-mix(in srgb, var(--tl-fill) 70%, transparent)" : TL.mute,
                    }}
                  >
                    {komma(fotTilMeter(ftVal))} m
                  </span>
                </button>
              );
            })
          : chips.map((c) => {
              const on = verdi === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onVerdi(c)}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 0",
                    width: kontekst === "GREEN" ? 52 : 58,
                    borderRadius: 10,
                    fontFamily: TL.font.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    background: on ? "color-mix(in srgb, var(--tl-fill) 12%, transparent)" : TL.dock,
                    color: on ? TL.fill : TL.mute,
                    border: `1px solid ${on ? "color-mix(in srgb, var(--tl-fill) 40%, transparent)" : TL.hair}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {komma(c)}
                  {kontekst === "GREEN" && (
                    <span
                      style={{
                        fontFamily: TL.font.mono,
                        fontSize: 8,
                        fontWeight: 600,
                        color: on ? "color-mix(in srgb, var(--tl-fill) 70%, transparent)" : TL.mute,
                      }}
                    >
                      {fot(c)} ft
                    </span>
                  )}
                </button>
              );
            })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {stegKnapp(-1)}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: TL.font.mono, fontSize: 34, fontWeight: 700, color: TL.text, lineHeight: 1 }}>
            {kontekst === "GREEN" && visFot
              ? (verdi == null ? "—" : fot(verdi))
              : (verdi == null ? "—" : komma(verdi))}
            <span style={{ fontSize: 14, color: TL.mute, marginLeft: 6 }}>
              {kontekst === "GREEN" && visFot ? "ft" : "m"}
            </span>
          </div>
          <div
            style={{
              fontFamily: TL.font.mono,
              fontSize: 9.5,
              color: TL.mute,
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {kontekst === "GREEN" && visFot
              ? `${verdi != null ? komma(verdi) : "—"} m til hull · ±1 ft`
              : `${enhet}${kontekst === "GREEN" && verdi != null ? ` · ${fot(verdi)} ft` : ""} · ±${komma(steg)}`}
          </div>
        </div>
        {stegKnapp(1)}
      </div>
    </div>
  );
}
