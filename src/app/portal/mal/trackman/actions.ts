"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerTrackManAgent } from "@/lib/agents/triggers";
import { matchShotToTask, mpsToMph } from "@/lib/teknisk-plan/match-shot";
import { parseTrackManCsv } from "@/lib/trackman/parse-csv";
import { parseTrackManHtmlReport } from "@/lib/trackman/parse-html-report";
import type { TrackManEnvironment } from "@/generated/prisma/client";

export type { TrackManEnvironment };

export type TrackManCsvInput = {
  recordedAt: string; // ISO-dato
  csvContent: string;
  environment: TrackManEnvironment;
  /**
   * Hvis satt: lagrer økten mot denne spilleren i stedet for innlogget bruker.
   * Krever at innlogget bruker har COACH-rolle. Brukes fra CoachHQ
   * (/admin/spillere/[id]) når coach importerer på vegne av spiller.
   */
  onBehalfOfUserId?: string;
};

export async function importTrackManCsv(input: TrackManCsvInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const targetUserId = await resolveTargetUserId(user, input.onBehalfOfUserId);

  const parsed = parseTrackManCsv(input.csvContent);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  if (parsed.sessions.length === 0) {
    throw new Error("Ingen slag funnet i CSV. Sjekk at filen har header + data.");
  }

  const recordedAtOverride = new Date(input.recordedAt);

  for (const session of parsed.sessions) {
    const recordedAt = recordedAtOverride;
    const created = await prisma.trackManSession.create({
      data: {
        userId: targetUserId,
        recordedAt,
        source: "csv-import",
        shotCount: session.shotCount,
        rawJson: session.rawJson as import("@/generated/prisma/client").Prisma.JsonObject,
        environment: input.environment,
      },
    });

    const shots = session.rawJson.shots;
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const club = shot.club?.trim() || "Ukjent";
      const match = await matchShotToTask(targetUserId, club);

      await prisma.trackManShot.create({
        data: {
          sessionId: created.id,
          shotNumber: i + 1,
          club,
          clubSpeed: mpsToMph(shot.clubSpeedMps),
          ballSpeed: mpsToMph(shot.ballSpeedMps),
          smashFactor: shot.smashFactor,
          carryDistance: shot.carryMeters,
          totalDistance: shot.totalMeters,
          launchAngle: shot.launchAngleDeg,
          spinRate: shot.spinRateRpm,
          side: shot.sideMeters,
          positionTaskId: match.taskId,
          matchSource: match.matchSource,
          matchConfidence: match.matchConfidence,
          recordedAt,
        },
      });
    }
  }

  await triggerTrackManAgent(targetUserId);

  revalidatePath("/portal/mal/trackman");
  revalidatePath("/portal/planlegge/workbench");
  if (targetUserId !== user.id) {
    revalidatePath(`/admin/spillere/${targetUserId}`);
    revalidatePath(`/admin/spillere/${targetUserId}/workbench`);
  }
}

export type TrackManHtmlInput = {
  recordedAt: string; // ISO-dato (kan overstyres av bruker)
  htmlContent: string;
  environment: TrackManEnvironment;
  /** Samme semantikk som TrackManCsvInput.onBehalfOfUserId. */
  onBehalfOfUserId?: string;
};

export async function importTrackManHtml(input: TrackManHtmlInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const targetUserId = await resolveTargetUserId(user, input.onBehalfOfUserId);

  const rapport = parseTrackManHtmlReport(input.htmlContent);

  const shotCount = rapport.clubs.reduce((sum, c) => sum + c.shotCount, 0);

  await prisma.trackManSession.create({
    data: {
      userId: targetUserId,
      recordedAt: new Date(input.recordedAt),
      source: "html-import",
      shotCount,
      rawJson: rapport as unknown as import("@/generated/prisma/client").Prisma.JsonObject,
      environment: input.environment,
    },
  });

  await triggerTrackManAgent(targetUserId);

  revalidatePath("/portal/mal/trackman");
  if (targetUserId !== user.id) {
    revalidatePath(`/admin/spillere/${targetUserId}`);
  }
}

/**
 * Returnerer hvilken bruker import skal lagres mot. Default = innlogget user.
 * Hvis onBehalfOfUserId er satt: krever at innlogget user har COACH-rolle.
 */
async function resolveTargetUserId(
  user: { id: string; role: import("@/generated/prisma/client").UserRole },
  onBehalfOfUserId: string | undefined,
): Promise<string> {
  if (!onBehalfOfUserId || onBehalfOfUserId === user.id) return user.id;
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("Kun coach kan importere på vegne av spiller.");
  }
  const target = await prisma.user.findUnique({
    where: { id: onBehalfOfUserId },
    select: { id: true },
  });
  if (!target) throw new Error("Spiller ikke funnet.");
  return target.id;
}
