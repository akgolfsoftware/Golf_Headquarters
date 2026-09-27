/**
 * Øvelsesdetaljer — valgene i trinn 3–8 i masteren (docs/treningsplanlegging.md
 * kap. 12–17): sted, måleutstyr, hastighet i læringssteg, teknisk fokus, sandtrinn,
 * treningsmåte, mengde og målfelt.
 *
 * Lagres som `detaljer` inne i `WorkbenchDrill.akFormel` (Json), uten databaseendring.
 *
 * Alt her er visning og vasking, aldri regler: `feltForOvelse` bestemmer hvilke felt
 * skjemaet tegner, og `vaskDetaljer` fjerner verdier som ikke hører til området slik at
 * en gammel verdi ikke overlever en endring. Ingenting sperrer valg (18.08.2026).
 * Områdene styrer feltene (relevans-matrisen); pyramiden foreslår og filtrerer bort
 * felt som ikke hører hjemme i grenen.
 */

import { z } from "zod";

import {
  hastighetForMotorikk,
  HASTIGHET_PROSENT,
  DIMENSJON_KODER,
  SAND_TRINN_KODER,
  type BelastningKode,
  type DimensjonKode,
  type MotorikkKode,
  type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";
import { dimensjonerFor, erGyldigDimensjon, relevansFor } from "@/lib/domain/omrade-relevans";
import type { PyramidArea, TrainingArea } from "@/lib/domain/workbench/types";

// ─── Områdekoder: Workbench bruker TEE, formelen TEE_TOTAL ─────────────

export function omraadeFraArea(area: TrainingArea): OmraadeKode {
  return (area === "TEE" ? "TEE_TOTAL" : area) as OmraadeKode;
}

// ─── Sted og treningsmiljø (kap. 12) ───────────────────────────────

export const STED_HOVED = [
  "UTENDORS_TRENINGSOMRAADE",
  "GOLFBANE",
  "INNENDORS_GOLF",
  "FYSISK_TRENINGSSTED",
  "HJEMME",
  "ANNET",
] as const;
export type StedHoved = (typeof STED_HOVED)[number];

export const STED_HOVED_LABEL: Record<StedHoved, string> = {
  UTENDORS_TRENINGSOMRAADE: "Utendørs treningsområde",
  GOLFBANE: "Golfbane",
  INNENDORS_GOLF: "Innendørs golf",
  FYSISK_TRENINGSSTED: "Fysisk treningssted",
  HJEMME: "Hjemme / eget sted",
  ANNET: "Annet sted",
};

export const STED_DELVALG: Record<StedHoved, readonly string[]> = {
  UTENDORS_TRENINGSOMRAADE: ["Driving range", "Nærspillsområde", "Puttinggreen", "Korthullsbane"],
  GOLFBANE: ["Hele banen", "Første ni", "Siste ni", "Valgte hull", "Ett hull", "Treningsrunde", "Turneringsrunde"],
  INNENDORS_GOLF: ["Simulator", "Golfstudio", "Innendørs treningshall"],
  FYSISK_TRENINGSSTED: ["Treningsrom", "Styrkerom", "Kondisjonsområde", "Bevegelighetsområde", "Utendørs"],
  HJEMME: ["Inne", "Ute"],
  ANNET: ["Skole", "Treningssamling", "Annen klubb"],
};

/** Hvilke hovedmiljøer som foreslås først per pyramide (kap. 12). Resten er fortsatt valgbare. */
const STED_FORSLAG: Record<PyramidArea, readonly StedHoved[]> = {
  FYS: ["FYSISK_TRENINGSSTED", "HJEMME", "INNENDORS_GOLF", "ANNET", "UTENDORS_TRENINGSOMRAADE", "GOLFBANE"],
  TEK: ["UTENDORS_TRENINGSOMRAADE", "INNENDORS_GOLF", "GOLFBANE", "HJEMME", "ANNET", "FYSISK_TRENINGSSTED"],
  SLAG: ["UTENDORS_TRENINGSOMRAADE", "INNENDORS_GOLF", "GOLFBANE", "HJEMME", "ANNET", "FYSISK_TRENINGSSTED"],
  SPILL: ["GOLFBANE", "UTENDORS_TRENINGSOMRAADE", "INNENDORS_GOLF", "ANNET", "HJEMME", "FYSISK_TRENINGSSTED"],
  TURN: ["GOLFBANE", "INNENDORS_GOLF", "UTENDORS_TRENINGSOMRAADE", "ANNET", "HJEMME", "FYSISK_TRENINGSSTED"],
};

export function stedRekkefolge(pyramid: PyramidArea): readonly StedHoved[] {
  return STED_FORSLAG[pyramid];
}

/** Grov treningsmiljø-verdi (`belastning`) utledet fra stedet — masteren kap. 20. */
export function belastningFraSted(hoved: StedHoved, delvalg?: string): BelastningKode {
  switch (hoved) {
    case "INNENDORS_GOLF":
      return "INNENDORS";
    case "GOLFBANE":
      return "BANE";
    case "FYSISK_TRENINGSSTED":
      return delvalg === "Utendørs" ? "TRENINGSOMRAADE" : "INNENDORS";
    case "UTENDORS_TRENINGSOMRAADE":
    case "HJEMME":
    case "ANNET":
      return "TRENINGSOMRAADE";
  }
}

// ─── Måleutstyr og treningsmåte (kap. 13–14) ─────────────────────────

export const MAALEUTSTYR = ["MED_TRACKMAN", "UTEN_TRACKMAN", "ANNEN_RADAR", "IKKE_RELEVANT"] as const;
export type Maaleutstyr = (typeof MAALEUTSTYR)[number];
export const MAALEUTSTYR_LABEL: Record<Maaleutstyr, string> = {
  MED_TRACKMAN: "Med TrackMan",
  UTEN_TRACKMAN: "Uten TrackMan",
  ANNEN_RADAR: "Annen radar",
  IKKE_RELEVANT: "Ikke relevant",
};

export const TRENINGSMAATE = ["BLOKK", "VARIABEL", "KONKURRANSE", "SPILL_TEST"] as const;
export type Treningsmaate = (typeof TRENINGSMAATE)[number];
export const TRENINGSMAATE_LABEL: Record<Treningsmaate, string> = {
  BLOKK: "Blokktrening",
  VARIABEL: "Variasjonstrening",
  KONKURRANSE: "Konkurranseform",
  SPILL_TEST: "Spill/test",
};

// ─── Mengde (kap. 16) ────────────────────────────────────────────────

export const MENGDE_ENHET = ["SLAG", "PUTTER", "HULL", "MINUTTER", "SERIER"] as const;
export type MengdeEnhet = (typeof MENGDE_ENHET)[number];
export const MENGDE_ENHET_LABEL: Record<MengdeEnhet, string> = {
  SLAG: "Slag",
  PUTTER: "Putter",
  HULL: "Hull",
  MINUTTER: "Minutter",
  SERIER: "Serier",
};

// ─── Skjema for detaljer ─────────────────────────────────────────────

const kortTekst = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

export const OvelseDetaljerSchema = z.object({
  hastighetProsent: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]).optional(),
  tekniskFokus: z.enum(DIMENSJON_KODER).optional(),
  sandTrinn: z.enum(SAND_TRINN_KODER).optional(),
  sted: z
    .object({ hoved: z.enum(STED_HOVED), delvalg: kortTekst(60) })
    .optional(),
  maaleutstyr: z.enum(MAALEUTSTYR).optional(),
  treningsmaate: z.enum(TRENINGSMAATE).optional(),
  mengde: z
    .object({
      enhet: z.enum(MENGDE_ENHET),
      antall: z.number().int().min(0).max(100000).optional(),
      reps: z.number().int().min(0).max(1000).optional(),
      vektKg: z.number().min(0).max(1000).optional(),
      rir: z.number().int().min(0).max(10).optional(),
      pauseSek: z.number().int().min(0).max(3600).optional(),
    })
    .optional(),
  mal: z
    .object({
      malemetode: kortTekst(200),
      resultatkrav: kortTekst(200),
      notat: kortTekst(500),
    })
    .optional(),
});
export type OvelseDetaljer = z.infer<typeof OvelseDetaljerSchema>;

