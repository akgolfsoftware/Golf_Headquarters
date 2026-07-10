/**
 * Runde-logg — delte zod-schemas (JSON-blob-regelen: alt fra klienten
 * valideres). Brukes av lagreLoggetRunde (hel runde) og lagreHullKjede
 * (fullfør kjeden per hull på eksisterende runde).
 */

import { z } from "zod";

export const hvileLieSchema = z.enum([
  "FAIRWAY",
  "SEMI_ROUGH",
  "ROUGH",
  "DEEP_ROUGH",
  "BUNKER",
  "GREEN",
  "TREES",
]);

export const resultatSchema = z.discriminatedUnion("iHull", [
  z.object({ iHull: z.literal(true) }),
  z.object({
    iHull: z.literal(false),
    lie: hvileLieSchema,
    avstandTilHull: z.number().min(0.1).max(700),
  }),
]);

export const slagSchema = z
  .object({
    resultat: resultatSchema,
    kolle: z.string().max(40).optional(),
    vind: z.enum(["STILLE", "MEDVIND", "MOTVIND", "VENSTRE", "HOYRE"]).optional(),
    mental: z.number().int().min(1).max(5).optional(),
    straffe: z.boolean().optional(),
    notat: z.string().max(500).optional(),
  })
  // Straffe på hole-out-slaget ville blitt stille ignorert av hullTilSgShots
  // (som returnerer ved iHull før straffen leses) — avvis eksplisitt.
  .refine((s) => !(s.resultat.iHull && s.straffe), {
    message:
      "Straffe kan ikke settes på slaget som går i hull — før straffen på slaget den skjedde",
  });

export const hullSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  par: z.number().int().min(3).max(6),
  lengdeMeter: z.number().min(40).max(700),
  slag: z.array(slagSchema).min(1).max(25),
});
