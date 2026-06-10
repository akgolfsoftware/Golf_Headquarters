/**
 * V2 Demo fixtures — Øyvind Rohjan + sessions + insights.
 * All numbers and dates relative to 2026-05-25.
 */

// ── LegalPattern fixture ──────────────────────────────────────────
import type { LegalSection } from "@/components/athletic/patterns/legal";

export const DEMO_LEGAL_SECTIONS: LegalSection[] = [
  {
    id: "intro",
    number: "1",
    title: "Innsamlede opplysninger",
    content:
      "AK Golf Academy samler inn følgende kategorier av personopplysninger om deg:\n\n- Identitet (navn, e-post, telefon, fødselsdato)\n- Idrettsdata (HCP, treningshistorikk, statistikk)\n- Brukerdata (sider du besøker, klikk, tid brukt)\n\nVi samler kun inn det vi trenger for å levere tjenesten.",
  },
  {
    id: "behandling",
    number: "2",
    title: "Hvordan vi behandler dataene",
    content:
      "Vi behandler dine opplysninger basert på samtykke (GDPR Art. 6 nr. 1 bokstav a) eller berettiget interesse (Art. 6 nr. 1 bokstav f).\n\nLagring skjer i Supabase EU-region (Frankfurt). Vi deler ikke data med tredjeparter utenfor EU/EØS.",
  },
  {
    id: "rettigheter",
    number: "3",
    title: "Dine rettigheter",
    content:
      "Du har rett til:\n\n- Innsyn i hvilke data vi har om deg\n- Retting av feilaktige opplysninger\n- Sletting (\"retten til å bli glemt\")\n- Dataportabilitet (eksportere data)\n- Trekke tilbake samtykke når som helst\n\nDu kan utøve disse rettighetene ved å kontakte personvern@akgolf.no.",
  },
];

// ── EmailTemplateEditorPattern fixture ────────────────────────────
import type { EmailTemplate } from "@/components/athletic/patterns/email-template-editor";

export const DEMO_EMAIL_TEMPLATE: EmailTemplate = {
  id: "t1",
  name: "Velkomst — ny spiller",
  status: "PUBLISHED",
  subject: "Velkommen til AK Golf Academy, {{spiller_navn}}!",
  from: "velkommen@akgolf.no",
  toRule: "spiller",
  body: `Hei {{spiller_navn}},\n\nVelkommen til AK Golf Academy. Vi gleder oss til å jobbe med deg.\n\nDin første økt er booket {{første_økt_dato}} kl {{første_økt_tid}} med {{coach_navn}}.\n\nMvh,\nAK Golf Academy`,
  variables: [
    { key: "spiller_navn", example: "Øyvind Rohjan" },
    { key: "første_økt_dato", example: "fredag 30. mai" },
    { key: "første_økt_tid", example: "10:00" },
    { key: "coach_navn", example: "Anders Kristiansen" },
  ],
  lastEdited: "2026-05-22 14:15",
};

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type Axis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type SessionStatus = "DONE" | "NEXT" | "PLANNED" | "TURNERING";
export type InsightType = "HANDLING" | "OBSERVASJON" | "MAAL";
export type PyramidStatus = "OVER" | "UNDER" | "OK";
export type TileTone = "accent" | "warning" | "critical" | "default";
export type QuickActionTone = "dark" | "default";

export type Player = {
  id: string;
  name: string;
  first: string;
  initials: string;
  tier: string;
  ngfKategori: string;
  homeClub: string;
  hcp: number;
  hcpTrend: number;
  hcp12moAgo: number;
  snittScore: number;
  weekAdherence: number;
  sgTotal: number;
  sgOtt: number;
  sgApp: number;
  sgArg: number;
  sgPutt: number;
  trainingPlan: string;
  planWeek: number;
  planWeeksTotal: number;
};

export type Coach = {
  id: string;
  name: string;
  short: string;
  role: string;
};

