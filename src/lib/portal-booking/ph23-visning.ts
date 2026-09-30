/**
 * Visningshjelpere for booking i PlayerHQ (PH-23, Precision Athletics).
 *
 * Lagrede tider er Oslo-veggklokke uten tidssone. Klokkeslett og dato leses
 * derfor rett ut av strengen («2026-09-30T14:30:00»), aldri gjennom en lokal
 * tidssone, så serveren (UTC) og nettleseren (Oslo) viser det samme.
 */

const UKEDAG_KORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const UKEDAG_LANG = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MND_KORT = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];
const MND_LANG = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

/** Veggklokke-streng for en lagret dato (Prisma gir veggklokka merket som UTC). */
export function naivIso(d: Date): string {
  return d.toISOString().slice(0, 19);
}

/** «14:30» fra «2026-09-30T14:30:00». */
export function klokke(iso: string): string {
  return iso.slice(11, 16);
}

function deler(iso: string): { y: number; m: number; d: number; dag: number } {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  return { y, m, d, dag: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** «Man 30. sep.» */
export function datoKort(iso: string): string {
  const p = deler(iso);
  return `${stor(UKEDAG_KORT[p.dag]!)} ${p.d}. ${MND_KORT[p.m - 1]}`;
}

/** «Mandag 30. september» */
export function datoLang(iso: string): string {
  const p = deler(iso);
  return `${stor(UKEDAG_LANG[p.dag]!)} ${p.d}. ${MND_LANG[p.m - 1]}`;
}

export type Dagsvalg = { iso: string; ukedag: string; dag: number; maaned: string };

/** Dagene fra og med i dag (Oslo), som «YYYY-MM-DD». */
export function osloDager(antall: number, naa: Date = new Date()): Dagsvalg[] {
  const idag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(naa);
  const start = deler(idag);
  return Array.from({ length: antall }, (_, i) => {
    const d = new Date(Date.UTC(start.y, start.m - 1, start.d + i));
    return {
      iso: d.toISOString().slice(0, 10),
      ukedag: UKEDAG_KORT[d.getUTCDay()]!.toUpperCase(),
      dag: d.getUTCDate(),
      maaned: MND_KORT[d.getUTCMonth()]!.toUpperCase(),
    };
  });
}

/** «1 250 kr» */
export function kr(ore: number): string {
  return `${String(Math.round(ore / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}
