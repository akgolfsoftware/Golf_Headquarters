// ============================================================
// Workbench demo data — frozen 1:1 from the v10 design.
// Week 22 · MAN 26 – FRE 30 mai 2026 · player "Markus R.P."
// These literals must match v10 exactly so the adversarial diff
// against the v10 screenshot lands on 0 deviations.
// ============================================================

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

// ───────── WeekView events ─────────
export type WeekEvent = {
  /** start hour (24h) */
  h: number;
  /** start minute */
  m?: number;
  /** duration in minutes */
  durMin: number;
  ax: Axis;
  eb: string;
  ttl: string;
  meta: [icon: string, text: string][];
  chips?: [label: string, cls: string][];
  selected?: boolean;
  group?: boolean;
  tournament?: boolean;
};

export type WeekDay = {
  dow: string;
  date: string;
  today: boolean;
  sub: string;
  /** position of NÅ-linje in {h,m}, only set on today */
  nowLine?: { h: number; m: number };
  events: WeekEvent[];
};

export const WEEK_HEAD: { dow: string; date: string; today: boolean; sub: string }[] = [
  { dow: "MAN", date: "26", today: false, sub: "mai" },
  { dow: "TIR", date: "27", today: false, sub: "" },
  { dow: "ONS", date: "28", today: true, sub: "" },
  { dow: "TOR", date: "29", today: false, sub: "" },
  { dow: "FRE", date: "30", today: false, sub: "" },
];

export const WEEK_DAYS: WeekDay[] = [
  // MAN 26
  {
    dow: "MAN",
    date: "26",
    today: false,
    sub: "mai",
    events: [
      {
        h: 7,
        durMin: 30,
        ax: "fys",
        eb: "FYS",
        ttl: "Morgenmobilitet",
        meta: [
          ["clock", "07:00 · 30 m"],
          ["layers", "3 drills"],
        ],
      },
      {
        h: 14,
        durMin: 75,
        ax: "slag",
        eb: "SLAG · INNSPILL",
        ttl: "Lengdekontroll 50–80 m",
        meta: [
          ["clock", "14:00 · 75 m"],
          ["layers", "4 drills"],
          ["gauge", "CS 80"],
        ],
      },
    ],
  },
  // TIR 27
  {
    dow: "TIR",
    date: "27",
    today: false,
    sub: "",
    events: [
      {
        h: 9,
        durMin: 60,
        ax: "tek",
        group: true,
        eb: "TEK · GRUPPE",
        ttl: "Sekvens P4–P8 · balltreff",
        meta: [
          ["clock", "09:00 · 60 m"],
          ["users", "WANG · 6 spillere"],
        ],
        chips: [["WANG", "wang"]],
      },
      {
        h: 16,
        durMin: 45,
        ax: "fys",
        eb: "FYS",
        ttl: "Rotasjonsstyrke + core",
        meta: [
          ["clock", "16:00 · 45 m"],
          ["layers", "5 øvelser"],
        ],
      },
    ],
  },
  // ONS 28 — today, selected
  {
    dow: "ONS",
    date: "28",
    today: true,
    sub: "",
    nowLine: { h: 11, m: 18 },
    events: [
      {
        h: 8,
        durMin: 30,
        ax: "fys",
        eb: "FYS",
        ttl: "Aktiv oppvarming",
        meta: [["clock", "08:00 · 30 m"]],
      },
      {
        h: 14,
        durMin: 60,
        ax: "slag",
        selected: true,
        eb: "SLAG · INNSPILL",
        ttl: "Innspill 50–80 m · presisjon",
        meta: [
          ["clock", "14:00 · 60 m"],
          ["layers", "4 drills"],
          ["gauge", "CS 80"],
        ],
      },
      {
        h: 17,
        durMin: 90,
        ax: "spill",
        eb: "SPILL · BANE",
        ttl: "9-hulls spillsimulering",
        meta: [
          ["clock", "17:00 · 90 m"],
          ["map-pin", "GFGK Old"],
        ],
      },
    ],
  },
  // TOR 29
  {
    dow: "TOR",
    date: "29",
    today: false,
    sub: "",
    events: [
      {
        h: 7,
        durMin: 20,
        ax: "fys",
        eb: "FYS",
        ttl: "Morgenmobilitet",
        meta: [["clock", "07:00 · 20 m"]],
      },
      {
        h: 10,
        durMin: 60,
        ax: "tek",
        eb: "TEK · TEST",
        ttl: "Putt-konsistens 4 m",
        meta: [
          ["clock", "10:00 · 60 m"],
          ["clipboard-check", "TEST-UKE"],
        ],
      },
      {
        h: 15,
        durMin: 75,
        ax: "slag",
        group: true,
        eb: "SLAG · GRUPPE",
        ttl: "Fulle slag · matte → gress",
        meta: [
          ["clock", "15:00 · 75 m"],
          ["users", "GFGK · 4 sp"],
        ],
        chips: [["GFGK", "wang"]],
      },
    ],
  },
  // FRE 30 — Tournament pillar
  {
    dow: "FRE",
    date: "30",
    today: false,
    sub: "",
    events: [
      {
        h: 6,
        durMin: 90,
        ax: "turn",
        eb: "TURN · OPPVARMING",
        ttl: "Pre-shot rutine + range",
        meta: [["clock", "06:00 · 90 m"]],
      },
      {
        h: 8,
        durMin: 60 * 8,
        ax: "turn",
        tournament: true,
        eb: "TURN · R1",
        ttl: "Srixon Tour #2 · Larvik",
        meta: [
          ["flag", "Tee 08:42"],
          ["map-pin", "Larvik GK"],
        ],
      },
    ],
  },
];

