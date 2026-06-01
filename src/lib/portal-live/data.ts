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

import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import type { LiveDrill, LiveSessionData, NextSessionRef } from "./types";

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
      drills,
      totalPlannedReps,
      nextSession,
    },
  };
}

// ── Visnings-helpers (delt mellom skjermer) ─────────────────────────────

export const AXIS_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

/** Formaterer ISO-dato til "ONS 28 MAI" (caps eyebrow). */
export function formatDateEyebrow(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("nb-NO", { weekday: "short", day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(/\.$/, "")
    .replace(/\./g, "");
}

/** Formaterer ISO-dato til "ONS 28 MAI · 14:30" (med klokkeslett). */
export function formatDateTimeEyebrow(iso: string): string {
  const d = new Date(iso);
  const dato = formatDateEyebrow(iso);
  const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${dato} · ${tid}`;
}

/** Sekunder → "MM:SS". */
export function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
