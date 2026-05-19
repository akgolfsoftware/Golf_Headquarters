"use server";

// Sprint 2 — Workbench v2 server actions
//
// Alle actions returnerer { success: true; data?: T } | { error: string }.
// Aldri kast exceptions ut til klienten — fang og returnér tydelig norsk feilmelding.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/* ─── Felles typer ──────────────────────────────────────────────────── */

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const PyramidAreaEnum = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const SessionNoteTypeEnum = z.enum(["SELF", "COACH_QUESTION", "VIDEO"]);
const PracticeTypeEnum = z.enum([
  "BLOKK",
  "RANDOM",
  "KONKURRANSE",
  "SPILL_TEST",
]);
const MMiljoEnum = z.enum(["M0", "M1", "M2", "M3", "M4", "M5"]);

/* ─── 1. askCoach — "Ask coach"-modal ──────────────────────────────── */

const AskCoachInput = z.object({
  subject: z.string().min(1, "Emne kreves").max(120),
  message: z.string().min(10, "Minimum 10 tegn").max(2000),
  attachmentUrls: z.array(z.string().url()).optional(),
  priority: z.enum(["low", "normal", "urgent"]).default("normal").optional(),
});
export type AskCoachInput = z.infer<typeof AskCoachInput>;

export async function askCoach(
  input: AskCoachInput,
): Promise<ActionResult<{ messageId: string }>> {
  const user = await requirePortalUser();
  const parsed = AskCoachInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    // Bruk Notification-modellen som meldings-kanal mot coach for nå.
    // TODO Sprint 3: egen CoachMessage-modell + Vercel Blob for vedlegg.
    const note = await prisma.notification.create({
      data: {
        userId: user.id,
        type: "coach-message",
        title: `Spørsmål fra ${user.name}: ${parsed.data.subject}`,
        body: parsed.data.message,
        link: "/portal/coach",
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/coach");
    return { success: true, data: { messageId: note.id } };
  } catch (err) {
    console.error("askCoach failed", err);
    return { error: "Kunne ikke sende melding til coach" };
  }
}

/* ─── 2. createGoal — "Nytt mål"-modal ─────────────────────────────── */

const CreateGoalInput = z.object({
  title: z.string().min(1, "Tittel kreves").max(200),
  category: z.enum(["OUTCOME", "PROCESS"]),
  type: z.string().min(1).max(60),
  targetValue: z.number().optional(),
  targetDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});
export type CreateGoalInput = z.infer<typeof CreateGoalInput>;

export async function createGoal(
  input: CreateGoalInput,
): Promise<ActionResult<{ goalId: string }>> {
  const user = await requirePortalUser();
  const parsed = CreateGoalInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        category: parsed.data.category,
        type: parsed.data.type,
        targetValue: parsed.data.targetValue ?? null,
        targetDate: parsed.data.targetDate ?? null,
        payload: parsed.data.description
          ? { description: parsed.data.description }
          : undefined,
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/mal");
    return { success: true, data: { goalId: goal.id } };
  } catch (err) {
    console.error("createGoal failed", err);
    return { error: "Kunne ikke opprette mål" };
  }
}

/* ─── 3. editSession — "Endre økt"-modal ───────────────────────────── */

const EditSessionInput = z.object({
  sessionId: z.string().min(1),
  startAt: z.coerce.date().optional(),
  durationMin: z.number().int().positive().max(600).optional(),
  drillId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});
export type EditSessionInput = z.infer<typeof EditSessionInput>;

export async function editSession(
  input: EditSessionInput,
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser();
  const parsed = EditSessionInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const session = await prisma.trainingSessionV2.findUnique({
      where: { id: parsed.data.sessionId },
      select: { id: true, studentId: true, startTime: true, endTime: true },
    });
    if (!session) return { error: "Økt ikke funnet" };
    if (
      session.studentId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "COACH"
    ) {
      return { error: "Ikke tilgang til denne økten" };
    }

    let newStart = session.startTime;
    let newEnd = session.endTime;
    if (parsed.data.startAt) {
      newStart = parsed.data.startAt;
      const lenMin = Math.round(
        (session.endTime.getTime() - session.startTime.getTime()) / 60000,
      );
      newEnd = new Date(
        newStart.getTime() + (parsed.data.durationMin ?? lenMin) * 60000,
      );
    } else if (parsed.data.durationMin) {
      newEnd = new Date(
        session.startTime.getTime() + parsed.data.durationMin * 60000,
      );
    }

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: {
        startTime: newStart,
        endTime: newEnd,
        notes: parsed.data.notes,
      },
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/kalender");
    revalidatePath(`/portal/tren/${parsed.data.sessionId}`);
    return { success: true, data: { sessionId: parsed.data.sessionId } };
  } catch (err) {
    console.error("editSession failed", err);
    return { error: "Kunne ikke endre økt" };
  }
}