export const PERIOD_BAND = {
  eb: "PERIODE · GRUNN → SPES",
  name: "Bygging mot turnering",
  focusLabel: "FOKUS:",
  focusValue: "balltreff + innspill",
};

// ───────── DayView (ONS 28) ─────────
export type Drill = {
  num: string;
  nm: string;
  sub: string;
  reps: string;
  tm: string;
};

export type DayEvent = {
  h: number;
  durMin: number;
  ax: Axis;
  eb: string;
  ttl: string;
  meta: [icon: string, text: string][];
  drills: Drill[];
  cta?: boolean;
};

export const DAY_HEAD = {
  dow: "ONSDAG",
  date: "28",
  sub: "28. mai 2026 · Uke 22",
  summary: "3 økter · 3 t 0 m planlagt",
  nowLine: { h: 11, m: 18 },
};

export const DAY_EVENTS: DayEvent[] = [
  {
    h: 8,
    durMin: 30,
    ax: "fys",
    eb: "FYS · OPPVARMING",
    ttl: "Aktiv oppvarming",
    meta: [["clock", "08:00–08:30"]],
    drills: [],
  },
  {
    h: 14,
    durMin: 60,
    ax: "slag",
    eb: "SLAG · INNSPILL",
    ttl: "Innspill 50–80 m · presisjon",
    meta: [
      ["clock", "14:00–15:00"],
      ["layers", "4 drills"],
      ["gauge", "CS 80 · MIDDELS"],
      ["map-pin", "GFGK · TM bay 3"],
    ],
    drills: [
      { num: "1.", nm: "Lengdekontroll 50 m", sub: "flat matte", reps: "30 reps", tm: "15 m" },
      { num: "2.", nm: "Lengdekontroll 65 m", sub: "flat matte", reps: "30 reps", tm: "15 m" },
      { num: "3.", nm: "Lengdekontroll 80 m", sub: "gress", reps: "30 reps", tm: "15 m" },
      { num: "4.", nm: "Random-mix 50 / 65 / 80", sub: "scoring", reps: "20 reps", tm: "15 m" },
    ],
    cta: true,
  },
  {
    h: 17,
    durMin: 90,
    ax: "spill",
    eb: "SPILL · BANE",
    ttl: "9-hulls spillsimulering · scoring",
    meta: [
      ["clock", "17:00–18:30"],
      ["map-pin", "GFGK Old · hull 10–18"],
      ["cloud", "9 °C · vind sør 4 m/s"],
    ],
    drills: [
      { num: "·", nm: "Course management", sub: "tee → green", reps: "9 hull", tm: "90 m" },
    ],
  },
];

