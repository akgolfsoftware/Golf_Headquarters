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
 *
 * Avvik:
 *   - Viser dominerende kølle for økta, ikke multi-kølle-sammendrag (T9-DONE.md).
 *   - Tilgang: økten åpnes bare for coach med tilgang til spilleren (05.10.2026).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { harCoachLesetilgangTilSpiller } from "@/lib/auth/coached";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";
import "@/styles/agencyos-ny-mer.css";
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
  // Coach-scope: en assistant coach kan ikke åpne en annen coachs spillers økt via id.
  if (!sesjon || !(await harCoachLesetilgangTilSpiller(user, sesjon.userId))) notFound();

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
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp
          tilbake={{ href: "/admin/trackman", tekst: "TrackMan og video" }}
          dato={`TrackMan · ${datoTekst} · ${kilde}`}
          tittel={sesjon.user.name ?? "Spiller"}
          ingress={sesjon.user.hcp != null ? `HCP ${sesjon.user.hcp.toFixed(1).replace(".", ",")} · ${valgtKolle}` : valgtKolle}
          handlinger={<>
            <KnappLenke href={spillerHref}>Åpne spiller</KnappLenke>
            <KnappLenke href={portalDetalj}>Full detalj (plot)</KnappLenke>
          </>}
        />

        {kolleShots.length === 0 ? (
          <Tom tittel="Ingen slag med side og carry i denne økta" tekst="Kartet er aldri blankt av seg selv. Importer en økt med begge feltene, så tegnes spredningen her." />
        ) : (
          <div className="agn-legacy">
            <TrackManSessionDetail
              club={valgtKolle}
              dateText={datoTekst}
              sourceLabel={kilde}
              result={computeTrackManDispersionMap(kolleShots)}
              allShotsHref="#alle-slag"
            />
          </div>
        )}
      </div>
    </AgencyOSSkall>
  );
}
