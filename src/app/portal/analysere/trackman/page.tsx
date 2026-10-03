/**
 * PlayerHQ · TrackMan-økter (/portal/analysere/trackman) — Precision Athletics PH-17
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-17.jsx). Tilgang som før (TALENT).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentPh17Okter, type Ph17Okt } from "@/lib/trackman/ph17-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Okter } from "@/components/portal/precision/PH17TrackMan";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · PlayerHQ" };

export default async function TrackManListePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  let okter: Ph17Okt[] = [];
  let feil = false;
  const [res, uleste] = await Promise.all([
    hentPh17Okter(user.id).catch(() => null),
    getUnreadNotifications(user.id, 1).then((d) => d?.count ?? 0).catch(() => 0),
  ]);
  if (res) okter = res; else feil = true;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH17Ramme aktiv="okter" tilstand={feil ? "feil" : "data"}>
        <PH17Okter okter={okter} />
      </PH17Ramme>
    </PlayerHQSkall>
  );
}