export type Session = {
  id: string;
  time: string;
  end: string;
  startH: number;
  endH: number;
  axis: Axis;
  title: string;
  subtitle: string;
  location: string;
  drills: number;
  status: SessionStatus;
};

export type WeekSession = {
  day: string;
  axis: Axis;
  time: string;
  title: string;
  status: SessionStatus;
};

export type Tournament = {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  format: string;
  daysUntil: number;
};

export type TournamentChecklistItem = {
  id: number;
  label: string;
  done: boolean;
  hint?: string;
};

export type Insight = {
  id: string;
  type: InsightType;
  eyebrow: string;
  body: string;
  cta: string;
  href: string;
  icon: string;
};

export type PyramidRow = {
  axis: Axis;
  pct: number;
  mål: number;
  status: PyramidStatus;
  color: string;
};

export type StatTile = {
  label: string;
  value: number;
  unit: string;
  context: string;
  tone: TileTone;
  decimals?: number;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  href: string;
  tone: QuickActionTone;
};

export type Partner = {
  id: string;
  name: string;
  initials: string;
  hcp: number;
  akademi: string;
  lastSession: string;
};

export type Wellness = {
  energi: number;
  energiMax: number;
  søvn: number;
  søvnUnit: string;
  hrv: number;
  hrvDelta: number;
  stress: string;
};

export type Weather = {
  club: string;
  tempC: number;
  summary: string;
  wind: string;
};

export type Drill = {
  id: string;
  title: string;
  axis: Axis;
  image: number;
  description: string;
  duration: number;
  repsTarget: number;
  repsLogged: number;
  coachNote: string;
  related: string[];
  timesRun: number;
  bestStreak: number;
};

export type Round = {
  id: string;
  date: string;
  course: string;
  score: number;
  par: number;
  sg: number;
};

export type CoachThread = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  unread: boolean;
};

export type GoalAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type GoalStatus = "ACTIVE" | "ACHIEVED" | "OVERDUE";

export type Goal = {
  id: string;
  title: string;
  axis: GoalAxis;
  progress: number; // 0-100
  deadline: string; // formatted display string
  daysLeft: number;
  milestonesDone: number;
  milestonesTotal: number;
  status: GoalStatus;
};

// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────

export const ØYVIND_USER: Player = {
  id: "oyvind-rohjan",
  name: "Øyvind Rohjan",
  first: "Øyvind",
  initials: "ØR",
  tier: "PRO",
  ngfKategori: "A1",
  homeClub: "GFGK",
  hcp: -2.1,
  hcpTrend: 0.3,
  hcp12moAgo: 8.2,
  snittScore: 71.3,
  weekAdherence: 0.87,
  sgTotal: 1.0,
  sgOtt: 0.8,
  sgApp: 0.4,
  sgArg: -0.2,
  sgPutt: -1.4,
  trainingPlan: "Vår 2026 — Spesialisering",
  planWeek: 5,
  planWeeksTotal: 8,
};

export const COACH_DATA: Coach = {
  id: "anders-kristiansen",
  name: "Anders Kristiansen",
  short: "Anders K.",
  role: "HEAD COACH",
};

