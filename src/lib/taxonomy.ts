import { z } from "zod";
import type { PyramidArea, LPhase } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Drill-modus: FYS vs GOLF
// ---------------------------------------------------------------------------

export type DrillModus = "FYS" | "GOLF";

export const PYRAMIDE = {
  FYS:  { kode: "FYS"  as const, label: "Fysisk",    drillModus: "FYS"  as DrillModus, farge: "pyr-fys" },
  TEK:  { kode: "TEK"  as const, label: "Teknisk",   drillModus: "GOLF" as DrillModus, farge: "pyr-tek" },
  SLAG: { kode: "SLAG" as const, label: "Slag",       drillModus: "GOLF" as DrillModus, farge: "pyr-slag" },
  SPILL:{ kode: "SPILL"as const, label: "Spill",      drillModus: "GOLF" as DrillModus, farge: "pyr-spill" },
  TURN: { kode: "TURN" as const, label: "Turnering",  drillModus: "GOLF" as DrillModus, farge: "pyr-turn" },
} as const;

export function getDrillModus(area: PyramidArea): DrillModus {
  return area === "FYS" ? "FYS" : "GOLF";
}

export function isFysDrill(area: PyramidArea): boolean {
  return area === "FYS";
}

// ---------------------------------------------------------------------------
// FYS-spesifikke typer
// ---------------------------------------------------------------------------

export type FysParameterSett = {
  reps: boolean;
  sets: boolean;
  kg: boolean;
  tid: boolean;
  sone: boolean;
  type: boolean;
};

export const FYS_TRENINGSTYPER = {
  STYRKE:       { kode: "STYRKE",       label: "Styrke",       params: { reps: true,  sets: true,  kg: true,  tid: false, sone: false, type: false } satisfies FysParameterSett },
  BEVEGELIGHET: { kode: "BEVEGELIGHET", label: "Bevegelighet", params: { reps: false, sets: true,  kg: false, tid: true,  sone: false, type: true  } satisfies FysParameterSett },
  KONDISJON:    { kode: "KONDISJON",    label: "Kondisjon",    params: { reps: false, sets: false, kg: false, tid: true,  sone: true,  type: true  } satisfies FysParameterSett },
  MOBILITET:    { kode: "MOBILITET",    label: "Mobilitet",    params: { reps: true,  sets: true,  kg: false, tid: true,  sone: false, type: false } satisfies FysParameterSett },
  AKTIVERING:   { kode: "AKTIVERING",   label: "Aktivering",   params: { reps: true,  sets: true,  kg: false, tid: false, sone: false, type: false } satisfies FysParameterSett },
} as const;

export type FysTreningstype = keyof typeof FYS_TRENINGSTYPER;

export const FYS_MUSKELGRUPPER = [
  { kode: "HOFTEFLEKSORER",   label: "Hoftefleksorer",   golfRelevans: "Hofterotasjon i nedsving" },
  { kode: "GLUTEUS",          label: "Gluteus",          golfRelevans: "Kraft og stabilitet i nedsving" },
  { kode: "CORE",             label: "Core",             golfRelevans: "Rotasjonsstabilitet, X-faktor" },
  { kode: "SKULDRE",          label: "Skuldre",          golfRelevans: "Armplan og skulderrotasjon" },
  { kode: "THORAX",           label: "Thorax",           golfRelevans: "Brystrotasjon og holdning" },
  { kode: "HAMSTRINGS",       label: "Hamstrings",       golfRelevans: "Benstabilitet og kraft" },
  { kode: "UNDERARMER",       label: "Underarmer",       golfRelevans: "Grep og hondledskontroll" },
  { kode: "RYGG",             label: "Rygg",             golfRelevans: "Holdning og rotasjon" },
  { kode: "QUADRICEPS",       label: "Quadriceps",       golfRelevans: "Benstyrke og balanse" },
] as const;

export type Muskelgruppe = (typeof FYS_MUSKELGRUPPER)[number]["kode"];

export const KONDISJON_SONER = [
  { kode: "SONE_1", label: "Sone 1 — Restitusjon", hrProsent: "50-60%", rpe: "1-2" },
  { kode: "SONE_2", label: "Sone 2 — Aerob base",  hrProsent: "60-70%", rpe: "3-4" },
  { kode: "SONE_3", label: "Sone 3 — Terskel",      hrProsent: "70-80%", rpe: "5-6" },
  { kode: "SONE_4", label: "Sone 4 — VO2max",       hrProsent: "80-90%", rpe: "7-8" },
  { kode: "SONE_5", label: "Sone 5 — Anaerob",      hrProsent: "90-100%",rpe: "9-10" },
] as const;