// ───────── Sidebar data ─────────
export const SIDEBAR_TURNERINGER: { tn: string; td: string; soon?: boolean }[] = [
  { tn: "Srixon Tour #2 · Larvik GK", td: "12 dg", soon: true },
  { tn: "Nordic League · Bjaavann", td: "34 dg" },
  { tn: "EM Junior Gutter · Praha", td: "71 dg" },
  { tn: "Norgesmesterskapet · Oslo GK", td: "96 dg" },
];

export const SIDEBAR_STANDARDOKTER: { ax: Axis; nm: string; sub: string; dur: string }[] = [
  { ax: "fys", nm: "Morgenmobilitet", sub: "3 drills · 20 min", dur: "20 m" },
  { ax: "tek", nm: "Balltreff & lavpunkt", sub: "4 drills · matte", dur: "45 m" },
  { ax: "slag", nm: "Innspill 50–80 m", sub: "4 drills · CS 80", dur: "60 m" },
  { ax: "spill", nm: "9-hulls spillsimulering", sub: "scoring · bane", dur: "90 m" },
];

export const SIDEBAR_GOALS: {
  gn: string;
  gm: string;
  gpct: string;
  ax: Axis;
  width: string;
}[] = [
  { gn: "SG innspill +0,30", gm: "RESULTATMÅL · SESONG", gpct: "62 %", ax: "spill", width: "62%" },
  { gn: "8 t styrke / uke", gm: "PROSESSMÅL · UKE 22", gpct: "75 %", ax: "fys", width: "75%" },
  { gn: "Daglig 10 min putting", gm: "VANE · 28 D", gpct: "21 / 28", ax: "tek", width: "75%" },
];

export const SIDEBAR_PYRAMIDE: {
  lbl: string;
  ax: Axis;
  sg: string;
  sgCls: "pos" | "neg";
  side: "left" | "right";
  width: string;
}[] = [
  { lbl: "TURN", ax: "turn", sg: "+0,12", sgCls: "pos", side: "left", width: "8%" },
  { lbl: "SPILL", ax: "spill", sg: "+0,21", sgCls: "pos", side: "left", width: "14%" },
  { lbl: "SLAG", ax: "slag", sg: "−0,42", sgCls: "neg", side: "right", width: "28%" },
  { lbl: "TEK", ax: "tek", sg: "+0,33", sgCls: "pos", side: "left", width: "22%" },
  { lbl: "FYS", ax: "fys", sg: "+0,45", sgCls: "pos", side: "left", width: "30%" },
];

// ───────── Inspector data ─────────
export const INSPECTOR_PERIODE: { l: string; ax: Axis; width: string; v: string }[] = [
  { l: "TURN", ax: "turn", width: "38%", v: "10 / 10 t" },
  { l: "SPILL", ax: "spill", width: "52%", v: "26 / 30 t" },
  { l: "SLAG", ax: "slag", width: "64%", v: "24 / 27 t" },
  { l: "TEK", ax: "tek", width: "72%", v: "22 / 18 t" },
  { l: "FYS", ax: "fys", width: "88%", v: "18 / 15 t" },
];

export const INSPECTOR_TESTS: {
  tlbl: string;
  tnm: string;
  due: string;
  dueIcon: string;
  overdue?: boolean;
}[] = [
  { tlbl: "FYS", tnm: "CMJ vertikal", due: "5 d over", dueIcon: "alert-circle", overdue: true },
  { tlbl: "FYS", tnm: "10 m sprint", due: "3 d over", dueIcon: "alert-circle", overdue: true },
  { tlbl: "TEK", tnm: "Putt-konsistens 4 m", due: "i morgen", dueIcon: "clock" },
  { tlbl: "SPILL", tnm: "HCP-måling 10 hull", due: "7 d igjen", dueIcon: "clock" },
];

