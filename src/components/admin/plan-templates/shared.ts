/**
 * Felles helpers for plan-template-redaktøren.
 * Holdes som ren TS slik at den kan importeres fra både server- og klient-komponenter.
 */

import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";

export type DisciplinFordeling = {
  FYS: number;
  TEK: number;
  SLAG: number;
  SPILL: number;
  TURN: number;
};

export type DrillEntry = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  csTarget?: number;
  notes?: string;
};

export const KATEGORI_ALLE: NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

// Primær-rad i 5x3-grid — Anders sin hovedakse
export const KATEGORI_PRIMARY: NgfKategori[] = ["B", "E", "H", "K", "L"];

export const FASE_ALLE: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];

export const FASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunn",
  SPESIAL: "Spesial",
  TURNERING: "Turnering",
};

export const KATEGORI_LABEL: Record<NgfKategori, string> = {
  A: "A — OWGR Top 150",
  B: "B — Nasjonal elite",
  C: "C — Elite-amatør",
  D: "D — Lavt proff",
  E: "E — Scratch",
  F: "F — HCP 0-3",
  G: "G — HCP 3-5",
  H: "H — HCP 5-9",
  I: "I — HCP 9-12",
  J: "J — HCP 12-15",
  K: "K — HCP 15-25",
  L: "L — Junior klubb",
};

export const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys, #A32D2D)",
  TEK: "var(--color-pyr-tek, #005840)",
  SLAG: "var(--color-pyr-slag, #D1F843)",
  SPILL: "var(--color-pyr-spill, #E0B82A)",
  TURN: "var(--color-pyr-turn, #1F2937)",
};

export const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee total",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Around green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

export const ENV_LABEL: Record<SessionEnvironment, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

export const DAG_LABEL = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

// Standard discipline-fordeling per nivå (referanse for sammenligning).
export const ANBEFALT_FORDELING_PER_KATEGORI: Record<NgfKategori, DisciplinFordeling> = {
  A: { FYS: 0.15, TEK: 0.20, SLAG: 0.25, SPILL: 0.25, TURN: 0.15 },
  B: { FYS: 0.15, TEK: 0.20, SLAG: 0.25, SPILL: 0.25, TURN: 0.15 },
  C: { FYS: 0.15, TEK: 0.22, SLAG: 0.25, SPILL: 0.23, TURN: 0.15 },
  D: { FYS: 0.15, TEK: 0.25, SLAG: 0.25, SPILL: 0.20, TURN: 0.15 },
  E: { FYS: 0.15, TEK: 0.25, SLAG: 0.25, SPILL: 0.20, TURN: 0.15 },
  F: { FYS: 0.15, TEK: 0.28, SLAG: 0.25, SPILL: 0.20, TURN: 0.12 },
  G: { FYS: 0.15, TEK: 0.30, SLAG: 0.25, SPILL: 0.18, TURN: 0.12 },
  H: { FYS: 0.10, TEK: 0.32, SLAG: 0.25, SPILL: 0.20, TURN: 0.13 },
  I: { FYS: 0.10, TEK: 0.35, SLAG: 0.25, SPILL: 0.20, TURN: 0.10 },
  J: { FYS: 0.10, TEK: 0.38, SLAG: 0.22, SPILL: 0.20, TURN: 0.10 },
  K: { FYS: 0.10, TEK: 0.40, SLAG: 0.20, SPILL: 0.20, TURN: 0.10 },
  L: { FYS: 0.10, TEK: 0.45, SLAG: 0.15, SPILL: 0.25, TURN: 0.05 },
};

export function readFordeling(value: unknown): DisciplinFordeling {
  const defaultV: DisciplinFordeling = {
    FYS: 0.2,
    TEK: 0.3,
    SLAG: 0.25,
    SPILL: 0.2,
    TURN: 0.05,
  };
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultV;
  const v = value as Record<string, unknown>;
  function num(key: keyof DisciplinFordeling): number {
    const raw = v[key];
    if (typeof raw !== "number" || Number.isNaN(raw)) return defaultV[key];
    // Tillat enten 0-1 eller 0-100
    return raw > 1 ? raw / 100 : raw;
  }
  return {
    FYS: num("FYS"),
    TEK: num("TEK"),
    SLAG: num("SLAG"),
    SPILL: num("SPILL"),
    TURN: num("TURN"),
  };
}

export function readDrills(value: unknown): DrillEntry[] {
  if (!Array.isArray(value)) return [];
  const result: DrillEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const exerciseId = typeof r.exerciseId === "string" ? r.exerciseId : null;
    if (!exerciseId) continue;
    result.push({
      exerciseId,
      sets: typeof r.sets === "number" ? r.sets : undefined,
      reps: typeof r.reps === "number" ? r.reps : undefined,
      csTarget: typeof r.csTarget === "number" ? r.csTarget : undefined,
      notes: typeof r.notes === "string" ? r.notes : undefined,
    });
  }
  return result;
}

export function donutGradient(fordeling: DisciplinFordeling): string {
  const order: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
  const total = order.reduce((sum, k) => sum + fordeling[k], 0) || 1;
  let acc = 0;
  const stops = order.map((k) => {
    const start = (acc / total) * 360;
    acc += fordeling[k];
    const end = (acc / total) * 360;
    return `${PYR_COLOR[k]} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function splitTitle(name: string): { lead: string; rest: string } {
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { lead: "", rest: name };
  return { lead: parts.slice(0, parts.length - 1).join(" "), rest: parts[parts.length - 1] };
}
