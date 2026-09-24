"use server";

import { canAccessPlayer } from "@/lib/auth/own-or-coached";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { triggerLiveSessionAgent, triggerSwingVideoAnalyst } from "@/lib/agents/triggers";
import { startSession as startWorkbenchSession } from "@/lib/workbench/wb-actions";

/** Starter plan-økt fra brief (PLANNED → ACTIVE) og sender til tapper. */
export async function startPlanSession(sessionId: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.tier === "GRATIS") {
    redirect("/portal/meg/abonnement");
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      plan: { select: { userId: true } },
    },
  });

  if (session) {
    if (session.plan.userId !== user.id) {
      redirect("/portal/planlegge/workbench");
    }

    if (session.status === "COMPLETED") {
      redirect(`/portal/live/${sessionId}/summary`);
    }
    if (session.status === "SKIPPED") {
      redirect(`/portal/tren/${sessionId}`);
    }

    if (session.status === "PLANNED") {
      const nowISO = new Date().toISOString();
      await prisma.trainingPlanSession.update({
        where: { id: sessionId },
        data: {
          status: "ACTIVE",
          liveSnapshot: {
            startedAtISO: nowISO,
            totalSec: 0,
            updatedAtISO: nowISO,
            drills: [],
          } as unknown as Prisma.InputJsonValue,
        },
      });
      void triggerLiveSessionAgent({ userId: user.id, sessionId, kind: "plan-session" });
    }

    revalidatePath("/portal/planlegge/workbench");
    revalidatePath(`/portal/live/${sessionId}/brief`);
    redirect(`/portal/live/${sessionId}/tapper`);
  }

  const wb = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    select: { id: true, playerId: true, status: true },
  });
  if (!wb || wb.playerId !== user.id) {
    redirect("/portal/planlegge/workbench");
  }
  if (wb.status === "COMPLETED") {
    redirect(`/portal/live/${sessionId}/summary`);
  }
  if (wb.status === "SKIPPED" || wb.status === "CANCELLED" || wb.status === "DRAFT") {
    redirect("/portal/planlegge/workbench");
  }
  if (wb.status === "PUBLISHED" || wb.status === "SCHEDULED") {
    const res = await startWorkbenchSession(sessionId);
    if (!res.ok) throw new Error("Økten kunne ikke startes.");
  }

  revalidatePath("/portal");
  revalidatePath(`/portal/live/${sessionId}/brief`);
  redirect(`/portal/live/${sessionId}/tapper`);
}

/* ── Video-notat fra live-panelet (AI Golf Coach) ─────────────────────────
 *
 * `saveDrillNote` (active/actions.ts) forutsetter en SessionDrillInstance —
 * en egen "Sprint 2"-datamodell som ikke skrives noe sted i den faktiske
 * live-flyten (TrainingSessionV2 bruker TrainingDrillV2/DrillLogV2 i stedet).
 * Derfor lagres video-notater her, per øktmodell, i det Json-feltet økta
 * allerede bruker til løpende live-data — enkelt og MVP-riktig.
 */

const VideoNoteSchema = z.object({
  drillId: z.string().nullable(),
  videoUrl: z.string(),
  ts: z.string(),
});
type VideoNote = z.infer<typeof VideoNoteSchema>;

const SaveVideoNoteInput = z.object({
  sessionId: z.string().min(1),
  videoUrl: z.string().url(),
  drillId: z.string().min(1).optional(),
});
export type SaveVideoNoteInput = z.infer<typeof SaveVideoNoteInput>;
export type SaveVideoNoteResult = { ok: true } | { ok: false; error: string };

function lesVideoNotater(raw: Prisma.JsonValue | null | undefined): VideoNote[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const parsed = z.array(VideoNoteSchema).safeParse((raw as Record<string, unknown>).videoNotes);
  return parsed.success ? parsed.data : [];
}

function jsonBunn(raw: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
}

