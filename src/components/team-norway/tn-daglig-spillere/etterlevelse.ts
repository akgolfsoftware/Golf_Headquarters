/**
 * Planlagt mot gjennomført tid per uke for Team Norway-skjermene (TN-01 og TN-02).
 *
 * Regelen følger beslutningen 26.09.2026 (§KARTLEGGINGSØKT FJERNES, OG ETTERLEVELSE
 * ER TID MOT PLAN): minutter på gjennomførte økter delt på minutter på planlagte
 * økter med passert sluttid. Fremtidige økter teller ikke. Mangler forfalte økter,
 * er prosenten null og vises som «—».
 *
 * Øktene er `WorkbenchSession`: `date` er kalenderdagen lagret som UTC-midnatt
 * (naiv veggklokke), `startMinute` er minutter fra midnatt i Oslo-tid. Derfor
 * regnes «nå» om til samme naive veggklokke før sammenligning.
 */

export type EtterlevelseOkt = {
  dato: Date;
  startMinutt: number;
  varighet: number;
  status: string;
};

export type UkeTid = {
  /** Mandagen i uka, «YYYY-MM-DD». */
  mandag: string;
  ukenr: number;
  /** Minutter på planlagte økter med passert sluttid. */
  planlagt: number;
  /** Minutter på gjennomførte økter blant dem. */
  gjennomfort: number;
  /** Minutter på alle planlagte økter i uka, også fremtidige. */
  planlagtHeleUka: number;
  prosent: number | null;
};

/** Statuser som ikke er en plan spilleren skal følge. */
const IKKE_PLAN = new Set(["DRAFT", "CANCELLED"]);

export const TERSKEL_PROSENT = 70;

const osloDeler = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** «Nå» som naiv Oslo-veggklokke uttrykt i UTC-millisekunder. */
export function naivOsloNaa(naa: Date): number {
  const d = Object.fromEntries(osloDeler.formatToParts(naa).map((p) => [p.type, p.value]));
  return Date.UTC(Number(d.year), Number(d.month) - 1, Number(d.day), Number(d.hour), Number(d.minute));
}

const DAG_MS = 864e5;

/** Mandagen (UTC-midnatt) for en naiv dato. */
export function mandagFor(naivMs: number): number {
  const midnatt = Math.floor(naivMs / DAG_MS) * DAG_MS;
  const ukedag = (new Date(midnatt).getUTCDay() + 6) % 7; // 0 = mandag
  return midnatt - ukedag * DAG_MS;
}

/** ISO-ukenummer for en naiv dato. */
export function isoUke(naivMs: number): number {
  const d = new Date(Math.floor(naivMs / DAG_MS) * DAG_MS);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const aarStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - aarStart) / DAG_MS + 1) / 7);
}

export function dagnokkel(naivMs: number): string {
  return new Date(naivMs).toISOString().slice(0, 10);
}

export function erPlanlagt(okt: EtterlevelseOkt): boolean {
  return !IKKE_PLAN.has(okt.status);
}

export function sluttNaiv(okt: EtterlevelseOkt): number {
  return okt.dato.getTime() + (okt.startMinutt + okt.varighet) * 60_000;
}

/**
 * De siste `antallUker` ukene, eldste først, med denne uka sist.
 */
export function ukeEtterlevelse(okter: EtterlevelseOkt[], naa: Date, antallUker: number): UkeTid[] {
  const naaNaiv = naivOsloNaa(naa);
  const denneMandag = mandagFor(naaNaiv);
  const uker: UkeTid[] = [];
  for (let i = antallUker - 1; i >= 0; i -= 1) {
    const mandag = denneMandag - i * 7 * DAG_MS;
    uker.push({ mandag: dagnokkel(mandag), ukenr: isoUke(mandag), planlagt: 0, gjennomfort: 0, planlagtHeleUka: 0, prosent: null });
  }
  const perMandag = new Map(uker.map((u) => [u.mandag, u]));
  for (const okt of okter) {
    if (!erPlanlagt(okt)) continue;
    const uke = perMandag.get(dagnokkel(mandagFor(okt.dato.getTime())));
    if (!uke) continue;
    uke.planlagtHeleUka += okt.varighet;
    if (sluttNaiv(okt) > naaNaiv) continue;
    uke.planlagt += okt.varighet;
    if (okt.status === "COMPLETED") uke.gjennomfort += okt.varighet;
  }
  for (const uke of uker) uke.prosent = uke.planlagt === 0 ? null : Math.round((uke.gjennomfort / uke.planlagt) * 100);
  return uker;
}

/** To uker på rad under terskelen. Uker uten forfalte økter bryter rekken. */
export function underTerskelToUker(uker: UkeTid[]): boolean {
  if (uker.length < 2) return false;
  const [a, b] = uker.slice(-2);
  return a.prosent !== null && b.prosent !== null && a.prosent < TERSKEL_PROSENT && b.prosent < TERSKEL_PROSENT;
}
