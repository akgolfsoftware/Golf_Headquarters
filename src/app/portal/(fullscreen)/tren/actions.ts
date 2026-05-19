"use server";

// Sprint 2 — Workbench v2 server actions
//
// Alle actions returnerer { success: true; data?: T } | { error: string }.
// Aldri kast exceptions ut til klienten — fang og returnér tydelig norsk feilmelding.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  generateWeekSuggestions,
  type WeekSuggestion as AiWeekSuggestion,
} from "@/lib/ai-plan/week-suggest";
import { parseTrackManCsv } from "@/lib/trackman/parse-csv";

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
  // Enten gi pre-strukturerte sessions, eller send rå CSV-tekst som parses server-side.
  sessions: z.array(TrackManSessionInput).optional(),
  csvText: z.string().optional(),
  environment: TrackManEnvironmentEnum.optional(),
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
  if (
    (!parsed.data.sessions || parsed.data.sessions.length === 0) &&
    !parsed.data.csvText
  ) {
    return { error: "Du må sende enten sessions[] eller csvText" };
  }

  try {
    // Hvis csvText er gitt: parse til strukturerte sessions først.
    let sessions: Array<{
      recordedAt: Date;
      shotCount: number;
      rawJson?: unknown;
      environment?: z.infer<typeof TrackManEnvironmentEnum>;
    }> = parsed.data.sessions ?? [];

    if (parsed.data.csvText) {
      const result = parseTrackManCsv(parsed.data.csvText);
      if (!result.ok) {
        return { error: `CSV-parsing feilet: ${result.error}` };
      }
      sessions = result.sessions.map((s) => ({
        recordedAt: s.recordedAt,
        shotCount: s.shotCount,
        rawJson: s.rawJson,
        environment: parsed.data.environment,
      }));
    }

    if (sessions.length === 0) {
      return { error: "Ingen økter å importere" };
    }

    const created = await prisma.trackManSession.createMany({
      data: sessions.map((s) => ({
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

/* ─── 8. uploadSessionVideo — video til coach via Vercel Blob ─────── */

const UploadVideoInput = z.object({
  drillInstanceId: z.string().min(1),
  // Klient sender enten en allerede-opplastet blob-URL (recommended path), eller
  // base64-kodet video som vi laster opp server-side til Vercel Blob.
  videoBlobUrl: z.string().url().optional(),
  videoBase64: z.string().optional(),
  filename: z.string().max(120).optional(),
  contentType: z.string().max(120).optional(),
});
export type UploadVideoInput = z.infer<typeof UploadVideoInput>;

export async function uploadSessionVideo(
  input: UploadVideoInput,
): Promise<ActionResult<{ noteId: string; videoUrl: string }>> {
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

    // Resolve video-URL:
    // 1) Klient har allerede lastet opp via @vercel/blob/client → URL gitt.
    // 2) Klient sender base64 → vi laster opp server-side hvis token er satt.
    // 3) Fallback: lagre placeholder + advar i log.
    //
    // TODO: thumbnail-generering (ffmpeg-via-edge-function eller @vercel/og).
    //   ENV som trengs: BLOB_READ_WRITE_TOKEN.
    let videoUrl = parsed.data.videoBlobUrl ?? null;

    if (!videoUrl && parsed.data.videoBase64) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.warn(
          "[uploadSessionVideo] BLOB_READ_WRITE_TOKEN mangler — beholder placeholder. " +
            "Sett BLOB_READ_WRITE_TOKEN i .env.local for å aktivere ekte upload.",
        );
        videoUrl = "vercel-blob://placeholder";
      } else {
        // Eksempel-payload: { videoBase64: "data:video/mp4;base64,AAAA...", filename: "swing.mp4" }
        const { put } = await import("@vercel/blob");
        const base64 = parsed.data.videoBase64.replace(
          /^data:[^;]+;base64,/,
          "",
        );
        const buffer = Buffer.from(base64, "base64");
        const filename =
          parsed.data.filename ??
          `session-${parsed.data.drillInstanceId}-${Date.now()}.mp4`;
        const path = `sessions/${user.id}/${filename}`;
        const blob = await put(path, buffer, {
          access: "public",
          contentType: parsed.data.contentType ?? "video/mp4",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        videoUrl = blob.url;
      }
    }

    if (!videoUrl) {
      // Verken URL eller base64 — placeholder for nå.
      videoUrl = "vercel-blob://placeholder";
    }

    const note = await prisma.sessionDrillNote.create({
      data: {
        drillInstanceId: parsed.data.drillInstanceId,
        type: "VIDEO",
        videoUrl,
      },
      select: { id: true, videoUrl: true },
    });

    revalidatePath("/portal/tren");
    return {
      success: true,
      data: { noteId: note.id, videoUrl: note.videoUrl ?? videoUrl },
    };
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

export type WeekSuggestion = AiWeekSuggestion;

export async function aiSuggestWeek(
  input: AiSuggestWeekInput,
): Promise<ActionResult<{ suggestions: WeekSuggestion[]; usedAi: boolean }>> {
  const user = await requirePortalUser();
  const parsed = AiSuggestWeekInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const { suggestions, usedAi } = await generateWeekSuggestions(
      user.id,
      parsed.data.weekStart,
    );
    return { success: true, data: { suggestions, usedAi } };
  } catch (err) {
    console.error("aiSuggestWeek failed", err);
    return { error: "Kunne ikke generere uke-forslag" };
  }
}

// Re-eksporter felles enum-typer for å hjelpe klient-koden.
export const _enums = {
  PyramidAreaEnum,
  SessionNoteTypeEnum,
  PracticeTypeEnum,
  MMiljoEnum,
};
