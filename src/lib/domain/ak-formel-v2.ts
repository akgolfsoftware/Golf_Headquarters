/**
 * AK-formel v2 — kanonisk vokabular for treningsplanlegging.
 *
 * Fasit: `docs/FASIT-AK-GOLF-HQ.md` (levert av Anders 19.08.2026) og
 * `docs/spec-treningsplanlegging-2026-08-19.md`. Formelen er en MERKELAPP,
 * aldri et krav — ingen regel håndheves noe sted (beslutning 18.08.2026).
 *
 *     PYRAMIDE_OMRAADE_MOTORIKK_BELASTNING_PRESS
 *
 * Formelen bæres av hver enkelt drill/øvelse/test, ikke av økta (spec 20.08).
 *
 * NB: `src/lib/taxonomy.ts` sin TRENINGSOMRADER er den eldre 17-listen
 * (INNSPILL_0_50, sju puttebånd, ingen STYRKE/MOBILITET/BANE). Fasiten sier
 * eksplisitt at denne modulen vinner. Den gamle listen står urørt fordi den
 * driver eksisterende UI — bruk `fraGammelOmraadekode()` når du krysser over.
 */

import type { LFase, MMiljo, PRPress } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Pyramide
// ---------------------------------------------------------------------------

export const PYRAMIDE_KODER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type PyramideKode = (typeof PYRAMIDE_KODER)[number];

export const PYRAMIDE_LABEL: Record<PyramideKode, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Golfslag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// ---------------------------------------------------------------------------
// Treningsområder — 19, fasitens liste
// ---------------------------------------------------------------------------
//
// Rettet av Anders 20.08.2026 (fase 0, runde 2): putt er seks bånd (10–40 delt
// i to) og FYS er tre områder (kondisjon lagt til, mobilitet omdøpt
// bevegelighet). «17-listen» er et historisk navn — antallet er nå 19.

/**
 * Familien styrer relevans-matrisen (se `omrade-relevans.ts`).
 *
 * NB: familien er IKKE en pyramide-binding. En BANE-drill kan stå under TEK,
 * SLAG, SPILL eller TURN — pyramide og område er uavhengige akser overalt
 * (Anders 20.08). Familien sier bare hvilke felter området har.
 */
export type OmraadeFamilie = "FULLSVING" | "NAERSPILL" | "BUNKER" | "PUTT" | "FYS" | "BANE";

/** Putteavstander i fot, resten i meter (fasiten). FYS og bane har ingen. */
export type Enhet = "m" | "ft" | null;

/**
 * Hva en rep er på dette området.
 *
 * KONDISJON er merket uavklart i relevans-matrisen v2 §Åpne punkter — «serier ×
 * reps» passer ikke løping/sykling/roing. Minutter er forslaget, ikke bekreftet.
 */
export type RepsEnhet = "SLAG" | "PUTTER" | "HULL" | "SERIER_REPS" | "MINUTTER";

export type OmraadeDef = {
  kode: OmraadeKode;
  label: string;
  familie: OmraadeFamilie;
  enhet: Enhet;
  repsEnhet: RepsEnhet;
};

export const OMRAADE_KODER = [
  "TEE_TOTAL",
  "INNSPILL_200",
  "INNSPILL_150",
  "INNSPILL_100",
  "INNSPILL_50",
  "CHIP",
  "PITCH",
  "LOB",
  "BUNKER",
  "PUTT_0_3",
  "PUTT_3_5",
  "PUTT_5_10",
  "PUTT_10_25",
  "PUTT_25_40",
  "PUTT_40_PLUSS",
  "STYRKE",
  "KONDISJON",
  "BEVEGELIGHET",
  "BANE",
] as const;

export type OmraadeKode = (typeof OMRAADE_KODER)[number];

