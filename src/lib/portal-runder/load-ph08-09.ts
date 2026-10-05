/**
 * Datainnhenting for PH-08 (Runde live) og PH-09 (Registrer runde).
 * Henter baner og spillerens siste runder med fail-safe fallback.
 */

import { prisma } from "@/lib/prisma";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";
import { STANDARD_18_HOLES, type CourseHoleDef } from "./ph08-09-data";

export interface PhBaneValg {
  id: string;
  navn: string;
  par: number;
}

export interface PhSisteRunde {
  id: string;
  dato: string;
  bane: string;
  score: number;
}

export interface Ph0809Data {
  baner: PhBaneValg[];
  sisteBaneId: string | null;
  valgtBane: {
    id: string;
    navn: string;
    tee: string;
    par: number;
    hull: CourseHoleDef[];
  };
  sisteRunder: PhSisteRunde[];
  ulesteVarsler: number;
}

const FALLBACK_BANER: PhBaneValg[] = [
  { id: "fredrikstad-gk", navn: "Fredrikstad Golfklubb", par: 72 },
  { id: "gamle-fredrikstad", navn: "Gamle Fredrikstad Golfklubb", par: 72 },
  { id: "onsoy-gk", navn: "Onsøy Golfklubb", par: 72 },
  { id: "hvaler-gk", navn: "Hvaler Golfklubb", par: 72 },
  { id: "moss-rygge", navn: "Moss & Rygge Golfklubb", par: 72 },
  { id: "skjeberg-gk", navn: "Skjeberg Golfklubb", par: 72 },
  { id: "halden-gk", navn: "Halden Golfklubb", par: 71 },
];

export async function loadPh0809Data(userId: string): Promise<Ph0809Data> {
  try {
    const [dbCourses, sisteBaneIdRaw, dbRounds, uleste] = await Promise.all([
      prisma.courseDefinition.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, par: true },
      }),
      sisteSpilteBaneId(userId).catch(() => null),
      prisma.round.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        take: 3,
        select: {
          id: true,
          playedAt: true,
          score: true,
          course: { select: { name: true } },
        },
      }).catch(() => []),
      prisma.notification.count({ where: { userId, readAt: null } }).catch(() => 0),
    ]);

    const banerListe: PhBaneValg[] = dbCourses.length > 0
      ? dbCourses.map((c) => ({ id: c.id, navn: c.name, par: c.par || 72 }))
      : FALLBACK_BANER;

    // Prefill: legg sist spilte bane først i listen
    const sorterteBaner = medForst(banerListe, sisteBaneIdRaw);

    const forsteBane = sorterteBaner[0] || FALLBACK_BANER[0];

    const sisteRunder: PhSisteRunde[] = dbRounds.map((r) => ({
      id: r.id,
      dato: r.playedAt.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Europe/Oslo",
      }),
      bane: r.course?.name || "Bane",
      score: r.score,
    }));

    return {
      baner: sorterteBaner,
      sisteBaneId: sisteBaneIdRaw,
      valgtBane: {
        id: forsteBane.id,
        navn: forsteBane.navn,
        tee: "Gul",
        par: forsteBane.par,
        hull: STANDARD_18_HOLES,
      },
      sisteRunder,
      ulesteVarsler: uleste,
    };
  } catch (feil) {
    console.error("loadPh0809Data feilet:", feil);
    return {
      baner: FALLBACK_BANER,
      sisteBaneId: null,
      valgtBane: {
        id: FALLBACK_BANER[0].id,
        navn: FALLBACK_BANER[0].navn,
        tee: "Gul",
        par: 72,
        hull: STANDARD_18_HOLES,
      },
      sisteRunder: [],
      ulesteVarsler: 0,
    };
  }
}
