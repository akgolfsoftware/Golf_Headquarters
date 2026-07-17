/**
 * AgencyOS — Tjenester (GJENNOMFØRE · TJENESTER), /admin/services. v2-port 16. juli 2026.
 *
 * Datakilde: prisma.serviceType (priceOre/durationMin/active — ekte tall).
 * «+ Ny tjeneste» og «Endre»/slett per rad gjenbruker ServiceFormV2 (ekte CRUD, urørt).
 *
 * Fikset samtidig: tabellen viste tidligere kun opprett-knappen — rediger/slett
 * var bygget i skjemaet (updateService/deleteService) men aldri koblet per rad.
 * Nå rendres «Endre» per rad — ingen ny funksjon, bare faktisk bruk av det
 * som allerede fantes.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminServicesV2, type AdminServicesV2Data } from "@/components/admin/v2/AdminServicesV2";

export const dynamic = "force-dynamic";

const TALLORD = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];

function prisLabel(priceOre: number): string {
  const kr = priceOre / 100;
  return `${kr.toLocaleString("nb-NO", { maximumFractionDigits: priceOre % 100 === 0 ? 0 : 2 })} kr`;
}

export default async function ServicesPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tjenester = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id: true, name: true, description: true, durationMin: true, priceOre: true, active: true },
  });

  const data: AdminServicesV2Data = {
    tittelOrd: tjenester.length < TALLORD.length ? TALLORD[tjenester.length] : String(tjenester.length),
    flertall: tjenester.length !== 1,
    tjenester: tjenester.map((s) => ({
      id: s.id,
      navn: s.name,
      varighetMin: s.durationMin,
      prisLabel: prisLabel(s.priceOre),
      aktiv: s.active,
      raw: s,
    })),
  };

  return <AdminServicesV2 data={data} />;
}