export type KondisjonSone = (typeof KONDISJON_SONER)[number]["kode"];

export const BEVEGELIGHET_TYPER = [
  { kode: "STATISK",  label: "Statisk strekk" },
  { kode: "DYNAMISK", label: "Dynamisk strekk" },
  { kode: "PNF",      label: "PNF" },
  { kode: "MYOFASCIAL",label: "Myofascial release" },
] as const;

export const KONDISJON_AKTIVITETER = [
  { kode: "GANGE",     label: "Gange" },
  { kode: "LOPING",    label: "Loping" },
  { kode: "SYKKEL",    label: "Sykkel" },
  { kode: "ROING",     label: "Roing" },
  { kode: "SVOMMING",  label: "Svomming" },
  { kode: "SKIERG",    label: "SkiErg" },
  { kode: "INTERVALL", label: "Intervall" },
  { kode: "ANNET",     label: "Annet" },
] as const;

// ---------------------------------------------------------------------------
// GOLF-spesifikke typer
// ---------------------------------------------------------------------------

export type SGKategori = "TEE" | "TILNAERMING" | "KORT_SPILL" | "PUTTING" | "SPILL";

export const TRENINGSOMRADER = [
  { kode: "TEE",     label: "Tee-slag",         sgKategori: "TEE" as SGKategori },
  { kode: "INN200",  label: "Innspill 150-200m", sgKategori: "TILNAERMING" as SGKategori },
  { kode: "INN150",  label: "Innspill 100-150m", sgKategori: "TILNAERMING" as SGKategori },
  { kode: "INN100",  label: "Innspill 50-100m",  sgKategori: "TILNAERMING" as SGKategori },
  { kode: "INN50",   label: "Innspill 0-50m",    sgKategori: "KORT_SPILL" as SGKategori },
  { kode: "CHIP",    label: "Chip",              sgKategori: "KORT_SPILL" as SGKategori },
  { kode: "PITCH",   label: "Pitch",             sgKategori: "KORT_SPILL" as SGKategori },
  { kode: "LOB",     label: "Lob",               sgKategori: "KORT_SPILL" as SGKategori },
  { kode: "BUNKER",  label: "Bunker",            sgKategori: "KORT_SPILL" as SGKategori },
  { kode: "PUTT0_3", label: "Putt 0-3m",         sgKategori: "PUTTING" as SGKategori },
  { kode: "PUTT3_6", label: "Putt 3-6m",         sgKategori: "PUTTING" as SGKategori },
  { kode: "PUTT6_10",label: "Putt 6-10m",        sgKategori: "PUTTING" as SGKategori },
  { kode: "PUTT10_20",label:"Putt 10-20m",       sgKategori: "PUTTING" as SGKategori },
  { kode: "PUTT20_40",label:"Putt 20-40m",       sgKategori: "PUTTING" as SGKategori },
  { kode: "PUTT40P", label: "Putt 40m+",         sgKategori: "PUTTING" as SGKategori },
  { kode: "SPILL",   label: "Spill (simulert)",  sgKategori: "SPILL" as SGKategori },
] as const;

export type Treningsomrade = (typeof TRENINGSOMRADER)[number]["kode"];

export const L_FASER = [
  { kode: "L_KROPP", label: "L-Kropp",  beskrivelse: "Kroppen laerer bevegelsen",            csAnbefalt: "50-60%", utstyr: "Speil, alignment-sticks" },
  { kode: "L_ARM",   label: "L-Arm",    beskrivelse: "Armene integreres i bevegelsen",       csAnbefalt: "60-70%", utstyr: "Alignment-sticks, impact-bag" },
  { kode: "L_KOLLE", label: "L-Kolle",  beskrivelse: "Kollen inkluderes, sakte tempo",       csAnbefalt: "60-75%", utstyr: "Kolle, skumpute-baller" },
  { kode: "L_BALL",  label: "L-Ball",   beskrivelse: "Ball og maal, kontrollert repetisjon",  csAnbefalt: "70-85%", utstyr: "Kolle, baller, maal" },
  { kode: "L_AUTO",  label: "L-Auto",   beskrivelse: "Automatisering under press",           csAnbefalt: "85-100%",utstyr: "Full bag, bane" },
] as const;