export const TODAY_SESSIONS: Session[] = [
  {
    id: "s1",
    time: "07:00",
    end: "08:20",
    startH: 7.0,
    endH: 8.33,
    axis: "FYS",
    title: "Morgentrening",
    subtitle: "Mobilitet + kjernemuskulatur",
    location: "Performance Studio",
    drills: 3,
    status: "DONE",
  },
  {
    id: "s2",
    time: "08:30",
    end: "10:00",
    startH: 8.5,
    endH: 10.0,
    axis: "TEK",
    title: "Sving-mekanikk",
    subtitle: "Lavt point + sving-plan",
    location: "Driving range · GFGK",
    drills: 5,
    status: "DONE",
  },
  {
    id: "s3",
    time: "11:00",
    end: "12:30",
    startH: 11.0,
    endH: 12.5,
    axis: "SLAG",
    title: "Avstandskontroll",
    subtitle: "50–120m wedge-stige",
    location: "Grønt-felt",
    drills: 4,
    status: "NEXT",
  },
  {
    id: "s4",
    time: "14:00",
    end: "16:00",
    startH: 14.0,
    endH: 16.0,
    axis: "SPILL",
    title: "9 huller — scoring",
    subtitle: "Sub-72 mål, full bag",
    location: "GFGK · sløyfe A",
    drills: 2,
    status: "PLANNED",
  },
  {
    id: "s5",
    time: "20:00",
    end: "20:45",
    startH: 20.0,
    endH: 20.75,
    axis: "TURN",
    title: "Mental forberedelse",
    subtitle: "Visualisering + pust",
    location: "Hjemme",
    drills: 1,
    status: "PLANNED",
  },
];

export const TOURNAMENT_NEXT: Tournament = {
  name: "Sørlandsåpent",
  startDate: "2026-05-28",
  endDate: "2026-05-30",
  location: "Kristiansand GK",
  format: "54 huller stroke play",
  daysUntil: 3,
};

export const TOURNAMENT_CHECKLIST: TournamentChecklistItem[] = [
  { id: 1, label: "Plan oppdatert", done: true },
  { id: 2, label: "Reise booket", done: true },
  { id: 3, label: "Bane-recon", done: false, hint: "Innen 1 uke før" },
  { id: 4, label: "Mental forb.", done: false, hint: "Søndag kveld" },
];

export const AI_INSIGHTS: Insight[] = [
  {
    id: "i1",
    type: "HANDLING",
    eyebrow: "Putting-økt anbefales",
    body: "Du har ikke trent putting siste 10 dager. Planen sier 2x/uke. Lag-snittet på SG-putt er nå -1.4 — det er din svakeste akse mot Sørlandsåpent.",
    cta: "Bestill økt",
    href: "/drill/putt-konsistens",
    icon: "Sparkles",
  },
  {
    id: "i2",
    type: "OBSERVASJON",
    eyebrow: "Sving-tempo",
    body: "TrackMan viser at tempo har gått fra 3.0 til 2.7 siste uka. Det kan henge sammen med energi-tallet (7/10) — verdt en samtale med Anders.",
    cta: "Se TrackMan",
    href: "/stats",
    icon: "BarChart3",
  },
  {
    id: "i3",
    type: "MAAL",
    eyebrow: "Mål Q2",
    body: "Du ligger 60% mot målet HCP -2.5 før sesongstart. Tre runder til kreves for offisiell justering. Carry-snitt har økt med 8m siden mars.",
    cta: "Se mål",
    href: "/portal/meg",
    icon: "Target",
  },
];

export const WEEK_PROGRESS: PyramidRow[] = [
  { axis: "FYS", pct: 35, mål: 20, status: "OVER", color: "var(--pyr-fys)" },
  { axis: "TEK", pct: 40, mål: 30, status: "OVER", color: "var(--pyr-tek)" },
  { axis: "SLAG", pct: 12, mål: 20, status: "UNDER", color: "var(--pyr-slag)" },
  { axis: "SPILL", pct: 8, mål: 20, status: "UNDER", color: "var(--pyr-spill)" },
  { axis: "TURN", pct: 2, mål: 10, status: "UNDER", color: "var(--pyr-turn)" },
];

export const WEEK_SUMMARY: StatTile[] = [
  { label: "Økter", value: 4, unit: "/6t", context: "+1 vs forrige uke", tone: "accent" },
  { label: "Runder", value: 2, unit: "spilt", context: "2 over mål", tone: "warning" },
  { label: "Drills", value: 12, unit: "fullf.", context: "Beste på 3 mnd", tone: "accent" },
  { label: "Tester", value: 3, unit: "gjenst.", context: "Forfaller torsdag", tone: "critical" },
];

