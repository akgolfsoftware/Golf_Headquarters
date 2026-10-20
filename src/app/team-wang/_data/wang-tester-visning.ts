// Visningsmodellen for Tester i WANG-trenerflaten (pakke 4). Typene og
// testbatteriet ligger her uten server-avhengigheter, så klienten kan bruke dem.

export type WangTestAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface WangTestResultat {
  id: string;
  elevId: string;
  testId: string;
  testNavn: string;
  akse: WangTestAkse;
  /** «YYYY-MM-DD» (Oslo). */
  datoIso: string;
  /** Ferdig formatert med formaterLagretTestResultat. */
  verdi: string;
  /** Ført av trener, eller attestert av vitne. */
  kontrollert: boolean;
  avvist: boolean;
}

export type WangSamtykkeStatus = "DELT" | "VENTER_PA_FORELDER" | "IKKE_DELT" | "IKKE_SVART";

export interface WangTesterData {
  /** Elever i gruppa med gyldig testsamtykke mot WANG. */
  delerIder: string[];
  /** Nyeste først. Bare for elevene i delerIder. */
  resultater: WangTestResultat[];
  /** Testsamtykket per elev. Hentes bare for Administrasjon (sportssjef). */
  samtykke?: Record<string, WangSamtykkeStatus>;
}

export const TOM_TESTERDATA: WangTesterData = { delerIder: [], resultater: [] };

export type WangTestDel = "golfslag" | "teknikk" | "fysisk";

export interface WangBatteriTest {
  /** Navnet på skjerm (Team Norway Golf – Tester 2026). */
  navn: string;
  /** Kort navn til smale kolonner. */
  kort: string;
  del: WangTestDel;
  akse: WangTestAkse;
  beskrivelse: string;
  /** Hvordan resultatet leses. */
  enhet: string;
  fysisk: boolean;
  /** Minste antall per skoleår for de prioriterte testene. */
  prioritertMin: number | null;
  /** Treneren fører PEI- og teknikktestene; resten fører eleven i PlayerHQ (Anders 20.10.2026). */
  trenerForer: boolean;
  /** Navnene testen har i basen (TestDefinition.name). Første treff vinner. */
  dbNavn: string[];
}

/**
 * Ett testbatteri for AK Golf, WANG og Team Norway (beslutninger §ÉN IUP OG ETT TESTBATTERI), med de 14 golftestene
 * fra Team Norway Golf – Tester 2026 i dokumentets rekkefølge og de fem fysiske. Formatene følger testbeskrivelsen
 * (Anders 20.10.2026): PEI på 8-ball, 1 eller 4 poeng på Wedge Gate, Nærspill Gate og VISA Express.
 */
