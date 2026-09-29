/**
 * Rene formaterere for WANG Tester og Konkurranse (WG-03, WANG-08–11, 22, 23,
 * 27, 37, 39). All dato- og ukelogikk regnes mot norsk kalenderdag
 * (Europe/Oslo), aldri serverens UTC-dag. Manglende verdi blir «—».
 */

const OSLO = "Europe/Oslo";

const datoFormat = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, day: "2-digit", month: "2-digit", year: "numeric" });
const datoKortFormat = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, day: "2-digit", month: "2-digit", year: "2-digit" });
const ukedagFormat = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, weekday: "long" });
const isoFormat = new Intl.DateTimeFormat("en-CA", { timeZone: OSLO, year: "numeric", month: "2-digit", day: "2-digit" });

export const TOM = "—";

/** «29.09.2026». */
export function datoTekst(d: Date | null | undefined): string {
  return d ? datoFormat.format(d) : TOM;
}

/** «29.09.26» — til søyleetiketter der plassen er liten. */
export function datoKort(d: Date | null | undefined): string {
  return d ? datoKortFormat.format(d) : TOM;
}

/** «Tirsdag 29.09.2026». */
export function datoMedUkedag(d: Date): string {
  const dag = ukedagFormat.format(d);
  return `${dag.charAt(0).toUpperCase()}${dag.slice(1)} ${datoTekst(d)}`;
}

/** Oslo-kalenderdag som «YYYY-MM-DD». */
export function osloIso(d: Date): string {
  return isoFormat.format(d);
}

/** Hele kalenderdager fra `fra` til `til` i Oslo (negativt når `til` er passert). */
export function dagerMellom(fra: Date, til: Date): number {
  const a = osloIso(fra).split("-").map(Number);
  const b = osloIso(til).split("-").map(Number);
  return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86_400_000);
}

/** Norsk desimaltall, uten tusenskille-overraskelser: 12,5. */
export function tallTekst(v: number | null | undefined, maksDesimaler = 1): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return TOM;
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: maksDesimaler, useGrouping: false }).format(v);
}

/** Til par: «+3», «−2», «E». */
export function motParTekst(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return TOM;
  if (v === 0) return "E";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

/**
 * «DD.MM.ÅÅÅÅ» til en dato (midt på dagen i UTC, så Oslo-dagen blir riktig).
 * Null ved ugyldig dato (31.02, feil format).
 */
export function lesDatoTekst(tekst: string): Date | null {
  const m = /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/.exec(tekst);
  if (!m) return null;
  const [dag, maned, aar] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(aar, maned - 1, dag, 12));
  if (d.getUTCFullYear() !== aar || d.getUTCMonth() !== maned - 1 || d.getUTCDate() !== dag) return null;
  return d;
}

/** Enheten i parentes i en scoringsregel: «Maks vekt (kg)» → «kg». */
export function enhetFraRegel(regel: string): string | null {
  const m = /\(([^)]+)\)\s*$/.exec(regel.trim());
  return m ? m[1].trim() : null;
}

export type PeriodeValg = "sesong" | "aar";

/**
 * Perioden «Høsten 2026» (fra 1. august) eller «Våren 2027» (fra 1. januar),
 * og «Siste 12 mnd». Grensen er Oslo-kalenderdag.
 */
export function periodeFor(valg: PeriodeValg, naa: Date): { fra: Date; etikett: string } {
  const [aar, maned] = osloIso(naa).split("-").map(Number);
  if (valg === "aar") {
    const dag = Number(osloIso(naa).slice(8));
    return { fra: new Date(Date.UTC(aar - 1, maned - 1, dag)), etikett: "Siste 12 mnd" };
  }
  return maned >= 8
    ? { fra: new Date(Date.UTC(aar, 7, 1)), etikett: `Høsten ${aar}` }
    : { fra: new Date(Date.UTC(aar, 0, 1)), etikett: `Våren ${aar}` };
}

/** Første gyldige verdi av en søkeparameter. */
export function forsteParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
