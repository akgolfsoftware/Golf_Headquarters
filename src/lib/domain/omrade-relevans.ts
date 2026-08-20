/**
 * Relevans-matrisen — hvilke planleggingsakser gjelder hvilket treningsområde.
 *
 * Fasit: `docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md`
 * (Anders, fase 0 runde 2 · 20.08.2026):
 *   - Motorikk (UTEN_BALL/LAV_HAST/AUTO) gjelder KUN de fem fullsving-områdene.
 *     Nærspill, bunker, putt, FYS og bane har feltet skjult — det lagres aldri.
 *   - Egne teknikk-dimensjoner er analysens sjette akse. En drill bærer KUN ÉN.
 *   - Bunker har i tillegg sand-trappen — et eget to-verdis felt, ikke motorikk.
 *   - FYS skjuler belastning og press i UI (lagres som INNENDORS/ALENE), og
 *     planlegges med serier · reps · pause · RIR · vekt i stedet.
 *   - BANE er ikke låst til pyramide SPILL: pyramide og område er uavhengige
 *     akser overalt.
 *
 * Matrisen er et VISNINGS-filter, aldri en regel. Den styrer hvilke felter som i
 * det hele tatt vises når en drill planlegges — færre felter per område er
 * enklere, ikke mer komplisert (spec §Bærende UX-prinsipp). Ingenting her
 * sperrer noe, jf. 18.08-beslutningen om at ingen treningsregler håndheves.
 */

