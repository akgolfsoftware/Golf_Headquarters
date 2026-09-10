import { z } from "zod";
import { TN_VERSION } from "./tn-catalog";
import { TnValuesSchema } from "./tn-scoring";
export const TnSessionSchema = z.object({
  version: z.literal(TN_VERSION), protocolId: z.string(), count: z.number().int().min(1).max(200),
  revision: z.number().int().nonnegative(), values: TnValuesSchema, notes: z.string().max(2000).default(""),
});
export const TnSaveSchema = z.object({
  sessionId: z.string().uuid(), protocolId: z.string().max(80), count: z.number().int().min(1).max(200),
  revision: z.number().int().nonnegative(), values: TnValuesSchema, notes: z.string().max(2000).default(""),
  intent: z.enum(["draft", "abort", "complete"]),
});
export type TnSaveInput = z.infer<typeof TnSaveSchema>;
export type TnSaveResult = { ok: true; revision: number; resultId?: string } | { ok: false; error: string };
