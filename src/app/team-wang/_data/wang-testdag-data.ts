// Server-only: testdager og trenerføring i WANG (designløftet 20.10.2026, canvas «WANG nøkkelskjermer»,
// Tester-rada). Planlegging og lagring er de felles handlingene fra AgencyOS (planleggTestdag,
// saveTnTestSomCoach); denne fila avgrenser bare hva WANG-treneren ser.
//
// Personvern: treneren ser bare elever som deler testene med WANG (gyldig TEST_RESULTATER-samtykke,
// forelder under 16). Testdagen har alle aktive elever som deltakere, men de som ikke deler vises
// ikke, og kan ikke føres fra WANG.

import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hentWangTestresultatSkolerForTrener } from "@/lib/portal-tester/wang-resultat-tilgang";
import { tnFormat, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { lastRegistrering, type RegistreringData } from "@/lib/admin/tester/testdag-data";
import { hentWangCoachGruppeId } from "./wang-tilgang";

type Bruker = { id: string; role: UserRole };

export type WangTestTilgang = { gruppeId: string; delerIder: string[] };

/** WANG-gruppa treneren er trener i, og elevene i den som deler testene. null uten WANG-rolle. */
export async function hentWangTestTilgang(bruker: Bruker): Promise<WangTestTilgang | null> {
  const gruppeId = await hentWangCoachGruppeId(bruker);
  if (!gruppeId) return null;
  const skoler = await hentWangTestresultatSkolerForTrener(bruker);
  return { gruppeId, delerIder: skoler.find((s) => s.groupId === gruppeId)?.playerIds ?? [] };
}

const tid = (d: Date) => new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" }).format(d);
const dato = (d: Date) => new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" }).format(d);
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);

export type WangTestdagRad = { id: string; dato: string; klokke: string; sted: string | null; stasjoner: number; aktiv: boolean; datoIso: string };

/** Gruppas testdager, nyeste først. */
export async function hentWangTestdager(gruppeId: string): Promise<WangTestdagRad[]> {
  const rader = await prisma.testDayEvent.findMany({
    where: { organizerGroupId: gruppeId },
    orderBy: { scheduledAt: "desc" },
    take: 12,
    select: { id: true, scheduledAt: true, location: true, status: true, _count: { select: { stations: true } } },
  });
  return rader.map((r) => ({
    id: r.id,
    dato: dato(r.scheduledAt),
    klokke: tid(r.scheduledAt),
    sted: r.location,
    stasjoner: r._count.stations,
    aktiv: r.status === "ACTIVE",
    datoIso: iso(r.scheduledAt),
  }));
}

export type WangDeltakerStatus = "PENDING" | "DONE" | "SKIPPED" | "ABSENT";

export type WangTestdagVisning = {
  id: string;
  dato: string;
  klokke: string;
  sted: string | null;
  aktiv: boolean;
  skjulte: number;
  stasjoner: {
    id: string;
    navn: string;
    aktiv: boolean;
    deltakere: { id: string; elev: string; status: WangDeltakerStatus; resultat: string | null }[];
  }[];
};

/** Én testdag i gruppa med stasjonene. Elever som ikke deler, telles i `skjulte` og vises ikke. */
export async function hentWangTestdag(tilgang: WangTestTilgang, eventId: string): Promise<WangTestdagVisning | null> {
  const ev = await prisma.testDayEvent.findFirst({
    where: { id: eventId, organizerGroupId: tilgang.gruppeId },
    select: {
      id: true, scheduledAt: true, location: true, status: true,
      stations: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, status: true, testDefinition: { select: { name: true } },
          participants: {
            orderBy: { order: "asc" },
            select: { id: true, status: true, playerId: true, player: { select: { name: true } }, result: { select: { score: true, details: true } } },
          },
        },
      },
    },
  });
  if (!ev) return null;
  const deler = new Set(tilgang.delerIder);
  const skjulte = new Set<string>();
  const stasjoner = ev.stations.map((s) => ({
      id: s.id,
      navn: s.testDefinition.name,
      aktiv: s.status === "ACTIVE",
      deltakere: s.participants.flatMap((p) => {
        if (!deler.has(p.playerId)) {
          skjulte.add(p.playerId);
          return [];
        }
        const d = p.result?.details as Partial<TnResult> | null;
        return [{
          id: p.id,
          elev: p.player.name ?? "Uten navn",
          status: p.status,
          resultat: p.result && d?.unit ? tnFormat({ value: p.result.score, unit: d.unit }) : null,
        }];
      }),
    }));
  return {
    id: ev.id,
    dato: dato(ev.scheduledAt),
    klokke: tid(ev.scheduledAt),
    sted: ev.location,
    aktiv: ev.status === "ACTIVE",
    skjulte: skjulte.size,
    stasjoner,
  };
}

/**
 * Én deltaker til registrering. Bygger på den felles `lastRegistrering` (samme tilgang som lagringen),
 * og krever i tillegg at stasjonen hører til WANG-gruppa og at eleven deler testene. Lista over andre
 * elever på stasjonen tar bare med elever som deler.
 */
export async function hentWangRegistrering(
  bruker: Bruker,
  tilgang: WangTestTilgang,
  deltakerId: string,
): Promise<RegistreringData | null> {
  const rad = await prisma.testDayParticipant.findFirst({
    where: { id: deltakerId, playerId: { in: tilgang.delerIder }, testDay: { groupId: tilgang.gruppeId } },
    select: { testDay: { select: { participants: { select: { id: true, playerId: true } } } } },
  });
  if (!rad) return null;
  const d = await lastRegistrering(bruker, deltakerId);
  if (!d) return null;
  const deler = new Set(tilgang.delerIder);
  const synlige = new Set(rad.testDay.participants.filter((p) => deler.has(p.playerId)).map((p) => p.id));
  const andre = d.andre.filter((a) => synlige.has(a.id));
  const i = andre.findIndex((a) => a.id === d.deltakerId);
  const neste = andre.slice(i + 1).find((a) => a.status === "PENDING") ?? andre.slice(0, i).find((a) => a.status === "PENDING");
  return { ...d, andre, nesteId: neste?.id ?? null };
}