export const INSPECTOR_COACH_ACTIONS: { icon: string; label: string; pri?: boolean }[] = [
  { icon: "pencil-line", label: "Legg til notat på økt", pri: true },
  { icon: "video", label: "Legg til video / link" },
  { icon: "check-square", label: "Opprett oppgave til Markus" },
  { icon: "send", label: "Send melding" },
  { icon: "check-circle-2", label: "Godkjenn plan-endring" },
  { icon: "arrow-up-right", label: "Løft til hovedcoach" },
];

// ───────── Statusbar data ─────────
export const STATUSBAR_AXES: { lbl: string; ax: Axis; hrs: string }[] = [
  { lbl: "FYS", ax: "fys", hrs: "3,0 t" },
  { lbl: "TEK", ax: "tek", hrs: "2,0 t" },
  { lbl: "SLAG", ax: "slag", hrs: "4,0 t" },
  { lbl: "SPILL", ax: "spill", hrs: "2,0 t" },
  { lbl: "TURN", ax: "turn", hrs: "1,5 t" },
];

// ───────── KanbanView (5 axis columns) ─────────
export const KANBAN_COLS: {
  key: Axis;
  lbl: string;
  ct: number;
  cards: { day: string; nm: string; meta: string }[];
}[] = [
  {
    key: "fys",
    lbl: "FYS",
    ct: 3,
    cards: [
      { day: "MAN · 07:00", nm: "Morgenmobilitet", meta: "20 m · 3 drills" },
      { day: "TIR · 16:00", nm: "Rotasjonsstyrke + core", meta: "45 m · 5 øv." },
      { day: "TOR · 07:00", nm: "Aktiv hvile + tøy", meta: "30 m" },
    ],
  },
  {
    key: "tek",
    lbl: "TEK",
    ct: 2,
    cards: [
      { day: "TIR · 09:00", nm: "Sekvens P4–P8", meta: "60 m · WANG-gruppe" },
      { day: "TOR · 10:00", nm: "Putt-konsistens 4 m", meta: "60 m · TEST-UKE" },
    ],
  },
  {
    key: "slag",
    lbl: "SLAG",
    ct: 3,
    cards: [
      { day: "MAN · 14:00", nm: "Lengdekontroll 50–80", meta: "75 m · 4 drills" },
      { day: "ONS · 14:00", nm: "Innspill presisjon 50–80", meta: "60 m · CS 80" },
      { day: "TOR · 15:00", nm: "Fulle slag · matte → gress", meta: "75 m · GFGK" },
    ],
  },
  {
    key: "spill",
    lbl: "SPILL",
    ct: 1,
    cards: [{ day: "ONS · 17:00", nm: "9-hulls spillsimulering", meta: "90 m · scoring" }],
  },
  {
    key: "turn",
    lbl: "TURN",
    ct: 2,
    cards: [
      { day: "FRE · 06:00", nm: "Pre-round oppvarming", meta: "90 m · pre-shot" },
      { day: "FRE · 08:42", nm: "Srixon Tour #2 R1", meta: "Larvik GK · 18 h" },
    ],
  },
];

// ───────── DashboardView ─────────
export const DASH_PIE_TOTAL = 12.5;

export const DASH_PIE_SEG: { key: Axis; hrs: number; color: string; lbl: string }[] = [
  { key: "fys", hrs: 3.0, color: "var(--pyr-fys)", lbl: "FYS" },
  { key: "tek", hrs: 2.0, color: "var(--pyr-tek)", lbl: "TEK" },
  { key: "slag", hrs: 4.0, color: "var(--pyr-slag)", lbl: "SLAG" },
  { key: "spill", hrs: 2.0, color: "var(--pyr-spill)", lbl: "SPILL" },
  { key: "turn", hrs: 1.5, color: "var(--pyr-turn)", lbl: "TURN" },
];

