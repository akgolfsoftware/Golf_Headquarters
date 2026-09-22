/**
 * TE-01/01L/02/13 «Tester hub» — GOLFSLAG/TEKNIKK-gruppering.
 * Fasit: designsystem/train-lock/TE-01 Tester hub iPhone.dc.html
 * Fasit: designsystem/train-lock/TE-01L Tester hub lys.dc.html
 *
 * Erstatter den gamle pyramide-akse-grupperingen (fys/tek/slag/spill/turn) i
 * selve hubben med fasitens to grupper. HANDOFF §TESTER: «Hub = to grupper.
 * GOLFSLAG (PEI, % · 0,xx) … TEKNIKK (OK/Bom + V|H; poeng der protokollen
 * gir)» — 15 navngitte protokoller. Dette er en ren IA-sortering av
 * eksisterende data (samme TestDefinition/TestResult som før), ikke en ny
 * datamodell: gruppen slås opp på testens NAVN, siden verken
 * pyramidArea eller scoring-kind alene skiller gruppene riktig (Putt 1-3m
 * er GOLFSLAG i fasiten, men scores med count_ok — samme kind som flere
 * TEKNIKK-protokoller).
 *
 * DB-navn vs fasit-navn spriker litt («Inspill Basis» i DB, «Inspill Basic»
 * i fasit; «8-ball Variation» vs «8-balls variation» osv.) — nøklene her er
 * DB-navnene (fra scripts/seed-test-definitions.ts +
 * scripts/arkiv/add-test-deling-datamodell-2026-08-16.ts sin CANON-liste).
 * Tester som ikke matcher noen av de 15 (FYS-tester, egne tester, andre
 * CANON-protokoller som «TN Slagtest») havner i en tredje bøtte «Andre» —
 * ALDRI skjult, kun ikke navngitt i fasiten.
 */

import type { ScoringKind } from "./test-scoring";
import { formaterTestVerdi } from "./format-verdi";

export type HubGruppe = "golfslag" | "teknikk" | "andre";

export const HUB_GRUPPE_LABEL: Record<HubGruppe, string> = {
  golfslag: "Golfslag",
  teknikk: "Teknikk",
  andre: "Andre",
};

/** Fasitens rekkefølge: GOLFSLAG først, så TEKNIKK, «Andre» sist. */
export const HUB_GRUPPE_REKKEFOLGE: HubGruppe[] = ["golfslag", "teknikk", "andre"];

const GOLFSLAG_NAVN = new Set<string>([
  "Driver Basic",
  "Inspill Basis", // fasit: «Inspill Basic»
  "Wedge Variation",
  "8-ball Variation", // fasit: «8-balls variation»
  "Putt 1-3m", // fasit: «Putt 1–3 m»
  "Golfslag Bane", // fasit: «Golfslag bane»
  "18-hull Inspill", // fasit: «18 hulls inspill» (GS-18)
  "9 hull lengde",
]);

const TEKNIKK_NAVN = new Set<string>([
  "TN Driver Gate", // fasit: «Driver Gate»
  "TN Wedge Gate", // fasit: «Wedge Gate»
  "TN Putt Gate", // fasit: «Putt Gate»
  "TN Nærspill Gate", // fasit: «Nærspill Gate»
  "TN VISA Express", // fasit: «VISA Express»
  "Putt Speed 1x5", // fasit: «Putt Speed 1×5»
  "Putt Speed 3x3", // fasit: «Putt Speed 3×3»
]);

export function hubGruppeForNavn(navn: string): HubGruppe {
  if (GOLFSLAG_NAVN.has(navn)) return "golfslag";
  if (TEKNIKK_NAVN.has(navn)) return "teknikk";
  return "andre";
}

/**
 * Høyre-verdi på hub-raden («4,26 %», «7 OK av 10», «7 p»). Bruker KUN tall
 * som allerede finnes i scoreTest()-resultatet (score, shotsCount fra
 * protokollen) — ingen nye felt, ingen fabrikkerte konfidens-/spredningstall.
 *
 * Selve formateringen eies av format-verdi.ts, som er den ene kilden for
 * hvordan en testverdi vises.
 */
export function formatHubVerdi(params: {
  scoringKind: ScoringKind;
  latestRaw: number | null;
  shotsCount: number;
}): string {
  return formaterTestVerdi({
    kind: params.scoringKind,
    verdi: params.latestRaw,
    shotsCount: params.shotsCount,
  });
}
