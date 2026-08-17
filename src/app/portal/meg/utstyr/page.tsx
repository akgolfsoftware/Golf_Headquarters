/**
 * PlayerHQ · Meg · Utstyr og bag (W3 — ny rute).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-utstyr.html (§9 tabell + trapp).
 *
 * Konsolidering (manifest-w3-komplett.md): utstyr/bag/lengder → én flate;
 * lengdetrappa er en MODUL i flaten, ikke en egen rute. Den gamle
 * /portal/meg/utstyrsbag står urørt som registrerings-/redigeringsflate —
 * redirect-konsolidering er en egen beslutning.
 *
 * Leser kun: EquipmentBag + målte carry-snitt fra TrackMan (hentGapping).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUtstyrFlate } from "@/lib/portal/utstyr-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegUtstyrV2 } from "@/components/portal/v2/MegUtstyrV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utstyr · PlayerHQ" };

export default async function UtstyrPage() {
  // kreverTilgang: "INGEN" som nabosiden /portal/meg/utstyrsbag — hele
  // /portal/meg står på talent-allowlisten (konto- og betalingsveien MÅ være
  // nåbar). Manglet her i T2-sweepen; siden arvet FULL-defaulten.
  const user = await requirePortalUser({
    kreverTilgang: "INGEN",
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentUtstyrFlate(user.id);

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegUtstyrV2 data={data} />
    </V2Shell>
  );
}
