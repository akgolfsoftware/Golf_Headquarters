"use client";

/**
 * Slag-editor: resultatet av ETT slag i posisjonskjedet.
 * Stor «I HULL»-knapp (normaltilfellet på green) · lie-chips (hvileposisjoner)
 * · avstandsvelger · straffe-toggle · «Mer» (kølle/vind/notat).
 * Gimme finnes ikke — ærlig hole-out kreves. Straffe kan aldri settes på
 * slaget som går i hull (samme regel som zod håndhever server-side).
 * Gjenbrukes i «Fullfør kjeden» (steg 5).
 */

import { useState } from "react";
import type { WindDir } from "@/generated/prisma/enums";
import type { HvileLie, LoggetSlag } from "@/lib/runde-logg/types";
import { T, Caps, Icon } from "@/components/v2";
import { AvstandVelger, type AvstandKontekst } from "./avstand-velger";

const LIES: Array<{ id: HvileLie; label: string }> = [
  { id: "FAIRWAY", label: "Fairway" },
  { id: "SEMI_ROUGH", label: "Semi" },
  { id: "ROUGH", label: "Rough" },
  { id: "DEEP_ROUGH", label: "Dyp rough" },
  { id: "BUNKER", label: "Bunker" },
  { id: "GREEN", label: "Green" },
  { id: "TREES", label: "Trær" },
];

const VIND: Array<{ id: WindDir; label: string }> = [
  { id: "STILLE", label: "Stille" },
  { id: "MEDVIND", label: "Medvind" },
  { id: "MOTVIND", label: "Motvind" },
  { id: "VENSTRE", label: "Venstre" },
  { id: "HOYRE", label: "Høyre" },
];

const komma = (n: number) => String(n).replace(".", ",");

type SlagEditorProps = {
  /** Slagnummer i hullet (1-basert). */
  slagNr: number;
  /** Startposisjon fra kjeden. */
  startLie: "TEE" | HvileLie;
  startAvstand: number;
  /** Hull-lengde (TEE-chips). */
  hullLengde: number;
  par: number;
  /** Vind vedvarer per hull — sist valgte sendes inn som default. */
  defaultVind?: WindDir;
  onLagre: (slag: LoggetSlag) => void;
  onIHull: (slag: LoggetSlag) => void;
  onAngre: (() => void) | null;
};

