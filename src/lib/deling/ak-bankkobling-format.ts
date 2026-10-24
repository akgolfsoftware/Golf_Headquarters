import { createHash } from "node:crypto";
import { z } from "zod";
import { Belastning, DrillFasilitet, DrillPracticeType, Motorikk, NgfKategori, Omraade, Press,
  PyramidArea, SessionEnvironment } from "@/generated/prisma/client";
import approvedSchema from "@/lib/masterbrain/schemas/approved-training-item.schema.json";
import { canonicalJson } from "@/lib/agents/canonical-json";

// Reuse the source bank's approval contract. The projection below supplies
// TypeScript types only; it must never weaken the full source validation.
// Zod handles JSON Schema type arrays at runtime, although its JSONSchema
// TypeScript definition only lists a scalar type. Keep the static schema generic.
const kildeSkjema: Record<string, unknown> = approvedSchema;
const godkjent = z.fromJSONSchema(kildeSkjema);
const projeksjon = z.object({
  id: z.string(), type: z.enum(["DRILL", "OVELSE", "TEST"]), navn: z.string(), beskrivelse: z.string(), kilde: z.string(),
  minKategori: z.enum(NgfKategori), maxKategori: z.enum(NgfKategori),
  environment: z.array(z.enum(SessionEnvironment)), fasilitetKrav: z.array(z.enum(DrillFasilitet)),
  treningstype: z.enum(DrillPracticeType),
  akFormel: z.object({ pyramidArea: z.enum(PyramidArea), omraade: z.enum(Omraade),
    motorikk: z.enum(Motorikk).optional(), belastning: z.enum(Belastning), press: z.enum(Press) }),
});

/** A reproducible copy specification, NOT a DB mutation or approval of a new
 * drill. Only the trusted current bank may authorize this copy in the reader.
 * Preserves all source axes/facility requirements, including ones without a
 * dedicated ExerciseDefinition column. No inferred phase, dosage or equipment.
 */
export function byggAkBankkopi(raw: unknown) {
  const json = z.json().parse(raw);
  godkjent.parse(json);
  const item = projeksjon.parse(json);
  if (item.type === "TEST") throw Error("test-er-ikke-planovelse");
  const objekt = z.record(z.string(), z.json()).parse(json);
  const bankFingeravtrykk = createHash("sha256").update(canonicalJson({ versjon: 1, item: json })).digest("hex");
  // Source bank bounds are unordered (existing test-anbefaling contract).
  // Database bounds are best -> weakest. Normalize only at this explicit edge;
  // never repair an arbitrary existing database row's category range.
  const kategorier = Object.values(NgfKategori);
  const ender = [item.minKategori, item.maxKategori].sort((a, b) => kategorier.indexOf(a) - kategorier.indexOf(b));
  return { bankId: item.id, bankFingeravtrykk, data: {
    source: "SYSTEM" as const, visibility: "PLATFORM" as const, createdBy: null,
    name: item.navn, description: item.beskrivelse, kilde: item.kilde, pyramidArea: item.akFormel.pyramidArea,
    minKategori: ender[0], maxKategori: ender[1], environment: item.environment, fasilitetKrav: item.fasilitetKrav,
    treningstype: item.treningstype, omraadeKode: item.akFormel.omraade,
    motorikk: item.akFormel.motorikk ?? null, belastning: item.akFormel.belastning, press: item.akFormel.press,
    parametersJson: { akGodkjentbank: { versjon: 1, bankId: item.id, bankFingeravtrykk },
      akFormel: objekt.akFormel, facilityRequirements: objekt.facilityRequirements, godkjentInnhold: json },
    // Local annotations or prescription overrides are not an identical bank copy.
    coachNotes: null, videoUrl: null, imageUrl: null, lPhase: null, lPhases: [],
    defaultRepsSets: null, csMin: null, csMax: null, durationMin: null, higherIsBetter: null,
    skillArea: null, minHcp: null, maxHcp: null, utstyr: [], intensitet: null, morad: false,
    prerequisites: [], tags: [], defaultSets: null, defaultReps: null, csTargetByKategori: null,
    defaultRepsUtenBall: null, defaultRepsLavFart: null, defaultRepsAuto: null, muscleGroups: [],
  } };
}
export type AkBankkopi = ReturnType<typeof byggAkBankkopi>;

/** Duplicate IDs are ambiguous even when the two items currently look alike. */
export function byggAkBankkatalog(raw: readonly unknown[]): AkBankkopi[] {
  const katalog = raw.map(byggAkBankkopi);
  if (new Set(katalog.map(k => k.bankId)).size !== katalog.length) throw Error("tvetydig-godkjentbank");
  return katalog;
}
