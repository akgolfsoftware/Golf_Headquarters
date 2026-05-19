"use server";

// Sprint 2 — Live Session Logger actions (live-active-client.tsx)
//
// 15. logRep         — legg til reps i aktiv sett
// 16. completeSet    — markér sett ferdig
// 17. addSet         — legg til ny sett
// 18. addDrill       — legg til drill mid-økt
// 19. saveDrillNote  — notat til seg selv
// 20. finishSession  — avslutt økt + notifiser coach

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const PyramidAreaEnum = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const SessionNoteTypeEnum = z.enum(["SELF", "COACH_QUESTION", "VIDEO"]);

/* ─── Felles eierskap-sjekk for en drill-instans ───────────────────── */

type DrillInstanceCheck =
  | { error: string; instance?: never }
  | {
      error?: never;
      instance: {
        id: string;
        sessionId: string;
        session: { studentId: string | null };
      };
    };

async function verifyDrillInstance(
  drillInstanceId: string,
  userId: string,
  role: string,
): Promise<DrillInstanceCheck> {
  const inst = await prisma.sessionDrillInstance.findUnique({
    where: { id: drillInstanceId },
    select: {
      id: true,
      sessionId: true,
      session: { select: { studentId: true } },
    },
  });
  if (!inst) return { error: "Drill-instans ikke funnet" };
  if (
    inst.session.studentId !== userId &&
    role !== "ADMIN" &&
    role !== "COACH"
  ) {
    return { error: "Ikke tilgang" };
  }
  return { instance: inst };
}

type SessionCheck =
  | { error: string; session?: never }
  | {
      error?: never;
      session: {
        id: string;
        studentId: string | null;
        coachId: string;
        title: string;
        notes: string | null;
      };
    };

async function verifySession(
  sessionId: string,
  userId: string,
  role: string,
): Promise<SessionCheck> {
  const sess = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: { id: true, studentId: true, coachId: true, title: true, notes: true },
  });
  if (!sess) return { error: "Økt ikke funnet" };
  if (
    sess.studentId !== userId &&
    role !== "ADMIN" &&
    role !== "COACH"
  ) {
    return { error: "Ikke tilgang" };
  }
  return { session: sess };
}

/* ─── 15. logRep — legg til reps i sett ────────────────────────────── */

const LogRepInput = z.object({
  setId: z.string().min(1),
  addReps: z.number().int().positive().max(1000),
});
export type LogRepInput = z.infer<typeof LogRepInput>;

export async function logRep(
  input: LogRepInput,
): Promise<ActionResult<{ newReps: number }>> {
  const user = await requirePortalUser();
  const parsed = LogRepInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const set = await prisma.sessionSet.findUnique({
      where: { id: parsed.data.setId },
      select: { id: true, drillInstanceId: true, reps: true },
    });
    if (!set) return { error: "Sett ikke funnet" };
    const owns = await verifyDrillInstance(set.drillInstanceId, user.id, user.role);
    if (owns.error) return { error: owns.error };

    const updated = await prisma.sessionSet.update({
      where: { id: parsed.data.setId },
      data: { reps: { increment: parsed.data.addReps } },
      select: { reps: true },
    });

    return { success: true, data: { newReps: updated.reps } };
  } catch (err) {
    console.error("logRep failed", err);
    return { error: "Kunne ikke logge rep" };
  }
}

/* ─── 16. completeSet — markér sett ferdig ─────────────────────────── */

const CompleteSetInput = z.object({
  setId: z.string().min(1),
});
export type CompleteSetInput = z.infer<typeof CompleteSetInput>;

export async function completeSet(
  input: CompleteSetInput,
): Promise<ActionResult<{ setId: string }>> {
  const user = await requirePortalUser();
  const parsed = CompleteSetInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const set = await prisma.sessionSet.findUnique({
      where: { id: parsed.data.setId },
      select: { id: true, drillInstanceId: true },
    });
    if (!set) return { error: "Sett ikke funnet" };
    const owns = await verifyDrillInstance(set.drillInstanceId, user.id, user.role);
    if (owns.error) return { error: owns.error };

    await prisma.sessionSet.update({
      where: { id: parsed.data.setId },
      data: { completedAt: new Date() },
    });

    return { success: true, data: { setId: parsed.data.setId } };
  } catch (err) {
    console.error("completeSet failed", err);
    return { error: "Kunne ikke markere sett ferdig" };
  }
}

/* ─── 17. addSet — legg til ny sett ────────────────────────────────── */

const AddSetInput = z.object({
  drillInstanceId: z.string().min(1),
  plannedReps: z.number().int().positive().max(1000).optional(),
});
export type AddSetInput = z.infer<typeof AddSetInput>;

export async function addSet(
  input: AddSetInput,
): Promise<ActionResult<{ setId: string; setNumber: number }>> {
  const user = await requirePortalUser();
  const parsed = AddSetInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const owns = await verifyDrillInstance(
      parsed.data.drillInstanceId,
      user.id,
      user.role,
    );
    if (owns.error) return { error: owns.error };

    const last = await prisma.sessionSet.findFirst({
      where: { drillInstanceId: parsed.data.drillInstanceId },
      orderBy: { setNumber: "desc" },
      select: { setNumber: true },
    });
    const setNumber = (last?.setNumber ?? 0) + 1;

    const created = await prisma.sessionSet.create({
      data: {
        drillInstanceId: parsed.data.drillInstanceId,
        setNumber,
        reps: 0,
      },
      select: { id: true, setNumber: true },
    });

    return { success: true, data: { setId: created.id, setNumber: created.setNumber } };
  } catch (err) {
    console.error("addSet failed", err);
    return { error: "Kunne ikke legge til sett" };
  }
}

