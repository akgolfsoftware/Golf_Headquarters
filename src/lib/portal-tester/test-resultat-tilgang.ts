import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

/**
 * Tilgangsvakt for rå testdata (TestShot) knyttet til et TestResult.
 *
 * Lov: eieren selv, eller spillerens egen AK-coach. AK-coach betyr aktiv
 * PlayerEnrollment med coachId = coachen, eller aktivt spillermedlemskap i en
 * ikke-arkivert AK Golf-gruppe som coachen eier. ADMIN får samme regel uten
 * coachId-kravet.
 *
 * Aldri lov: å være trener-medlem i en gruppe (G5-grenen i
 * coachScopedPlayerWhere), eller WANG- og Team Norway-grupper. Organisasjonene
 * får bare se tester gjennom delingsporten (wang-resultat-tilgang.ts, D-55),
 * aldri ved å lese eller skrive slagene direkte (seniorgjennomgangen S1, TO-01).
 */

const ORGANISASJONSPROGRAM = ["WANG_UNG", "WANG_TOPPIDRETT"] as const;

/** User-where: spilleren har et aktivt AK-coachforhold til `viewer`. */
export function akCoachRelasjonWhere(viewer: {
  id: string;
  role: string;
}): Prisma.UserWhereInput {
  const coachKrav = viewer.role === "ADMIN" ? {} : { coachId: viewer.id };
  return {
    role: "PLAYER",
    deletedAt: null,
    OR: [
      {
        enrollmentsAsPlayer: {
          some: {
            endedAt: null,
            program: { notIn: ["PLATFORM_ONLY", ...ORGANISASJONSPROGRAM] },
            ...coachKrav,
          },
        },
      },
      {
        groupMemberships: {
          some: {
            endedAt: null,
            role: "PLAYER",
            group: {
              ...coachKrav,
              managedByAkGolf: true,
              arkivertAt: null,
              OR: [{ program: null }, { program: { notIn: [...ORGANISASJONSPROGRAM] } }],
            },
          },
        },
      },
    ],
  };
}

/**
 * Kaster med mindre innlogget bruker har tilgang til ALLE testresultatene.
 * Én id uten tilgang avviser hele batchen. Sesjonen sjekkes før noe hentes.
 */
export async function kreverTestResultatTilgang(testResultIds: readonly string[]): Promise<void> {
  const viewer = await getCurrentUser();
  if (!viewer) throw new Error("Ikke innlogget");

  const ider = [...new Set(testResultIds)];
  if (ider.length === 0) return;

  const resultater = await prisma.testResult.findMany({
    where: { id: { in: ider } },
    select: { id: true, userId: true },
  });
  if (resultater.length !== ider.length) throw new Error("Testresultat finnes ikke");

  const andreEiere = [...new Set(resultater.map((r) => r.userId))].filter((id) => id !== viewer.id);
  if (andreEiere.length === 0) return;
  if (viewer.role !== "COACH" && viewer.role !== "ADMIN") throw new Error("Ingen tilgang");

  const medRelasjon = await prisma.user.findMany({
    where: { AND: [{ id: { in: andreEiere } }, akCoachRelasjonWhere(viewer)] },
    select: { id: true },
  });
  if (medRelasjon.length !== andreEiere.length) throw new Error("Ingen tilgang");
}
