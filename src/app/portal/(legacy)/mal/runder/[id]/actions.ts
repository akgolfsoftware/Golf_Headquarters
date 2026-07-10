"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { notifyMany } from "@/lib/notifications";
import { beregnSgFraShots, beregnGranulaerSgFraShots } from "@/lib/runde-logg/shots-til-sg";
import { ShotLie, ShotType, WindDir } from "@/generated/prisma/client";

export type ShareVisibility = "privat" | "coach" | "offentlig";
export type ShareFormat = "story" | "post" | "pdf" | "link";

export type ShareRoundInput = {
  format: ShareFormat;
  visibility: ShareVisibility;
  message?: string;
  /** Inkluder score, statistikk, foto, notater (toggles). */
  inkluder: {
    score: boolean;
    statistikk: boolean;
    foto: boolean;
    notater: boolean;
  };
};

/**
 * Del en runde med coach / foreldre / offentlig.
 *
 * Returnerer en delbar lenke (akgolf.no/r/<slug>) som kan kopieres
 * til utklippstavla. Sender også Notification til coach hvis
 * visibility === "coach".
 */
export async function shareRound(roundId: string, input: ShareRoundInput) {
  const user = await requireConsentingUser();

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { course: true },
  });
  if (!round || round.userId !== user.id) throw new Error("forbidden");

  // Generer share-slug — 8 tegn fra round.id
  const slug = round.id.slice(0, 8);
  const shareUrl = `https://akgolf.no/r/${slug}`;

  // Hvis coach skal varsles, hent alle coach-er via gruppe-medlemskap.
  if (input.visibility === "coach") {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      select: { group: { select: { coachId: true } } },
    });
    const coachIds = Array.from(
      new Set(
        memberships
          .map((m) => m.group.coachId)
          .filter((v): v is string => v != null),
      ),
    );

    if (coachIds.length > 0) {
      await notifyMany(coachIds, {
        type: "melding",
        title: `${user.name} delte en runde`,
        body: `${round.course.name} · ${round.score} slag${input.message ? ` — ${input.message}` : ""}`,
        link: `/admin/spillere/${user.id}`,
      });
    }
  }

  revalidatePath(`/portal/mal/runder/${roundId}`);
  return { shareUrl, format: input.format, visibility: input.visibility };
}

export type ShotInput = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club?: string;
  lie: ShotLie;
  distanceToPin?: number;
  distanceHit?: number;
  windDir?: WindDir;
  shotType: ShotType;
  isPenalty?: boolean;
  notes?: string;
  // GPS-posisjon for baneguide/dispersion (X=lng, Y=lat — se lib/baneguide/shot-coords)
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
};

async function assertRoundOwner(roundId: string, userId: string) {
  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== userId) throw new Error("forbidden");
  return round;
}

/**
 * SG-autoberegning fra slag-kjeden (kalles etter hver slag-endring).
 * Presedens: sgSource='manual' (håndtastet) overskrives ALDRI. Komplett kjede
 * → skriv sg* + 'beregnet'; ufullstendig kjede der tallene var 'beregnet' →
 * nullstill (stale tall er verre enn ingen). Feil svelges — slag-lagringen
 * skal aldri velte på beregningen.
 */
