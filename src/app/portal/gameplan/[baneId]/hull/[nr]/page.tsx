/**
 * PlayerHQ Hull-detalj — Gameplan (/portal/gameplan/[baneId]/hull/[nr]) i nytt design (PH20Hull, pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, malen «hull». Avvikene står i PH20Hull.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 *
 * Satellitt + din spredning fra dispersion-motoren, pluss «Planlegg» (C7, interaktiv hull-for-hull-modus:
 * dra sikte, mal bra/aldri-soner, carry/igjen fra ekte GPS). Segment via ?type= (server-side lenker).
 * CourseMap (mapbox) og GameplanPlanlegger gjenbrukes som de er.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getHoleDetail } from "@/lib/gameplan/queries";
import { hentGameplanForHull } from "@/lib/gameplan/actions";
import { CourseMap } from "@/components/gameplan/course-map";
import { GameplanPlanlegger } from "@/components/gameplan/GameplanPlanlegger";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Hull, PH20_SEGMENTER } from "@/components/portal/precision/PH20Hull";
import type { ShotType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const SHOT_TYPE: Record<string, ShotType | undefined> = {
  utslag: "DRIVE",
  innspill: "APPROACH",
  putt: "PUTT",
  planlegg: undefined,
};

export default async function HoleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ baneId: string; nr: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { baneId, nr } = await params;
  const { type } = await searchParams;
  const holeNumber = parseInt(nr, 10);
  const segment = PH20_SEGMENTER.find((s) => s.key === type)?.key ?? "utslag";
  const erPlanlegg = segment === "planlegg";

  const user = await requirePortalUser();
  const [data, uleste] = await Promise.all([
    getHoleDetail(baneId, holeNumber, user.id, SHOT_TYPE[segment]),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!data) notFound();
  const { bane, hole, tee, green, landings, stats } = data;

  const [gameplanData, neste] = await Promise.all([
    erPlanlegg ? hentGameplanForHull(hole.id) : Promise.resolve(null),
    prisma.courseHole.findFirst({
      where: { baneId: bane.id, holeNumber: { gt: hole.holeNumber } },
      orderBy: { holeNumber: "asc" },
      select: { holeNumber: true },
    }),
  ]);

  const center =
    tee && green
      ? { lat: (tee.lat + green.lat) / 2, lng: (tee.lng + green.lng) / 2 }
      : bane.latitude != null && bane.longitude != null
        ? { lat: bane.latitude, lng: bane.longitude }
        : null;
  const geojson = bane.geojson as unknown as GeoJSON.FeatureCollection;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH20Hull
        baneId={bane.id}
        baneNavn={bane.navn}
        nr={hole.holeNumber}
        par={hole.par}
        lengde={hole.lengthMeter}
        segment={segment}
        stats={stats}
        nesteNr={neste?.holeNumber ?? null}
        kart={!erPlanlegg && center ? (
          <CourseMap
            center={center}
            zoom={16.5}
            geojson={geojson}
            holes={tee ? [{
              holeNumber: hole.holeNumber,
              par: hole.par,
              teeLat: hole.teeLat,
              teeLng: hole.teeLng,
              greenLat: hole.greenLat,
              greenLng: hole.greenLng,
            }] : []}
            shotPoints={landings}
            aimLine={tee && green ? { tee, green } : null}
          />
        ) : undefined}
        planlegger={erPlanlegg && center && tee && green && gameplanData ? (
          <GameplanPlanlegger
            holeId={hole.id}
            tee={tee}
            green={green}
            center={center}
            geojson={geojson}
            initial={gameplanData}
            ellipse={stats?.ellipse ?? null}
          />
        ) : undefined}
      />
    </PlayerHQSkall>
  );
}
