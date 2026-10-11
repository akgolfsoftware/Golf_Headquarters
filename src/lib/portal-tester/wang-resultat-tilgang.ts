import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { registrerDelingsSamtykke } from "@/lib/deling/samtykke";
import {
  SAMTYKKE_TEKST_VERSJON,
  harGyldigSamtykke,
  wangTestdelingStatus,
  type WangTestdelingStatus,
} from "@/lib/deling/samtykke-regler";
import { aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

const WANG_PROGRAM = ["WANG_UNG", "WANG_TOPPIDRETT"] as const;
const TN_SLUG = "team-norway";

/**
 * D-55 (07.10.2026): en WANG-elev samtykker én gang ved innmelding (forelder
 * under 16). Samtykket lagres som TEST_RESULTATER mot WANG-gruppa, og ett
 * gyldig ja deler testene med WANG-skolen og Team Norway. Uten samtykke deles
 * ingenting. D-69: spilleren kan alltid trekke, og trekket skjuler også eldre
 * resultater med en gang. Samtykket åpner bare tester, aldri profil, plan,
 * IUP, helse eller meldinger (D-04). Ingen rolle har en sti forbi samtykket.
 */
async function hentAktiveWangGrupperForElev(userId: string): Promise<{ id: string; name: string }[]> {
  const medlemskap = await prisma.groupMember.findMany({
    where: {
      userId,
      role: "PLAYER",
      endedAt: null,
      user: { role: "PLAYER", deletedAt: null, anonymisertAt: null },
      group: { program: { in: [...WANG_PROGRAM] }, arkivertAt: null },
    },
    orderBy: { joinedAt: "asc" },
    select: { group: { select: { id: true, name: true } } },
  });
  return [...new Map(medlemskap.map((m) => [m.group.id, m.group])).values()];
}

export type WangTestdeling = {
  gruppeId: string;
  gruppeNavn: string;
  status: WangTestdelingStatus;
  kreverForesatt: boolean;
};

/** Testsamtykket per aktiv WANG-gruppe. Tom liste når eleven ikke er aktiv WANG-elev. */
export async function hentWangTestdeling(userId: string): Promise<WangTestdeling[]> {
  const grupper = await hentAktiveWangGrupperForElev(userId);
  if (grupper.length === 0) return [];
  const [bruker, rader] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { requiresGuardianConsent: true, dateOfBirth: true } }),
    prisma.delingsSamtykke.findMany({
      where: { userId, scope: "TEST_RESULTATER", mottakerGruppeId: { in: grupper.map((g) => g.id) } },
      select: { scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
    }),
  ]);
  if (!bruker) return [];
  const kreverForesatt = maaHaForesattSamtykke(bruker);
  return grupper.map((gruppe) => ({
    gruppeId: gruppe.id,
    gruppeNavn: gruppe.name,
    kreverForesatt,
    status: wangTestdelingStatus(rader, { mottakerGruppeId: gruppe.id, kreverForesatt, fodselsdato: bruker.dateOfBirth }),
  }));
}

/**
 * Lagrer elevens eller forelderens svar for én WANG-gruppe eleven er aktivt
 * medlem i. Under 16 år lagres elevens eget ja som en forespørsel (SELV-rad),
 * som aldri gir tilgang: bare en FORESATT-rad teller. Nei og trekk går alltid
 * gjennom og virker med en gang.
 */
export async function registrerWangTestsvar(input: {
  userId: string;
  gruppeId: string;
  gitt: boolean;
  gittAvUserId: string;
  gittAvRolle: "SELV" | "FORESATT";
}): Promise<WangTestdeling> {
  const deling = (await hentWangTestdeling(input.userId)).find((d) => d.gruppeId === input.gruppeId);
  if (!deling) throw new Error("Forespørselen gjelder bare aktive WANG-elever i denne gruppa.");
  if (input.gitt && input.gittAvRolle === "SELV" && deling.kreverForesatt) {
    await prisma.delingsSamtykke.create({
      data: {
        userId: input.userId,
        scope: "TEST_RESULTATER",
        mottakerGruppeId: input.gruppeId,
        gitt: true,
        tekstVersjon: SAMTYKKE_TEKST_VERSJON,
        gittAvUserId: input.gittAvUserId,
        gittAvRolle: "SELV",
      },
    });
    await audit({
      actorId: input.gittAvUserId,
      action: "deling.samtykke.venter-foresatt",
      target: `User:${input.userId}`,
      metadata: { scope: "TEST_RESULTATER", mottakerGruppeId: input.gruppeId, tekstVersjon: SAMTYKKE_TEKST_VERSJON },
    });
  } else {
    await registrerDelingsSamtykke({
      userId: input.userId,
      scope: "TEST_RESULTATER",
      mottakerGruppeId: input.gruppeId,
      gitt: input.gitt,
      gittAvUserId: input.gittAvUserId,
      gittAvRolle: input.gittAvRolle,
    });
  }
  return (await hentWangTestdeling(input.userId)).find((d) => d.gruppeId === input.gruppeId) ?? deling;
}