/** Lagrer et video-notat for en aktiv plan-økt (TrainingPlanSession.liveSnapshot). */
export async function savePlanSessionVideoNote(input: SaveVideoNoteInput): Promise<SaveVideoNoteResult> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const parsed = SaveVideoNoteInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Kontroller videolenken og hvilken økt videoen skal lagres på." };
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: { liveSnapshot: true, plan: { select: { userId: true } } },
  });
  if (!session || session.plan.userId !== user.id) {
    return { ok: false, error: "Du har ikke tilgang til denne økten." };
  }

  const notat: VideoNote = {
    drillId: parsed.data.drillId ?? null,
    videoUrl: parsed.data.videoUrl,
    ts: new Date().toISOString(),
  };
  const base = jsonBunn(session.liveSnapshot);
  const notater = [...lesVideoNotater(session.liveSnapshot), notat];

  await prisma.trainingPlanSession.update({
    where: { id: parsed.data.sessionId },
    data: { liveSnapshot: { ...base, videoNotes: notater } as unknown as Prisma.InputJsonValue },
  });

  void triggerSwingVideoAnalyst({
    userId: user.id,
    sessionId: parsed.data.sessionId,
    videoUrl: parsed.data.videoUrl,
    drillId: parsed.data.drillId,
  });

  revalidatePath(`/portal/live/${parsed.data.sessionId}/tapper`);
  return { ok: true };
}

/** Lagrer et video-notat for en aktiv session-v2-økt (TrainingSessionV2.completedSummary). */
export async function saveSessionV2VideoNote(input: SaveVideoNoteInput): Promise<SaveVideoNoteResult> {
  const user = await requirePortalUser();
  const parsed = SaveVideoNoteInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Kontroller videolenken og hvilken økt videoen skal lagres på." };
  }

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: parsed.data.sessionId },
    select: { completedSummary: true, studentId: true, hostId: true, coachId: true },
  });
  if (!session) return { ok: false, error: "Fant ikke økten." };
  const eier =
    session.studentId === user.id || session.hostId === user.id || session.coachId === user.id;
  if (!eier && !(session.studentId && await canAccessPlayer(user, session.studentId))) {
    return { ok: false, error: "Du har ikke tilgang til denne økten." };
  }

  const notat: VideoNote = {
    drillId: parsed.data.drillId ?? null,
    videoUrl: parsed.data.videoUrl,
    ts: new Date().toISOString(),
  };
  const base = jsonBunn(session.completedSummary);
  const notater = [...lesVideoNotater(session.completedSummary), notat];

  await prisma.trainingSessionV2.update({
    where: { id: parsed.data.sessionId },
    data: { completedSummary: { ...base, videoNotes: notater } as unknown as Prisma.InputJsonValue },
  });

  void triggerSwingVideoAnalyst({
    userId: user.id,
    sessionId: parsed.data.sessionId,
    videoUrl: parsed.data.videoUrl,
    drillId: parsed.data.drillId,
  });

  revalidatePath(`/portal/live/${parsed.data.sessionId}/active`);
  return { ok: true };
}

export const SendOktNotatTilCoachInput = z.object({
  sessionId: z.string().min(1),
  tekst: z.string().min(1).max(2000),
  drillNavn: z.string().optional(),
});
export type SendOktNotatTilCoachInput = z.infer<typeof SendOktNotatTilCoachInput>;

/**
 * Sender et notat eller spørsmål direkte fra pågående live-økt til spillerens coach.
 * Varsler coach i AgencyOS-innboksen via notify().
 */
export async function sendOktNotatTilCoach(
  input: SendOktNotatTilCoachInput
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const parsed = SendOktNotatTilCoachInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig notat eller økt." };

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: parsed.data.sessionId },
    select: {
      id: true,
      title: true,
      coachId: true,
      hostId: true,
      studentId: true,
    },
  });

  let coachId = session?.coachId ?? session?.hostId;
  if (!coachId || coachId === user.id) {
    const enrollering = await prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      select: { coachId: true },
    });
    coachId = enrollering?.coachId ?? null;
  }

  if (!coachId) {
    return { ok: false, error: "Du har ingen registrert coach å sende notatet til." };
  }

  const { notify } = await import("@/lib/notifications");
  const prefix = parsed.data.drillNavn ? `[${parsed.data.drillNavn}] ` : "";
  await notify({
    userId: coachId,
    type: "melding",
    title: `${user.name || "Spiller"} sendte et notat fra live-økt`,
    body: `${prefix}${parsed.data.tekst}`,
    link: `/admin/planlegge/workbench?spiller=${user.id}`,
  });

  return { ok: true };
}

