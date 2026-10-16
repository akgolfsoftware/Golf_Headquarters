/**
 * Stedet for en tjeneste (bookingplanen steg 2, 15.10.2026).
 *
 * `ServiceType.locationId` gjelder når det er satt i AgencyOS. Er det null,
 * faller vi tilbake til den gamle gjetningen fra slug-en («trackman» i navnet
 * betyr Mulligan, ellers Gamle Fredrikstad GK), så tjenester som ikke er
 * oppdatert ennå oppfører seg som før.
 */

import { prisma } from "@/lib/prisma";

export type TjenesteSted = { id: string; name: string };

export async function finnStedForTjeneste(service: {
  locationId: string | null;
  slug: string;
}): Promise<TjenesteSted | null> {
  if (service.locationId) {
    const satt = await prisma.location.findUnique({
      where: { id: service.locationId },
      select: { id: true, name: true },
    });
    if (satt) return satt;
  }

  // Fallback bare når stedet ikke er satt på tjenesten: samme gjetning som
  // før feltet fantes. Fjernes når alle aktive tjenester har locationId.
  const wantMulligan = service.slug.includes("trackman");
  const gjettet = await prisma.location.findFirst({
    where: wantMulligan
      ? { OR: [{ name: { contains: "Mulligan" } }, { name: { contains: "mulligan" } }] }
      : {
          OR: [
            { name: { contains: "Fredrikstad" } },
            { name: { contains: "GFGK" } },
            { name: { contains: "Bossum" } },
            { name: { contains: "Golfklubb" } },
          ],
        },
    select: { id: true, name: true },
  });
  return gjettet ?? (await prisma.location.findFirst({ select: { id: true, name: true } }));
}
