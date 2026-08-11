/**
 * PlayerHQ · Gameplan-banekart (/portal/gameplan/[baneId]) — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-gameplan-banekart.html.
 *
 * Struktur per fasit: tilbake «‹ Gameplan» → topp (banenavn / «Banekart») →
 * merknad («N hull kartlagt · par X») → kartpanel (Mapbox-satellitt med
 * tee/green per hull — CourseMap gjenbrukes som den er) → hull-liste
 * (circlenum · «Par X · Y m» · slag plottet · chevron) med hull-for-hull-
 * navigasjon til /hull/[nr]. Tom tilstand («bane uten kartdata») med
 * fasit-copy. Ingen clay-CTA — fasiten har ingen. Alle tall fra databasen.
 * Strategivalg (buffer/presisjonsstrategi) og why-details bor på
 * hull-detalj-flaten (/hull/[nr]) — utenfor denne fasitens skjerm.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneOverview } from "@/lib/gameplan/queries";
import { CourseMap, type CourseMapHole } from "@/components/gameplan/course-map";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Kort, Rad, TomTilstand, TilbakeLenke } from "@/components/v2";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

/** Fasitens `.merknad` — Lora-prosa på soft flate. */
const MERKNAD: CSSProperties = {
  fontFamily: T.bodyFont,
  fontSize: 12,
  color: T.mut,
  padding: "8px 12px",
  background: T.panel2,
  borderRadius: 8,
  margin: 0,
};

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
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/gameplan">Gameplan</TilbakeLenke>
      <div
        data-paper-slug="playerhq-gameplan-banekart"
        data-od-id="playerhq-gameplan-banekart"
        style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
      >
        {/* Topp per fasit: banenavn som tittel, «Banekart» som sub */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
            {bane.navn}
          </h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            Banekart
          </span>
        </div>

        {/* Merknad — kartlagt-status i klarspråk */}
        <p style={MERKNAD}>
          {harData
            ? `${holes.length} hull kartlagt${parSum > 0 ? ` · par ${parSum}` : ""}`
            : "Banen er ikke kartlagt ennå."}
        </p>

        {/* Kartpanel — Mapbox-satellitt med tee/green per hull (fasitens mapph) */}
        {harData && harKart && (
          <CourseMap
            center={{ lat: bane.latitude!, lng: bane.longitude! }}
            geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
            holes={mapHoles}
            className="h-[220px] w-full overflow-hidden rounded-xl border border-border"
          />
        )}

        {/* Hull-liste / tom tilstand */}
        <Kort eyebrow="Hull" pad={harData ? "16px 18px 6px" : undefined}>
          {harData ? (
            holes.map((h, i) => (
              <Link
                key={h.id}
                href={`/portal/gameplan/${bane.id}/hull/${h.holeNumber}`}
                data-od-id={`banekart-hull-${h.holeNumber}`}
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
                        flex: "none",
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
            ))
          ) : (
            <TomTilstand
              icon="map-pin"
              title="Ingen hull kartlagt ennå"
              sub="Geometri legges inn av AK Golf HQ når banen er lagt til i systemet."
            />
          )}
        </Kort>
      </div>
    </V2Shell>
  );
}