export type WangResultatSkoleScope = {
  groupId: string;
  schoolName: string;
  playerIds: string[];
  players: { id: string; name: string }[];
};

/**
 * Aktive WANG-skolegrupper med bare de elevene som har gyldig testsamtykke mot
 * AKKURAT den gruppa. Avsluttet medlemskap faller ut i spørringen; trukket
 * eller manglende samtykke faller ut i filteret. Skolen vises selv om ingen
 * elever har samtykket.
 */
async function hentWangSkolerMedSamtykke(groupIds?: string[]): Promise<WangResultatSkoleScope[]> {
  const grupper = await prisma.group.findMany({
    where: {
      ...(groupIds ? { id: { in: groupIds } } : {}),
      program: { in: [...WANG_PROGRAM] },
      arkivertAt: null,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      members: {
        where: {
          role: "PLAYER",
          endedAt: null,
          user: { deletedAt: null, anonymisertAt: null, role: "PLAYER" },
        },
        select: { userId: true, user: { select: { name: true, requiresGuardianConsent: true, dateOfBirth: true } } },
      },
    },
  });
  const alle = [...new Set(grupper.flatMap((g) => g.members.map((m) => m.userId)))];
  const rader = alle.length
    ? await prisma.delingsSamtykke.findMany({
        where: { userId: { in: alle }, scope: "TEST_RESULTATER", mottakerGruppeId: { in: grupper.map((g) => g.id) } },
        select: { userId: true, scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
      })
    : [];
  return grupper.map((gruppe) => {
    const players = [...new Map(
      gruppe.members
        .filter((medlem) => harGyldigSamtykke(rader.filter((rad) => rad.userId === medlem.userId), {
          scope: "TEST_RESULTATER",
          mottakerGruppeId: gruppe.id,
          kreverForesatt: maaHaForesattSamtykke(medlem.user),
          fodselsdato: medlem.user.dateOfBirth,
        }))
        .map((medlem) => [medlem.userId, { id: medlem.userId, name: medlem.user.name ?? "Ukjent" }]),
    ).values()];
    return { groupId: gruppe.id, schoolName: gruppe.name, playerIds: players.map((player) => player.id), players };
  });
}

/**
 * WANG-trener ser testresultater for samtykkede elever i sine egne
 * WANG-skolegrupper. Administrator ser alle WANG-skolene, men bare samtykkede
 * elever. GroupMember er skoleporten; fri tekst på User.school gir aldri tilgang.
 */
export async function hentWangTestresultatSkolerForTrener(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role === "ADMIN") return hentWangSkolerMedSamtykke();
  if (bruker.role !== "COACH") return [];

  const medlemskap = await prisma.groupMember.findMany({
    where: {
      ...aktivtTrenerMedlemskapWhere(bruker.id),
      group: { program: { in: [...WANG_PROGRAM] }, arkivertAt: null },
    },
    select: { groupId: true },
  });
  const groupIds = [...new Set(medlemskap.map((rad) => rad.groupId))];
  return groupIds.length ? hentWangSkolerMedSamtykke(groupIds) : [];
}

/**
 * Team Norway-trener (og administrator på Team Norway-flaten) ser
 * testresultater fra WANG-elever med gyldig D-55-samtykke. Gir aldri tilgang
 * til profil, planer, meldinger eller helseopplysninger.
 */
export async function hentWangTestresultatSkolerForTeamNorway(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role !== "ADMIN" && bruker.role !== "COACH") return [];
  if (bruker.role === "COACH") {
    const gruppe = await prisma.group.findUnique({ where: { slug: TN_SLUG }, select: { id: true } });
    if (!gruppe) return [];
    const medlemskap = await prisma.groupMember.findFirst({
      where: { groupId: gruppe.id, ...aktivtTrenerMedlemskapWhere(bruker.id) },
      select: { id: true },
    });
    if (!medlemskap) return [];
  }
  return hentWangSkolerMedSamtykke();
}
