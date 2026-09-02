/**
 * PlayerHQ · Meg · Utstyr og bag (W3 — ny rute).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-utstyr.html (§9 tabell + trapp).
 *
 * Konsolidering (manifest-w3-komplett.md): utstyr/bag/lengder → én flate;
 * lengdetrappa er en MODUL i flaten, ikke en egen rute.
 *
 * Redirect-konsolideringen (PORTPLAN §A1.9) er avgjort av Anders 02.09.2026:
 * `/portal/meg/utstyrsbag` er nå en redirect hit. Selve registrerings-/
 * redigeringsskjemaet (MegUtstyrsbagV2) er montert som egen seksjon under
 * lesevisningen (`somFane` skjuler dets eget «Utstyr»-hode, samme mønster
 * som STEG 15-konsolideringen) — ingen funksjonalitet er fjernet.
 *
 * Leser: EquipmentBag (rått, til redigeringsseksjonen) + målte carry-snitt
 * fra TrackMan (hentGapping, til lesevisningen).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUtstyrFlate } from "@/lib/portal/utstyr-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegUtstyrV2 } from "@/components/portal/v2/MegUtstyrV2";
import { MegUtstyrsbagV2 } from "@/components/portal/v2/MegUtstyrsbagV2";
import type { UtstyrsbagInput } from "@/app/portal/meg/utstyrsbag/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utstyr · PlayerHQ" };

export default async function UtstyrPage() {
  // kreverTilgang: "INGEN" — hele /portal/meg står på talent-allowlisten
  // (konto- og betalingsveien MÅ være nåbar). Manglet her i T2-sweepen;
  // siden arvet FULL-defaulten.
  const user = await requirePortalUser({
    kreverTilgang: "INGEN",
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  if (user.role === "PARENT") redirect("/forelder");

  const [data, bag] = await Promise.all([
    hentUtstyrFlate(user.id),
    prisma.equipmentBag.findUnique({ where: { userId: user.id } }),
  ]);

  const utstyr: UtstyrsbagInput = {
    driver: bag?.driver ?? undefined,
    fairwayWoods: bag?.fairwayWoods ?? undefined,
    hybrids: bag?.hybrids ?? undefined,
    irons: bag?.irons ?? undefined,
    wedges: bag?.wedges ?? undefined,
    putter: bag?.putter ?? undefined,
    ball: bag?.ball ?? undefined,
    bag: bag?.bag ?? undefined,
    notes: bag?.notes ?? undefined,
  };

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegUtstyrV2 data={data} />
      <div id="rediger-utstyr">
        <MegUtstyrsbagV2 data={{ utstyr }} somFane />
      </div>
    </V2Shell>
  );
}
