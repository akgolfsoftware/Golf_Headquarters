/**
 * Norwegian UI strings for Workbench — single source of truth.
 * Never hard-code Norwegian in components; import from here.
 */

import type { PyramidArea, SessionStatus, BlockType, SourceFilter } from "./types";

export const PYRAMID_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export const STATUS_LABEL: Record<SessionStatus, string> = {
  DRAFT: "Utkast",
  SCHEDULED: "Planlagt",
  PUBLISHED: "Publisert",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

export const BLOCK_LABEL: Record<BlockType, string> = {
  OEKT: "Økt",
  SKOLE: "Skole",
  BOOKING: "Booking",
  TURNERING: "Turnering",
  REISE: "Reise",
  TEST: "Test",
  SJEKKPUNKT: "Sjekkpunkt",
  HELSE: "Helse",
  GRUPPEOEKT: "Gruppeøkt",
};

export const SOURCE_FILTER_LABEL: Record<SourceFilter, string> = {
  OEKTER: "Økter",
  SKOLE: "Skole",
  BOOKING: "Booking",
  TURNERING: "Turnering",
  TESTER: "Tester",
  HELSE: "Helse",
  GRUPPE: "Gruppe",
};

export const UI = {
  // Shell
  titleAgency: "Workbench",
  titlePlayer: "Min uke",
  weekNavPrev: "Forrige uke",
  weekNavNext: "Neste uke",
  today: "I dag",

  // Actions
  createSession: "Ny økt",
  moveSession: "Flytt",
  publish: "Publiser",
  publishWeek: "Publiser uke",
  unpublish: "Trekk tilbake",
  save: "Lagre",
  cancel: "Avbryt",
  delete: "Slett",
  addDrill: "Legg til drill",
  fromSources: "Fra kilder",

  // Empty
  emptyWeekTitle: "Ingen økter denne uken",
  emptyWeekBody: "Opprett en økt eller dra inn fra kilder til venstre.",
  emptySources: "Ingen kilder å vise",
  emptyDrills: "Ingen drills ennå — legg til fra kilder eller lag ny.",

  // Inspector
  inspectorTitle: "Økt",
  duration: "Varighet",
  start: "Start",
  pyramid: "Område",
  notes: "Notater",
  drills: "Drills",
  publishedAt: "Publisert",
  draftBadge: "Utkast — kun synlig for deg",

  // Publish flow
  publishConfirmTitle: "Publiser til spilleren?",
  publishConfirmBody:
    "Økten blir synlig i spillerens «I dag» og plan. Du kan trekke den tilbake senere.",
  publishSuccess: "Publisert",
  alreadyPublished: "Allerede publisert",

  // Budget
  budgetLabel: (plannedH: string, targetH: string) =>
    `Ukevolum ${plannedH} t · mål ${targetH} t`,

  // Conflict
  overlapWarn: "Overlapp med annen økt",

  // Sources panel
  sourcesTitle: "Kilder",
  sourcesDrills: "Øvelsesbank",
  sourcesTemplates: "Maler",
  sourcesPrograms: "Programmer",
  sourcesPrevious: "Tidligere uker",
  dragHint: "Dra inn i uken",

  // Player consumption
  playerNoSessions: "Ingen planlagte økter i dag",
  playerNextSession: "Neste økt",
  startSession: "Start økt",
  completeSession: "Fullfør økt",
  skipSession: "Hopp over",
  sessionNotFoundTitle: "Fant ikke økten",
  sessionNotFoundBody: "Den finnes ikke, eller er ikke delt med deg ennå.",
  sessionCompletedTitle: "Økt fullført",
  sessionSkippedTitle: "Hoppet over",
  backToToday: "Tilbake til I dag",
} as const;

export function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min} min`;
  if (min === 0) return `${h} t`;
  return `${h} t ${min} min`;
}

export function formatTime(minute: number): string {
  const h = Math.floor(minute / 60)
    .toString()
    .padStart(2, "0");
  const m = (minute % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function formatHours(minutes: number): string {
  const h = minutes / 60;
  return h % 1 === 0 ? h.toFixed(0) : h.toFixed(1).replace(".", ",");
}
