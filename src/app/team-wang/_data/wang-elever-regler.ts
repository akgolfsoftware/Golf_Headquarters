/**
 * Rene regler for WANG-skjermene under Meldinger og Elever (WANG-07, 44, 45,
 * 46, WG-04, WG-05, WANG-05). Ingen database her — datalasteren
 * (`wang-elever-data.ts`) henter, disse funksjonene former, og testene låser.
 *
 * Grunnregler:
 *   - Manglende verdi er `null`, og visningen skriver «—». Aldri 0 eller et gjett.
 *   - Snittscore regnes bare på atten-hullsrunder (Round har ingen hull-kolonne;
 *     antallet HoleScore-rader avgjør). Brutto score, aldri netto.
 *   - Etterlevelse er gjennomført tid mot planlagt tid, bare for økter som er
 *     over (beslutninger.md §KARTLEGGINGSØKT FJERNES, og workbench/compliance.ts).
 *   - Alle kalenderdager regnes i Europe/Oslo.
 */

import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";

const osloIsoFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Norsk kalenderdag som «YYYY-MM-DD». */
export function osloIso(d: Date): string {
  return osloIsoFormat.format(d);
}

/** «YYYY-MM-DD» + n dager, regnet som ren kalenderaritmetikk. */
export function leggTilDagerIso(iso: string, dager: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + dager));
  return t.toISOString().slice(0, 10);
}

