/**
 * AgencyOS TrackMan — én økt (coach).
 * Viser spiller, tid, miljø, slag-antall og lenke til full spiller-detalj.
 * Ingen fabrikerte tall.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  TilbakeLenke,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  StatusPill,
  CTAPill,
  TomTilstand,
  Rad,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

const ENV_LABEL: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range matte",
  RANGE_OUTDOOR_GRASS: "Range gress",
  COURSE_PRACTICE: "Bane trening",
  COURSE_COMPETITION: "Bane konkurranse",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV-import",
  api: "API",
};

type Props = { params: Promise<{ sessionId: string }> };

export default async function AdminTrackmanSessionPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id: sessionId },
    include: {
      user: { select: { id: true, name: true, hcp: true } },
      shots: {
        select: {
          club: true,
          carryDistance: true,
          totalDistance: true,
          ballSpeed: true,
          smashFactor: true,
        },
        take: 40,
        orderBy: { shotNumber: "asc" },
      },
    },
  });
  if (!sesjon) notFound();

  const dato = sesjon.recordedAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const miljo = sesjon.environment
    ? (ENV_LABEL[sesjon.environment] ?? sesjon.environment)
    : null;
  const kilde = SOURCE_LABEL[sesjon.source] ?? sesjon.source;

  // Snitt carry per kølle (kun der data finnes)
  const perKolle = new Map<string, { n: number; carrySum: number }>();
  for (const s of sesjon.shots) {
    if (!s.club || s.carryDistance == null) continue;
    const cur = perKolle.get(s.club) ?? { n: 0, carrySum: 0 };
    cur.n += 1;
    cur.carrySum += s.carryDistance;
    perKolle.set(s.club, cur);
  }
  const kolleRader = Array.from(perKolle.entries())
    .map(([club, v]) => ({
      club,
      snitt: Math.round(v.carrySum / v.n),
      n: v.n,
    }))
    .sort((a, b) => b.snitt - a.snitt);

  const spillerHref = `/admin/spillere/${sesjon.user.id}`;
  const portalDetalj = `/portal/mal/trackman/${sesjon.id}`;

  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/trackman">TrackMan</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Caps>TrackMan · økt · AgencyOS</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="økt.">{sesjon.user.name}</Tittel>
            </div>
            <p
              style={{
                marginTop: 6,
                fontFamily: T.ui,
                fontSize: 13,
                color: T.mut,
              }}
            >
              {dato}
              {miljo ? ` · ${miljo}` : ""}
              {` · ${kilde}`}
            </p>
          </div>
          <StatusPill tone={sesjon.shotCount > 0 ? "lime" : "warn"}>
            {sesjon.shotCount === 0
              ? "Ingen slag lagret"
              : `${sesjon.shotCount} slag`}
          </StatusPill>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Slag" value={String(sesjon.shotCount)} tint />
          <KpiFlis
            label="HCP"
            value={
              sesjon.user.hcp != null
                ? sesjon.user.hcp.toFixed(1).replace(".", ",")
                : "—"
            }
          />
          <KpiFlis label="Køller med data" value={String(kolleRader.length)} />
          <KpiFlis label="Rader lagret" value={String(sesjon.shots.length)} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={spillerHref} style={{ textDecoration: "none" }}>
            <CTAPill icon="user">Åpne spiller</CTAPill>
          </Link>
          <Link href={portalDetalj} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="activity">
              Full detalj (plot)
            </CTAPill>
          </Link>
        </div>

        <Kort eyebrow="Snitt carry per kølle (når lagret)">
          {kolleRader.length === 0 ? (
            <TomTilstand
              icon="activity"
              title="Ingen kølle-tall i denne økta"
              sub="Import kan ha bare session-aggregat uten slag-rader. Be spilleren eksportere full CSV, eller åpne full detalj."
            />
          ) : (
            kolleRader.map((r, i) => (
              <Rad
                key={r.club}
                title={r.club}
                sub={`${r.n} slag`}
                meta={
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: T.fg,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.snitt} m
                  </span>
                }
                last={i === kolleRader.length - 1}
              />
            ))
          )}
        </Kort>
      </div>
    </V2Shell>
  );
}
