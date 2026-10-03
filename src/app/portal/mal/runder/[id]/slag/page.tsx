/**
 * PH18Slag — slagredigering i PlayerHQSkall.
 * SlagWizard og UpGame-import er uendret. Skriving krever at du eier runden.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";

import { SlagWizard, type BaneKartData } from "../slag-wizard";
import { UpGameImportModal } from "../upgame-import-modal";

export const dynamic = "force-dynamic";

export default async function SlagRegistreringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const [runde, ulest] = await Promise.all([
    prisma.round.findUnique({
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
    }),
    getUnreadNotifications(user.id, 1),
  ]);
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
  // Ellers null: wizarden skjuler kartet og lar logging virke uendret.
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

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href={`/portal/mal/runder/${id}`} className="ph-tilbake">
          Tilbake til runden
        </Link>
        <div className="ph-flate">
          <header>
            <p>
              {runde.course.name} · {datoTekst}
            </p>
            <h1>Avansert redigering.</h1>
            <p>
              Rediger enkeltslag på en lagret runde, eller importer fra UpGame. Ny føring gjøres{" "}
              <Link href="/portal/runde/logg">slag for slag</Link>
              {" "}— raskere og alltid komplett kjede.
            </p>
          </header>
          <UpGameImportModal roundId={id} />
          <SlagWizard roundId={id} eksisterendeSlag={serialiserteSlag} baneKart={baneKart} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
