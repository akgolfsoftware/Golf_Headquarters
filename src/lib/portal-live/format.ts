/**
 * Live-økt visnings-helpers — client-safe (INGEN Prisma/server-import).
 * Skilt ut fra data.ts (som har Prisma) så "use client"-komponenter kan
 * importere disse uten å dra server-only kode inn i browser-bundelen.
 */

import type { PyramidArea } from "@/generated/prisma/client";

export const AXIS_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

/** Formaterer ISO-dato til "ONS 28 MAI" (caps eyebrow). */
export function formatDateEyebrow(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("nb-NO", { weekday: "short", day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(/\.$/, "")
    .replace(/\./g, "");
}

/** Formaterer ISO-dato til "ONS 28 MAI · 14:30" (med klokkeslett). */
export function formatDateTimeEyebrow(iso: string): string {
  const d = new Date(iso);
  const dato = formatDateEyebrow(iso);
  const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${dato} · ${tid}`;
}

/** Sekunder → "MM:SS". */
export function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
