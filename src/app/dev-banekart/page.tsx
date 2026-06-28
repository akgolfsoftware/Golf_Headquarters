/**
 * MIDLERTIDIG dev-rute for å verifisere banekart-fundamentet (fase 1).
 * Ikke en designet skjerm — de ekte baneguide-skjermene bygges via
 * design-porting-gate under /portal/baneguide. Slett eller erstatt når
 * skjerm 2 (/portal/baneguide/[baneId]) er portet.
 */
import { prisma } from "@/lib/prisma";
import { CourseMap, type CourseMapHole } from "@/components/baneguide/course-map";

export const dynamic = "force-dynamic";

export default async function DevBanekartPage() {
  const bane = await prisma.bane.findUnique({
    where: { slug: "onsoy-golfklubb" },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });

  if (!bane || bane.latitude == null || bane.longitude == null) {
    return <div className="p-8">Onsøy ikke importert ennå. Kjør scripts/import-bane-osm.ts onsoy.</div>;
  }

  const holes: CourseMapHole[] = bane.holes.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    teeLat: h.teeLat,
    teeLng: h.teeLng,
    greenLat: h.greenLat,
    greenLng: h.greenLng,
  }));

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="font-display text-2xl text-foreground">{bane.navn}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {bane.holes.length} strukturerte hull · kilde {bane.geometrySource} · DEV-verifisering av banekart-fundament
      </p>
      <CourseMap
        center={{ lat: bane.latitude, lng: bane.longitude }}
        geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
        holes={holes}
        className="mt-4 h-[600px] w-full overflow-hidden rounded-xl border border-border"
      />
    </div>
  );
}
