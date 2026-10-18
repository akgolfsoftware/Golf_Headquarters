/**
 * Kilde: ui_kits/playerhq/screens/PH-04.jsx, PH-05.jsx, PH-06.jsx, PH-07.jsx.
 * Datamodeller og rene hjelpefunksjoner for PH 04–07 Live-økt gjennomføring.
 *
 * Ingen eksterne API- eller DB-avhengigheter — 100 % enhetstestbar.
 * Token-rene verdier, kun brutto score (hvis aktuelt), ingen hemmeligheter eller PII.
 */

export type AkseType = "slag" | "fys" | "tek" | "spill" | "turn";
export interface FysDrillPlan {
  type?: "styrke" | "kondisjon" | "hold" | "reps";
  sett?: number;
  reps?: number;
  vektKg?: number;
  minutter?: number;
  holdSek?: number;
  pulssone?: string;
  segmenter?: Array<{ minutter: number; pulssone: string }>;
}

export interface DrillItem {
  id: string;
  code: string;
  name: string;
  club: string;
  param?: string;
  quantity: number;
  unit: string;
  minutes: number;
  axis: AkseType;
  repsCompleted?: number;
  hits?: number;
  /** Spillerens kommentar til øvelsen (lagret i live-økta). */
  kommentar?: string;
  /** Antall videoer lagret for øvelsen i denne økta. */
  videoer?: number;
  elapsedSec?: number;
  status?: "done" | "active" | "queued";
  fys?: FysDrillPlan;
}

export interface TrackManShot {
  carry: number;
  clubSpeed: number;
  ballSpeed: number;
  smashFactor: number;
  launchAngle: number;
  clubPath: number;
  timestamp?: string;
  bay?: string;
}

export interface LiveBriefData {
  sessionId: string;
  title: string;
  scheduledTime: string;
  location: string;
  totalMinutes: number;
  belastning: "lav" | "moderat" | "hoy" | null;
  press: "lavt" | "middels" | "hoyt" | "konkurranse" | null;
  goal: string;
  focus: string;
  axis: AkseType;
  trackmanBay?: string;
  drills: DrillItem[];
  canStart: boolean;
  blockReason?: "completed" | "coach" | "tier" | "approval" | null;
}

export interface LiveAktivData {
  sessionId: string;
  title: string;
  totalMinutes: number;
  initialSeconds?: number;
  drills: DrillItem[];
  currentDrillIndex?: number;
  /** "workbench": reps, kommentar og video lagres per øvelse. Uten: bare visning. */
  lagring?: "workbench" | "v2" | "plan";
  eierUserId?: string;
  /** Klokka går bare når økta er aktiv, ikke på pause. */
  pauset?: boolean;
}

export interface SlagtellerData {
  sessionId: string;
  title: string;
  activeDrill: DrillItem | null;
  drillIndex: number;
  totalDrills: number;
  bagClubs: string[];
  selectedClub: string;
  totalShotsGoal: number;
  currentShots: number;
  trackmanShot?: TrackManShot | null;
  isPutterSelected?: boolean;
  counts?: Array<{ club: string; count: number }>;
  countsByClub?: Record<string, number>;
  eierUserId?: string;
}

export interface OktoppsummeringData {
  eierUserId?: string;
  sessionId: string;
  title: string;
  playerName: string;
  dateStr: string;
  timeRangeStr: string;
  totalShots: number;
  actualMinutes: number | null;
  plannedMinutes: number;
  completedDrillsCount: number;
  totalDrillsCount: number;
  dagsform: string;
  axes: Array<{
    axis: AkseType;
    actualMin: number | null;
    plannedMin: number;
  }>;
  drillRows: Array<{
    id: string;
    name: string;
    quantityText: string;
    timeText: string;
    hitsText: string;
  }>;
  note?: string;
  shareWithCoach?: boolean;
}

/** Formater sekunder til "mm:ss" for stoppeklokke */
export function formatClock(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Formater minutter til "X t Y min" eller "X min" */
export function formatTimerOgMinutter(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const timer = Math.floor(safe / 60);
  const rest = safe % 60;
  if (timer === 0) return `${rest} min`;
  if (rest === 0) return `${timer} t`;
  return `${timer} t ${rest} min`;
}

/** Beregn fremdrift i prosent mellom 0 og 100 */
export function beregnProsent(verdi: number, maks: number): number {
  if (maks <= 0) return 0;
  const pct = (verdi / maks) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/** Sjekk om en kølle er en putter */
export function erPutter(club: string): boolean {
  const lower = club.toLowerCase().trim();
  return lower === "p" || lower === "pt" || lower === "putter";
}

/** Formater desimaler pent (f.eks. 1 eller 2 desimaler) */
export function formatDesimal(num: number, desimaler = 1): string {
  return Number(num).toFixed(desimaler).replace(".", ",");
}

/** Standard bag hvis utstyrsbagen er tom */
export const DEFAULT_BAG_CLUBS = [
  "Dr",
  "3W",
  "5W",
  "4I",
  "5I",
  "6I",
  "7I",
  "8I",
  "9I",
  "PW",
  "50",
  "54",
  "58",
  "P",
];
