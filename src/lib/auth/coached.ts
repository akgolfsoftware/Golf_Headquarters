import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere, aktivtTrenerMedlemskapWhere, ikkeOrgGruppeWhere } from "@/lib/domain/grupper";
import { coachingRelasjonWhere } from "./coaching-relasjon";

/**
 * C1: AgencyOS krever aktivt PLAYER-medlemskap i en aktiv AK-administrert
 * coachinggruppe. Enrollment alene gir ikke profilinnsyn. WANG/TN-innsyn
 * har egne delingsporter, også for ADMIN; disse gruppene er aldri en snarvei.
 * Dette er medlems-/mottakerporten. Uttrykkelig AK-profildeling er fortsatt
 * et eget gjenstående C1-krav og må ikke utledes av gruppeanalyse-ja.
 */
function aktivAgencyGruppeWhere(): Prisma.GroupWhereInput {
  return { managedByAkGolf: true, arkivertAt: null, ...ikkeOrgGruppeWhere() };
}

/** Kandidatutvalg for AgencyOS. Gir ikke i seg selv delingssamtykke. */
export function coachedPlayerWhere(): Prisma.UserWhereInput {
  return {
    role: "PLAYER", deletedAt: null,
    groupMemberships: { some: { ...aktivtSpillerMedlemskapWhere(), group: aktivAgencyGruppeWhere() } },
  };
}

/**
 * Klassifiserer eksisterende coachingtilbud for spillerens egen tjeneste.
 * IKKE en trenerautorisasjon. Bevarer betalt/avtalt tilbud uten gruppemedlemskap.
 * Profilhandlinger må i tillegg bruke harCoachTilgangTilSpiller eller leseporten.
 */
export async function erCoachetSpiller(userId: string): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { id: userId, ...coachingRelasjonWhere() },
    select: { id: true },
  });
  return treff != null;
}

function gruppeScope(viewer: { id: string; role: string }, les: boolean): Prisma.UserWhereInput {
  if (!viewer.id) return { id: { in: [] } };
  if (viewer.role === "ADMIN") return coachedPlayerWhere();
  if (viewer.role !== "COACH") return { id: { in: [] } };
  const gruppe = aktivAgencyGruppeWhere();
  return {
    role: "PLAYER", deletedAt: null,
    groupMemberships: { some: {
      ...aktivtSpillerMedlemskapWhere(),
      // Begge roller må gjelde DEN SAMME gruppen. En annen aktiv gruppe eller
      // enrollment hos coachen kan ikke redde et avsluttet/feil medlemskap her.
      group: {
        ...gruppe,
        OR: [
          { coachId: viewer.id },
          { members: { some: les
            ? aktivtTrenerMedlemskapWhere(viewer.id)
            : { userId: viewer.id, role: "COACH", endedAt: null } } },
        ],
      },
    } },
  };
}

/** Lesing: ansvarlig trener, aktiv COACH eller aktiv ASSISTANT i samme AK-gruppe. */
export function coachScopedPlayerWhere(viewer: { id: string; role: string }): Prisma.UserWhereInput {
  return gruppeScope(viewer, true);
}

/** Skriving: ansvarlig trener eller aktiv COACH. ASSISTANT er fortsatt bare leser. */
export function coachSkrivbarPlayerWhere(viewer: { id: string; role: string }): Prisma.UserWhereInput {
  return gruppeScope(viewer, false);
}

/**
 * SKRIVETILGANG: kan coachen/adminen endre denne spillerens data og plan?
 * Server-actions som tar en spiller-id MÅ kalle denne før skriving — rolle-
 * sjekk alene er ikke nok (en coach skal ikke kunne endre en annen coachs
 * spillere via id-parameteren). Bare ansvarlig trener eller aktiv COACH i
 * samme aktive AK-gruppe kan skrive; ASSISTANT kan ikke.
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
