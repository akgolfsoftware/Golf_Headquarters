// =========================================================================
// WANG Toppidrett Fredrikstad — Årsplan 2026/27, datakontrakt for den nye
// fellesside-designfasiten («WANG Arsplan 2026-27.dc.html», Claude Design-
// pakke levert 25.08.2026). Transkribert ordrett fra designreferansens
// logikkdel — se
// docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/
// (README.md + DATA-KONTRAKT.md) for feltforklaring, og
// docs/treningsplanlegger/wang-toppidrett/ for de underliggende kildene
// (årshjul, kompetansemål, øktmal).
//
// Egen modul, adskilt fra wang-plan.ts: den nye fasiten har en annen
// periode-/aksemodell (6 perioder inkl. egen TEST-uke og splittet
// høst-/vårturnering) enn dagens `/team-wang`-side, og skal IKKE erstatte
// wang-plan.ts sine eksporter før komponentene som bruker dem er portet
// (se porteringsplanen, steg 2–6). Ingen elevnavn her — kun lærere/fag
// (personale, ikke PII om mindreårige) og aggregerte klassedata.
//
// Deterministisk som wang-plan.ts: all dato-aritmetikk går via `d()`/`iso()`
// (UTC), aldri `new Date()`/`Date.now()` på modulnivå.
// =========================================================================

import { d, iso, MONTHS_NO } from "./wang-plan";

// ---- Faser (fargekoding, delt av årshjul/månedsplan/kalender) -----------

export type FaseKey = "TURN" | "GRUNN" | "SPES" | "TEST" | "FERIE";

export interface FaseInfo {
  navn: string;
  farge: string;
  tint: string;
  tekst: string;
}

export const FASER: Record<FaseKey, FaseInfo> = {
  TURN: {
    navn: "Turnering",
    farge: "var(--cat-orange)",
    tint: "var(--tint-orange)",
    tekst: "var(--cat-orange)",
  },
  GRUNN: {
    navn: "Grunnperiode",
    farge: "var(--wang-teal)",
    tint: "var(--tint-teal)",
    tekst: "var(--wang-teal-text)",
  },
  SPES: {
    navn: "Spesialisering",
    farge: "var(--cat-blue)",
    tint: "var(--tint-blue)",
    tekst: "var(--cat-blue)",
  },
  TEST: {
    navn: "Testuke",
    farge: "var(--cat-purple)",
    tint: "var(--tint-purple)",
    tekst: "var(--cat-purple)",
  },
  FERIE: {
    navn: "Ferie",
    farge: "var(--neutral-400)",
    tint: "var(--tint-gray)",
    tekst: "var(--text-secondary)",
  },
};

// ---- Årshjulet: UKER (44 uker, uke 34 2026 → uke 24 2027) ---------------

export type UkeType =
  | "Turneringsuke"
  | "Testuke"
  | "Ferieuke"
  | "Avslutningsuke"
  | "Utviklingsuke"
  | "Samlingsuke"
  | "Overgangsuke"
  | "Pre-turnering";

/** [ukenummer, mandag (ISO), fase, type, notat (kan være tom streng)] */
export type UkeRad = [number, string, FaseKey, UkeType, string];

export const UKER: UkeRad[] = [
  [34, "2026-08-17", "TURN", "Pre-turnering", "Sesongform — siste sommerturneringer"],
  [35, "2026-08-24", "TURN", "Testuke", "NGF/Team Norway-tester"],
  [36, "2026-08-31", "TURN", "Testuke", "NGF/Team Norway-tester"],
  [37, "2026-09-07", "TURN", "Turneringsuke", ""],
  [38, "2026-09-14", "TURN", "Turneringsuke", ""],
  [39, "2026-09-21", "TURN", "Turneringsuke", ""],
  [40, "2026-09-28", "TURN", "Ferieuke", "Høstferie"],
  [41, "2026-10-05", "TURN", "Turneringsuke", ""],
  [42, "2026-10-12", "TURN", "Avslutningsuke", "Banen stenger — TURN avsluttes"],
  [43, "2026-10-19", "TEST", "Testuke", "Testuke — IUP-baseline"],
  [44, "2026-10-26", "GRUNN", "Utviklingsuke", "GRUNN start — ny teknikk"],
  [45, "2026-11-02", "GRUNN", "Utviklingsuke", ""],
  [46, "2026-11-09", "GRUNN", "Utviklingsuke", ""],
  [47, "2026-11-16", "GRUNN", "Utviklingsuke", ""],
  [48, "2026-11-23", "GRUNN", "Utviklingsuke", ""],
  [49, "2026-11-30", "GRUNN", "Utviklingsuke", ""],
  [50, "2026-12-07", "GRUNN", "Utviklingsuke", ""],
  [51, "2026-12-14", "GRUNN", "Utviklingsuke", ""],
  [52, "2026-12-21", "GRUNN", "Ferieuke", "Juleferie"],
  [53, "2026-12-28", "GRUNN", "Ferieuke", "Juleferie"],
  [1, "2027-01-04", "GRUNN", "Samlingsuke", "WANG fellessamling med Oslo"],
  [2, "2027-01-11", "GRUNN", "Utviklingsuke", ""],
  [3, "2027-01-18", "GRUNN", "Utviklingsuke", ""],
  [4, "2027-01-25", "GRUNN", "Utviklingsuke", ""],
  [5, "2027-02-01", "GRUNN", "Utviklingsuke", ""],
  [6, "2027-02-08", "GRUNN", "Utviklingsuke", "Intern teknisk sjekk"],
  [7, "2027-02-15", "GRUNN", "Samlingsuke", "WANG fellessamling med Oslo"],
  [8, "2027-02-22", "GRUNN", "Ferieuke", "Vinterferie"],
  [9, "2027-03-01", "GRUNN", "Utviklingsuke", ""],
  [10, "2027-03-08", "GRUNN", "Avslutningsuke", "Test og IUP-sjekk"],
  [11, "2027-03-15", "SPES", "Overgangsuke", "SPES start — teknikk til slag"],
  [12, "2027-03-22", "SPES", "Ferieuke", "Påskeferie"],
  [13, "2027-03-29", "SPES", "Utviklingsuke", ""],
  [14, "2027-04-05", "SPES", "Utviklingsuke", "Ute på GFGK"],
  [15, "2027-04-12", "SPES", "Utviklingsuke", ""],
  [16, "2027-04-19", "SPES", "Avslutningsuke", "Kalibrering fullført"],
  [17, "2027-04-26", "TURN", "Pre-turnering", "TURN start"],
  [18, "2027-05-03", "TURN", "Turneringsuke", "Kr. himmelfart 6. mai — fri to/fre"],
  [19, "2027-05-10", "TURN", "Turneringsuke", ""],
  [20, "2027-05-17", "TURN", "Turneringsuke", "17. mai — fri mandag"],
  [21, "2027-05-24", "TURN", "Turneringsuke", ""],
  [22, "2027-05-31", "TURN", "Turneringsuke", ""],
  [23, "2027-06-07", "TURN", "Turneringsuke", ""],
  [24, "2027-06-14", "TURN", "Avslutningsuke", "Sesongavslutning og IUP"],
];

// ---- Periodene (6 stk. — merk: TURN høst og TURN2 vår er to periodekort) -

export type PeriodeId = "TURN" | "TEST" | "GRUNN" | "SPES" | "TURN2";

export interface Periode {
  id: PeriodeId;
  navn: string;
  uker: string;
  datoer: string;
  fokus: string;
  nokkel: string[];
}

