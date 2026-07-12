/**
 * AgencyOS Varsler — v2. Coach-varsler-senter: agent-forslag, signaler og
 * uleste meldinger samlet. loadVarsler() bevart 1:1. VarslerClientV2
 * (agent-actions/optimistisk fjerning) er ny v2-komponent.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadVarsler } from "@/lib/admin/load-varsler";
import { VarslerClientV2 } from "@/components/admin/v2/VarslerClientV2";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, StatusPill, Icon } from "@/components/v2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Varsler · AgencyOS",
};

export default async function VarslerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadVarsler(user.id);
  // Kanonisk kø-telling (koTelling) + coachens egne uleste meldinger — samme
  // handlings-tall som innboks-banneret og godkjenninger-hodet.
  const total = data.ko.planActions + data.counts.notifications;

  return (
    <V2Shell aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 16, background: T.lime }}>
            <Icon name="bell" size={22} style={{ color: T.onLime }} />
          </span>
          <div>
            <Caps>AgencyOS · Varsler</Caps>
            <div style={{ marginTop: 6 }}>
              <Tittel mobile>Varsler</Tittel>
            </div>
            <div style={{ marginTop: 6 }}>
              {total > 0 ? <StatusPill tone="warn">{total} ting krever oppmerksomhet</StatusPill> : <StatusPill tone="up">Alt er ajour</StatusPill>}
            </div>
          </div>
        </div>

        <VarslerClientV2 data={data} />
      </div>
    </V2Shell>
  );
}
