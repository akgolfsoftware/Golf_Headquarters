/**
 * Fokus-innløpet: hvilket område spilleren bør prioritere.
 *
 * Coachens eksplisitte valg (PeriodBlock.focus, fritekst) vinner alltid over
 * systemets beregnede SG-gap. Denne modulen er ren (ingen Prisma) så den kan
 * brukes både i loaderen og i klient-komponenter; selve SG-spørringen bor i
 * `sg-gap.ts`.
 */

import type { SkillArea } from "@/generated/prisma/client";

export type SgKategori = "OTT" | "APP" | "ARG" | "PUTT";

export type WorkbenchFokus = {
  /** coach = PeriodBlock.focus (fritekst); sg-gap = beregnet svakeste SG-kategori. */
  kilde: "coach" | "sg-gap";
  /** Klarspråk til chip, f.eks. "Putting + kort spill" eller "Innspill". */
  label: string;
  /** SG-kategori for palette-rangering. Null når coach-fritekst ikke lar seg mappe. */
  kategori: SgKategori | null;
};

export const SG_FOKUS_LABEL: Record<SgKategori, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Rundt green",
  PUTT: "Putting",
};

/** PlanTemplateSession.skillArea → SG-kategori (SPILL har ingen SG-motpart). */
export const SKILLAREA_TO_SG: Partial<Record<SkillArea, SgKategori>> = {
  TEE_TOTAL: "OTT",
  TILNAERMING: "APP",
  AROUND_GREEN: "ARG",
  PUTTING: "PUTT",
};

// Rekkefølgen avgjør ved flertreff — mest spesifikke ord først.
const FRITEKST_NOKKELORD: [SgKategori, RegExp][] = [
  ["PUTT", /\bputt/i],
  ["ARG", /chip|pitch|lob|bunker|kort\s*spill|rundt\s*green/i],
  ["APP", /innspill|approach|jernspill|wedge/i],
  ["OTT", /\btee\b|driver|utslag/i],
];

/** Beste-innsats-mapping av coachens fritekst-fokus til SG-kategori. */
export function kategoriFraFritekst(tekst: string): SgKategori | null {
  for (const [kategori, mønster] of FRITEKST_NOKKELORD) {
    if (mønster.test(tekst)) return kategori;
  }
  return null;
}