export const PERIODER: Periode[] = [
  {
    id: "TURN",
    navn: "Turnering (høst)",
    uker: "Uke 34–42",
    datoer: "17. aug – 18. okt 2026",
    fokus: "Sluttspill av sommersesongen — høste form. Vedlikeholds-FYS.",
    nokkel: [
      "Siste sommerturneringer til banen stenger ut oktober",
      "NGF/Team Norway-tester uke 35–36",
      "Pre-turnering: kjente slag, ingen ny teknikk siste 48 timer",
    ],
  },
  {
    id: "TEST",
    navn: "Testuke",
    uker: "Uke 43",
    datoer: "19.–25. okt 2026",
    fokus: "Test- og evalueringsuke — IUP-baseline før vinterens tekniske arbeid.",
    nokkel: [
      "Fullt testbatteri: TrackMan, kortspill og fysikk",
      "IUP-samtale: mål for GRUNN avtales per elev",
      "Øktmalen pauses — testene overtar øktene",
    ],
  },
  {
    id: "GRUNN",
    navn: "Grunnperiode",
    uker: "Uke 44–10",
    datoer: "26. okt 2026 – 14. mar 2027",
    fokus: "Bygg ny teknikk (BUILD→STAB→TEST) og styrk kroppen. Hele perioden innendørs.",
    nokkel: [
      "50 % FYS — grunnlag for økt treningsbelastning",
      "WANG-fellessamlinger med Oslo uke 1 og uke 7",
      "Intern teknisk sjekk uke 6, test og IUP-sjekk uke 10",
    ],
  },
  {
    id: "SPES",
    navn: "Spesialisering",
    uker: "Uke 11–16",
    datoer: "15. mar – 25. apr 2027",
    fokus: "Overføre teknikk til slag på bane og kalibrere avstander.",
    nokkel: [
      "Teknikk → slag: kjente avstander og lies",
      "Ute på GFGK fra ca. 5. april",
      "Kalibrering fullført før turneringsstart uke 17",
    ],
  },
  {
    id: "TURN2",
    navn: "Turnering (vår)",
    uker: "Uke 17–24",
    datoer: "26. apr – 20. jun 2027",
    fokus: "Prestere og vedlikeholde i turnering — Norgescup, Østlandstour, Srixon Tour og NM.",
    nokkel: [
      "35 % av tiden i turneringsspill",
      "Turneringsuker: restitusjon, mental gjennomgang, lett aktivering",
      "Sesong- og skoleårsavslutning med IUP-evaluering uke 24",
    ],
  },
];

/** Periodekortets fasefarge — TURN2 (vår) bruker samme farge som TURN (høst). */
export function faseForPeriode(id: PeriodeId): FaseKey {
  return id === "TURN2" ? "TURN" : id;
}

// ---- Pyramiden: fem akser i fast rekkefølge ------------------------------

export type AkseKode = "TEK" | "SLAG" | "SPILL" | "TURN" | "FYS";
export const AKSE_ORD: AkseKode[] = ["TEK", "SLAG", "SPILL", "TURN", "FYS"];

export interface AksePresentasjon {
  kode: AkseKode;
  navn: string;
  farge: string;
  tekst: string;
}

export const AKSER: AksePresentasjon[] = [
  {
    kode: "TEK",
    navn: "Teknikk",
    farge: "color-mix(in srgb, var(--cat-blue) 45%, white)",
    tekst: "Teknisk arbeid etter individuell plan — video og TrackMan",
  },
  {
    kode: "SLAG",
    navn: "Slag",
    farge: "var(--wang-mint)",
    tekst: "Kjente avstander og lies — kalibrere køllene",
  },
  {
    kode: "SPILL",
    navn: "Spill",
    farge: "color-mix(in srgb, #C9A800 55%, white)",
    tekst: "Spill på bane — valg, strategi og scoring",
  },
  {
    kode: "TURN",
    navn: "Turnering",
    farge: "var(--cat-orange)",
    tekst: "Turneringsspill og konkurranseforberedelse",
  },
  {
    kode: "FYS",
    navn: "Fysisk",
    farge: "color-mix(in srgb, var(--wang-navy) 22%, white)",
    tekst: "Styrke og skadeforebygging — grunnlag for belastning",
  },
];

// ---- Øktkoden: pyramide_område_motorikk_belastning_press ----------------
// Merkelapp, aldri et krav — jf. docs/treningsplanlegger/wang-toppidrett/oktmal.md.

export type OmraadeKode =
  | "TEE_TOTAL"
  | "INNSPILL_200"
  | "INNSPILL_150"
  | "INNSPILL_100"
  | "INNSPILL_50"
  | "CHIP"
  | "PITCH"
  | "LOB"
  | "BUNKER"
  | "PUTT_0_3"
  | "PUTT_3_5"
  | "PUTT_5_10"
  | "PUTT_10_25"
  | "PUTT_25_40"
  | "PUTT_40_PLUSS"
  | "STYRKE"
  | "KONDISJON"
  | "BEVEGELIGHET"
  | "BANE";

export const OMRAADE_LABEL: Record<OmraadeKode, string> = {
  TEE_TOTAL: "Utslag",
  INNSPILL_200: "Innspill ~200 m",
  INNSPILL_150: "Innspill ~150 m",
  INNSPILL_100: "Innspill ~100 m",
  INNSPILL_50: "Innspill ~50 m",
  CHIP: "Chip",
  PITCH: "Pitch",
  LOB: "Lob",
  BUNKER: "Bunker",
  PUTT_0_3: "Putt 0–3 fot",
  PUTT_3_5: "Putt 3–5 fot",
  PUTT_5_10: "Putt 5–10 fot",
  PUTT_10_25: "Putt 10–25 fot",
  PUTT_25_40: "Putt 25–40 fot",
  PUTT_40_PLUSS: "Putt 40+ fot",
  STYRKE: "Styrke",
  KONDISJON: "Kondisjon",
  BEVEGELIGHET: "Bevegelighet",
  BANE: "Banespill",
};

export type MotorikkKode = "UTEN_BALL" | "LAV_HAST" | "AUTO";
export const MOTORIKK_LABEL: Record<MotorikkKode, string> = {
  UTEN_BALL: "Uten ball",
  LAV_HAST: "Lav hastighet",
  AUTO: "Automatikk",
};

export type BelastningKode = "INNENDORS" | "TRENINGSOMRAADE" | "BANE" | "KONKURRANSE";
export const BELASTNING_LABEL: Record<BelastningKode, string> = {
  INNENDORS: "Innendørs",
  TRENINGSOMRAADE: "Treningsområde",
  BANE: "Bane",
  KONKURRANSE: "Konkurranse",
};

export type PressKode = "ALENE" | "OBSERVERT" | "KONKURRANSE" | "TURNERING";
export const PRESS_LABEL: Record<PressKode, string> = {
  ALENE: "Alene",
  OBSERVERT: "Observert",
  KONKURRANSE: "Konkurranse",
  TURNERING: "Turnering",
};

export type DimensjonKode =
  | "SIKTE"
  | "STARTRETNING"
  | "KURVE"
  | "HOYDE"
  | "TREFFPUNKT"
  | "LENGDEKONTROLL"
  | "SPINN"
  | "LANDINGSPUNKT"
  | "UTRULLING"
  | "KOLLEVALG"
  | "BOUNCE_BRUK"
  | "SANDINNGANG"
  | "LIE_VARIASJON"
  | "GREENLESING"
  | "BALLSTART"
  | "SPILLEFORMAT"
  | "STRATEGIOPPGAVE";

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