export const TESTBATTERI: WangBatteriTest[] = [
  { navn: "Driver Basic", kort: "Driver", del: "golfslag", akse: "SLAG", beskrivelse: "Driver, PEI", enhet: "PEI", fysisk: false, prioritertMin: 1, trenerForer: true, dbNavn: ["Driver Basic"] },
  { navn: "Inspill Basic", kort: "Inspill", del: "golfslag", akse: "SLAG", beskrivelse: "Innspill, PEI", enhet: "PEI", fysisk: false, prioritertMin: 2, trenerForer: true, dbNavn: ["Inspill Basis", "Inspill Basic", "Innspill Basis"] },
  { navn: "Wedge Variation", kort: "Wedge", del: "golfslag", akse: "SLAG", beskrivelse: "Wedge på ulike lengder, PEI", enhet: "PEI", fysisk: false, prioritertMin: 2, trenerForer: true, dbNavn: ["Wedge Variation"] },
  { navn: "8-balls variation", kort: "8-ball", del: "golfslag", akse: "SLAG", beskrivelse: "24 nærspillslag, meter til hullet, PEI", enhet: "PEI", fysisk: false, prioritertMin: 2, trenerForer: true, dbNavn: ["8-ball Variation", "8-balls variation", "8-ball"] },
  { navn: "Putt 1–3 m", kort: "Putt 1–3", del: "golfslag", akse: "SLAG", beskrivelse: "Antall putter", enhet: "putter", fysisk: false, prioritertMin: 4, trenerForer: false, dbNavn: ["Putt 1-3m", "Putt 1–3 m", "Putt 1-3 m"] },
  { navn: "Golfslag på banen", kort: "Bane", del: "golfslag", akse: "SLAG", beskrivelse: "Slag på banen, PEI", enhet: "PEI", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["Golfslag Bane", "Golfslag på banen"] },
  { navn: "18 hulls inspill", kort: "18 inspill", del: "golfslag", akse: "SLAG", beskrivelse: "Innspill på 18 hull, PEI", enhet: "PEI", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["18-hull Inspill", "18 hulls inspill"] },
  { navn: "9 hull lengde", kort: "9 hull", del: "golfslag", akse: "SLAG", beskrivelse: "Putt, restavstand i fot, poeng", enhet: "poeng", fysisk: false, prioritertMin: null, trenerForer: false, dbNavn: ["9 hull lengde"] },
  { navn: "Driver Gate", kort: "Driver G", del: "teknikk", akse: "TEK", beskrivelse: "6 slag gjennom porten", enhet: "OK av 6", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["TN Driver Gate", "Driver Gate"] },
  { navn: "Wedge Gate", kort: "Wedge G", del: "teknikk", akse: "TEK", beskrivelse: "40, 50 og 60 m, 1 eller 4 poeng", enhet: "av 36 p", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["TN Wedge Gate", "Wedge Gate"] },
  { navn: "Putt Gate", kort: "Putt G", del: "teknikk", akse: "TEK", beskrivelse: "10 putter gjennom porten", enhet: "OK av 10", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["TN Putt Gate", "Putt Gate"] },
  { navn: "Nærspill Gate", kort: "Nærspill G", del: "teknikk", akse: "TEK", beskrivelse: "1 eller 4 poeng per slag", enhet: "av 36 p", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["TN Nærspill Gate", "Nærspill Gate"] },
  { navn: "VISA Express", kort: "VISA", del: "teknikk", akse: "TEK", beskrivelse: "1 eller 4 poeng per slag", enhet: "av 36 p", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["TN VISA Express", "VISA Express"] },
  { navn: "Putt Speed 1 × 5", kort: "Putt Speed", del: "teknikk", akse: "TEK", beskrivelse: "5 putter mot mållinjen", enhet: "cm", fysisk: false, prioritertMin: null, trenerForer: true, dbNavn: ["Putt Speed 1x5", "Putt Speed 1 × 5"] },
  { navn: "Benkpress", kort: "Benk", del: "fysisk", akse: "FYS", beskrivelse: "3RM med stopp på brystet", enhet: "kg", fysisk: true, prioritertMin: null, trenerForer: false, dbNavn: ["Benkpress"] },
  { navn: "Markløft trapbar", kort: "Markløft", del: "fysisk", akse: "FYS", beskrivelse: "3RM", enhet: "kg", fysisk: true, prioritertMin: null, trenerForer: false, dbNavn: ["Markløft trapbar", "Markløft"] },
  { navn: "Lengdehopp", kort: "Lengde", del: "fysisk", akse: "FYS", beskrivelse: "Stille lengde, beste av tre", enhet: "cm", fysisk: true, prioritertMin: null, trenerForer: false, dbNavn: ["Lengdehopp"] },
  { navn: "Rotasjonskast", kort: "Rotasjon", del: "fysisk", akse: "FYS", beskrivelse: "Medisinball, beste side", enhet: "m", fysisk: true, prioritertMin: null, trenerForer: false, dbNavn: ["Rotasjonskast"] },
  { navn: "Club Speed", kort: "Club Speed", del: "fysisk", akse: "FYS", beskrivelse: "Driver, snitt av tre, radar", enhet: "mph", fysisk: true, prioritertMin: null, trenerForer: false, dbNavn: ["Club Speed"] },
];

export const TEST_DEL_NAVN: Record<WangTestDel, string> = { golfslag: "Golfslag", teknikk: "Teknikk", fysisk: "Fysisk" };

const normaliser = (s: string) => s.toLowerCase().replace(/[^a-z0-9æøå]/g, "");

/** Om et resultat hører til en test i batteriet: testens navn i basen starter med ett av testens kjente navn. */
export function hoererTil(resultat: Pick<WangTestResultat, "testNavn">, testNavn: string): boolean {
  const test = TESTBATTERI.find((t) => t.navn === testNavn);
  const navn = normaliser(resultat.testNavn);
  const kandidater = test ? [...test.dbNavn, test.navn] : [testNavn];
  return kandidater.some((k) => navn.startsWith(normaliser(k)));
}

/** Skoleåret som gjelder for en dato: 1. august til 31. juli. */
export function skoleaarStart(idagIso: string): string {
  const [y, m] = idagIso.split("-").map(Number);
  return `${m >= 8 ? y : y - 1}-08-01`;
}

/** Nyeste resultat per elev for én test (resultatene er sortert nyeste først). */
export function sistePerElev(resultater: WangTestResultat[]): WangTestResultat[] {
  const sett = new Map<string, WangTestResultat>();
  for (const r of resultater) if (!sett.has(r.elevId)) sett.set(r.elevId, r);
  return [...sett.values()];
}
