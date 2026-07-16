/**
 * AgencyOS — Anlegg (GJENNOMFØRE · ANLEGG), /admin/anlegg. v2-port 16. juli 2026.
 *
 * Tile lenker til /admin/availability (fasit-flyt).
 *
 * Datakilde: prisma.location → facilities (aktive) + booking-telling denne uka.
 * Fasit viser «78 % belegg» — ekte belegg-% krever åpningstider vi ikke har,
 * så metaStrong viser ekte antall bookinger denne uka i stedet (aldri påfunn).
 * Beskrivelse (à la «12 matter · 2 TrackMan») = Facility.description, ellers «—».
 * «+ Nytt anlegg» gjenbruker eksisterende LocationFormV2 (ekte CRUD).
 *
 * Kjent, uendret begrensning (ikke del av denne restylingen): kun opprett av
 * lokasjon er koblet på denne siden. Rediger/slett-lokasjon og fasilitet-
 * administrasjon (FacilityFormV2 finnes og virker, men har ingen kallested
 * her) er en egen oppgave — se docs/MASTER-SKJERMPLAN.md.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AdminAnleggV2, type AdminAnleggV2Data, type AnleggTile } from "@/components/admin/v2/AdminAnleggV2";
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
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      facilities: {
        where: { active: true },
        orderBy: { name: "asc" },
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

  const tiles: AnleggTile[] = locations.flatMap((l) =>
    l.facilities.map((f) => ({
      id: f.id,
      tittel: `${l.name} · ${f.name}`,
      ikonNavn: TYPE_IKON[f.type],
      bookinger: f._count.bookings,
      beskrivelse: f.description,
    })),
  );

  const data: AdminAnleggV2Data = {
    tittelOrd: tiles.length < TALLORD.length ? TALLORD[tiles.length] : String(tiles.length),
    flertall: tiles.length !== 1,
    tiles,
  };

  return <AdminAnleggV2 data={data} />;
}
