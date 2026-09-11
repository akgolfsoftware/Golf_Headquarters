/**
 * Runde-logg — kladd i localStorage (klient-side).
 *
 * Golfbane = dårlig dekning: kladden lever på enheten og lagres etter hver
 * mutasjon, slik at reload/crash aldri mister slag. Zod-validert ved restore
 * (ødelagt/utdatert kladd forkastes stille). Slettes først når serveren har
 * bekreftet lagring. Nøkkelen er per bruker — utlogging viser aldri en annens kladd.
 */

import { z } from "zod";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { lesNettleserBrukerId } from "@/lib/offline-queue/eier";

const NOKKEL_PREFIKS = "akgolf.runde-logg.kladd.v1";
const GAMMEL_NOKKEL = NOKKEL_PREFIKS;

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

function nokkelFor(userId: string): string {
  return `${NOKKEL_PREFIKS}:${userId}`;
}

function parseKladd(raa: string | null): RundeKladd | null {
  if (!raa) return null;
  try {
    const parsed = kladdSchema.safeParse(JSON.parse(raa));
    return parsed.success ? (parsed.data as RundeKladd) : null;
  } catch {
    return null;
  }
}

export function lesKladd(): RundeKladd | null {
  if (typeof window === "undefined") return null;
  const userId = lesNettleserBrukerId();
  if (!userId) return null;
  try {
    const scoped = window.localStorage.getItem(nokkelFor(userId));
    const fraScoped = parseKladd(scoped);
    if (fraScoped) return fraScoped;
    const gammel = window.localStorage.getItem(GAMMEL_NOKKEL);
    const fraGammel = parseKladd(gammel);
    if (fraGammel) {
      window.localStorage.setItem(nokkelFor(userId), gammel!);
      window.localStorage.removeItem(GAMMEL_NOKKEL);
      return fraGammel;
    }
    return null;
  } catch {
    return null;
  }
}

let kladdCache: RundeKladd | null | undefined;
let kladdCacheBruker: string | null = null;

export function lesKladdCached(): RundeKladd | null {
  const userId = lesNettleserBrukerId();
  if (kladdCache === undefined || kladdCacheBruker !== userId) {
    kladdCache = lesKladd();
    kladdCacheBruker = userId;
  }
  return kladdCache;
}

export function lesKladdServer(): null {
  return null;
}

export function lagreKladd(kladd: Omit<RundeKladd, "oppdatert">): void {
  if (typeof window === "undefined") return;
  const userId = lesNettleserBrukerId();
  if (!userId) return;
  try {
    window.localStorage.setItem(
      nokkelFor(userId),
      JSON.stringify({ ...kladd, oppdatert: new Date().toISOString() }),
    );
    kladdCache = undefined;
    kladdCacheBruker = null;
  } catch {
    // Full quota / private mode — føringen fortsetter uten kladd.
  }
}

export function slettKladd(): void {
  if (typeof window === "undefined") return;
  const userId = lesNettleserBrukerId();
  if (!userId) return;
  try {
    window.localStorage.removeItem(nokkelFor(userId));
    kladdCache = null;
    kladdCacheBruker = userId;
  } catch {
    // ignorer
  }
}