import {
  omraadeFamilie,
  type DimensjonKode,
  type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";

export type Akse = "motorikk" | "belastning" | "press" | "dimensjon" | "sandTrinn" | "fysParametere";

export type Relevans = {
  /** Motoriske læringssteg — kun fullsving. */
  motorikk: boolean;
  /** Konteksten treningen skjer i. Skjult for FYS, men lagret som default. */
  belastning: boolean;
  /** Hvem som ser på. Skjult for FYS, men lagret som default. */
  press: boolean;
  /** Egen teknikk-dimensjon — én, valgfri. FYS har ingen. */
  dimensjon: boolean;
  /** Sand-trappen — kun bunker. */
  sandTrinn: boolean;
  /** Serier · reps · pause · RIR · vekt — kun FYS. */
  fysParametere: boolean;
};

const INGEN: Relevans = {
  motorikk: false,
  belastning: false,
  press: false,
  dimensjon: false,
  sandTrinn: false,
  fysParametere: false,
};

/**
 * Hvilke dimensjoner gir mening for området, i den rekkefølgen matrisen
 * anbefaler (mest naturlige default først). Rekkefølgen er veiledende — enhver
 * dimensjon kan velges, og ingen må velges.
 */
const DIMENSJONER: Record<OmraadeKode, readonly DimensjonKode[]> = {
  TEE_TOTAL: ["SIKTE", "STARTRETNING", "KURVE", "TREFFPUNKT"],
  INNSPILL_200: ["STARTRETNING", "KURVE", "HOYDE", "TREFFPUNKT"],
  INNSPILL_150: ["STARTRETNING", "KURVE", "HOYDE", "LENGDEKONTROLL"],
  INNSPILL_100: ["LENGDEKONTROLL", "STARTRETNING", "HOYDE"],
  INNSPILL_50: ["LENGDEKONTROLL", "HOYDE", "SPINN"],
  CHIP: ["LANDINGSPUNKT", "UTRULLING", "TREFFPUNKT", "KOLLEVALG"],
  PITCH: ["LENGDEKONTROLL", "LANDINGSPUNKT", "HOYDE", "SPINN"],
  LOB: ["HOYDE", "LANDINGSPUNKT", "BOUNCE_BRUK", "TREFFPUNKT"],
  BUNKER: ["SANDINNGANG", "LENGDEKONTROLL", "HOYDE", "LIE_VARIASJON"],
  // De fire puttingdimensjonene på alle seks bånd. Rekkefølgen er vektingen fra
  // matrisen: korte putter handler om ballstart og sikte, lange om lengde og lesing.
  PUTT_0_3: ["BALLSTART", "SIKTE", "GREENLESING", "LENGDEKONTROLL"],
  PUTT_3_5: ["BALLSTART", "SIKTE", "GREENLESING", "LENGDEKONTROLL"],
  PUTT_5_10: ["GREENLESING", "SIKTE", "BALLSTART", "LENGDEKONTROLL"],
  PUTT_10_25: ["GREENLESING", "LENGDEKONTROLL", "BALLSTART", "SIKTE"],
  PUTT_25_40: ["LENGDEKONTROLL", "GREENLESING", "BALLSTART", "SIKTE"],
  PUTT_40_PLUSS: ["LENGDEKONTROLL", "GREENLESING", "BALLSTART", "SIKTE"],
  STYRKE: [],
  KONDISJON: [],
  BEVEGELIGHET: [],
  BANE: ["SPILLEFORMAT", "STRATEGIOPPGAVE"],
};

/**
 * Hvilke akser gjelder dette området. Kalles av økt-editoren for å avgjøre
 * hvilke felter som tegnes, og av analysen for å vite hvilke akser det
 * overhodet gir mening å krysse på.
 */
export function relevansFor(omraade: OmraadeKode): Relevans {
  switch (omraadeFamilie(omraade)) {
    case "FULLSVING":
      return { ...INGEN, motorikk: true, belastning: true, press: true, dimensjon: true };
    case "NAERSPILL":
      return { ...INGEN, belastning: true, press: true, dimensjon: true };
    case "BUNKER":
      return { ...INGEN, belastning: true, press: true, dimensjon: true, sandTrinn: true };
    case "PUTT":
      return { ...INGEN, belastning: true, press: true, dimensjon: true };
    case "BANE":
      return { ...INGEN, belastning: true, press: true, dimensjon: true };
    case "FYS":
      // Belastning og press skjules i UI, men lagres som default — analysen
      // skal kunne summere FYS sammen med resten uten hull i aksene.
      return { ...INGEN, fysParametere: true };
  }
}

/** Gjelder aksen dette området? Bekvemmelighet for UI-betingelser. */
export function gjelder(omraade: OmraadeKode, akse: Akse): boolean {
  return relevansFor(omraade)[akse];
}

/** Dimensjonene som gir mening for området, mest naturlige først. */
export function dimensjonerFor(omraade: OmraadeKode): readonly DimensjonKode[] {
  return DIMENSJONER[omraade];
}

export function erGyldigDimensjon(omraade: OmraadeKode, dimensjon: DimensjonKode): boolean {
  return DIMENSJONER[omraade].includes(dimensjon);
}

/**
 * FYS-defaultene. Feltene vises aldri for FYS, men skal likevel ha en verdi i
 * basen slik at en FYS-drill kan summeres på samme akser som resten.
 */
export const FYS_DEFAULT = { belastning: "INNENDORS", press: "ALENE" } as const;

export type DrillMerking = {
  omraade: OmraadeKode;
  motorikk?: unknown;
  press?: unknown;
  belastning?: unknown;
  dimensjon?: DimensjonKode | null;
  sandTrinn?: unknown;
};

/**
 * Vasker en drill-merking mot matrisen: verdier på akser som ikke gjelder
 * området nulles ut, og FYS får sine defaults. Beskytter analysen mot at et
 * lagret felt overlever en områdeendring — en putt-drill som fortsatt bærer
 * motorikk fra da den var en chip-drill ville gitt en falsk rad i
 * motorikk-analysen. Blokkerer ingenting for brukeren.
 */
export function vaskMotRelevans<T extends DrillMerking>(merking: T): T {
  const r = relevansFor(merking.omraade);
  const dimensjon =
    r.dimensjon && merking.dimensjon && erGyldigDimensjon(merking.omraade, merking.dimensjon)
      ? merking.dimensjon
      : null;
  return {
    ...merking,
    motorikk: r.motorikk ? merking.motorikk : null,
    press: r.press ? merking.press : FYS_DEFAULT.press,
    belastning: r.belastning ? merking.belastning : FYS_DEFAULT.belastning,
    dimensjon,
    sandTrinn: r.sandTrinn ? merking.sandTrinn : null,
  };
}