/* ─── 18. addDrill — legg til drill mid-økt ────────────────────────── */

const AddDrillInput = z.object({
  sessionId: z.string().min(1),
  drillName: z.string().min(1).max(120),
  pyramidArea: PyramidAreaEnum,
  plannedReps: z.number().int().positive().max(1000).optional(),
  plannedSets: z.number().int().positive().max(50).optional(),
});
export type AddDrillInput = z.infer<typeof AddDrillInput>;

export async function addDrill(
  input: AddDrillInput,
): Promise<ActionResult<{ drillInstanceId: string }>> {
  const user = await requirePortalUser();
  const parsed = AddDrillInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const owns = await verifySession(parsed.data.sessionId, user.id, user.role);
    if (owns.error) return { error: owns.error };

    const last = await prisma.sessionDrillInstance.findFirst({
      where: { sessionId: parsed.data.sessionId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    const orderIndex = (last?.orderIndex ?? -1) + 1;

    const created = await prisma.sessionDrillInstance.create({
      data: {
        sessionId: parsed.data.sessionId,
        drillName: parsed.data.drillName,
        orderIndex,
        pyramideArea: parsed.data.pyramidArea,
        plannedReps: parsed.data.plannedReps ?? null,
        plannedSets: parsed.data.plannedSets ?? null,
      },
      select: { id: true },
    });

    revalidatePath(`/portal/live/${parsed.data.sessionId}/active`);
    return { success: true, data: { drillInstanceId: created.id } };
  } catch (err) {
    console.error("addDrill failed", err);
    return { error: "Kunne ikke legge til drill" };
  }
}

/* ─── 19. saveDrillNote — notat til seg selv / coach / video ───────── */

const DrillNoteInput = z.object({
  drillInstanceId: z.string().min(1),
  type: SessionNoteTypeEnum,
  content: z.string().max(2000).optional(),
  videoUrl: z.string().url().optional(),
});
export type DrillNoteInput = z.infer<typeof DrillNoteInput>;

export async function saveDrillNote(
  input: DrillNoteInput,
): Promise<ActionResult<{ noteId: string }>> {
  const user = await requirePortalUser();
  const parsed = DrillNoteInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }
  if (parsed.data.type !== "VIDEO" && !parsed.data.content) {
    return { error: "Innhold kreves for tekst-notat" };
  }
  if (parsed.data.type === "VIDEO" && !parsed.data.videoUrl) {
    return { error: "Video-URL kreves for video-notat" };
  }

  try {
    const owns = await verifyDrillInstance(
      parsed.data.drillInstanceId,
      user.id,
      user.role,
    );
    if (owns.error) return { error: owns.error };

    const note = await prisma.sessionDrillNote.create({
      data: {
        drillInstanceId: parsed.data.drillInstanceId,
        type: parsed.data.type,
        content: parsed.data.content ?? null,
        videoUrl: parsed.data.videoUrl ?? null,
      },
      select: { id: true },
    });

    return { success: true, data: { noteId: note.id } };
  } catch (err) {
    console.error("saveDrillNote failed", err);
    return { error: "Kunne ikke lagre notat" };
  }
}

/* ─── 20. finishSession — avslutt økt + notifiser coach ────────────── */

const FinishSessionInput = z.object({
  sessionId: z.string().min(1),
});
export type FinishSessionInput = z.infer<typeof FinishSessionInput>;

export async function finishSession(
  input: FinishSessionInput,
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser();
  const parsed = FinishSessionInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const owns = await verifySession(parsed.data.sessionId, user.id, user.role);
    if (owns.error || !owns.session) return { error: owns.error ?? "Økt ikke funnet" };
    const sess = owns.session;

    // TrainingSessionV2 har (foreløpig) ikke status-felt. Vi markerer
    // fullført ved å sette endTime=now + prefikse notes med [COMPLETED:<ISO>].
    // TODO Sprint 3: legg til SessionStatusV2-enum (PLANNED|ACTIVE|COMPLETED|SKIPPED).
    const now = new Date();
    const completedMarker = `[COMPLETED:${now.toISOString()}]`;
    const existing = sess.notes ?? "";
    const nextNotes = existing.includes("[COMPLETED:")
      ? existing
      : `${completedMarker}${existing ? "\n" + existing : ""}`;

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: {
        endTime: now,
        notes: nextNotes,
        trengerOppmerksomhet: false,
      },
    });

    // Notifiser coach (best-effort).
    try {
      await prisma.notification.create({
        data: {
          userId: sess.coachId,
          type: "session-completed",
          title: `${user.name} fullførte: ${sess.title}`,
          body: "Klar for gjennomgang.",
          link: `/admin/spillere/${user.id}`,
        },
      });
    } catch (e) {
      console.warn("session-completed notification failed", e);
    }

    revalidatePath(`/portal/live/${parsed.data.sessionId}`);
    revalidatePath(`/portal/live/${parsed.data.sessionId}/active`);
    revalidatePath("/portal/tren");
    revalidatePath("/portal");
    return { success: true, data: { sessionId: parsed.data.sessionId } };
  } catch (err) {
    console.error("finishSession failed", err);
    return { error: "Kunne ikke avslutte økt" };
  }
}
