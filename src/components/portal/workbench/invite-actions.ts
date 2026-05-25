"use server";

/**
 * Server actions for Trene sammen-feature.
 *
 * Aktiverer kompis-koordinering: host inviterer spillere til delt
 * TrainingSessionV2, invitert kan svare ACCEPTED/DECLINED/MAYBE, og både host
 * og deltakeren selv kan fjerne deltakelse.
 *
 * Authz-regler:
 *  - inviterSpiller: kun hostId === currentUser.id
 *  - svarPaInvitasjon: kun userId === currentUser.id (deltakeren selv)
 *  - fjernSpiller: host eller deltakeren selv
 *
 * TODO: når lib/notifications/triggers.ts har et invitasjons-trigger, send
 * notifikasjon her i stedet for å la frontend håndtere oppfølging.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export type InviteSpillerInput = {
  sessionId: string;
  userId: string;
};

export type InviteSpillerResult =
  | { ok: true; id: string }
  | { ok: false; error: "unauthorized" | "session-not-found" | "full" | "already-invited" };

export async function inviterSpiller(
  opts: InviteSpillerInput,
): Promise<InviteSpillerResult> {
  const me = await requirePortalUser();

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: opts.sessionId },
    select: {
      hostId: true,
      coachId: true,
      maxParticipants: true,
      participants: { select: { id: true, userId: true } },
    },
  });
  if (!session) return { ok: false, error: "session-not-found" };

  // Authz: bare host kan invitere. Hvis hostId mangler (eldre data), fall
  // tilbake til coachId for backward-compat.
  const hostId = session.hostId ?? session.coachId;
  if (hostId !== me.id) return { ok: false, error: "unauthorized" };

  // Kapasitet-sjekk (maxParticipants er nullable — null = ingen grense)
  if (
    session.maxParticipants != null &&
    session.participants.length >= session.maxParticipants
  ) {
    return { ok: false, error: "full" };
  }

  // Idempotens: hvis allerede invitert, returner eksisterende rad
  const existing = session.participants.find((p) => p.userId === opts.userId);
  if (existing) {
    return { ok: false, error: "already-invited" };
  }

  const participant = await prisma.sessionParticipant.create({
    data: {
      sessionId: opts.sessionId,
      userId: opts.userId,
      status: "INVITED",
    },
    select: { id: true },
  });

  // TODO: Send notifikasjon til invitert spiller via lib/notifications

  revalidatePath("/portal");
  revalidatePath(`/portal/tren/${opts.sessionId}`);
  return { ok: true, id: participant.id };
}

export type SvarPaInvitasjonInput = {
  participantId: string;
  svar: "ACCEPTED" | "DECLINED" | "MAYBE";
};

export type SvarPaInvitasjonResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not-found" };

export async function svarPaInvitasjon(
  opts: SvarPaInvitasjonInput,
): Promise<SvarPaInvitasjonResult> {
  const me = await requirePortalUser();

  const p = await prisma.sessionParticipant.findUnique({
    where: { id: opts.participantId },
    select: { userId: true, sessionId: true },
  });
  if (!p) return { ok: false, error: "not-found" };
  if (p.userId !== me.id) return { ok: false, error: "unauthorized" };

  const now = new Date();
  await prisma.sessionParticipant.update({
    where: { id: opts.participantId },
    data: {
      status: opts.svar,
      respondedAt: now,
      joinedAt: opts.svar === "ACCEPTED" ? now : null,
    },
  });

  revalidatePath("/portal");
  revalidatePath(`/portal/tren/${p.sessionId}`);
  return { ok: true };
}

export type FjernSpillerInput = {
  participantId: string;
};

export type FjernSpillerResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not-found" };

export async function fjernSpiller(
  opts: FjernSpillerInput,
): Promise<FjernSpillerResult> {
  const me = await requirePortalUser();

  const p = await prisma.sessionParticipant.findUnique({
    where: { id: opts.participantId },
    include: { session: { select: { hostId: true, coachId: true } } },
  });
  if (!p) return { ok: false, error: "not-found" };

  const hostId = p.session.hostId ?? p.session.coachId;
  const erHost = hostId === me.id;
  const erDeltaker = p.userId === me.id;
  if (!erHost && !erDeltaker) return { ok: false, error: "unauthorized" };

  await prisma.sessionParticipant.delete({ where: { id: opts.participantId } });

  revalidatePath("/portal");
  revalidatePath(`/portal/tren/${p.sessionId}`);
  return { ok: true };
}

/**
 * Hjelper for Workbench/PlayerHQ Hjem: hent kommende delte økter denne uka
 * der bruker enten er host eller deltaker.
 */
export async function getDelteOkterDenneUka(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const sessions = await prisma.trainingSessionV2.findMany({
    where: {
      isShared: true,
      startTime: { gte: startOfWeek, lt: endOfWeek },
      OR: [
        { hostId: userId },
        { participants: { some: { userId } } },
      ],
    },
    include: {
      host: { select: { id: true, name: true, avatarUrl: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, hcp: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return sessions;
}