export interface OktBlokk {
  tid: string;
  del: string;
  innhold: string;
  akse?: AkseKode;
  min?: number;
  omraade?: OmraadeKode;
  motorikk?: MotorikkKode;
  belastning?: BelastningKode;
  press?: PressKode;
  dimensjon?: DimensjonKode;
  reps?: string;
}

export interface OktMaal {
  tekst: string;
  kilde: string;
}

export interface Okt {
  tittel: string;
  periode: "GRUNN" | "SPES" | "TURN";
  meta: string;
  fokus: string;
  blokker: OktBlokk[];
  maal: OktMaal[];
}

export const OKTER: Okt[] = [
  {
    tittel: "Økt i grunnperioden",
    periode: "GRUNN",
    meta: "Man · ons · fre · 08:00–10:00 · inne",
    fokus: "Ny teknikk starter i kropp/arm — aldri rett på ball.",
    blokker: [
      {
        tid: "08:00–08:15",
        del: "Oppvarming",
        innhold: "Aktivering og ballfølelse",
        akse: "FYS",
        min: 15,
        omraade: "BEVEGELIGHET",
        belastning: "INNENDORS",
        press: "ALENE",
        reps: "15 min bevegelighet",
      },
      {
        tid: "08:15–09:00",
        del: "Øvelse 1 — teknikk",
        innhold: "Teknisk drill uten ball: kropp, arm, kølle",
        akse: "TEK",
        min: 45,
        omraade: "INNSPILL_100",
        motorikk: "UTEN_BALL",
        belastning: "INNENDORS",
        press: "ALENE",
        dimensjon: "TREFFPUNKT",
        reps: "4 × 12 repetisjoner",
      },
      {
        tid: "09:00–09:30",
        del: "Øvelse 2 — ball",
        innhold: "Ball på CS50–60 — kontrollert intensitet",
        akse: "TEK",
        min: 30,
        omraade: "INNSPILL_100",
        motorikk: "LAV_HAST",
        belastning: "INNENDORS",
        press: "ALENE",
        dimensjon: "STARTRETNING",
        reps: "40 slag",
      },
      {
        tid: "09:30–09:50",
        del: "Øvelse 3 — anvendelse",
        innhold: "Anvendelse på range, CS70",
        akse: "SLAG",
        min: 20,
        omraade: "INNSPILL_150",
        motorikk: "AUTO",
        belastning: "TRENINGSOMRAADE",
        press: "ALENE",
        dimensjon: "LENGDEKONTROLL",
        reps: "25 slag",
      },
      {
        tid: "09:50–10:00",
        del: "Evaluering",
        innhold: "KPI måles + dagbokspørsmål",
      },
    ],
    maal: [
      {
        tekst: "Kjenne treningsformene i drillene og gjennomføre basistrening med kontroll",
        kilde: "Toppidrett 1 · mål 3 og 4",
      },
      {
        tekst: "Gjennomføre den tekniske treningen systematisk og dokumentere resultatet",
        kilde: "Toppidrett 2 · mål 2",
      },
      {
        tekst: "Utarbeide plan for egen teknikkendring ut fra idrettens krav og egen kapasitet",
        kilde: "Toppidrett 3 · mål 3",
      },
    ],
  },
  {
    tittel: "Økt i spesialiseringen",
    periode: "SPES",
    meta: "Man · ons · fre · 08:00–10:00 · inne/ute",
    fokus: "Kalibrere avstander — teknikken skal bli slag på bane.",
    blokker: [
      {
        tid: "08:00–08:15",
        del: "Oppvarming",
        innhold: "Aktivering og ballfølelse",
        akse: "FYS",
        min: 15,
        omraade: "BEVEGELIGHET",
        belastning: "TRENINGSOMRAADE",
        press: "ALENE",
        reps: "15 min bevegelighet",
      },
      {
        tid: "08:15–09:00",
        del: "Øvelse 1 — teknikk",
        innhold: "Teknisk vedlikehold på CS70",
        akse: "TEK",
        min: 45,
        omraade: "INNSPILL_100",
        motorikk: "LAV_HAST",
        belastning: "TRENINGSOMRAADE",
        press: "ALENE",
        dimensjon: "TREFFPUNKT",
        reps: "36 slag",
      },
      {
        tid: "09:00–09:30",
        del: "Øvelse 2 — slag",
        innhold: "Kjente avstander og lies — kalibrering",
        akse: "SLAG",
        min: 30,
        omraade: "INNSPILL_150",
        motorikk: "AUTO",
        belastning: "TRENINGSOMRAADE",
        press: "OBSERVERT",
        dimensjon: "LENGDEKONTROLL",
        reps: "30 slag · 4 avstander",
      },
      {
        tid: "09:30–09:50",
        del: "Øvelse 3 — spill",
        innhold: "Spill: korthull eller 9 hull",
        akse: "SPILL",
        min: 20,
        omraade: "BANE",
        belastning: "BANE",
        press: "OBSERVERT",
        dimensjon: "STRATEGIOPPGAVE",
        reps: "6 hull",
      },
      {
        tid: "09:50–10:00",
        del: "Evaluering",
        innhold: "KPI måles + dagbokspørsmål",
      },
    ],
    maal: [
      {
        tekst: "Vise og utvikle ferdigheter — ta teknikken med ut i slag og spill",
        kilde: "Toppidrett 1 · mål 1",
      },
      {
        tekst: "Gjennomføre tester og analysere om treningen virker",
        kilde: "Toppidrett 2 · mål 2 og 3",
      },
      {
        tekst: "Reflektere over gjennomført trening i lys av egne mål og resultater",
        kilde: "Toppidrett 3 · mål 2",
      },
    ],
  },
  {
    tittel: "Økt i turneringsperioden",
    periode: "TURN",
    meta: "Man · ons · fre · 08:00–10:00 · ute",
    fokus: "Prestere — kjente slag, ingen ny teknikk siste 48 timer.",
    blokker: [
      {
        tid: "08:00–08:15",
        del: "Oppvarming",
        innhold: "Aktivering — turneringsrutine",
        akse: "FYS",
        min: 15,
        omraade: "BEVEGELIGHET",
        belastning: "TRENINGSOMRAADE",
        press: "ALENE",
        reps: "15 min turneringsrutine",
      },
      {
        tid: "08:15–09:00",
        del: "Øvelse 1 — aktivering",
        innhold: "Kjente slag og treningsområder",
        akse: "SLAG",
        min: 45,
        omraade: "TEE_TOTAL",
        motorikk: "AUTO",
        belastning: "TRENINGSOMRAADE",
        press: "ALENE",
        dimensjon: "SIKTE",
        reps: "30 slag · kjente køller",
      },
      {
        tid: "09:00–09:30",
        del: "Øvelse 2 — scoring",
        innhold: "Scoring under press, med konsekvens",
        akse: "SPILL",
        min: 30,
        omraade: "PUTT_5_10",
        belastning: "BANE",
        press: "KONKURRANSE",
        dimensjon: "GREENLESING",
        reps: "24 putter · med konsekvens",
      },
      {
        tid: "09:30–09:50",
        del: "Øvelse 3 — mental rutine",
        innhold: "Rutiner før, under og etter runden",
        akse: "TURN",
        min: 20,
        omraade: "BANE",
        belastning: "KONKURRANSE",
        press: "TURNERING",
        dimensjon: "SPILLEFORMAT",
        reps: "3 hull · full rutine",
      },
      {
        tid: "09:50–10:00",
        del: "Evaluering",
        innhold: "KPI måles + dagbokspørsmål",
      },
    ],
    maal: [
      {
        tekst: "Beskrive mentale forberedelser til trening og konkurranse",
        kilde: "Toppidrett 1 · mål 6",
      },
      {
        tekst: "Reflektere over egne mentale behov og rutiner rundt konkurranse",
        kilde: "Toppidrett 2 · mål 7",
      },
      {
        tekst: "Vise ferdigheter som forbedrer prestasjonen i konkurransesituasjoner",
        kilde: "Toppidrett 3 · mål 1",
      },
    ],
  },
];

