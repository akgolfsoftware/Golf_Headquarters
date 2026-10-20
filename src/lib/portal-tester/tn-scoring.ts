import { z } from "zod";
import { forventedePutter, gronnePutter, sgFraLengde } from "@/lib/domain/pei/broadie-sg-tabeller";
import { poeng8Ball, poeng8BallExcelV3 } from "@/lib/domain/pei/poeng-tabeller";
import { GATE_POENG_IDS, GATE_POENG_VALG, TN_GODKJENT_VERSION, TN_POENG_VERSION, TN_VERSIONS, tnVersion, type TnVersion, type TnProtocol, type TnRow } from "./tn-catalog";
import { formaterTestMetrikk } from "./format-verdi";

export const TnValuesSchema = z.record(z.string().regex(/^[1-9]\d*$/), z.record(z.string().max(60), z.union([z.number().finite(), z.string().max(80), z.null()])));
export type TnValues = z.infer<typeof TnValuesSchema>;
export type TnMetric = { label: string; value: number; unit: string; lowerIsBetter: boolean };
export type TnResult = { version: TnVersion; protocolId: string; source: string; count: number; score: number; unit: string; metrics: TnMetric[]; values: TnValues };
export const TnResultSchema = z.object({
  version: z.enum(TN_VERSIONS), protocolId: z.string(), source: z.string(), count: z.number().int().positive(),
  score: z.number().finite(), unit: z.string(),
  metrics: z.array(z.object({ label: z.string(), value: z.number().finite(), unit: z.string(), lowerIsBetter: z.boolean() })),
  values: TnValuesSchema,
});
function present(v: unknown) { return v !== null && v !== undefined && v !== ""; }
/** «Ja»/«Nei» før 14.10.2026, «Godkjent»/«Bom» etter. Valgene er låst per versjon i katalogen. */
const godkjent = (v: unknown) => v === "Ja" || v === "Godkjent";
const bom = (v: unknown) => v === "Nei" || v === "Bom";

export function tnRowError(row: TnRow, values: TnValues[string], complete: boolean): string | null {
  const allowed = new Set(row.fields.map(f => f.key));
  if (Object.keys(values).some(k => !allowed.has(k))) return "Ukjent felt i forsøket.";
  for (const f of row.fields) {
    const v = values[f.key];
    if (!present(v)) {
      if (complete && !f.optional && !(f.requiredUnless && present(values[f.requiredUnless]))) return `Fyll ut ${f.label.toLowerCase()}.`;
      continue;
    }
    if (f.choices) {
      if (typeof v !== "string" || !f.choices.includes(v)) return `Velg en gyldig verdi for ${f.label.toLowerCase()}.`;
    } else if (typeof v !== "number" || !Number.isFinite(v) || (f.min !== undefined && v < f.min) || (f.integer && !Number.isInteger(v))) {
      return `Ugyldig verdi for ${f.label.toLowerCase()}.`;
    }
  }
  if (complete && present(values.speed) && (!present(values.speedUnit) || !present(values.speedType))) return "Oppgi enhet og hva hastigheten måler.";
  if (complete && !present(values.speed) && (present(values.speedUnit) || present(values.speedType))) return "Oppgi den målte hastigheten, eller tøm hastighetsfeltene.";
  if (present(values.holed) && (present(values.carry) || present(values.side))) return "Fjern carry og side når ballen gikk i hull.";
  if (complete && bom(values.ok) && allowed.has("miss") && !present(values.miss)) return "Oppgi bomretning.";
  if (complete && allowed.has("speedZone") && godkjent(values.ok) && present(values.miss)) return "Fjern bomretning når ballen gikk rent gjennom gaten.";
  if (complete && allowed.has("longShort")) {
    if (values.distance === 0 && values.longShort !== "På mål") return "Velg på mål når restavstanden er null.";
    if (typeof values.distance === "number" && values.distance > 0 && values.longShort === "På mål") return "Velg kort eller lang når restavstanden er større enn null.";
  }
  return null;
}
export function tnValidate(p: TnProtocol, values: TnValues, complete: boolean): string | null {
  const parsed = TnValuesSchema.safeParse(values);
  if (!parsed.success) return "Ugyldige registreringer.";
  if (Object.keys(values).some(k => Number(k) > p.rows.length)) return "Forsøksnummeret finnes ikke i protokollen.";
  for (let i = 0; i < p.rows.length; i++) {
    const error = tnRowError(p.rows[i], values[String(i + 1)] ?? {}, complete);
    if (error) return `Forsøk ${i + 1}: ${error}`;
  }
  if (complete && p.blocked) return p.blocked;
  if (complete && p.id === "standard-sving" && new Set(Object.values(values).map(v => v.target)).size !== 1) return "Standard sving bruker samme medianlengde med 7-jern som mål for alle ti forsøk.";
  return null;
}
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Meter fra hullet for ett ferdig registrert forsøk: 0 i hull, ellers fra
 * carry og side (Pythagoras mot målet) eller tastet «til hull». null når
 * forsøket ikke er ferdig eller testen ikke måler avstand.
 */