export const OMRAADER: readonly OmraadeDef[] = [
  { kode: "TEE_TOTAL", label: "Utslag", familie: "FULLSVING", enhet: "m", repsEnhet: "SLAG" },
  { kode: "INNSPILL_200", label: "Innspill ~200 m", familie: "FULLSVING", enhet: "m", repsEnhet: "SLAG" },
  { kode: "INNSPILL_150", label: "Innspill ~150 m", familie: "FULLSVING", enhet: "m", repsEnhet: "SLAG" },
  { kode: "INNSPILL_100", label: "Innspill ~100 m", familie: "FULLSVING", enhet: "m", repsEnhet: "SLAG" },
  { kode: "INNSPILL_50", label: "Innspill ~50 m", familie: "FULLSVING", enhet: "m", repsEnhet: "SLAG" },
  { kode: "CHIP", label: "Chip", familie: "NAERSPILL", enhet: "m", repsEnhet: "SLAG" },
  { kode: "PITCH", label: "Pitch", familie: "NAERSPILL", enhet: "m", repsEnhet: "SLAG" },
  { kode: "LOB", label: "Lob", familie: "NAERSPILL", enhet: "m", repsEnhet: "SLAG" },
  { kode: "BUNKER", label: "Bunker", familie: "BUNKER", enhet: "m", repsEnhet: "SLAG" },
  { kode: "PUTT_0_3", label: "Putt 0–3 fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "PUTT_3_5", label: "Putt 3–5 fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "PUTT_5_10", label: "Putt 5–10 fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "PUTT_10_25", label: "Putt 10–25 fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "PUTT_25_40", label: "Putt 25–40 fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "PUTT_40_PLUSS", label: "Putt 40+ fot", familie: "PUTT", enhet: "ft", repsEnhet: "PUTTER" },
  { kode: "STYRKE", label: "Styrke", familie: "FYS", enhet: null, repsEnhet: "SERIER_REPS" },
  { kode: "KONDISJON", label: "Kondisjon", familie: "FYS", enhet: null, repsEnhet: "MINUTTER" },
  { kode: "BEVEGELIGHET", label: "Bevegelighet", familie: "FYS", enhet: null, repsEnhet: "MINUTTER" },
  { kode: "BANE", label: "Banespill", familie: "BANE", enhet: null, repsEnhet: "HULL" },
] as const;

const OMRAADE_KART = new Map<string, OmraadeDef>(OMRAADER.map((o) => [o.kode, o]));

export function omraadeDef(kode: OmraadeKode): OmraadeDef {
  const def = OMRAADE_KART.get(kode);
  if (!def) throw new Error(`Ukjent område: ${kode}`);
  return def;
}

export function erOmraadeKode(verdi: unknown): verdi is OmraadeKode {
  return typeof verdi === "string" && OMRAADE_KART.has(verdi);
}

export function omraadeFamilie(kode: OmraadeKode): OmraadeFamilie {
  return omraadeDef(kode).familie;
}

// ---------------------------------------------------------------------------
// Motorikk · Belastning · Press
// ---------------------------------------------------------------------------

export const MOTORIKK_KODER = ["UTEN_BALL", "LAV_HAST", "AUTO"] as const;
export type MotorikkKode = (typeof MOTORIKK_KODER)[number];

export const MOTORIKK_LABEL: Record<MotorikkKode, string> = {
  UTEN_BALL: "Uten ball",
  LAV_HAST: "Lav hastighet",
  AUTO: "Automatikk",
};

/**
 * Enum-verdiene er ASCII (INNENDORS, TRENINGSOMRAADE) med norsk visningslag —
 * databasen skal aldri bære norske tegn (gap-evalueringen §6.11).
 */
export const BELASTNING_KODER = [
  "INNENDORS",
  "TRENINGSOMRAADE",
  "BANE",
  "KONKURRANSE",
] as const;
export type BelastningKode = (typeof BELASTNING_KODER)[number];

export const BELASTNING_LABEL: Record<BelastningKode, string> = {
  INNENDORS: "Innendørs",
  TRENINGSOMRAADE: "Treningsområde",
  BANE: "Bane",
  KONKURRANSE: "Konkurranse",
};

export const PRESS_KODER = ["ALENE", "OBSERVERT", "KONKURRANSE", "TURNERING"] as const;
export type PressKode = (typeof PRESS_KODER)[number];

export const PRESS_LABEL: Record<PressKode, string> = {
  ALENE: "Alene",
  OBSERVERT: "Observert",
  KONKURRANSE: "Konkurranse",
  TURNERING: "Turnering",
};

/**
 * Egne teknikk-dimensjoner — analysens sjette akse.
 *
 * Dimensjonen erstatter motorikk der motorikk ikke gjelder (nærspill, bunker,
 * putt, bane) og supplerer den der den gjelder (fullsving). Fullsving-kodene er
 * valgt fordi de matcher TrackMan-parametrene 1:1 — startretning = Launch
 * Direction, kurve = Spin Axis, høyde = Apex Height, treffpunkt =
 * Face-to-Path/Smash — så Truth Layer-koblingen blir presis uten oversettelseslag.
 *
 * En drill bærer KUN ÉN dimensjon (Anders 20.08, rettet ned fra «flere med
 * dominant-markering»). Alltid valgfri, aldri et krav.
 *
 * `SIKTE` dekker både puttingens «sikte» og fullsvingens «sikte/oppstilling» —
 * samme begrep, én kode.
 */
export const DIMENSJON_KODER = [
  // Fullsving
  "SIKTE",
  "STARTRETNING",
  "KURVE",
  "HOYDE",
  "TREFFPUNKT",
  "LENGDEKONTROLL",
  "SPINN",
  // Nærspill
  "LANDINGSPUNKT",
  "UTRULLING",
  "KOLLEVALG",
  "BOUNCE_BRUK",
  // Bunker
  "SANDINNGANG",
  "LIE_VARIASJON",
  // Putting
  "GREENLESING",
  "BALLSTART",
  // Bane
  "SPILLEFORMAT",
  "STRATEGIOPPGAVE",
] as const;

export type DimensjonKode = (typeof DIMENSJON_KODER)[number];

export const DIMENSJON_LABEL: Record<DimensjonKode, string> = {
  SIKTE: "Sikte og oppstilling",
  STARTRETNING: "Startretning",
  KURVE: "Kurve",
  HOYDE: "Høyde",
  TREFFPUNKT: "Treffpunkt",
  LENGDEKONTROLL: "Lengdekontroll",
  SPINN: "Spinn",
  LANDINGSPUNKT: "Landingspunkt",
  UTRULLING: "Utrulling",
  KOLLEVALG: "Køllevalg",
  BOUNCE_BRUK: "Bruk av bounce",
  SANDINNGANG: "Sandinngang",
  LIE_VARIASJON: "Lie-variasjon",
  GREENLESING: "Greenlesing",
  BALLSTART: "Ballstart",
  SPILLEFORMAT: "Spilleformat",
  STRATEGIOPPGAVE: "Strategioppgave",
};

/** Sand-trappen — bunkerens eneste trappe-lignende verdi, atskilt fra motorikk. */
export const SAND_TRINN_KODER = ["UTEN_BALL_I_SAND", "MED_BALL"] as const;
export type SandTrinnKode = (typeof SAND_TRINN_KODER)[number];

export const SAND_TRINN_LABEL: Record<SandTrinnKode, string> = {
  UTEN_BALL_I_SAND: "Uten ball i sanden",
  MED_BALL: "Med ball",
};

// ---------------------------------------------------------------------------
// Formel-strengen
// ---------------------------------------------------------------------------

export type AkFormelV2 = {
  pyramide: PyramideKode;
  omraade: OmraadeKode;
  motorikk?: MotorikkKode | null;
  belastning?: BelastningKode | null;
  press?: PressKode | null;
};

/**
 * Bygger merkelappen. Akser som ikke gjelder området utelates helt — en
 * putt-drill får aldri et motorikk-ledd (spec 20.08).
 *
 * Eksempel: `TEK_CHIP_TRENINGSOMRAADE_ALENE`
 */
export function formelStreng(f: AkFormelV2): string {
  const ledd: (string | null | undefined)[] = [
    f.pyramide,
    f.omraade,
    f.motorikk,
    f.belastning,
    f.press,
  ];
  return ledd.filter((x): x is string => Boolean(x)).join("_");
}

// ---------------------------------------------------------------------------
// Broer fra v1-vokabularet
// ---------------------------------------------------------------------------

/**
 * L-fasene (v1) → motorikk (v2). De fem L-fasene beskrev kroppsdel-progresjon;
 * v2 har tre motoriske steg. L_KROPP/L_ARM/L_KOLLE er alle uten ball.
 */
export function motorikkFraLFase(fase: LFase | null | undefined): MotorikkKode | null {
  switch (fase) {
    case "L_KROPP":
    case "L_ARM":
    case "L_KOLLE":
      return "UTEN_BALL";
    case "L_BALL":
      return "LAV_HAST";
    case "L_AUTO":
      return "AUTO";
    default:
      return null;
  }
}

/** M0–M5 (v1) → belastning (v2). Mapping godkjent av Anders 20.08.2026. */
export function belastningFraMiljo(miljo: MMiljo | null | undefined): BelastningKode | null {
  switch (miljo) {
    case "M0":
    case "M1":
      return "INNENDORS";
    case "M2":
    case "M3":
      return "TRENINGSOMRAADE";
    case "M4":
      return "BANE";
    case "M5":
      return "KONKURRANSE";
    default:
      return null;
  }
}

/** PR1–PR5 (v1) → press (v2). Fire nivåer i v2; PR1/PR2 er begge «alene». */
export function pressFraPrPress(press: PRPress | null | undefined): PressKode | null {
  switch (press) {
    case "PR1":
    case "PR2":
      return "ALENE";
    case "PR3":
      return "OBSERVERT";
    case "PR4":
      return "KONKURRANSE";
    case "PR5":
      return "TURNERING";
    default:
      return null;
  }
}

/**
 * Gammel områdekode (taxonomy.ts / fri tekst) → fasitens 17.
 *
 * Den gamle listen hadde egen INNSPILL_0_50 og sju puttebånd; fasiten har fem.
 * Returnerer null når koden ikke lar seg plassere — kalleren skal da la feltet
 * stå tomt fremfor å gjette (fri tekst gir falske kategorier i analysen).
 */
export function fraGammelOmraadekode(verdi: string | null | undefined): OmraadeKode | null {
  if (!verdi) return null;
  const n = verdi.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (erOmraadeKode(n)) return n;

  const direkte: Record<string, OmraadeKode> = {
    TEE: "TEE_TOTAL",
    TEE_SLAG: "TEE_TOTAL",
    DRIVER: "TEE_TOTAL",
    // Gammel INNSPILL_0_50 var nærspill-bucket 0–50 m — nærmeste fasit-bånd.
    INNSPILL_0_50: "INNSPILL_50",
    PUTT_10_15: "PUTT_10_25",
    PUTT_15_25: "PUTT_10_25",
    PUTT_40: "PUTT_40_PLUSS",
    // Mobilitet er omdøpt bevegelighet (samme begrep, norsk navn).
    MOBILITET: "BEVEGELIGHET",
    PUTTING: "PUTT_5_10",
    SPILL: "BANE",
  };
  return direkte[n] ?? null;
}
