/**
 * Workbench Plan A — felles types og demo-data.
 * Port av workbench-plan/plan-data.jsx.
 */

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";
export type Zoom = "ar" | "periode" | "maned" | "uke" | "dag";
export type ModalKey =
  | "period"
  | "camp"
  | "freq"
  | "facilities"
  | "testpicker"
  | null;

export type WBP_Session = {
  id: string;
  week: number;
  day: number; // 0-6 (mon-sun)
  span: number; // days
  axis: Axis;
  title: string;
  meta: string;
  done?: boolean;
  now?: boolean;
  peak?: boolean;
};

export type WBP_Week = {
  id: number;
  dates: string;
  state: "done" | "now" | "peak" | "rec" | "next";
  loadH: number;
  idealH: number;
  sessions: number;
  tests: number;
  intensity: "mid" | "high" | "peak" | "rec";
  tournament?: string;
};

export type WBP_Period = {
  id: number;
  name: string;
  status: "done" | "now" | "next";
  weeks: string;
  focus: string;
  active?: boolean;
  subweeks?: Array<{
    id: number;
    label: string;
    state: "done" | "now" | "peak" | "rec" | "next";
  }>;
};

export type WBP_Plan = {
  id: string;
  name: string;
  meta: string;
  active: boolean;
  draft: boolean;
};

export type WBP_Tournament = {
  id: string;
  tier: "A" | "B";
  name: string;
  date: string;
  week: number;
  days: number;
};

export type WBP_Facilities = {
  range: boolean;
  putting: boolean;
  shortgame: boolean;
  trackman: boolean;
  course9: boolean;
  course18: boolean;
  gym: boolean;
  yoga: boolean;
  pool: boolean;
  video: boolean;
};

// ============================================================================
// DEMO DATA — port av plan-data.jsx
// ============================================================================

export const WBP_TREE = {
  season: "Sesong 2026",
  periods: [
    {
      id: 1,
      name: "Forberedelse",
      status: "done" as const,
      weeks: "uke 06–14",
      focus: "FYS+TEK",
    },
    {
      id: 2,
      name: "Bygging",
      status: "done" as const,
      weeks: "uke 15–18",
      focus: "SLAG",
    },
    {
      id: 3,
      name: "Bygging mot turnering",
      status: "now" as const,
      weeks: "uke 19–24",
      focus: "SLAG+SPILL",
      active: true,
      subweeks: [
        { id: 19, label: "Uke 19", state: "done" as const },
        { id: 20, label: "Uke 20", state: "done" as const },
        { id: 21, label: "Uke 21", state: "now" as const },
        { id: 22, label: "Uke 22 · Sør.åpent", state: "peak" as const },
        { id: 23, label: "Uke 23 · Tilbake", state: "rec" as const },
        { id: 24, label: "Uke 24", state: "next" as const },
      ],
    },
    {
      id: 4,
      name: "Peak NM-kval",
      status: "next" as const,
      weeks: "uke 25–30",
      focus: "TURN",
    },
    {
      id: 5,
      name: "Restitusjon",
      status: "next" as const,
      weeks: "uke 31–34",
      focus: "FYS",
    },
  ] satisfies WBP_Period[],
};

export const WBP_PLANS: WBP_Plan[] = [
  {
    id: "A",
    name: "Plan A · Mot Sør.åpent",
    meta: "Aktiv · sist endret 2 min",
    active: true,
    draft: false,
  },
  {
    id: "B",
    name: "Plan B · Konservativ",
    meta: "Utkast · 3 dager siden",
    active: false,
    draft: true,
  },
];

export const WBP_TOURNAMENTS: WBP_Tournament[] = [
  { id: "sor", tier: "A", name: "Sørlandsåpent", date: "28.–30. mai", week: 22, days: 21 },
  { id: "nm", tier: "A", name: "NM-kvalifisering", date: "25.–27. juli", week: 30, days: 64 },
  { id: "osl", tier: "B", name: "Osloåpent", date: "15.–16. juni", week: 24, days: 38 },
];

export const WBP_WEIGHTS: Record<Axis, number> = {
  fys: 15,
  tek: 18,
  slag: 27,
  spill: 30,
  turn: 10,
};

export const WBP_WEEKS: WBP_Week[] = [
  { id: 19, dates: "08.–14. mai", state: "done", loadH: 7.5, idealH: 8, sessions: 4, tests: 0, intensity: "mid" },
  { id: 20, dates: "15.–21. mai", state: "done", loadH: 9.0, idealH: 9, sessions: 5, tests: 1, intensity: "mid" },
  { id: 21, dates: "22.–28. mai", state: "now", loadH: 6.5, idealH: 10, sessions: 5, tests: 0, intensity: "high" },
  { id: 22, dates: "29.05–04.06", state: "peak", loadH: 11.5, idealH: 11, sessions: 3, tests: 0, intensity: "peak", tournament: "Sørlandsåpent 28.–30." },
  { id: 23, dates: "05.–11. juni", state: "rec", loadH: 4.0, idealH: 5, sessions: 3, tests: 0, intensity: "rec" },
  { id: 24, dates: "12.–18. juni", state: "next", loadH: 8.5, idealH: 8, sessions: 4, tests: 1, intensity: "mid" },
];

