// src/lib/meg/classify-schema.ts
// Zod-skjema for Claude-klassifisering av Meg-logg-meldinger.
// Brukes som tool-input-schema OG zod-validering (samme mønster som coaching-analysis.ts).
import { z } from "zod";

export const ME_KINDS = [
  "sleep", "training", "mood", "nutrition",
  "finance", "goal", "task", "note", "person",
] as const;

export const ClassificationSchema = z.object({
  kind: z.enum(ME_KINDS),
  summary: z.string().min(1),
  tags: z.array(z.string()),
  value_num: z.number().optional(),
  value_unit: z.string().optional(),
});

export type Classification = z.infer<typeof ClassificationSchema>;

/** JSON-schema for Anthropic tool-input (speiler ClassificationSchema). */
export const classificationToolSchema = {
  type: "object" as const,
  properties: {
    kind: { type: "string", enum: [...ME_KINDS] },
    summary: { type: "string", description: "Kort, tydelig sammendrag av loggen på norsk" },
    tags: { type: "array", items: { type: "string" } },
    value_num: { type: "number", description: "Tall hvis relevant, f.eks. antall timer søvn" },
    value_unit: { type: "string", description: "Enhet for value_num, f.eks. 'timer', 'min', 'kr'" },
  },
  required: ["kind", "summary", "tags"],
};
