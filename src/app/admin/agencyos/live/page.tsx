/**
 * AgencyOS · Live (v2) — «Mission Control». V2-port av
 * src/app/admin/(legacy)/agencyos/live/page.tsx + mission-control.tsx.
 * Fortsatt et visuelt skall med statisk seed-data (src/lib/agencyos/live-data.ts) —
 * live-integrasjoner kobles senere. Auth arves fra AgencyOS (ADMIN/COACH).
 *
 * Server component (klientlogikken bor i AgencyLiveV2).
 */

import { TilbakeLenke, Kort, StatusPill, Icon, T } from "@/components/v2";
import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AgencyLiveV2 } from "@/components/admin/v2/AgencyLiveV2";

export const metadata: Metadata = { title: "Mission Control · AgencyOS (v2)" };

export default async function V2LivePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coachFirstName = (user.name ?? "Coach").trim().split(/\s+/)[0];

  return (
    <V2Shell aktiv="live" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <Kort
        pad="14px 18px"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginBottom: 16,
          background: `color-mix(in srgb, ${T.warn} 12%, ${T.panel})`,
          border: `1px solid color-mix(in srgb, ${T.warn} 45%, ${T.border})`,
        }}
      >
        <Icon name="triangle-alert" size={22} style={{ color: T.warn, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <StatusPill tone="warn">Forhåndsvisning</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.4 }}>
            Dataene her er ikke live ennå. Kobles til sanntidsdata før full lansering.
          </span>
        </div>
      </Kort>
      <AgencyLiveV2 coachFirstName={coachFirstName} />
    </V2Shell>
  );
}
