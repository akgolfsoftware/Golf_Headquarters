/**
 * Zod for fangst PlanAction.suggestion (#9).
 */

import { z } from "zod";

export const FangstSuggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
    detail: z.string().optional(),
    sjekkpunkt: z.string().optional(),
    checkpoint: z.string().optional(),
    fangstId: z.string().optional(),
    recordingId: z.string().optional(),
    hjemmelekse: z.string().optional().nullable(),
    nesteOktAnbefaling: z.string().optional().nullable(),
  })
  .passthrough();

export type FangstSuggestion = z.infer<typeof FangstSuggestionSchema>;

export function parseFangstSuggestion(
  raw: unknown,
): FangstSuggestion | null {
  const r = FangstSuggestionSchema.safeParse(raw);
  return r.success ? r.data : null;
}

/** Trekk ut sjekkpunkt-tekst trygt. */
export function sjekkpunktFraSuggestion(
  raw: unknown,
  fallback?: string | null,
): string | null {
  const s = parseFangstSuggestion(raw);
  const fra =
    (s?.sjekkpunkt?.trim() && s.sjekkpunkt.trim()) ||
    (s?.checkpoint?.trim() && s.checkpoint.trim()) ||
    (s?.forklaring?.trim() && s.forklaring.trim()) ||
    (fallback?.trim() && fallback.trim()) ||
    null;
  return fra ? fra.slice(0, 2000) : null;
}

export function fangstIdFraSuggestion(raw: unknown): string | null {
  const s = parseFangstSuggestion(raw);
  const id = s?.fangstId?.trim() || s?.recordingId?.trim() || null;
  return id;
}
