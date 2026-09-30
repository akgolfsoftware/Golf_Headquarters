/**
 * PlayerHQ · TrackMan-økt (/portal/analysere/trackman/[id]) — Precision Athletics PH-17
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-17.jsx). Samme skjerm som lista, med
 * økta valgt: tegningen har ikke egen detaljside.
 *
 * Tilgang som før: eier, eller ADMIN/COACH. Feature-flagget TRACKMAN_DETAIL beholdes.
 * Tidligere detaljvisning (Funn, bøtter, slag-ark, «mot forrige») står igjen under PH-17-visningen
 * til Anders har avgjort om den skal ut («ingenting fjernes», beslutninger.md).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { hentPh17Okter, type Ph17Okt } from "@/lib/trackman/ph17-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Okter } from "@/components/portal/precision/PH17TrackMan";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";
import { TrackManSessionDetail } from "@/components/trackman/TrackManSessionDetail";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan-økt · PlayerHQ" };

export default async function TrackManOktDetalj({ params }: { params: Promise<{ id: string }> }) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();

  // /portal/analysere/* står på talent-allowlisten; kreverTilgang må matche (portal-tilgang-kontrakt.test.ts).
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({ where: { id }, select: { userId: true, recordedAt: true, source: true } });
  if (!sesjon) notFound();
  if (sesjon.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  let okter: Ph17Okt[] = [];
  let feil = false;
  const [res, uleste] = await Promise.all([
    hentPh17Okter(sesjon.userId, id).catch(() => null),
    getUnreadNotifications(user.id, 1).then((d) => d?.count ?? 0).catch(() => 0),
  ]);
  if (res) okter = res; else feil = true;

  const detalj = await hentDetalj(id, sesjon).catch(() => null);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH17Ramme aktiv="okter" tilstand={feil ? "feil" : "data"} importerFor={sesjon.userId !== user.id ? sesjon.userId : undefined}>
        <PH17Okter okter={okter} valgtId={id} importerFor={sesjon.userId !== user.id ? sesjon.userId : undefined} />
        {detalj}
      </PH17Ramme>
    </PlayerHQSkall>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "TrackMan · CSV",
  "html-import": "TrackMan · HTML",
  api: "TrackMan API",
};

/** Funn, bøtter, slag-ark og «mot forrige» — uendret fra forrige versjon av siden. */
async function hentDetalj(id: string, sesjon: { userId: string; recordedAt: Date; source: string }) {
  const shots = await prisma.trackManShot.findMany({
    where: { sessionId: id },
    orderBy: { shotNumber: "asc" },
    select: { id: true, shotNumber: true, club: true, side: true, carryDistance: true, totalDistance: true, smashFactor: true, launchAngle: true, faceToPath: true },
  });
  // Kølla med flest gyldige slag: ett siktemål, én ellipse, aldri alle køller blandet.
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
  if (kolleShots.length === 0) return null;
  const result = computeTrackManDispersionMap(kolleShots);

  const forrigeOkt = await prisma.trackManShot.findFirst({
    where: { club: valgtKolle, session: { userId: sesjon.userId, recordedAt: { lt: sesjon.recordedAt } } },
    orderBy: { session: { recordedAt: "desc" } },
    select: { sessionId: true },
  });
  let forrigeDeltaTekst: string | null = null;
  if (forrigeOkt) {
    const forrigeShots = await prisma.trackManShot.findMany({
      where: { sessionId: forrigeOkt.sessionId, club: valgtKolle },
      select: { carryDistance: true },
    });
    const forrigeCarries = forrigeShots.map((s) => s.carryDistance).filter((v): v is number => v != null).sort((a, b) => a - b);
    if (forrigeCarries.length > 0 && result.medianCarry != null) {
      const mid = Math.floor(forrigeCarries.length / 2);
      const forrigeMedian = forrigeCarries.length % 2 === 0 ? (forrigeCarries[mid - 1] + forrigeCarries[mid]) / 2 : forrigeCarries[mid];
      const delta = result.medianCarry - forrigeMedian;
      forrigeDeltaTekst =
        Math.abs(delta) < 0.5
          ? "+0 m · som sist"
          : `${delta > 0 ? "+" : ""}${Math.round(delta)} m · ${delta > 0 ? "lenger enn sist" : "kortere enn sist"}`;
    }
  }
  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

  return (
    <TrackManSessionDetail
      club={valgtKolle}
      dateText={datoTekst}
      sourceLabel={SOURCE_LABEL[sesjon.source] ?? sesjon.source}
      result={result}
      allShotsHref="#alle-slag"
      forrigeDeltaTekst={forrigeDeltaTekst}
    />
  );
}
