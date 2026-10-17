/**
 * Gruppeanalyse (AG-A03) for én gruppe — /admin/grupper/[id]/analyse.
 * Grunnlaget er hentet fra PR #1024 (claude/agencyos-aga03-gruppeanalyse-0930), som aldri ble lagt inn.
 *
 * Kilde for økter: `WorkbenchSession` (OW-3, den ene økt-tabellen) med samme
 * statuskart som Spiller 360 og Workbench, så samme spiller får samme prosent overalt.
 *
 * Etterlevelse = gjennomførte minutter / planlagte minutter, siste 4 uker,
 * bare forfalte økter (beslutninger.md §KARTLEGGINGSØKT FJERNES, 26.09). Regelen
 * bor i `adherencePct` (src/lib/workbench/compliance.ts). Mangler forfalte økter,
 * er tallet `null` og vises som «—».
 *
 * Datadekning = om hver spiller har minst én forfalt økt i vinduet. Ingen navn
 * og ingen rangering: gruppeanalysen viser snitt (utkast-agencyos/mer.html).
 */

import { prisma } from "@/lib/prisma";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { adherencePct, oktCompliance } from "@/lib/workbench/compliance";
import type { SessionStatus } from "@/generated/prisma/client";

export const ETTERLEVELSE_UKER = 4;
const DAG_MS = 86_400_000;
export const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type Akse = (typeof AKSER)[number];

export type OktInn = { userId: string; scheduledAt: Date; durationMin: number; status: SessionStatus; akse: string };

export type EnGruppeAnalyse = {
  uker: number;
  antallSpillere: number;
  etterlevelsePct: number | null;
  gjennomfortMin: number;
  planlagtMin: number;
  perAkse: { akse: Akse; pct: number | null; planlagtMin: number }[];
  /** Én verdi per spiller (uten navn): har minst én forfalt økt. */
  dekning: boolean[];
};

/** WorkbenchSession.status → compliance-vokabularet (samme tabell som spiller360-data.ts og load-workbench.ts). */
const WB_TIL_SESSION: Record<string, SessionStatus> = {
  SCHEDULED: "PLANNED", PUBLISHED: "PLANNED", PLANNED: "PLANNED", IN_PROGRESS: "ACTIVE",
  COMPLETED: "COMPLETED", CANCELLED: "CANCELLED", SKIPPED: "SKIPPED",
};

/** `date` (@db.Date, UTC-midnatt for Oslo-dagen) + startMinute → tidspunkt. */
export function wbTid(date: Date, startMinute: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, startMinute));
}

export function oktFraWorkbench(o: { playerId: string; date: Date; startMinute: number; durationMinutes: number; status: string; pyramid: string }): OktInn {
  return { userId: o.playerId, scheduledAt: wbTid(o.date, o.startMinute), durationMin: o.durationMinutes, status: WB_TIL_SESSION[o.status] ?? "PLANNED", akse: o.pyramid };
}

function minutter(okter: OktInn[], now: Date) {
  let gjennomfort = 0;
  let planlagt = 0;
  for (const o of okter) {
    if (oktCompliance(o, now) === "fremtidig") continue;
    planlagt += o.durationMin;
    if (o.status === "COMPLETED") gjennomfort += o.durationMin;
  }
  return { gjennomfort, planlagt };
}

/** Ren aggregering — testes uten database. */
export function byggEnGruppeAnalyse(spillerIds: readonly string[], okter: readonly OktInn[], now: Date): EnGruppeAnalyse {
  const ids = [...new Set(spillerIds)];
  const iGruppa = okter.filter((o) => ids.includes(o.userId));
  const { gjennomfort, planlagt } = minutter(iGruppa, now);
  return {
    uker: ETTERLEVELSE_UKER,
    antallSpillere: ids.length,
    etterlevelsePct: adherencePct(iGruppa, now),
    gjennomfortMin: gjennomfort,
    planlagtMin: planlagt,
    perAkse: AKSER.map((akse) => {
      const a = iGruppa.filter((o) => o.akse === akse);
      return { akse, pct: adherencePct(a, now), planlagtMin: minutter(a, now).planlagt };
    }),
    dekning: ids.map((id) => iGruppa.some((o) => o.userId === id && oktCompliance(o, now) !== "fremtidig")),
  };
}

/** `spillerIds` må allerede være avgrenset av siden (aktive spillermedlemmer i en gruppe coachen har innsyn i). */
export async function lastEnGruppeAnalyse(spillerIds: readonly string[], now = new Date()): Promise<EnGruppeAnalyse> {
  const idag = osloDagSomDbDato(now);
  const fra = new Date(idag.getTime() - ETTERLEVELSE_UKER * 7 * DAG_MS);
  const okter = spillerIds.length === 0 ? [] : await prisma.workbenchSession.findMany({
    where: { playerId: { in: [...spillerIds] }, date: { gte: fra, lte: idag }, status: { not: "DRAFT" }, isTemplate: false },
    select: { playerId: true, date: true, startMinute: true, durationMinutes: true, status: true, pyramid: true },
  });
  return byggEnGruppeAnalyse(spillerIds, okter.map(oktFraWorkbench), now);
}