function kodeStreng(b: OktBlokk): string {
  return [b.akse, b.omraade, b.motorikk, b.belastning, b.press]
    .filter(Boolean)
    .join("_");
}

export interface OktFormel {
  id: string;
  omrade: string;
  reps: string;
  kode: string;
  farge: string | undefined;
}

/** Øktas øvelser som chips — brukes i månedsplan, ukeplan og øktplaner. */
export function oktFormler(periode: Okt["periode"]): OktFormel[] {
  const okt = OKTER.find((o) => o.periode === periode);
  if (!okt) return [];
  return okt.blokker
    .filter((b) => b.omraade)
    .map((b, i) => ({
      id: periode + "-" + i,
      omrade: (b.omraade && OMRAADE_LABEL[b.omraade]) || b.omraade || "",
      reps: b.reps || "",
      kode: kodeStreng(b),
      farge: AKSER[AKSE_ORD.indexOf(b.akse as AkseKode)]?.farge,
    }));
}

/** Planlagt egentrening (minutter/uke) som mates inn i pyramideberegningen. */
export interface Egentrening {
  grunn: number;
  spes: number;
  turn: number;
  turneringSnitt: number;
}

export const EGENTRENING_DEFAULT: Egentrening = {
  grunn: 180,
  spes: 80,
  turn: 40,
  turneringSnitt: 120,
};

function byggEkstra(o: Egentrening) {
  const t = (m: number) =>
    (Math.round((m / 60) * 10) / 10).toString().replace(".", ",") + " t";
  return {
    GRUNN: [{ akse: "FYS" as AkseKode, min: o.grunn, tekst: "Egentrening styrke " + t(o.grunn) + " per uke" }],
    SPES: [{ akse: "FYS" as AkseKode, min: o.spes, tekst: "Egentrening styrke " + t(o.spes) + " per uke" }],
    TURN: [
      { akse: "FYS" as AkseKode, min: o.turn, tekst: "Vedlikehold styrke " + t(o.turn) + " per uke" },
      { akse: "TURN" as AkseKode, min: o.turneringSnitt, tekst: "Turneringsspill " + t(o.turneringSnitt) + " i snitt per uke" },
    ],
  };
}

export interface PyramideResultat {
  pct: number[];
  min: Record<AkseKode, number>;
  kilder: Record<AkseKode, string[]>;
  sum: number;
}

/**
 * Prosentfordelingen over de fem aksene for en periode — BEREGNES fra
 * planlagte øvelser i OKTER + planlagt egentrening, aldri hardkodet.
 * Rekkefølgen på returverdien følger AKSE_ORD.
 */
export function beregnPyramide(
  periode: Okt["periode"],
  egentrening: Egentrening = EGENTRENING_DEFAULT,
): PyramideResultat {
  const EKSTRA = byggEkstra(egentrening);
  const okt = OKTER.find((o) => o.periode === periode);
  const min: Record<AkseKode, number> = { TEK: 0, SLAG: 0, SPILL: 0, TURN: 0, FYS: 0 };
  const kilder: Record<AkseKode, string[]> = { TEK: [], SLAG: [], SPILL: [], TURN: [], FYS: [] };
  for (const b of okt ? okt.blokker : []) {
    if (!b.akse || !b.min) continue;
    min[b.akse] += b.min * 3;
    kilder[b.akse].push(
      "3 × " + b.min + " min " + b.del.replace(/^Øvelse \d+ — /, "").toLowerCase(),
    );
  }
  for (const e of EKSTRA[periode] || []) {
    min[e.akse] += e.min;
    kilder[e.akse].push(e.tekst);
  }
  const sum = AKSE_ORD.reduce((a, k) => a + min[k], 0) || 1;
  const raa = AKSE_ORD.map((k) => (min[k] / sum) * 100);
  const pct = raa.map((v) => Math.floor(v));
  let rest = 100 - pct.reduce((a, v) => a + v, 0);
  AKSE_ORD.map((k, i): [number, number] => [i, raa[i] - pct[i]])
    .sort((a, b) => b[1] - a[1])
    .forEach(([i]) => {
      if (rest > 0) {
        pct[i] += 1;
        rest -= 1;
      }
    });
  return { pct, min, kilder, sum };
}

// ---- Månedsplanen (11 måneder, aug 2026 → jun 2027) ----------------------

export type MndRad = [string, FaseKey, string, string[]];

export const MND: MndRad[] = [
  ["August 2026", "TURN", "Sesongform: siste sommerturneringer mens formen er på topp. NGF-testperioden starter.", ["Skolestart uke 34", "NGF/Team Norway-tester fra uke 35"]],
  ["September", "TURN", "Turneringsuker med vedlikeholdstrening — restitusjon og mental gjennomgang mellom starter.", ["Tester avsluttes uke 36", "Turneringshelger (terminliste)"]],
  ["Oktober", "TURN", "Sommersesongen avsluttes og banen stenger. Testuke 43 setter IUP-baseline før vinteren.", ["Høstferie uke 40", "Testuke og IUP-samtaler uke 43"]],
  ["November", "GRUNN", "GRUNN start: bygge ny teknikk innendørs — kropp og arm før ball. Tung FYS-blokk.", ["Treningslokalet: nett, putting, TrackMan"]],
  ["Desember", "GRUNN", "Full teknisk trening fram til jul. Egentreningsplan for ferien.", ["Juleferie uke 52–53"]],
  ["Januar 2027", "GRUNN", "Fellessamling med WANG Oslo — deretter full teknisk trening.", ["WANG-samling 4.–10. jan"]],
  ["Februar", "GRUNN", "Teknisk sjekk uke 6 og ny fellessamling uke 7 før vinterferien.", ["Intern teknisk sjekk uke 6", "Samling 15.–21. feb · vinterferie uke 8"]],
  ["Mars", "SPES", "GRUNN avsluttes med test og IUP-sjekk uke 10. SPES fra uke 11: teknikk skal bli slag.", ["Test og IUP uke 10", "Påskeferie uke 12"]],
  ["April", "SPES", "Ut på GFGK fra ca. 5. april — overføring til bane og kalibrering av avstander.", ["Utesesongen åpner", "Kalibrering fullført uke 16"]],
  ["Mai", "TURN", "Turneringssesong: Norgescup, Østlandstour og Srixon Tour. Kjente slag, ingen ny teknikk.", ["Fri Kr. himmelfart 6. mai og 17. mai"]],
  ["Juni", "TURN", "Turneringstopp og evaluering — sesong- og skoleårsavslutning uke 24.", ["NM-perioden", "IUP-evaluering og avslutning uke 24"]],
];

// ---- Kompetansemål (Toppidrett + Kroppsøving per trinn) -------------------

export type Trinn = "VG1" | "VG2" | "VG3";
export const TRINN_ORD: Trinn[] = ["VG1", "VG2", "VG3"];

export interface FagInfo {
  farge: string;
  tint: string;
  fag: string;
  kode: string;
  ingress: string;
}

