/**
 * AgencyOS · Caddie · Samtale (v2) — direkte chat med Anders' personlige
 * AI-assistent. V2-port av src/app/admin/(legacy)/agencyos/caddie/page.tsx.
 * Samme auth (ADMIN-only, «bare deg») og samme samtale-henting
 * (getOrCreateActiveConversation) — kun rekomponert med v2-biblioteket.
 *
 * Server component.
 */

import { TilbakeLenke, Kort, StatusPill, Icon, T } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOrCreateActiveConversation } from "@/lib/caddie/conversation";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CaddieSubNavV2 } from "@/components/admin/v2/caddie/caddie-subnav-v2";
import { CaddieChatV2 } from "@/components/admin/v2/caddie/caddie-chat-v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · AgencyOS (v2)" };

export default async function V2CaddieSamtalePage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const { seed } = await searchParams;
  const conversation = await getOrCreateActiveConversation(user.id);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
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
      <CaddieSubNavV2 />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <CaddieChatV2 conversationId={conversation.id} initialSeed={seed} />
      </div>
    </V2Shell>
  );
}
