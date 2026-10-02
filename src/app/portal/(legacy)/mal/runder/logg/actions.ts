"use server";

/**
 * Runde-logg — server actions for slag-for-slag-føring.
 *
 * `lagreLoggetRunde` tar den komplette slag-loggen fra live-føringen,
 * beregner SG bare mot en aktiv AK Golf-modell, og lagrer Round + Shot[] + HoleScore[]
 * i én transaksjon. Kladd underveis lever kun i localStorage på klienten.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerRoundAgent } from "@/lib/agents/triggers";
import { sikreBaneBro } from "@/lib/portal/bane-bro";
import { loadActiveAkSgModel } from "@/lib/ak-sg/active-model";
import { beregnAkSgFraShots } from "@/lib/runde-logg/ak-sg-fra-shots";
import { logError } from "@/lib/error-tracking";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import { hullSchema } from "@/lib/runde-logg/schema";
import { byggShotRader, splitShotRader } from "@/lib/runde-logg/bygg-shot-rader";
import {
  RUNDE_SG_KILDE,
  avledRundeRegistrering,
  rundeRegistreringFelter,
} from "@/lib/runde-logg/kontrakt";

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
  /**
   * Etterregistrering uten full slag-for-slag-føring (RU-04): kjeden er
   * syntetisert fra kun hullscore, ikke ekte lie/avstand. SG er da et
   * grovt estimat — merkes "estimert" i stedet for "beregnet" (RU-02/RU-04).
   */
  estimert: z.boolean().optional().default(false),
});

export type LagreLoggetRundeInput = z.input<typeof rundeSchema>;

// ---------------------------------------------------------------------------
// Hoved-action
// ---------------------------------------------------------------------------

export async function lagreLoggetRunde(
  input: LagreLoggetRundeInput,
): Promise<{ roundId: string; sgTotal: number | null; score: number }> {
  const user = await requireConsentingUser();

  const parsed = rundeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Ugyldig runde-logg: ${parsed.error.issues[0]?.message ?? "ukjent felt"}`);
  }
  const runde = parsed.data;

  const { hullScores, totalScore } = deriverRundeScore(runde.hull);
  const alleRader = runde.hull.flatMap((h) => byggShotRader(h));
  const { shots } = splitShotRader(alleRader);
  const model = runde.estimert ? null : await loadActiveAkSgModel().catch(async (error) => {
    await logError({ context: "runde-logg.ak-sg-reader", error }).catch(() => {});
    return null;
  });
  const result = model ? beregnAkSgFraShots(shots, hullScores, model) : null;
  const sgSource = result ? RUNDE_SG_KILDE.BEREGNET : null;
  const registrering = avledRundeRegistrering({
    sgSource,
    holeScores: hullScores,
    shots: alleRader,
    kilde: runde.estimert ? "etterregistrering" : "live",
  });

  const round = await prisma.$transaction(async (tx) => {
    const opprettet = await tx.round.create({
      data: {
        userId: user.id,
        courseId: runde.courseId,
        playedAt: new Date(runde.playedAt),
        score: totalScore,
        sgTotal: result?.sg.total ?? null,
        sgOtt: result?.sg.ott ?? null,
        sgApp: result?.sg.app ?? null,
        sgArg: result?.sg.arg ?? null,
        sgPutt: result?.sg.putt ?? null,
        sgTee: result?.gran.sgTee ?? null,
        sgApp200: result?.gran.sgApp200 ?? null,
        sgApp150: result?.gran.sgApp150 ?? null,
        sgApp100: result?.gran.sgApp100 ?? null,
        sgApp50: result?.gran.sgApp50 ?? null,
        sgChip: result?.gran.sgChip ?? null,
        sgPitch: result?.gran.sgPitch ?? null,
        sgBunker: result?.gran.sgBunker ?? null,
        sgPutt0_3: result?.gran.sgPutt0_3 ?? null,
        sgPutt3_5: result?.gran.sgPutt3_5 ?? null,
        sgPutt5_10: result?.gran.sgPutt5_10 ?? null,
        sgPutt10_15: result?.gran.sgPutt10_15 ?? null,
        sgPutt15_25: result?.gran.sgPutt15_25 ?? null,
        sgPutt25_40: result?.gran.sgPutt25_40 ?? null,
        sgPutt40plus: result?.gran.sgPutt40plus ?? null,
        sgModelVersionId: result?.versionId ?? null,
        sgSource,
        ...rundeRegistreringFelter(registrering),
        roundType: runde.roundType ?? null,
        notes: runde.notes ?? null,
      },
      select: { id: true },
    });

    const { shots, putts } = splitShotRader(alleRader);
    await tx.shot.createMany({
      data: shots.map((rad) => ({ ...rad, roundId: opprettet.id })),
    });
    if (putts.length > 0) {
      await tx.puttDetail.createMany({ data: putts });
    }

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

  // Bygg/behold broen til banegeometrien (AP0.4). Utenfor transaksjonen og
  // aldri kastende — en manglende bro skal ikke kunne velte en lagret runde.
  await sikreBaneBro(runde.courseId);

  await triggerRoundAgent(user.id);

  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");

  return { roundId: round.id, sgTotal: result?.sg.total ?? null, score: totalScore };
}

/**
 * Henter hull-oppsettet for en bane (par + lengde per hull) til oppstarts-
 * steget i live-føringen. Tar CourseDefinition-id (det rundene bruker) og
 * resolver til Bane via courseDefinition.baneId — hull-geometrien bor på
 * CourseHole under Bane. Broen settes av `sikreBaneBro` ved behov (AP0.4), så
 * første gang en bane velges kobles den, og spilleren får ekte par/lengde i
 * stedet for standardverdier. Baner uten entydig navnetreff eller uten
 * hulldata → tom liste (UI lar spilleren sette par manuelt).
 */
export async function hentBaneHull(
  courseId: string,
): Promise<Array<{ holeNumber: number; par: number | null; lengdeMeter: number | null }>> {
  await requireConsentingUser();

  const baneId = await sikreBaneBro(courseId);
  if (!baneId) return [];

  const hull = await prisma.courseHole.findMany({
    where: { baneId },
    orderBy: { holeNumber: "asc" },
    select: { holeNumber: true, par: true, lengthMeter: true },
  });

  return hull.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    lengdeMeter: h.lengthMeter,
  }));
}
