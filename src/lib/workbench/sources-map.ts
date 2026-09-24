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
import type { AKFormel, Motorikk, PyramidArea, SourceItem, TrainingArea } from "@/lib/domain/workbench/types";
import { mapSession, type WbRow } from "./wb-map";
import type { TekniskPanelOppgave } from "./teknisk-plan-panel-typer";

const PREFIX = { DRILL: "drill", MAL: "mal", FORRIGE: "forrige", TEK: "tek" } as const;

export function drillSourceId(exerciseId: string): string {
  return `${PREFIX.DRILL}:${exerciseId}`;
}
export function malSourceId(sessionId: string): string {
  return `${PREFIX.MAL}:${sessionId}`;
}
export function forrigeSourceId(sessionId: string): string {
  return `${PREFIX.FORRIGE}:${sessionId}`;
}
export function tekSourceId(taskId: string): string {
  return `${PREFIX.TEK}:${taskId}`;
}

export type ParsedSourceId =
  | { kind: "DRILL"; exerciseId: string }
  | { kind: "MAL" | "FORRIGE"; sessionId: string }
  | { kind: "TEK"; taskId: string }
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
  if (prefix === PREFIX.TEK) return { kind: "TEK", taskId: id };
  return null;
}

export function omraadeKodeTilTrainingArea(kode: string | null | undefined): TrainingArea {
  if (!kode) return "TEE";
  if (kode === "TEE_TOTAL") return "TEE";
  return kode as TrainingArea;
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
  const sgTags = rad.skillArea ? [`SG: ${rad.skillArea}`] : [];
  const moradTags = rad.morad ? ["MORAD"] : [];
  const combinedTags = [...new Set([...(rad.tags || []), ...sgTags, ...moradTags])];

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
    tags: combinedTags,
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

export function tekniskOppgaveToSourceItem(oppgave: TekniskPanelOppgave): SourceItem {
  const omrade = omraadeKodeTilTrainingArea(oppgave.omraadeKode);
  const akFormel: AKFormel = {
    pyramid: "TEK",
    area: omrade,
    motorikk: (oppgave.motorikk as Motorikk) ?? undefined,
    label: `Teknisk · ${oppgave.pNummer} ${oppgave.pNavn}`,
  };

  const restTekst =
    oppgave.restTotalt > 0
      ? `Rest: ${oppgave.restTotalt} ${oppgave.repsEnhet ? oppgave.repsEnhet.toLowerCase() : "reps"}`
      : "Mål fullført";

  const subtitle = oppgave.undertekst
    ? `${oppgave.undertekst} · ${restTekst}`
    : restTekst;

  return {
    id: tekSourceId(oppgave.id),
    kind: "TEK",
    title: `${oppgave.pNummer} · ${oppgave.tittel}`,
    subtitle,
    pyramid: "TEK",
    area: omrade,
    durationMinutes: 20,
    drill: {
      title: `${oppgave.pNummer} ${oppgave.tittel}`,
      description: oppgave.dimensjon
        ? `${oppgave.dimensjon}${oppgave.koller.length > 0 ? ` (${oppgave.koller.join(", ")})` : ""}`
        : oppgave.slagNavn ?? undefined,
      durationMinutes: 20,
      techniqueFocus: oppgave.pNummer,
      akFormel,
      sourceId: oppgave.id,
    },
    positionTaskId: oppgave.id,
    tags: [
      oppgave.pNummer,
      ...oppgave.koller,
      ...(oppgave.dimensjon ? [oppgave.dimensjon] : []),
      ...(oppgave.hovedfokus ? ["HOVEDFOKUS"] : []),
    ],
  };
}
