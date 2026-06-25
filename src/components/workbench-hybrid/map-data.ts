/**
 * Adapter: WorkbenchData (ekte Prisma-data fra loadWorkbenchData) → fasitens
 * interne week-modell + sidebar-lister. Brukes når `data` er gitt; ellers faller
 * komponenten tilbake til tom tilstand.
 *
 * Merk: WorkbenchData modellerer en økt som {h, m, durMin, ax, ttl} (WeekEvent),
 * mens fasiten bruker {id, title, dur, cat, time}. Vi mapper aksen→kategori og
 * syntetiserer stabile id-er. AK-formel-feltene finnes ikke i WorkbenchData
 * (ingen kilde i datamodellen) — de blir liggende udefinert og får defaults i
 * inspektøren, akkurat som i fasiten.
 */

import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { Axis, WeekDay, WeekEvent } from "@/lib/workbench/week-types";
import type { Cat } from "./theme";
import type { WbGoal, WbSession, WbTournament, WeekKey, WeekState } from "./types";

const AXIS_TO_CAT: Record<Axis, Cat> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

// WorkbenchData.weekDays er MAN..FRE (5). Fasit-uka har 7 nøkler.
const WEEK_KEYS: WeekKey[] = ["man", "tir", "ons", "tor", "fre", "lor", "son"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function eventToSession(ev: WeekEvent, dayKey: WeekKey, idx: number): WbSession {
  const h = ev.h;
  const m = ev.m ?? 0;
  return {
    // Ekte DB-id når eventen kommer fra Prisma (brukes for persistering),
    // ellers en syntetisk id (demo-data / ennå-ikke-lagrede økter).
    id: ev.id ?? `wb-${dayKey}-${idx}`,
    title: ev.ttl,
    dur: ev.durMin,
    cat: AXIS_TO_CAT[ev.ax],
    time: `${pad2(h)}:${pad2(m)}`,
  };
}

/** Bygg fasit-week fra WorkbenchData.weekDays (eller null hvis ingen). */
export function mapWeek(data: WorkbenchData | undefined): WeekState | null {
  const days = data?.weekDays;
  if (!days || days.length === 0) return null;
  const week: WeekState = { man: [], tir: [], ons: [], tor: [], fre: [], lor: [], son: [] };
  days.forEach((day: WeekDay, i) => {
    const key = WEEK_KEYS[i] ?? "man";
    week[key] = day.events.map((ev, j) => eventToSession(ev, key, j));
  });
  return week;
}

/**
 * Turnering-banner (Uke-toppen): den nærmeste kommende turneringen fra ekte
 * data. Null hvis ingen → komponenten faller tilbake til fasit-demo-banneret.
 */
export function mapWarningBanner(
  data: WorkbenchData | undefined,
): { title: string; meta: string } | null {
  const t = data?.tournaments;
  if (!t || t.length === 0) return null;
  const first = t[0];
  return {
    title: first.tn,
    meta: first.soon ? `om ${first.td} · redusert volum neste uke` : `om ${first.td}`,
  };
}

/** Sidebar-mål fra ekte data. */
export function mapGoals(data: WorkbenchData | undefined): WbGoal[] | null {
  const g = data?.goals;
  if (!g || g.length === 0) return null;
  return g.map((x) => ({
    gn: x.gn,
    gm: x.gm,
    ax: AXIS_TO_CAT[x.ax],
    targetValue: x.targetValue,
    progressPct: x.progressPct,
  }));
}

/**
 * Turneringer for Årsplan/Måned-tidslinja. Disse trenger eksakt dato (DMY) og
 * turneringstype for å plasseres i kalenderen — WorkbenchData modellerer kun
 * "om N dager"-tekst (`td`) uten konkret dato eller type. Vi har derfor ingen
 * brukbar kilde her og returnerer null → komponenten faller tilbake til
 * fasit-demo-turneringene (tydelig demo, ingen oppdiktede datoer).
 */
export function mapTournaments(_data: WorkbenchData | undefined): WbTournament[] | null {
  void _data;
  return null;
}

/** Uke-header (uke-nr fra summary). */
export function mapWeekHead(
  data: WorkbenchData | undefined,
): { weekLabel: string; range: string } | null {
  const n = data?.summary?.weekNumber;
  if (n == null) return null;
  const head = data?.weekHead;
  let range = "";
  if (head && head.length >= 2) {
    const first = head[0];
    const last = head[head.length - 1];
    const mn = first.sub ? ` ${first.sub}` : "";
    range = `${first.date}.–${last.date}.${mn}`;
  }
  return { weekLabel: `Uke ${n}`, range };
}
