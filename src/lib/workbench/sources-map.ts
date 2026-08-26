/**
 * Kildepanel-mapping (Loop 2T/B5) — Prisma-rader → `SourceItem`.
 *
 * `SourceItem.id` koder hvilken tabell/rad kilden peker til, slik at
 * `createSessionFromSource`/`addDrillFromSource` i wb-actions.ts kan slå den
 * opp igjen uten en egen kobling-tabell: "drill:<exerciseId>",
 * "mal:<sessionId>", "forrige:<sessionId>".
 */

import type { ExerciseDefinition } from "@/generated/prisma/client";
import { AREA_LABEL, PYRAMID_LABEL } from "@/lib/domain/workbench/labels";
import type { AKFormel, PyramidArea, SourceItem, TrainingArea } from "@/lib/domain/workbench/types";
import { mapSession, type WbRow } from "./wb-map";

const PREFIX = { DRILL: "drill", MAL: "mal", FORRIGE: "forrige" } as const;

export function drillSourceId(exerciseId: string): string {
  return `${PREFIX.DRILL}:${exerciseId}`;
}
export function malSourceId(sessionId: string): string {
  return `${PREFIX.MAL}:${sessionId}`;
}
export function forrigeSourceId(sessionId: string): string {
  return `${PREFIX.FORRIGE}:${sessionId}`;
}

export type ParsedSourceId =
  | { kind: "DRILL"; exerciseId: string }
  | { kind: "MAL" | "FORRIGE"; sessionId: string }
  | null;

export function parseSourceId(sourceId: string): ParsedSourceId {
  const i = sourceId.indexOf(":");
  if (i < 0) return null;
  const prefix = sourceId.slice(0, i);
  const id = sourceId.slice(i + 1);
  if (!id) return null;
  if (prefix === PREFIX.DRILL) return { kind: "DRILL", exerciseId: id };
  if (prefix === PREFIX.MAL) return { kind: "MAL", sessionId: id };
  if (prefix === PREFIX.FORRIGE) return { kind: "FORRIGE", sessionId: id };
  return null;
}

/**
 * Øvelsesbanken (`ExerciseDefinition`) bruker ikke det nye TrainingArea-
 * vokabularet (den er skrevet mot NGF/DataGolf-kategorier, ikke Workbench sin
 * finere inndeling). Gir et nøytralt standard-område per pyramide — coach
 * justerer i inspektøren etter å ha dratt drillen inn.
 */
const STANDARD_OMRADE: Record<PyramidArea, TrainingArea> = {
  FYS: "STYRKE",
  TEK: "TEE",
  SLAG: "TEE",
  SPILL: "BANE",
  TURN: "BANE",
};

export function exerciseToSourceItem(rad: ExerciseDefinition): SourceItem {
  const pyramid = rad.pyramidArea as PyramidArea;
  const omrade = STANDARD_OMRADE[pyramid];
  const akFormel: AKFormel = {
    pyramid,
    area: omrade,
    label: `${PYRAMID_LABEL[pyramid]} · ${AREA_LABEL[omrade]}`,
  };
  return {
    id: drillSourceId(rad.id),
    kind: "DRILL",
    title: rad.name,
    subtitle: rad.description ?? undefined,
    pyramid,
    area: omrade,
    durationMinutes: rad.durationMin ?? undefined,
    drill: {
      title: rad.name,
      description: rad.description ?? undefined,
      durationMinutes: rad.durationMin ?? 15,
      akFormel,
      sourceId: rad.id,
    },
    tags: rad.tags,
  };
}

function sessionRowToSourceItem(
  row: WbRow,
  kind: "TEMPLATE" | "PREVIOUS_WEEK",
  id: string,
  subtitle?: string,
): SourceItem {
  const session = mapSession(row);
  return {
    id,
    kind,
    title: session.title,
    subtitle,
    pyramid: session.pyramid,
    durationMinutes: session.durationMinutes,
    templateSessions: [
      {
        playerId: session.playerId,
        coachId: session.coachId,
        date: session.date,
        startMinute: session.startMinute,
        durationMinutes: session.durationMinutes,
        title: session.title,
        pyramid: session.pyramid,
        blockType: session.blockType,
        environment: session.environment,
        notes: session.notes,
        drills: session.drills,
        origin: session.origin,
        createdBy: session.createdBy,
      },
    ],
  };
}

export function templateToSourceItem(row: WbRow): SourceItem {
  return sessionRowToSourceItem(row, "TEMPLATE", malSourceId(row.id));
}

export function previousWeekToSourceItem(row: WbRow, ukedag: string): SourceItem {
  return sessionRowToSourceItem(row, "PREVIOUS_WEEK", forrigeSourceId(row.id), ukedag);
}