/** «YYYY-MM-DD» som UTC-midnatt — slik `@db.Date`-kolonner lagres. */
export function isoTilUtcDato(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

/** «DD.MM.ÅÅÅÅ» fra «YYYY-MM-DD». */
export function isoTilNorsk(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}.${m}.${a}`;
}

/** «DD.MM» fra «YYYY-MM-DD». */
export function isoTilKort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

/** Hele år fylt på norsk kalenderdag. `null` uten fødselsdato. */
export function alderPaDato(fodt: Date | null, na: Date): number | null {
  if (!fodt) return null;
  const f = osloIso(fodt);
  const n = osloIso(na);
  const [fa, fm, fd] = f.split("-").map(Number);
  const [na_, nm, nd] = n.split("-").map(Number);
  let alder = na_ - fa;
  if (nm < fm || (nm === fm && nd < fd)) alder -= 1;
  return alder >= 0 ? alder : null;
}

/** Tall med norsk desimalkomma og fast antall desimaler. «—» når verdien mangler. */
export function norskTall(v: number | null, desimaler = 1): string {
  return formaterTall(v, desimaler, true);
}

/** Strokes gained med fortegn: «+1,2», «−0,4», «0,0». */
export function formaterSg(v: number | null): string {
  return formaterFortegn(v, 1);
}

export type WangUke = { uke: number; startIso: string; sluttIso: string };

/**
 * Uker rundt `na`. `forskyvning` 0 er inneværende uke, −1 forrige osv.
 * `sluttIso` er søndag (inklusiv).
 */
export function wangUke(na: Date, forskyvning: number): WangUke {
  const mandag = leggTilDagerIso(osloIso(startOfWeek(na)), forskyvning * 7);
  const [a, m, d] = mandag.split("-").map(Number);
  // Midt på dagen i UTC gir samme kalenderdag i Oslo uansett sommertid.
  return { uke: ukenummer(new Date(Date.UTC(a, m - 1, d, 12))), startIso: mandag, sluttIso: leggTilDagerIso(mandag, 6) };
}

export type EtterlevelseOkt = {
  datoIso: string;
  startMinutt: number;
  varighetMin: number;
  gjennomfort: boolean;
  /** Aktivt avlyst/trukket: teller ikke som planlagt. */
  avlyst: boolean;
};

export type UkeEtterlevelse = { planlagtMin: number; gjennomfortMin: number; prosent: number | null };

/** Minutter fra midnatt i Oslo for `na`. */
function osloMinutt(na: Date): number {
  const deler = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(na);
  const [t, m] = deler.split(":").map(Number);
  return t * 60 + m;
}

/** En økt er over når sluttiden er passert (Oslo-tid). */
export function oktErOver(okt: Pick<EtterlevelseOkt, "datoIso" | "startMinutt" | "varighetMin">, na: Date): boolean {
  const idag = osloIso(na);
  if (okt.datoIso < idag) return true;
  if (okt.datoIso > idag) return false;
  return okt.startMinutt + okt.varighetMin <= osloMinutt(na);
}

/**
 * Gjennomført tid av planlagt tid for økter i [fraIso, tilIso]. Bare økter som
 * er over teller. Ingen forfalte økter gir `prosent: null` («—»).
 */
export function etterlevelse(okter: EtterlevelseOkt[], fraIso: string, tilIso: string, na: Date): UkeEtterlevelse {
  let planlagtMin = 0;
  let gjennomfortMin = 0;
  for (const o of okter) {
    if (o.datoIso < fraIso || o.datoIso > tilIso || o.avlyst) continue;
    if (!oktErOver(o, na)) continue;
    planlagtMin += o.varighetMin;
    if (o.gjennomfort) gjennomfortMin += o.varighetMin;
  }
  return { planlagtMin, gjennomfortMin, prosent: planlagtMin > 0 ? Math.round((gjennomfortMin / planlagtMin) * 100) : null };
}

/** «3,5 t» fra minutter. */
export function timerTekst(minutter: number): string {
  const t = minutter / 60;
  return `${Number.isInteger(t) ? String(t) : norskTall(t, 1)} t`;
}

export type RundeGrunnlag = { score: number; antallHull: number };

/** Snitt brutto score på atten-hullsrunder. `null` uten slike runder. */
export function snittscore(runder: RundeGrunnlag[]): { snitt: number | null; antall: number } {
  const hele = runder.filter((r) => r.antallHull === 18);
  if (hele.length === 0) return { snitt: null, antall: 0 };
  return { snitt: hele.reduce((s, r) => s + r.score, 0) / hele.length, antall: hele.length };
}

/** Snitt av felt der verdien finnes. `null` når ingen runder har verdien. */
export function snittAv(verdier: Array<number | null | undefined>): number | null {
  const ekte = verdier.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (ekte.length === 0) return null;
  return ekte.reduce((s, v) => s + v, 0) / ekte.length;
}

/**
 * Hvem som førte testresultatet. Ført av en annen enn eleven (trener på
 * testdag) er «Kontrollert». Ført av eleven selv, eller uten registrert fører,
 * er «Egenført».
 */
export function testMerke(r: { userId: string; recordedById: string | null }): "Kontrollert" | "Egenført" {
  return r.recordedById && r.recordedById !== r.userId ? "Kontrollert" : "Egenført";
}

/** Siste resultat per test (listen må være sortert nyest først). */
export function sistePerTest<T extends { testId: string }>(rader: T[]): T[] {
  const sett = new Set<string>();
  const ut: T[] = [];
  for (const r of rader) {
    if (sett.has(r.testId)) continue;
    sett.add(r.testId);
    ut.push(r);
  }
  return ut;
}

/** Deler turneringer i kommende (fra og med i dag) og spilte. */
export function delTurneringer<T extends { startDato: Date }>(rader: T[], na: Date): { kommende: T[]; siste: T[] } {
  const idag = osloIso(na);
  const kommende = rader.filter((r) => osloIso(r.startDato) >= idag).sort((a, b) => a.startDato.getTime() - b.startDato.getTime());
  const siste = rader.filter((r) => osloIso(r.startDato) < idag).sort((a, b) => b.startDato.getTime() - a.startDato.getTime());
  return { kommende, siste };
}

/** Klassetrinn fra `User.schoolYear` («VG2», «vg 2», «2») til «VG2». Ukjent gir `null`. */
export function normaliserKlasse(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.trim().toUpperCase().replace(/\s+/g, "");
  const m = /^(?:VG)?([123])$/.exec(s);
  if (m) return `VG${m[1]}`;
  return s.length > 0 ? v.trim() : null;
}

export type Kalenderdag = { iso: string; nr: number; iMaaned: boolean };

/** Månedsrutenett mandag–søndag som dekker hele måneden («YYYY-MM»). */
export function manedsrutenett(maaned: string): Kalenderdag[] {
  const [a, m] = maaned.split("-").map(Number);
  const forste = `${maaned}-01`;
  const ukedag = (new Date(Date.UTC(a, m - 1, 1)).getUTCDay() + 6) % 7; // 0 = mandag
  const start = leggTilDagerIso(forste, -ukedag);
  const dagerIMaaned = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const antall = Math.ceil((ukedag + dagerIMaaned) / 7) * 7;
  return Array.from({ length: antall }, (_, i) => {
    const iso = leggTilDagerIso(start, i);
    return { iso, nr: Number(iso.slice(8, 10)), iMaaned: iso.slice(0, 7) === maaned };
  });
}

/** «YYYY-MM» fra søkeparameter, ellers inneværende måned i Oslo. */
export function lesMaaned(v: string | string[] | undefined, na: Date): string {
  const s = Array.isArray(v) ? v[0] : v;
  if (s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return s;
  return osloIso(na).slice(0, 7);
}

const MND = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];

/** «Oktober 2026». */
export function maanedsnavn(maaned: string): string {
  const [a, m] = maaned.split("-").map(Number);
  return `${MND[m - 1]} ${a}`;
}

/** Forrige/neste måned som «YYYY-MM». */
export function flyttMaaned(maaned: string, delta: number): string {
  const [a, m] = maaned.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}
