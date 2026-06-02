"use server";

/**
 * PlayerHQ · Live-økt (Spor A: TrainingPlanSession) — server actions for
 * persistens. Live-fremdrift lagres løpende i `TrainingPlanSession.liveSnapshot`
 * (auto-save via API-route + ved pause), og fryses til `TrainingPlanSessionLog`
 * ved fullføring/avbrudd. Snapshot nulles når økta avsluttes.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import { notify } from "@/lib/notifications";
import { parseLiveSnapshot } from "@/lib/portal-live/data";
import type { LiveSnapshotData } from "@/lib/portal-live/types";
import { Prisma } from "@/generated/prisma/client";

export type SessionLogInput = {
  sessionId: string;
  /** ISO. Valgfri — leses fra liveSnapshot hvis utelatt (ny flyt). */
  startedAt?: string;
  csAchieved?: number;
  notes?: string;
  rating?: number;
};

async function verifyEierskap(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: { plan: { select: { userId: true } } },
  });
  if (!session) throw new Error("not-found");
  if (session.plan.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }
  return { user, session };
}

/** Frys per-drill aggregat + sum-reps + starttid fra et snapshot (eller tomt). */
function freezeFromSnapshot(snap: LiveSnapshotData | null) {
  const drills = snap?.drills ?? [];
  const totalReps = drills.reduce((sum, d) => sum + (d.reps ?? 0), 0);
  const drillAggregates = drills.map((d) => ({
    drillId: d.drillId,
    reps: d.reps,
    elapsedSec: d.elapsedSec,
    status: d.status,
  }));
  const startedAt = snap?.startedAtISO ? new Date(snap.startedAtISO) : new Date();
  return { totalReps, drillAggregates, startedAt };
}

export type StartSessionResult =
  | { state: "active" }
  | { state: "paused" }
  | { state: "completed"; redirectTo: string }
  | { state: "abandoned"; redirectTo: string; toast: string };

/**
 * Aktiverer økta ved overgang brief→active. Håndterer alle statuser eksplisitt:
 * PLANNED→ACTIVE (init snapshot) · ACTIVE forblir ACTIVE (idempotent re-mount) ·
 * PAUSED forblir PAUSED (kun resumeLiveSession endrer) · COMPLETED→/summary ·
 * ABANDONED→/brief med toast. Klienten navigerer basert på resultatet.
 */
export async function startSession(sessionId: string): Promise<StartSessionResult> {
  const { session } = await verifyEierskap(sessionId);

  switch (session.status) {
    case "PLANNED": {
      const now = new Date();
      const initial: LiveSnapshotData = {
        startedAtISO: now.toISOString(),
        totalSec: 0,
        updatedAtISO: now.toISOString(),
        drills: [],
      };
      await prisma.trainingPlanSession.update({
        where: { id: sessionId },
        data: { status: "ACTIVE", liveSnapshot: initial as unknown as Prisma.InputJsonValue },
      });
      revalidatePath(`/portal/live/${sessionId}`);
      return { state: "active" };
    }
    case "ACTIVE":
      return { state: "active" };
    case "PAUSED":
      return { state: "paused" };
    case "COMPLETED":
      return { state: "completed", redirectTo: `/portal/live/${sessionId}/summary` };
    case "ABANDONED":
      return {
        state: "abandoned",
        redirectTo: `/portal/live/${sessionId}/brief?avbrutt=1`,
        toast: "Økten ble avbrutt",
      };
    default: // SKIPPED | CANCELLED
      return {
        state: "abandoned",
        redirectTo: "/portal/tren",
        toast: "Økten er ikke aktiv lenger",
      };
  }
}

/** Pause: persister siste snapshot og sett status PAUSED. Idempotent. */
export async function pauseLiveSession(
  sessionId: string,
  snapshot: LiveSnapshotData,
): Promise<{ ok: boolean }> {
  const { session } = await verifyEierskap(sessionId);
  if (session.status !== "ACTIVE" && session.status !== "PAUSED") return { ok: false };
  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { status: "PAUSED", liveSnapshot: snapshot as unknown as Prisma.InputJsonValue },
  });
  revalidatePath(`/portal/live/${sessionId}`);
  return { ok: true };
}

/** Gjenoppta: sett status ACTIVE (kun fra PAUSED) og returner lagret snapshot. */
export async function resumeLiveSession(
  sessionId: string,
): Promise<{ ok: boolean; snapshot: LiveSnapshotData | null }> {
  const { session } = await verifyEierskap(sessionId);
  if (session.status === "PAUSED") {
    await prisma.trainingPlanSession.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });
    revalidatePath(`/portal/live/${sessionId}`);
  }
  return { ok: true, snapshot: parseLiveSnapshot(session.liveSnapshot) };
}

