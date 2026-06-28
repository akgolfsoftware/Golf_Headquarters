// Mål-fordeling (pyramide-allokering) for en treningsplan.
//
// Én kilde til standard-målet (tidligere duplisert i plan-watcher og
// periodiserings-agent). Når en coach godkjenner et PYRAMID_ADJUST-forslag,
// lagres den justerte fordelingen på planen (`TrainingPlan.targetAllocation`)
// og agentene måler mot DEN i stedet for det hardkodede standard-målet.

import { z } from "zod";
import type { PyramidArea } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE } from "@/lib/pyramide";

export type Allocation = Record<PyramidArea, number>;

/** Standard mål-allokering (%). Brukes til plan ennå ikke har eget mål. */
export const STANDARD_MAL: Allocation = {
  FYS: 15,
  TEK: 20,
  SLAG: 35,
  SPILL: 20,
  TURN: 10,
};

const ALLOCATION_SCHEMA = z.object({
  FYS: z.number(),
  TEK: z.number(),
  SLAG: z.number(),
  SPILL: z.number(),
  TURN: z.number(),
});

/**
 * Les planens mål-allokering fra JSON-feltet. Faller tilbake til standard ved
 * manglende/ugyldig verdi (JSON-blob valideres med zod, ikke `as`-cast).
 */
export function parseTargetAllocation(json: unknown): Allocation {
  if (json == null) return { ...STANDARD_MAL };
  const parsed = ALLOCATION_SCHEMA.safeParse(json);
  return parsed.success ? parsed.data : { ...STANDARD_MAL };
}

/**
 * Anvend et godkjent PYRAMID_ADJUST-forslag på en eksisterende allokering.
 * - Helhetsforslag (`{ fordeling: {...} }`, fra periodiserings-agenten) → bruk det.
 * - Enkelt-område-nudge (`{ omrade, malProsent }`, fra plan-watcher) → sett
 *   det området til foreslått mål, behold resten.
 * Returnerer `current` uendret hvis forslaget ikke er anvendbart.
 */
export function applyPyramidSuggestion(
  current: Allocation,
  suggestion: unknown,
): Allocation {
  const s =
    suggestion && typeof suggestion === "object"
      ? (suggestion as Record<string, unknown>)
      : {};

  const helhet = ALLOCATION_SCHEMA.safeParse(s.fordeling);
  if (helhet.success) {
    const out = {} as Allocation;
    for (const a of PYR_REKKEFOLGE) out[a] = Math.round(helhet.data[a]);
    return out;
  }

  const omrade = s.omrade;
  const mal = s.malProsent;
  if (
    typeof omrade === "string" &&
    (PYR_REKKEFOLGE as string[]).includes(omrade) &&
    typeof mal === "number"
  ) {
    return { ...current, [omrade as PyramidArea]: Math.round(mal) };
  }

  return current;
}
