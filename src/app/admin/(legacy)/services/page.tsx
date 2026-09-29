/**
 * AgencyOS — Tjenester (/admin/services) i Precision Athletics (29.09.2026).
 *
 * Samme datakilde som før (alle ServiceType-rader, også skjulte) og samme
 * handlinger: createService og updateService fra ./actions. «Slett» går
 * gjennom fjernTjeneste, som deaktiverer en tjeneste som har bookinger i
 * stedet for å slette den. Redigering skjer i et ark (AG-06 «Tjenester og pris»).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { TjenestePanel } from "@/components/admin/precision/AG06Booking";
import { hentAG06Tjenester } from "@/app/admin/bookinger/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tjenester · AgencyOS" };

export default async function ServicesPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const tjenester = await hentAG06Tjenester();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side>
        <SideHode
          kicker="Booking · tjenester og pris"
          title="Tjenester"
          sub="Pris og varighet her er det spillerne ser når de booker. Nye priser gjelder nye bookinger."
          actions={<KnappLenke href="/admin/bookinger" variant="ghost">Til bookinger</KnappLenke>}
        />
        <TjenestePanel tjenester={tjenester} />
      </Side>
    </AgencyOSSkall>
  );
}
