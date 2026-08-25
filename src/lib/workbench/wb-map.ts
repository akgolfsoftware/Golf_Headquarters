/**
 * Mapping mellom Prisma-radene (workbench_sessions / workbench_drills) og
 * domenetypene i src/lib/domain/workbench. Rene funksjoner — ingen I/O, så
 * de kan enhetstestes uten database.
 */

import type {
  WorkbenchDrill as WorkbenchDrillRow,
  WorkbenchSession as WorkbenchSessionRow,
} from "@/generated/prisma/client";
import type { Drill, WorkbenchSession } from "@/lib/domain/workbench/types";
import {
  ApprovalStatusSchema,
  BlockTypeSchema,
  EnvironmentSchema,
  PracticeTypeSchema,
  PyramidAreaSchema,
  SessionOriginSchema,
  SessionStatusSchema,
  parseAkFormel,
} from "@/lib/domain/workbench/schemas";

export type WbRow = WorkbenchSessionRow & { drills: WorkbenchDrillRow[] };

/**
 * «YYYY-MM-DD» → Date. UTC-midnatt, aldri serverens lokale midnatt — ellers
 * sklir datoen én dag bakover når actionen kjøres fra en maskin i Oslo
 * (gotcha: dato-strenger MÅ bruke UTC-midnatt).
 */
export function tilDatoKolonne(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Date (@db.Date, UTC-midnatt) → «YYYY-MM-DD». */
export function fraDatoKolonne(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mapDrill(row: WorkbenchDrillRow): Drill {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    durationMinutes: row.durationMinutes,
    akFormel: parseAkFormel(row.akFormel, row.title),
    techniqueFocus: row.techniqueFocus ?? undefined,
    sourceId: row.sourceId ?? undefined,
    order: row.sortOrder,
  };
}

export function mapSession(row: WbRow): WorkbenchSession {
  const status = SessionStatusSchema.safeParse(row.status);
  const pyramid = PyramidAreaSchema.safeParse(row.pyramid);
  const blockType = BlockTypeSchema.safeParse(row.blockType);
  const origin = SessionOriginSchema.safeParse(row.origin);
  const environment = EnvironmentSchema.safeParse(row.environment);
  const practiceType = PracticeTypeSchema.safeParse(row.practiceType);
  const approvalStatus = ApprovalStatusSchema.safeParse(row.approvalStatus);

  return {
    id: row.id,
    playerId: row.playerId,
    coachId: row.coachId,
    groupId: row.groupId ?? undefined,
    sourceGroupSessionId: row.sourceGroupSessionId ?? undefined,
    date: fraDatoKolonne(row.date),
    startMinute: row.startMinute,
    durationMinutes: row.durationMinutes,
    title: row.title,
    // Ugyldig lagret verdi skal aldri velte uke-lastingen — fall tilbake på
    // det mest nøytrale, og la coachen rette i UI.
    pyramid: pyramid.success ? pyramid.data : "TEK",
    status: status.success ? status.data : "DRAFT",
    blockType: blockType.success ? blockType.data : "OEKT",
    environment: environment.success ? environment.data : undefined,
    practiceType: practiceType.success ? practiceType.data : undefined,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    drills: [...row.drills]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapDrill),
    origin: origin.success ? origin.data : "COACH",
    needsPlayerApproval: row.needsPlayerApproval,
    approvalStatus: approvalStatus.success ? approvalStatus.data : undefined,
    localOverride: row.localOverride,
    publishedAt: row.publishedAt?.toISOString(),
    publishedBy: row.publishedBy ?? undefined,
    isAgentProposal: row.isAgentProposal,
    planActionId: row.planActionId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy:
      row.createdBy === "PLAYER" || row.createdBy === "AGENT"
        ? row.createdBy
        : "COACH",
  };
}

/** Statusene spilleren har lov til å se. DRAFT er ALDRI blant dem. */
export const SPILLER_SYNLIGE_STATUSER = [
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;