export type LFaseKode = (typeof L_FASER)[number]["kode"];

// Standard 10-trinns P-system (MORAD). P7 = Impact (treff). Holdes konsistent med
// P_POSITIONS i src/components/teknisk-plan/constants.ts — samme posisjoner, samme nummerering.
export const P_POSISJONER = [
  { kode: "P1.0",  label: "P1 — Adresse" },
  { kode: "P2.0",  label: "P2 — Takeaway (kølle parallell)" },
  { kode: "P3.0",  label: "P3 — Halvveis tilbake (venstre arm parallell)" },
  { kode: "P4.0",  label: "P4 — Topp-posisjon" },
  { kode: "P5.0",  label: "P5 — Transisjon" },
  { kode: "P6.0",  label: "P6 — Halvveis ned (kølle parallell)" },
  { kode: "P7.0",  label: "P7 — Impact" },
  { kode: "P8.0",  label: "P8 — Tidlig oppfølging" },
  { kode: "P9.0",  label: "P9 — Kølle parallell etter impact" },
  { kode: "P10.0", label: "P10 — Finish" },
] as const;

export type PPosisjonsKode = (typeof P_POSISJONER)[number]["kode"];

export const CS_NIVAER = [
  { kode: "CS50",  label: "50%",  verdi: 50,  beskrivelse: "Supersakte, kun form" },
  { kode: "CS60",  label: "60%",  verdi: 60,  beskrivelse: "Sakte, bevisst tempo" },
  { kode: "CS70",  label: "70%",  verdi: 70,  beskrivelse: "Kontrollert, lett treff" },
  { kode: "CS80",  label: "80%",  verdi: 80,  beskrivelse: "Normal treningshastighet" },
  { kode: "CS90",  label: "90%",  verdi: 90,  beskrivelse: "Nesten maks, kontrollert" },
  { kode: "CS100", label: "100%", verdi: 100, beskrivelse: "Full speed" },
] as const;

// ---------------------------------------------------------------------------
// Miljo og press (session-nivaa)
// ---------------------------------------------------------------------------

export const M_MILJO = [
  { kode: "M0", label: "Innendors",            beskrivelse: "Studio, simulator, innendorsanlegg" },
  { kode: "M1", label: "Range — tomt",         beskrivelse: "Range uten forstyrrelser" },
  { kode: "M2", label: "Range — normalt",      beskrivelse: "Range med andre spillere" },
  { kode: "M3", label: "Bane — treningsrunde",  beskrivelse: "Bane, treningsrunde" },
  { kode: "M4", label: "Bane — simulert match", beskrivelse: "Bane, simulert turneringssituasjon" },
  { kode: "M5", label: "Turnering",            beskrivelse: "Reell turneringsrunde" },
] as const;

export const PR_PRESS = [
  { kode: "PR1", label: "Ingen press",    beskrivelse: "Fritt utforskende, ingen konsekvens" },
  { kode: "PR2", label: "Lav press",      beskrivelse: "Enkle maal, liten konsekvens" },
  { kode: "PR3", label: "Moderat press",  beskrivelse: "Tydelige maal, moderat konsekvens" },
  { kode: "PR4", label: "Hoy press",      beskrivelse: "Krevende maal, merkbar konsekvens" },
  { kode: "PR5", label: "Maks press",     beskrivelse: "Simulert turneringssituasjon, full konsekvens" },
] as const;

export type PressKode = (typeof PR_PRESS)[number]["kode"];

// ---------------------------------------------------------------------------
// Drill-mal-kategorier (mapper til pyramide)
// ---------------------------------------------------------------------------

export const DRILL_MAL_KATEGORIER = [
  { kode: "STYRKE",       label: "Styrke",            pyramide: "FYS" as PyramidArea },
  { kode: "BEVEGELIGHET", label: "Bevegelighet",      pyramide: "FYS" as PyramidArea },
  { kode: "KONDISJON",    label: "Kondisjon",         pyramide: "FYS" as PyramidArea },
  { kode: "TEKNIKK",      label: "Teknikk-drill",     pyramide: "TEK" as PyramidArea },
  { kode: "SLAG_DRILL",   label: "Slag-drill",        pyramide: "SLAG" as PyramidArea },
  { kode: "PUTT_DRILL",   label: "Putt-drill",        pyramide: "SLAG" as PyramidArea },
  { kode: "BUNKER_DRILL", label: "Bunker-drill",      pyramide: "SLAG" as PyramidArea },
  { kode: "CHIP_DRILL",   label: "Chip/Pitch-drill",  pyramide: "SLAG" as PyramidArea },
  { kode: "SPILL_DRILL",  label: "Spill-drill",       pyramide: "SPILL" as PyramidArea },
  { kode: "KAMP_DRILL",   label: "Kamp-drill",        pyramide: "TURN" as PyramidArea },
  { kode: "MENTAL_DRILL", label: "Mental-drill",       pyramide: "TURN" as PyramidArea },
] as const;

