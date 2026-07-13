/**
 * B2 (Bølge 2) — churn-radar: fanger coachede spillere som er i ferd med å
 * falle fra (≥14 dager uten innlogging — samme terskel som stallens
 * «Inaktiv»-status) og legger et ferdig meldingsutkast i godkjenningskøen
 * (A1). Meldingen sendes ALDRI automatisk — coachen godkjenner i køen, og
 * først da opprettes meldingstråden (plan-action-executor).
 *
 * Vern:
 * - Kun coachede spillere (I0, coachedPlayerWhere) med status AKTIV —
 *   SKADET/PERMISJON/INAKTIV er borte med kjent grunn og skal ikke purres.
 * - Aldri-innlogget (lastLoginAt null) hoppes over — bulk-importerte
 *   plassholderprofiler, ikke churn.
 * - Samtykke: mindreårig uten foreldresamtykke → ingen utsendelse, hoppes
 *   over (GDPR-porten, Del 3).
 * - Dedup: finnes et CHURN_MESSAGE (PENDING/ACCEPTED) siste 14 dager for
 *   spilleren, hoppes spilleren over.
 *
 * Sporbarhet: hvert treff skriver også Signal kind=CHURN_ALERT (dager
 * inaktiv som value) — radarens datagrunnlag er etterprøvbart.
 */

import { prisma } from "@/lib/prisma";
import { coachedPlayerWhere } from "@/lib/auth/coached";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";

const INAKTIV_DAGER = 14;
const DEDUP_DAGER = 14;

function fornavn(name: string | null): string {
  return name?.trim().split(/\s+/)[0] ?? "der";
}

export function churnMeldingsutkast(name: string | null, dager: number): {
  subject: string;
  body: string;
} {
  return {
    subject: "Vi savner deg på treningsfeltet",
    body:
      `Hei ${fornavn(name)}!\n\n` +
      `Jeg ser det er rundt ${dager} dager siden du var innom sist, og ville ` +
      `bare høre hvordan det står til. Har det skjedd noe, eller trenger du ` +
      `hjelp til å komme i gang igjen?\n\n` +
      `Si ifra hva som passer, så finner vi en vei tilbake sammen — en kort ` +
      `økt, en prat, eller en justert plan.\n\n` +
      `Mvh coachen din`,
  };
}

export async function runChurnRadar(): Promise<{
  kandidater: number;
  varsler: number;
  hoppet: number;
  feilet: number;
}> {
  const now = new Date();
  const terskel = new Date(now.getTime() - INAKTIV_DAGER * 86_400_000);
  const dedupGrense = new Date(now.getTime() - DEDUP_DAGER * 86_400_000);

  const kandidater = await prisma.user.findMany({
    // Bevisst coachedPlayerWhere (ikke coach-scopet): batch-agent uten viewer.
    where: {
      AND: [
        coachedPlayerWhere(),
        { deletedAt: null },
        { userStatus: "AKTIV" },
        { lastLoginAt: { not: null, lt: terskel } },
      ],
    },
    select: {
      id: true,
      name: true,
      lastLoginAt: true,
      requiresGuardianConsent: true,
      guardianConsentGivenAt: true,
      enrollmentsAsPlayer: {
        where: { endedAt: null, coachId: { not: null } },
        select: { coachId: true },
        take: 1,
      },
    },
    take: 200,
  });

  let varsler = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const spiller of kandidater) {
    try {
      if (isAwaitingGuardianConsent(spiller)) {
        hoppet++;
        continue;
      }

      const finnes = await prisma.planAction.findFirst({
        where: {
          userId: spiller.id,
          actionType: "CHURN_MESSAGE",
          status: { in: ["PENDING", "ACCEPTED"] },
          createdAt: { gte: dedupGrense },
        },
        select: { id: true },
      });
      if (finnes) {
        hoppet++;
        continue;
      }

      const dager = Math.floor(
        (now.getTime() - (spiller.lastLoginAt as Date).getTime()) / 86_400_000,
      );
      const utkast = churnMeldingsutkast(spiller.name, dager);

      await prisma.signal.create({
        data: {
          userId: spiller.id,
          kind: "CHURN_ALERT",
          value: dager,
          payload: { grunn: "inaktiv", dagerSidenInnlogging: dager },
        },
      });

      await prisma.planAction.create({
        data: {
          userId: spiller.id,
          coachId: spiller.enrollmentsAsPlayer[0]?.coachId ?? null,
          agentName: "churn-radar",
          actionType: "CHURN_MESSAGE",
          status: "PENDING",
          suggestion: {
            tittel: `Frafalls-varsel: ${dager} dager uten aktivitet`,
            forklaring:
              `${spiller.name ?? "Spilleren"} har ikke logget inn på ${dager} ` +
              `dager. Godkjenn for å sende meldingsutkastet under — eller avvis ` +
              `og ta kontakt på egen måte.`,
            melding: utkast,
          },
        },
      });
      varsler++;
    } catch {
      feilet++;
    }
  }

  return { kandidater: kandidater.length, varsler, hoppet, feilet };
}