export const DASH_TRENDS: {
  lbl: string;
  vals: number[];
  col: string;
  d: string;
  cls: "up" | "down" | "";
  warn?: boolean;
}[] = [
  { lbl: "FYS", vals: [10, 11, 11, 10, 12, 12, 13, 12], col: "var(--pyr-fys)", d: "+3 %", cls: "up" },
  { lbl: "TEK", vals: [6, 7, 8, 9, 10, 11, 12, 13], col: "var(--pyr-tek)", d: "+22 %", cls: "up" },
  {
    lbl: "SLAG",
    vals: [16, 15, 14, 13, 11, 10, 8, 6],
    col: "var(--pyr-slag)",
    d: "−42 %",
    cls: "down",
    warn: true,
  },
  { lbl: "SPILL", vals: [8, 8, 8, 9, 8, 9, 8, 8], col: "var(--pyr-spill)", d: "stabil", cls: "" },
  { lbl: "TURN", vals: [2, 2, 3, 3, 4, 5, 5, 6], col: "var(--pyr-turn)", d: "+18 %", cls: "up" },
];

export const DASH_BALANCE: {
  lbl: string;
  key: Axis;
  target: number;
  actual: number;
  diff: string;
  cls: "pos" | "neg";
}[] = [
  { lbl: "FYS", key: "fys", target: 80, actual: 88, diff: "+8 pp", cls: "pos" },
  { lbl: "TEK", key: "tek", target: 70, actual: 72, diff: "+2 pp", cls: "pos" },
  { lbl: "SLAG", key: "slag", target: 72, actual: 56, diff: "−16 pp", cls: "neg" },
  { lbl: "SPILL", key: "spill", target: 60, actual: 52, diff: "−8 pp", cls: "neg" },
  { lbl: "TURN", key: "turn", target: 40, actual: 38, diff: "−2 pp", cls: "neg" },
];

// ════════════════════════════════════════════════════════════
// Direction B (Liste) demo data — frozen 1:1 from v10
// workbench-dir-b.jsx. Kept separate from the A-data above so the
// B-screens render byte-for-byte like the v10 source; some labels
// differ subtly between A and B by design.
// ════════════════════════════════════════════════════════════

// ───────── B · Pyramide strip ─────────
export const DIRB_PYR_SEG: { k: Axis; w: number; lbl: string }[] = [
  { k: "fys", w: 24, lbl: "FYS 3,0 t" },
  { k: "tek", w: 16, lbl: "TEK 2,0 t" },
  { k: "slag", w: 32, lbl: "SLAG 4,0 t" },
  { k: "spill", w: 16, lbl: "SPILL 2,0 t" },
  { k: "turn", w: 12, lbl: "TURN 1,5 t" },
];

export const DIRB_PYR_SGS: { k: Axis; nm: string; v: string; cls: "pos" | "neg" }[] = [
  { k: "fys", nm: "FYS", v: "+0,45", cls: "pos" },
  { k: "tek", nm: "TEK", v: "+0,33", cls: "pos" },
  { k: "slag", nm: "SLAG", v: "−0,42", cls: "neg" },
  { k: "spill", nm: "SPILL", v: "+0,21", cls: "pos" },
  { k: "turn", nm: "TURN", v: "+0,12", cls: "pos" },
];

// ───────── B · Tidslinje (day sections + rows) ─────────
export type DirBRowData = {
  time: string;
  ax: Axis;
  axt: string;
  ttl: string;
  /** [icon, text] meta items */
  meta?: [icon: string, text: string][];
  /** [label, cls] pills */
  pills?: [label: string, cls: string][];
  dur: string;
  selected?: boolean;
};

export type DirBDayData = {
  dow: string;
  dt: string;
  mn: string;
  tag?: string;
  tagCls?: string;
  isToday?: boolean;
  /** summary parts: count + duration text */
  summary: { ct: string; dur: string };
  rows: DirBRowData[];
};

export const DIRB_TOUR_STRIP = {
  eb: "TURN · NÆR",
  nm: "Srixon Tour #2 · Larvik GK",
  meta: "Fre 30/5 · tee 08:42 · 12 dg igjen",
};

