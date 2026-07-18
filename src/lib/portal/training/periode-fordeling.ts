// periode-fordeling.ts — coach-satt pyramide-fordeling per periode (fase 1).
//
// Gjør de hardkodede min/maks-pyramide-andelene i PERIODE_CONSTRAINTS
// redigerbare: en global akademi-standard lagres i PeriodeFordeling (én rad per
// PeriodeType). Denne resolveren fletter de satte radene PÅ defaultene og gir en
// effektiv constraints-map som invariantene (canon/invarianter.ts) og
// validateSessionConstraints kan bruke via kontekst.
//
// Prinsipp: finnes ingen rad for en periode → dagens hardkodede default gjelder.
// Så en fersk deploy uten rader er 100 % identisk med gammel oppførsel.
// Kun pyramide-min/maks er redigerbart i fase 1; lFase/praksis/volum arves fra
// default. Anbefalingsmotoren (fase 2) skrives som eget lag oppå denne tabellen.

import type { PeriodeType, PyramidArea } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PERIODE_CONSTRAINTS, type PeriodeConstraints } from "./periode-constraints";

/** Lagret rad-form (speiler PeriodeFordeling-modellen — de 10 andels-feltene). */
export type FordelingRad = {
  periodeType: string;
  minFys: number;
  maxFys: number;
  minTek: number;
  maxTek: number;
  minSlag: number;
  maxSlag: number;
  minSpill: number;
  maxSpill: number;
  minTurn: number;
  maxTurn: number;
};

/** Min/maks-% per pyramide-område for én periode (UI-vennlig form). */
export type OmradeFordeling = {
  min: Record<PyramidArea, number>;
  max: Record<PyramidArea, number>;
};

const PERIODE_TYPER = Object.keys(PERIODE_CONSTRAINTS) as PeriodeType[];

function radTilOmrade(r: FordelingRad): OmradeFordeling {
  return {
    min: { FYS: r.minFys, TEK: r.minTek, SLAG: r.minSlag, SPILL: r.minSpill, TURN: r.minTurn },
    max: { FYS: r.maxFys, TEK: r.maxTek, SLAG: r.maxSlag, SPILL: r.maxSpill, TURN: r.maxTurn },
  };
}

/**
 * REN: flett coach-satte rader på defaultene. Ukjent/ugyldig periodeType
 * ignoreres. lFase/praksis/volum beholdes fra default — kun pyramide byttes.
 */
export function flettFordeling(rader: FordelingRad[]): Record<PeriodeType, PeriodeConstraints> {
  const ut = {} as Record<PeriodeType, PeriodeConstraints>;
  for (const t of PERIODE_TYPER) {
    const d = PERIODE_CONSTRAINTS[t];
    ut[t] = { ...d, minPyramide: { ...d.minPyramide }, maxPyramide: { ...d.maxPyramide } };
  }
  for (const r of rader) {
    if (!PERIODE_TYPER.includes(r.periodeType as PeriodeType)) continue;
    const t = r.periodeType as PeriodeType;
    const { min, max } = radTilOmrade(r);
    ut[t] = { ...ut[t], minPyramide: min, maxPyramide: max };
  }
  return ut;
}

/**
 * Effektive constraints (coach-satt flettet på default). Leser PeriodeFordeling;
 * feiler lesningen (tabell mangler i preview-DB før migrasjon) → rene defaults.
 */
export async function hentEffektivePeriodeConstraints(): Promise<Record<PeriodeType, PeriodeConstraints>> {
  let rader: FordelingRad[] = [];
  try {
    rader = await prisma.periodeFordeling.findMany();
  } catch {
    rader = [];
  }
  return flettFordeling(rader);
}

/** Dagens default-fordeling per periode (UI-initialverdier + «tilbakestill»). */
export function standardFordeling(): Record<PeriodeType, OmradeFordeling> {
  const ut = {} as Record<PeriodeType, OmradeFordeling>;
  for (const t of PERIODE_TYPER) {
    ut[t] = {
      min: { ...PERIODE_CONSTRAINTS[t].minPyramide },
      max: { ...PERIODE_CONSTRAINTS[t].maxPyramide },
    };
  }
  return ut;
}
