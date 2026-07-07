/**
 * Runde-logg — domenetyper for slag-for-slag-føring.
 *
 * Modellen er posisjonskjedet: hullets startposisjon er tee (hull-lengde),
 * og hvert slag registrerer kun sitt RESULTAT (nytt underlag + ny avstand,
 * eller «i hull»). Startposisjonen for slag N er resultatet av slag N−1.
 * Det gjør føringen rask og umulig å føre inkonsistent.
 *
 * Straffeslag: `straffe: true` på et slag betyr at ballen gikk i vann/OOB
 * på DETTE slaget og resultatposisjonen er der det spilles videre fra etter
 * drop. SG for slaget belastes da med ett ekstra slag (Broadie-konvensjon),
 * og hullscore teller +1.
 *
 * Enheter: alle avstander i METER (putting konverteres til fot kun i UI,
 * jf. `meterTilFot()` i src/lib/min-golf/format.ts).
 */

import type { ShotLie, WindDir } from "@/generated/prisma/enums";

/**
 * Underlag en ball kan bli liggende på etter et slag.
 * WATER/OOB er aldri en hvileposisjon — de uttrykkes som `straffe: true`
 * på slaget, med resultat = posisjonen etter drop. TEE finnes kun som
 * hullets startposisjon.
 */
export type HvileLie = Extract<
  ShotLie,
  "FAIRWAY" | "SEMI_ROUGH" | "ROUGH" | "DEEP_ROUGH" | "BUNKER" | "GREEN" | "TREES"
>;

export type SlagResultat =
  | { iHull: true }
  | { iHull: false; lie: HvileLie; avstandTilHull: number };

export type LoggetSlag = {
  resultat: SlagResultat;
  /** Kølle brukt (fritekst fra spillerens bag, f.eks. "Driver", "PW"). */
  kolle?: string;
  /** Vind under slaget — vedvarer typisk per hull i UI. */
  vind?: WindDir;
  /** Mental score 1–5 for slaget (valgfritt). */
  mental?: number;
  /** Ballen gikk i vann/OOB på dette slaget — resultat er posisjon etter drop. */
  straffe?: boolean;
  notat?: string;
};

export type LoggetHull = {
  /** 1–18 */
  holeNumber: number;
  /** 3–6 */
  par: number;
  /** Hull-lengde i meter — startavstand for første slag. */
  lengdeMeter: number;
  /** Slagene i rekkefølge. Siste slag skal ha resultat { iHull: true }. */
  slag: LoggetSlag[];
};

export type LoggetRunde = {
  courseId: string;
  /** ISO-dato */
  playedAt: string;
  hull: LoggetHull[];
  notes?: string;
};

/** Avledet hullstatistikk (til HoleScore-modellen). */
export type HullScore = {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  /** null for par 3 (fairway-treff gir ikke mening). */
  fairway: boolean | null;
  gir: boolean;
};

/** Granulære SG-buckets — speiler Round-modellens felter. */
export type GranulaerSg = {
  sgTee: number | null;
  sgApp200: number | null;
  sgApp150: number | null;
  sgApp100: number | null;
  sgApp50: number | null;
  sgChip: number | null;
  sgPitch: number | null;
  sgBunker: number | null;
  sgPutt0_3: number | null;
  sgPutt3_5: number | null;
  sgPutt5_10: number | null;
  sgPutt10_15: number | null;
  sgPutt15_25: number | null;
  sgPutt25_40: number | null;
  sgPutt40plus: number | null;
};
