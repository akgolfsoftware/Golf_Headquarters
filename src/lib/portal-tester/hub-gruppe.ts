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
 * Høyre-verdi på hub-raden — TE-00 korttype-copy («4,26 % · 0,04»,
 * «7 OK av 10», «7 p»). Bruker KUN tall som allerede finnes i
 * scoreTest()-resultatet (score, shotsCount fra protokollen) — ingen nye
 * felt, ingen fabrikkerte konfidens-/spredningstall. PEI vises derfor med
 * ÉTT tall (prosent), ikke fasitens to («· 0,04») — se gap-notat i PR-en.
 */
export function formatHubVerdi(params: {
  scoringKind: ScoringKind;
  latestRaw: number | null;
  shotsCount: number;
}): string {
  const { scoringKind, latestRaw, shotsCount } = params;
  if (latestRaw == null) return "—";

  switch (scoringKind) {
    case "pei_average":
    case "pei_total": {
      // Score er lagret som ratio (nærhet/lengde) — fasiten viser prosent.
      const pct = (latestRaw * 100).toLocaleString("nb-NO", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
      return `${pct} %`;
    }
    case "count_ok":
      return shotsCount > 0 ? `${fmt(latestRaw, 0)} OK av ${shotsCount}` : `${fmt(latestRaw, 0)} OK`;
    case "hit_rate":
      return `${fmt(latestRaw, 0)} %`;
    case "points_total":
    case "sum":
      return `${fmt(latestRaw, 0)} p`;
    case "carry_average":
    case "distance_average":
      return `${fmt(latestRaw, 1)} m`;
    case "time_seconds":
      return `${fmt(latestRaw, 2)} s`;
    default:
      return fmt(latestRaw, 2);
  }
}

function fmt(n: number, d: number): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: d });
}
