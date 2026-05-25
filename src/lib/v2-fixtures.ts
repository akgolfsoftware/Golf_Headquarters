/**
 * V2 Demo fixtures — Øyvind Rohjan + sessions + insights.
 * All numbers and dates relative to 2026-05-25.
 */

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
    href: "/profil",
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
  { id: "qa8", label: "Innstilling", icon: "Settings", href: "/profil", tone: "default" },
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
    name: "Markus R. P.",
    initials: "MP",
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
