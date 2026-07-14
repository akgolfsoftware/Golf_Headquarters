/**
 * AgencyOS — Anlegg (`/admin/anlegg`), v2.
 *
 * Port av `(legacy)/anlegg/page.tsx` (2026-07-14, AgencyOS Bølge 2.2) — samme
 * datamodell (`prisma.location`/`facility`, booking-telling denne uka), ny
 * v2-presentasjon i `AdminAnleggV2`. `(legacy)/anlegg/location-actions.ts`
 * bor fortsatt der — delt `createLocation`, uendret.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminAnleggV2, type AdminAnleggV2Tile } from "@/components/admin/v2/AdminAnleggV2";
import type { FacilityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Anlegg · AgencyOS (v2)" };

/** Nærmeste v2-ikon-MAP-treff for hver fasilitetstype (fasitens flag/circle-dot/radar/map-sett finnes ikke 1:1 i v2-MAP). */
const TYPE_IKON: Record<FacilityType, string> = {
  STUDIO: "activity",
  RANGE_1F: "flag",
  RANGE_2F: "flag",
  PUTTING_GREEN: "circle-dot",
  SHORT_GAME: "circle-dot",
  COURSE_9H: "map-pin",
  COURSE_18H: "map-pin",
  SPECIFIC_HOLES: "map-pin",
  GENERAL: "building-2",
};

export default async function AnleggPage() {
  const user = await requireCapability(Capability.MANAGE_FACILITIES);

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
                where: { startAt: { gte: ukeStart, lt: ukeSlutt }, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } },
              },
            },
          },
        },
      },
    },
  });

  const tiles: AdminAnleggV2Tile[] = locations.flatMap((l) =>
    l.facilities.map((f) => ({
      id: f.id,
      tittel: `${l.name} · ${f.name}`,
      ikon: TYPE_IKON[f.type],
      bookinger: f._count.bookings,
      beskrivelse: f.description,
    })),
  );

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminAnleggV2 tiles={tiles} />
    </V2Shell>
  );
}
