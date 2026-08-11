/**
 * Chip-avledning for FangstSheet (Paper-fasit: designsystem/paper/fase1/
 * fangstsheet.html §6). Regelen fra fasiten: 4–6 chips avledet av
 * øktformelen (område + motorikk + press), alltid med minst én positiv,
 * én negativ og én kroppslig. Uten aktiv økt: generiske chips.
 *
 * AK-formel v2: motorikk-stegene er appens FaseSteg (Vei B,
 * src/lib/ak-formel-visning.ts). Press-nivåene i appen (FRI/KRAV/
 * UTFORDRING/KONKURRANSE) mappes 1:1 til Paper-navnene (ALENE/OBSERVERT/
 * KONKURRANSE/TURNERING) — «ren omdøping» per beslutning 2026-08-05
 * (.claude/rules/beslutninger.md).
 */

import type { FaseSteg, PressNivaa } from "@/lib/ak-formel-visning";

export type FangstChipKategori = "positiv" | "negativ" | "kroppslig";

export type FangstChip = {
  tekst: string;
  kategori: FangstChipKategori;
};

/** Formel-utsnittet FangstSheet trenger — alt kan mangle (ærlige tomrom). */
export type FangstFormel = {
  pyramide: string | null;
  omraade: string | null;
  motorikk: FaseSteg | null;
  press: PressNivaa | null;
};

/** Områdefamilie — slagtypen, ikke avstanden, bestemmer hva som er verdt å si (fasit §6). */
type OmradeFamilie = "tee" | "innspill" | "naerspill" | "putt" | "spill";

const OMRADE_FAMILIE: Record<string, OmradeFamilie> = {
  TEE_TOTAL: "tee",
  INNSPILL_200: "innspill",
  INNSPILL_150: "innspill",
  INNSPILL_100: "innspill",
  INNSPILL_50: "innspill",
  PITCH: "naerspill",
  BUNKER: "naerspill",
  LOB: "naerspill",
  CHIP: "naerspill",
  PUTT_40: "putt",
  PUTT_25_40: "putt",
  PUTT_15_25: "putt",
  PUTT_10_15: "putt",
  PUTT_5_10: "putt",
  PUTT_3_5: "putt",
  PUTT_0_3: "putt",
  SPILL: "spill",
  // SkillArea-enumen (grovere inndeling, TrainingPlanSession/SessionDrill)
  TILNAERMING: "innspill",
  AROUND_GREEN: "naerspill",
  PUTTING: "putt",
};

const FAMILIE_CHIPS: Record<OmradeFamilie, { pos: string; neg: string }> = {
  tee: { pos: "Traff midt i køllebladet", neg: "Dro ut til høyre" },
  innspill: { pos: "Traff ball før torv", neg: "Kom bak ballen" },
  naerspill: { pos: "Landingspunktet traff", neg: "Slo den for hardt" },
  putt: { pos: "Startlinjen traff", neg: "Åpen kølleflate i treff" },
  spill: { pos: "Fulgte spillplanen", neg: "Feil køllevalg" },
};

/** Motorikk-steget er den følelsen spilleren kan rapportere (fasit §6). */
const MOTORIKK_CHIP: Record<FaseSteg, string> = {
  UTEN_BALL: "Kjente bevegelsen uten ball",
  LAV_HASTIGHET: "Holdt formen i lav hastighet",
  AUTO: "Gikk på autopilot",
};

/** App-PressNivaa → Paper-press-chip (fasitens fire tekster). */
const PRESS_CHIP: Record<PressNivaa, string> = {
  FRI: "Trengte flere repetisjoner", // Paper: ALENE
  KRAV: "Holdt kvaliteten mens noen så på", // Paper: OBSERVERT
  UTFORDRING: "Sto i konkurransepresset", // Paper: KONKURRANSE
  KONKURRANSE: "Sto i turneringspresset", // Paper: TURNERING
};

const KROPP: FangstChip[] = [
  { tekst: "Vondt", kategori: "kroppslig" },
  { tekst: "Sliten", kategori: "kroppslig" },
];

/** Uten aktiv/nylig økt: generisk sett — fortsatt min. én pos/neg/kroppslig. */
const GENERISKE: FangstChip[] = [
  { tekst: "Bedre enn sist", kategori: "positiv" },
  { tekst: "Fikk det ikke til", kategori: "negativ" },
  { tekst: "Lærte noe nytt", kategori: "positiv" },
  ...KROPP,
];

/**
 * Avled 4–6 chips fra formelen. Mangler formelen (eller området) helt,
 * returneres det generiske settet — aldri en tom chip-rad.
 */
export function deriveFangstChips(formel: FangstFormel | null): FangstChip[] {
  const familie = formel?.omraade ? OMRADE_FAMILIE[formel.omraade] : undefined;
  if (!formel || !familie) return GENERISKE;

  const chips: FangstChip[] = [
    { tekst: FAMILIE_CHIPS[familie].pos, kategori: "positiv" },
    { tekst: FAMILIE_CHIPS[familie].neg, kategori: "negativ" },
  ];
  if (formel.motorikk) chips.push({ tekst: MOTORIKK_CHIP[formel.motorikk], kategori: "positiv" });
  if (formel.press) chips.push({ tekst: PRESS_CHIP[formel.press], kategori: "negativ" });
  chips.push(...KROPP);
  return chips.slice(0, 6); // regelen: 4–6
}

/** Kort formel-etikett til tag-visning — kun leddene som faktisk finnes. */
export function fangstFormelTag(formel: FangstFormel | null): string | null {
  if (!formel) return null;
  const deler = [formel.pyramide, formel.omraade, formel.motorikk, formel.press].filter(
    (d): d is string => Boolean(d),
  );
  return deler.length > 0 ? deler.join("_") : null;
}
