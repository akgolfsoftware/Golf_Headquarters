/**
 * PlayerHQ · Live-økt — server-side data-loader.
 *
 * Henter en `trainingPlanSession` med drills + exercise, og utleder en
 * view-modell (`LiveSessionData`) for live-økt-skjermene. Eierskap-/tilgang
 * håndteres av kalleren via `requirePortalUser` + sjekken her returnerer
 * `null` ved manglende tilgang slik at pages kan `notFound()`/`redirect()`.
 *
 * Ingen falske tall: planlagte reps utledes fra coach-plan (repsSets/reps).
 * Mangler verdi → 0. Faktiske reps logges klient-side under økta.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  LiveDrill,
  LiveSessionData,
  LiveSnapshotData,
  NextSessionRef,
  OngoingSessionRef,
} from "./types";

/** Zod-skjema for liveSnapshot (Json-blob fra DB MÅ valideres ved read). */
export const LiveSnapshotSchema = z.object({
  startedAtISO: z.string(),
  totalSec: z.number(),
  updatedAtISO: z.string(),
  drills: z.array(
    z.object({
      drillId: z.string(),
      reps: z.number(),
      elapsedSec: z.number(),
      status: z.enum(["done", "active", "queued"]),
    }),
  ),
});

/** Trygt parse av liveSnapshot-Json. Returnerer null ved manglende/ugyldig blob. */
export function parseLiveSnapshot(json: unknown): LiveSnapshotData | null {
  if (json == null) return null;
  const parsed = LiveSnapshotSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

/**
 * Parser planlagte reps fra en SessionDrill.
 * Prioriterer eksplisitte `reps`×`sets`, faller tilbake til `repsSets`-streng
 * ("3 × 10", "30", "3x10"). Returnerer 0 hvis ingenting kan tolkes.
 */
export function parsePlannedReps(d: {
  reps: number | null;
  sets: number | null;
  repsSets: string;
}): number {
  if (d.reps != null && d.reps > 0) {
    const sets = d.sets != null && d.sets > 0 ? d.sets : 1;
    return d.reps * sets;
  }
  const m = d.repsSets.match(/(\d+)\s*[x×*]\s*(\d+)/i);
  if (m) return Number(m[1]) * Number(m[2]);
  const n = parseInt(d.repsSets, 10);
  return Number.isNaN(n) ? 0 : n;
}

type AccessResult =
  | { ok: true; data: LiveSessionData }
  | { ok: false; reason: "notfound" | "forbidden" };

/**
 * Laster live-økt-data og verifiserer eierskap.
 * @param sessionId  TrainingPlanSession-id
 * @param userId     Innlogget bruker-id
 * @param isCoach    Er bruker COACH/ADMIN (ser alle økter)
 */
export async function loadLiveSession(
  sessionId: string,
  userId: string,
  isCoach: boolean,
): Promise<AccessResult> {
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { id: true, userId: true, name: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!session) return { ok: false, reason: "notfound" };

  const erEier = session.plan.userId === userId;
  if (!erEier && !isCoach) return { ok: false, reason: "forbidden" };

  const drills: LiveDrill[] = session.drills.map((d, i) => ({
    id: d.id,
    index: i + 1,
    name: d.exercise.name,
    axis: d.exercise.pyramidArea,
    lPhase: d.exercise.lPhase,
    plannedReps: parsePlannedReps(d),
    repsLabel: d.repsSets,
    csTarget: d.csTarget ?? null,
    notes: d.notes ?? null,
  }));

  const totalPlannedReps = drills.reduce((sum, d) => sum + d.plannedReps, 0);

  // Neste planlagte økt i samme plan etter denne (for oppsummering-CTA).
  const next = await prisma.trainingPlanSession.findFirst({
    where: {
      planId: session.planId,
      scheduledAt: { gt: session.scheduledAt },
      status: "PLANNED",
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      title: true,
      pyramidArea: true,
      durationMin: true,
      scheduledAt: true,
    },
  });

  const nextSession: NextSessionRef | null = next
    ? {
        id: next.id,
        title: next.title,
        axis: next.pyramidArea,
        durationMin: next.durationMin,
        scheduledAtISO: next.scheduledAt.toISOString(),
      }
    : null;

  return {
    ok: true,
    data: {
      sessionId: session.id,
      planId: session.plan.id,
      planName: session.plan.name,
      title: session.title,
      rationale: session.rationale,
      axis: session.pyramidArea,
      durationMin: session.durationMin,
      scheduledAtISO: session.scheduledAt.toISOString(),
      completed: session.status === "COMPLETED",
      status: session.status,
      liveSnapshot: parseLiveSnapshot(session.liveSnapshot),
      drills,
      totalPlannedReps,
      nextSession,
    },
  };
}

/**
 * Finner brukerens pågående økt (ACTIVE/PAUSED) for «Fortsett pågående økt?».
 * Sorterer på updatedAt DESC og returnerer nyligste. Ved mer enn én pågående
 * økt logges WARN (skal normalt ikke skje) — «to pågående økter»-UI er ikke i
 * scope for denne flyten, sist-oppdaterte vinner.
 *
 * @param userId  Innlogget spillers id (sjekkes på userId, ikke sessionId).
 */
export async function findOngoingSession(
  userId: string,
): Promise<OngoingSessionRef | null> {
  const ongoing = await prisma.trainingPlanSession.findMany({
    where: { plan: { userId }, status: { in: ["ACTIVE", "PAUSED"] } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true },
    take: 2,
  });

  if (ongoing.length === 0) return null;
  if (ongoing.length > 1) {
    console.warn(
      `[findOngoingSession] Bruker ${userId} har ${ongoing.length}+ pågående økter — returnerer nyligste (${ongoing[0].id}).`,
    );
  }

  const latest = ongoing[0];
  return {
    sessionId: latest.id,
    title: latest.title,
    status: latest.status as "ACTIVE" | "PAUSED",
  };
}

// Visnings-helpers (AXIS_LABEL, formatDateEyebrow, formatDateTimeEyebrow,
// fmtMSS) er flyttet til ./format (client-safe — uten Prisma-import).
