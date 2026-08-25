/**
 * Norwegian UI strings for Workbench — single source of truth.
 * Never hard-code Norwegian in components; import from here.
 */

import type {
  PyramidArea,
  SessionStatus,
  BlockType,
  SourceFilter,
  TrainingArea,
} from "./types";

export const PYRAMID_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export const AREA_LABEL: Record<TrainingArea, string> = {
  TEE: "Tee",
  INNSPILL_200: "Innspill 200 m",
  INNSPILL_150: "Innspill 150 m",
  INNSPILL_100: "Innspill 100 m",
  INNSPILL_50: "Innspill 50 m",
  CHIP: "Chip",
  PITCH: "Pitch",
  LOB: "Lob",
  BUNKER: "Bunker",
  PUTT_0_3: "Putt 0–3 m",
  PUTT_3_5: "Putt 3–5 m",
  PUTT_5_10: "Putt 5–10 m",
  PUTT_10_25: "Putt 10–25 m",
  PUTT_25_40: "Putt 25–40 m",
  PUTT_40_PLUSS: "Putt 40 m+",
  STYRKE: "Styrke",
  KONDISJON: "Kondisjon",
  BEVEGELIGHET: "Bevegelighet",
  BANE: "Bane",
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
  emptyWeekHint: "Klikk i uka for å legge inn en økt.",
  emptySources: "Ingen kilder å vise",
  emptySourcesTitle: "Ingen kilder lastet",
  emptySourcesBody: "Øvelsesbank og maler kobles på senere.",
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

  // Drill-skjema
  drillTitle: "Navn",
  drillTitlePlaceholder: "F.eks. Wedge 60 m",
  drillPyramid: "Pyramide",
  drillArea: "Område",
  drillDuration: "Tid",
  moveDrillUp: "Flytt opp",
  moveDrillDown: "Flytt ned",
  removeDrillLabel: "Fjern øvelse",
  incompleteDrill: "Mangler info",

  // Publish flow
  publishConfirmTitle: "Publiser til spilleren?",
  publishConfirmBody:
    "Økten blir synlig i spillerens «I dag» og plan. Du kan trekke den tilbake senere.",
  publishSuccess: "Publisert",
  publishing: "Publiserer …",
  alreadyPublished: "Allerede publisert",
  publishTodayWarnOne:
    "Én av øktene er i dag og dukker opp i spillerens «I dag» med en gang.",
  publishTodayWarnMany: (antall: number) =>
    `${antall} av øktene er i dag og dukker opp i spillerens «I dag» med en gang.`,
  publishOverlapWarnTitle: "Overlapp i valgte økter",

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

  // Ny økt-skjema
  createSessionBody: "Økten lagres som utkast. Den er kun synlig for deg til du publiserer.",
  titleField: "Tittel",
  titlePlaceholder: "F.eks. Wedge 60–100 m",
  dateField: "Dato",
  titleRequired: "Økten må ha en tittel.",
  invalidStartTime: "Ugyldig starttidspunkt.",
  creating: "Oppretter …",
  create: "Opprett",

  // Feiltilstand
  weekFetchErrorTitle: "Kunne ikke hente uka",
  retry: "Prøv igjen",
  unknownError: "Noe gikk galt. Prøv igjen.",

  // Toasts (WorkbenchUke)
  toastSessionMoved: "Økten er flyttet",
  toastSessionDeleted: "Økten er slettet",
  toastDrillAdded: "Øvelse lagt til",
  toastDrillRemoved: "Øvelsen er fjernet",
  toastUnpublished: "Trukket tilbake — spilleren ser den ikke lenger",
  toastDraftCreated: "Utkast opprettet — kun synlig for deg",
  toastPublishedOne: "1 økt publisert",
  toastPublishedMany: (antall: number) => `${antall} økter publisert`,

  // Inspektør — tomt/lagre-tilstand
  inspectorEmptyBody: "Velg en økt i uka for å se og endre den.",
  saving: "Lagrer …",
  dateLabel: "Dato",
  timeLabel: "Tid",
  sessionAboutLabel: "Om økten",
  durationValueLabel: "Varer",

  // Fallback
  unnamedPlayer: "Spiller",
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
