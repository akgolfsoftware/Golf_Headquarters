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
import { hullSchema } from "@/lib/runde-logg/schema";
import { byggShotRader } from "@/lib/runde-logg/bygg-shot-rader";

// ---------------------------------------------------------------------------
// Validering (JSON-blob-regelen: alt fra klienten zod-valideres).
// Delte schemas (slag/hull) bor i lib/runde-logg/schema.ts.
// ---------------------------------------------------------------------------

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
  /** Turnering eller trening — null/utelatt = ukjent (ærlig for gamle runder). */
  roundType: z.enum(["turnering", "trening"]).optional(),
});

export type LagreLoggetRundeInput = z.input<typeof rundeSchema>;

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
        sgSource: "beregnet",
        roundType: runde.roundType ?? null,
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
 * steget i live-føringen. Tar CourseDefinition-id (det rundene bruker) og
 * resolver til Bane via courseDefinition.baneId — hull-geometrien bor på
 * CourseHole under Bane. Baner uten kobling/hulldata → tom liste (UI lar
 * spilleren sette par manuelt).
 */
export async function hentBaneHull(
  courseId: string,
): Promise<Array<{ holeNumber: number; par: number | null; lengdeMeter: number | null }>> {
  await requireConsentingUser();

  const course = await prisma.courseDefinition.findUnique({
    where: { id: courseId },
    select: { baneId: true },
  });
  if (!course?.baneId) return [];

  const hull = await prisma.courseHole.findMany({
    where: { baneId: course.baneId },
    orderBy: { holeNumber: "asc" },
    select: { holeNumber: true, par: true, lengthMeter: true },
  });

  return hull.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    lengdeMeter: h.lengthMeter,
  }));
}
