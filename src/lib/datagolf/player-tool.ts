/** Målekontrakt for spillerverktøyet. Ingen persondata eller databasekall her. */
import { z } from "zod";
import type { TurneringsRad } from "@/lib/domain/turneringshistorikk";
import { TAK_BAND, YARD_TIL_METER, type TakBandRad } from "./tak";

const tall = z.coerce.number().finite().nullable();
export const proffSchema = z.object({
  dgId: z.coerce.number().int().positive(), name: z.string(), country: z.string().nullable(),
  asOf: z.coerce.date(), total: tall, ott: tall, app: tall, arg: tall, putt: tall,
  distance: tall, accuracy: tall,
});
export type Proff = Omit<z.infer<typeof proffSchema>, "asOf"> & { asOf: string };
export const historiskRundeSchema = z.object({
  eventId: z.string(), eventName: z.string(), date: z.coerce.date().nullable(),
  tour: z.string(), round: z.coerce.number().int(), courseId: tall,
  score: tall, toPar: tall, position: tall, madeCut: z.boolean().nullable(),
  total: tall, ott: tall, app: tall, arg: tall, putt: tall,
  distance: tall, accuracy: tall, gir: tall, importedAt: z.coerce.date(),
});
export type HistoriskRunde = Omit<z.infer<typeof historiskRundeSchema>, "date" | "importedAt"> & {
  date: string | null; importedAt: string;
};
export const SG_FELT = [
  { key: "total", label: "Totalt" }, { key: "ott", label: "Fra tee" },
  { key: "app", label: "Innspill" }, { key: "arg", label: "Nærspill" },
  { key: "putt", label: "Putting" },
] as const;
export type SgFelt = typeof SG_FELT[number]["key"];
export type Maaling = { value: number | null; count: number };

export function gjennomsnitt(values: (number | null)[]): Maaling {
  const valid = values.filter((n): n is number => n !== null && Number.isFinite(n));
  return { value: valid.length ? valid.reduce((s, n) => s + n, 0) / valid.length : null, count: valid.length };
}
export function lesValg(sp: Record<string, string | string[] | undefined>) {
  const id = (s: unknown) => typeof s === "string" && /^[1-9]\d{0,8}$/.test(s) ? Number(s) : null;
  return { pro: id(sp.pro), mot: id(sp.mot), runder: sp.runder === "12" ? 12 : sp.runder === "50" ? 50 : 24 };
}
export function rundeOppsummering(runder: HistoriskRunde[]) {
  return {
    count: runder.length,
    score: gjennomsnitt(runder.map(r => r.score)),
    distance: gjennomsnitt(runder.map(r => r.distance === null ? null : r.distance * YARD_TIL_METER)),
    accuracy: gjennomsnitt(runder.map(r => r.accuracy === null || r.accuracy < 0 || r.accuracy > 1 ? null : r.accuracy * 100)),
    gir: gjennomsnitt(runder.map(r => r.gir === null || r.gir < 0 || r.gir > 1 ? null : r.gir * 100)),
    sg: SG_FELT.map(f => ({ ...f, ...gjennomsnitt(runder.map(r => r[f.key])) })),
  };
}
export type EgneRunde = {
  playedAt: Date; score: number;
  holeScores: { holeNumber: number; par: number; strokes: number; fairway: boolean | null; gir: boolean | null }[];
};
/** Kun dokumenterte 18-hullsrunder. Hull mangler er ikke en bom. */
export function egneRundeTall(runder: EgneRunde[]) {
  const full = runder.filter(r => r.holeScores.length === 18 &&
    new Set(r.holeScores.map(h => h.holeNumber)).size === 18 &&
    r.holeScores.every(h => h.holeNumber >= 1 && h.holeNumber <= 18 && h.strokes > 0) &&
    r.holeScores.reduce((s, h) => s + h.strokes, 0) === r.score);
  const boolSnitt = (rows: (boolean | null)[]) => rows.some(v => v === null) ? null
    : gjennomsnitt(rows.map(v => v ? 100 : 0)).value;
  return {
    count: full.length,
    score: gjennomsnitt(full.map(r => r.score)),
    accuracy: gjennomsnitt(full.map(r => boolSnitt(r.holeScores.filter(h => h.par > 3).map(h => h.fairway)))),
    gir: gjennomsnitt(full.map(r => boolSnitt(r.holeScores.map(h => h.gir)))),
    from: full.at(-1)?.playedAt.toISOString() ?? null, to: full[0]?.playedAt.toISOString() ?? null,
  };
}

