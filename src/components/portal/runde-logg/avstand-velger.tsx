"use client";

/**
 * Avstandsvelger for slag-editoren (B3-interaksjonen, gjenbrukes i
 * «Fullfør kjeden»): kontekst-chips + stegteller + tall.
 * Meter lagres ALLTID; fot vises kun som undertekst på green (kanon).
 */

import { T, Icon } from "@/components/v2";

export type AvstandKontekst = "TEE" | "LANGT" | "APP" | "ARG" | "GREEN";

const fot = (m: number) => Math.round(m * 3.28084);
const komma = (n: number) => String(n).replace(".", ",");

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
  const chips = chipsFor(kontekst, hullLengde);
  const steg = kontekst === "GREEN" ? 0.5 : 5;
  const enhet =
    kontekst === "TEE" ? "m gjenstående" : "m til hull";

  const juster = (retning: 1 | -1) => {
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
        background: T.panel2,
        border: `1px solid ${T.border}`,
        color: T.fg,
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {chips.map((c) => {
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
                fontFamily: T.mono,
                fontSize: 13,
                fontWeight: 700,
                background: on ? "color-mix(in srgb, var(--v2-lime) 12%, transparent)" : T.panel2,
                color: on ? T.lime : T.fg2,
                border: `1px solid ${on ? "color-mix(in srgb, var(--v2-lime) 40%, transparent)" : T.border}`,
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
                    fontFamily: T.mono,
                    fontSize: 8,
                    fontWeight: 600,
                    color: on ? "color-mix(in srgb, var(--v2-lime) 70%, transparent)" : T.mut,
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
          <div style={{ fontFamily: T.mono, fontSize: 34, fontWeight: 700, color: T.fg, lineHeight: 1 }}>
            {verdi == null ? "—" : komma(verdi)}
            <span style={{ fontSize: 14, color: T.mut, marginLeft: 6 }}>m</span>
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 9.5,
              color: T.mut,
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {enhet}
            {kontekst === "GREEN" && verdi != null ? ` · ${fot(verdi)} ft` : ""} · ±{komma(steg)}
          </div>
        </div>
        {stegKnapp(1)}
      </div>
    </div>
  );
}
