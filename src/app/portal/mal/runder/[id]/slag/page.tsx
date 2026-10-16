/**
 * PlayerHQ Rediger slag (/portal/mal/runder/[id]/slag) i nytt design (PHRD03RedigerSlag, pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, malene «slag» og «import». Avvikene står i komponenten.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Skrive-tilgang håndheves i actions (assertRoundOwner) — kun rundens eier.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHRD03RedigerSlag, type BaneKartData } from "@/components/portal/precision/PHRD03RedigerSlag";

export const dynamic = "force-dynamic";

export default async function SlagRegistreringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          name: true,
          // Banegeometri for det interaktive slag-kartet (valgfri Bane-kobling).
          bane: {
            select: {
              geojson: true,
              latitude: true,
              longitude: true,
              holes: {
                orderBy: { holeNumber: "asc" },
                select: {
                  holeNumber: true,
                  par: true,
                  teeLat: true,
                  teeLng: true,
                  greenLat: true,
                  greenLng: true,
                },
              },
            },
          },
        },
      },
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });
  if (!runde) notFound();
  // Kun eieren registrerer slag (actions håndhever det samme ved skriving).
  if (runde.userId !== user.id) notFound();

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const serialiserteSlag = runde.shots.map((s) => ({
    id: s.id,
    holeNumber: s.holeNumber,
    holePar: s.holePar,
    shotNumber: s.shotNumber,
    club: s.club,
    lie: s.lie as string,
    distanceToPin: s.distanceToPin,
    distanceHit: s.distanceHit,
    windDir: s.windDir as string | null,
    shotType: s.shotType as string,
    isPenalty: s.isPenalty,
    notes: s.notes,
    // GPS bevares ved redigering (X=lng, Y=lat — se lib/gameplan/shot-coords).
    startLat: s.startY,
    startLng: s.startX,
    endLat: s.endY,
    endLng: s.endX,
  }));

  // Banegeometri til slag-kartet — kun når banen har geojson + senter.
  // Ellers null: skjermen sier at kartet mangler, og slag lagres uten landingspunkt.
  const bane = runde.course.bane;
  const baneKart: BaneKartData | null =
    bane && bane.geojson && bane.latitude != null && bane.longitude != null
      ? {
          center: { lat: bane.latitude, lng: bane.longitude },
          geojson: bane.geojson as unknown as GeoJSON.FeatureCollection,
          holes: bane.holes.map((h) => ({
            holeNumber: h.holeNumber,
            par: h.par,
            teeLat: h.teeLat,
            teeLng: h.teeLng,
            greenLat: h.greenLat,
            greenLng: h.greenLng,
          })),
        }
      : null;

  const uleste = await prisma.notification.count({ where: { userId: user.id, readAt: null } });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PHRD03RedigerSlag roundId={id} baneNavn={runde.course.name} dato={datoTekst} eksisterendeSlag={serialiserteSlag} baneKart={baneKart} />
    </PlayerHQSkall>
  );
}