async function recomputeRoundSg(roundId: string): Promise<void> {
  try {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      select: { sgSource: true },
    });
    if (!round || round.sgSource === "manual") return;

    const [shots, holeScores] = await Promise.all([
      prisma.shot.findMany({
        where: { roundId },
        select: {
          holeNumber: true,
          holePar: true,
          shotNumber: true,
          lie: true,
          distanceToPin: true,
          isPenalty: true,
        },
      }),
      prisma.holeScore.findMany({
        where: { roundId },
        select: { holeNumber: true, strokes: true },
      }),
    ]);

    const sg = beregnSgFraShots(shots, holeScores);
    if (sg) {
      const gran = beregnGranulaerSgFraShots(shots, holeScores);
      await prisma.round.update({
        where: { id: roundId },
        data: {
          sgTotal: sg.total,
          sgOtt: sg.ott,
          sgApp: sg.app,
          sgArg: sg.arg,
          sgPutt: sg.putt,
          sgSource: "beregnet",
          // Granulære buckets (15 — sgLob krever kølledata og settes ikke her)
          sgTee: gran?.sgTee ?? null,
          sgApp200: gran?.sgApp200 ?? null,
          sgApp150: gran?.sgApp150 ?? null,
          sgApp100: gran?.sgApp100 ?? null,
          sgApp50: gran?.sgApp50 ?? null,
          sgChip: gran?.sgChip ?? null,
          sgPitch: gran?.sgPitch ?? null,
          sgBunker: gran?.sgBunker ?? null,
          sgPutt0_3: gran?.sgPutt0_3 ?? null,
          sgPutt3_5: gran?.sgPutt3_5 ?? null,
          sgPutt5_10: gran?.sgPutt5_10 ?? null,
          sgPutt10_15: gran?.sgPutt10_15 ?? null,
          sgPutt15_25: gran?.sgPutt15_25 ?? null,
          sgPutt25_40: gran?.sgPutt25_40 ?? null,
          sgPutt40plus: gran?.sgPutt40plus ?? null,
        },
      });
    } else if (round.sgSource === "beregnet") {
      // Ufullstendig kjede: nullstill ALLE beregnede felter (5 + 15) —
      // stale tall er verre enn ingen.
      await prisma.round.update({
        where: { id: roundId },
        data: {
          sgTotal: null, sgOtt: null, sgApp: null, sgArg: null, sgPutt: null,
          sgTee: null, sgApp200: null, sgApp150: null, sgApp100: null, sgApp50: null,
          sgChip: null, sgPitch: null, sgBunker: null,
          sgPutt0_3: null, sgPutt3_5: null, sgPutt5_10: null, sgPutt10_15: null,
          sgPutt15_25: null, sgPutt25_40: null, sgPutt40plus: null,
          sgSource: null,
        },
      });
    }
  } catch (e) {
    console.error("recomputeRoundSg feilet:", e);
  }
}

export async function saveShot(roundId: string, input: ShotInput) {
  const user = await requireConsentingUser();
  await assertRoundOwner(roundId, user.id);

  await prisma.shot.upsert({
    where: {
      roundId_holeNumber_shotNumber: {
        roundId,
        holeNumber: input.holeNumber,
        shotNumber: input.shotNumber,
      },
    },
    create: {
      roundId,
      holeNumber: input.holeNumber,
      holePar: input.holePar,
      shotNumber: input.shotNumber,
      club: input.club ?? null,
      lie: input.lie,
      distanceToPin: input.distanceToPin ?? null,
      distanceHit: input.distanceHit ?? null,
      windDir: input.windDir ?? null,
      shotType: input.shotType,
      isPenalty: input.isPenalty ?? false,
      notes: input.notes ?? null,
      startX: input.startLng ?? null,
      startY: input.startLat ?? null,
      endX: input.endLng ?? null,
      endY: input.endLat ?? null,
    },
    update: {
      holePar: input.holePar,
      club: input.club ?? null,
      lie: input.lie,
      distanceToPin: input.distanceToPin ?? null,
      distanceHit: input.distanceHit ?? null,
      windDir: input.windDir ?? null,
      shotType: input.shotType,
      isPenalty: input.isPenalty ?? false,
      notes: input.notes ?? null,
      startX: input.startLng ?? null,
      startY: input.startLat ?? null,
      endX: input.endLng ?? null,
      endY: input.endLat ?? null,
    },
  });

  await recomputeRoundSg(roundId);
  revalidatePath(`/portal/mal/runder/${roundId}`);
}

export async function deleteShot(roundId: string, shotId: string) {
  const user = await requireConsentingUser();
  await assertRoundOwner(roundId, user.id);

  await prisma.shot.delete({ where: { id: shotId } });
  await recomputeRoundSg(roundId);
  revalidatePath(`/portal/mal/runder/${roundId}`);
}

export async function importUpGameShots(
  roundId: string,
  shots: ShotInput[],
) {
  const user = await requireConsentingUser();
  await assertRoundOwner(roundId, user.id);

  // Slett eksisterende slag og erstatt med importerte
  await prisma.shot.deleteMany({ where: { roundId } });
  if (shots.length > 0) {
    await prisma.shot.createMany({
      data: shots.map((s) => ({
        roundId,
        holeNumber: s.holeNumber,
        holePar: s.holePar,
        shotNumber: s.shotNumber,
        club: s.club ?? null,
        lie: s.lie,
        distanceToPin: s.distanceToPin ?? null,
        distanceHit: s.distanceHit ?? null,
        windDir: s.windDir ?? null,
        shotType: s.shotType,
        isPenalty: s.isPenalty ?? false,
        notes: s.notes ?? null,
      })),
    });
  }

  await recomputeRoundSg(roundId);
  revalidatePath(`/portal/mal/runder/${roundId}`);
}