// ─── Hvilke felt skal skjemaet tegne? ────────────────────────────────

export type MengdeFelt = {
  enheter: readonly MengdeEnhet[];
  reps: boolean;
  vekt: boolean;
  rir: boolean;
  pause: boolean;
};

export type FeltSett = {
  laeringssteg: boolean;
  tekniskFokus: readonly DimensjonKode[];
  sandTrinn: boolean;
  sted: boolean;
  maaleutstyr: boolean;
  treningsmaate: boolean;
  press: boolean;
  mengde: MengdeFelt;
};

function mengdeFor(area: TrainingArea): MengdeFelt {
  switch (area) {
    case "STYRKE":
      return { enheter: ["SERIER"], reps: true, vekt: true, rir: true, pause: true };
    case "KONDISJON":
    case "BEVEGELIGHET":
      return { enheter: ["MINUTTER"], reps: false, vekt: false, rir: false, pause: false };
    case "BANE":
      return { enheter: ["HULL", "MINUTTER"], reps: false, vekt: false, rir: false, pause: false };
    case "PUTT_0_3":
    case "PUTT_3_5":
    case "PUTT_5_10":
    case "PUTT_10_25":
    case "PUTT_25_40":
    case "PUTT_40_PLUSS":
      return { enheter: ["PUTTER"], reps: false, vekt: false, rir: false, pause: false };
    default:
      return { enheter: ["SLAG"], reps: false, vekt: false, rir: false, pause: false };
  }
}