export function tnRowDistance(p: TnProtocol, i: number, row: TnValues[string] | undefined): number | null {
  const r = p.rows[i];
  if (!r || !row || !["near", "carry", "course", "free-course", "technique"].includes(p.kind) || tnRowError(r, row, true)) return null;
  if (present(row.holed)) return 0;
  const target = r.target ?? row.target;
  if (r.fields.some(f => f.key === "carry")) {
    return typeof target === "number" && typeof row.carry === "number" && typeof row.side === "number"
      ? Math.hypot(target - row.carry, row.side) : null;
  }
  return typeof row.result === "number" ? row.result : null;
}

/** Poeng for ett 8-ball-slag etter regelversjonen testen ble ført med. */
function points8Ball(p: TnProtocol, distance: number, holed: boolean): number {
  return (tnVersion(p) === TN_GODKJENT_VERSION ? poeng8Ball(distance, holed) : poeng8BallExcelV3(distance))!;
}

/** Avstand, PEI og eventuelle 8-ball-poeng rett etter hvert slag. */
export function tnRowPreview(p: TnProtocol, i: number, row: TnValues[string] | undefined): { distance: number; pei: number; points?: number } | null {
  const distance = tnRowDistance(p, i, row);
  const target = p.rows[i]?.target ?? row?.target;
  if (distance === null || typeof target !== "number" || target <= 0) return null;
  return { distance, pei: distance / target, ...(p.points8Ball ? { points: points8Ball(p, distance, present(row?.holed)) } : {}) };
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** No fallback, coercion, partial completion, or substitution of metres for PEI. */
export function tnScore(p: TnProtocol, values: TnValues): TnResult {
  const error = tnValidate(p, values, true);
  if (error) throw new Error(error);
  const metrics: TnMetric[] = [];
  const metric = (label: string, value: number, unit: string, lowerIsBetter: boolean) => {
    if (!Number.isFinite(value)) throw new Error("Resultatet kunne ikke beregnes.");
    metrics.push({ label, value, unit, lowerIsBetter });
  };
  const get = (i: number, key: string): number => {
    const v = values[String(i + 1)]?.[key];
    if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`Forsøk ${i + 1}: mangler ${key}.`);
    return v;
  };
  if (p.kind === "points") {
    metric("Totalt antall poeng", sum(p.rows.map((_, i) => get(i, "points"))), "poeng", false);
  } else if (p.kind === "gate" && tnVersion(p) === TN_POENG_VERSION && (GATE_POENG_IDS as readonly string[]).includes(p.id)) {
    // 1 poeng gjennom porten, 4 også i sonen, maks 4 per slag (Anders 20.10.2026).
    const poeng = p.rows.map((_, i) => GATE_POENG_VALG[values[String(i + 1)].ok as keyof typeof GATE_POENG_VALG]);
    const maks = 4 * p.rows.length;
    metric("Poeng", sum(poeng), `/ ${maks} p`, false);
    metric("Gjennom porten", poeng.filter(x => x > 0).length, `/ ${p.rows.length}`, false);
    metric("I sonen", poeng.filter(x => x === 4).length, `/ ${p.rows.length}`, false);
  } else if (p.kind === "gate") {
    const hits = p.rows.filter((_, i) => {
      const row = values[String(i + 1)];
      return godkjent(row.ok) && (p.id !== "putt-gate" || row.speedZone === "Ja");
    }).length;
    if (tnVersion(p) === TN_POENG_VERSION) {
      // «X / 6 OK» og «X / 10 OK» (Anders 20.10.2026).
      metric("OK", hits, `/ ${p.rows.length} OK`, false);
      metric("Andel OK", 100 * hits / p.rows.length, "%", false);
    } else if (tnVersion(p) === TN_GODKJENT_VERSION) {
      // Vises som «X / 9 godkjent» (Anders 14.10.2026).
      metric("Godkjent", hits, `/ ${p.rows.length} godkjent`, false);
      metric("Andel godkjent", 100 * hits / p.rows.length, "%", false);
    } else {
      metric("Godkjente forsøk", hits, "treff", false);
      metric("Treffandel", 100 * hits / p.rows.length, "%", false);
    }
  } else if (p.kind === "speed") {
    const feet = p.rows.map((_, i) => {
      const row = values[String(i + 1)];
      return get(i, "distance") * (row.distanceUnit === "m" ? 1 / 0.3048 : row.distanceUnit === "cm" ? 1 / 30.48 : 1);
    });
    metric("Gjennomsnittlig restavstand", avg(feet), "fot", true);
  } else {
    const targets = p.rows.map((r, i) => r.target ?? get(i, "target"));
    if (targets.some(t => !Number.isFinite(t) || t <= 0)) throw new Error("Målavstanden må være større enn null.");
    if (p.kind === "putts") {
      const strokes = p.rows.map((_, i) => get(i, "strokes"));
      metric("Totalt antall slag", sum(strokes), "slag", true);
      metric("Resultat mot Excel-referansen", sum(strokes.map((s, i) => forventedePutter(targets[i])! - s)), "slag", false);
      for (const distance of [1, 1.5, 2, 2.5, 3]) {
        metric(`Gjennomsnitt fra ${String(distance).replace(".", ",")} m`, avg(strokes.filter((_, i) => targets[i] === distance)), "slag", true);
      }
    } else {
      const distances = p.rows.map((r, i) => {
        if (present(values[String(i + 1)].holed)) return 0;
        return r.fields.some(f => f.key === "carry") ? Math.hypot(targets[i] - get(i, "carry"), get(i, "side")) : get(i, "result");
      });
      const peis = distances.map((d, i) => d / targets[i]);
      metric("Gjennomsnittlig PEI", avg(peis), "PEI", true);
      metric("Gjennomsnittlig restavstand", avg(distances), "m", true);
      if (p.points8Ball) {
        const holed = (i: number) => present(values[String(i + 1)].holed);
        metric("Totalt antall poeng", sum(distances.map((d, i) => points8Ball(p, d, holed(i)))), "poeng", false);
        metric("Forventede putter · Excel", sum(distances.map((d, i) => holed(i) ? 0 : gronnePutter(d)!)), "slag", true);
        for (const category of ["Chip", "Wedge", "Lobb", "Bunker"]) {
          metric(`${category} PEI`, avg(peis.filter((_, i) => p.rows[i].label.startsWith(category))), "PEI", true);
        }
      }
      if (p.kind === "course") {
        // Workbook uses the fairway starting table and coarse green ending table regardless of entered lie.
        // Explicit Excel-reference label prevents misrepresenting this as a lie-adjusted SG model.
        metric("Resultat mot Excel-referansen · fairway/green", sum(distances.map((d, i) => sgFraLengde(targets[i], "fw")! - 1 - forventedePutter(d)!)), "slag", false);
      }
    }
  }
  const primary = p.points8Ball ? metrics.find(m => m.label === "Totalt antall poeng")! : metrics[0];
  return { version: tnVersion(p), protocolId: p.id, source: p.source, count: p.rows.length, score: primary.value, unit: primary.unit, metrics, values: structuredClone(values) };
}
export function tnFormat(metric: Pick<TnMetric, "value" | "unit">): string {
  return formaterTestMetrikk(metric.value, metric.unit);
}

/** PostgreSQL JSONB may reorder keys. Equality must depend on values, not insertion order. */
export function tnSameValues(a: TnValues, b: TnValues): boolean {
  const rows = Object.keys(a);
  return rows.length === Object.keys(b).length && rows.every(key => {
    const left = a[key];
    const right = b[key];
    if (!right) return false;
    const fields = Object.keys(left);
    return fields.length === Object.keys(right).length && fields.every(field =>
      Object.hasOwn(right, field) && left[field] === right[field]);
  });
}

/** Allow only floating-point serialization noise, never rounding to a displayed score. */
export function tnSameScore(a: number, b: number): boolean {
  return Number.isFinite(a) && Number.isFinite(b)
    && Math.abs(a - b) <= 16 * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}
