import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  aktivtSpillerMedlemskapWhere,
  aktivtTrenerMedlemskapWhere,
  ikkeOrgGruppeWhere,
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
 * Coach-scoping (Anders 2026-07-13) — LESE-scope for lister og innsyn. Tre
 * lovlige veier inn (OR-grenene under):
 *   1. Aktiv PlayerEnrollment med coachId = coachen.
 *   2. Aktivt spiller-medlemskap i en gruppe coachen eier (Group.coachId).
 *   3. (G5) Aktivt spiller-medlemskap i en AK-gruppe der coachen selv er
 *      aktivt COACH- eller ASSISTANT-medlem. Gjelder IKKE organisasjonsgrupper
 *      (WANG/Team Norway): der gir medlemskap ingen innsyn (D-04). En
 *      organisasjonstrener ser en spiller bare via uttrykkelig deling, se
 *      `harCoachLesetilgangTilSpiller`.
 * ADMIN ser alle coachede spillere.
 *
 * Skriving i en enkelt spillers data og plan går ALDRI via gren 3 (D-25):
 * bruk `harCoachTilgangTilSpiller` / `assertCoachTilgangTilSpiller`, som bare
 * slipper gjennom gren 1 og 2 (`coachSkrivbarPlayerWhere`).
 */
export function coachScopedPlayerWhere(viewer: {
  id: string;
  role: string;
}): Prisma.UserWhereInput {
  if (viewer.role !== "COACH") return coachedPlayerWhere();
  const skrivbar = coachSkrivbarPlayerWhere(viewer);
  return {
    ...skrivbar,
    OR: [
      ...(skrivbar.OR as Prisma.UserWhereInput[]),
      {
        groupMemberships: {
          some: {
            ...aktivtSpillerMedlemskapWhere(),
            group: { ...ikkeOrgGruppeWhere(), members: { some: aktivtTrenerMedlemskapWhere(viewer.id) } },
          },
        },
      },
    ],
  };
}

/**
 * SKRIVE-scope: egen AK-coach. Bare aktiv enrollment hos coachen eller
 * spiller-medlemskap i en gruppe coachen eier. Trener-medlemskap i en gruppe
 * gir aldri skriverett i en spillers egen plan (D-25, D-49); en
 * organisasjonstrener som vil endre noe, sender forslag (D-05).
 */
export function coachSkrivbarPlayerWhere(viewer: {
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
    ],
  };
}

/**
 * SKRIVETILGANG: kan coachen/adminen endre denne spillerens data og plan?
 * Server-actions som tar en spiller-id MÅ kalle denne før skriving — rolle-
 * sjekk alene er ikke nok (en coach skal ikke kunne endre en annen coachs
 * spillere via id-parameteren). Trener-medlemskap i en gruppe teller ikke.
 * For ren lesing: `harCoachLesetilgangTilSpiller`.
 */
export async function harCoachTilgangTilSpiller(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { AND: [{ id: playerId }, coachSkrivbarPlayerWhere(viewer)] },
    select: { id: true },
  });
  return treff != null;
}

/** Som `harCoachTilgangTilSpiller` (skrivetilgang), men kaster ved manglende tilgang. */
export async function assertCoachTilgangTilSpiller(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<void> {
  if (!(await harCoachTilgangTilSpiller(viewer, playerId))) {
    throw new Error("Du har ikke tilgang til denne spilleren.");
  }
}

/**
 * LESETILGANG (innsyn, aldri skriving): lese-scope (`coachScopedPlayerWhere`)
 * ELLER gyldig uttrykkelig deling med vieweren som organisasjonstrener
 * (WANG/TN, D-04). Delingen kontrolleres på hvert oppslag gjennom
 * `medNavngittProfil` (samme lås som tilbaketrekking, forelder under 16,
 * verifisert trener-e-post), så trekk virker med en gang. Delingsgrenen
 * gjelder bare den innloggede brukeren selv.
 */
export async function harCoachLesetilgangTilSpiller(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<boolean> {
  if (!playerId) return false;
  const treff = await prisma.user.findFirst({
    where: { AND: [{ id: playerId }, coachScopedPlayerWhere(viewer)] },
    select: { id: true },
  });
  if (treff != null) return true;
  if (viewer.role !== "COACH") return false;
  return harDeltProfilMedTrener(viewer.id, playerId);
}

/** Har spilleren en gjeldende deling med denne treneren i minst ett miljø? */
async function harDeltProfilMedTrener(trenerId: string, playerId: string): Promise<boolean> {
  const kandidater = await prisma.trenerDelingsInvitasjon.findMany({
    where: { userId: playerId, acceptedByUserId: trenerId, acceptedAt: { not: null }, revokedAt: null },
    select: { mottakerGruppeId: true },
    distinct: ["mottakerGruppeId"],
  });
  if (kandidater.length === 0) return false;
  // Lastes ved behov: modulen trekker inn innloggings- og lagringsklienter.
  const { medNavngittProfil } = await import("@/lib/deling/profil-lesing");
  for (const { mottakerGruppeId } of kandidater) {
    if (await medNavngittProfil(trenerId, playerId, mottakerGruppeId, async () => true)) return true;
  }
  return false;
}
