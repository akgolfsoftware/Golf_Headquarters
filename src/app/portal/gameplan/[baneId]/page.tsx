/**
 * PlayerHQ · Gameplan-banekart (/portal/gameplan/[baneId]) i nytt design (PH20Bane, pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, malen «gameplan». Avvikene står i PH20Bane.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Alle tall fra databasen (getBaneOverview). CourseMap (Mapbox) gjenbrukes som den er.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getBaneOverview } from "@/lib/gameplan/queries";
import { CourseMap, type CourseMapHole } from "@/components/gameplan/course-map";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Bane } from "@/components/portal/precision/PH20Bane";

export const dynamic = "force-dynamic";

export default async function BaneOverviewPage({
  params,
}: {
  params: Promise<{ baneId: string }>;
}) {
  const { baneId } = await params;
  const user = await requirePortalUser();
  const [data, uleste] = await Promise.all([
    getBaneOverview(baneId, user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!data) notFound();
  const { bane, holes, parSum } = data;

  const harKart = holes.length > 0 && bane.latitude != null && bane.longitude != null;
  const mapHoles: CourseMapHole[] = holes.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    teeLat: h.teeLat,
    teeLng: h.teeLng,
    greenLat: h.greenLat,
    greenLng: h.greenLng,
  }));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH20Bane
        baneId={bane.id}
        navn={bane.navn}
        parSum={parSum}
        hull={holes.map((h) => ({ nr: h.holeNumber, par: h.par, lengde: h.lengthMeter, slag: h.shotCount }))}
        kart={harKart ? (
          <CourseMap
            center={{ lat: bane.latitude!, lng: bane.longitude! }}
            geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
            holes={mapHoles}
          />
        ) : undefined}
      />
    </PlayerHQSkall>
  );
}
