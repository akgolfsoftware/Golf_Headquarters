"use server";

/**
 * Runde-logg — server actions for slag-for-slag-føring.
 *
 * `lagreLoggetRunde` tar den komplette slag-loggen fra live-føringen,
 * BEREGNER SG server-side med SG-motoren (serveren er fasit — klientens
 * løpende estimat er kun visning), og lagrer Round + Shot[] + HoleScore[]
 * i én transaksjon. Kladd underveis lever kun i localStorage på klienten.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerRoundAgent } from "@/lib/agents/triggers";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import { beregnGranulaerSg } from "@/lib/runde-logg/granulaer-sg";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import type { ShotLie, ShotType, WindDir } from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Validering (JSON-blob-regelen: alt fra klienten zod-valideres)
// ---------------------------------------------------------------------------

const hvileLieSchema = z.enum([
  "FAIRWAY",
  "SEMI_ROUGH",
  "ROUGH",
  "DEEP_ROUGH",
  "BUNKER",
  "GREEN",
  "TREES",
]);

const resultatSchema = z.discriminatedUnion("iHull", [
  z.object({ iHull: z.literal(true) }),
  z.object({
    iHull: z.literal(false),
    lie: hvileLieSchema,
    avstandTilHull: z.number().min(0.1).max(700),
  }),
]);

const slagSchema = z.object({
  resultat: resultatSchema,
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
  slag: z.array(slagSchema).min(1).max(25),
});

const rundeSchema = z.object({
  courseId: z.string().min(1),
  playedAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Ugyldig dato",
  }),
  hull: z
    .array(hullSchema)
    .min(1)
    .max(18)
    .refine(
      (hull) => new Set(hull.map((h) => h.holeNumber)).size === hull.length,
      { message: "Duplikate hullnummer" },
    ),
  notes: z.string().max(2000).optional(),
});

export type LagreLoggetRundeInput = z.input<typeof rundeSchema>;

// ---------------------------------------------------------------------------
// Shot-rad-avledning (DB-representasjon per svingt slag)
// ---------------------------------------------------------------------------

/** Deterministisk ShotType fra kontekst — dokumentert konvensjon, ikke gjettverk. */
function utledShotType(
  erForsteSlag: boolean,
  par: number,
  startLie: ShotLie,
  startAvstand: number,
): ShotType {
  if (startLie === "GREEN") return "PUTT";
  if (erForsteSlag && par >= 4) return "DRIVE";
  if (startLie === "TREES") return "RECOVERY";
  if (startLie === "BUNKER" && startAvstand <= 30) return "BUNKER";
  if (startAvstand <= 12) return "CHIP";
  if (startAvstand <= 30) return "PITCH";
  return "APPROACH";
}

type ShotRad = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club: string | null;
  lie: ShotLie;
  distanceToPin: number;
  windDir: WindDir | null;
  shotType: ShotType;
  isPenalty: boolean;
  mentalScore: number | null;
  notes: string | null;
};

/** Bygger Shot-radene for ett hull (posisjonskjedet gir startposisjon per slag). */
function byggShotRader(hull: LoggetHull): ShotRad[] {
  let startLie: ShotLie = "TEE";
  let startAvstand = hull.lengdeMeter;

  return hull.slag.map((slag: LoggetSlag, i) => {
    const rad: ShotRad = {
      holeNumber: hull.holeNumber,
      holePar: hull.par,
      shotNumber: i + 1,
      club: slag.kolle ?? null,
      lie: startLie,
      distanceToPin: startAvstand,
      windDir: slag.vind ?? null,
      shotType: utledShotType(i === 0, hull.par, startLie, startAvstand),
      isPenalty: slag.straffe === true,
      mentalScore: slag.mental ?? null,
      notes: slag.notat ?? null,
    };
    if (!slag.resultat.iHull) {
      startLie = slag.resultat.lie;
      startAvstand = slag.resultat.avstandTilHull;
    }
    return rad;
  });
}

// ---------------------------------------------------------------------------
// Hoved-action
// ---------------------------------------------------------------------------

export async function lagreLoggetRunde(
  input: LagreLoggetRundeInput,
): Promise<{ roundId: string; sgTotal: number; score: number }> {
  const user = await requireConsentingUser();

  const parsed = rundeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Ugyldig runde-logg: ${parsed.error.issues[0]?.message ?? "ukjent felt"}`);
  }
  const runde = parsed.data;

  // Domene-beregninger — kaster ved inkonsistent kjede (slag etter hole-out osv.)
  const sgShots = rundeTilSgShots(runde.hull);
  const sg = beregnSg(sgShots);
  const granulaer = beregnGranulaerSg(runde.hull, sgShots);
  const { hullScores, totalScore } = deriverRundeScore(runde.hull);

  const round = await prisma.$transaction(async (tx) => {
    const opprettet = await tx.round.create({
      data: {
        userId: user.id,
        courseId: runde.courseId,
        playedAt: new Date(runde.playedAt),
        score: totalScore,
        sgTotal: sg.total,
        sgOtt: sg.ott,
        sgApp: sg.app,
        sgArg: sg.arg,
        sgPutt: sg.putt,
        sgTee: granulaer.sgTee,
        sgApp200: granulaer.sgApp200,
        sgApp150: granulaer.sgApp150,
        sgApp100: granulaer.sgApp100,
        sgApp50: granulaer.sgApp50,
        sgChip: granulaer.sgChip,
        sgPitch: granulaer.sgPitch,
        sgBunker: granulaer.sgBunker,
        sgPutt0_3: granulaer.sgPutt0_3,
        sgPutt3_5: granulaer.sgPutt3_5,
        sgPutt5_10: granulaer.sgPutt5_10,
        sgPutt10_15: granulaer.sgPutt10_15,
        sgPutt15_25: granulaer.sgPutt15_25,
        sgPutt25_40: granulaer.sgPutt25_40,
        sgPutt40plus: granulaer.sgPutt40plus,
        notes: runde.notes ?? null,
      },
      select: { id: true },
    });

    await tx.shot.createMany({
      data: runde.hull.flatMap((h) =>
        byggShotRader(h).map((rad) => ({ ...rad, roundId: opprettet.id })),
      ),
    });

    await tx.holeScore.createMany({
      data: hullScores.map((h) => ({
        roundId: opprettet.id,
        holeNumber: h.holeNumber,
        par: h.par,
        strokes: h.strokes,
        putts: h.putts,
        fairway: h.fairway,
        gir: h.gir,
      })),
    });

    return opprettet;
  });

  await triggerRoundAgent(user.id);

  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");

  return { roundId: round.id, sgTotal: sg.total, score: totalScore };
}

/**
 * Henter hull-oppsettet for en bane (par + lengde per hull) til oppstarts-
 * steget i live-føringen. Baner uten hulldata → tom liste (UI lar spilleren
 * sette par manuelt).
 */
export async function hentBaneHull(
  courseId: string,
): Promise<Array<{ holeNumber: number; par: number | null; lengdeMeter: number | null }>> {
  await requireConsentingUser();

  const hull = await prisma.courseHole.findMany({
    where: { baneId: courseId },
    orderBy: { holeNumber: "asc" },
    select: { holeNumber: true, par: true, lengthMeter: true },
  });

  return hull.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    lengdeMeter: h.lengthMeter,
  }));
}
