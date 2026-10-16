/**
 * PH-IUP-01 Fireukerssjekk — rene regler (ingen DB). Design:
 * docs/design-handoff/design/playerhq/PH-IUP.jsx.txt (FT) og README › PH-IUP-01.
 *
 * Runden er en fast blokk på fire ISO-uker. Blokkene er forankret i
 * mandag uke 32 2026 (03.08.2026), slik designet viser «uke 32–35» som forrige
 * og «uke 36–39» som gjeldende runde. Fristen er søndag i blokkens siste uke.
 */

import { IUP_KATEGORIER, hentUtviklingssporsmal, type IupNivaa, type IupSporsmal } from "./utviklingssjekk";

export const FIREUKER_VERSJON = "iup-2027" as const;
const ANKER_UTC = Date.UTC(2026, 7, 3); // mandag 03.08.2026, uke 32
const DAG = 86_400_000;
const BLOKK = 28 * DAG;

export type FireukerRunde = {
  /** YYYY-MM-DD, mandag første uke. */
  periodeStart: string;
  /** YYYY-MM-DD, søndag siste uke (fristen). */
  periodeSlutt: string;
  ukeFra: number;
  ukeTil: number;
};

export function isoUke(utcMs: number): number {
  const d = new Date(utcMs);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / DAG + 1) / 7);
}
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Runden som inneholder en norsk kalenderdag (YYYY-MM-DD). `forskyvning` -1 gir forrige runde. */
export function fireukerRunde(dag: string, forskyvning = 0): FireukerRunde {
  const [a, m, d] = dag.split("-").map(Number);
  const ms = Date.UTC(a, m - 1, d);
  const indeks = Math.floor((ms - ANKER_UTC) / BLOKK) + forskyvning;
  const start = ANKER_UTC + indeks * BLOKK;
  const slutt = start + 27 * DAG;
  return { periodeStart: iso(start), periodeSlutt: iso(slutt), ukeFra: isoUke(start), ukeTil: isoUke(slutt) };
}

/** Norsk kalenderdag (Europe/Oslo) som YYYY-MM-DD. */
export function osloDag(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Nivå etter gjeldende AK-vedtak (beslutninger.md §ÉN IUP): Ung = 8.–10. klasse
 * skoleåret 2026/27 (født 2011–2013), ellers Junior. Amatør og Profesjonell
 * settes ikke automatisk. Ukjent fødselsår gir Junior.
 */
export function fireukerNiva(fodselsaar: number | null): Extract<IupNivaa, "UNG" | "JUNIOR"> {
  return fodselsaar != null && fodselsaar >= 2011 && fodselsaar <= 2013 ? "UNG" : "JUNIOR";
}

export const NIVA_NAVN: Record<IupNivaa, string> = { UNG: "Ung", JUNIOR: "Junior", AMATOR: "Amatør", PROFESJONELL: "Profesjonell" };

export type Omraade = { kategori: string; sporsmal: IupSporsmal[] };

/** De sju områdene i kildens rekkefølge, med spørsmålene ordrett fra kilden. */
export function fireukerOmraader(niva: IupNivaa): Omraade[] {
  const alle = hentUtviklingssporsmal(FIREUKER_VERSJON, niva);
  return IUP_KATEGORIER.map((kategori) => ({ kategori, sporsmal: alle.filter((s) => s.kategori === kategori) }))
    .filter((o) => o.sporsmal.length > 0);
}

/** Snitt av besvarte spørsmål. Ingen svar gir null («—»), aldri 0. */
export function snitt(sporsmal: ReadonlyArray<{ id: string }>, svar: Record<string, number> | null | undefined): number | null {
  if (!svar) return null;
  const v = sporsmal.map((s) => svar[s.id]).filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Én desimal med komma. null → «—». */
export function desimal(v: number | null): string {
  return v == null ? "—" : v.toFixed(1).replace(".", ",");
}

/** Endring mot forrige runde: «+0,4», «−0,2» (ekte minus) eller «±0,0». */
export function endring(naa: number | null, forrige: number | null): string {
  if (naa == null || forrige == null) return "—";
  const d = naa - forrige;
  const tegn = d > 0.04 ? "+" : d < -0.04 ? "−" : "±";
  return tegn + Math.abs(d).toFixed(1).replace(".", ",");
}

export const PROSESS_SVAR = ["JA", "DELVIS", "NEI"] as const;
export type ProsessSvar = (typeof PROSESS_SVAR)[number];
export const PROSESS_NAVN: Record<ProsessSvar, string> = { JA: "Ja", DELVIS: "Delvis", NEI: "Nei" };

/** Hvem som ser svarene, som designets meta-linje: «ANDERS, WANG OG TEAM NORWAY». */
export function serSvareneTekst(navn: string[]): string | null {
  const n = [...new Set(navn.map((x) => x.trim()).filter(Boolean))];
  if (!n.length) return null;
  const liste = n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} og ${n.at(-1)}`;
  return `${liste} ser svarene`;
}
