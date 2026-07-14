// Zod-schemaer for JSON-blobs som lagres i Prisma sine Json-felter.
// Vi har historisk brukt `as unknown as <Type>` for å typecaste disse
// dataene, men det er trygt kun for ikke-kritiske felt. For forretnings-
// kritiske data (planer, coaching-meldinger, payments) skal vi i stedet
// kjøre zod-validering ved read, slik at vi feiler høyt og tidlig hvis
// formatet har drifta.

import { z } from "zod";
import { PyramidAreaSchema } from "@/lib/portal/training/ak-taxonomy";

export { PyramidAreaSchema };

// ----- PlanTemplate.payload -----

export const AllokeringSchema = z.object({
  FYS: z.number(),
  TEK: z.number(),
  SLAG: z.number(),
  SPILL: z.number(),
  TURN: z.number(),
});

export const UkeSkjemaSchema = z.object({
  okterPerUke: z.number(),
  varighetMin: z.number(),
});

export const PlanTemplateDrillSchema = z.object({
  exerciseId: z.string(),
  repsSets: z.string().nullable(),
  csTarget: z.number().nullable(),
  notes: z.string().nullable(),
  orderIndex: z.number(),
});

export const PlanTemplateSessionSchema = z.object({
  week: z.number(),
  day: z.number(),
  title: z.string(),
  pyramidArea: PyramidAreaSchema,
  durationMin: z.number(),
  rationale: z.string().nullable(),
  drills: z.array(PlanTemplateDrillSchema),
});

export const PlanTemplatePayloadSchema = z.object({
  weeks: z.number(),
  allokering: AllokeringSchema,
  ukeSkjema: UkeSkjemaSchema,
  sessions: z.array(PlanTemplateSessionSchema),
});

export type PlanTemplatePayloadParsed = z.infer<
  typeof PlanTemplatePayloadSchema
>;

// ----- CoachingSession.messages -----

export const ChatMeldingSchema = z.object({
  role: z.enum(["user", "assistant", "coach"]),
  content: z.string(),
  ts: z.string(),
});

export const MessageArraySchema = z.array(ChatMeldingSchema);

export type ChatMeldingParsed = z.infer<typeof ChatMeldingSchema>;