export const TRINN: Record<Trinn, FagInfo> = {
  VG1: {
    farge: "var(--wang-teal-text)",
    tint: "var(--tint-teal)",
    fag: "Toppidrett 1",
    kode: "IDR05-02 · kv283",
    ingress: "Bli kjent med treningsformene, gjennomføre basistrening og lære å trene systematisk.",
  },
  VG2: {
    farge: "var(--cat-blue)",
    tint: "var(--tint-blue)",
    fag: "Toppidrett 2",
    kode: "IDR05-02 · kv284",
    ingress: "Gjennomføre systematisk trening, analysere resultatene og beskrive eget utviklingsløp.",
  },
  VG3: {
    farge: "var(--wang-navy)",
    tint: "var(--tint-navy)",
    fag: "Toppidrett 3",
    kode: "IDR05-02 · kv285",
    ingress: "Utarbeide egne langsiktige planer og prestere i konkurransesituasjoner.",
  },
};

export const TRINN_KRO: Record<Trinn, FagInfo> = {
  VG1: {
    farge: "color-mix(in srgb, var(--cat-orange) 70%, black)",
    tint: "var(--tint-orange)",
    fag: "Kroppsøving",
    kode: "KRO01-05 · kv186",
    ingress: "Trene på nye bevegelsesaktiviteter, sette egne mål og forebygge skader.",
  },
  VG2: {
    farge: "color-mix(in srgb, var(--cat-orange) 70%, black)",
    tint: "var(--tint-orange)",
    fag: "Kroppsøving",
    kode: "KRO01-05 · kv187",
    ingress: "Trene på egen hånd og forstå hvordan aktivitet fremmer helse og prestasjon.",
  },
  VG3: {
    farge: "color-mix(in srgb, var(--cat-orange) 70%, black)",
    tint: "var(--tint-orange)",
    fag: "Kroppsøving",
    kode: "KRO01-05 · kv188",
    ingress: "Planlegge, gjennomføre og vurdere egentrening ut fra egne forutsetninger.",
  },
};

export const KM: Record<Trinn, string[]> = {
  VG1: [
    "vise og utvikle ferdigheter i idretten og gjennomføre systematisk og målrettet trening",
    "dokumentere og evaluere en valgt treningsperiode",
    "kjenne til ulike treningsformer, metoder, tester og øvelser som er relevante for ferdighetsutvikling i idretten, og bruke disse til å utvikle egne ferdigheter",
    "gjennomføre basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning",
    "forstå forholdet mellom totalbelastning og restitusjon",
    "beskrive mentale forberedelser til trening og konkurranse",
    "bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for å stimulere til økt motivasjon",
    "vise god samhandling og respektfull treningsatferd",
  ],
  VG2: [
    "vise og videreutvikle ferdigheter som er sentrale for å prestere i konkurranser i idretten",
    "gjennomføre systematisk og målrettet trening, og dokumentere og analysere resultatet av denne treningen",
    "gjøre rede for og gjennomføre relevante tester",
    "utvikle basisegenskaper og integrere skadeforebyggende tiltak i de daglige treningsrutinene",
    "gjøre rede for hvordan økt treningsmengde og totalbelastning stiller krav til organisering, planlegging, restitusjon og ernæring",
    "beskrive et utviklingsløp fra eget utgangspunkt og til ønsket nivå på kort og lang sikt",
    "reflektere over egne mentale behov og rutiner før, under og etter trening og i forbindelse med konkurranse",
    "gjøre rede for og bruke lyst- og lekbetonte aktiviteter, øvelser, treningsformer og konkurranser som kan stimulere til økt motivasjon",
    "utforske hvordan aktiviteter, øvelser, trening og konkurranse påvirker motivasjon og ferdighetsutvikling",
    "opptre på en måte som bidrar til et godt lærings- og utviklingsmiljø",
  ],
  VG3: [
    "vise og utvikle ferdigheter som kan forbedre prestasjonen i konkurransesituasjoner",
    "dokumentere, analysere og reflektere over gjennomført trening i lys av egne mål og resultater",
    "utarbeide planer og gjennomføre langsiktig, systematisk og målrettet trening i idretten med utgangspunkt i idrettens krav og egen kapasitet",
    "videreutvikle basisegenskaper som er sentrale for ferdighetsutvikling",
    "anvende skadeforebyggende øvelser og vurdere hvordan disse kan integreres i trening og forberedelse til konkurranse",
    "gjennomføre mentale forberedelser og mental trening, og reflektere over hvordan dette kan påvirke ferdighetsutvikling",
    "utforske og reflektere over hvordan aktiviteter, øvelser, trening og konkurranse påvirker motivasjon og ferdighetsutvikling",
    "opptre på en måte som fremmer treningsarbeidet og samhandlingen, og som bidrar til et trygt, positivt og godt utviklingsmiljø",
  ],
};

export const KM_KRO: Record<Trinn, string[]> = {
  VG1: [
    "trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre",
    "planlegge og gjennomføre metoder for øvelse og trening for å oppnå individuelle mål, også når man ikke fullt ut kan delta i aktiviteten",
    "bruke egne ferdigheter og kunnskaper til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill",
    "forebygge skader ved bevegelsesaktiviteter og utføre grunnleggende førstehjelp",
    "bruke kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre",
    "bruke lokale tradisjoner for ferdsel i naturen under vekslende årstider",
  ],
  VG2: [
    "gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter og forstå hvordan ulike aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet",
    "utføre trening på egen hånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil etter avsluttet skolegang og i framtidig arbeidsliv",
    "praktisere regler for å delta i ulike bevegelsesaktiviteter og medvirke til læring for andre",
    "planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode naturopplevelser",
    "praktisere bærekraftig ferdsel i naturen og gjennomføre friluftslivsaktiviteter i nærområdet",
  ],
  VG3: [
    "øve på og utvikle kunnskaper og ferdigheter i ulike bevegelsesaktiviteter ut fra egne forutsetninger",
    "planlegge, gjennomføre og vurdere egentrening og forklare hvordan dette kan medvirke til en fysisk aktiv og helsefremmende livsstil etter avsluttet skolegang",
    "beskrive og drøfte sammenhenger mellom bevegelse, kropp, trening og helse i samfunnet",
    "samarbeide om å løse praktiske oppgaver i et læringsfellesskap og ut fra øvelse og aktivitet reflektere over hvordan egen medvirkning kan påvirke andre",
    "planlegge og gjennomføre uteaktiviteter og friluftslivsaktiviteter i nærområdet",
  ],
};

// ---- Skole: timeplan, skolerute, prøver, foreldremøter --------------------
// Ordrett fra «Timeplanoppsett 2026-2027.pdf» og «Skolerute WTF 2026-2027.pdf»
// (11.08.2026) — ingen elevnavn, kun fag/lærer/rom.

export const LEKSEHJELP = "Leksehjelp";

/** 6 rader (blokker) × 5 dager (man–fre). Blokk 1 man/ons/fre er alltid Trening. */
export type Timeplan = [string, string, string, string, string][];

export interface Fagrad {
  fag: string;
  laerer: string;
  rom: string;
  blokk: string;
}

export type KlasseId = "VG1A" | "VG1B" | "VG2A" | "VG2B" | "VG3A" | "VG3B";

export interface Klasse {
  id: KlasseId;
  trinn: Trinn;
  kontakt: string;
  plan: Timeplan;
  fag: Fagrad[];
}

function fagrad(fag: string, laerer: string, rom: string, blokk = ""): Fagrad {
  return { fag, laerer, rom, blokk };
}

