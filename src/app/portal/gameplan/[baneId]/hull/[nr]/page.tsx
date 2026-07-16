/**
 * PlayerHQ Hull-detalj — Gameplan (B30, omdøpt fra "Baneguide"). Signaturskjerm:
 * satellitt + din spredning + KPI fra dispersion-motoren + innsikt, PLUSS en
 * fjerde "Planlegg"-fane (C7, interaktiv hull-for-hull-modus) — dra sikte,
 * mal bra/aldri-soner, se carry/igjen regnet live fra ekte GPS, og hvor stor
 * andel av din faktiske spredning som havner i rød sone. Segment via ?type=
 * (server-side lenke-pills). CourseMap (mapbox) gjenbrukes som den er.
 * «?»-regelen: σ forklares via spredningSigma, bias via skjevhetBias.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getHoleDetail } from "@/lib/gameplan/queries";
import { hentGameplanForHull } from "@/lib/gameplan/actions";
import { CourseMap } from "@/components/gameplan/course-map";
import { GameplanPlanlegger } from "@/components/gameplan/GameplanPlanlegger";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, MikroMeta, TomTilstand } from "@/components/v2";
import type { ShotType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const SEGMENTS: { key: string; label: string; type?: ShotType }[] = [
  { key: "utslag", label: "Utslag", type: "DRIVE" },
  { key: "innspill", label: "Innspill", type: "APPROACH" },
  { key: "putt", label: "Putt", type: "PUTT" },
  { key: "planlegg", label: "Planlegg" },
];

const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");
const signed = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1).replace(".", ",");

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
  const segment = SEGMENTS.find((s) => s.key === type) ?? SEGMENTS[0];
  const erPlanlegg = segment.key === "planlegg";

  const user = await requirePortalUser();
  const data = await getHoleDetail(baneId, holeNumber, user.id, segment.type);
  if (!data) notFound();
  const { bane, hole, tee, green, landings, stats } = data;

  const gameplanData = erPlanlegg ? await hentGameplanForHull(hole.id) : null;

  const center =
    tee && green
      ? { lat: (tee.lat + green.lat) / 2, lng: (tee.lng + green.lng) / 2 }
      : bane.latitude != null && bane.longitude != null
        ? { lat: bane.latitude, lng: bane.longitude }
        : null;

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Link
          href={`/portal/gameplan/${bane.id}`}
          style={{ textDecoration: "none", alignSelf: "flex-start" }}
        >
          <MikroMeta icon="arrow-left">Banekart</MikroMeta>
        </Link>

        <div>
          <Caps>Gameplan · {bane.navn}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={`hull ${hole.holeNumber}`} />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {hole.par ? `Par ${hole.par}` : "Par –"}
            {hole.lengthMeter ? ` · ${hole.lengthMeter} m` : ""}
          </p>
        </div>

        {!erPlanlegg && center && (
          <CourseMap
            center={center}
            zoom={16.5}
            geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
            holes={
              tee
                ? [
                    {
                      holeNumber: hole.holeNumber,
                      par: hole.par,
                      teeLat: hole.teeLat,
                      teeLng: hole.teeLng,
                      greenLat: hole.greenLat,
                      greenLng: hole.greenLng,
                    },
                  ]
                : []
            }
            shotPoints={landings}
            aimLine={tee && green ? { tee, green } : null}
            className="h-[320px] w-full overflow-hidden rounded-xl border border-border"
          />
        )}

        {/* Segment-pills (server-side lenker, speiler PillVelger-idiomet) */}
        <div style={{ display: "flex", gap: 6 }}>
          {SEGMENTS.map((s) => {
            const active = s.key === segment.key;
            return (
              <Link
                key={s.key}
                href={`/portal/gameplan/${bane.id}/hull/${hole.holeNumber}?type=${s.key}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  textDecoration: "none",
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "9px 0",
                  borderRadius: 9999,
                  color: active ? T.onLime : T.mut,
                  background: active ? T.lime : T.panel2,
                  border: `1px solid ${active ? "transparent" : T.border}`,
                }}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {erPlanlegg ? (
          center && tee && green && gameplanData ? (
            <GameplanPlanlegger
              holeId={hole.id}
              tee={tee}
              green={green}
              center={center}
              geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
              initial={gameplanData}
              ellipse={stats?.ellipse ?? null}
            />
          ) : (
            <Kort>
              <TomTilstand
                icon="crosshair"
                title="Mangler tee/green-GPS"
                sub="Dette hullet har ikke nok kartlagt geometri til interaktiv planlegging ennå."
              />
            </Kort>
          )
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
              <KpiFlis label="σ side" value={`${fmt(stats.std.lateral)} m`} hjelp="spredningSigma" />
              <KpiFlis label="σ lengde" value={`${fmt(stats.std.distance)} m`} hjelp="spredningSigma" />
              <KpiFlis
                label="Bias"
                value={`${signed(stats.bias.lateral)} m${stats.bias.side === "høyre" ? " H" : stats.bias.side === "venstre" ? " V" : ""}`}
                hjelp="skjevhetBias"
              />
              <KpiFlis label="Antall slag" value={String(stats.n)} />
            </div>

            {stats.bias.side !== "rett" && (
              <Kort tint>
                <MikroMeta icon="lightbulb">Innsikt</MikroMeta>
                <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0" }}>
                  Du misser{" "}
                  <em style={{ fontFamily: T.disp, fontStyle: "italic", color: T.lime }}>
                    {fmt(Math.abs(stats.bias.lateral))} m {stats.bias.side}
                  </em>{" "}
                  i snitt på dette hullet. Sikt mot{" "}
                  {stats.bias.side === "høyre" ? "venstre" : "høyre"} halvdel av fairwayen.
                </p>
              </Kort>
            )}
          </>
        ) : (
          <Kort>
            <TomTilstand
              icon="crosshair"
              title={`Ingen ${segment.label.toLowerCase()} plottet ennå`}
              sub="Plott slag på dette hullet for å se spredningen din."
            />
          </Kort>
        )}
      </div>
    </V2Shell>
  );
}
