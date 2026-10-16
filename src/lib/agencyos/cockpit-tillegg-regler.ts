/**
 * Rene regler for Cockpit-tilleggene (cockpit-tillegg.ts). Ingen database her,
 * så reglene kan testes alene.
 */
import { adherencePct } from "@/lib/workbench/compliance";
import { startOfDay } from "@/lib/uke-helpers";
import type { SessionStatus } from "@/generated/prisma/client";

/** Terskel fra beslutningen: under 70 % to uker på rad. */
export const UTENFOR_PLAN_TERSKEL = 70;
const DAG_MS = 86_400_000;

export type UtenforPlanRad = {
  id: string;
  navn: string;
  /** Prosent uka før forrige og forrige uke. */
  forrige: number;
  siste: number;
  href: string;
};

export type CockpitTurnering = {
  id: string;
  hvem: string;
  navn: string;
  sted: string | null;
  /** Hele dager fra i dag til start. Negativ = startet. */
  dagerTil: number;
};

export type CockpitTillegg = {
  utenforPlan: UtenforPlanRad[];
  /** «UKE 38–39» — ukene tallene gjelder. */
  utenforPlanUker: string;
  turneringer: CockpitTurnering[];
};

export type Okt = { userId: string; navn: string; scheduledAt: Date; durationMin: number; status: SessionStatus };

/**
 * Ren utvelgelse (testet): grupper per spiller og uke, regn adherencePct per
 * uke, behold spillere under terskelen begge ukene. Laveste siste uke først.
 */
export function velgUtenforPlan(okter: readonly Okt[], forrigeUkeStart: Date, naa: Date): UtenforPlanRad[] {
  const ukeFor = new Date(forrigeUkeStart.getTime() - 7 * DAG_MS);
  const perSpiller = new Map<string, { navn: string; uker: [Okt[], Okt[]] }>();
  for (const o of okter) {
    const t = o.scheduledAt.getTime();
    const iForrige = t >= forrigeUkeStart.getTime() && t < forrigeUkeStart.getTime() + 7 * DAG_MS;
    const iUkaFor = t >= ukeFor.getTime() && t < forrigeUkeStart.getTime();
    if (!iForrige && !iUkaFor) continue;
    const s = perSpiller.get(o.userId) ?? { navn: o.navn, uker: [[], []] as [Okt[], Okt[]] };
    s.uker[iForrige ? 1 : 0].push(o);
    perSpiller.set(o.userId, s);
  }
  const rader: UtenforPlanRad[] = [];
  for (const [id, s] of perSpiller) {
    const forrige = adherencePct(s.uker[0], naa);
    const siste = adherencePct(s.uker[1], naa);
    if (forrige == null || siste == null) continue;
    if (forrige >= UTENFOR_PLAN_TERSKEL || siste >= UTENFOR_PLAN_TERSKEL) continue;
    rader.push({ id, navn: s.navn, forrige, siste, href: `/admin/spillere/${id}/plan` });
  }
  return rader.sort((a, b) => a.siste - b.siste || a.navn.localeCompare(b.navn, "nb"));
}

/** Hele kalenderdager fra `fra` til `til` (lokal midnatt, samme konvensjon som uke-helpers). */
export function dagerMellom(fra: Date, til: Date): number {
  return Math.round((startOfDay(til).getTime() - startOfDay(fra).getTime()) / DAG_MS);
}
