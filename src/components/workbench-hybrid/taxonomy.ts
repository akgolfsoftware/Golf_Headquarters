/**
 * AK-formel-taksonomi — reprodusert 1:1 fra fasitens JS (dimOpts + dimLabels,
 * ~linje 1123–1145). Dette er Anders' egen kodifisering av en treningsøkt.
 * IKKE endre verdiene uten Anders' beslutning.
 */

export type DimField =
  | "cat"
  | "omr"
  | "m"
  | "pr"
  | "cs"
  | "lfase"
  | "praksis"
  | "fysType"
  | "sone"
  | "periode"
  | "ppos";

/** Mulige verdier per dimensjon (rekkefølge bevart fra fasit). */
export const DIM_OPTS: Record<DimField, string[]> = {
  cat: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
  omr: [
    "TEE", "INN200", "INN150", "INN100", "INN50", "CHIP", "PITCH", "LOB",
    "BUNKER", "PUTT0_3", "PUTT3_6", "PUTT6_10", "PUTT10_20", "PUTT20_40",
    "PUTT40P", "SPILL",
  ],
  m: ["M0", "M1", "M2", "M3", "M4", "M5"],
  pr: ["PR1", "PR2", "PR3", "PR4", "PR5"],
  cs: ["CS50", "CS60", "CS70", "CS80", "CS90", "CS100"],
  lfase: ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"],
  praksis: ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"],
  fysType: ["STYRKE", "KONDISJON", "BEVEGELIGHET", "POWER"],
  sone: ["SONE_1", "SONE_2", "SONE_3", "SONE_4", "SONE_5"],
  periode: ["GRUNN", "SPESIALISERING", "TURNERING", "EVALUERING", "FERIE"],
  ppos: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"],
};

/** Lesbare etiketter per verdi (fasit dimLabels). */
export const DIM_LABELS: Partial<Record<DimField, Record<string, string>>> = {
  omr: {
    TEE: "Tee-slag", INN200: "Innspill 150–200 m", INN150: "Innspill 100–150 m",
    INN100: "Innspill 50–100 m", INN50: "Innspill 0–50 m", CHIP: "Chip",
    PITCH: "Pitch", LOB: "Lob", BUNKER: "Bunker", PUTT0_3: "Putt 0–3 m",
    PUTT3_6: "Putt 3–6 m", PUTT6_10: "Putt 6–10 m", PUTT10_20: "Putt 10–20 m",
    PUTT20_40: "Putt 20–40 m", PUTT40P: "Putt 40 m+", SPILL: "Spill (simulert)",
  },
  m: {
    M0: "M0 — Innendørs", M1: "M1 — Range tomt", M2: "M2 — Range normalt",
    M3: "M3 — Bane treningsrunde", M4: "M4 — Bane simulert match", M5: "M5 — Turnering",
  },
  pr: {
    PR1: "PR1 — Ingen press", PR2: "PR2 — Lav press", PR3: "PR3 — Moderat press",
    PR4: "PR4 — Høy press", PR5: "PR5 — Maks press",
  },
  cs: {
    CS50: "CS50 · 50 %", CS60: "CS60 · 60 %", CS70: "CS70 · 70 %",
    CS80: "CS80 · 80 %", CS90: "CS90 · 90 %", CS100: "CS100 · 100 %",
  },
  lfase: {
    L_KROPP: "L-Kropp", L_ARM: "L-Arm", L_KOLLE: "L-Kølle", L_BALL: "L-Ball", L_AUTO: "L-Auto",
  },
  praksis: {
    BLOKK: "Blokk", RANDOM: "Variasjon", KONKURRANSE: "Komparativ/Konkurranse", SPILL_TEST: "Simulator/Test",
  },
  fysType: {
    STYRKE: "Styrke", KONDISJON: "Kondisjon", BEVEGELIGHET: "Bevegelighet",
    POWER: "Power", MOBILITET: "Bevegelighet", AKTIVERING: "Styrke",
  },
  sone: {
    SONE_1: "Sone 1 — Restitusjon", SONE_2: "Sone 2 — Aerob base",
    SONE_3: "Sone 3 — Terskel", SONE_4: "Sone 4 — VO2max", SONE_5: "Sone 5 — Anaerob",
  },
  periode: {
    GRUNN: "Grunnperiode", SPESIALISERING: "Spesialiseringsperiode",
    TURNERING: "Turneringsperiode", EVALUERING: "Evalueringsperiode", FERIE: "Ferieperiode",
  },
};

/** Titler i dimensjon-velger-modalen (fasit `titles`). */
export const DIM_TITLES: Record<DimField, string> = {
  cat: "Pyramide",
  omr: "Treningsområde",
  m: "Miljø (M0–M5)",
  pr: "Press (PR1–PR5)",
  cs: "Hastighet (CS)",
  lfase: "L-fase",
  praksis: "Praksistype",
  fysType: "FYS-type",
  sone: "Intensitetssone",
  periode: "Periode",
  ppos: "P-posisjon (P1–P10)",
};

/** Slå opp lesbar etikett; faller tilbake til råverdien. */
export function dimLabel(field: DimField, val: string): string {
  return DIM_LABELS[field]?.[val] ?? val;
}