export const QUICK_ACTIONS_LIST: QuickAction[] = [
  { id: "qa1", label: "Logg runde", icon: "Flag", href: "/stats", tone: "default" },
  { id: "qa2", label: "Start økt", icon: "Play", href: "/kalender", tone: "default" },
  { id: "qa3", label: "Ny booking", icon: "Plus", href: "/booking", tone: "dark" },
  { id: "qa4", label: "Ny test", icon: "ClipboardCheck", href: "/stats", tone: "default" },
  { id: "qa5", label: "Video-opp.", icon: "Video", href: "/drill/swing-video", tone: "default" },
  { id: "qa6", label: "Spør coach", icon: "MessageSquare", href: "/coach", tone: "default" },
  { id: "qa7", label: "Kalender", icon: "Calendar", href: "/kalender", tone: "default" },
  { id: "qa8", label: "Innstilling", icon: "Settings", href: "/portal/meg", tone: "default" },
];

export const TRAINING_PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "Tobias Hansen",
    initials: "TH",
    hcp: 8.5,
    akademi: "GFGK Elite",
    lastSession: "I går · TEK",
  },
  {
    id: "p2",
    name: "Sofie Larsen",
    initials: "SL",
    hcp: 0.8,
    akademi: "WANG Toppidrett",
    lastSession: "Forrige uke · SPILL",
  },
  {
    id: "p3",
    name: "Øyvind R.",
    initials: "ØR",
    hcp: 4.2,
    akademi: "GFGK U19",
    lastSession: "Mandag · FYS",
  },
];

export const WELLNESS_DATA: Wellness = {
  energi: 7,
  energiMax: 10,
  søvn: 7.4,
  søvnUnit: "t",
  hrv: 65,
  hrvDelta: 3,
  stress: "Lav",
};

export const WEATHER_DATA: Weather = {
  club: "GFGK",
  tempC: 14,
  summary: "sol",
  wind: "3 m/s NV",
};

export const WEEK_SESSIONS: WeekSession[] = [
  { day: "Man 25.5", axis: "FYS", time: "07:00", title: "Mobilitet + kjerne", status: "DONE" },
  { day: "Man 25.5", axis: "TEK", time: "09:00", title: "Plane-drill", status: "DONE" },
  { day: "Tir 26.5", axis: "FYS", time: "07:00", title: "Morgentrening", status: "DONE" },
  { day: "Tir 26.5", axis: "TEK", time: "08:30", title: "Sving-mekanikk", status: "DONE" },
  { day: "Tir 26.5", axis: "SLAG", time: "11:00", title: "Avstandskontroll", status: "NEXT" },
  { day: "Tir 26.5", axis: "SPILL", time: "14:00", title: "9 huller — scoring", status: "PLANNED" },
  { day: "Tir 26.5", axis: "TURN", time: "20:00", title: "Mental forberedelse", status: "PLANNED" },
  { day: "Ons 27.5", axis: "TEK", time: "10:00", title: "Driver-arbeid", status: "PLANNED" },
  { day: "Ons 27.5", axis: "SLAG", time: "13:30", title: "Bunker-økt", status: "PLANNED" },
  { day: "Tor 28.5", axis: "TURN", time: "09:30", title: "Sørlandsåpent · R1", status: "TURNERING" },
  { day: "Fre 29.5", axis: "TURN", time: "08:00", title: "Sørlandsåpent · R2", status: "TURNERING" },
  { day: "Lør 30.5", axis: "TURN", time: "08:00", title: "Sørlandsåpent · R3", status: "TURNERING" },
];