// ---------------------------------------------------------------------------
// Periode-typer med constraints
// ---------------------------------------------------------------------------

export type PeriodeConstraints = {
  csMax: number;
  maxVolumMin: number | null;
  maxOkterUke: number | null;
  minHviledager: number;
  lFaserTillatt: LFaseKode[];
  turneringsLaas: boolean;
};

export const PERIODE_TYPER: Record<LPhase, PeriodeConstraints> = {
  GRUNN: {
    csMax: 70,
    maxVolumMin: null,
    maxOkterUke: null,
    minHviledager: 2,
    lFaserTillatt: ["L_KROPP", "L_ARM", "L_KOLLE"],
    turneringsLaas: false,
  },
  SPESIAL: {
    csMax: 90,
    maxVolumMin: 600,
    maxOkterUke: 6,
    minHviledager: 1,
    lFaserTillatt: ["L_BALL", "L_AUTO"],
    turneringsLaas: false,
  },
  TURNERING: {
    csMax: 100,
    maxVolumMin: 300,
    maxOkterUke: 5,
    minHviledager: 2,
    lFaserTillatt: ["L_AUTO"],
    turneringsLaas: true,
  },
  // 8c.1 — nye periodetyper. Foreløpige constraints (Anders justerer):
  // anbefalinger, aldri sperrer.
  TESTUKE: {
    csMax: 100,
    maxVolumMin: 480,
    maxOkterUke: 5,
    minHviledager: 1,
    lFaserTillatt: ["L_BALL", "L_AUTO"],
    turneringsLaas: false,
  },
  FERIE: {
    csMax: 100,
    maxVolumMin: 0,
    maxOkterUke: 0,
    minHviledager: 7,
    lFaserTillatt: [],
    turneringsLaas: false,
  },
  TRENINGSSAMLING: {
    csMax: 90,
    maxVolumMin: null,
    maxOkterUke: null,
    minHviledager: 0,
    lFaserTillatt: ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"],
    turneringsLaas: false,
  },
  HELDAGSSAMLING: {
    csMax: 90,
    maxVolumMin: null,
    maxOkterUke: null,
    minHviledager: 0,
    lFaserTillatt: ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"],
    turneringsLaas: false,
  },
};

// ---------------------------------------------------------------------------
// Spillerkategorier
// ---------------------------------------------------------------------------

export const SPILLERKATEGORIER = [
  { kode: "A", label: "A — Aspirerende Tour",  hcpRange: "+5 til 0",    alder: "18+" },
  { kode: "B", label: "B — Lav-HCP",           hcpRange: "0 til 5",     alder: "16+" },
  { kode: "C", label: "C — Middels-HCP",       hcpRange: "5 til 12",    alder: "14+" },
  { kode: "D", label: "D — Hoy-HCP",           hcpRange: "12 til 24",   alder: "12+" },
  { kode: "E", label: "E — Nybegynner",        hcpRange: "24+",         alder: "Alle" },
  { kode: "J", label: "J — Junior elite",      hcpRange: "0 til 8",     alder: "13-18" },
  { kode: "K", label: "K — Junior utvikling",  hcpRange: "8+",          alder: "10-16" },
] as const;

// ---------------------------------------------------------------------------
// Template-fokus (kobler mot treningsomraader)
// ---------------------------------------------------------------------------

