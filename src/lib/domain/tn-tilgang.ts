/**
 * TN-18 Trenere og tilgang — datalag.
 *
 * TILGANGSMATRISE.md §0: rollen bor på gruppen, ALDRI på brukeren. Sportssjef
 * (SS) finnes ikke som egen `UserRole` — det er en trener med aktivt
 * `GroupMember.role = COACH` på Team Norway-gruppen, eller plattform-ADMIN.
 *
 * Datamodellen har per 08.09.2026 kun ÉN kanonisk Team Norway-gruppe
 * (`KANONISKE_GRUPPER` i grupper.ts, slug "team-norway", kind "ekstern") —
 * det finnes ingen `Group.parentId` eller annen kobling som samler flere
 * underliggende TN-lag (Junior/Elite/Collegegruppen) under én paraply.
 * "Alle TN-gruppene" i tilgangsmatrisen reduserer derfor i praksis til
 * denne ene gruppen inntil en slik datamodell finnes — se filhodet i
 * page.tsx for hvordan dette er notert som avvik mot designfilen.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtMedlemskapWhere, TEAM_NORWAY_SLUG } from "@/lib/domain/grupper";
import type { UserRole } from "@/generated/prisma/client";

export { TEAM_NORWAY_SLUG };

export type TnTrenerRolle = "COACH" | "ASSISTANT";

export type TnTilgangRad = {
  userId: string;
  navn: string;
  epost: string;
  rolle: TnTrenerRolle;
  joinedAt: Date;
  endedAt: Date | null;
};

export type TnTilgangStatus = "AKTIV" | "UTLØPT";

/** AKTIV = endedAt er null eller ligger i fremtiden; UTLØPT = endedAt passert. */
export function tnTilgangStatus(rad: Pick<TnTilgangRad, "endedAt">): TnTilgangStatus {
  if (!rad.endedAt) return "AKTIV";
  return rad.endedAt.getTime() <= Date.now() ? "UTLØPT" : "AKTIV";
}

async function hentTeamNorwayGruppe(): Promise<{ id: string; name: string } | null> {
  return prisma.group.findUnique({ where: { slug: TEAM_NORWAY_SLUG }, select: { id: true, name: true } });
}

/**
 * SS = aktiv COACH på Team Norway-gruppen, eller plattform-ADMIN.
 * TR/HJ (COACH/ASSISTANT på andre grupper) skal IKKE se denne skjermen —
 * TILGANGSMATRISE.md rad TN-18: «å kunne gi tilgang er å kunne gi seg selv
 * tilgang».
 */
export async function erSportssjef(bruker: { id: string; role: UserRole }): Promise<boolean> {
  if (bruker.role === "ADMIN") return true;
  const gruppe = await hentTeamNorwayGruppe();
  if (!gruppe) return false;
  const rad = await prisma.groupMember.findFirst({
    where: { groupId: gruppe.id, userId: bruker.id, role: "COACH", endedAt: null },
    select: { id: true },
  });
  return rad !== null;
}

export type TnTilgangData = {
  gruppe: { id: string; name: string };
  rader: TnTilgangRad[];
};

/**
 * Alle med (eller som har hatt) trener-/hjelpetrenerrolle på Team
 * Norway-gruppen. Viser IKKE personer uten noen rad her («uten gruppe» /
 * trenerkatalog-eksemplet i designfilen) — det datagrunnlaget (TN-20
 * Trenerkatalog) er ikke portert ennå, se filhodet i page.tsx.
 */
export async function hentTeamNorwayTilganger(): Promise<TnTilgangData | null> {
  const gruppe = await hentTeamNorwayGruppe();
  if (!gruppe) return null;

  const rader = await prisma.groupMember.findMany({
    where: { groupId: gruppe.id, role: { in: ["COACH", "ASSISTANT"] } },
    select: { userId: true, role: true, joinedAt: true, endedAt: true, user: { select: { name: true, email: true } } },
    orderBy: [{ endedAt: "asc" }, { joinedAt: "asc" }],
  });

  return {
    gruppe,
    rader: rader.map((r) => ({
      userId: r.userId,
      navn: r.user.name ?? r.user.email ?? "Ukjent",
      epost: r.user.email ?? "",
      rolle: r.role as TnTrenerRolle,
      joinedAt: r.joinedAt,
      endedAt: r.endedAt,
    })),
  };
}

export type TnOversikt = {
  gruppe: { id: string; name: string };
  antallSpillere: number;
  antallTrenere: number;
  rolle: string;
  erAktivtMedlem: boolean;
};

/**
 * Serverporten for `/team-norway`.
 *
 * En plattform-ADMIN kan se den kanoniske Team Norway-oversikten uten et
 * eget gruppemedlemskap. Alle andre må ha en aktiv GroupMember-rad i akkurat
 * gruppen med slug `team-norway`. Poster, dokumenter, testlenker eller andre
 * relasjoner inngår ikke i tilgangsavgjørelsen.
 *
 * Databasefeil bobler opp til rutens error-grense. De omgjøres aldri til et
 * medlemskap eller delvise oversiktstall.
 */
