/**
 * G4 — planendrings-varsling til valgt coach.
 *
 * Spilleren står alltid fritt til å endre egen plan (invariant 1: anbefalinger
 * sperrer aldri), men VALGT coach (resolveValgtCoachId, plan G2) skal se det i
 * cockpiten. Batching: én ulest Notification-rad per spiller per Oslo-dag
 * (groupKey), count inkrementeres ved påfølgende endringer, push kun ved
 * første varsel i vinduet.
 *
 * Fire-and-forget-vennlig: kaster ALDRI — en planmutasjon skal aldri feile
 * fordi varslingen gjør det.
 */

import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { resolveValgtCoachId } from "@/lib/domain/valgt-coach";
import { logError } from "@/lib/error-tracking";
import {
  byggPlanEndringBody,
  byggPlanEndringGroupKey,
  byggPlanEndringGroupKeyPrefix,
  PLAN_ENDRING_TITTEL,
  type PlanEndringsType,
} from "./plan-endring-kjerne";

export type { PlanEndringsType } from "./plan-endring-kjerne";

/**
 * Varsle spillerens valgte coach om en planendring. No-op når spilleren er
 * selvbetjent (ingen coach) eller når den resolvede coachen ER spilleren
 * (coach som endrer egen plan — kallstedene sender alltid innlogget brukers
 * id som spillerId, så sjekken dekker selv-coaching).
 */
export async function varsleCoachOmPlanendring(
  spillerId: string,
  endringsType: PlanEndringsType,
): Promise<void> {
  try {
    const coachId = await resolveValgtCoachId(spillerId);
    if (!coachId || coachId === spillerId) return;

    const groupKey = byggPlanEndringGroupKey(spillerId, new Date());
    const [spiller, eksisterende] = await Promise.all([
      prisma.user.findUnique({
        where: { id: spillerId },
        select: { name: true },
      }),
      prisma.notification.findFirst({
        where: { userId: coachId, groupKey, readAt: null },
        select: { id: true, count: true },
      }),
    ]);
    const navn = spiller?.name ?? "Spilleren";

    if (eksisterende) {
      // Batch: oppdater dagens uleste rad — ingen ny push i vinduet.
      const nyCount = eksisterende.count + 1;
      await prisma.notification.update({
        where: { id: eksisterende.id },
        data: {
          count: nyCount,
          body: byggPlanEndringBody(navn, nyCount, endringsType),
        },
      });
      return;
    }

    // Første endring i vinduet: ny rad + push (notify håndterer kanalene).
    await notify({
      userId: coachId,
      type: "plan",
      title: PLAN_ENDRING_TITTEL,
      body: byggPlanEndringBody(navn, 1, endringsType),
      link: `/admin/spillere/${spillerId}/workbench`,
      groupKey,
    });
  } catch (error) {
    await logError({
      context: "notifications.plan-endring",
      error,
      meta: { spillerId, endringsType },
      severity: "warn",
    }).catch(() => undefined);
  }
}

/**
 * Les-kvittering: coach har åpnet spillerens workbench — marker alle spillerens
 * planendrings-varsler (alle dager) som lest. Best-effort, kaster aldri.
 */
export async function kvitterPlanendringVarsler(
  coachId: string,
  spillerId: string,
): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: coachId,
        groupKey: { startsWith: byggPlanEndringGroupKeyPrefix(spillerId) },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  } catch (error) {
    await logError({
      context: "notifications.plan-endring.kvitter",
      error,
      meta: { coachId, spillerId },
      severity: "warn",
    }).catch(() => undefined);
  }
}
