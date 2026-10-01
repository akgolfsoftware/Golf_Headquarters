import { z } from "zod";

/** Pågående slag beskriver startposisjoner. De er ikke en ferdig hullscore. */
export const precisionSlagSchema = z.object({
  id: z.string().min(1).max(100),
  dist: z.number().finite().positive().max(700),
  lie: z.enum(["TEE", "FAIRWAY", "SEMI", "ROUGH", "BUNKER", "TRAER", "GREEN"]),
  club: z.string().min(1).max(40),
  pen: z.union([z.literal(0), z.literal(1)]),
  putt: z.object({
    brk: z.enum(["VENSTRE_HOYRE", "HOYRE_VENSTRE", "OPPOVER", "NEDOVER"]),
    hel: z.enum(["SVAK", "MODERAT", "KRAFTIG"]),
    res: z.enum(["hull", "miss"]),
    fart: z.enum(["Kort", "Lang"]).nullable(),
    miss: z.enum(["Venstre", "Høyre", "På linja"]).nullable(),
  }).nullable(),
});

export type UtkastSlag = z.infer<typeof precisionSlagSchema>;
export type UtkastPutt = NonNullable<UtkastSlag["putt"]>;
export type DesignLie = UtkastSlag["lie"];

/** Indeksene følger hullData, også når runden begynner på hull 10. */
export const precisionHullSchema = z.record(
  z.string().regex(/^(?:[0-9]|1[0-7])$/),
  z.array(precisionSlagSchema).max(25),
);
export type PrecisionHullUtkast = z.infer<typeof precisionHullSchema>;
