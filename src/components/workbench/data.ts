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