/** Avbryt: frys delvis logg + sett status ABANDONED med valgfri årsak. */
export async function abandonLiveSession(
  sessionId: string,
  reason?: string,
): Promise<void> {
  const { session } = await verifyEierskap(sessionId);
  const snap = parseLiveSnapshot(session.liveSnapshot);
  const { totalReps, drillAggregates, startedAt } = freezeFromSnapshot(snap);

  // Frys delvis logg + sett ABANDONED/null snapshot ATOMISK (se completeSession).
  await prisma.$transaction([
    prisma.trainingPlanSessionLog.upsert({
      where: { sessionId },
      create: {
        sessionId,
        startedAt,
        completedAt: null,
        totalReps,
        drillAggregates: drillAggregates as unknown as Prisma.InputJsonValue,
        abandonReason: reason ?? null,
      },
      update: {
        totalReps,
        drillAggregates: drillAggregates as unknown as Prisma.InputJsonValue,
        abandonReason: reason ?? null,
      },
    }),
    prisma.trainingPlanSession.update({
      where: { id: sessionId },
      data: { status: "ABANDONED", liveSnapshot: Prisma.JsonNull },
    }),
  ]);

  revalidatePath("/portal/tren");
  revalidatePath(`/portal/live/${sessionId}`);
}

export async function completeSession(input: SessionLogInput) {
  const { session } = await verifyEierskap(input.sessionId);

  // Frys aggregat fra liveSnapshot (ny flyt). Legacy-kallere uten snapshot får
  // null-aggregat, som før — bakoverkompatibelt.
  const snap = parseLiveSnapshot(session.liveSnapshot);
  const { totalReps, drillAggregates, startedAt: snapStartedAt } = freezeFromSnapshot(snap);
  const startedAt = input.startedAt ? new Date(input.startedAt) : snapStartedAt;
  const hasSnapshot = snap !== null;

  // Frys logg + sett COMPLETED/null snapshot ATOMISK. Uten transaksjon kunne
  // et avbrudd mellom skrivingene gi inkonsistens (logg fullført, men status
  // fortsatt ACTIVE og snapshot ikke nullet → økta ser pågående ut).
  const completedAt = new Date();
  await prisma.$transaction([
    prisma.trainingPlanSessionLog.upsert({
      where: { sessionId: input.sessionId },
      create: {
        sessionId: input.sessionId,
        startedAt,
        completedAt,
        csAchieved: input.csAchieved ?? null,
        notes: input.notes ?? null,
        rating: input.rating ?? null,
        totalReps: hasSnapshot ? totalReps : null,
        drillAggregates: hasSnapshot
          ? (drillAggregates as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
      update: {
        completedAt,
        csAchieved: input.csAchieved ?? null,
        notes: input.notes ?? null,
        rating: input.rating ?? null,
        totalReps: hasSnapshot ? totalReps : null,
        drillAggregates: hasSnapshot
          ? (drillAggregates as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    }),
    prisma.trainingPlanSession.update({
      where: { id: input.sessionId },
      data: { status: "COMPLETED", liveSnapshot: Prisma.JsonNull },
    }),
  ]);

  // Sjekk om alle økter i planen nå er ferdige — i så fall auto-arkiver planen,
  // beregn effectiveness og opprett celebration-notifikasjon. Sender også
  // spilleren til feiringssiden i stedet for økt-detalj.
  let redirectMal = `/portal/tren/${input.sessionId}`;
  const sesjonMedPlan = await prisma.trainingPlanSession.findUnique({
    where: { id: input.sessionId },
    select: { planId: true },
  });
  if (sesjonMedPlan) {
    const planId = sesjonMedPlan.planId;
    const teller = await prisma.trainingPlanSession.groupBy({
      by: ["status"],
      where: { planId },
      _count: { _all: true },
    });
    const total = teller.reduce((sum, t) => sum + t._count._all, 0);
    const completed = teller.find((t) => t.status === "COMPLETED")?._count._all ?? 0;
    const planFortsattAapen = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      select: { id: true, status: true, userId: true, name: true },
    });
    if (
      planFortsattAapen &&
      planFortsattAapen.status !== "ARCHIVED" &&
      total > 0 &&
      completed === total
    ) {
      const now = new Date();
      await prisma.trainingPlan.update({
        where: { id: planId },
        data: { status: "ARCHIVED", isActive: false, endDate: now },
      });

      try {
        await computeEffectiveness(planId);
      } catch (err) {
        // Ikke-blokkerende: planen er allerede arkivert. Logg med full kontekst
        // så manglende effectiveness kan oppdages og kjøres på nytt.
        // (verify-live-session.ts <sessionId> flagger også manglende PlanEffectiveness.)
        console.error(
          `[completeSession] computeEffectiveness FEILET for planId=${planId} ` +
            `(userId=${planFortsattAapen.userId}). Planen er arkivert uten ` +
            `effektivitets-analyse — må kjøres på nytt manuelt.`,
          err,
        );
      }

      await notify({
        userId: planFortsattAapen.userId,
        type: "achievement",
        title: `Du fullførte planen: ${planFortsattAapen.name}`,
        body: "Se hvordan du har utviklet deg og be om ny plan.",
        link: `/portal/tren/feiring/${planId}`,
      });

      redirectMal = `/portal/tren/feiring/${planId}`;
    }
  }

  revalidatePath("/portal");
  revalidatePath("/portal/tren");
  revalidatePath(`/portal/tren/${input.sessionId}`);
  redirect(redirectMal);
}