/**
 * Feltene for én øvelse. Området styrer detaljvalgene (relevans-matrisen), og
 * pyramiden fjerner felt som ikke hører hjemme i grenen (masteren kap. 10):
 * Fysisk viser aldri golffelt, og Spill og Turnering viser ikke læringssteg,
 * måleutstyr eller treningsmåte.
 */
export function feltForOvelse(pyramid: PyramidArea, area: TrainingArea): FeltSett {
  const omraade = omraadeFraArea(area);
  const r = relevansFor(omraade);
  const golf = pyramid !== "FYS";
  const teknisk = pyramid === "TEK" || pyramid === "SLAG";
  return {
    laeringssteg: r.motorikk && teknisk,
    tekniskFokus: r.dimensjon && golf ? dimensjonerFor(omraade) : [],
    sandTrinn: r.sandTrinn && golf,
    sted: true,
    maaleutstyr: teknisk && !r.fysParametere,
    treningsmaate: teknisk && !r.fysParametere,
    press: r.press && golf,
    mengde: mengdeFor(area),
  };
}

// ─── Vasking ─────────────────────────────────────────────────────────

const stedGyldig = (hoved: StedHoved, delvalg: string | undefined): boolean =>
  !delvalg || hoved === "ANNET" || STED_DELVALG[hoved].includes(delvalg);

/**
 * Fjerner verdier som ikke hører til pyramide og område, så en gammel verdi
 * ikke overlever en endring. Returnerer undefined når ingenting gjenstår.
 */
