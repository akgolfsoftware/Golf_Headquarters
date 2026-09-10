import { parseProtocol, fallbackScorekortSpec } from "./protocol";
import { parseForScoring, scoreTest, type Forsok } from "./test-scoring";

/** Full completion only; drafts belong to TestSession and never become zero-score results. */
export function validateCompletion(protocol: unknown, rows: Forsok[], allowManual = false): string | null {
  const spec = parseProtocol(protocol) ?? (allowManual ? fallbackScorekortSpec() : null);
  if (!spec || (!allowManual && parseForScoring(protocol).kind === "fallback")) return "Testens beregningsregel mangler. Resultatet kan ikke fullføres.";
  if (rows.length !== spec.forsok.length || rows.some((r, i) => r.nr !== spec.forsok[i].nr)) return "Alle forsøk må registreres én gang i protokollens rekkefølge.";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fields = spec.forsok[i].felter;
    if (Object.keys(row.verdier).some(k => !fields.some(f => f.key === k))) return `Forsøk ${i + 1}: ukjent felt.`;
    for (const f of fields) {
      const value = row.verdier[f.key];
      if (f.optional && (value === null || value === undefined)) continue;
      if (f.key === "miss_side" && row.verdier.ok === true) continue;
      if (f.type === "select") {
        if (typeof value !== "string" || !f.options?.includes(value)) return `Forsøk ${i + 1}: velg ${f.label}.`;
      } else if (f.type === "checkbox") {
        if (typeof value !== "boolean") return `Forsøk ${i + 1}: registrer ${f.label}.`;
      } else if (typeof value !== "number" || !Number.isFinite(value) || (f.min !== undefined && value < f.min) || (f.max !== undefined && value > f.max)) return `Forsøk ${i + 1}: ugyldig ${f.label}.`;
    }
  }
  const result = scoreTest(protocol, rows);
  if (result.details.scoring.startsWith("pei") && result.details.aggregat.antallSlag !== rows.length) return "PEI krever positiv målavstand og komplette målinger for hvert forsøk.";
  const primary = parseForScoring(protocol).primaryMetric;
  if (primary && ["average", "min", "value_max"].includes(result.details.scoring) && rows.some(r => typeof r.verdier[primary] !== "number")) return "Testens hovedmåling mangler.";
  return null;
}
