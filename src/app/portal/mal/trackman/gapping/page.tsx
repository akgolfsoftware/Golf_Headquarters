/**
 * PlayerHQ · Gapping (/portal/mal/trackman/gapping) — Precision Athletics PH-17, fane Gapping
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-17.jsx). Data og regler som før (hentGapping).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentGapping, type GappingData } from "@/lib/portal/gapping-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Gapping } from "@/components/portal/precision/PH17TrackMan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gapping · PlayerHQ" };

export default async function GappingPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");

  const [data, uleste] = await Promise.all([
    hentGapping(user.id).catch((): GappingData | null => null),
    getUnreadNotifications(user.id, 1).then((d) => d?.count ?? 0).catch(() => 0),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH17Ramme aktiv="gap" tilstand={data ? "data" : "feil"}>
        {data && <PH17Gapping data={data} />}
      </PH17Ramme>
    </PlayerHQSkall>
  );
}
