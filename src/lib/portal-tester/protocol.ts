/**
 * Protokoll-parser for test-gjennomføring (scorekort).
 *
 * TestDefinition.protocol (Json) finnes i TO varianter i databasen:
 *   A) NGF-batteri (prisma/scripts/seed-ngf-test-protocols.ts):
 *      { unit?, steps: [{ id, label, shots, target?, inputFields: [{ key, label, type?, unit? }] }] }
 *   B) Team Norway (scripts/seed-test-definitions.ts):
 *      { shots: [{ nr, label, target?, category? }], inputFields?: [{ key, label, unit? }] }
 *   …og null på eldre tester.
 *
 * Begge valideres tolerant med zod safeParse (aldri `as unknown as`, jf. CLAUDE.md)
 * og normaliseres til ÉN ScorekortSpec som scorekort-klienten rendrer.
 * Ukjent/ugyldig protocol → null; kallere bruker fallbackScorekortSpec().
 *
 * Normaliserings-valg (verifisert mot alle 36 protokoller i DB):
 *  - `select`-felter (kvalitative valg, f.eks. launch Lav/Medium/Høy) utelates —
 *    de kan ikke representeres i scorekortets felt-typer og inngår ikke i score.
 *  - Felter uten egen enhet arver protokollens enhet KUN når den er «poeng»
 *    (TN-gate-tester) — slik at sum-beregningen blir riktig. Andre enheter
 *    (PEI, mph, %) arves ikke, de beskriver totalscoren og ikke feltet.
 */

import { z } from "zod";

export type ScorekortFeltType = "checkbox" | "number" | "meter" | "poeng";

export type ScorekortFelt = {
  key: string;
  type: ScorekortFeltType;
  label: string;
  /** Visningsenhet for tallfelt (m, kg, cm, sek …) — alltid fra protokollen, aldri hardkodet. */
  unit?: string;
};

export type ScorekortForsok = {
  nr: number;
  label: string;
  /** Målverdi fra protokollen (tekst). Foreslått fra IUP — ikke låst fasit. */
  target?: string;
  felter: ScorekortFelt[];
};

export type ScorekortSpec = {
  /** Enhet for totalscoren (fra protokollen). */
  unit?: string;
  forsok: ScorekortForsok[];
};

/* ── Variant A — NGF-batteri (steps med inputFields per steg) ───────────── */

const FeltASchema = z.looseObject({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.string().optional(),
  unit: z.string().optional(),
});

const StegASchema = z.looseObject({
  id: z.string().min(1),
  label: z.string().min(1),
  shots: z.number().int().min(1).max(60),
  target: z.string().optional(),
  inputFields: z.array(FeltASchema).min(1),
});

const ProtokollASchema = z.looseObject({
  unit: z.string().optional(),
  steps: z.array(StegASchema).min(1),
});

/* ── Variant B — Team Norway (flat shots-liste + felles inputFields) ────── */

const SlagBSchema = z.looseObject({
  nr: z.number().int(),
  label: z.string().min(1),
  target: z.number().optional(),
  category: z.string().optional(),
});

const FeltBSchema = z.looseObject({
  key: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
});

const ProtokollBSchema = z.looseObject({
  shots: z.array(SlagBSchema).min(1),
  inputFields: z.array(FeltBSchema).optional(),
});

/* ── Normalisering ──────────────────────────────────────────────────────── */

/**
 * Felt-type fra protokollens type/enhet:
 * checkbox eller «ja/nei» → checkbox · distance/«m» → meter · «poeng» → poeng · ellers number.
 */
function feltType(type: string | undefined, unit: string | undefined): ScorekortFeltType {
  if (type === "checkbox" || unit === "ja/nei") return "checkbox";
  if (type === "distance" || unit === "m") return "meter";
  if (unit === "poeng") return "poeng";
  return "number";
}

function tilFelt(
  raw: { key: string; label: string; type?: string; unit?: string },
  arvetEnhet?: string,
): ScorekortFelt {
  const unit = raw.unit ?? arvetEnhet;
  const type = feltType(raw.type, unit);
  const felt: ScorekortFelt = { key: raw.key, type, label: raw.label };
  if (unit && unit !== "ja/nei") felt.unit = unit;
  return felt;
}

const FALLBACK_FELT: ScorekortFelt = { key: "score", type: "number", label: "Score" };

/** Eldre tester uten protocol: ett forsøk med ett tallfelt «Score». */
export function fallbackScorekortSpec(): ScorekortSpec {
  return {
    forsok: [{ nr: 1, label: "Resultat", felter: [{ ...FALLBACK_FELT }] }],
  };
}

/**
 * Tolker protocol-JSON fra TestDefinition og normaliserer til ScorekortSpec.
 * Returnerer null når protocol mangler eller ikke matcher noen kjent variant.
 */
export function parseProtocol(json: unknown): ScorekortSpec | null {
  if (json == null) return null;

  const a = ProtokollASchema.safeParse(json);
  if (a.success) {
    // Felter uten egen enhet arver kun «poeng» fra protokollen (se filhode).
    const arvetEnhet = a.data.unit === "poeng" ? "poeng" : undefined;
    const forsok: ScorekortForsok[] = [];
    for (const steg of a.data.steps) {
      const felter = steg.inputFields
        .filter((f) => f.type !== "select")
        .map((f) => tilFelt(f, f.unit === undefined ? arvetEnhet : undefined));
      const stegFelter = felter.length > 0 ? felter : [{ ...FALLBACK_FELT }];
      for (let i = 0; i < steg.shots; i++) {
        const rad: ScorekortForsok = {
          nr: forsok.length + 1,
          label: steg.label,
          felter: stegFelter,
        };
        if (steg.target) rad.target = steg.target;
        forsok.push(rad);
      }
    }
    if (forsok.length === 0) return null;
    const spec: ScorekortSpec = { forsok };
    if (a.data.unit) spec.unit = a.data.unit;
    return spec;
  }

  const b = ProtokollBSchema.safeParse(json);
  if (b.success) {
    const harFelter = b.data.inputFields !== undefined && b.data.inputFields.length > 0;
    const felter = harFelter
      ? (b.data.inputFields ?? []).map((f) => tilFelt(f))
      : [{ ...FALLBACK_FELT }];
    const forsok = [...b.data.shots]
      .sort((x, y) => x.nr - y.nr)
      .map((slag, i) => {
        const rad: ScorekortForsok = { nr: i + 1, label: slag.label, felter };
        if (slag.target !== undefined) rad.target = String(slag.target);
        return rad;
      });
    const spec: ScorekortSpec = { forsok };
    const unit = felter[0]?.unit;
    if (unit) spec.unit = unit;
    return spec;
  }

  return null;
}
