import { z } from "zod";
import { TN_VERSION, TN_RULES_VERSION } from "./tn-catalog";
import { TnValuesSchema } from "./tn-scoring";
const MutationSchema = z.object({ id: z.string().uuid(), intent: z.enum(["draft", "abort", "complete"]), baseRevision: z.number().int().nonnegative() });
export const TnSessionSchema = z.object({
  lastMutation: MutationSchema.optional(),
  version: z.enum([TN_VERSION, TN_RULES_VERSION]), protocolId: z.string(), count: z.number().int().min(1).max(200),
  revision: z.number().int().nonnegative(), values: TnValuesSchema, notes: z.string().max(2000).default(""),
});
export const TnSaveSchema = z.object({
  mutationId: z.string().uuid().optional(),
  ownerId: z.string().min(1).max(200).optional(),
  testDayParticipantId: z.string().min(1).max(200).optional(),
  version: z.enum([TN_VERSION, TN_RULES_VERSION]).default(TN_VERSION),
  sessionId: z.string().uuid(), protocolId: z.string().max(80), count: z.number().int().min(1).max(200),
  revision: z.number().int().nonnegative(), values: TnValuesSchema, notes: z.string().max(2000).default(""),
  intent: z.enum(["draft", "abort", "complete"]),
});
export type TnSaveInput = z.infer<typeof TnSaveSchema>;
export type TnSaveResult = { ok: true; revision: number; resultId?: string } | { ok: false; error: string; retryable?: boolean };