export const KLASSER: Klasse[] = [
  {
    id: "VG1A",
    trinn: "VG1",
    kontakt: "Anna Popova",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", "Trening"],
      ["Trening", "Engelsk (rom 2)", "Trening", "Naturfag (rom 2)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Tysk 2 (rom 9) / Spansk 2 (rom 2/3) / Spansk 1 (rom 4)", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", "Geografi (rom 2)", "Naturfag (rom 2)", "Norsk (rom 2)"],
      ["Samfunnskunnskap (rom 2)", "Tysk 2 (rom 9) / Spansk 2 (rom 6/7) / Spansk 1 (rom 4)", "Engelsk (rom 2)", "Norsk (rom 2)", "Engelsk (rom 2)"],
      ["Naturfag (rom 2)", "Naturfag (rom 2)", "Samfunnskunnskap (rom 2)", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", ""],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Kristin Kristoffersen", "rom 2"),
      fagrad("Matematikk 1P", "Thore Stokker / Geir Myklebust", "rom 5 / rom 4"),
      fagrad("Matematikk 1T", "Martin Strømner", "rom 2"),
      fagrad("Naturfag", "Rene Hansen", "rom 2"),
      fagrad("Geografi", "Martin Strømner", "rom 2"),
      fagrad("Samfunnskunnskap", "Lena H. Brennand", "rom 2"),
      fagrad("Engelsk", "Anna Popova", "rom 2"),
      fagrad("Tysk 2", "Heidi Johansen", "rom 9"),
      fagrad("Spansk 1", "Athanassios Lazarides", "rom 4"),
      fagrad("Spansk 2", "Anna Popova / Marita Hjelmungen", "rom 2/3/6/7"),
    ],
  },
  {
    id: "VG1B",
    trinn: "VG1",
    kontakt: "Heidi Johansen",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", "Trening"],
      ["Trening", "Engelsk (rom 4)", "Trening", "Norsk (rom 4)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Tysk 2 (rom 9) / Spansk 2 (rom 2/3) / Spansk 1 (rom 4)", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", "Samfunnskunnskap (rom 4)", "Engelsk (rom 4)", "Geografi (rom 4)"],
      ["Naturfag (rom 4)", "Tysk 2 (rom 9) / Spansk 2 (rom 6/7) / Spansk 1 (rom 4)", "Engelsk (rom 4)", "Naturfag (rom 4)", "Norsk (rom 4)"],
      ["Norsk (rom 4)", "Samfunnskunnskap (rom 4)", "Naturfag (rom 4)", "Matematikk 1P (rom 4/5) / Matematikk 1T (rom 2)", ""],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Siri Tallerud", "rom 4"),
      fagrad("Matematikk 1P", "Thore Stokker / Geir Myklebust", "rom 5 / rom 4"),
      fagrad("Matematikk 1T", "Martin Strømner", "rom 2"),
      fagrad("Naturfag", "Rene Hansen", "rom 4"),
      fagrad("Geografi", "Martin Strømner", "rom 4"),
      fagrad("Samfunnskunnskap", "Lena H. Brennand", "rom 4"),
      fagrad("Engelsk", "Heidi Johansen", "rom 4"),
      fagrad("Tysk 2", "Heidi Johansen", "rom 9"),
      fagrad("Spansk 1", "Athanassios Lazarides", "rom 4"),
      fagrad("Spansk 2", "Anna Popova / Marita Hjelmungen", "rom 2/3/6/7"),
    ],
  },
  {
    id: "VG2A",
    trinn: "VG2",
    kontakt: "Kristin Kristoffersen",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Norsk (rom 8)", "Trening"],
      ["Trening", "Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Trening", "Matte 2P (rom 3/8)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Tysk 2 (rom 9) / Spansk 2 (rom 3) / Spansk 1 (rom 8)", "Norsk (rom 8)", "Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Historie (rom 8)"],
      ["Tysk 2 (rom 9) / Spansk 2 (rom 3) / Spansk 1 (rom 8)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 8)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Matte 2P (rom 3/8)"],
      ["Fysikk 1 (rom 5) / Psykologi 1 (rom 8)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 8)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 8)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Idrettsteori"],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Kristin Kristoffersen", "rom 8"),
      fagrad("Matte 2P", "Geir Myklebust / Martin Strømner", "rom 3 / rom 8"),
      fagrad("Historie", "Rene Hansen", "rom 8"),
      fagrad("Spansk 1", "Athanassios Lazarides", "rom 8"),
      fagrad("Spansk 2", "Anna Popova", "rom 3"),
      fagrad("Tysk 2", "Heidi Johansen", "rom 9"),
      fagrad("Matematikk R1", "Martin Strømner", "rom 1", "Blokk 1"),
      fagrad("Medie- og informasjonskunnskap 1", "Siri Tallerud", "rom 8", "Blokk 1"),
      fagrad("Fysikk 1", "Thore Stokker", "rom 5", "Blokk 2"),
      fagrad("Psykologi 1", "Athanassios Lazarides", "rom 8", "Blokk 2"),
      fagrad("Sosiologi og sosialantropologi", "Lena H. Brennand", "rom 3", "Blokk 3"),
      fagrad("IT 1", "Thore Stokker", "rom 5", "Blokk 3"),
    ],
  },
  {
    id: "VG2B",
    trinn: "VG2",
    kontakt: "Rene Hansen",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Historie (rom 3)", "Trening"],
      ["Trening", "Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Trening", "Matte 2P (rom 3/8)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Tysk 2 (rom 9) / Spansk 2 (rom 3) / Spansk 1 (rom 8)", "Norsk (rom 3)", "Matte R1 (rom 1) / Medie- og inf 1 (rom 8)", "Norsk (rom 3)"],
      ["Tysk 2 (rom 9) / Spansk 2 (rom 3) / Spansk 1 (rom 8)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 3)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Matte 2P (rom 3/8)"],
      ["Fysikk 1 (rom 5) / Psykologi 1 (rom 3)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 3)", "Fysikk 1 (rom 5) / Psykologi 1 (rom 3)", "Sos. og sos.antr (rom 3) / IT1 (rom 5)", "Idrettsteori"],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Siri Tallerud", "rom 3"),
      fagrad("Matte 2P", "Geir Myklebust / Martin Strømner", "rom 3 / rom 8"),
      fagrad("Historie", "Rene Hansen", "rom 3"),
      fagrad("Spansk 1", "Athanassios Lazarides", "rom 8"),
      fagrad("Spansk 2", "Anna Popova", "rom 3"),
      fagrad("Tysk 2", "Heidi Johansen", "rom 9"),
      fagrad("Matematikk R1", "Martin Strømner", "rom 1", "Blokk 1"),
      fagrad("Medie- og informasjonskunnskap 1", "Siri Tallerud", "rom 8", "Blokk 1"),
      fagrad("Fysikk 1", "Thore Stokker", "rom 5", "Blokk 2"),
      fagrad("Psykologi 1", "Kim-Erik Larsen", "rom 3", "Blokk 2"),
      fagrad("Sosiologi og sosialantropologi 1", "Lena H. Brennand", "rom 3", "Blokk 3"),
      fagrad("IT 1", "Thore Stokker", "rom 5", "Blokk 3"),
    ],
  },
  {
    id: "VG3A",
    trinn: "VG3",
    kontakt: "Siri Tallerud",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Historie (rom 6)", "Trening"],
      ["Trening", "Fysikk 2 (rom 5) / Psykologi 2 (rom 6)", "Trening", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Fysikk 2 (rom 5) / Psykologi 2 (rom 6)", "Religion (rom 6)", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)", "Fysikk 2 (rom 5) / Psykologi 2 (rom 6)", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)"],
      ["Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Norsk (rom 2)", "Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Norsk (rom 6)", "Historie (rom 6)"],
      ["Religion (rom 6)", "Norsk (rom 6)", "Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Idrettsteori", "Norsk (rom 6)"],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Siri Tallerud", "rom 6/2"),
      fagrad("Religion", "Suzie Skarpholt", "rom 6"),
      fagrad("Historie", "Sigvald Andreassen", "rom 6"),
      fagrad("Matematikk R2", "Martin Strømner", "rom 1", "Blokk 1"),
      fagrad("Medie- og informasjonskunnskap 2", "Geir Myklebust", "rom 6", "Blokk 1"),
      fagrad("Psykologi 2", "Torben Wendler", "rom 6", "Blokk 2"),
      fagrad("Fysikk 2", "Thore Stokker", "rom 5", "Blokk 2"),
      fagrad("Sosialkunnskap", "Heidi Johansen", "rom 6", "Blokk 3"),
      fagrad("IT 2", "Thore Stokker", "rom 5", "Blokk 3"),
      fagrad("Spansk 1+2", "Anna Popova", "rom 9", "Blokk 3"),
    ],
  },
  {
    id: "VG3B",
    trinn: "VG3",
    kontakt: "Suzie Skarpholt",
    plan: [
      ["Trening", "Trening / Idrettsteori", "Trening", "Religion (rom 7)", "Trening"],
      ["Trening", "Fysikk 2 (rom 5) / Psykologi 2 (rom 7)", "Trening", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)", "Trening"],
      ["Spisefri", "Spisefri", "Spisefri", "Spisefri", "Spisefri"],
      ["Fysikk 2 (rom 5) / Psykologi 2 (rom 7)", "Historie (rom 7)", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)", "Fysikk 2 (rom 5) / Psykologi 2 (rom 7)", "Sos.kunnskap (rom 6) / IT2 (rom 5) / Spansk 1+2 (rom 9)"],
      ["Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Norsk (rom 8)", "Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Norsk (rom 7)", "Norsk (rom 7)"],
      ["Historie (rom 7)", "Religion (rom 7)", "Matte R2 (rom 1) / Medie- og inf 2 (rom 6)", "Idrettsteori", "Historie (rom 7)"],
      [LEKSEHJELP, "", LEKSEHJELP, LEKSEHJELP, ""],
    ],
    fag: [
      fagrad("Norsk", "Suzie Skarpholt", "rom 7/8"),
      fagrad("Religion", "Suzie Skarpholt", "rom 7"),
      fagrad("Historie", "Sigvald Andreassen", "rom 7"),
      fagrad("Matematikk R2", "Martin Strømner", "rom 1", "Blokk 1"),
      fagrad("Medie- og informasjonskunnskap 2", "Geir Myklebust", "rom 6", "Blokk 1"),
      fagrad("Psykologi 2", "Kim-Erik Larsen", "rom 7", "Blokk 2"),
      fagrad("Fysikk 2", "Thore Stokker", "rom 5", "Blokk 2"),
      fagrad("Sosialkunnskap", "Heidi Johansen", "rom 6", "Blokk 3"),
      fagrad("IT 2", "Thore Stokker", "rom 5", "Blokk 3"),
      fagrad("Spansk 1+2", "Anna Popova", "rom 9", "Blokk 3"),
    ],
  },
];