export const DRILLS_BY_ID: Record<string, Drill> = {
  "putt-konsistens": {
    id: "putt-konsistens",
    title: "Putt-konsistens 50m",
    axis: "SLAG",
    image: 33,
    description:
      "10 putt fra 3 forskjellige avstander (3m, 5m, 8m). Mål: rull alle innen 30cm radius av cup. Spor avvik venstre/høyre og kort/lang. Sett to alignment-sticks som gate gjennom hele drillen.",
    duration: 35,
    repsTarget: 30,
    repsLogged: 18,
    coachNote:
      "Lavt punktet — hold blikket på cup, ikke på ball. Skuldre stille gjennom slag.",
    related: ["gate-50cm", "wedge-stige", "swing-video"],
    timesRun: 14,
    bestStreak: 7,
  },
  "gate-50cm": {
    id: "gate-50cm",
    title: "Gate-drill 50cm",
    axis: "TEK",
    image: 19,
    description:
      "To alignment-sticks som danner en gate 50cm bred, 1m foran ball. Spill 20 baller — 5 driver, 5 6-jern, 5 PW, 5 SW. Mål: alle baller gjennom gate uten kontakt.",
    duration: 25,
    repsTarget: 20,
    repsLogged: 0,
    coachNote: "Tempo er nøkkelen — 3:1 ratio backswing/downswing.",
    related: ["wedge-stige"],
    timesRun: 8,
    bestStreak: 16,
  },
  "wedge-stige": {
    id: "wedge-stige",
    title: "Avstandskontroll 50m",
    axis: "SLAG",
    image: 30,
    description:
      "Slå 5 baller hver på 50m, 70m, 90m, 110m. Mål: alle innen 5m av target. Bruk TrackMan til å logge carry, ikke total.",
    duration: 40,
    repsTarget: 20,
    repsLogged: 5,
    coachNote: "Jobb mot 0.5-step grip-pressure for bedre konsistens.",
    related: ["putt-konsistens", "gate-50cm"],
    timesRun: 22,
    bestStreak: 9,
  },
  "swing-video": {
    id: "swing-video",
    title: "Video-opptak — DTL & FO",
    axis: "TEK",
    image: 35,
    description:
      "Ta 3 opptak av sving fra hver av to vinkler (down-the-line og face-on). Last opp til Caddie for AI-analyse + Anders-merknader.",
    duration: 15,
    repsTarget: 6,
    repsLogged: 0,
    coachNote: "Filmer alltid med tripod-høyde = midje + 10cm.",
    related: ["gate-50cm"],
    timesRun: 6,
    bestStreak: 6,
  },
};

export const RECENT_ROUNDS: Round[] = [
  { id: "rd1", date: "23. mai", course: "Kristiansand GK", score: 71, par: 72, sg: 1.4 },
  { id: "rd2", date: "18. mai", course: "GFGK", score: 72, par: 72, sg: 0.6 },
  { id: "rd3", date: "12. mai", course: "Larvik GK", score: 74, par: 72, sg: -1.2 },
  { id: "rd4", date: "5. mai", course: "GFGK", score: 73, par: 72, sg: 0.2 },
  { id: "rd5", date: "28. apr", course: "Kristiansand GK", score: 70, par: 72, sg: 1.6 },
];

export const DEMO_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Senk HCP til -3.0",
    axis: "TEK",
    progress: 65,
    deadline: "31. desember 2026",
    daysLeft: 220,
    milestonesDone: 5,
    milestonesTotal: 8,
    status: "ACTIVE",
  },
  {
    id: "g2",
    title: "Putting-statistikk < 1.7",
    axis: "SLAG",
    progress: 40,
    deadline: "1. august 2026",
    daysLeft: 68,
    milestonesDone: 2,
    milestonesTotal: 5,
    status: "ACTIVE",
  },
  {
    id: "g3",
    title: "Spil 12 turneringer",
    axis: "TURN",
    progress: 50,
    deadline: "31. oktober 2026",
    daysLeft: 159,
    milestonesDone: 6,
    milestonesTotal: 12,
    status: "ACTIVE",
  },
  {
    id: "g4",
    title: "FYS-screening pass",
    axis: "FYS",
    progress: 100,
    deadline: "5. mai 2026",
    daysLeft: -20,
    milestonesDone: 4,
    milestonesTotal: 4,
    status: "ACHIEVED",
  },
  {
    id: "g5",
    title: "Bane-recon Sørlandsåpent",
    axis: "SPILL",
    progress: 25,
    deadline: "21. mai 2026",
    daysLeft: -4,
    milestonesDone: 1,
    milestonesTotal: 4,
    status: "OVERDUE",
  },
];