export const TEMPLATE_FOCUS = [
  { kode: "FULL_BAG",      label: "Full bag",           omraader: ["TEE", "INN200", "INN150", "INN100", "INN50", "CHIP", "PITCH", "PUTT0_3", "PUTT3_6"] as Treningsomrade[] },
  { kode: "KORT_SPILL",    label: "Nærspill",           omraader: ["INN50", "CHIP", "PITCH", "LOB", "BUNKER"] as Treningsomrade[] },
  { kode: "PUTTING",       label: "Putting",            omraader: ["PUTT0_3", "PUTT3_6", "PUTT6_10", "PUTT10_20", "PUTT20_40", "PUTT40P"] as Treningsomrade[] },
  { kode: "LANG_SPILL",    label: "Langt spill",        omraader: ["TEE", "INN200", "INN150"] as Treningsomrade[] },
  { kode: "TILNAERMING",   label: "Tilnærming",         omraader: ["INN200", "INN150", "INN100", "INN50"] as Treningsomrade[] },
  { kode: "BUNKER_FOKUS",  label: "Bunker",             omraader: ["BUNKER"] as Treningsomrade[] },
  { kode: "TURNERINGSPREP", label: "Turneringsforberedelse", omraader: ["SPILL"] as Treningsomrade[] },
] as const;

export function getOmraaderForFokus(fokusKode: string): Treningsomrade[] {
  const match = TEMPLATE_FOCUS.find((f) => f.kode === fokusKode);
  return match ? [...match.omraader] : [];
}

// ---------------------------------------------------------------------------
// LIFE-koder (livsferdigheter)
// ---------------------------------------------------------------------------

// Kanon: LIFE-rammeverkets 5 dimensjoner (bekreftet 2026-06-23, matcher
// ak-second-brain/wiki/concepts/life-rammeverket.md). Mapper til NGF Impact.
export const LIFE_KODER = [
  { kode: "LIFE_SELV", label: "Selvfølelse" },
  { kode: "LIFE_SOS",  label: "Sosial" },
  { kode: "LIFE_EMO",  label: "Emosjonell" },
  { kode: "LIFE_KAR",  label: "Karakter" },
  { kode: "LIFE_RES",  label: "Resiliens" },
] as const;

// ---------------------------------------------------------------------------
// Zod-skjemaer for parametersJson
// ---------------------------------------------------------------------------

export const FysParametersSchema = z.object({
  modus: z.literal("FYS"),
  fysType: z.enum(["STYRKE", "BEVEGELIGHET", "KONDISJON", "MOBILITET", "AKTIVERING"]),
  muskelgrupper: z.array(z.string()).default([]),
  kondisjonSone: z.string().nullable().default(null),
  bevegelighetType: z.string().nullable().default(null),
  kondisjonAktivitet: z.string().nullable().default(null),
  reps: z.number().nullable().default(null),
  sets: z.number().nullable().default(null),
  kg: z.number().nullable().default(null),
  tidSekunder: z.number().nullable().default(null),
});

export type FysParameters = z.infer<typeof FysParametersSchema>;

export const GolfParametersSchema = z.object({
  modus: z.literal("GOLF"),
  treningsomrade: z.string().nullable().default(null),
  lFase: z.string().nullable().default(null),
  pPosisjoner: z.array(z.string()).default([]),
  environment: z.string().nullable().default(null),
});

export type GolfParameters = z.infer<typeof GolfParametersSchema>;

export const DrillParametersSchema = z.discriminatedUnion("modus", [
  FysParametersSchema,
  GolfParametersSchema,
]);

export type DrillParameters = z.infer<typeof DrillParametersSchema>;

// ---------------------------------------------------------------------------
// Validering av periode-constraints
// ---------------------------------------------------------------------------

export type PeriodeValidering = {
  ok: boolean;
  advarsler: string[];
};

export function validerPeriodBlock(
  lPhase: LPhase,
  opts: { weeklyVolMax?: number | null; okterUke?: number | null; csTarget?: number | null },
): PeriodeValidering {
  const c = PERIODE_TYPER[lPhase];
  const advarsler: string[] = [];

  if (opts.csTarget != null && opts.csTarget > c.csMax) {
    advarsler.push(`CS ${opts.csTarget}% overskrider maks ${c.csMax}% for ${lPhase}`);
  }
  if (c.maxVolumMin != null && opts.weeklyVolMax != null && opts.weeklyVolMax > c.maxVolumMin) {
    advarsler.push(`Volum ${opts.weeklyVolMax} min/uke overskrider maks ${c.maxVolumMin} min for ${lPhase}`);
  }
  if (c.maxOkterUke != null && opts.okterUke != null && opts.okterUke > c.maxOkterUke) {
    advarsler.push(`${opts.okterUke} okter/uke overskrider maks ${c.maxOkterUke} for ${lPhase}`);
  }

  return { ok: advarsler.length === 0, advarsler };
}