export async function hentTnOversiktForBruker(bruker: {
  id: string;
  role: UserRole;
}): Promise<TnOversikt | null> {
  const gruppe = await hentTeamNorwayGruppe();
  if (!gruppe) return null;

  const medlemskap = await prisma.groupMember.findFirst({
    where: {
      groupId: gruppe.id,
      userId: bruker.id,
      ...aktivtMedlemskapWhere(),
    },
    select: { role: true },
  });
  const erAktivtMedlem = medlemskap !== null;
  if (!erAktivtMedlem && bruker.role !== "ADMIN") return null;

  const [antallSpillere, antallTrenere] = await Promise.all([
    prisma.groupMember.count({
      where: { groupId: gruppe.id, role: "PLAYER", ...aktivtMedlemskapWhere() },
    }),
    prisma.groupMember.count({
      where: {
        groupId: gruppe.id,
        role: { in: ["COACH", "ASSISTANT"] },
        ...aktivtMedlemskapWhere(),
      },
    }),
  ]);

  return {
    gruppe,
    antallSpillere,
    antallTrenere,
    rolle: medlemskap?.role ?? "ADMIN",
    erAktivtMedlem,
  };
}

export type TnAvsluttResultat = { ok: true } | { ok: false; reason: "siste-trener"; gruppeNavn: string; antallSpillere: number };

/**
 * Setter `endedAt = nå` (soft-end, jf. grupper.ts) på trener-/hjelpetrener-
 * medlemskapet. Sperret hvis dette ville fjernet siste aktive COACH i
 * gruppen — designfilens F-tilstand «siste trener i gruppen». Idempotent:
 * en allerede avsluttet rad returnerer ok uten å skrive på nytt.
 */
export async function avsluttTilgang(input: {
  caller: { id: string; role: UserRole };
  groupId: string;
  targetUserId: string;
}): Promise<TnAvsluttResultat> {
  const lovlig = await erSportssjef(input.caller);
  if (!lovlig) throw new Error("Du er ikke sportssjef");

  const rad = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: input.groupId, userId: input.targetUserId } },
    select: { id: true, role: true, endedAt: true },
  });
  if (!rad || rad.endedAt) return { ok: true };

  if (rad.role === "COACH") {
    const andreAktiveTrenere = await prisma.groupMember.count({
      where: { groupId: input.groupId, role: "COACH", endedAt: null, userId: { not: input.targetUserId } },
    });
    if (andreAktiveTrenere === 0) {
      const [gruppe, antallSpillere] = await Promise.all([
        prisma.group.findUnique({ where: { id: input.groupId }, select: { name: true } }),
        prisma.groupMember.count({ where: { groupId: input.groupId, role: "PLAYER", endedAt: null } }),
      ]);
      return { ok: false, reason: "siste-trener", gruppeNavn: gruppe?.name ?? "gruppen", antallSpillere };
    }
  }

  await prisma.groupMember.update({ where: { id: rad.id }, data: { endedAt: new Date() } });
  return { ok: true };
}

export type TnSettRolleResultat = { ok: true } | { ok: false; reason: "siste-trener"; gruppeNavn: string; antallSpillere: number };

/**
 * Setter rollen for (groupId, targetUserId) — oppretter medlemskapet hvis
 * det ikke finnes, gjenåpner det (nuller endedAt) hvis det var avsluttet,
 * og oppdaterer rollen ellers. `fraIso`/`tilIso` er `YYYY-MM-DD`-strenger
 * fra <input type="date">, tolket som UTC-midnatt (gotchas.md §Dato-
 * strenger). Samme «siste trener»-sperre som avsluttTilgang — å degradere
 * gruppens eneste COACH til ASSISTANT er samme hendelse som å avslutte.
 */
export async function settTilgang(input: {
  caller: { id: string; role: UserRole };
  groupId: string;
  targetUserId: string;
  rolle: TnTrenerRolle;
  fraIso: string;
  tilIso: string | null;
}): Promise<TnSettRolleResultat> {
  const lovlig = await erSportssjef(input.caller);
  if (!lovlig) throw new Error("Du er ikke sportssjef");

  const eksisterende = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: input.groupId, userId: input.targetUserId } },
    select: { id: true, role: true, endedAt: true },
  });

  const degraderesFraCoach = eksisterende?.role === "COACH" && !eksisterende.endedAt && input.rolle !== "COACH";
  if (degraderesFraCoach) {
    const andreAktiveTrenere = await prisma.groupMember.count({
      where: { groupId: input.groupId, role: "COACH", endedAt: null, userId: { not: input.targetUserId } },
    });
    if (andreAktiveTrenere === 0) {
      const [gruppe, antallSpillere] = await Promise.all([
        prisma.group.findUnique({ where: { id: input.groupId }, select: { name: true } }),
        prisma.groupMember.count({ where: { groupId: input.groupId, role: "PLAYER", endedAt: null } }),
      ]);
      return { ok: false, reason: "siste-trener", gruppeNavn: gruppe?.name ?? "gruppen", antallSpillere };
    }
  }

  const fra = parseDatoStrengUtc(input.fraIso) ?? new Date();
  const til = input.tilIso ? parseDatoStrengUtc(input.tilIso) : null;

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: input.groupId, userId: input.targetUserId } },
    create: { groupId: input.groupId, userId: input.targetUserId, role: input.rolle, joinedAt: fra, endedAt: til },
    update: { role: input.rolle, joinedAt: fra, endedAt: til },
  });
  return { ok: true };
}

/** `YYYY-MM-DD` → UTC-midnatt. gotchas.md §Dato-strenger — aldri `new Date(y,m-1,d)`. */
function parseDatoStrengUtc(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}