/* ─── 4. requestPlanAdjust — "Be om plan-justering" ────────────────── */

const PlanAdjustInput = z.object({
  weekStart: z.coerce.date(),
  description: z.string().min(5).max(2000),
  focusAreas: z.array(PyramidAreaEnum).min(1, "Velg minst ett fokus-område"),
});
export type PlanAdjustInput = z.infer<typeof PlanAdjustInput>;

export async function requestPlanAdjust(
  input: PlanAdjustInput,
): Promise<ActionResult<{ adjustmentId: string }>> {
  const user = await requirePortalUser();
  const parsed = PlanAdjustInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const adjustment = await prisma.planAdjustment.create({
      data: {
        userId: user.id,
        weekStart: parsed.data.weekStart,
        description: parsed.data.description,
        focusAreas: parsed.data.focusAreas,
      },
      select: { id: true },
    });

    // Notifiser coach via Notification (best-effort).
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "plan-adjust",
          title: `${user.name} ber om plan-justering`,
          body: parsed.data.description.slice(0, 200),
          link: `/admin/spillere/${user.id}`,
        },
      });
    } catch (e) {
      console.warn("plan-adjust notification failed", e);
    }

    revalidatePath("/portal/tren");
    return { success: true, data: { adjustmentId: adjustment.id } };
  } catch (err) {
    console.error("requestPlanAdjust failed", err);
    return { error: "Kunne ikke sende plan-justering" };
  }
}

/* ─── 5. logSession — "Logg ny økt"-wizard ─────────────────────────── */

const LogSessionInput = z.object({
  date: z.coerce.date(),
  drillId: z.string().optional(),
  drillName: z.string().min(1).max(120),
  pyramidArea: PyramidAreaEnum,
  durationMin: z.number().int().positive().max(600),
  sets: z
    .array(
      z.object({
        setNumber: z.number().int().positive(),
        reps: z.number().int().nonnegative(),
      }),
    )
    .default([]),
  notes: z.string().max(2000).optional(),
});
export type LogSessionInput = z.infer<typeof LogSessionInput>;