export const TIMER: [string, string][] = [
  ["1.–2. time", "08.00–09.30"],
  ["3. time", "09.35–10.20"],
  ["Spisefri", "10.20–10.50"],
  ["4.–5. time", "10.50–12.20"],
  ["6.–7. time", "12.30–14.00"],
  ["8. time", "14.05–14.50"],
  ["9. time", "15.00–15.45"],
];
export const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

/** [måned, tekst, uke] — 192 skoledager (84 høst / 107 vår + oppstartsdag VG1). */
export const SKOLERUTE: [string, string, string][] = [
  ["August", "Planleggingsdager", "Uke 33"],
  ["August", "Første skoledag: fredag 14. august (VG1) · mandag 17. august (VG2/VG3)", "Uke 33–34"],
  ["Sept./okt.", "Høstferie", "Uke 40"],
  ["November", "Planleggingsdag torsdag 19. november", "Uke 47"],
  ["Desember", "Siste skoledag før jul: fredag 18. desember", "Uke 51"],
  ["Januar", "Første skoledag: mandag 4. januar", "Uke 2"],
  ["Februar", "Vinterferie", "Uke 8"],
  ["Mars", "Påskeferie", "Uke 12–13"],
  ["Mai", "Kristi himmelfart 6. mai · 17. mai · 2. pinsedag", "Uke 18 og 20"],
  ["Juni", "Siste skoledag: fredag 18. juni", "Uke 25"],
];

/** Prøver, tester og eksamen per trinn — [uke, tittel, detalj][]. */
export const PROVER: Record<Trinn, [string, string, string][]> = {
  VG1: [
    ["Uke 38", "Kartleggingsprøver", "Norsk, matematikk og engelsk — nivåkartlegging ved skolestart"],
    ["Uke 46–47", "Prøveperiode høst", "Kapittelprøver i fellesfag etter faglærers plan"],
    ["Uke 50", "Terminprøver", "Halvårsvurdering i fellesfagene"],
    ["Uke 9–10", "Prøveperiode vår", "Heldagsprøver i norsk og matematikk"],
    ["Uke 21–22", "Avsluttende prøver", "Standpunktgrunnlag; ingen fellesøkter"],
  ],
  VG2: [
    ["Uke 46–47", "Prøveperiode høst", "Kapittelprøver i fellesfag og programfag"],
    ["Uke 50", "Terminprøver", "Halvårsvurdering i fellesfag og programfag"],
    ["Uke 9–10", "Prøveperiode vår", "Heldagsprøver i fellesfag"],
    ["Uke 19", "Tverrfaglig eksamen", "Praktisk-muntlig i programfag"],
    ["Uke 21–22", "Eksamensperiode", "Skriftlig og muntlig eksamen; ingen fellesøkter"],
  ],
  VG3: [
    ["Uke 46–47", "Prøveperiode høst", "Heldagsprøver i eksamensfagene"],
    ["Uke 50", "Terminprøver", "Halvårsvurdering — grunnlag for standpunkt"],
    ["Uke 9–10", "Prøveperiode vår", "Eksamensforberedende heldagsprøver"],
    ["Uke 20", "Skriftlig eksamen", "Sentralt gitt eksamen i fellesfag"],
    ["Uke 21–22", "Muntlig eksamen", "Trekkfag kunngjøres 48 timer før; ingen fellesøkter"],
  ],
};

/** Alle møter kl. 17:00 på WANG Toppidrett Fredrikstad. VG1 4 møter, VG2 2, VG3 1. */
export const FORELDREMOTER: Record<Trinn, string[]> = {
  VG1: ["Onsdag 26. august kl. 17:00", "Torsdag 8. oktober kl. 17:00", "Torsdag 21. januar kl. 17:00", "Tirsdag 16. mars kl. 17:00"],
  VG2: ["Torsdag 15. oktober kl. 17:00", "Tirsdag 9. mars kl. 17:00"],
  VG3: ["Torsdag 14. januar kl. 17:00"],
};

/** Korrekt norsk entall/flertall for antall foreldremøter. */
export function moteTekst(antall: number): string {
  return antall === 1 ? "1 møte" : antall + " møter";
}

