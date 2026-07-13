// Uke-helpers for treningsplanlegging.
// Norsk konvensjon: uka starter mandag.
//
// VIKTIG (tidssone): «Hvilken dag/uke er det?» regnes alltid mot norsk kalenderdag
// (Europe/Oslo) via Intl.DateTimeFormat. På Vercel kjører Node i UTC — rå getDay()/
// setHours(0,0,0,0) på new Date() ville pekt på UTC-dagen, så kl. 00:30 norsk tid
// er fortsatt «i går» i UTC → feil dag/uke i alle konsumenter.
//
// Representasjon (bevisst valg): returverdiene er midnatt i SERVERENS lokale tid
// på den norske kalenderdagen — IKKE det absolutte tidspunktet for norsk midnatt.
// Grunn: kodebasen bruker «naiv veggklokke»-konvensjon — scheduledAt o.l. skrives
// med setHours()/leses med getHours() i serverens lokale tid, og konsumentene gjør
// setDate()-aritmetikk og leser getDate()/getMonth()/getFullYear()/toDateString()
// direkte på returverdiene. Lokal midnatt matcher derfor både Prisma-grensene
// (gte/lt mot naivt lagrede tidsstempler) og visning/uke-aritmetikk hos
// konsumentene — uten DST-hopp (UTC har ingen, og lokal Date-aritmetikk håndterer
// norsk sommertid selv). Antar server-tidssone UTC (prod) eller Europe/Oslo (dev).

const osloDatoFormatter = new Intl.DateTimeFormat("en-CA", {
  // en-CA gir formatet YYYY-MM-DD.
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type KalenderDag = { aar: number; maned: number; dag: number }; // maned 1–12

function osloDato(date: Date): KalenderDag {
  const [aar, maned, dag] = osloDatoFormatter.format(date).split("-").map(Number);
  return { aar, maned, dag };
}

// Midnatt i serverens lokale tid på gitt kalenderdag.
// Date-konstruktøren normaliserer overløp av dag/måned.
function lokalMidnatt(k: KalenderDag): Date {
  return new Date(k.aar, k.maned - 1, k.dag);
}

// Kalenderdag-aritmetikk (Date.UTC normaliserer overløp av dag/måned).
function leggTilDager(k: KalenderDag, antall: number): KalenderDag {
  const d = new Date(Date.UTC(k.aar, k.maned - 1, k.dag + antall));
  return { aar: d.getUTCFullYear(), maned: d.getUTCMonth() + 1, dag: d.getUTCDate() };
}

// Ukedag for en kalenderdag: 0 = mandag … 6 = søndag.
function ukedagIdx(k: KalenderDag): number {
  const dag = new Date(Date.UTC(k.aar, k.maned - 1, k.dag)).getUTCDay(); // 0 = søndag
  return dag === 0 ? 6 : dag - 1;
}

export function startOfWeek(date: Date): Date {
  const k = osloDato(date);
  return lokalMidnatt(leggTilDager(k, -ukedagIdx(k)));
}

export function endOfWeek(date: Date): Date {
  const k = osloDato(date);
  return lokalMidnatt(leggTilDager(k, 7 - ukedagIdx(k)));
}

export function dagerIUken(start: Date): Date[] {
  const k = osloDato(start);
  return Array.from({ length: 7 }, (_, i) => lokalMidnatt(leggTilDager(k, i)));
}

export function ukenummer(date: Date): number {
  // ISO-uke (mandag-start) regnet på norsk kalenderdag.
  // Ren kalenderaritmetikk i UTC — uavhengig av server-tidssone.
  const k = osloDato(date);
  const d = new Date(Date.UTC(k.aar, k.maned - 1, k.dag));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
}

export function startOfMonth(date: Date): Date {
  const k = osloDato(date);
  return lokalMidnatt({ aar: k.aar, maned: k.maned, dag: 1 });
}

export function endOfMonth(date: Date): Date {
  const k = osloDato(date);
  return lokalMidnatt({ aar: k.aar, maned: k.maned + 1, dag: 1 });
}

export function sammeDag(a: Date, b: Date): boolean {
  return osloDatoFormatter.format(a) === osloDatoFormatter.format(b);
}

const DAGNAVN_KORT = ["man", "tir", "ons", "tor", "fre", "lør", "søn"] as const;
const DAGNAVN_LANG = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

export function dagNavnKort(date: Date): string {
  return DAGNAVN_KORT[ukedagIdx(osloDato(date))];
}

export function dagNavnLang(date: Date): string {
  return DAGNAVN_LANG[ukedagIdx(osloDato(date))];
}

export function formatPeriode(start: Date, slutt: Date): string {
  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
  });
  // Slutt er eksklusiv, så trekk 1 dag for visning
  const sluttVist = new Date(slutt);
  sluttVist.setDate(slutt.getDate() - 1);
  return `${formatter.format(start)}–${formatter.format(sluttVist)}`;
}
