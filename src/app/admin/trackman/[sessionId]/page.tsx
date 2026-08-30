/**
 * AgencyOS TrackMan — én økt (coach). Train-lock-port (T9, 27.08.2026).
 *
 * Fasit: `TM-10 Tom og agency-preview.dc.html` (a/b/c — «tom hullkart»,
 * enkeltspiller-økt med spredningskart). Gjenbruker `TrackManSessionDetail`
 * (allerede TL-portet for PlayerHQ, TM-11) 1:1 — samme komponent, samme
 * dispersion-matte (`computeTrackManDispersionMap`), kun auth+chrome er
 * Agency-spesifikt (coach ser en ANNEN spillers økt, ikke sin egen).
 *
 * Avvik fra fasiten (docs/natt/T9-DONE.md): viser dominerende kølle for
 * denne økta (samme regel som portal-siden), ikke et multi-kølle-sammendrag
 * — TM-10s dispersion-hero er per kølle, ikke på tvers.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";
import { TrackManSessionDetail } from "@/components/trackman/TrackManSessionDetail";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "csv",
  api: "api",
};

type Props = { params: Promise<{ sessionId: string }> };

export default async function AdminTrackmanSessionPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, name: true, hcp: true } } },
  });
  if (!sesjon) notFound();

  const shots = await prisma.trackManShot.findMany({
    where: { sessionId: sesjon.id },
    orderBy: { shotNumber: "asc" },
    select: { id: true, shotNumber: true, club: true, side: true, carryDistance: true, totalDistance: true, smashFactor: true, launchAngle: true },
  });

  const perKolle = new Map<string, typeof shots>();
  for (const s of shots) {
    if (s.side == null || s.carryDistance == null) continue;
    perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
  }
  let valgtKolle = shots[0]?.club ?? "—";
  let flest = -1;
  for (const [kolle, liste] of perKolle) {
    if (liste.length > flest) {
      flest = liste.length;
      valgtKolle = kolle;
    }
  }
  const kolleShots = shots.filter((s) => s.club === valgtKolle);

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const kilde = SOURCE_LABEL[sesjon.source] ?? sesjon.source;
  const spillerHref = `/admin/spillere/${sesjon.user.id}`;
  const portalDetalj = `/portal/analysere/trackman/${sesjon.id}`;

  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <Link
        href="/admin/trackman"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.mute,
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        <Icon name="arrow-left" size={15} />
        TrackMan
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", maxWidth: 720, margin: "0 auto 4px" }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
          {sesjon.user.name}
          {sesjon.user.hcp != null ? ` · HCP ${sesjon.user.hcp.toFixed(1).replace(".", ",")}` : ""}
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href={spillerHref} style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, textDecoration: "none" }}>
            Åpne spiller →
          </Link>
          <Link href={portalDetalj} style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, textDecoration: "none" }}>
            Full detalj (plot) →
          </Link>
        </div>
      </div>

      {kolleShots.length === 0 ? (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <Icon name="crosshair" size={22} style={{ color: TL.mute }} />
          <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 14, color: TL.text }}>
            Ingen slag med side og carry i denne økta.
          </p>
          <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
            Kartet er aldri blankt av seg selv — importer en økt med begge feltene, så tegnes spredningen her.
          </p>
        </div>
      ) : (
        <TrackManSessionDetail
          club={valgtKolle}
          dateText={datoTekst}
          sourceLabel={kilde}
          result={computeTrackManDispersionMap(kolleShots)}
          allShotsHref="#alle-slag"
        />
      )}
    </V2Shell>
  );
}
