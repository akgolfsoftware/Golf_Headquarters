/**
 * Lokal zod-parser for TestDefinition.protocol (JSON) — brukes av
 * tester-oversikt og test-detalj. JSON leses ALDRI rått (CLAUDE.md-krav):
 * alt går gjennom safeParse, ugyldig/manglende protocol gir null.
 *
 * MIDLERTIDIG: en parallell modul `src/lib/portal-tester/protocol.ts`
 * (parseProtocol → ScorekortSpec) er under arbeid for gjennomfør-flyten.
 * Når den lander, migreres disse sidene dit og denne filen slettes.
 *
 * Shapen matcher scripts/seed-test-definitions.ts (Team Norway / NGF).
 */

import { z } from "zod";

const SlagSchema = z.object({
  nr: z.number(),
  label: z.string(),
  target: z.number().optional(),
  category: z.string().optional(),
});

const FeltSchema = z.object({
  key: z.string(),
  label: z.string(),
  unit: z.string(),
});

const ProtokollSchema = z.object({
  totalShots: z.number(),
  shots: z.array(SlagSchema),
  inputFields: z.array(FeltSchema),
  scoring: z.string(),
  scoringDescription: z.string(),
});

export type Protokoll = z.infer<typeof ProtokollSchema>;

export function parseProtokoll(json: unknown): Protokoll | null {
  if (json == null) return null;
  const parsed = ProtokollSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

export type ProtokollSteg = {
  label: string;
  antall: number;
  target: number | null;
  category: string | null;
};

/** Grupperer slag på label (første forekomst-rekkefølge) → steg-liste. */
export function protokollSteg(p: Protokoll): ProtokollSteg[] {
  const steg = new Map<string, ProtokollSteg>();
  for (const s of p.shots) {
    const eksisterende = steg.get(s.label);
    if (eksisterende) {
      eksisterende.antall += 1;
    } else {
      steg.set(s.label, {
        label: s.label,
        antall: 1,
        target: s.target ?? null,
        category: s.category ?? null,
      });
    }
  }
  return [...steg.values()];
}

/** Enhet for score — første input-felts enhet. "ja/nei" er ikke en enhet. */
export function protokollEnhet(p: Protokoll | null): string | null {
  const unit = p?.inputFields[0]?.unit;
  if (!unit || unit === "ja/nei") return null;
  return unit;
}

/** Lavere score = bedre (tid- og PEI-baserte protokoller). */
export function lavereErBedre(p: Protokoll): boolean {
  return p.scoring === "time_seconds" || p.scoring === "pei_average";
}
