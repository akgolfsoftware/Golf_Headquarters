/**
 * Runde-logg — kladd i localStorage (klient-side).
 *
 * Golfbane = dårlig dekning: kladden lever på enheten og lagres etter hver
 * mutasjon, slik at reload/crash aldri mister slag. Zod-validert ved restore
 * (ødelagt/utdatert kladd forkastes stille). Slettes først når serveren har
 * bekreftet lagring. Kjent begrensning: kladden følger enheten, ikke brukeren.
 */

import { z } from "zod";
import type { LoggetHull } from "@/lib/runde-logg/types";

const NOKKEL = "akgolf.runde-logg.kladd.v1";

const hvileLieSchema = z.enum([
  "FAIRWAY",
  "SEMI_ROUGH",
  "ROUGH",
  "DEEP_ROUGH",
  "BUNKER",
  "GREEN",
  "TREES",
]);

const slagSchema = z.object({
  resultat: z.discriminatedUnion("iHull", [
    z.object({ iHull: z.literal(true) }),
    z.object({
      iHull: z.literal(false),
      lie: hvileLieSchema,
      avstandTilHull: z.number().min(0.1).max(700),
    }),
  ]),
  kolle: z.string().max(40).optional(),
  vind: z.enum(["STILLE", "MEDVIND", "MOTVIND", "VENSTRE", "HOYRE"]).optional(),
  mental: z.number().int().min(1).max(5).optional(),
  straffe: z.boolean().optional(),
  notat: z.string().max(500).optional(),
});

const hullSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  par: z.number().int().min(3).max(6),
  lengdeMeter: z.number().min(40).max(700),
  slag: z.array(slagSchema).max(25),
});

const kladdSchema = z.object({
  versjon: z.literal(1),
  modus: z.enum(["live", "etterpaa"]),
  steg: z.enum(["oppsett", "foring", "oppsummering"]),
  oppsett: z.object({
    courseId: z.string().nullable(),
    courseNavn: z.string(),
    roundType: z.enum(["turnering", "trening"]),
    hullValg: z.enum(["18", "ut", "inn"]),
    playedAt: z.string(),
  }),
  hullData: z.array(hullSchema).max(18),
  aktivtHullIdx: z.number().int().min(0).max(17),
  oppdatert: z.string(),
});

export type RundeKladd = Omit<z.infer<typeof kladdSchema>, "hullData"> & {
  hullData: LoggetHull[];
};

export function lesKladd(): RundeKladd | null {
  if (typeof window === "undefined") return null;
  try {
    const raa = window.localStorage.getItem(NOKKEL);
    if (!raa) return null;
    const parsed = kladdSchema.safeParse(JSON.parse(raa));
    return parsed.success ? (parsed.data as RundeKladd) : null;
  } catch {
    return null;
  }
}

/**
 * Cachet lesing til useSyncExternalStore (getSnapshot MÅ returnere stabil
 * referanse mellom render-kall, ellers looper React). Cachen invalideres av
 * lagreKladd/slettKladd — aldri under render.
 */
let kladdCache: RundeKladd | null | undefined;

export function lesKladdCached(): RundeKladd | null {
  if (kladdCache === undefined) kladdCache = lesKladd();
  return kladdCache;
}

/** Server-snapshot for useSyncExternalStore. */
export function lesKladdServer(): null {
  return null;
}

export function lagreKladd(kladd: Omit<RundeKladd, "oppdatert">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      NOKKEL,
      JSON.stringify({ ...kladd, oppdatert: new Date().toISOString() }),
    );
    kladdCache = undefined;
  } catch {
    // Full quota / private mode — føringen fortsetter uten kladd.
  }
}

export function slettKladd(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NOKKEL);
    kladdCache = null;
  } catch {
    // ignorer
  }
}
