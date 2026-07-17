/**
 * PlayerHQ Slag-registrering — v2-ramme rundt SlagWizard + UpGameImportModal
 * (verktøyene er shadcn/tailwind og gjenbrukes som de er; kun sidens hode og
 * chrome er v2). Skrive-tilgang håndheves i actions (assertRoundOwner) —
 * kun rundens eier.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { SlagWizard, type BaneKartData } from "../slag-wizard";
import { UpGameImportModal } from "../upgame-import-modal";

export const dynamic = "force-dynamic";

export default async function SlagRegistreringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
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
  // Ellers null: wizarden skjuler kartet ærlig og lar logging virke uendret.
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
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link
          href={`/portal/mal/runder/${id}`}
          style={{ textDecoration: "none", alignSelf: "flex-start" }}
        >
          <MikroMeta icon="arrow-left">Tilbake til runden</MikroMeta>
        </Link>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>
              {runde.course.name} · {datoTekst}
            </Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="redigering.">Avansert</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0", lineHeight: 1.6 }}>
              Rediger enkeltslag på en lagret runde, eller importer fra UpGame. Ny føring gjøres{" "}
              <Link href="/portal/runde/logg" style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}>
                slag for slag
              </Link>{" "}
              — raskere og alltid komplett kjede.
            </p>
          </div>
          <UpGameImportModal roundId={id} />
        </div>

        <SlagWizard roundId={id} eksisterendeSlag={serialiserteSlag} baneKart={baneKart} />
      </div>
    </V2Shell>
  );
}
