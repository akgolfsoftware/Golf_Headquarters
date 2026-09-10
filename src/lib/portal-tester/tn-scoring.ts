import { z } from "zod";
import { forventedePutter, gronnePutter, sgFraLengde } from "@/lib/domain/pei/broadie-sg-tabeller";
import { poeng8Ball } from "@/lib/domain/pei/poeng-tabeller";
import { TN_VERSION, type TnProtocol, type TnRow } from "./tn-catalog";

export const TnValuesSchema = z.record(z.string().regex(/^[1-9]\d*$/), z.record(z.string().max(60), z.union([z.number().finite(), z.string().max(80), z.null()])));
export type TnValues = z.infer<typeof TnValuesSchema>;
export type TnMetric = { label: string; value: number; unit: string; lowerIsBetter: boolean };
export type TnResult = { version: typeof TN_VERSION; protocolId: string; source: string; count: number; score: number; unit: string; metrics: TnMetric[]; values: TnValues };
export const TnResultSchema = z.object({
  version: z.literal(TN_VERSION), protocolId: z.string(), source: z.string(), count: z.number().int().positive(),
  score: z.number().finite(), unit: z.string(),
  metrics: z.array(z.object({ label: z.string(), value: z.number().finite(), unit: z.string(), lowerIsBetter: z.boolean() })),
  values: TnValuesSchema,
});
function present(v: unknown) { return v !== null && v !== undefined && v !== ""; }

export function tnRowError(row: TnRow, values: TnValues[string], complete: boolean): string | null {
  const allowed = new Set(row.fields.map(f => f.key));
  if (Object.keys(values).some(k => !allowed.has(k))) return "Ukjent felt i forsøket.";
  for (const f of row.fields) {
    const v = values[f.key];
    if (!present(v)) {
      if (complete && !f.optional) return `Fyll ut ${f.label.toLowerCase()}.`;
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
  if (complete && values.ok === "Nei" && allowed.has("miss") && !present(values.miss)) return "Oppgi bomretning.";
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
    const distances = p.rows.map((_, i) => p.kind === "carry" ? Math.hypot(targets[i] - get(i, "carry"), get(i, "side")) : get(i, "result"));
    const peis = distances.map((d, i) => d / targets[i]);
    metric("Gjennomsnittlig PEI", avg(peis), "PEI", true);
    metric("Gjennomsnittlig restavstand", avg(distances), "m", true);
    if (p.points8Ball) {
      metric("Totalt antall poeng", sum(distances.map(d => poeng8Ball(d)!)), "poeng", false);
      metric("Forventede putter · Excel", sum(distances.map(d => gronnePutter(d)!)), "slag", true);
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
  const primary = p.points8Ball ? metrics.find(m => m.label === "Totalt antall poeng")! : metrics[0];
  return { version: TN_VERSION, protocolId: p.id, source: p.source, count: p.rows.length, score: primary.value, unit: primary.unit, metrics, values };
}
export function tnFormat(metric: Pick<TnMetric, "value" | "unit">): string {
  return metric.unit === "PEI"
    ? new Intl.NumberFormat("nb-NO", { style: "percent", maximumFractionDigits: 2 }).format(metric.value)
    : `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(metric.value)} ${metric.unit}`;
}
