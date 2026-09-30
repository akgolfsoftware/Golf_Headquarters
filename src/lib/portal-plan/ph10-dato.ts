/**
 * PH-10 Plan — rene datofunksjoner og lag-regler. Ingen Date-avhengighet av
 * tidssone: alle datoer er «YYYY-MM-DD» og regnes i UTC-midnatt, jf. gotchas
 * §Tid og datoer (aldri `new Date(y, m-1, d)`).
 */
import type { PlanAkse, PlanHeldag, PlanOkt, PlanOpptatt, PlanPeriode, PlanZoom } from "./ph10-typer";

const DAG_MS = 86_400_000;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const erIso = (s: string | undefined | null): s is string => {
  if (!s || !ISO_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};
export const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const tilMs = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
export const plussDager = (s: string, n: number) => iso(tilMs(s) + n * DAG_MS);
/** 0 = mandag. */
export const ukedag = (s: string) => (new Date(tilMs(s)).getUTCDay() + 6) % 7;
export const mandagAv = (s: string) => plussDager(s, -ukedag(s));
export const ukeDatoer = (mandag: string) => Array.from({ length: 7 }, (_, i) => plussDager(mandag, i));
export const dagnummer = (s: string) => Number(s.slice(8, 10));
export const maanedIndeks = (s: string) => Number(s.slice(5, 7)) - 1;
export const aarAv = (s: string) => Number(s.slice(0, 4));
/** «28.09». */
export const ddmm = (s: string) => `${s.slice(8, 10)}.${s.slice(5, 7)}`;
export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const tilMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

/** ISO-ukenummer (uke 1 har årets første torsdag). */
export function isoUke(s: string): number {
  const t = tilMs(s);
  const torsdag = t + (3 - ukedag(s)) * DAG_MS;
  const aar = new Date(torsdag).getUTCFullYear();
  return Math.floor((torsdag - Date.UTC(aar, 0, 1)) / DAG_MS / 7) + 1;
}

/** Ukene månedsrutenettet viser: hele uker, mandag først, bare uker som berører måneden. */
export function maanedsUker(aar: number, maaned0: number): string[] {
  const forste = iso(Date.UTC(aar, maaned0, 1));
  const siste = iso(Date.UTC(aar, maaned0 + 1, 0));
  const ut: string[] = [];
  for (let m = mandagAv(forste); m <= siste; m = plussDager(m, 7)) ut.push(m);
  return ut;
}

/** Datoene en side viser, som laster og visning er enige om. */
export function synligeUker(zoom: PlanZoom, dato: string): string[] {
  if (zoom === "maaned") return maanedsUker(aarAv(dato), maanedIndeks(dato));
  if (zoom === "aar") return [];
  return [mandagAv(dato)];
}

export function flytt(zoom: PlanZoom, dato: string, n: number): string {
  if (zoom === "dag") return plussDager(dato, n);
  if (zoom === "uke") return plussDager(dato, 7 * n);
  if (zoom === "maaned") {
    const m = maanedIndeks(dato) + n;
    return iso(Date.UTC(aarAv(dato), m, 1));
  }
  return iso(Date.UTC(aarAv(dato) + n, 0, 1));
}

/* ---------- Lag ---------- */

export type PlanLag = { fys: boolean; turn: boolean; samling: boolean; opptatt: boolean };
export const ALLE_LAG: PlanLag = { fys: true, turn: true, samling: true, opptatt: true };

export function filtrerOkter(okter: readonly PlanOkt[], lag: PlanLag): PlanOkt[] {
  return okter.filter((o) => (o.akse === "fys" ? lag.fys : o.akse === "turn" ? lag.turn : true));
}
export function filtrerHeldag(heldag: readonly PlanHeldag[], lag: PlanLag): PlanHeldag[] {
  return heldag.filter((h) => (h.art === "turnering" ? lag.turn : h.art === "samling" ? lag.samling : lag.opptatt));
}
export const filtrerOpptatt = (opptatt: readonly PlanOpptatt[], lag: PlanLag): PlanOpptatt[] => (lag.opptatt ? [...opptatt] : []);

/** Opptatt tid som overlapper en planlagt økt. */
export function krasjMed(okt: Pick<PlanOkt, "dato" | "tid" | "min" | "status">, opptatt: readonly PlanOpptatt[]): PlanOpptatt | null {
  if (okt.status !== "Planlagt") return null;
  const a = tilMin(okt.tid), b = a + okt.min;
  return opptatt.find((o) => o.dato === okt.dato && a < tilMin(o.tid) + o.min && b > tilMin(o.tid)) ?? null;
}

/** Aksene som er planlagt en dag, i pyramiderekkefølge. */
const AKSE_REKKE: readonly PlanAkse[] = ["fys", "tek", "slag", "spill", "turn"];
export function aksererDag(okter: readonly PlanOkt[], dato: string): PlanAkse[] {
  const set = new Set(okter.filter((o) => o.dato === dato).map((o) => o.akse));
  return AKSE_REKKE.filter((a) => set.has(a));
}

export function heldagPaaDag(heldag: readonly PlanHeldag[], dato: string): PlanHeldag[] {
  return heldag.filter((h) => dato >= h.fra && dato <= h.til);
}

export function timerTekst(min: number): string {
  const t = Math.round((min / 60) * 10) / 10;
  return `${String(t).replace(".", ",")} t`;
}

/* ---------- Opptatt tid: egne avtaler ---------- */

export type AvtaleRad = { id: string; title: string; startAt: Date; endAt: Date; kind: string; recurring: string };
const OSLO_YMD = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });
const OSLO_HM = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const osloMin = (d: Date) => { const [h, m] = OSLO_HM.format(d).split(":").map(Number); return h * 60 + m; };

