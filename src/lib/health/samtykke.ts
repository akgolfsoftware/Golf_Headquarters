/**
 * Helsedata-samtykke — data-tilgang (GDPR art. 9-2 a).
 *
 * PORTEN INN TIL WEARABLE-DATA. Ingen kode som henter, lagrer eller viser
 * helsedata fra Whoop/Garmin skal gjøre det uten først å ha spurt
 * `harGyldigHelseSamtykke` (eller `krevHelseSamtykke`) her. Det er dette som
 * gjør at et trukket samtykke faktisk stopper datastrømmen, og ikke bare
 * skrur av en bryter i grensesnittet.
 *
 * Reglene i seg selv (16-årsgrense, hvilken rad som gjelder) ligger i
 * `samtykke-regler.ts` og testes uten database.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  HELSE_SAMTYKKE_VERSJON,
  beregnSamtykkeStatus,
  validerSamtykkeHandling,
  type HelseSamtykkeRolle,
  type HelseSamtykkeType,
  type SamtykkeStatus,
} from "./samtykke-regler";

/** Feilen som kastes når data forsøkes hentet uten gyldig samtykke. */
export class ManglerHelseSamtykke extends Error {
  constructor(userId: string) {
    super(`helse-samtykke-mangler:${userId}`);
    this.name = "ManglerHelseSamtykke";
  }
}

/**
 * Gjeldende samtykkestatus for én spiller.
 *
 * Leser hele historikken for brukeren (den er kort — én rad per gang noen
 * skrur samtykket av eller på) og lar `beregnSamtykkeStatus` avgjøre hva som
 * gjelder nå.
 */
export async function hentSamtykkeStatus(userId: string): Promise<SamtykkeStatus> {
  const rader = await prisma.helseSamtykke.findMany({
    where: { userId },
    select: { type: true, gitt: true, tekstVersjon: true, createdAt: true },
  });
  return beregnSamtykkeStatus(rader);
}

/**
 * Har spilleren sagt ja til at vi henter helsedata fra klokka?
 * Dette er sjekken en synk-jobb eller et API-kall skal bruke.
 */
export async function harGyldigHelseSamtykke(userId: string): Promise<boolean> {
  const status = await hentSamtykkeStatus(userId);
  return status.wearable;
}

/**
 * Som over, men kaster hvis samtykket mangler. Bruk denne i kodestier der det
 * å fortsette uten samtykke ville vært et regelbrudd — da blir det umulig å
 * glemme å sjekke returverdien.
 */
export async function krevHelseSamtykke(userId: string): Promise<void> {
  if (!(await harGyldigHelseSamtykke(userId))) {
    throw new ManglerHelseSamtykke(userId);
  }
}

/** Kan coachen se restitusjonsstatus for denne spilleren? */
export async function harCoachInnsyn(userId: string): Promise<boolean> {
  const status = await hentSamtykkeStatus(userId);
  return status.coachInnsyn;
}

/**
 * Filtrer en liste spillere ned til dem coachen har lov til å se
 * restitusjonsstatus for. Ett DB-kall uansett antall spillere.
 */
export async function filtrerTilCoachInnsyn(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();

  const rader = await prisma.helseSamtykke.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, type: true, gitt: true, tekstVersjon: true, createdAt: true },
  });

  const perBruker = new Map<string, typeof rader>();
  for (const rad of rader) {
    const liste = perBruker.get(rad.userId);
    if (liste) liste.push(rad);
    else perBruker.set(rad.userId, [rad]);
  }

  const tillatt = new Set<string>();
  for (const [userId, egneRader] of perBruker) {
    if (beregnSamtykkeStatus(egneRader).coachInnsyn) tillatt.add(userId);
  }
  return tillatt;
}

/**
 * Skriv et samtykke eller en tilbaketrekking.
 *
 * Alltid en NY rad — vi endrer aldri historikken. `gittAvUserId` er den som
 * faktisk klikket (spilleren selv eller en foresatt), mens `userId` er
 * spilleren dataene gjelder.
 *
 * Kaller ikke revalidatePath: det hører hjemme i server-actionen som vet
 * hvilke sider som skal friskes opp.
 */
export async function registrerHelseSamtykke(input: {
  userId: string;
  type: HelseSamtykkeType;
  gitt: boolean;
  gittAvUserId: string;
  gittAvRolle: HelseSamtykkeRolle;
}): Promise<void> {
  const { userId, type, gitt, gittAvUserId, gittAvRolle } = input;

  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { requiresGuardianConsent: true, dateOfBirth: true },
  });
  if (!bruker) throw new Error("Spilleren finnes ikke");

  const feil = validerSamtykkeHandling({ bruker, rolle: gittAvRolle, gitt });
  if (feil) throw new Error(feil);

  await prisma.helseSamtykke.create({
    data: {
      userId,
      type,
      gitt,
      tekstVersjon: HELSE_SAMTYKKE_VERSJON,
      gittAvUserId,
      gittAvRolle,
    },
  });

  await audit({
    actorId: gittAvUserId,
    action: gitt ? "helse.samtykke.gitt" : "helse.samtykke.trukket",
    target: `User:${userId}`,
    metadata: { type, rolle: gittAvRolle, tekstVersjon: HELSE_SAMTYKKE_VERSJON },
  });
}
