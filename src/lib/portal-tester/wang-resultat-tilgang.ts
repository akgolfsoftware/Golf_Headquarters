import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { registrerDelingsSamtykke } from "@/lib/deling/samtykke";
import {
  SAMTYKKE_TEKST_VERSJON,
  harGyldigSamtykke,
  wangTnTestdelingStatus,
  type WangTnTestdelingStatus,
} from "@/lib/deling/samtykke-regler";
import { aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

const WANG_PROGRAM = ["WANG_UNG", "WANG_TOPPIDRETT"] as const;
const TN_SLUG = "team-norway";

/**
 * D-04/D-13 (05.10.2026): WANG-testresultater deles ALDRI automatisk med
 * Team Norway. Eleven får én forespørsel («Del testene med Team Norway»,
 * omfang TEST_RESULTATER). Under 16 år må foresatt godkjenne. Samtykket ligger
 * i delings_samtykker mot Team Norway-gruppen, og nyeste rad vinner.
 */
export async function erAktivWangElev(userId: string): Promise<boolean> {
  const medlemskap = await prisma.groupMember.findFirst({
    where: {
      userId,
      role: "PLAYER",
      endedAt: null,
      user: { role: "PLAYER", deletedAt: null, anonymisertAt: null },
      group: { program: { in: [...WANG_PROGRAM] }, arkivertAt: null },
    },
    select: { id: true },
  });
  return medlemskap !== null;
}

async function hentTnGruppeId(): Promise<string | null> {
  const gruppe = await prisma.group.findUnique({ where: { slug: TN_SLUG }, select: { id: true } });
  return gruppe?.id ?? null;
}

export type WangTnTestdeling = {
  tnGruppeId: string;
  status: WangTnTestdelingStatus;
  kreverForesatt: boolean;
};

/** Status for forespørselen. `null` når eleven ikke er aktiv WANG-elev. */
export async function hentWangTnTestdeling(userId: string): Promise<WangTnTestdeling | null> {
  if (!(await erAktivWangElev(userId))) return null;
  const tnGruppeId = await hentTnGruppeId();
  if (!tnGruppeId) return null;
  const [bruker, rader] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { requiresGuardianConsent: true, dateOfBirth: true } }),
    prisma.delingsSamtykke.findMany({
      where: { userId, scope: "TEST_RESULTATER", mottakerGruppeId: tnGruppeId },
      select: { scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
    }),
  ]);
  if (!bruker) return null;
  const kreverForesatt = maaHaForesattSamtykke(bruker);
  return { tnGruppeId, kreverForesatt, status: wangTnTestdelingStatus(rader, { mottakerGruppeId: tnGruppeId, kreverForesatt }) };
}

/**
 * Lagrer elevens eller foresattes svar. Under 16 år blir elevens eget ja
 * lagret som en forespørsel (SELV-rad), som aldri gir tilgang: bare en
 * FORESATT-rad teller (`harGyldigSamtykke`). Nei og tilbaketrekking går
 * alltid gjennom og virker med en gang.
 */
export async function registrerWangTnTestsvar(input: {
  userId: string;
  gitt: boolean;
  gittAvUserId: string;
  gittAvRolle: "SELV" | "FORESATT";
}): Promise<WangTnTestdeling> {
  const deling = await hentWangTnTestdeling(input.userId);
  if (!deling) throw new Error("Forespørselen gjelder bare aktive WANG-elever.");
  if (input.gitt && input.gittAvRolle === "SELV" && deling.kreverForesatt) {
    await prisma.delingsSamtykke.create({
      data: {
        userId: input.userId,
        scope: "TEST_RESULTATER",
        mottakerGruppeId: deling.tnGruppeId,
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
      metadata: { scope: "TEST_RESULTATER", mottakerGruppeId: deling.tnGruppeId, tekstVersjon: SAMTYKKE_TEKST_VERSJON },
    });
  } else {
    await registrerDelingsSamtykke({
      userId: input.userId,
      scope: "TEST_RESULTATER",
      mottakerGruppeId: deling.tnGruppeId,
      gitt: input.gitt,
      gittAvUserId: input.gittAvUserId,
      gittAvRolle: input.gittAvRolle,
    });
  }
  return (await hentWangTnTestdeling(input.userId)) ?? deling;
}

export type WangResultatSkoleScope = {
  groupId: string;
  schoolName: string;
  playerIds: string[];
  players: { id: string; name: string }[];
};

async function hentAktiveWangSkoler(groupIds?: string[]): Promise<WangResultatSkoleScope[]> {
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
        select: { userId: true, user: { select: { name: true } } },
      },
    },
  });
  return grupper.map((gruppe) => {
    const players = [...new Map(gruppe.members.map((medlem) => [medlem.userId, { id: medlem.userId, name: medlem.user.name ?? "Ukjent" }])).values()];
    return { groupId: gruppe.id, schoolName: gruppe.name, playerIds: players.map((player) => player.id), players };
  });
}

