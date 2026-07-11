/**
 * PlayerHQ Banekart-oversikt — v2. Hele banen på satellitt (CourseMap,
 * mapbox — gjenbrukes som den er) + hull-liste med spillerens slag-antall.
 * Dataloader (getBaneOverview) uendret.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneOverview } from "@/lib/baneguide/queries";
import { CourseMap, type CourseMapHole } from "@/components/baneguide/course-map";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, Rad } from "@/components/v2";

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
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Baneguide · {bane.navn}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel>Banekart</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {holes.length} hull kartlagt{parSum > 0 ? ` · par ${parSum}` : ""}
          </p>
        </div>

        {bane.latitude != null && bane.longitude != null && (
          <CourseMap
            center={{ lat: bane.latitude, lng: bane.longitude }}
            geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
            holes={mapHoles}
            className="h-[340px] w-full overflow-hidden rounded-xl border border-border"
          />
        )}

        <Kort pad="6px 18px">
          {holes.map((h, i) => (
            <Link
              key={h.id}
              href={`/portal/baneguide/${bane.id}/hull/${h.holeNumber}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <Rad
                last={i === holes.length - 1}
                leading={
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 9999,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                      fontFamily: T.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.fg,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {h.holeNumber}
                  </span>
                }
                title={`${h.par ? `Par ${h.par}` : "Par –"}${h.lengthMeter ? ` · ${h.lengthMeter} m` : ""}`}
                sub={h.shotCount > 0 ? `${h.shotCount} slag plottet` : "ingen slag plottet"}
              />
            </Link>
          ))}
        </Kort>
      </div>
    </V2Shell>
  );
}
