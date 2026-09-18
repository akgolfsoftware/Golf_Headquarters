/** Locked planning vocabulary for the Grok demo. No GolfBox I/O. */

export const PERIOD_TYPES = [
  { kode: "GRUNN", navn: "Grunnperiode" },
  { kode: "SPESIAL", navn: "Spesialiseringsperiode" },
  { kode: "TURNERING", navn: "Turneringsperiode" },
  { kode: "EVALUERING", navn: "Evaluering" },
  { kode: "TESTUKE", navn: "Testuke" },
  { kode: "FERIE", navn: "Ferie" },
  { kode: "TRENINGSSAMLING", navn: "Treningssamling" },
  { kode: "HELDAGSSAMLING", navn: "Heldagssamling" },
] as const;

export type PeriodKode = (typeof PERIOD_TYPES)[number]["kode"];

/** A–K from brutto snitt. Age is never an input. [min, max). */
export const AK_BANDS = [
  { kategori: "A", niva: "World Elite", min: null, max: 68 },
  { kategori: "B", niva: "National Elite", min: 68, max: 72 },
  { kategori: "C", niva: "National U21", min: 72, max: 74 },
  { kategori: "D", niva: "Regional Elite", min: 74, max: 76 },
  { kategori: "E", niva: "Regional U18", min: 76, max: 78 },
  { kategori: "F", niva: "Klubbspiller", min: 78, max: 80 },
  { kategori: "G", niva: "Klubbspiller", min: 80, max: 85 },
  { kategori: "H", niva: "Rekrutt", min: 85, max: 90 },
  { kategori: "I", niva: "Rekrutt", min: 90, max: 95 },
  { kategori: "J", niva: "Nybegynner", min: 95, max: 100 },
  { kategori: "K", niva: "Nybegynner", min: 100, max: null },
] as const;

export function kategoriFraSnittscore(snitt: number) {
  const band = AK_BANDS.find(
    (b) => (b.min == null || snitt >= b.min) && (b.max == null || snitt < b.max),
  );
  return band ?? AK_BANDS[AK_BANDS.length - 1];
}

/** H (85) dashed year sketch — labels only, sessions stay empty. */
export const H_SKISSE: { kode: PeriodKode; spenn: string; fokus: string }[] = [
  { kode: "GRUNN", spenn: "jan–mar", fokus: "TEK og spredning · vinter" },
  { kode: "SPESIAL", spenn: "apr–mai", fokus: "SLAG mot sesong" },
  { kode: "TURNERING", spenn: "jun–aug", fokus: "Færre starter enn A–C" },
  { kode: "EVALUERING", spenn: "sep–okt", fokus: "Tester og neste år" },
  { kode: "FERIE", spenn: "jul uke 29–30", fokus: "Fri" },
  { kode: "TESTUKE", spenn: "mar uke 12", fokus: "Samlet test" },
  { kode: "TRENINGSSAMLING", spenn: "feb", fokus: "Samling" },
  { kode: "HELDAGSSAMLING", spenn: "apr", fokus: "Heldag" },
];

export const WEEK_TYPES = ["Utviklingsuke", "Vedlikeholdsuke", "Turneringsuke"] as const;

export type FysOmrade = "STYRKE" | "KONDISJON" | "BEVEGELIGHET";
export type FysHensikt = "oke" | "vedlikehold" | "restitusjon";

export type FysExercise = {
  name: string;
  planSets: number;
  planReps: number;
  planKg: number;
};

export type FysProgram = {
  id: string;
  title: string;
  omrade: FysOmrade;
  sessionsPerWeek: number;
  weeks: number;
  hensikt: FysHensikt;
  sessions: { title: string; exercises: FysExercise[] }[];
};

export const FYS_PROGRAMS: FysProgram[] = [
  {
    id: "fys-host",
    title: "FYS høst · styrke",
    omrade: "STYRKE",
    sessionsPerWeek: 3,
    weeks: 8,
    hensikt: "oke",
    sessions: [
      {
        title: "Økt 1 · mandag",
        exercises: [{ name: "Benkpress", planSets: 4, planReps: 4, planKg: 100 }],
      },
      {
        title: "Økt 2 · onsdag",
        exercises: [{ name: "Knebøy", planSets: 4, planReps: 6, planKg: 80 }],
      },
      {
        title: "Økt 3 · fredag",
        exercises: [{ name: "Markløft", planSets: 3, planReps: 5, planKg: 110 }],
      },
    ],
  },
];

export type RecurrencePolicy = "DENNE" | "DENNE_OG_FREMOVER" | "HELE_SERIEN";

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createSessionSeries(startIso: string, weekdayOffsets: number[], weeks: number) {
  const out: { date: string; sessionIndex: number; week: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    weekdayOffsets.forEach((off, i) => {
      out.push({ date: addDays(startIso, w * 7 + off), sessionIndex: i, week: w });
    });
  }
  return out;
}

export type FysSetLog = {
  id: string;
  planReps: number;
  actualReps: number;
  kg: number;
  rir: number | null;
};

export function rirSuggestion(kg: number, rir: number): number {
  if (rir >= 4) return kg + 5;
  if (rir >= 3) return kg + 2.5;
  if (rir <= 0) return Math.max(20, kg - 5);
  return kg;
}
