/**
 * AgencyOS Agenter — v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/agenter (flermodell-chat, merget inn fra
 * kommandosenteret) — samme AgentChat-backend (/api/kommando/chat), ny v2-UI
 * bygget fra samtale-familien (src/components/v2/samtale.tsx).
 *
 * Auth hevet til requirePortalUser (ADMIN/COACH), samme gap som
 * /admin/agent-team og /admin/agents sin v2-porting: den gamle skjermen var
 * ADMIN-only via canAccessMissionControl.
 *
 * Server component — samtale-id genereres på serveren per besøk.
 */

import { randomUUID } from "node:crypto";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminAgenterChatV2 } from "@/components/admin/v2/AdminAgenterChatV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenter · AgencyOS" };

export default async function AdminAgenterPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const conversationId = randomUUID();

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agent-team">Agent-team</TilbakeLenke>
      <AdminAgenterChatV2 conversationId={conversationId} />
    </V2Shell>
  );
}