export function vaskDetaljer(
  pyramid: PyramidArea,
  area: TrainingArea,
  motorikk: MotorikkKode | undefined,
  detaljer: OvelseDetaljer | undefined,
): OvelseDetaljer | undefined {
  if (!detaljer) return undefined;
  const felt = feltForOvelse(pyramid, area);
  const omraade = omraadeFraArea(area);
  const ut: OvelseDetaljer = {};

  if (
    felt.laeringssteg &&
    motorikk &&
    detaljer.hastighetProsent !== undefined &&
    (hastighetForMotorikk(motorikk) as readonly number[]).includes(detaljer.hastighetProsent)
  ) {
    ut.hastighetProsent = detaljer.hastighetProsent;
  }
  if (detaljer.tekniskFokus && felt.tekniskFokus.length > 0 && erGyldigDimensjon(omraade, detaljer.tekniskFokus)) {
    ut.tekniskFokus = detaljer.tekniskFokus;
  }
  if (felt.sandTrinn && detaljer.sandTrinn) ut.sandTrinn = detaljer.sandTrinn;
  if (detaljer.sted && stedGyldig(detaljer.sted.hoved, detaljer.sted.delvalg)) {
    ut.sted = detaljer.sted.delvalg
      ? { hoved: detaljer.sted.hoved, delvalg: detaljer.sted.delvalg }
      : { hoved: detaljer.sted.hoved };
  }
  if (felt.maaleutstyr && detaljer.maaleutstyr) ut.maaleutstyr = detaljer.maaleutstyr;
  if (felt.treningsmaate && detaljer.treningsmaate) ut.treningsmaate = detaljer.treningsmaate;

  const m = detaljer.mengde;
  if (m && felt.mengde.enheter.includes(m.enhet)) {
    ut.mengde = {
      enhet: m.enhet,
      ...(m.antall !== undefined ? { antall: m.antall } : {}),
      ...(felt.mengde.reps && m.reps !== undefined ? { reps: m.reps } : {}),
      ...(felt.mengde.vekt && m.vektKg !== undefined ? { vektKg: m.vektKg } : {}),
      ...(felt.mengde.rir && m.rir !== undefined ? { rir: m.rir } : {}),
      ...(felt.mengde.pause && m.pauseSek !== undefined ? { pauseSek: m.pauseSek } : {}),
    };
  }

  const mal = detaljer.mal;
  if (mal && (mal.malemetode || mal.resultatkrav || mal.notat)) {
    ut.mal = {
      ...(mal.malemetode ? { malemetode: mal.malemetode } : {}),
      ...(mal.resultatkrav ? { resultatkrav: mal.resultatkrav } : {}),
      ...(mal.notat ? { notat: mal.notat } : {}),
    };
  }

  return Object.keys(ut).length > 0 ? ut : undefined;
}

// ─── Lesbar oppsummering (til formelvisningen) ───────────────────────

export function hastighetTekst(prosent: number | undefined): string | undefined {
  return prosent !== undefined && (HASTIGHET_PROSENT as readonly number[]).includes(prosent)
    ? `${prosent} % av Club Speed`
    : undefined;
}

export function stedTekst(sted: OvelseDetaljer["sted"]): string | undefined {
  if (!sted) return undefined;
  return sted.delvalg ? `${STED_HOVED_LABEL[sted.hoved]} · ${sted.delvalg}` : STED_HOVED_LABEL[sted.hoved];
}

export function mengdeTekst(mengde: OvelseDetaljer["mengde"]): string | undefined {
  if (!mengde || mengde.antall === undefined) return undefined;
  const base = `${mengde.antall} ${MENGDE_ENHET_LABEL[mengde.enhet].toLowerCase()}`;
  const ekstra: string[] = [];
  if (mengde.reps !== undefined) ekstra.push(`${mengde.reps} repetisjoner`);
  if (mengde.vektKg !== undefined) ekstra.push(`${mengde.vektKg} kg`);
  if (mengde.rir !== undefined) ekstra.push(`RIR ${mengde.rir}`);
  if (mengde.pauseSek !== undefined) ekstra.push(`pause ${mengde.pauseSek} sek`);
  return ekstra.length > 0 ? `${base} · ${ekstra.join(" · ")}` : base;
}