/**
 * WANG-trener ser testresultater for aktive spillere i sine egne WANG-skolegrupper.
 * GroupMember er skoleporten; fri tekst på User.school gir aldri tilgang.
 */
export async function hentWangTestresultatSkolerForTrener(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role === "ADMIN") return hentAktiveWangSkoler();
  if (bruker.role !== "COACH") return [];

  const medlemskap = await prisma.groupMember.findMany({
    where: {
      ...aktivtTrenerMedlemskapWhere(bruker.id),
      group: { program: { in: [...WANG_PROGRAM] }, arkivertAt: null },
    },
    select: { groupId: true },
  });
  const groupIds = [...new Set(medlemskap.map((rad) => rad.groupId))];
  return groupIds.length ? hentAktiveWangSkoler(groupIds) : [];
}

/** Behold bare elever med gyldig testsamtykke til Team Norway (D-04/D-13). */
async function medTnTestsamtykke(skoler: WangResultatSkoleScope[], tnGruppeId: string): Promise<WangResultatSkoleScope[]> {
  const alle = [...new Set(skoler.flatMap((skole) => skole.playerIds))];
  if (alle.length === 0) return skoler;
  const [brukere, rader] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: alle } }, select: { id: true, requiresGuardianConsent: true, dateOfBirth: true } }),
    prisma.delingsSamtykke.findMany({
      where: { userId: { in: alle }, scope: "TEST_RESULTATER", mottakerGruppeId: tnGruppeId },
      select: { userId: true, scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
    }),
  ]);
  const kreverForesatt = new Map(brukere.map((b) => [b.id, maaHaForesattSamtykke(b)]));
  const delt = new Set(alle.filter((id) => kreverForesatt.has(id) && harGyldigSamtykke(
    rader.filter((rad) => rad.userId === id),
    { scope: "TEST_RESULTATER", mottakerGruppeId: tnGruppeId, kreverForesatt: kreverForesatt.get(id) ?? true },
  )));
  return skoler.map((skole) => {
    const players = skole.players.filter((spiller) => delt.has(spiller.id));
    return { ...skole, players, playerIds: players.map((spiller) => spiller.id) };
  });
}

/**
 * Team Norway ser testresultater fra WANG-elever som selv (eller foresatt
 * under 16) har sagt ja til «Del testene med Team Norway». Gjelder også
 * administrator som ser Team Norway-flaten. Gir aldri tilgang til profil,
 * planer, meldinger eller helseopplysninger.
 */
export async function hentWangTestresultatSkolerForTeamNorway(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role !== "ADMIN" && bruker.role !== "COACH") return [];
  const tnGruppeId = await hentTnGruppeId();
  if (!tnGruppeId) return [];
  if (bruker.role === "COACH") {
    const medlemskap = await prisma.groupMember.findFirst({
      where: { groupId: tnGruppeId, ...aktivtTrenerMedlemskapWhere(bruker.id) },
      select: { id: true },
    });
    if (!medlemskap) return [];
  }
  return medTnTestsamtykke(await hentAktiveWangSkoler(), tnGruppeId);
}
