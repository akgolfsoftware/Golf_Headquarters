/**
 * PlayerHQ Banekart-oversikt (/portal/baneguide/[baneId]) — skjerm 2 (fase 5).
 * Hele banen på satellitt + hull-liste med spillerens slag-antall per hull.
 */
import { Eyebrow } from "@/components/athletic/golfdata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneOverview } from "@/lib/baneguide/queries";
import { CourseMap, type CourseMapHole } from "@/components/baneguide/course-map";

export const dynamic = "force-dynamic";

export default async function BaneOverviewPage({
  params,
}: {
  params: Promise<{ baneId: string }>;
}) {
  const { baneId } = await params;
  const user = await requirePortalUser();
  const data = await getBaneOverview(baneId, user.id);
  if (!data) notFound();
  const { bane, holes, parSum } = data;

  const mapHoles: CourseMapHole[] = holes.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    teeLat: h.teeLat,
    teeLng: h.teeLng,
    greenLat: h.greenLat,
    greenLng: h.greenLng,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Eyebrow as="span">{bane.navn}</Eyebrow>
      <h1 className="mt-1.5 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">Banekart</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {holes.length} hull kartlagt{parSum > 0 ? ` · par ${parSum}` : ""}
      </p>

      {bane.latitude != null && bane.longitude != null && (
        <CourseMap
          center={{ lat: bane.latitude, lng: bane.longitude }}
          geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
          holes={mapHoles}
          className="mt-4 h-[340px] w-full overflow-hidden rounded-xl border border-border"
        />
      )}

      <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {holes.map((h) => (
          <li key={h.id}>
            <Link
              href={`/portal/baneguide/${bane.id}/hull/${h.holeNumber}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-primary">
                {h.holeNumber}
              </span>
              <div className="flex-1 font-mono text-xs text-muted-foreground">
                {h.par ? `par ${h.par}` : "par –"}
                {h.lengthMeter ? ` · ${h.lengthMeter} m` : ""}
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {h.shotCount > 0 ? `${h.shotCount} slag` : "ingen slag"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
