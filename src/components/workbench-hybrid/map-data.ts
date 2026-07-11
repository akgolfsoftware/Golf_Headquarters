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
import type { SkillArea } from "@/generated/prisma/client";
import { SKILLAREA_TO_SG, type SgKategori } from "@/lib/workbench/fokus";
import type { PaletteItem } from "./types";
import { PALETTE_LIBRARY } from "./demo-data";
import type { Axis, WeekDay, WeekEvent } from "@/lib/workbench/week-types";
import type { Cat } from "./theme";
import type {
  SeasonPhase,
  SeasonPhaseType,
  WbGoal,
  WbSession,
  WbTournament,
  WeekKey,
  WeekState,
} from "./types";

const AXIS_TO_CAT: Record<Axis, Cat> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

// WorkbenchData.weekDays er MAN..SØN (7). Fasit-uka har 7 nøkler.
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
    compliance: ev.compliance,
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

const MND_SHORT_CAP = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

const LPHASE_TO_TYPE: Record<"GRUNN" | "SPESIAL" | "TURNERING", SeasonPhaseType> = {
  GRUNN: "GRUNN",
  SPESIAL: "SPESIALISERING",
  TURNERING: "TURNERING",
};

function formatDmy(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function priorityToTourType(priority: "MAJOR" | "NORMAL" | "LOCAL"): keyof typeof import("./theme").TOUR_TYPES {
  if (priority === "MAJOR") return "PRESTASJON";
  if (priority === "LOCAL") return "TRENING";
  return "UTVIKLING";
}

/** Turneringer for Årsplan/Måned-tidslinja fra TournamentEntry + dato. */
export function mapTournaments(data: WorkbenchData | undefined): WbTournament[] | null {
  const cal = data?.tournamentCalendar;
  if (!cal || cal.length === 0) return null;
  return cal.map((t) => ({
    title: t.title,
    date: formatDmy(t.startDate),
    days: t.daysUntil,
    dateLabel: `${t.daysUntil} dg`,
    type: priorityToTourType(t.priority),
  }));
}

const DEFAULT_SEASON_PHASES: SeasonPhase[] = [
  {
    type: "GRUNN",
    months: 4,
    span: "Jan–Apr",
    weekly: { FYS: 3, TEK: 3, SLAG: 2, SPILL: 1, TURN: 0 },
    samlinger: [],
  },
  {
    type: "SPESIALISERING",
    months: 4,
    span: "Mai–Aug",
    weekly: { FYS: 2, TEK: 3, SLAG: 3, SPILL: 1, TURN: 0 },
    samlinger: [],
  },
  {
    type: "TURNERING",
    months: 4,
    span: "Sep–Des",
    weekly: { FYS: 2, TEK: 2, SLAG: 2, SPILL: 1, TURN: 2 },
    samlinger: [],
  },
];

function hasActivePlanSignals(data: WorkbenchData | undefined): boolean {
  if (!data) return false;
  if (data.usesV2Sessions) return true;
  if (data.summary && data.summary.sessionCount > 0) return true;
  if (data.pyramid?.some((p) => p.hours > 0)) return true;
  return false;
}

/** Sesong-perioder fra SeasonPlan.periodBlocks → fasit seasonPhases. */
export function mapSeasonPhases(data: WorkbenchData | undefined): SeasonPhase[] | null {
  const blocks = data?.seasonBlocks;
  if (!blocks || blocks.length === 0) {
    return hasActivePlanSignals(data) ? DEFAULT_SEASON_PHASES : null;
  }
  return blocks.map((b) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const startM = start.getMonth();
    const endM = end.getMonth();
    const months = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + endM - startM + 1);
    const span = `${MND_SHORT_CAP[startM]}–${MND_SHORT_CAP[endM]}`;
    const type = LPHASE_TO_TYPE[b.lPhase];
    const weekly: Record<Cat, number> = { FYS: 2, TEK: 3, SLAG: 2, SPILL: 1, TURN: 0 };
    if (type === "TURNERING") weekly.TURN = 2;
    if (type === "GRUNN") {
      weekly.FYS = 3;
      weekly.TURN = 0;
    }
    return { id: b.id, type, months, span, weekly, samlinger: [] };
  });
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

/** Standardøkter: ekte mal-økter fra DB, ellers startbibliotek. Fokus-treff øverst. */
export function mapPalette(data: WorkbenchData | undefined): PaletteItem[] {
  const items = data?.paletteItems;
  const base: PaletteItem[] =
    !items || items.length === 0
      ? PALETTE_LIBRARY
      : items.map((p) => ({
          pid: p.pid,
          title: p.title,
          dur: p.dur,
          cat: p.cat,
          skillArea: p.skillArea,
          omr: "PUTT0_3",
          m: "M2",
          pr: "PR2",
          cs: "CS80",
          lfase: "L_BALL",
          praksis: "BLOKK",
        }));
  return sortPaletteByFokus(base, data?.fokus?.kategori ?? null);
}

/**
 * Rangerer paletten etter fokus: mal-økter hvis skillArea matcher fokus-SG-kategorien
 * legges øverst; innbyrdes rekkefølge bevares (stabil). Uten fokus-kategori: uendret.
 */
export function sortPaletteByFokus(
  items: PaletteItem[],
  kategori: SgKategori | null,
): PaletteItem[] {
  if (!kategori) return items;
  const treff = (p: PaletteItem): boolean =>
    p.skillArea != null && SKILLAREA_TO_SG[p.skillArea as SkillArea] === kategori;
  return [...items.filter(treff), ...items.filter((p) => !treff(p))];
}

/** Gruppetrening-linje for innsiktsstripe. */
export function mapGroupInsightLine(data: WorkbenchData | undefined): string | null {
  const slots = data?.groupSlots;
  if (!slots || slots.length === 0) return null;
  const first = slots[0];
  const d = new Date(first.startAt);
  const ukedag = ["søn", "man", "tir", "ons", "tor", "fre", "lør"][d.getDay()];
  const tid = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const loc = first.location ? ` · ${first.location}` : "";
  const flere = slots.length > 1 ? ` (+${slots.length - 1} til)` : "";
  return `Gruppetrening ${first.groupName}: ${ukedag} ${tid}${loc}${flere}`;
}
