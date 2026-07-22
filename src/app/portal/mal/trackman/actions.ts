"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerTrackManAgent } from "@/lib/agents/triggers";
import {
  loadMatchPlan,
  matchShotAgainstPlan,
  type MatchOptions,
} from "@/lib/teknisk-plan/match-shot";
import { updateTmGoalsFromSessionAggregate } from "@/lib/teknisk-plan/update-tm-goals";
import { parseTrackManCsv } from "@/lib/trackman/parse-csv";
import { parseTrackManHtmlReport } from "@/lib/trackman/parse-html-report";
import {
  csvShotsToCanonical,
  htmlReportToCanonical,
  type CanonicalShot,
} from "@/lib/trackman/canonical";
import type { TrackManEnvironment } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export type { TrackManEnvironment };

export type ImportTrackManResult = {
  sessionIds: string[];
  shotCount: number;
  matchedCount: number;
  goalsUpdated: number;
  source: "csv-import" | "html-import";
};

export type ImportTrackManInput = {
  format: "csv" | "html";
  content: string;
  recordedAt: string;
  environment: TrackManEnvironment;
  onBehalfOfUserId?: string;
  preferredTaskId?: string;
  /** 0-baserte indekser for valgte slag (steg 3 i modal). Uten = alle. */
  selectedIndices?: number[];
};

/**
 * Én import-pipeline for CSV og HTML.
 * Parser → CanonicalShot[] → session + shots → match → TM-mål (aggregat) → agent.
 */
export async function importTrackMan(
  input: ImportTrackManInput,
): Promise<ImportTrackManResult> {
  const user = await requireConsentingUser();
  const targetUserId = await resolveTargetUserId(user, input.onBehalfOfUserId);
  const recordedAt = new Date(input.recordedAt);
  const matchOpts: MatchOptions = {
    preferredTaskId: input.preferredTaskId,
    preferFullsving: true,
  };

  let shots: CanonicalShot[];
  let rawJson: Prisma.InputJsonValue;
  let source: "csv-import" | "html-import";

  if (input.format === "csv") {
    const parsed = parseTrackManCsv(input.content);
    if (!parsed.ok) throw new Error(parsed.error);
    if (parsed.sessions.length === 0) {
      throw new Error("Ingen slag funnet i CSV. Sjekk at filen har header + data.");
    }
    // Én session for valgt dato — flat alle dagers slag (bruker overstyrer dato)
    const allCsvShots = parsed.sessions.flatMap((s) => s.rawJson.shots);
    shots = csvShotsToCanonical(allCsvShots);
    rawJson = {
      summary: {
        avgClubSpeed: avg(shots.map((s) => s.clubSpeedMph)),
        avgBallSpeed: avg(shots.map((s) => s.ballSpeedMph)),
        avgSmash: avg(shots.map((s) => s.smashFactor)),
        avgCarry: avg(shots.map((s) => s.carryMeters)),
        maxCarry: maxNum(shots.map((s) => s.carryMeters)),
        clubs: [...new Set(shots.map((s) => s.club))],
      },
      shots: allCsvShots,
    } as Prisma.InputJsonValue;
    source = "csv-import";
  } else {
    const rapport = parseTrackManHtmlReport(input.content);
    shots = htmlReportToCanonical(rapport);
    if (shots.length === 0) {
      throw new Error(
        "Ingen slag funnet i HTML-rapporten. Kontroller at filen er en TrackMan Multi Group Report.",
      );
    }
    rawJson = rapport as unknown as Prisma.InputJsonValue;
    source = "html-import";
  }

  if (input.selectedIndices && input.selectedIndices.length > 0) {
    const set = new Set(input.selectedIndices);
    shots = shots.filter((_, i) => set.has(i));
  }
  if (shots.length === 0) {
    throw new Error("Ingen slag valgt for import.");
  }

  const plan = await loadMatchPlan(targetUserId);

  const created = await prisma.trackManSession.create({
    data: {
      userId: targetUserId,
      recordedAt,
      source,
      shotCount: shots.length,
      rawJson,
      environment: input.environment,
    },
  });

  const matchedByTask = new Map<
    string,
    Array<{
      clubSpeed: number | null;
      ballSpeed: number | null;
      smashFactor: number | null;
      carryDistance: number | null;
      side: number | null;
    }>
  >();

  let matchedCount = 0;
  const shotRows = shots.map((shot, i) => {
    const match = matchShotAgainstPlan(plan, shot.club, matchOpts);
    if (match.taskId) {
      matchedCount++;
      const list = matchedByTask.get(match.taskId) ?? [];
      list.push({
        clubSpeed: shot.clubSpeedMph,
        ballSpeed: shot.ballSpeedMph,
        smashFactor: shot.smashFactor,
        carryDistance: shot.carryMeters,
        side: shot.sideMeters,
      });
      matchedByTask.set(match.taskId, list);
    }
    return {
      sessionId: created.id,
      shotNumber: i + 1,
      club: shot.club,
      clubSpeed: shot.clubSpeedMph,
      ballSpeed: shot.ballSpeedMph,
      smashFactor: shot.smashFactor,
      carryDistance: shot.carryMeters,
      totalDistance: shot.totalMeters,
      launchAngle: shot.launchAngleDeg,
      spinRate: shot.spinRateRpm,
      side: shot.sideMeters,
      faceToPath: shot.faceToPath,
      clubPath: shot.clubPath,
      faceAngle: shot.faceAngle,
      positionTaskId: match.taskId,
      matchSource: match.matchSource,
      matchConfidence: match.matchConfidence,
      recordedAt,
    };
  });

  if (shotRows.length > 0) {
    await prisma.trackManShot.createMany({ data: shotRows });
  }

  let goalsUpdated = 0;
  for (const [taskId, taskShots] of matchedByTask) {
    goalsUpdated += await updateTmGoalsFromSessionAggregate(taskId, taskShots);
  }

  await triggerTrackManAgent(targetUserId);

  revalidatePath("/portal/mal/trackman");
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath("/portal/tren/teknisk-plan");
  if (targetUserId !== user.id) {
    revalidatePath(`/admin/spillere/${targetUserId}`);
    revalidatePath(`/admin/spillere/${targetUserId}/workbench`);
  }

  return {
    sessionIds: [created.id],
    shotCount: shots.length,
    matchedCount,
    goalsUpdated,
    source,
  };
}

