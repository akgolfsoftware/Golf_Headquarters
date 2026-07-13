"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { triggerLiveSessionAgent, triggerSwingVideoAnalyst } from "@/lib/agents/triggers";

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
  if (!session || session.plan.userId !== user.id) {
    redirect("/portal/planlegge/workbench");
  }

  if (session.status === "COMPLETED" || session.status === "SKIPPED") {
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: { liveSnapshot: true, plan: { select: { userId: true } } },
  });
  if (!session || session.plan.userId !== user.id) {
    return { ok: false, error: "Ikke tilgang" };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: parsed.data.sessionId },
    select: { completedSummary: true, studentId: true, hostId: true, coachId: true },
  });
  if (!session) return { ok: false, error: "Økt ikke funnet" };
  const eier =
    session.studentId === user.id || session.hostId === user.id || session.coachId === user.id;
  if (!eier && user.role !== "ADMIN" && user.role !== "COACH") {
    return { ok: false, error: "Ikke tilgang" };
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
/* ── Bilde-notat (Bølge 5, 2026-07-13) ────────────────────────────────────
 * Bilder fra live-økta (media-knappen + TrackMan-skjermbilde-fallback)
 * lagres som imageNotes i samme JSON-felt som videoNotes — men uten
 * swing-video-analyse (et bilde er ikke en sving). Valgfri kommentar.
 */

const ImageNoteSchema = z.object({
  drillId: z.string().nullable(),
  imageUrl: z.string(),
  comment: z.string().nullable(),
  ts: z.string(),
});
type ImageNote = z.infer<typeof ImageNoteSchema>;

const SaveImageNoteInput = z.object({
  sessionId: z.string().min(1),
  imageUrl: z.string().url(),
  drillId: z.string().min(1).optional(),
  comment: z.string().max(1000).optional(),
});
export type SaveImageNoteInput = z.infer<typeof SaveImageNoteInput>;

function lesBildeNotater(raw: Prisma.JsonValue | null | undefined): ImageNote[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const parsed = z.array(ImageNoteSchema).safeParse((raw as Record<string, unknown>).imageNotes);
  return parsed.success ? parsed.data : [];
}

/** Lagrer et bilde-notat for en session-v2-økt (TrainingSessionV2.completedSummary). */
export async function saveSessionV2ImageNote(input: SaveImageNoteInput): Promise<SaveVideoNoteResult> {
  const user = await requirePortalUser();
  const parsed = SaveImageNoteInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: parsed.data.sessionId },
    select: { completedSummary: true, studentId: true, hostId: true, coachId: true },
  });
  if (!session) return { ok: false, error: "Økt ikke funnet" };
  const eier =
    session.studentId === user.id || session.hostId === user.id || session.coachId === user.id;
  if (!eier && user.role !== "ADMIN" && user.role !== "COACH") {
    return { ok: false, error: "Ikke tilgang" };
  }

  const notat: ImageNote = {
    drillId: parsed.data.drillId ?? null,
    imageUrl: parsed.data.imageUrl,
    comment: parsed.data.comment?.trim() || null,
    ts: new Date().toISOString(),
  };
  const base = jsonBunn(session.completedSummary);
  const notater = [...lesBildeNotater(session.completedSummary), notat];

  await prisma.trainingSessionV2.update({
    where: { id: parsed.data.sessionId },
    data: { completedSummary: { ...base, imageNotes: notater } as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/portal/live/${parsed.data.sessionId}/active`);
  revalidatePath(`/portal/live/${parsed.data.sessionId}/summary`);
  return { ok: true };
}
