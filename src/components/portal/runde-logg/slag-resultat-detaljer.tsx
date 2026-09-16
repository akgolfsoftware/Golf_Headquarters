// src/components/portal/runde-logg/slag-resultat-detaljer.tsx
"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * To små tommel-vennlige velgere for slag-editoren:
 * - EndShotKategoriVelger: resultatkategori for tee/approach/short game-slag
 *   (TrackMan-speilet: 3 kategorier for tee, 4 for approach/short game/recovery,
 *   2 penalty-kategorier når straffe er satt). Skjules for putt/drop.
 * - PuttDetaljerVelger: break/slope/linjeMiss/fartUtfall for putt-slag.
 *   Lengde avledes automatisk av startAvstand i byggShotRader — spørres ikke her.
 */

import { useState } from "react";
import type { EndShotKategori, ShotType } from "@/generated/prisma/enums";
import type { PuttRegistrering } from "@/lib/runde-logg/types";
import { gyldigeEndShotKategorier } from "@/lib/runde-logg/end-shot-kategori";
import { Caps } from "@/components/v2";

const END_SHOT_LABEL: Record<EndShotKategori, string> = {
  IN_PLAY: "I spill",
  MINOR_MISS: "Lite avvik",
  MAJOR_MISS: "Stort avvik",
  GREEN_HIT: "Green truffet",
  LETT: "Lett",
  MIDDELS: "Middels",
  VANSKELIG: "Vanskelig",
  PENALTY_1: "Straffe · hindring",
  PENALTY_2: "Straffe · tapt ball/re-tee",
};

function pill(aktiv: boolean) {
  return {
    appearance: "none" as const,
    cursor: "pointer",
    padding: "9px 12px",
    borderRadius: 12,
    fontFamily: TL.font.sans,
    fontSize: 12.5,
    fontWeight: 600,
    background: aktiv ? TL.dim : "transparent",
    color: aktiv ? TL.text : TL.mute,
    border: `1px solid ${TL.hair}`,
  };
}

export function EndShotKategoriVelger({
  shotType,
  straffe,
  verdi,
  onVerdi,
}: {
  shotType: ShotType;
  straffe: boolean;
  verdi: EndShotKategori | null;
  onVerdi: (v: EndShotKategori) => void;
}) {
  const gyldige = gyldigeEndShotKategorier(shotType, straffe);
  if (gyldige.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Caps>Resultat</Caps>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {gyldige.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onVerdi(k)}
            className="v2-press v2-focus"
            style={pill(verdi === k)}
          >
            {END_SHOT_LABEL[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

const BREAK_LABEL: Record<PuttRegistrering["breakRetning"], string> = {
  VENSTRE_HOYRE: "Venstre → høyre",
  HOYRE_VENSTRE: "Høyre → venstre",
  OPPOVER: "Oppover",
  NEDOVER: "Nedover",
};
const SLOPE_LABEL: Record<PuttRegistrering["slopeAlvorlighet"], string> = {
  SVAK: "Svak",
  MODERAT: "Moderat",
  KRAFTIG: "Kraftig",
};
const LINJE_LABEL: Record<NonNullable<PuttRegistrering["linjeMiss"]>, string> = {
  VENSTRE: "Venstre",
  HOYRE: "Høyre",
  PAA_LINJE: "På linje",
};
const FART_LABEL: Record<PuttRegistrering["fartUtfall"], string> = {
  HOLED: "Holt",
  FORBI: "Forbi",
  KORT: "Kort",
  SONE_FORBI: "Sone · forbi",
  SONE_KORT: "Sone · kort",
};

export function PuttDetaljerVelger({
  verdi,
  onVerdi,
}: {
  verdi: PuttRegistrering | null;
  onVerdi: (v: PuttRegistrering) => void;
}) {
  const [utkast, setUtkast] = useState<Partial<PuttRegistrering>>(verdi ?? {});

  const oppdater = <K extends keyof PuttRegistrering>(felt: K, val: PuttRegistrering[K]) => {
    const neste: Partial<PuttRegistrering> = {
      ...utkast,
      [felt]: val,
      // linjeMiss gir ikke mening når putten er holt.
      ...(felt === "fartUtfall" && val === "HOLED" ? { linjeMiss: undefined } : {}),
    };
    setUtkast(neste);
    if (neste.breakRetning && neste.slopeAlvorlighet && neste.fartUtfall) {
      onVerdi(neste as PuttRegistrering);
    }
  };

  const rad = <T extends string>(
    label: string,
    valg: Array<{ id: T; tekst: string }>,
    aktiv: T | undefined,
    onVelg: (v: T) => void,
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Caps>{label}</Caps>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {valg.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onVelg(v.id)}
            className="v2-press v2-focus"
            style={pill(aktiv === v.id)}
          >
            {v.tekst}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rad(
        "Break",
        (Object.keys(BREAK_LABEL) as Array<keyof typeof BREAK_LABEL>).map((id) => ({
          id,
          tekst: BREAK_LABEL[id],
        })),
        utkast.breakRetning,
        (v) => oppdater("breakRetning", v),
      )}
      {rad(
        "Slope",
        (Object.keys(SLOPE_LABEL) as Array<keyof typeof SLOPE_LABEL>).map((id) => ({
          id,
          tekst: SLOPE_LABEL[id],
        })),
        utkast.slopeAlvorlighet,
        (v) => oppdater("slopeAlvorlighet", v),
      )}
      {rad(
        "Utfall",
        (Object.keys(FART_LABEL) as Array<keyof typeof FART_LABEL>).map((id) => ({
          id,
          tekst: FART_LABEL[id],
        })),
        utkast.fartUtfall,
        (v) => oppdater("fartUtfall", v),
      )}
      {utkast.fartUtfall && utkast.fartUtfall !== "HOLED" &&
        rad(
          "Linje-miss",
          (Object.keys(LINJE_LABEL) as Array<keyof typeof LINJE_LABEL>).map((id) => ({
            id,
            tekst: LINJE_LABEL[id],
          })),
          utkast.linjeMiss,
          (v) => oppdater("linjeMiss", v),
        )}
    </div>
  );
}