// ──────────────────────────────────────────────────────────────
// Import pattern fixtures
// ──────────────────────────────────────────────────────────────

import type { ImportColumn, ImportRow } from "@/components/athletic/patterns/import";

export const DEMO_IMPORT_COLUMNS: ImportColumn[] = [
  { key: "name", label: "Fullt navn", required: true },
  { key: "email", label: "E-post", required: true },
  { key: "hcp", label: "HCP", required: false },
  { key: "homeClub", label: "Hjemmeklubb", required: false },
];

export const DEMO_IMPORT_ROWS: ImportRow[] = [
  {
    __row: 1,
    __status: "OK",
    __errors: [],
    name: "Øyvind Rohjan",
    email: "oyvind@example.com",
    hcp: -2.1,
    homeClub: "GFGK",
  },
  {
    __row: 2,
    __status: "OK",
    __errors: [],
    name: "Øyvind R.",
    email: "markus@example.com",
    hcp: 3.5,
    homeClub: "GFGK",
  },
  {
    __row: 3,
    __status: "WARNING",
    __errors: ["HCP mangler"],
    name: "Sofie Larsen",
    email: "sofie@example.com",
    hcp: null,
    homeClub: "GFGK",
  },
  {
    __row: 4,
    __status: "ERROR",
    __errors: ["Ugyldig e-post-format"],
    name: "Test Person",
    email: "ugyldig-email",
    hcp: 12.0,
    homeClub: "",
  },
];

export const COACH_THREADS: CoachThread[] = [
  {
    id: "t1",
    from: "anders",
    subject: "Forberedelse til Sørlandsåpent",
    preview: "Hei Øyvind — husk å logge alle runder denne uka …",
    body: "Hei Øyvind,\n\nHusk å logge alle runder denne uka — jeg vil ha SG-tall klar før vi planlegger torsdag. Vurder å spille Kristiansand fredag kveld for siste recon.\n\nVi snakkes på telefon onsdag 16:00. Inntil da: hold deg unna full-tempo driver, vi har nok data på den nå.\n\nA.",
    date: "I dag · 08:14",
    unread: true,
  },
  {
    id: "t2",
    from: "you",
    subject: "Spørsmål om putting-rutine",
    preview: "Hei Anders, sliter med 5–15m …",
    body: "Hei Anders,\n\nJeg sliter med konsistens på 5–15m. SG-putt er -1.4 over siste 5 runder. Skal jeg endre stance-bredde, eller er det noe annet?\n\nØyvind",
    date: "23. mai · 18:42",
    unread: false,
  },
  {
    id: "t3",
    from: "anders",
    subject: "Test-resultater CMJ",
    preview: "CMJ-tall fra mandag ser bra ut — power-output …",
    body: "CMJ-tall fra mandag ser bra ut — power-output er opp 6%. Vi kjører neste batterie 2. juni.",
    date: "21. mai · 11:02",
    unread: false,
  },
];

// ──────────────────────────────────────────────────────────────
// Notification center fixtures (NotificationCenterPattern)
// ──────────────────────────────────────────────────────────────

