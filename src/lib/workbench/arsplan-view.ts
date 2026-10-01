/**
 * AG-11-AR: ren logikk for årsplan og periodeskjema i Precision Athletics.
 * Datoer i skjemaet er dd.mm.åååå (som i tegningen), i lagring YYYY-MM-DD.
 * Alt her er uten database og uten React, så det kan testes direkte.
 */
import { PeriodeInputSchema, type PeriodeInput } from "@/lib/workbench/perioder";

export type PeriodeType = PeriodeInput["lPhase"];
export type OktAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export const OKT_AKSER: readonly OktAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Spor 0 = periode, spor 1 = samling, testuke og ferie (tegningens to spor). */
export const PERIODE_TYPER: readonly { verdi: PeriodeType; navn: string; kode: string; spor: 0 | 1 }[] = [
  { verdi: "GRUNN", navn: "Grunnperiode", kode: "GP", spor: 0 },
  { verdi: "SPESIAL", navn: "Spesialperiode", kode: "SP", spor: 0 },
  { verdi: "TURNERING", navn: "Turneringsperiode", kode: "TP", spor: 0 },
  { verdi: "EVALUERING", navn: "Evaluering", kode: "EV", spor: 0 },
  { verdi: "RESTITUSJON", navn: "Restitusjon", kode: "RE", spor: 0 },
  { verdi: "TESTUKE", navn: "Testuke", kode: "TU", spor: 1 },
  { verdi: "TRENINGSSAMLING", navn: "Treningssamling", kode: "TS", spor: 1 },
  { verdi: "HELDAGSSAMLING", navn: "Heldagssamling", kode: "HS", spor: 1 },
  { verdi: "FERIE", navn: "Ferie", kode: "FE", spor: 1 },
];

export const periodeType = (t: string) => PERIODE_TYPER.find((x) => x.verdi === t) ?? { verdi: t as PeriodeType, navn: t, kode: t.slice(0, 2), spor: 0 as const };

export const DAG = 86_400_000;
export const MANEDER = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"] as const;

/** YYYY-MM-DD → millisekunder UTC-midnatt. Aldri lokal tid (gotchas §Tid og datoer). */
export function isoMs(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export const msIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function isoTilDmy(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

/** dd.mm.åååå → YYYY-MM-DD, eller null hvis formatet eller datoen er ugyldig. */
export function dmyTilIso(dmy: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d));
  const iso = msIso(ms);
  return iso === `${y}-${mo}-${d}` ? iso : null;
}

