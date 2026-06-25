/**
 * Mapper PlanTemplateSession-rader (ukeNr + dagNr) til Workbench-uke med klokkeslett.
 * Ren funksjon — brukes av apply-template-actions og tester.
 */

import type { PyramidArea } from "@/generated/prisma/client";
import type { Cat } from "@/components/workbench-hybrid/theme";
import type { WeekKey, WbSession } from "@/components/workbench-hybrid/types";

export type TemplateSessionInput = {
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  ukeNr: number;
  /** 1 = mandag … 7 = søndag (schema-konvensjon). */
  dagNr: number;
};

export type ScheduledTemplateSession = {
  dayIndex: number;
  dayKey: WeekKey;
  hour: number;
  minute: number;
  title: string;
  durMin: number;
  area: Cat;
};

const DAY_KEYS: WeekKey[] = ["man", "tir", "ons", "tor", "fre", "lor", "son"];

const AREA_MAP: Record<PyramidArea, Cat> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

/** PlanTemplateSession.dagNr (1–7) → dayIndex (0–6, mandag først). */
export function dagNrToDayIndex(dagNr: number): number | null {
  if (!Number.isInteger(dagNr) || dagNr < 1 || dagNr > 7) return null;
  return dagNr - 1;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Filtrer til én mal-uke og tildel klokkeslett: 09:00 første økt per dag,
 * deretter +varighet (min) for neste på samme dag.
 */
export function scheduleTemplateWeek(
  sessions: TemplateSessionInput[],
  weekNr = 1,
  startHour = 9,
): ScheduledTemplateSession[] {
  const filtered = sessions
    .filter((s) => s.ukeNr === weekNr)
    .map((s) => {
      const dayIndex = dagNrToDayIndex(s.dagNr);
      if (dayIndex == null) return null;
      return {
        dayIndex,
        dayKey: DAY_KEYS[dayIndex]!,
        title: s.title.trim() || "Økt",
        durMin: Math.max(5, Math.min(480, Math.round(s.varighetMin))),
        area: AREA_MAP[s.pyramidArea] ?? "TEK",
      };
    })
    .filter((x): x is Omit<ScheduledTemplateSession, "hour" | "minute"> => x !== null);

  filtered.sort((a, b) => a.dayIndex - b.dayIndex || a.title.localeCompare(b.title, "nb"));

  const minuteCursor = new Map<number, number>();

  return filtered.map((row) => {
    const cursor = minuteCursor.get(row.dayIndex) ?? startHour * 60;
    const hour = Math.floor(cursor / 60);
    const minute = cursor % 60;
    minuteCursor.set(row.dayIndex, cursor + row.durMin);
    return {
      ...row,
      hour,
      minute,
    };
  });
}

/** Bygg WbSession-lister per dag fra planlagte mal-økter (med syntetiske id-er). */
export function templateSessionsToWeekState(
  scheduled: ScheduledTemplateSession[],
  idPrefix = "tpl",
): Record<WeekKey, WbSession[]> {
  const week: Record<WeekKey, WbSession[]> = {
    man: [],
    tir: [],
    ons: [],
    tor: [],
    fre: [],
    lor: [],
    son: [],
  };
  scheduled.forEach((s, i) => {
    week[s.dayKey].push({
      id: `${idPrefix}-${i}`,
      title: s.title,
      dur: s.durMin,
      cat: s.area,
      time: `${pad2(s.hour)}:${pad2(s.minute)}`,
    });
  });
  return week;
}

/** Slå mal-økter inn i eksisterende uke (beholder eksisterende økter). */
export function mergeTemplateIntoWeek(
  existing: Record<WeekKey, WbSession[]>,
  scheduled: ScheduledTemplateSession[],
  idPrefix = "tpl",
): Record<WeekKey, WbSession[]> {
  const added = templateSessionsToWeekState(scheduled, idPrefix);
  const out = { ...existing };
  for (const key of DAY_KEYS) {
    out[key] = [...(existing[key] ?? []), ...(added[key] ?? [])];
  }
  return out;
}