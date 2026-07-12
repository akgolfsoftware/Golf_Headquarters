/**
 * AgencyOS · Caddie · Samtale (v2) — direkte chat med Anders' personlige
 * AI-assistent. V2-port av src/app/admin/(legacy)/agencyos/caddie/page.tsx.
 * Samme auth (ADMIN-only, «bare deg») og samme samtale-henting
 * (getOrCreateActiveConversation) — kun rekomponert med v2-biblioteket.
 *
 * Server component.
 */

import { TilbakeLenke } from "@/components/v2";
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
      <CaddieSubNavV2 />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <CaddieChatV2 conversationId={conversation.id} initialSeed={seed} />
      </div>
    </V2Shell>
  );
}
