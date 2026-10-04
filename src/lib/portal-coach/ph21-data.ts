/**
 * PH-21 Innboks & Coach-kontakt — Datamodell og hjelpere
 * Basert på Claude Design PH-21.jsx (Precision Athletics).
 */

export type PH21Tab = "msg" | "q" | "fb" | "vid" | "plan" | "ønske";

export const PH21_TABS: { value: PH21Tab; label: string }[] = [
  { value: "msg", label: "Meldinger" },
  { value: "q", label: "Spørsmål" },
  { value: "fb", label: "Tilbakemelding" },
  { value: "vid", label: "Videoer" },
  { value: "plan", label: "Planer" },
  { value: "ønske", label: "Ønsket økt" },
];

export type PH21Coach = {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl: string | null;
};

export type PH21Message = {
  id: string;
  role: "me" | "coach";
  text: string;
  t: string;
  attach?: string;
};

export type PH21Question = {
  id: string;
  t: string;
  date: string;
  status: "Venter på svar" | "Besvart";
  answer: string | null;
};

export type PH21Feedback = {
  id: string;
  session: string;
  from: "me" | "coach";
  rating: number;
  text: string;
  t: string;
};

export type PH21Video = {
  id: string;
  title: string;
  len: string;
  img: string;
  date: string;
  seen: boolean;
};

export type PH21Plan = {
  id: string;
  title: string;
  sessions: number;
  hours: string;
  sent: string;
  status: "Godtatt" | "Avvist" | "Venter på spiller";
};

export type PH21SessionOption = {
  value: string;
  label: string;
};

export type PH21Data = {
  coach: PH21Coach | null;
  meFornavn: string;
  messages: PH21Message[];
  questions: PH21Question[];
  feedback: PH21Feedback[];
  videos: PH21Video[];
  plans: PH21Plan[];
  recentSessions: PH21SessionOption[];
  isCoached: boolean;
};

/**
 * Validerer og parserer fane-parameter fra URL eller komponent.
 */
export function parsePH21Tab(rawTab?: string | null): PH21Tab {
  if (!rawTab) return "msg";
  const normalized = rawTab.toLowerCase().trim();
  if (
    normalized === "msg" ||
    normalized === "q" ||
    normalized === "fb" ||
    normalized === "vid" ||
    normalized === "plan" ||
    normalized === "ønske" ||
    normalized === "onske"
  ) {
    return (normalized === "onske" ? "ønske" : normalized) as PH21Tab;
  }
  return "msg";
}

/**
 * Formaterer video-varighet fra sekunder til "M:SS".
 */
export function formatVideoVarighet(sec?: number | null): string {
  if (!sec || sec <= 0) return "0:30";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Formaterer dato for visning i PH-21: "26.09.2026" eller "26.09 · 08:14".
 */
export function formatPH21Dato(d: Date | string, includeTime = false): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dateObj.getTime())) return "—";

  const dag = String(dateObj.getDate()).padStart(2, "0");
  const mnd = String(dateObj.getMonth() + 1).padStart(2, "0");
  const aar = dateObj.getFullYear();

  if (!includeTime) {
    return `${dag}.${mnd}.${aar}`;
  }

  const timer = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  return `${dag}.${mnd} · ${timer}:${min}`;
}

/**
 * Beregner badge-tall for faner:
 * - Planer: antall "Venter på spiller"
 * - Videoer: antall usette
 */
export function computePH21TabCounts(data: {
  plans: PH21Plan[];
  videos: PH21Video[];
}): { plan?: number; vid?: number } {
  const pendingPlans = data.plans.filter((p) => p.status === "Venter på spiller").length;
  const unseenVideos = data.videos.filter((v) => !v.seen).length;

  return {
    plan: pendingPlans > 0 ? pendingPlans : undefined,
    vid: unseenVideos > 0 ? unseenVideos : undefined,
  };
}
