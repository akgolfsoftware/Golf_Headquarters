/**
 * AgencyOS TrackMan — én økt (coach). T9 Train-lock, 27.08.2026.
 *
 * Gjenbruker TM-11 (`TrackManSessionDetail`/`computeTrackManDispersionMap`)
 * 1:1 fra PlayerHQ (`src/app/portal/analysere/trackman/[id]/page.tsx`,
 * B7-leveransen) — samme hero-komponent, samme domeneregning, kun
 * AgencyOS-skall og coach-tilpasset topptekst (spillernavn, siden coachen
 * ser andres økter). Ingen ny visuell fasit for denne detaljvisningen i
 * T9-raden (kun AG-09/TM-06/TM-10 er navngitt) — TM-11-gjenbruk er
 * hub-mønsteret §5T godkjente for denne typen detaljside.
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

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "TrackMan · CSV",
  api: "TrackMan API",
};

type Props = { params: Promise<{ sessionId: string }> };

export default async function AdminTrackmanSessionPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!sesjon) notFound();

  const shots = await prisma.trackManShot.findMany({
    where: { sessionId: sesjon.id },
    orderBy: { shotNumber: "asc" },
    select: {
      id: true,
      shotNumber: true,
      club: true,
      side: true,
      carryDistance: true,
      totalDistance: true,
      smashFactor: true,
      launchAngle: true,
    },
  });

  // Kølla med flest gyldige slag — samme regel som PlayerHQ-siden.
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
  const result = computeTrackManDispersionMap(kolleShots);

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <Link
          href="/admin/trackman"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: TL.mute, textDecoration: "none" }}
        >
          <Icon name="arrow-left" size={15} />
          TrackMan
        </Link>
        <Link
          href={`/admin/spillere/${sesjon.user.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: TL.mute, textDecoration: "none" }}
        >
          {sesjon.user.name}
          <Icon name="chevron-right" size={14} />
        </Link>
      </div>

      {kolleShots.length === 0 ? (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: TL.elev,
            borderRadius: TL.radius.card,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <Icon name="crosshair" size={22} style={{ color: TL.mute }} />
          <p style={{ margin: "10px 0 0", fontSize: 14, color: TL.text }}>Ingen slag med side og carry i denne økta.</p>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: TL.mute }}>
            Importer en økt med begge feltene, så tegnes spredningen her.
          </p>
        </div>
      ) : (
        <TrackManSessionDetail
          club={valgtKolle}
          dateText={datoTekst}
          sourceLabel={SOURCE_LABEL[sesjon.source] ?? sesjon.source}
          result={result}
          allShotsHref="#alle-slag"
        />
      )}
    </V2Shell>
  );
}