export function SlagEditor({
  slagNr,
  startLie,
  startAvstand,
  hullLengde,
  par,
  defaultVind,
  onLagre,
  onIHull,
  onAngre,
}: SlagEditorProps) {
  const [lie, setLie] = useState<HvileLie | null>(null);
  const [avstand, setAvstand] = useState<number | null>(null);
  const [straffe, setStraffe] = useState(false);
  const [visMer, setVisMer] = useState(false);
  const [kolle, setKolle] = useState("");
  const [vind, setVind] = useState<WindDir | undefined>(defaultVind);
  const [notat, setNotat] = useState("");

  const erPutt = startLie === "GREEN";
  const kontekst: AvstandKontekst =
    lie === "GREEN"
      ? "GREEN"
      : startLie === "TEE" && par >= 4
        ? "TEE"
        : startAvstand <= 30
          ? "ARG"
          : "APP";

  const startTekst =
    startLie === "TEE"
      ? `tee · ${komma(startAvstand)} m`
      : `${LIES.find((l) => l.id === startLie)?.label.toLowerCase() ?? ""} · ${komma(startAvstand)} m`;

  const nullstill = () => {
    setLie(null);
    setAvstand(null);
    setStraffe(false);
    setKolle("");
    setNotat("");
  };

  const felles = (): Pick<LoggetSlag, "kolle" | "vind" | "notat"> => ({
    ...(kolle.trim() ? { kolle: kolle.trim() } : {}),
    ...(vind ? { vind } : {}),
    ...(notat.trim() ? { notat: notat.trim() } : {}),
  });

  const lagre = () => {
    if (!lie || avstand == null) return;
    onLagre({
      resultat: { iHull: false, lie, avstandTilHull: avstand },
      ...(straffe ? { straffe: true } : {}),
      ...felles(),
    });
    nullstill();
  };

  const iHull = () => {
    // Straffe på hole-out er ugyldig (zod avviser) — knappen er da deaktivert.
    onIHull({ resultat: { iHull: true }, ...felles() });
    nullstill();
  };

  const pill = (aktiv: boolean, farge?: { bg: string; bd: string; fg: string }) => ({
    appearance: "none" as const,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 13px",
    borderRadius: 9999,
    fontFamily: T.ui,
    fontSize: 12,
    fontWeight: 600,
    background: aktiv ? (farge?.bg ?? T.panel3) : "transparent",
    color: aktiv ? (farge?.fg ?? T.fg) : T.fg2,
    border: `1px solid ${aktiv ? (farge?.bd ?? T.borderS) : T.border}`,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "14px 14px 16px",
        borderRadius: 16,
        background: T.panel,
        border: `1px solid ${T.borderS}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Caps>
          Slag {slagNr} · {erPutt ? "putt" : "fra"} {startTekst}
        </Caps>
        {onAngre && (
          <button
            type="button"
            onClick={onAngre}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 10px",
              borderRadius: 9999,
              background: "transparent",
              border: `1px solid ${T.border}`,
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              color: T.fg2,
            }}
          >
            <Icon name="arrow-left" size={12} />
            Angre
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={iHull}
        disabled={straffe}
        title={straffe ? "Straffe kan ikke settes på slaget som går i hull" : undefined}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: straffe ? "not-allowed" : "pointer",
          width: "100%",
          height: 56,
          borderRadius: 16,
          border: "none",
          background: straffe ? T.panel3 : T.lime,
          color: straffe ? T.mut : T.onLime,
          fontFamily: T.disp,
          fontSize: 17,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: straffe ? "none" : "0 10px 34px rgba(209,248,67,0.28)",
        }}
      >
        <Icon name="flag" size={17} />I HULL
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: T.mut,
          }}
        >
          …eller hvor landet ballen?
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LIES.map((x) => {
            const on = lie === x.id;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setLie(x.id)}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 12px",
                  borderRadius: 12,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: on ? T.panel3 : "transparent",
                  color: on ? T.fg : T.fg2,
                  border: `1px solid ${on ? T.borderS : T.border}`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: on ? T.lime : T.mut,
                    opacity: on ? 1 : 0.5,
                  }}
                />
                {x.label}
              </button>
            );
          })}
        </div>
        {lie && (
          <AvstandVelger kontekst={kontekst} hullLengde={hullLengde} verdi={avstand} onVerdi={setAvstand} />
        )}
      </div>

      {visMer && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={kolle}
              onChange={(e) => setKolle(e.target.value)}
              placeholder="Kølle (f.eks. Driver, PW)"
              maxLength={40}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                padding: "0 12px",
                background: T.panel2,
                border: `1px solid ${T.border}`,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {VIND.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVind(v.id)}
                className="v2-press v2-focus"
                style={pill(vind === v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <textarea
            value={notat}
            onChange={(e) => setNotat(e.target.value)}
            placeholder="Notat (valgfritt)"
            maxLength={500}
            rows={2}
            style={{
              borderRadius: 10,
              padding: "10px 12px",
              background: T.panel2,
              border: `1px solid ${T.border}`,
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 13,
              outline: "none",
              resize: "none",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => setStraffe((s) => !s)}
          className="v2-press v2-focus"
          style={pill(straffe, {
            bg: "rgba(240,104,62,0.12)",
            bd: "rgba(240,104,62,0.4)",
            fg: T.down,
          })}
        >
          {straffe ? <Icon name="check" size={12} /> : <Icon name="plus" size={12} />}
          Straffe
        </button>
        <button
          type="button"
          onClick={() => setVisMer((v) => !v)}
          className="v2-press v2-focus"
          style={pill(visMer)}
        >
          <Icon name="sliders" size={12} />
          Mer
        </button>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={lagre}
          disabled={!lie || avstand == null}
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            cursor: !lie || avstand == null ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            background: T.panel3,
            border: `1px solid ${T.borderS}`,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 700,
            color: !lie || avstand == null ? T.mut : T.fg,
          }}
        >
          Lagre slag
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>
  );
}