export function ukenr(iso: string): number {
  const d = new Date(isoMs(iso));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return Math.ceil(((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAG + 1) / 7);
}

/** Timer med komma og ett desimal; «—» for manglende verdi. */
export function timerTekst(min: number | null | undefined): string {
  if (min == null || min <= 0) return "—";
  return `${String(Math.round((min / 60) * 10) / 10).replace(".", ",")} t`;
}

/** Skjemastate for en periode. Alle felt er tekst, slik at feltene kan stå tomme. */
export type PeriodeSkjema = {
  id: string | null;
  type: PeriodeType;
  fra: string;
  til: string;
  fokus: string;
  volMin: string;
  volMax: string;
  okter: Record<OktAkse, string>;
};

export const tomtSkjema = (): PeriodeSkjema => ({
  id: null, type: "GRUNN", fra: "", til: "", fokus: "", volMin: "", volMax: "",
  okter: { FYS: "", TEK: "", SLAG: "", SPILL: "", TURN: "" },
});

export type PeriodeRad = {
  id: string;
  type: PeriodeType;
  startDate: string;
  endDate: string;
  focus: string | null;
  ukevolumMin: number | null;
  ukevolumMax: number | null;
  budsjett: Partial<Record<OktAkse, number>> | null;
  /** Rullet ut fra en gruppes årsplan. */
  fraGruppe?: boolean;
};

export function skjemaFraPeriode(p: PeriodeRad): PeriodeSkjema {
  const t = (n: number | null | undefined) => (n == null ? "" : String(Math.round((n / 60) * 10) / 10).replace(".", ","));
  return {
    id: p.id, type: p.type, fra: isoTilDmy(p.startDate), til: isoTilDmy(p.endDate), fokus: p.focus ?? "",
    volMin: t(p.ukevolumMin), volMax: t(p.ukevolumMax),
    okter: Object.fromEntries(OKT_AKSER.map((a) => [a, p.budsjett?.[a] != null ? String(p.budsjett[a]) : ""])) as Record<OktAkse, string>,
  };
}

function timerTilMin(s: string): number | null | "feil" {
  const t = s.trim();
  if (!t) return null;
  if (!/^\d+([.,]\d+)?$/.test(t)) return "feil";
  return Math.round(parseFloat(t.replace(",", ".")) * 60);
}

export type SkjemaFeil = Partial<Record<"fra" | "til" | "volMin" | "volMax" | "okter" | "generelt", string>>;

/** Validerer skjemaet mot samme kontrakt som serveren (PeriodeInputSchema). */
export function skjemaTilInput(s: PeriodeSkjema): { ok: true; input: PeriodeInput } | { ok: false; feil: SkjemaFeil } {
  const feil: SkjemaFeil = {};
  const fra = dmyTilIso(s.fra);
  const til = dmyTilIso(s.til);
  if (!fra) feil.fra = "Skriv datoen som dd.mm.åååå.";
  if (!til) feil.til = "Skriv datoen som dd.mm.åååå.";
  if (fra && til && til < fra) feil.til = "Slutt kan ikke være før start.";
  const vmin = timerTilMin(s.volMin);
  const vmax = timerTilMin(s.volMax);
  if (vmin === "feil") feil.volMin = "Skriv timer som tall, for eksempel 6 eller 6,5.";
  if (vmax === "feil") feil.volMax = "Skriv timer som tall, for eksempel 6 eller 6,5.";
  if (typeof vmin === "number" && typeof vmax === "number" && vmax < vmin) feil.volMax = "Høyeste volum kan ikke være lavere enn laveste.";
  const budsjett: Partial<Record<OktAkse, number>> = {};
  for (const a of OKT_AKSER) {
    const t = s.okter[a].trim();
    if (!t) continue;
    if (!/^\d+$/.test(t) || Number(t) > 21) { feil.okter = "Økter per uke er hele tall fra 0 til 21."; break; }
    budsjett[a] = Number(t);
  }
  if (Object.keys(feil).length > 0 || !fra || !til || vmin === "feil" || vmax === "feil") return { ok: false, feil };
  const parsed = PeriodeInputSchema.safeParse({
    lPhase: s.type, startDato: fra, sluttDato: til, fokus: s.fokus.trim() || undefined,
    ukevolumMin: vmin, ukevolumMax: vmax, budsjett: Object.keys(budsjett).length > 0 ? budsjett : null,
  });
  if (!parsed.success) return { ok: false, feil: { generelt: "Perioden kunne ikke valideres. Sjekk feltene." } };
  return { ok: true, input: parsed.data };
}

/** Samme dato ett år senere. 29. februar blir 28. februar i år uten skuddår. */
export function ettAarSenere(iso: string): string {
  const y = Number(iso.slice(0, 4)) + 1;
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  const ms = Date.UTC(y, m - 1, d);
  return new Date(ms).getUTCMonth() === m - 1 ? msIso(ms) : msIso(Date.UTC(y, m - 1, d - 1));
}

export type Maned = { nokkel: string; y: number; m: number; t0: number; t1: number; navn: string; kort: string };

/** Månedene som dekkes av [fra, til]. */
export function manederIn(fra: string, til: string): Maned[] {
  const ut: Maned[] = [];
  const a = new Date(isoMs(fra));
  const b = new Date(isoMs(til));
  let y = a.getUTCFullYear();
  let m = a.getUTCMonth();
  while (y < b.getUTCFullYear() || (y === b.getUTCFullYear() && m <= b.getUTCMonth())) {
    ut.push({
      nokkel: `${y}-${String(m + 1).padStart(2, "0")}`, y, m, t0: Date.UTC(y, m, 1), t1: Date.UTC(y, m + 1, 1) - DAG,
      navn: `${MANEDER[m]} ${y}`, kort: MANEDER[m].slice(0, 3).toUpperCase(),
    });
    if (++m > 11) { m = 0; y++; }
  }
  return ut;
}

/** Plassering i prosent av [fra, til] (begge dager inkludert). */
export function plassering(fra: string, til: string, start: string, slutt: string): { l: number; r: number } {
  const T0 = isoMs(fra);
  const T1 = isoMs(til) + DAG;
  const span = T1 - T0;
  const pct = (t: number) => Math.max(0, Math.min(100, ((t - T0) / span) * 100));
  return { l: pct(isoMs(start)), r: pct(isoMs(slutt) + DAG) };
}

/** Hvor mange torsdager (ISO-uker) perioden dekker. */
export function antallUker(fra: string, til: string): number {
  let n = 0;
  for (let t = isoMs(fra); t <= isoMs(til); t += DAG) if (new Date(t).getUTCDay() === 4) n++;
  return Math.max(1, n);
}

/** Visningsområde for en gruppes perioder: fra første til siste dato, minst én måned. */
export function omraadeAv(perioder: readonly { startDate: string; endDate: string }[]): { fra: string; til: string } | null {
  if (perioder.length === 0) return null;
  const fra = perioder.reduce((a, p) => (p.startDate < a ? p.startDate : a), perioder[0].startDate);
  const til = perioder.reduce((a, p) => (p.endDate > a ? p.endDate : a), perioder[0].endDate);
  return { fra: fra.slice(0, 10), til: til.slice(0, 10) };
}

/** Sorter etter start, så spor. */
export function sorter<T extends { startDate: string; type: string }>(rader: readonly T[]): T[] {
  return [...rader].sort((a, b) => a.startDate.localeCompare(b.startDate) || periodeType(a.type).spor - periodeType(b.type).spor);
}

/** Etikett for en periode: «Turneringsperiode · Scoring 50–100 m» (fokus på samling og ferie utelates ikke). */
export function periodeEtikett(p: { type: string; focus: string | null }): string {
  const n = periodeType(p.type).navn;
  if (!p.focus) return n;
  return p.focus.startsWith(n) ? p.focus : `${n} · ${p.focus}`;
}