/** Bakoverkompatibel wrapper — UI skal bruke importTrackMan. */
export type TrackManCsvInput = {
  recordedAt: string;
  csvContent: string;
  environment: TrackManEnvironment;
  onBehalfOfUserId?: string;
  preferredTaskId?: string;
};

export async function importTrackManCsv(
  input: TrackManCsvInput,
): Promise<ImportTrackManResult> {
  return importTrackMan({
    format: "csv",
    content: input.csvContent,
    recordedAt: input.recordedAt,
    environment: input.environment,
    onBehalfOfUserId: input.onBehalfOfUserId,
    preferredTaskId: input.preferredTaskId,
  });
}

export type TrackManHtmlInput = {
  recordedAt: string;
  htmlContent: string;
  environment: TrackManEnvironment;
  onBehalfOfUserId?: string;
  preferredTaskId?: string;
};

export async function importTrackManHtml(
  input: TrackManHtmlInput,
): Promise<ImportTrackManResult> {
  return importTrackMan({
    format: "html",
    content: input.htmlContent,
    recordedAt: input.recordedAt,
    environment: input.environment,
    onBehalfOfUserId: input.onBehalfOfUserId,
    preferredTaskId: input.preferredTaskId,
  });
}

async function resolveTargetUserId(
  user: { id: string; role: import("@/generated/prisma/client").UserRole },
  onBehalfOfUserId: string | undefined,
): Promise<string> {
  if (!onBehalfOfUserId || onBehalfOfUserId === user.id) return user.id;
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("Kun coach kan importere på vegne av spiller.");
  }
  const target = await prisma.user.findUnique({
    where: { id: onBehalfOfUserId },
    select: { id: true },
  });
  if (!target) throw new Error("Spiller ikke funnet.");
  return target.id;
}

function avg(arr: (number | null)[]): number | null {
  const nums = arr.filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function maxNum(arr: (number | null)[]): number | null {
  const nums = arr.filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return null;
  return Math.round(Math.max(...nums) * 100) / 100;
}
