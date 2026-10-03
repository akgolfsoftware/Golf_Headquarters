/**
 * PH20Bane — banekart i PlayerHQSkall.
 * Hull, par, lengde og kart kommer fra getBaneOverview. Tomt når banen ikke er kartlagt.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getBaneOverview } from "@/lib/gameplan/queries";
import { CourseMap, type CourseMapHole } from "@/components/gameplan/course-map";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TomTilstand } from "@/components/precision/pa";

export const dynamic = "force-dynamic";

export default async function BaneOverviewPage({
  params,
}: {
  params: Promise<{ baneId: string }>;
}) {
  const { baneId } = await params;
  const user = await requirePortalUser();
  const [data, ulest] = await Promise.all([
    getBaneOverview(baneId, user.id),
    getUnreadNotifications(user.id, 1),
  ]);
  if (!data) notFound();
  const { bane, holes, parSum } = data;

  const harData = holes.length > 0;
  const harKart = bane.latitude != null && bane.longitude != null;

  const mapHoles: CourseMapHole[] = holes.map((h) => ({
    holeNumber: h.holeNumber,
    par: h.par,
    teeLat: h.teeLat,
    teeLng: h.teeLng,
    greenLat: h.greenLat,
    greenLng: h.greenLng,
  }));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/gameplan" className="ph-tilbake">Gameplan</Link>
          <header>
            <p>Banekart</p>
            <h1>{bane.navn}</h1>
            <p>
              {harData
                ? `${holes.length} hull kartlagt${parSum > 0 ? ` · par ${parSum}` : ""}`
                : "Banen er ikke kartlagt ennå."}
            </p>
          </header>

          {harData && harKart && (
            <section className="pa-card" aria-label="Kart">
              <CourseMap
                center={{ lat: bane.latitude!, lng: bane.longitude! }}
                geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
                holes={mapHoles}
                className="h-[220px] w-full"
              />
            </section>
          )}

          <section className="pa-card">
            <div className="ph-kort">
              <p>Hull</p>
              {!harData && (
                <TomTilstand
                  icon={MapPin}
                  title="Ingen hull kartlagt ennå"
                  text="Geometri legges inn av AK Golf HQ når banen er lagt til i systemet."
                />
              )}
            </div>
            {harData && (
              <ul className="ph-rader">
                {holes.map((h) => (
                  <li key={h.id}>
                    <Link href={`/portal/gameplan/${bane.id}/hull/${h.holeNumber}`}>
                      <strong>{h.holeNumber}</strong>
                      <span>
                        <strong>{`${h.par ? `Par ${h.par}` : "Par –"}${h.lengthMeter ? ` · ${h.lengthMeter} m` : ""}`}</strong>
                        <small>{h.shotCount > 0 ? `${h.shotCount} slag plottet` : "ingen slag plottet"}</small>
                      </span>
                      <ChevronRight className="pa-icon" size={18} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PlayerHQSkall>
  );
}
