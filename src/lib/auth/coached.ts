import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  aktivtSpillerMedlemskapWhere,
  aktivtTrenerMedlemskapWhere,
} from "@/lib/domain/grupper";

/**
 * Tilgangsskillet selvbetjent vs. coachet (I0 — LÅST forretningsregel,
 * NORDSTJERNE.md): en spiller med kun PlayerHQ-abonnement og uten
 * Academy-tilhørighet er SELVBETJENT — ingen coachrelasjon, usynlig i hele
 * AgencyOS (stall, cockpit, køer, motor-batch).
 *
 * Definisjonen er forankret i datamodellen: PlayerProgram.PLATFORM_ONLY er
 * eksplisitt dokumentert i schema.prisma som «Selvbetjent — ingen
 * coachrelasjon (GDPR-skille)». Coachet = aktiv PlayerEnrollment
 * (endedAt null) i et annet program enn PLATFORM_ONLY, ELLER medlemskap i en
 * AK-gruppe (GroupMember).
 *
 * Dette er den ENESTE lovlige porten for spiller-synlighet i AgencyOS-loadere
 * (prosjektregel) — nye loadere skal bruke `coachedPlayerWhere()`, aldri
 * bygge sitt eget filter.
 *
 * Bevisst UNNTAK (dokumentert i NORDSTJERNE/plan): manuell booking-wizard
 * (lead-/prøvetime-flyt) — å booke en time for en ny kunde er business-flyt,
 * ikke innsyn i treningsdata.
 */

/** Prisma-where-fragment: kun coachede spillere. Kombineres med AND. */
export function coachedPlayerWhere(): Prisma.UserWhereInput {
  return {
    role: "PLAYER",
    // Myk-slettede spillere skal ALDRI vises i AgencyOS (oppdaget 2026-07-13:
    // demo-opprydding etterlot slettede i «Trenger deg nå») — filteret bor
    // her i porten så alle flater arver det.
    deletedAt: null,
    OR: [
      {
        enrollmentsAsPlayer: {
          some: { endedAt: null, program: { not: "PLATFORM_ONLY" } },
        },
      },
      // Kun AKTIVE spiller-medlemskap (endedAt null) — utmeldte spillere skal
      // ut av AgencyOS samme øyeblikk som de meldes ut (soft-end, plan G1).
      { groupMemberships: { some: aktivtSpillerMedlemskapWhere() } },
    ],
  };
}

/** Er spilleren coachet (synlig for AgencyOS)? */
export async function erCoachetSpiller(userId: string): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { id: userId, ...coachedPlayerWhere() },
    select: { id: true },
  });
  return treff != null;
}

/**
 * Coach-scoping (Anders 2026-07-13): en COACH ser og redigerer KUN sine egne
 * spillere. Tre lovlige veier inn (OR-grenene under):
 *   1. Aktiv PlayerEnrollment med coachId = coachen.
 *   2. Aktivt spiller-medlemskap i en gruppe coachen eier (Group.coachId).
 *   3. (G5) Aktivt spiller-medlemskap i en gruppe der coachen selv er aktivt
 *      COACH- eller ASSISTANT-medlem — trenere lagt inn som gruppemedlemmer
 *      får innsyn i gruppens spillere uten å eie gruppen. Innsyn, ikke
 *      redigering av gruppen: den porten er `eierGruppen` i gruppe-actions,
 *      og den krever role COACH (ASSISTANT gir aldri redigering).
 * ADMIN ser alle coachede spillere.
 *
 * Bruk denne i AgencyOS-loadere i stedet for `coachedPlayerWhere()` når
 * innholdet er per-spiller-data; bruk `assertCoachTilgangTilSpiller` i
 * server-actions som tar en spiller-id.
 */
export function coachScopedPlayerWhere(viewer: {
  id: string;
  role: string;
}): Prisma.UserWhereInput {
  if (viewer.role !== "COACH") return coachedPlayerWhere();
  return {
    role: "PLAYER",
    // Samme soft-delete-port som coachedPlayerWhere — myk-slettede skal aldri
    // dukke opp i stall, tilgangssjekker eller AI for COACH.
    deletedAt: null,
    OR: [
      {
        enrollmentsAsPlayer: {
          some: { endedAt: null, program: { not: "PLATFORM_ONLY" }, coachId: viewer.id },
        },
      },
      {
        groupMemberships: {
          some: { ...aktivtSpillerMedlemskapWhere(), group: { coachId: viewer.id } },
        },
      },
      {
        groupMemberships: {
          some: {
            ...aktivtSpillerMedlemskapWhere(),
            group: { members: { some: aktivtTrenerMedlemskapWhere(viewer.id) } },
          },
        },
      },
    ],
  };
}

/**
 * Har coachen/adminen tilgang til akkurat denne spilleren? Server-actions som
 * tar en spiller-id MÅ kalle denne før skriving — rolle-sjekk alene er ikke nok
 * (en coach skal ikke kunne endre en annen coachs spillere via id-parameteren).
 */
export async function harCoachTilgangTilSpiller(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { AND: [{ id: playerId }, coachScopedPlayerWhere(viewer)] },
    select: { id: true },
  });
  return treff != null;
}

/** Som `harCoachTilgangTilSpiller`, men kaster ved manglende tilgang. */
export async function assertCoachTilgangTilSpiller(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<void> {
  if (!(await harCoachTilgangTilSpiller(viewer, playerId))) {
    throw new Error("Du har ikke tilgang til denne spilleren.");
  }
}