export async function logSession(
  input: LogSessionInput,
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser();
  const parsed = LogSessionInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const start = new Date(parsed.data.date);
    const end = new Date(start.getTime() + parsed.data.durationMin * 60000);

    const session = await prisma.trainingSessionV2.create({
      data: {
        title: parsed.data.drillName,
        studentId: user.id,
        coachId: user.id, // egen-logget økt — TODO: bruk primaryCoachId når tilgjengelig
        startTime: start,
        endTime: end,
        miljo: "M3",
        practiceType: "BLOKK",
        notes: parsed.data.notes,
        isCoachCreated: false,
        drillInstances: {
          create: [
            {
              drillId: parsed.data.drillId ?? null,
              drillName: parsed.data.drillName,
              orderIndex: 0,
              pyramideArea: parsed.data.pyramidArea,
              plannedSets: parsed.data.sets.length || null,
              plannedReps:
                parsed.data.sets[0]?.reps ?? null,
              sets: {
                create: parsed.data.sets.map((s) => ({
                  setNumber: s.setNumber,
                  reps: s.reps,
                  completedAt: new Date(),
                })),
              },
            },
          ],
        },
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/kalender");
    return { success: true, data: { sessionId: session.id } };
  } catch (err) {
    console.error("logSession failed", err);
    return { error: "Kunne ikke logge økt" };
  }
}

/* ─── 6. importTrackMan — TrackMan import-wizard (stub) ────────────── */

const TrackManEnvironmentEnum = z.enum([
  "SIMULATOR_INDOOR",
  "NET_INDOOR",
  "RANGE_OUTDOOR_MAT",
  "RANGE_OUTDOOR_GRASS",
  "COURSE_PRACTICE",
  "COURSE_COMPETITION",
]);
const TrackManSessionInput = z.object({
  recordedAt: z.coerce.date(),
  shotCount: z.number().int().nonnegative().default(0),
  environment: TrackManEnvironmentEnum.optional(),
  rawJson: z.unknown().optional(),
});
const TrackManImportInput = z.object({
  source: z.enum(["csv", "trackman_account"]),
  sessions: z.array(TrackManSessionInput).min(1, "Velg minst én økt"),
});
export type TrackManSessionInput = z.infer<typeof TrackManSessionInput>;
export type TrackManImportInput = z.infer<typeof TrackManImportInput>;

export async function importTrackMan(
  input: TrackManImportInput,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePortalUser();
  const parsed = TrackManImportInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    // TODO Sprint 3: faktisk CSV-parser + TrackMan API-integrasjon.
    const created = await prisma.trackManSession.createMany({
      data: parsed.data.sessions.map((s) => ({
        userId: user.id,
        recordedAt: s.recordedAt,
        source: parsed.data.source === "csv" ? "csv-import" : "api",
        shotCount: s.shotCount,
        environment: s.environment ?? null,
        rawJson: (s.rawJson ?? undefined) as never,
      })),
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/trackman");
    return { success: true, data: { count: created.count } };
  } catch (err) {
    console.error("importTrackMan failed", err);
    return { error: "Kunne ikke importere TrackMan-økter" };
  }
}

/* ─── 7. askCoachQuestion — spørsmål til coach fra live session ────── */

const CoachQuestionInput = z.object({
  drillInstanceId: z.string().min(1),
  content: z.string().min(1).max(2000),
});
export type CoachQuestionInput = z.infer<typeof CoachQuestionInput>;

export async function askCoachQuestion(
  input: CoachQuestionInput,
): Promise<ActionResult<{ noteId: string }>> {
  const user = await requirePortalUser();
  const parsed = CoachQuestionInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const instance = await prisma.sessionDrillInstance.findUnique({
      where: { id: parsed.data.drillInstanceId },
      select: { session: { select: { studentId: true } } },
    });
    if (!instance) return { error: "Drill-instans ikke funnet" };
    if (
      instance.session.studentId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "COACH"
    ) {
      return { error: "Ikke tilgang" };
    }

    const note = await prisma.sessionDrillNote.create({
      data: {
        drillInstanceId: parsed.data.drillInstanceId,
        type: "COACH_QUESTION",
        content: parsed.data.content,
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    return { success: true, data: { noteId: note.id } };
  } catch (err) {
    console.error("askCoachQuestion failed", err);
    return { error: "Kunne ikke sende spørsmål" };
  }
}

/* ─── 8. uploadSessionVideo — video til coach (stub) ───────────────── */

const UploadVideoInput = z.object({
  drillInstanceId: z.string().min(1),
  videoBlobUrl: z.string().optional(), // ekte URL kommer fra klient når Vercel Blob er på plass
});
export type UploadVideoInput = z.infer<typeof UploadVideoInput>;

export async function uploadSessionVideo(
  input: UploadVideoInput,
): Promise<ActionResult<{ noteId: string }>> {
  const user = await requirePortalUser();
  const parsed = UploadVideoInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const instance = await prisma.sessionDrillInstance.findUnique({
      where: { id: parsed.data.drillInstanceId },
      select: { session: { select: { studentId: true } } },
    });
    if (!instance) return { error: "Drill-instans ikke funnet" };
    if (instance.session.studentId !== user.id) {
      return { error: "Ikke tilgang" };
    }

    // TODO Sprint 3: faktisk Vercel Blob-upload + thumbnail-generering.
    const note = await prisma.sessionDrillNote.create({
      data: {
        drillInstanceId: parsed.data.drillInstanceId,
        type: "VIDEO",
        videoUrl: parsed.data.videoBlobUrl ?? "vercel-blob://placeholder",
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    return { success: true, data: { noteId: note.id } };
  } catch (err) {
    console.error("uploadSessionVideo failed", err);
    return { error: "Kunne ikke laste opp video" };
  }
}

/* ─── 9. requestSession — "Be om økt fra coach" ────────────────────── */

const SessionRequestInput = z.object({
  preferredArea: PyramidAreaEnum.optional(),
  preferredDate: z.coerce.date().optional(),
  preferredTime: z.string().max(40).optional(),
  durationMin: z.number().int().positive().max(600).optional(),
  reason: z.string().min(5).max(2000),
});
export type SessionRequestInput = z.infer<typeof SessionRequestInput>;

export async function requestSession(
  input: SessionRequestInput,
): Promise<ActionResult<{ requestId: string }>> {
  const user = await requirePortalUser();
  const parsed = SessionRequestInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const req = await prisma.sessionRequest.create({
      data: {
        userId: user.id,
        preferredArea: parsed.data.preferredArea ?? null,
        preferredDate: parsed.data.preferredDate ?? null,
        preferredTime: parsed.data.preferredTime ?? null,
        durationMin: parsed.data.durationMin ?? null,
        reason: parsed.data.reason,
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren");
    revalidatePath("/portal/coach");
    return { success: true, data: { requestId: req.id } };
  } catch (err) {
    console.error("requestSession failed", err);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

/* ─── 10. aiSuggestWeek — AI-foreslå uke (stub) ────────────────────── */

const AiSuggestWeekInput = z.object({
  weekStart: z.coerce.date(),
});
export type AiSuggestWeekInput = z.infer<typeof AiSuggestWeekInput>;

export type WeekSuggestion = {
  variant: "konservativ" | "standard" | "aggressiv";
  totalSessions: number;
  focusBlend: string;
  sessions: Array<{
    day: number; // 0=mandag
    title: string;
    pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
    durationMin: number;
  }>;
};

export async function aiSuggestWeek(
  input: AiSuggestWeekInput,
): Promise<ActionResult<{ suggestions: WeekSuggestion[] }>> {
  await requirePortalUser();
  const parsed = AiSuggestWeekInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  // TODO Sprint 3: kall faktisk AI Gateway med spiller-kontekst + ukens fokus.
  const suggestions: WeekSuggestion[] = [
    {
      variant: "konservativ",
      totalSessions: 5,
      focusBlend: "TEK 40 % · SLAG 30 % · SPILL 30 %",
      sessions: [
        { day: 0, title: "Tek — grunnbevegelse", pyramidArea: "TEK", durationMin: 60 },
        { day: 1, title: "Slag — banespill", pyramidArea: "SLAG", durationMin: 75 },
        { day: 3, title: "Tek — kort spill", pyramidArea: "TEK", durationMin: 60 },
        { day: 4, title: "Spill — runde 9 hull", pyramidArea: "SPILL", durationMin: 120 },
        { day: 6, title: "FYS — restitusjon", pyramidArea: "FYS", durationMin: 45 },
      ],
    },
    {
      variant: "standard",
      totalSessions: 6,
      focusBlend: "TEK 30 % · SLAG 30 % · SPILL 25 % · FYS 15 %",
      sessions: [
        { day: 0, title: "FYS — styrke", pyramidArea: "FYS", durationMin: 60 },
        { day: 1, title: "Tek — putting", pyramidArea: "TEK", durationMin: 60 },
        { day: 2, title: "Slag — jern", pyramidArea: "SLAG", durationMin: 75 },
        { day: 3, title: "Tek — chip", pyramidArea: "TEK", durationMin: 60 },
        { day: 4, title: "Spill — runde 18 hull", pyramidArea: "SPILL", durationMin: 240 },
        { day: 5, title: "Slag — wedge under press", pyramidArea: "SLAG", durationMin: 60 },
      ],
    },
    {
      variant: "aggressiv",
      totalSessions: 7,
      focusBlend: "SLAG 35 % · SPILL 25 % · TEK 20 % · TURN 10 % · FYS 10 %",
      sessions: [
        { day: 0, title: "FYS — styrke", pyramidArea: "FYS", durationMin: 60 },
        { day: 1, title: "Slag — driving", pyramidArea: "SLAG", durationMin: 90 },
        { day: 2, title: "Tek — putting", pyramidArea: "TEK", durationMin: 60 },
        { day: 3, title: "Slag — jern under press", pyramidArea: "SLAG", durationMin: 90 },
        { day: 4, title: "Spill — runde 18 hull", pyramidArea: "SPILL", durationMin: 240 },
        { day: 5, title: "Turn — simulering", pyramidArea: "TURN", durationMin: 90 },
        { day: 6, title: "Tek — kort spill", pyramidArea: "TEK", durationMin: 60 },
      ],
    },
  ];

  return { success: true, data: { suggestions } };
}

// Re-eksporter felles enum-typer for å hjelpe klient-koden.
export const _enums = {
  PyramidAreaEnum,
  SessionNoteTypeEnum,
  PracticeTypeEnum,
  MMiljoEnum,
};
