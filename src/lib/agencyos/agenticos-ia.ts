/**
 * AgenticOS indre IA (T12 visuell, AO-00).
 *
 * AgencyOS-railen (AX-01) er urørt: Stall · Workbench · Kø · Jarvis · Meg.
 * Jarvis peker hit. Denne fila eier destinasjonene INNI AgenticOS:
 * Cockpit · Kø · Godkjenn · Projects · Runtimes · Skills.
 *
 * B1: ok-grønn finnes ikke her — den er Player Godta. Fullført = warm hake.
 * J-B: e-post er av. Publisering av økter er låst av.
 */

export const AGENTICOS_AREAS = [
  "AKADEMI",
  "PRODUKT",
  "AGENTICOS",
  "OKONOMI",
  "INNHOLD",
  "PERSONLIG",
  "DRIFT",
] as const;

export type AgenticosAreaId = (typeof AGENTICOS_AREAS)[number];

export const AGENTICOS_AREA_LABEL: Record<AgenticosAreaId, string> = {
  AKADEMI: "Akademi",
  PRODUKT: "Produkt",
  AGENTICOS: "AgenticOS",
  OKONOMI: "Økonomi",
  INNHOLD: "Innhold",
  PERSONLIG: "Personlig",
  DRIFT: "Drift",
};

export type AgenticosNavId = "cockpit" | "ko" | "godkjenn" | "projects" | "runtimes" | "skills";

export type AgenticosNavTab = {
  id: AgenticosNavId;
  label: string;
  href: string;
};

export const AGENTICOS_NAV: AgenticosNavTab[] = [
  { id: "cockpit", label: "Cockpit", href: "/admin/agenticos" },
  { id: "ko", label: "Kø", href: "/admin/agenticos/ko" },
  { id: "godkjenn", label: "Godkjenn", href: "/admin/agenticos/godkjenn" },
  { id: "projects", label: "Projects", href: "/admin/agenticos/projects" },
  { id: "runtimes", label: "Runtimes", href: "/admin/agenticos/runtimes" },
  { id: "skills", label: "Skills", href: "/admin/agenticos/skills" },
];

export function agenticosNavAktiv(pathname: string): AgenticosNavId {
  const p = pathname.split("?")[0] ?? pathname;
  if (p.startsWith("/admin/agenticos/ko")) return "ko";
  if (p.startsWith("/admin/agenticos/godkjenn")) return "godkjenn";
  if (p.startsWith("/admin/agenticos/projects")) return "projects";
  if (p.startsWith("/admin/agenticos/runtimes")) return "runtimes";
  if (p.startsWith("/admin/agenticos/skills")) return "skills";
  return "cockpit";
}

const AREA_FOR_SLUG: Record<string, AgenticosAreaId> = {
  "round-agent": "AKADEMI",
  "test-agent": "AKADEMI",
  "trackman-agent": "AKADEMI",
  "sg-analyse-ekspert": "AKADEMI",
  "treningsdata-ekspert": "AKADEMI",
  "achievement-agent": "AKADEMI",
  "live-coach-agent": "AKADEMI",
  "swing-video-analyst": "AKADEMI",
  "plan-watcher": "AKADEMI",
  "training-gap": "AKADEMI",
  "turnering-agent": "AKADEMI",
  "weekly-plan-proposals": "AKADEMI",
  "plan-effectiveness-agent": "AKADEMI",
  "plan-revisjon": "AKADEMI",
  "caddie-proactive": "AKADEMI",
  "drill-forslag": "AKADEMI",
  "ukesrapport-ovelser": "AKADEMI",
  "wagr-sync": "AKADEMI",
  "ai-code-reviewer": "PRODUKT",
  "sync-vaktbikkje": "PRODUKT",
  "cleanup-recordings": "AGENTICOS",
  "tripletex-lonn-sjekkliste": "OKONOMI",
  "tripletex-maanedsavslutning": "OKONOMI",
  "betalings-purring": "OKONOMI",
  "social-media": "INNHOLD",
  "media-lofte": "INNHOLD",
  "daily-brief": "PERSONLIG",
  "churn-radar": "DRIFT",
  "winback-agent": "DRIFT",
  "lead-oppfolging": "DRIFT",
  "calendar-sync": "DRIFT",
  "refresh-calendar-watches": "DRIFT",
  "booking-reminders": "DRIFT",
  "booking-conflict-monitor": "DRIFT",
  "24-7-booking-alerts": "DRIFT",
  "availability-gap-filler": "DRIFT",
  "availability-24-7-monitor": "DRIFT",
  "booking-optimizer": "DRIFT",
  "demand-predictor": "DRIFT",
  "gfgk-ballplukking-sjekk": "DRIFT",
  "mulligan-vaskeliste-sjekk": "DRIFT",
};

export function areaForAgent(slug: string): AgenticosAreaId {
  return AREA_FOR_SLUG[slug] ?? "AGENTICOS";
}

export function areaLabel(id: AgenticosAreaId): string {
  return AGENTICOS_AREA_LABEL[id];
}

/** AO-09 — hva agenten får lov til. Ikke persistente brytere. */
export type AgenticosSkill = {
  id: string;
  tittel: string;
  meta: string;
  paa: boolean;
  /** Kan ikke skrus på. */
  las: boolean;
};

