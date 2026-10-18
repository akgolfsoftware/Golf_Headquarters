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

/**
 * Ett testbatteri for AK Golf, WANG og Team Norway (beslutninger §ÉN IUP OG ETT TESTBATTERI):
 * golftestene fra NGFs 6-årsløp og de fem fysiske. `navn` matches mot testens navn i basen.
 */
export const TESTBATTERI: { navn: string; akse: WangTestAkse; beskrivelse: string; fysisk: boolean }[] = [
  { navn: "8-ball", akse: "SLAG", beskrivelse: "Nærspill, 8 slag", fysisk: false },
  { navn: "Wedge Gate", akse: "SLAG", beskrivelse: "Godkjent eller bom per slag", fysisk: false },
  { navn: "Nærspill Gate", akse: "SLAG", beskrivelse: "Godkjent eller bom per slag", fysisk: false },
  { navn: "VISA Express", akse: "SLAG", beskrivelse: "Godkjent eller bom per slag", fysisk: false },
  { navn: "Driver basic", akse: "SLAG", beskrivelse: "5 slag, 220 eller 270 m", fysisk: false },
  { navn: "Innspill Basis", akse: "SLAG", beskrivelse: "5 slag, 125–160 m", fysisk: false },
  { navn: "Putt Speed", akse: "TEK", beskrivelse: "Lengdekontroll", fysisk: false },
  { navn: "9 hull lengde", akse: "TEK", beskrivelse: "Putt, restavstand i fot", fysisk: false },
  { navn: "Golfslag bane", akse: "SPILL", beskrivelse: "30 slag på bane", fysisk: false },
  { navn: "18 hull", akse: "SPILL", beskrivelse: "Brutto score", fysisk: false },
  { navn: "Benkpress", akse: "FYS", beskrivelse: "3RM med stopp på brystet", fysisk: true },
  { navn: "Markløft trapbar", akse: "FYS", beskrivelse: "3RM", fysisk: true },
  { navn: "Lengdehopp", akse: "FYS", beskrivelse: "Stille lengde, beste av tre", fysisk: true },
  { navn: "Rotasjonskast", akse: "FYS", beskrivelse: "Medisinball, beste side", fysisk: true },
  { navn: "Club Speed", akse: "FYS", beskrivelse: "Driver, snitt av tre", fysisk: true },
];

const normaliser = (s: string) => s.toLowerCase().replace(/[^a-z0-9æøå]/g, "");

/** Om et resultat hører til en test i batteriet (navnet i basen starter med batteriets navn). */
export function hoererTil(resultat: Pick<WangTestResultat, "testNavn">, testNavn: string): boolean {
  return normaliser(resultat.testNavn).startsWith(normaliser(testNavn));
}

/** Nyeste resultat per elev for én test (resultatene er sortert nyeste først). */
export function sistePerElev(resultater: WangTestResultat[]): WangTestResultat[] {
  const sett = new Map<string, WangTestResultat>();
  for (const r of resultater) if (!sett.has(r.elevId)) sett.set(r.elevId, r);
  return [...sett.values()];
}