export const DIRB_DAYS: DirBDayData[] = [
  {
    dow: "MAN",
    dt: "26",
    mn: "MAI",
    summary: { ct: "2", dur: "1 t 45 m" },
    rows: [
      { time: "07:00", ax: "fys", axt: "FYS", ttl: "Morgenmobilitet", meta: [["layers", "3 drills"]], dur: "30 m" },
      {
        time: "14:00",
        ax: "slag",
        axt: "SLAG",
        ttl: "Lengdekontroll 50–80 m",
        meta: [
          ["layers", "4 drills"],
          ["gauge", "CS 80"],
        ],
        dur: "75 m",
      },
    ],
  },
  {
    dow: "TIR",
    dt: "27",
    mn: "MAI",
    summary: { ct: "2", dur: "1 t 45 m" },
    rows: [
      {
        time: "09:00",
        ax: "tek",
        axt: "TEK",
        ttl: "Sekvens P4–P8 · balltreff",
        pills: [["WANG · 6 sp", "wang"]],
        dur: "60 m",
      },
      { time: "16:00", ax: "fys", axt: "FYS", ttl: "Rotasjonsstyrke + core", meta: [["layers", "5 øvelser"]], dur: "45 m" },
    ],
  },
  {
    dow: "ONS",
    dt: "28",
    mn: "MAI",
    tag: "I DAG",
    isToday: true,
    summary: { ct: "3", dur: "3 t 0 m" },
    rows: [
      { time: "08:00", ax: "fys", axt: "FYS", ttl: "Aktiv oppvarming", dur: "30 m" },
      {
        time: "14:00",
        ax: "slag",
        axt: "SLAG",
        ttl: "Innspill 50–80 m · presisjon",
        meta: [
          ["layers", "4 drills"],
          ["gauge", "CS 80"],
          ["map-pin", "GFGK · TM bay 3"],
        ],
        dur: "60 m",
        selected: true,
      },
      {
        time: "17:00",
        ax: "spill",
        axt: "SPILL",
        ttl: "9-hulls spillsimulering",
        meta: [
          ["map-pin", "GFGK Old"],
          ["cloud", "9 °C · vind sør"],
        ],
        dur: "90 m",
      },
    ],
  },
  {
    dow: "TOR",
    dt: "29",
    mn: "MAI",
    tag: "TEST-UKE",
    tagCls: "",
    summary: { ct: "3", dur: "2 t 35 m" },
    rows: [
      { time: "07:00", ax: "fys", axt: "FYS", ttl: "Morgenmobilitet", dur: "20 m" },
      { time: "10:00", ax: "tek", axt: "TEK", ttl: "Putt-konsistens 4 m", pills: [["TEST", "test"]], dur: "60 m" },
      {
        time: "15:00",
        ax: "slag",
        axt: "SLAG",
        ttl: "Fulle slag · matte → gress",
        pills: [["GFGK · 4 sp", "gfgk"]],
        dur: "75 m",
      },
    ],
  },
  {
    dow: "FRE",
    dt: "30",
    mn: "MAI",
    tag: "SRIXON TOUR #2 · R1",
    tagCls: "tour",
    summary: { ct: "2", dur: "9 t 30 m" },
    rows: [
      { time: "06:00", ax: "turn", axt: "TURN", ttl: "Pre-shot oppvarming + range", dur: "90 m" },
      {
        time: "08:42",
        ax: "turn",
        axt: "TURN",
        ttl: "Srixon Tour #2 · R1 · Larvik GK",
        meta: [["flag", "18 hull"]],
        dur: "8 t",
      },
    ],
  },
];

