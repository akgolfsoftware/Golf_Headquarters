/**
 * AG-10 oversikt (/admin/plan/teknisk): én rad per spiller i coachens stall med
 * spillerens tekniske plan. Leste før TEK-økter fra TrainingPlan; nå
 * TechnicalPlan (samme modell som PH-TP-01 og AG-10). Ren modul, testet.
 */

import { dato } from "@/lib/teknisk-plan/tp-visning";

export type OversiktPlanInn = {
  id: string;
  navn: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  startDato: Date;
  positions: { tasks: { status: string; repsMaalDry: number; repsMaalLav: number; repsMaalFull: number; repsGjortDry: number; repsGjortLav: number; repsGjortFull: number; lastRepLoggedAt: Date | null }[] }[];
};

export type OversiktRad = {
  id: string;
  navn: string;
  planId: string | null;
  planNavn: string | null;
  status: "Aktiv" | "Utkast" | "Arkivert" | null;
  oppgaver: number;
  gjort: number;
  maal: number;
  sistRegistrert: string;
  antallPlaner: number;
};

const STATUS = { ACTIVE: "Aktiv", DRAFT: "Utkast", ARCHIVED: "Arkivert" } as const;

/** Planen som vises: aktiv først, så utkast, så nyeste start. */
export function velgPlan<T extends Pick<OversiktPlanInn, "status" | "startDato">>(planer: readonly T[]): T | null {
  const rang = { ACTIVE: 0, DRAFT: 1, ARCHIVED: 2 } as const;
  return [...planer].sort((a, b) => rang[a.status] - rang[b.status] || b.startDato.getTime() - a.startDato.getTime())[0] ?? null;
}

export function oversiktRad(spiller: { id: string; name: string | null }, planer: readonly OversiktPlanInn[]): OversiktRad {
  const p = velgPlan(planer);
  const oppgaver = p ? p.positions.flatMap((x) => x.tasks).filter((t) => t.status !== "ARCHIVED") : [];
  const siste = oppgaver.map((t) => t.lastRepLoggedAt).filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  return {
    id: spiller.id,
    navn: spiller.name ?? "—",
    planId: p?.id ?? null,
    planNavn: p?.navn ?? null,
    status: p ? STATUS[p.status] : null,
    oppgaver: oppgaver.length,
    gjort: oppgaver.reduce((s, t) => s + t.repsGjortDry + t.repsGjortLav + t.repsGjortFull, 0),
    maal: oppgaver.reduce((s, t) => s + t.repsMaalDry + t.repsMaalLav + t.repsMaalFull, 0),
    sistRegistrert: dato(siste),
    antallPlaner: planer.length,
  };
}
