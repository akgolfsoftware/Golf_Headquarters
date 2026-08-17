/**
 * Ren batching-logikk for planendrings-varsling til valgt coach (G4) —
 * groupKey-bygging og varseltekst. Ingen IO; enhetstestet i
 * src/lib/__tests__/notifications/plan-endring-kjerne.test.ts.
 * DB-oppslag og notify-kall bor i ./plan-endring.ts.
 */

import { startOfDay } from "@/lib/uke-helpers";

export type PlanEndringsType = "FLYTTET" | "OPPRETTET" | "SLETTET" | "PLANBYTTE";

export const PLAN_ENDRING_TITTEL = "Planendring";

/**
 * Norsk kalenderdag som «YYYY-MM-DD». Går via uke-helpers' startOfDay
 * (Oslo-korrekt) — ALDRI rå Date-metoder på now (gotcha: Vercel kjører UTC).
 * startOfDay returnerer lokal midnatt på den norske kalenderdagen, så lokale
 * gettere leser riktig dag uansett server-tidssone (UTC eller Oslo).
 */
export function osloDagKey(dato: Date): string {
  const d = startOfDay(dato);
  const maned = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${maned}-${dag}`;
}

/** Prefiks for alle planendrings-varsler for én spiller — brukes av les-kvitteringen. */
export function byggPlanEndringGroupKeyPrefix(spillerId: string): string {
  return `plan-endring:${spillerId}:`;
}

/** Én ulest rad per spiller per Oslo-dag: plan-endring:<spillerId>:<YYYY-MM-DD>. */
export function byggPlanEndringGroupKey(spillerId: string, dato: Date): string {
  return `${byggPlanEndringGroupKeyPrefix(spillerId)}${osloDagKey(dato)}`;
}

const FORSTE_ENDRING_BODY: Record<PlanEndringsType, (navn: string) => string> = {
  FLYTTET: (navn) => `${navn} flyttet en økt i planen`,
  OPPRETTET: (navn) => `${navn} la til en ny økt i planen`,
  SLETTET: (navn) => `${navn} slettet en økt fra planen`,
  PLANBYTTE: (navn) => `${navn} byttet aktiv plan`,
};

/**
 * Varseltekst: første endring i dagens vindu er spesifikk per endringstype;
 * fra og med andre endring samles de («{navn} endret {count} økter i planen i dag»).
 */
export function byggPlanEndringBody(
  navn: string,
  count: number,
  endringsType: PlanEndringsType,
): string {
  if (count <= 1) return FORSTE_ENDRING_BODY[endringsType](navn);
  return `${navn} endret ${count} økter i planen i dag`;
}