const AVTALE_ART: Record<string, PlanOpptatt["art"]> = { SKOLE: "skole", JOBB: "jobb", REISE: "reise", AVTALE: "annet", ANNET: "annet" };

/**
 * Egne avtaler som blokker per dag i [fra, til]. Ukentlige avtaler gjentas på
 * samme ukedag og klokkeslett. En avtale over midnatt klippes til hver dag.
 */
export function utvidAvtaler(rader: readonly AvtaleRad[], fra: string, til: string): PlanOpptatt[] {
  const ut: PlanOpptatt[] = [];
  for (const r of rader) {
    const art = AVTALE_ART[r.kind] ?? "annet";
    const startDag = OSLO_YMD.format(r.startAt);
    const sluttDag = OSLO_YMD.format(r.endAt);
    const s = osloMin(r.startAt), e = osloMin(r.endAt);
    const legg = (dato: string, fraMin: number, tilMinutt: number) => {
      if (dato < fra || dato > til || tilMinutt <= fraMin) return;
      ut.push({ id: `${r.id}:${dato}`, dato, tid: hhmm(fraMin), min: tilMinutt - fraMin, art, tittel: r.title });
    };
    if (r.recurring === "WEEKLY") {
      const varighet = Math.max(0, Math.round((r.endAt.getTime() - r.startAt.getTime()) / 60_000));
      for (let d = startDag; d <= til; d = plussDager(d, 7)) if (d >= fra) legg(d, s, Math.min(1440, s + varighet));
    } else if (startDag === sluttDag) {
      legg(startDag, s, e);
    } else {
      for (let d = startDag; d <= sluttDag; d = plussDager(d, 1)) legg(d, d === startDag ? s : 0, d === sluttDag ? e : 1440);
    }
  }
  return ut.sort((a, b) => a.dato.localeCompare(b.dato) || a.tid.localeCompare(b.tid));
}

/* ---------- Periodene i året ---------- */

export function periodeForUke(perioder: readonly PlanPeriode[], uke: number): PlanPeriode | null {
  return perioder.find((p) => uke >= p.fraUke && uke <= p.tilUke) ?? null;
}
