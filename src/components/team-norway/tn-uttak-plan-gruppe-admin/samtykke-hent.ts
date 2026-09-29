import "server-only";

import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";
import { vurderDeling, type TnDelingVurdering } from "./samtykke-data";

export type TnSamtykkeRad = TnDelingVurdering & { id: string; navn: string; kreverForesatt: boolean };

/**
 * Aktive spillere i gruppen med status for deling fra PlayerHQ mot AKKURAT
 * denne gruppen. Leser bare samtykkeradene, aldri spillerens data.
 */
export async function hentTnSamtykkeoversikt(gruppeId: string): Promise<TnSamtykkeRad[]> {
  const spillere = await prisma.user.findMany({
    where: { deletedAt: null, groupMemberships: { some: { groupId: gruppeId, ...aktivtSpillerMedlemskapWhere() } } },
    select: { id: true, name: true, email: true, requiresGuardianConsent: true, dateOfBirth: true },
    orderBy: { name: "asc" },
  });
  if (spillere.length === 0) return [];

  const rader = await prisma.delingsSamtykke.findMany({
    where: { userId: { in: spillere.map((s) => s.id) }, mottakerGruppeId: gruppeId },
    select: { userId: true, scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
  });

  return spillere.map((s) => {
    const kreverForesatt = maaHaForesattSamtykke({ requiresGuardianConsent: s.requiresGuardianConsent, dateOfBirth: s.dateOfBirth });
    return {
      id: s.id,
      navn: s.name ?? s.email ?? "Ukjent",
      kreverForesatt,
      ...vurderDeling(rader.filter((r) => r.userId === s.id), gruppeId, kreverForesatt),
    };
  });
}
