/**
 * PlayerHQ · TrackMan-økt (/portal/analysere/trackman/[id]) — Precision Athletics PH-17
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-17.jsx). Samme skjerm som lista, med
 * økta valgt: tegningen har ikke egen detaljside.
 *
 * Tilgang som før: eier, eller ADMIN/COACH. Feature-flagget TRACKMAN_DETAIL beholdes.
 * Tidligere detaljvisning (Funn, bøtter, slag-ark, «mot forrige») er ikke i tegningen;
 * komponentene ligger urørt i src/components/trackman/.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { hentPh17Okter, type Ph17Okt } from "@/lib/trackman/ph17-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Okter } from "@/components/portal/precision/PH17TrackMan";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan-økt · PlayerHQ" };

export default async function TrackManOktDetalj({ params }: { params: Promise<{ id: string }> }) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();

  // /portal/analysere/* står på talent-allowlisten; kreverTilgang må matche (portal-tilgang-kontrakt.test.ts).
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({ where: { id }, select: { userId: true } });
  if (!sesjon) notFound();
  if (sesjon.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  let okter: Ph17Okt[] = [];
  let feil = false;
  const [res, uleste] = await Promise.all([
    hentPh17Okter(sesjon.userId, id).catch(() => null),
    getUnreadNotifications(user.id, 1).then((d) => d?.count ?? 0).catch(() => 0),
  ]);
  if (res) okter = res; else feil = true;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH17Ramme aktiv="okter" tilstand={feil ? "feil" : "data"} importerFor={sesjon.userId !== user.id ? sesjon.userId : undefined}>
        <PH17Okter okter={okter} valgtId={id} />
      </PH17Ramme>
    </PlayerHQSkall>
  );
}
