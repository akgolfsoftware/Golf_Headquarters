/**
 * AgencyOS — Anlegg (GJENNOMFØRE · ANLEGG), /admin/anlegg. v2-port 16. juli
 * 2026, administrasjon KOBLET 17. juli 2026 (B8a).
 *
 * Fasilitet-lenke til /admin/availability (fasit-flyt) er beholdt.
 *
 * Datakilde: prisma.location → facilities + booking-telling denne uka.
 * Henter nå OGSÅ deaktiverte lokasjoner/fasiliteter (soft delete) slik at de
 * kan vises med ærlig «Deaktivert»-status og aktiveres igjen — tittel-tallet
 * teller kun aktive fasiliteter i aktive lokasjoner (det booking faktisk ser).
 * Fasit viser «78 % belegg» — ekte belegg-% krever åpningstider vi ikke har,
 * så metaStrong viser ekte antall bookinger denne uka i stedet (aldri påfunn).
 * Beskrivelse (à la «12 matter · 2 TrackMan») = Facility.description, ellers «—».
 * CRUD: LocationFormV2 (opprett/rediger/deaktiver) + FacilityFormV2
 * (opprett/rediger/deaktiver) via location-actions.ts.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AdminAnleggV2, type AdminAnleggV2Data, type AnleggLokasjon } from "@/components/admin/v2/AdminAnleggV2";
import type { FacilityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const TALLORD = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];

const TYPE_IKON: Record<FacilityType, string> = {
  STUDIO: "radar",
  RANGE_1F: "flag",
  RANGE_2F: "flag",
  PUTTING_GREEN: "circle-dot",
  SHORT_GAME: "circle-dot",
  COURSE_9H: "map",
  COURSE_18H: "map",
  SPECIFIC_HOLES: "map",
  GENERAL: "building-2",
};

export default async function AnleggPage() {
  await requireCapability(Capability.MANAGE_FACILITIES);

  const naa = new Date();
  const ukeStart = new Date(naa);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const locations = await prisma.location.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      facilities: {
        orderBy: [{ active: "desc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  startAt: { gte: ukeStart, lt: ukeSlutt },
                  status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
                },
              },
            },
          },
        },
      },
    },
  });

  const lokasjoner: AnleggLokasjon[] = locations.map((l) => ({
    id: l.id,
    navn: l.name,
    adresse: l.address,
    aktiv: l.active,
    breddegrad: l.latitude,
    lengdegrad: l.longitude,
    fasiliteter: l.facilities.map((f) => ({
      id: f.id,
      navn: f.name,
      ikonNavn: TYPE_IKON[f.type],
      type: f.type,
      kapasitet: f.capacity,
      aktiv: f.active,
      bookinger: f._count.bookings,
      beskrivelse: f.description,
    })),
  }));

  // Tittel-tallet = det booking faktisk ser: aktive fasiliteter i aktive lokasjoner.
  const antallAktive = locations
    .filter((l) => l.active)
    .reduce((sum, l) => sum + l.facilities.filter((f) => f.active).length, 0);

  const data: AdminAnleggV2Data = {
    tittelOrd: antallAktive < TALLORD.length ? TALLORD[antallAktive] : String(antallAktive),
    flertall: antallAktive !== 1,
    lokasjoner,
  };

  return <AdminAnleggV2 data={data} />;
}
