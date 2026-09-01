/**
 * Delingssamtykke — data-tilgang (plan T8). Mønster: src/lib/health/samtykke.ts.
 *
 * All skriving av delingssamtykker går HER — append-only, aldri update.
 * Reglene i seg selv (nyeste-rad-vinner, FORESATT-krav) ligger i
 * `samtykke-regler.ts` og testes uten database.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  SAMTYKKE_TEKST_VERSJON,
  harGyldigSamtykke,
  type DelingSamtykkeRolle,
  type DelingScope,
} from "./samtykke-regler";

/**
 * Skriv et samtykke eller en tilbaketrekking. Alltid en NY rad — historikken
 * endres aldri. `gittAvUserId` er den som faktisk klikket (spilleren selv
 * eller en foresatt), mens `userId` er spilleren dataene gjelder.
 *
 * GDPR art. 8: en mindreårig (requiresGuardianConsent) kan ikke GI samtykke
 * selv — men å TREKKE skal alltid være lov, for hvem som helst (art. 7-3).
 *
 * Kaller ikke revalidatePath: det hører hjemme i server-actionen som vet
 * hvilke sider som skal friskes opp.
 */
export async function registrerDelingsSamtykke(input: {
  userId: string;
  scope: DelingScope;
  mottakerGruppeId: string;
  gitt: boolean;
  gittAvUserId: string;
  gittAvRolle: DelingSamtykkeRolle;
}): Promise<void> {
  const { userId, scope, mottakerGruppeId, gitt, gittAvUserId, gittAvRolle } = input;

  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { requiresGuardianConsent: true },
  });
  if (!bruker) throw new Error("Spilleren finnes ikke");

  // Tilbaketrekking er alltid tillatt — like enkelt som å gi (art. 7-3).
  if (gitt && bruker.requiresGuardianConsent && gittAvRolle === "SELV") {
    throw new Error(
      "Du er under 16 år, så en foresatt må godkjenne delingen for deg i foreldreportalen.",
    );
  }

  await prisma.delingsSamtykke.create({
    data: {
      userId,
      scope,
      mottakerGruppeId,
      gitt,
      tekstVersjon: SAMTYKKE_TEKST_VERSJON,
      gittAvUserId,
      gittAvRolle,
    },
  });

  await audit({
    actorId: gittAvUserId,
    action: gitt ? "deling.samtykke.gitt" : "deling.samtykke.trukket",
    target: `User:${userId}`,
    metadata: {
      scope,
      mottakerGruppeId,
      rolle: gittAvRolle,
      tekstVersjon: SAMTYKKE_TEKST_VERSJON,
    },
  });
}

/**
 * Gruppene der deling-spørsmålet er REELT for en spiller: aktive medlemskap
 * der minst én aktiv ekstern leser finnes. Uten leser er det ingenting å
 * samtykke til, så UI-et viser bare disse. (Samtykket i seg selv er alltid
 * per gruppe — se ekstern-leser-scope.ts.)
 */
export async function grupperMedEksterneLesereForSpiller(
  userId: string,
): Promise<{ id: string; name: string }[]> {
  const medlemskap = await prisma.groupMember.findMany({
    where: { userId, role: "PLAYER", endedAt: null },
    select: { groupId: true },
  });
  if (medlemskap.length === 0) return [];

  const gruppeIder = medlemskap.map((m) => m.groupId);
  const lesere = await prisma.eksternLeserGruppe.findMany({
    where: { groupId: { in: gruppeIder }, revokedAt: null },
    select: { groupId: true },
  });
  const medLeser = new Set(lesere.map((l) => l.groupId));
  if (medLeser.size === 0) return [];

  return prisma.group.findMany({
    where: { id: { in: [...medLeser] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type DelingStatusPerGruppe = {
  gruppeId: string;
  testResultater: boolean;
  stats: boolean;
  /** TN-12 (Claw batch 3) — den andre av de «to bryterne». */
  komplettProfil: boolean;
};

/**
 * Gjeldende delingsstatus for én spiller mot et sett mottakergrupper —
 * grunnlaget for samtykke-UI-et (spiller- og foreldreflaten).
 */
export async function hentDelingsStatus(
  userId: string,
  gruppeIder: readonly string[],
): Promise<DelingStatusPerGruppe[]> {
  if (gruppeIder.length === 0) return [];

  const [bruker, rader] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { requiresGuardianConsent: true },
    }),
    prisma.delingsSamtykke.findMany({
      where: { userId, mottakerGruppeId: { in: [...gruppeIder] } },
      select: {
        scope: true,
        mottakerGruppeId: true,
        gitt: true,
        gittAvRolle: true,
        createdAt: true,
      },
    }),
  ]);
  const kreverForesatt = bruker?.requiresGuardianConsent === true;

  return gruppeIder.map((gruppeId) => ({
    gruppeId,
    testResultater: harGyldigSamtykke(rader, {
      scope: "TEST_RESULTATER",
      mottakerGruppeId: gruppeId,
      kreverForesatt,
    }),
    stats: harGyldigSamtykke(rader, {
      scope: "STATS",
      mottakerGruppeId: gruppeId,
      kreverForesatt,
    }),
    komplettProfil: harGyldigSamtykke(rader, {
      scope: "KOMPLETT_PROFIL",
      mottakerGruppeId: gruppeId,
      kreverForesatt,
    }),
  }));
}
