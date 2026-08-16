/**
 * Valgt coach — resolver (plan G2). ENESTE lovlige leser av
 * User.primaryCoachId; varsling (G4), V2-økt-speiling og coach-flater i
 * PlayerHQ skal alle gå gjennom denne — aldri egne heuristikker, aldri
 * «første coach alfabetisk».
 *
 * NB: `src/lib/domain/` er ellers rene moduler uten IO. Denne importerer
 * bevisst `@/lib/prisma` (samme mønster som resolvePrimaryCoach hadde i
 * portal/(legacy)/coach/actions.ts) — beslutningslogikken er holdt ren og
 * enhetstestet i ./valgt-coach-kjerne.ts, kun DB-oppslagene bor her.
 *
 * Ikke "server-only": backfill-scriptet (scripts/backfill-valgt-coach-
 * 2026-08-16.ts) kjører via tsx uten react-server-condition.
 */

import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import {
  velgValgtCoach,
  type FallbackKandidater,
  type PrimaerKandidat,
} from "./valgt-coach-kjerne";

/** Er id-en en gyldig coach (COACH|ADMIN, ikke myk-slettet)? */
async function erGyldigCoach(coachId: string): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { id: coachId, role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
    select: { id: true },
  });
  return treff != null;
}

/**
 * Nivå 2–4 av fallback-kjeden som rådata — delt mellom resolveren og
 * backfill-scriptet (som trenger kandidatene for tvetydighets-sjekken).
 */
export async function hentFallbackKandidater(playerId: string): Promise<FallbackKandidater> {
  const [enrollments, medlemskap, planCoachId] = await Promise.all([
    // (2) Aktive enrollments med coach.
    prisma.playerEnrollment.findMany({
      where: { userId: playerId, endedAt: null, coachId: { not: null } },
      select: { coachId: true, enrolledAt: true },
    }),
    // (3) Aktive spiller-medlemskap i grupper med coach.
    prisma.groupMember.findMany({
      where: {
        userId: playerId,
        ...aktivtSpillerMedlemskapWhere(),
        group: { coachId: { not: null } },
      },
      select: {
        joinedAt: true,
        group: { select: { coachId: true, managedByAkGolf: true } },
      },
    }),
    // (4) Skaperen av aktiv treningsplan, hvis COACH|ADMIN.
    hentPlanCoachId(playerId),
  ]);

  return {
    enrollments: enrollments.flatMap((e) =>
      e.coachId ? [{ coachId: e.coachId, enrolledAt: e.enrolledAt }] : [],
    ),
    grupper: medlemskap.flatMap((m) =>
      m.group.coachId
        ? [
            {
              coachId: m.group.coachId,
              managedByAkGolf: m.group.managedByAkGolf,
              joinedAt: m.joinedAt,
            },
          ]
        : [],
    ),
    planCoachId,
  };
}

/**
 * (4) TrainingPlan.createdById er ikke FK (schema-kommentar «Ikke FK i v1»),
 * så skaperens rolle må verifiseres separat.
 */
async function hentPlanCoachId(playerId: string): Promise<string | null> {
  const planer = await prisma.trainingPlan.findMany({
    where: { userId: playerId, isActive: true, createdById: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { createdById: true },
    take: 5,
  });
  for (const plan of planer) {
    if (plan.createdById && (await erGyldigCoach(plan.createdById))) {
      return plan.createdById;
    }
  }
  return null;
}

/**
 * Spillerens valgte coach, eller null. Fallback-kjeden (kontrakten står i
 * valgt-coach-kjerne.ts): primaryCoachId → nyeste aktive enrollment →
 * gruppe-coach (AK-administrerte først) → aktiv plans skaper → null.
 */
export async function resolveValgtCoachId(playerId: string): Promise<string | null> {
  // (1) Eksplisitt valgt coach — verifisert før bruk, en død/slettet
  // primærcoach hoppes over i stedet for å stoppe kjeden.
  const bruker = await prisma.user.findUnique({
    where: { id: playerId },
    select: { primaryCoachId: true },
  });

  let primaer: PrimaerKandidat | null = null;
  if (bruker?.primaryCoachId) {
    primaer = {
      coachId: bruker.primaryCoachId,
      gyldig: await erGyldigCoach(bruker.primaryCoachId),
    };
    if (primaer.gyldig) return primaer.coachId;
  }

  const kandidater = await hentFallbackKandidater(playerId);
  return velgValgtCoach({ primaer, ...kandidater }).coachId;
}

/**
 * Som resolveValgtCoachId, men garanterer en id — for kallsteder som KREVER
 * en coachId (f.eks. TrainingSessionV2.coachId NOT NULL): valgt coach →
 * eldste ADMIN → spillerens egen id som aller siste utvei (bevarer v2-syncs
 * gamle garanti; `isCoachCreated`-logikk avhenger av den).
 */
export async function resolveValgtCoachIdEllerAdmin(playerId: string): Promise<string> {
  const valgt = await resolveValgtCoachId(playerId);
  if (valgt) return valgt;

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return admin?.id ?? playerId;
}
