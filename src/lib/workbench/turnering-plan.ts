/**
 * Turneringsfanen i Workbench (fasit: fase1/workbench-turnering.html).
 *
 * Poenget med flata er kollisjonen mellom turnering og periodisering: en
 * turnering i feil periode er en planleggingsfeil som er usynlig så lenge
 * turneringer og perioder bor i hver sin skjerm. Her ligger de oppå
 * hverandre, og sammenstøtet vurderes av `vurderKollisjon`.
 *
 * Ren modul — deles av server (load-workbench) og klient (WorkbenchV2).
 * Ingen server-imports, ingen Date.now(): «i dag» sendes alltid inn.
 */

import type { LPhase } from "@/generated/prisma/client";

export type TurneringPaamelding = {
  /** TournamentEntry.id */
  id: string;
  navn: string;
  sted: string | null;
  /** ISO-dato (YYYY-MM-DD) */
  fra: string;
  /** ISO-dato — lik `fra` når sluttdato mangler */
  til: string;
  kategori: string | null;
  /** MAJOR | NORMAL | LOCAL */
  prioritet: string;
  /** TournamentEntryStatus */
  status: string;
  notat: string | null;
  /** PLANNED = på planen, ikke bekreftet påmeldt — krever avklaring. */
  uavklart: boolean;
};

export type PeriodeBlokk = {
  lPhase: LPhase;
  /** ISO-dato eller ISO-datetime — kun dato-delen brukes. */
  startDate: string;
  endDate: string;
};

export type KollisjonsVurdering =
  | { ja: false; periode: PeriodeBlokk | null }
  | { ja: true; grunn: string; periode: PeriodeBlokk | null };

/** Lokal midnatt av dato-delen — robust mot både «2026-08-29» og full ISO. */
function d(iso: string): number {
  return new Date(iso.slice(0, 10) + "T00:00:00").getTime();
}

function inneholder(b: PeriodeBlokk, isoDato: string): boolean {
  const t = d(isoDato);
  return d(b.startDate) <= t && t <= d(b.endDate);
}

/**
 * Hovedperioden en dato faller i (GRUNN/SPESIAL/TURNERING — treningsfasene).
 * TESTUKE/FERIE/samlinger er innslag oppå hovedperiodene og vurderes separat.
 */
export function periodeForDato(isoDato: string, blokker: PeriodeBlokk[]): PeriodeBlokk | null {
  const HOVED: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
  return blokker.find((b) => HOVED.includes(b.lPhase) && inneholder(b, isoDato)) ?? null;
}

/**
 * En turnering kolliderer når den ligger i en periode som ikke er satt av til
 * å konkurrere, eller oppå testuka. Å spille major i GRUNN er ikke ulovlig —
 * det er en avveining noen må ta bevisst, og den avveiningen krever at den
 * vises (jf. invariant 1: anbefalinger sperrer aldri).
 */
export function vurderKollisjon(
  fraIso: string,
  blokker: PeriodeBlokk[],
  lPhaseLabel: (l: LPhase) => string,
): KollisjonsVurdering {
  // Uten periodisering finnes det ingenting å kollidere med — det er ikke
  // det samme som «ingen kollisjon funnet», og UI-et skal si det ærlig.
  if (blokker.length === 0) return { ja: false, periode: null };
  const periode = periodeForDato(fraIso, blokker);
  const testuke = blokker.find((b) => b.lPhase === "TESTUKE" && inneholder(b, fraIso));
  if (testuke) return { ja: true, grunn: "Kolliderer med testuka.", periode };
  if (!periode) return { ja: true, grunn: "Ligger utenfor alle periodene i sesongplanen.", periode: null };
  if (periode.lPhase !== "TURNERING") {
    return { ja: true, grunn: `Ligger i ${lPhaseLabel(periode.lPhase)}, ikke i en turneringsperiode.`, periode };
  }
  return { ja: false, periode };
}

export type SesongVindu = { fra: string; til: string };

/**
 * Tidslinjens vindu: fra første til siste periodeblokk. Uten periodisering
 * finnes ingen tidslinje å tegne — kallere skal da vise ærlig tom tilstand.
 */
export function sesongvindu(blokker: PeriodeBlokk[]): SesongVindu | null {
  if (blokker.length === 0) return null;
  const sortert = blokker.slice().sort((a, b) => d(a.startDate) - d(b.startDate));
  const slutt = blokker.slice().sort((a, b) => d(b.endDate) - d(a.endDate));
  return { fra: sortert[0].startDate.slice(0, 10), til: slutt[0].endDate.slice(0, 10) };
}

/** Posisjon i vinduet, 0–100, klemt. */
export function prosentAvVindu(isoDato: string, vindu: SesongVindu): number {
  const total = d(vindu.til) - d(vindu.fra);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, ((d(isoDato) - d(vindu.fra)) / total) * 100));
}

/** Hele dager fra a til b (negativt når b er før a). */
export function dagerMellom(aIso: string, bIso: string): number {
  return Math.round((d(bIso) - d(aIso)) / 86_400_000);
}

/** Månedsetiketter for vinduet, én per kalendermåned, norsk kortform. */
export function vinduMaaneder(vindu: SesongVindu): string[] {
  const NAVN = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  const ut: string[] = [];
  const start = new Date(vindu.fra + "T00:00:00");
  const slutt = new Date(vindu.til + "T00:00:00");
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= slutt && ut.length < 14) {
    ut.push(NAVN[cur.getMonth()]);
    cur.setMonth(cur.getMonth() + 1);
  }
  return ut;
}

/** «29. aug» / «29. aug–30. aug» — kompakt datospenn til rader og ark. */
export function datoSpenn(fraIso: string, tilIso: string): string {
  const NAVN = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  const f = new Date(fraIso.slice(0, 10) + "T00:00:00");
  const t = new Date(tilIso.slice(0, 10) + "T00:00:00");
  const en = `${f.getDate()}. ${NAVN[f.getMonth()]}`;
  if (fraIso.slice(0, 10) === tilIso.slice(0, 10)) return en;
  return `${en}–${t.getDate()}. ${NAVN[t.getMonth()]}`;
}
