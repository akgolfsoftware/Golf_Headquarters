/**
 * Hvilken periode i årsplanen en uke ligger i (PH-11 Workbench · Uke, «Grunnperiode 1 · uke 3 av 8»).
 * Ren logikk. Uka hører til perioden som dekker torsdagen. Hendelser i årsplanen (testuke,
 * samlinger) er ikke treningsperioder og velges bare når ingen periode dekker uka.
 */
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import type { PyramidArea, YearPeriodBand } from "@/lib/domain/workbench/types";

const PERIODE_NAVN: Record<YearPeriodBand["type"], string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", TURNERING: "Turneringsperiode", EVALUERING: "Evaluering",
  TESTUKE: "Testuke", FERIE: "Ferie", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling", RESTITUSJON: "Restitusjon",
};
const HENDELSER = new Set<YearPeriodBand["type"]>(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);

export type UkePeriode = {
  navn: string;
  ukeIPerioden: number;
  antallUker: number;
  slutt: string;
  fordelt: Partial<Record<PyramidArea, number>> | null;
};

const ukerMellom = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / (7 * 86_400_000));

export function periodeForUke(perioder: readonly YearPeriodBand[], weekStart: string): UkePeriode | null {
  const torsdag = addDays(weekStart, 3);
  const dekker = perioder.filter((p) => p.startDate <= torsdag && torsdag <= p.endDate);
  const p = dekker.find((x) => !HENDELSER.has(x.type)) ?? dekker[0];
  if (!p) return null;
  const forste = mondayOf(p.startDate), siste = mondayOf(p.endDate);
  // Nummeret («Grunnperiode 1») teller perioder av samme type i året, i rekkefølge.
  const sammeType = perioder.filter((x) => x.type === p.type).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const nr = sammeType.length > 1 ? ` ${sammeType.findIndex((x) => x.id === p.id) + 1}` : "";
  const fordelt = p.axisMinutes && Object.values(p.axisMinutes).some((v) => (v ?? 0) > 0) ? p.axisMinutes : null;
  return {
    navn: `${PERIODE_NAVN[p.type]}${nr}`,
    ukeIPerioden: ukerMellom(forste, mondayOf(weekStart)) + 1,
    antallUker: ukerMellom(forste, siste) + 1,
    slutt: p.endDate,
    fordelt,
  };
}