import type { Notification } from "@/components/athletic/patterns/notification-center";

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "COACH",
    title: "Ny melding fra Anders K",
    body: "Bra jobba med putting i går. Hold rytmen...",
    time: "2026-05-25T08:38:00Z",
    timeLabel: "for 12 min siden",
    href: "/portal/coach/melding/n1",
    unread: true,
  },
  {
    id: "n2",
    type: "BOOKING",
    title: "Booking bekreftet — onsdag 14:00",
    body: "TrackMan-økt med Anders K · Performance Studio",
    time: "2026-05-25T07:15:00Z",
    timeLabel: "for 2t siden",
    href: "/portal/booking/b1",
    unread: true,
  },
  {
    id: "n3",
    type: "MILESTONE",
    title: "Mål oppnådd: FYS-screening",
    body: "Du fullførte alle 4 milepæler...",
    time: "2026-05-24T16:00:00Z",
    timeLabel: "i går 16:00",
    href: "/portal/mal/goal/g4",
    unread: false,
  },
  {
    id: "n4",
    type: "ALERT",
    title: "Test forfalt: CMJ vertical jump",
    body: "Skulle vært gjennomført 22. mai. Reservér ny tid...",
    time: "2026-05-24T08:00:00Z",
    timeLabel: "i går 08:00",
    href: "/portal/tren/tester/cmj",
    unread: true,
  },
  {
    id: "n5",
    type: "SYSTEM",
    title: "Ny app-versjon tilgjengelig",
    body: "v2.0 inneholder forbedret kalender og itinerary...",
    time: "2026-05-22T10:00:00Z",
    timeLabel: "for 3 dager siden",
    href: "/portal/meg/innstillinger",
    unread: false,
  },
];

// ──────────────────────────────────────────────────────────────
// Audit log fixtures (AuditLogPattern)
// ──────────────────────────────────────────────────────────────

import type { AuditEvent } from "@/components/athletic/patterns/audit-log";

export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "a1",
    timestamp: "2026-05-25T14:32:00Z",
    timeLabel: "i dag 14:32",
    actor: { id: "ak", name: "Anders Kristiansen", initials: "AK", role: "Head Coach" },
    action: "CREATE",
    actionLabel: "opprettet plan",
    target: { type: "plan", id: "p1", label: "Spesialiseringsplan vår 2026", href: "/admin/plans/p1" },
  },
  {
    id: "a2",
    timestamp: "2026-05-25T13:15:00Z",
    timeLabel: "i dag 13:15",
    actor: { id: "or", name: "Øyvind Rohjan", initials: "ØR", role: "Spiller" },
    action: "LOGIN",
    actionLabel: "logget inn",
    target: { type: "session", id: "s", label: "PlayerHQ" },
    ipAddress: "84.215.32.18",
  },
  {
    id: "a3",
    timestamp: "2026-05-25T11:48:00Z",
    timeLabel: "i dag 11:48",
    actor: { id: "ak", name: "Anders Kristiansen", initials: "AK", role: "Head Coach" },
    action: "APPROVE",
    actionLabel: "godkjente",
    target: { type: "drill", id: "d1", label: "Putting-drill 1.5m gate", href: "/admin/drills/d1" },
  },
  {
    id: "a4",
    timestamp: "2026-05-24T16:22:00Z",
    timeLabel: "i går 16:22",
    actor: { id: "system", name: "System", initials: "SY", role: "Automat" },
    action: "UPDATE",
    actionLabel: "synkroniserte WAGR-data",
    target: { type: "import", id: "wagr-2026-05-24", label: "WAGR weekly sync" },
    details: "Importerte 1247 nye rangeringer. 12 endringer for AK-spillere.",
  },
  {
    id: "a5",
    timestamp: "2026-05-24T09:01:00Z",
    timeLabel: "i går 09:01",
    actor: { id: "ak", name: "Anders Kristiansen", initials: "AK", role: "Head Coach" },
    action: "DELETE",
    actionLabel: "slettet booking",
    target: { type: "booking", id: "b99", label: "Øyvind R. — 25. mai 10:00" },
  },
];

// ── ConsentPattern fixture ────────────────────────────────────────
import type { ConsentItem } from "@/components/athletic/patterns/consent";