// ───────── B · Slide-over inspector ─────────
export const DIRB_SLIDE = {
  ebLeft: "VALGT · ØKT",
  ebRight: "SLAG · ONS 28/5",
  ttl: "Innspill 50–80 m · presisjon",
  sub: "14:00–15:00 · GFGK · TM bay 3 · CS 80",
  kpis: [
    { v: "60 m", l: "VARIGHET" },
    { v: "4", l: "DRILLS" },
    { v: "CS 80", l: "VANSKE", warn: true },
  ] as { v: string; l: string; warn?: boolean }[],
  drillsLbl: { left: "DRILL-INNHOLD", right: "110 REPS · 60 M" },
  drills: [
    { num: "1.", nm: "Lengdekontroll 50 m", sub: "matte", reps: "30 reps", tm: "15 m" },
    { num: "2.", nm: "Lengdekontroll 65 m", sub: "matte", reps: "30 reps", tm: "15 m" },
    { num: "3.", nm: "Lengdekontroll 80 m", sub: "gress", reps: "30 reps", tm: "15 m" },
    { num: "4.", nm: "Random-mix 50/65/80", sub: "scoring", reps: "20 reps", tm: "15 m" },
  ],
  periodLbl: { left: "PERIODE-FORDELING · U. 19–24", right: "SLAG: 24 / 27 T" },
  period: [
    { l: "TURN", ax: "turn", width: "38%", v: "10 / 10 t" },
    { l: "SPILL", ax: "spill", width: "52%", v: "26 / 30 t" },
    { l: "SLAG", ax: "slag", width: "88%", v: "24 / 27 t" },
    { l: "TEK", ax: "tek", width: "72%", v: "22 / 18 t" },
    { l: "FYS", ax: "fys", width: "88%", v: "18 / 15 t" },
  ] as { l: string; ax: Axis; width: string; v: string }[],
};

// ───────── B · Kanban (5 axis columns, denser cards) ─────────
export const DIRB_KANBAN_COLS: {
  key: Axis;
  lbl: string;
  ct: number;
  cards: { day: string; nm: string; meta: string; selected?: boolean }[];
}[] = [
  {
    key: "fys",
    lbl: "FYS",
    ct: 3,
    cards: [
      { day: "MAN · 07:00", nm: "Morgenmobilitet", meta: "20 m · 3 drills" },
      { day: "TIR · 16:00", nm: "Rotasjonsstyrke + core", meta: "45 m · 5 øv." },
      { day: "TOR · 07:00", nm: "Aktiv hvile + tøy", meta: "30 m" },
    ],
  },
  {
    key: "tek",
    lbl: "TEK",
    ct: 2,
    cards: [
      { day: "TIR · 09:00", nm: "Sekvens P4–P8", meta: "60 m · WANG-gruppe" },
      { day: "TOR · 10:00", nm: "Putt-konsistens 4 m", meta: "60 m · TEST-UKE" },
    ],
  },
  {
    key: "slag",
    lbl: "SLAG",
    ct: 3,
    cards: [
      { day: "MAN · 14:00", nm: "Lengdekontroll 50–80", meta: "75 m · 4 drills" },
      { day: "ONS · 14:00", nm: "Innspill 50–80 m · presisjon", meta: "60 m · CS 80", selected: true },
      { day: "TOR · 15:00", nm: "Fulle slag · matte → gress", meta: "75 m · GFGK" },
    ],
  },
  {
    key: "spill",
    lbl: "SPILL",
    ct: 1,
    cards: [{ day: "ONS · 17:00", nm: "9-hulls spillsimulering", meta: "90 m · scoring" }],
  },
  {
    key: "turn",
    lbl: "TURN",
    ct: 2,
    cards: [
      { day: "FRE · 06:00", nm: "Pre-shot oppvarming + range", meta: "90 m" },
      { day: "FRE · 08:42", nm: "Srixon Tour #2 · R1", meta: "Larvik GK · 18 h" },
    ],
  },
];

// ───────── B · Dashboard ─────────
export const DIRB_DASH_KPIS: {
  eb: string;
  v: string;
  vCls?: "destructive";
  d: string;
  dCls: "up" | "down" | "";
  dIcon: string;
}[] = [
  { eb: "TIMER · UKE 22", v: "12,5 t", d: "+2 t", dCls: "up", dIcon: "trending-up" },
  { eb: "ØKTER · 4 / 5", v: "80 %", d: "−1 vs plan", dCls: "down", dIcon: "trending-down" },
  { eb: "COMPLIANCE · 30 D", v: "88 %", d: "stabil", dCls: "", dIcon: "minus" },
  { eb: "SG · 8 R", v: "−1,1", vCls: "destructive", d: "+0,08", dCls: "up", dIcon: "trending-up" },
];

// B-dashboard reuses DASH_PIE_TOTAL, DASH_PIE_SEG, DASH_TRENDS, DASH_BALANCE
// above — they are identical to the v10 DirBDashboardBody literals.
