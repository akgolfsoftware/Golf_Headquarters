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

/** Stallens etterlevelse én uke: gjennomført tid mot planlagt, bare forfalte økter. */
export type UkeEtterlevelse = { uke: number; pct: number | null };

/** Øktene denne uka: gjennomført mot planlagt (avlyste teller ikke). */
export type StallensUke = { uke: number; gjennomfort: number; planlagt: number };

export type CockpitTillegg = {
  utenforPlan: UtenforPlanRad[];
  /** «UKE 38–39» — ukene tallene gjelder. */
  utenforPlanUker: string;
  turneringer: CockpitTurnering[];
  /** De tre siste hele ukene og denne uka, eldste først. */
  etterlevelse: UkeEtterlevelse[];
  stallensUke: StallensUke;
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

/**
 * Stallens etterlevelse per uke (testet): alle øktene i coachens stall samlet,
 * samme regel som «Følger ikke planen» (adherencePct, bare forfalte økter).
 * En uke uten forfalte økter gir null, aldri 0.
 */
export function etterlevelsePerUke(okter: readonly Okt[], uker: readonly { start: Date; uke: number }[], naa: Date): UkeEtterlevelse[] {
  return uker.map(({ start, uke }) => {
    const fra = start.getTime(), til = fra + 7 * DAG_MS;
    const iUka = okter.filter((o) => o.scheduledAt.getTime() >= fra && o.scheduledAt.getTime() < til);
    return { uke, pct: adherencePct(iUka, naa) };
  });
}

/** Øktene denne uka (testet): planlagt = alle unntatt avlyste, gjennomført = COMPLETED. */
export function stallensUke(okter: readonly Okt[], ukeStart: Date, uke: number): StallensUke {
  const fra = ukeStart.getTime(), til = fra + 7 * DAG_MS;
  const iUka = okter.filter((o) => o.scheduledAt.getTime() >= fra && o.scheduledAt.getTime() < til && o.status !== "CANCELLED");
  return { uke, planlagt: iUka.length, gjennomfort: iUka.filter((o) => o.status === "COMPLETED").length };
}

/** Stallen som rørledning i Cockpit: samme status som AG-07 Stall (stall-status.ts). */
export type StallRorledning = {
  total: number;
  trenger: { antall: number; grunner: { label: string; antall: number }[] };
  folger: { antall: number; ingenPlan: number };
  hviler: { antall: number; grunner: { label: string; antall: number }[] };
};

function tellLabels(rader: readonly { statusLabel: string }[]) {
  const m = new Map<string, number>();
  for (const r of rader) m.set(r.statusLabel, (m.get(r.statusLabel) ?? 0) + 1);
  return [...m].map(([label, antall]) => ({ label, antall })).sort((a, b) => b.antall - a.antall || a.label.localeCompare(b.label, "nb"));
}

/** Ren gruppering (testet): bak/inaktiv/veil = Trenger deg, aktiv = Følger planen, hviler = Hviler. */
export function stallRorledning(rader: readonly { status: string; statusLabel: string }[]): StallRorledning {
  const trenger = rader.filter((r) => r.status === "bak" || r.status === "inaktiv" || r.status === "veil");
  const folger = rader.filter((r) => r.status === "aktiv");
  const hviler = rader.filter((r) => r.status === "hviler");
  return {
    total: rader.length,
    trenger: { antall: trenger.length, grunner: tellLabels(trenger) },
    folger: { antall: folger.length, ingenPlan: folger.filter((r) => r.statusLabel === "Ingen plandata").length },
    hviler: { antall: hviler.length, grunner: tellLabels(hviler) },
  };
}