/** GolfBox gir rundescore; manglende fairway/GIR fylles ikke med anslag. */
export function importerteRundeTall(starter: TurneringsRad[], limit: number) {
  const rounds = starter.toSorted((a, b) => b.startDato.getTime() - a.startDato.getTime()).flatMap(t =>
    (t.runder ?? []).toSorted((a, b) => b.nummer - a.nummer).flatMap(r =>
      r.hull === 18 && r.fullfort === true && r.brutto != null ? [{ score: r.brutto, date: t.startDato }] : [])).slice(0, limit);
  return { count: rounds.length, score: gjennomsnitt(rounds.map(r => r.score)),
    accuracy: { value: null, count: 0 }, gir: { value: null, count: 0 },
    from: rounds.at(-1)?.date.toISOString() ?? null, to: rounds[0]?.date.toISOString() ?? null };
}
/** Prediksjoner må ha samme kildeuttak før en differanse er meningsfull. */
export function skillDifferanse(a: Proff, b: Proff | null, key: SgFelt): number | null {
  if (!b || a.asOf !== b.asOf || a[key] === null || b[key] === null) return null;
  return a[key] - b[key];
}
/** Rå SG er bare direkte sammenlignbar i samme felt, runde og bane. */
export function fellesRunder(a: HistoriskRunde[], b: HistoriskRunde[]): Maaling {
  const key = (r: HistoriskRunde) => `${r.eventId}:${r.round}:${r.courseId}`;
  const index = new Map(b.filter(r => r.courseId !== null).map(r => [key(r), r]));
  return gjennomsnitt(a.map(r => {
    const other = r.courseId === null ? null : index.get(key(r));
    return r.total === null || other?.total == null ? null : r.total - other.total;
  }));
}
export function turneringer(runder: HistoriskRunde[]) {
  const grupper = new Map<string, HistoriskRunde[]>();
  for (const r of runder) grupper.set(r.eventId, [...(grupper.get(r.eventId) ?? []), r]);
  return [...grupper.values()].map(rows => {
    const sorted = rows.toSorted((a, b) => a.round - b.round);
    const r = sorted[0];
    return {
      id: r.eventId, name: r.eventName, date: r.date, tour: r.tour,
      position: rows.find(x => x.position !== null)?.position ?? null,
      madeCut: rows.find(x => x.madeCut !== null)?.madeCut ?? null,
      rounds: sorted,
      // Vis runde-score. Ikke gjett total eller sluttstatus fra et avkortet vindu.
    };
  });
}
export function bandEtikett(band: Pick<TakBandRad, "band" | "lie">): string {
  const def = TAK_BAND.find(b => b.kode === band.band && b.lie === band.lie);
  if (!def) return "Ukjent avstand";
  const m = (y: number) => (y * YARD_TIL_METER).toLocaleString("nb-NO", { maximumFractionDigits: 1 });
  const range = def.proximityKey.startsWith("over_") ? `Over ${m(def.minYards)} m`
    : def.minYards === 0 ? `Under ${m(def.maxYards)} m` : `${m(def.minYards)}–${m(def.maxYards)} m`;
  return `${range} · ${band.lie}`;
}
export function visTall(value: number | null, decimals = 1, sign = false): string {
  return value === null || !Number.isFinite(value) ? "—" : value.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals, signDisplay: sign ? "exceptZero" : "auto",
  });
}