export const DEMO_CONSENT_ITEMS: ConsentItem[] = [
  {
    id: "c1",
    title: "Vilkår for bruk",
    body: "Jeg har lest og godtar AK Golf Academy sine brukervilkår.",
    required: true,
    accepted: false,
  },
  {
    id: "c2",
    title: "Personvern (GDPR)",
    body: "Jeg samtykker til at AK Golf Academy lagrer og behandler personopplysninger som beskrevet i personvernerklæringen.",
    subItems: [
      "Navn, e-post, HCP, treningsdata",
      "Lagret i Norge (Supabase EU-region)",
      "Slettes ved oppsigelse",
    ],
    required: true,
    accepted: false,
  },
  {
    id: "c3",
    title: "Foreldresamtykke (under 18)",
    body: "Som foresatt godkjenner jeg at min datter/sønn bruker AK Golf Academy-plattformen.",
    required: true,
    accepted: false,
  },
  {
    id: "c4",
    title: "Marketing-kommunikasjon",
    body: "Jeg ønsker å motta nyhetsbrev og tilbud fra AK Golf Academy.",
    required: false,
    accepted: false,
  },
];

// ──────────────────────────────────────────────────────────────
// Timeline — milepæl-typer og demo-data
// ──────────────────────────────────────────────────────────────

export type MilestoneType =
  | "GOAL_ACHIEVED"
  | "PLAN_COMPLETED"
  | "TOURNAMENT_RESULT"
  | "PR_NEW"
  | "TEST_PASSED"
  | "MILESTONE_OTHER";

export type MilestoneAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type Milestone = {
  id: string;
  date: string; // ISO
  dateLabel: { day: string; month: string; year?: string };
  type: MilestoneType;
  axis?: MilestoneAxis;
  title: string;
  body?: string;
  photo?: string;
  metric?: { label: string; value: string; tone?: "accent" | "default" };
  href?: string;
};

export const DEMO_MILESTONES: Milestone[] = [
  {
    id: "m1",
    date: "2026-05-20",
    dateLabel: { day: "20", month: "MAI" },
    type: "PR_NEW",
    axis: "TEK",
    title: "Personlig rekord — sving-tempo 3.0:1",
    body: "Trackman-logget over 10 svinger. Konsistens på 92%.",
    metric: { label: "tempo-konsistens", value: "+12% vs forrige mnd", tone: "accent" },
  },
  {
    id: "m2",
    date: "2026-05-15",
    dateLabel: { day: "15", month: "MAI" },
    type: "PLAN_COMPLETED",
    axis: "FYS",
    title: "Fullført: FYS-fase 2 — styrke-blokk",
    body: "8 ukers FYS-plan med fokus på kjernemuskulatur og rotasjon.",
    photo: "/images/akgolf/AK-Golf-Academy-9.webp",
  },
  {
    id: "m3",
    date: "2026-05-08",
    dateLabel: { day: "8", month: "MAI" },
    type: "TOURNAMENT_RESULT",
    axis: "TURN",
    title: "Larviksåpent — 4. plass",
    body: "67 + 69 + 71 = 207. Beste av kategorien.",
    metric: { label: "vinnermargin", value: "-3 slag fra topp", tone: "default" },
    href: "/portal/turneringer/larvik-2026",
  },
  {
    id: "m4",
    date: "2026-04-22",
    dateLabel: { day: "22", month: "APR" },
    type: "GOAL_ACHIEVED",
    axis: "SLAG",
    title: "Mål oppnådd: Putting < 1.8",
    body: "Snitt 1.76 over siste 10 runder.",
    metric: { label: "putting-snitt", value: "1.76", tone: "accent" },
    href: "/portal/mal/goal/g-putting",
  },
  {
    id: "m5",
    date: "2026-03-15",
    dateLabel: { day: "15", month: "MAR", year: "2026" },
    type: "TEST_PASSED",
    axis: "FYS",
    title: "CMJ vertical jump — 64 cm",
    body: "Pass A-nivå for U18. Forbedring fra 58 cm i januar.",
  },
];