export const AGENTICOS_SKILLS: AgenticosSkill[] = [
  {
    id: "lese-trackman",
    tittel: "Lese TrackMan-data",
    meta: "Kun lesing · alle runtimes",
    paa: true,
    las: false,
  },
  {
    id: "foresla-okter",
    tittel: "Foreslå økter som utkast",
    meta: "Via godkjenn-kø · aldri direkte til Workbench",
    paa: true,
    las: false,
  },
  {
    id: "skrive-kunnskap",
    tittel: "Skrive til kunnskapsbase",
    meta: "Via godkjenn-kø",
    paa: true,
    las: false,
  },
  {
    id: "sende-epost",
    tittel: "Sende e-post",
    meta: "Av — utkast havner i godkjenn-kø",
    paa: false,
    las: true,
  },
  {
    id: "publisere-okter",
    tittel: "Publisere økter",
    meta: "Alltid av — publisering er forbeholdt coach i Workbench",
    paa: false,
    las: true,
  },
];

export type AgenticosRuntimeKind = "SKY" | "LOKAL";

export type AgenticosRuntime = {
  id: string;
  navn: string;
  kind: AgenticosRuntimeKind;
  startRegel: string;
  meta: string;
  /** Koblet i denne appen. Usann = vises som av, ingen oppdiktet helse. */
  koblet: boolean;
};

export const AGENTICOS_RUNTIMES: AgenticosRuntime[] = [
  { id: "claude", navn: "Claude", kind: "SKY", startRegel: "Krever start-godkjenning", meta: "resonnering, tekst", koblet: true },
  { id: "cowork", navn: "Cowork", kind: "SKY", startRegel: "Krever start-godkjenning", meta: "dokumenter, design", koblet: false },
  { id: "claude-code", navn: "Claude Code", kind: "LOKAL", startRegel: "Krever start ved skriv", meta: "CLI på Macen · kode, filer", koblet: false },
  { id: "grok", navn: "Grok", kind: "SKY", startRegel: "Krever start-godkjenning", meta: "sanntid, søk", koblet: false },
  { id: "gemini", navn: "Gemini", kind: "SKY", startRegel: "Krever start-godkjenning", meta: "lange dokumenter", koblet: false },
  { id: "opencode", navn: "OpenCode", kind: "LOKAL", startRegel: "Krever start ved skriv", meta: "CLI på Macen · kode", koblet: false },
  { id: "ollama", navn: "Ollama", kind: "LOKAL", startRegel: "Auto-start ved kun les", meta: "data forlater ikke maskinen", koblet: false },
];

const PLAN_SKRIV = new Set([
  "PYRAMID_ADJUST",
  "TRAINING_GAP",
  "SESSION_ADD",
  "SESSION_REMOVE",
  "SESSION_SWAP",
  "INTENSITY_ADJUST",
  "FOCUS_CHANGE",
  "PERIOD_SWITCH",
  "DRILL_SWAP",
  "REST_DAY_ADD",
  "TAPER_ENGAGE",
  "DRILL_SUGGEST",
  "TEST_SCHEDULE",
  "RECOVERY_ADD",
  "DELOAD",
  "PLAN_CHANGE",
  "WEEK_SHIFT",
  "WEEKLY_PROPOSAL",
]);

export type GodkjennMerke = "plan" | "kunnskap" | "task" | "utkast" | "resultat";

export function godkjennMerkeFor(actionType: string): GodkjennMerke {
  if (actionType === "SOCIAL_POST" || actionType === "CHURN_MESSAGE") return "utkast";
  if (actionType === "TM_BASELINE_PROPOSE") return "kunnskap";
  if (PLAN_SKRIV.has(actionType)) return "plan";
  return "resultat";
}

export const GODKJENN_MERKE_LABEL: Record<GodkjennMerke, string> = {
  plan: "Skriver til plan",
  kunnskap: "Skriver til kunnskap",
  task: "Oppretter task",
  utkast: "Utkast — sendes ikke",
  resultat: "Venter resultat",
};

const DAG_KORT: Record<string, string> = {
  man: "Man",
  tir: "Tir",
  ons: "Ons",
  tor: "Tor",
  fre: "Fre",
  lør: "Lør",
  lor: "Lør",
  søn: "Søn",
  son: "Søn",
};

/** Fasit: «Man 24.08 · 09.42» — Oslo, punktum i klokkeslett. */
export function agenticosNaTekst(d: Date = new Date()): string {
  const deler = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(d);
  const ukedagRaw = (deler.find((p) => p.type === "weekday")?.value ?? "").replace(".", "").toLowerCase();
  const ukedag = DAG_KORT[ukedagRaw] ?? (ukedagRaw.slice(0, 1).toUpperCase() + ukedagRaw.slice(1, 3));
  const dag = deler.find((p) => p.type === "day")?.value ?? "";
  const mnd = deler.find((p) => p.type === "month")?.value ?? "";
  const tid = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(":", ".");
  return `${ukedag} ${dag}.${mnd} · ${tid}`;
}

export function agenticosKlokke(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(":", ".");
}

export function selskapTilArea(selskap: string): AgenticosAreaId {
  const s = selskap.toLowerCase();
  if (s.includes("mulligan")) return "DRIFT";
  if (s.includes("skarp")) return "OKONOMI";
  if (s.includes("privat") || s.includes("person")) return "PERSONLIG";
  if (s.includes("wang") || s.includes("ak golf") || s.includes("akademi")) return "AKADEMI";
  if (s.includes("innhold") || s.includes("some")) return "INNHOLD";
  return "PRODUKT";
}