// ---- Kalenderhendelser: byggEvents() --------------------------------------

export type HendelseType = "okt" | "prove" | "skole" | "hendelse";

export interface KalenderHendelse {
  type: HendelseType;
  label: string;
  time?: string;
}

const AKSER_PER_FASE: Record<string, [AkseKode, AkseKode, AkseKode]> = {
  GRUNN: ["TEK", "FYS", "TEK"],
  SPES: ["SLAG", "SPILL", "TEK"],
  TURN: ["SPILL", "TURN", "SLAG"],
  TEST: ["TEK", "SLAG", "SPILL"],
};

/** Mandag + `off` dager, som ISO-dato (UTC-trygt). */
function dagIso(mandagIso: string, off: number): string {
  const dt = d(mandagIso);
  dt.setUTCDate(dt.getUTCDate() + off);
  return iso(dt);
}

/**
 * Bygger alle kalenderhendelser fra UKER + skolens datoer + turneringer.
 * Nøkkel = ISO-dato, verdi = liste av hendelser den dagen.
 *
 * VIKTIG regel som må bevares i UI: hver golføkt merkes med pyramideaksen
 * den tilhører (TEK-økt/SLAG-økt/SPILL-økt/TURN-økt/FYS-økt), aldri en
 * generisk "golføkt".
 */
export function byggEvents(): Record<string, KalenderHendelse[]> {
  const ev: Record<string, KalenderHendelse[]> = {};
  const add = (isoDato: string, e: KalenderHendelse) => {
    (ev[isoDato] ??= []).push(e);
  };

  for (const [uke, mandag, fase, type, notat] of UKER) {
    if (type === "Ferieuke") {
      add(mandag, { type: "skole", label: notat || "Ferie" });
      continue;
    }
    if (type === "Samlingsuke") {
      add(mandag, { type: "okt", label: "Fellessamling med Oslo · 7 dager" });
      continue;
    }
    let dager = [0, 2, 4];
    if (uke === 18) dager = [0, 2];
    if (uke === 20) dager = [2, 4];
    const sted = uke >= 44 || uke <= 13 ? "Treningslokalet" : "GFGK";
    const akser = AKSER_PER_FASE[fase] || AKSER_PER_FASE.GRUNN;
    dager.forEach((off, i) => {
      add(dagIso(mandag, off), { type: "okt", label: akser[i % 3] + "-økt · " + sted, time: "08:00" });
    });
    if (uke === 35 || uke === 36) add(dagIso(mandag, 1), { type: "prove", label: "NGF/Team Norway-tester" });
    if (uke === 43) add(mandag, { type: "prove", label: "Testuke — IUP-baseline" });
    if (uke === 6) add(dagIso(mandag, 4), { type: "prove", label: "Intern teknisk sjekk" });
    if (uke === 10) add(dagIso(mandag, 4), { type: "prove", label: "Test og IUP-sjekk" });
    if (uke === 18) add(dagIso(mandag, 3), { type: "hendelse", label: "Fri · Kr. himmelfart" });
    if (uke === 20) add(mandag, { type: "hendelse", label: "17. mai — fri" });
    if (uke === 24) add(dagIso(mandag, 4), { type: "hendelse", label: "Sesong- og skoleårsavslutning" });
  }

  // Skolens egne datoer — skolerute og foreldremøter (skolens PDF-er 2026/27).
  const SKOLE_EVENTS: [string, HendelseType, string][] = [
    ["2026-08-12", "skole", "Planleggingsdager"],
    ["2026-08-14", "skole", "Skolestart VG1 · overnatting"],
    ["2026-08-17", "skole", "Skolestart VG2 og VG3"],
    ["2026-08-26", "hendelse", "Foreldremøte VG1 kl. 17:00"],
    ["2026-09-28", "skole", "Høstferie"],
    ["2026-10-08", "hendelse", "Foreldremøte VG1 kl. 17:00"],
    ["2026-10-15", "hendelse", "Foreldremøte VG2 kl. 17:00"],
    ["2026-11-19", "skole", "Planleggingsdag · fri"],
    ["2026-12-18", "skole", "Siste skoledag før jul"],
    ["2027-01-04", "skole", "Skolestart etter jul"],
    ["2027-01-14", "hendelse", "Foreldremøte VG3 kl. 17:00"],
    ["2027-01-21", "hendelse", "Foreldremøte VG1 kl. 17:00"],
    ["2027-02-22", "skole", "Vinterferie"],
    ["2027-03-01", "prove", "Prøveperiode uke 9–10"],
    ["2027-03-09", "hendelse", "Foreldremøte VG2 kl. 17:00"],
    ["2027-03-16", "hendelse", "Foreldremøte VG1 kl. 17:00"],
    ["2027-03-22", "skole", "Påskeferie"],
    ["2027-05-24", "prove", "Eksamen uke 21–22"],
    ["2027-06-18", "skole", "Siste skoledag"],
  ];
  for (const [isoDato, type, label] of SKOLE_EVENTS) add(isoDato, { type, label });

  // Turneringer høst 2026 (Olyo Juniortour KP3 + Østlandstour 9–11).
  // Vår 2027 (Norgescup/Østlandstour vår/Srixon Tour/NM) MANGLER fortsatt —
  // se src/lib/gruppe-kalender/wang-turneringer.ts, neste steg i innleggingen.
  add("2026-09-05", { type: "prove", label: "Olyo KP3 · Mjøsen GK · frist 2. sep" });
  add("2026-09-19", { type: "prove", label: "Olyo KP3 · Skjeberg GK · frist 16. sep" });
  add("2026-09-20", { type: "prove", label: "Olyo · Gamle Fredrikstad GK" });
  add("2026-09-20", { type: "prove", label: "Olyo finale KP3 · Gamle Fredrikstad GK · frist 17. sep" });
  add("2026-08-29", { type: "prove", label: "Østlandstour 9 · Mørk Open" });
  add("2026-08-30", { type: "prove", label: "Østlandstour 9 · Mørk Open" });
  add("2026-09-12", { type: "prove", label: "Østlandstour 10 · Asker Open" });
  add("2026-09-13", { type: "prove", label: "Østlandstour 10 · Asker Open" });
  add("2026-09-19", { type: "prove", label: "Østlandstour 11 · finale, Kjekstad GK" });
  add("2026-09-20", { type: "prove", label: "Østlandstour 11 · finale, Kjekstad GK" });

  return ev;
}

export const ARSPLAN_EVENTS: Record<string, KalenderHendelse[]> = byggEvents();

// ---- Foreldre: ukessammendrag (fredagens rapport) -------------------------

export interface Ukessammendrag {
  uke: number;
  datoer: string;
  periode: string;
  maalsetning: string;
  fokus: string[];
  gjennomfort: string[];
  hoydepunkt: string;
  neste: string;
  trener: string;
}

/** Tom i dag — fasitens tomtilstand. Fylles av treneren hver fredag. */
export const UKESRAPPORTER: Ukessammendrag[] = [];

/** «Første sammendrag kommer fredag <dato>» — beregnet fra en gitt Oslo-korrekt nå-dato. */
export function nesteFredagTekst(naaIso: string): string {
  const naa = d(naaIso);
  const ukedag = naa.getUTCDay();
  let off = (5 - ukedag + 7) % 7;
  if (off === 0) off = 7;
  naa.setUTCDate(naa.getUTCDate() + off);
  return naa.getUTCDate() + ". " + MONTHS_NO[naa.getUTCMonth()];
}
