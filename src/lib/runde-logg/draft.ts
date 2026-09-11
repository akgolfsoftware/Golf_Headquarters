/**
 * Runde-logg — kladd i localStorage (klient-side).
 *
 * Golfbane = dårlig dekning: kladden lever på enheten og lagres etter hver
 * mutasjon, slik at reload/crash aldri mister slag. Zod-validert ved restore
 * (ødelagt/utdatert kladd forkastes stille). Slettes først når serveren har
 * bekreftet lagring. Nøkkelen er avgrenset til innlogget bruker, slik at en
 * annen bruker på samme enhet aldri får forrige brukers runde.
 */

import { z } from "zod";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";

const GRUNNNOKKEL = "akgolf.runde-logg.kladd.v2";

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
  /** slag = full kjede, hurtig = score per hull (F.02). */
  foringsModus: z.enum(["slag", "hurtig"]).optional().default("slag"),
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

export function lesKladd(eierId: string | null): RundeKladd | null {
  if (typeof window === "undefined") return null;
  const nokkel = byggLagringsNokkel(GRUNNNOKKEL, eierId);
  if (!nokkel) return null;
  try {
    const raa = window.localStorage.getItem(nokkel);
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
const kladdCache = new Map<string, RundeKladd | null>();

export function lesKladdCached(eierId: string | null): RundeKladd | null {
  const nokkel = byggLagringsNokkel(GRUNNNOKKEL, eierId);
  if (!nokkel) return null;
  if (!kladdCache.has(nokkel)) kladdCache.set(nokkel, lesKladd(eierId));
  return kladdCache.get(nokkel) ?? null;
}

/** Server-snapshot for useSyncExternalStore. */
export function lesKladdServer(): null {
  return null;
}

export function lagreKladd(
  eierId: string | null,
  kladd: Omit<RundeKladd, "oppdatert">,
): boolean {
  if (typeof window === "undefined") return false;
  const nokkel = byggLagringsNokkel(GRUNNNOKKEL, eierId);
  if (!nokkel) return false;
  try {
    window.localStorage.setItem(
      nokkel,
      JSON.stringify({ ...kladd, oppdatert: new Date().toISOString() }),
    );
    kladdCache.delete(nokkel);
    return true;
  } catch {
    // Full quota / private mode — føringen fortsetter uten kladd.
    return false;
  }
}

export function slettKladd(eierId: string | null): void {
  if (typeof window === "undefined") return;
  const nokkel = byggLagringsNokkel(GRUNNNOKKEL, eierId);
  if (!nokkel) return;
  try {
    window.localStorage.removeItem(nokkel);
    kladdCache.set(nokkel, null);
  } catch {
    // ignorer
  }
}
