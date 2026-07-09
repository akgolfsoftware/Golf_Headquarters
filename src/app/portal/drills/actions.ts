"use server";

/**
 * PlayerHQ · Drills · Server actions
 *
 * - `requestDrillInPlan(drillId)` — sender forespørsel til Anders om å ta
 *   drillen inn i neste plan. Lagres som SessionRequest med drill-id i reason.
 * - `logDrillAsSession(drillId, notes)` — logger drill som en selv-planlagt
 *   TrainingSessionV2 + tilhørende SessionDrillInstance.
 * - `shareDrillWithCoach(drillId, melding)` — sender en kort melding/notat
 *   til coachen via CoachingSession-meldingstråden.
 *
 * Tilgang: kun PLAYER og PARENT.
 */
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { canUserAccessDrill } from "@/lib/portal-drills/drill-access";
import { MMiljo, PracticeType } from "@/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

async function finnPrimaryCoachId(): Promise<string | null> {
  // Anders er som regel eneste ADMIN/COACH; ta første tilgjengelige.
  const coach = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "COACH"] } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return coach?.id ?? null;
}

export async function requestDrillInPlan(
  drillId: string,
  notat?: string,
): Promise<ActionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  if (!(await canUserAccessDrill(user.id, drillId))) {
    return { ok: false, error: "Ingen tilgang til denne drillen" };
  }

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: drillId },
    select: { id: true, name: true, pyramidArea: true },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const coachId = await finnPrimaryCoachId();

  const reason = [
    `Drill-forespørsel: ${drill.name} (id: ${drill.id})`,
    notat?.trim() ? `Notat: ${notat.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await prisma.sessionRequest.create({
    data: {
      userId: user.id,
      coachId,
      preferredArea: drill.pyramidArea,
      reason,
    },
  });

  revalidatePath("/portal/drills");
  revalidatePath(`/portal/drills/${drillId}`);
  return { ok: true };
}

export async function logDrillAsSession(
  drillId: string,
  notater?: string,
): Promise<ActionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  if (!(await canUserAccessDrill(user.id, drillId))) {
    return { ok: false, error: "Ingen tilgang til denne drillen" };
  }

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: drillId },
    select: {
      id: true,
      name: true,
      defaultRepsSets: true,
      defaultSets: true,
      defaultReps: true,
      durationMin: true,
      pyramidArea: true,
      lPhase: true,
    },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const coachId = await finnPrimaryCoachId();
  if (!coachId)
    return { ok: false, error: "Fant ingen coach å koble økten til" };

  const startTime = new Date();
  const durationMin = drill.durationMin ?? 45;
  const endTime = new Date(startTime.getTime() + durationMin * 60_000);

  const session = await prisma.trainingSessionV2.create({
    data: {
      title: `Selvplanlagt: ${drill.name}`,
      studentId: user.id,
      coachId,
      startTime,
      endTime,
      miljo: MMiljo.M2,
      practiceType: PracticeType.BLOKK,
      isCoachCreated: false,
      notes: notater?.trim()
        ? notater.trim()
        : "Logget fra drill-bibliotek av spiller.",
    },
  });

  await prisma.sessionDrillInstance.create({
    data: {
      sessionId: session.id,
      drillId: drill.id,
      drillName: drill.name,
      orderIndex: 0,
      plannedReps: drill.defaultReps ?? null,
      plannedSets: drill.defaultSets ?? null,
      pyramideArea: drill.pyramidArea,
      fase: drill.lPhase ?? null,
    },
  });

  revalidatePath("/portal/drills");
  revalidatePath(`/portal/drills/${drillId}`);
  revalidatePath("/portal/tren");
  return { ok: true };
}

export async function shareDrillWithCoach(
  drillId: string,
  melding: string,
): Promise<ActionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  if (!melding.trim()) return { ok: false, error: "Melding kan ikke være tom" };

  if (!(await canUserAccessDrill(user.id, drillId))) {
    return { ok: false, error: "Ingen tilgang til denne drillen" };
  }

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: drillId },
    select: { id: true, name: true },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const coachId = await finnPrimaryCoachId();
  if (!coachId) return { ok: false, error: "Fant ingen coach å sende til" };

  // Finn eller opprett en DIRECT-coachingsession som meldingsbøtte.
  const session = await prisma.coachingSession.findFirst({
    where: { userId: user.id, coachId, kind: "DIRECT" },
    orderBy: { updatedAt: "desc" },
  });

  const nyMelding = {
    role: "user" as const,
    content: `[Drill: ${drill.name}] ${melding.trim()}`,
    ts: new Date().toISOString(),
    drillId: drill.id,
  };

  if (!session) {
    await prisma.coachingSession.create({
      data: {
        userId: user.id,
        coachId,
        kind: "DIRECT",
        messages: [nyMelding] as unknown as object,
      },
    });
  } else {
    const eksisterende = Array.isArray(session.messages)
      ? (session.messages as unknown as object[])
      : [];
    await prisma.coachingSession.update({
      where: { id: session.id },
      data: {
        messages: [...eksisterende, nyMelding] as unknown as object,
      },
    });
  }

  revalidatePath("/portal/drills");
  revalidatePath(`/portal/drills/${drillId}`);
  return { ok: true };
}
