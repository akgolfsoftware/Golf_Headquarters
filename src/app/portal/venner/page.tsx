/**
 * /portal/venner — B-pakke i kode.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentVennerData } from "@/lib/venner/actions";
import { VennerClient } from "./VennerClient";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";

export const dynamic = "force-dynamic";

export default async function VennerPage() {
  const user = await requirePortalUser();
  const data = await hentVennerData();

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>PlayerHQ · Sosialt</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="venner">Dine</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45 }}>
            Legg til venner og se at de har trent — aldri plan, tall eller coach-notater.
          </p>
        </div>
        <Kort>
          <VennerClient initial={data} />
        </Kort>
      </div>
    </V2Shell>
  );
}