export const WBP_SESSIONS: WBP_Session[] = [
  // Uke 19 (done)
  { id: "s19a", week: 19, day: 0, span: 1, axis: "fys", title: "Mobilitet", meta: "45m · hjemme", done: true },
  { id: "s19b", week: 19, day: 1, span: 1, axis: "tek", title: "Wedge-treff", meta: "60m · TM", done: true },
  { id: "s19c", week: 19, day: 3, span: 1, axis: "slag", title: "Driver-økt", meta: "90m · GFGK", done: true },
  { id: "s19d", week: 19, day: 5, span: 1, axis: "spill", title: "9 hull", meta: "GFGK · m/ Iver", done: true },
  // Uke 20 (done)
  { id: "s20a", week: 20, day: 0, span: 1, axis: "fys", title: "Styrke + mobilitet", meta: "75m · gym", done: true },
  { id: "s20b", week: 20, day: 1, span: 1, axis: "tek", title: "Video m/ Anders", meta: "30m · Zoom", done: true },
  { id: "s20c", week: 20, day: 2, span: 1, axis: "tek", title: "Putt-test", meta: "45m · CMJ", done: true },
  { id: "s20d", week: 20, day: 4, span: 1, axis: "slag", title: "Wedge spinn 60m", meta: "TM · 5 drills", done: true },
  { id: "s20e", week: 20, day: 6, span: 1, axis: "spill", title: "18 hull · måling", meta: "Bogstad", done: true },
  // Uke 21 (NOW)
  { id: "s21a", week: 21, day: 0, span: 1, axis: "fys", title: "Morgenmobilitet", meta: "45m · hjemme", done: true },
  { id: "s21b", week: 21, day: 1, span: 1, axis: "tek", title: "Video m/ Anders", meta: "30m · NÅ", now: true },
  { id: "s21c", week: 21, day: 1, span: 1, axis: "slag", title: "Wedge-spinn", meta: "90m · TM bay 3" },
  { id: "s21d", week: 21, day: 1, span: 1, axis: "spill", title: "9 hull scramble", meta: "m/ Iver" },
  { id: "s21e", week: 21, day: 2, span: 1, axis: "fys", title: "CMJ + sprint", meta: "60m · gym" },
  { id: "s21f", week: 21, day: 2, span: 1, axis: "slag", title: "Putt gate 50cm", meta: "45m · putting" },
  { id: "s21g", week: 21, day: 3, span: 1, axis: "spill", title: "18 hull målerunde", meta: "GFGK" },
  { id: "s21h", week: 21, day: 4, span: 1, axis: "slag", title: "Driver + iron", meta: "60m · TM" },
  { id: "s21i", week: 21, day: 5, span: 1, axis: "fys", title: "Restitusjon", meta: "lett · pust" },
  { id: "s21j", week: 21, day: 5, span: 1, axis: "turn", title: "Reise · pakking", meta: "mental forb." },
  // Uke 22 (PEAK)
  { id: "s22a", week: 22, day: 0, span: 1, axis: "fys", title: "Lett mobilitet", meta: "20m · hotell" },
  { id: "s22b", week: 22, day: 1, span: 1, axis: "slag", title: "Range + recon", meta: "90m · Kr.sand" },
  { id: "s22c", week: 22, day: 2, span: 1, axis: "spill", title: "Prøverunde", meta: "18H · Kr.sand" },
  { id: "s22d", week: 22, day: 3, span: 3, axis: "turn", title: "Sørlandsåpent", meta: "A-finale · 54H", peak: true },
  // Uke 23 (rec)
  { id: "s23a", week: 23, day: 0, span: 1, axis: "fys", title: "Mobilitet", meta: "30m · hjemme" },
  { id: "s23b", week: 23, day: 2, span: 1, axis: "tek", title: "Review m/ Anders", meta: "analyse · 60m" },
  { id: "s23c", week: 23, day: 4, span: 1, axis: "spill", title: "9 hull · lett", meta: "GFGK" },
  // Uke 24 (next)
  { id: "s24a", week: 24, day: 0, span: 1, axis: "fys", title: "Styrke", meta: "60m · gym" },
  { id: "s24b", week: 24, day: 2, span: 1, axis: "tek", title: "Iron-treff", meta: "TM · 45m" },
  { id: "s24c", week: 24, day: 3, span: 1, axis: "slag", title: "Putt-gate", meta: "45m · putting" },
  { id: "s24d", week: 24, day: 5, span: 2, axis: "turn", title: "Osloåpent", meta: "B-turnering · 36H" },
];

export const WBP_INITIAL_FAC: WBP_Facilities = {
  range: true,
  putting: true,
  shortgame: true,
  trackman: true,
  course9: false,
  course18: true,
  gym: true,
  yoga: false,
  pool: false,
  video: true,
};

export const AXIS_LABEL: Record<Axis, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

export const SAMLINGER = [
  { id: "wang", name: "WANG Toppidrett", date: "13.–16.6", color: "#005840" },
  { id: "team", name: "Team Norge · Vestby", date: "5.–7.7", color: "#A32D2D" },
  { id: "gfgk", name: "Klubbsamling GFGK", date: "22.5", color: "#B8852A" },
];
