/**
 * AgencyOS · Caddie (/admin/agencyos/caddie) — Fase 1: direkte chat.
 *
 * Anders' personlige AI-assistent. Rendrer <CaddieChat> koblet til chat-ruten
 * (Claude Sonnet 4.6 via Gateway, les/skriv-verktøy + godkjenning). Samtalen
 * hentes/opprettes via getOrCreateActiveConversation så historikk overlever.
 *
 * ADMIN-only (Anders' beslutning «bare deg»). Co-agent-dashbordet (utkast/fleet/
 * audit) kobles på i Fase 2 — komponenten caddie.tsx beholdes til da.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CaddieChat } from "@/components/admin/caddie/caddie-chat";
import { getOrCreateActiveConversation } from "@/lib/caddie/conversation";

export const dynamic = "force-dynamic";

export default async function CaddieTabPage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const { seed } = await searchParams;
  const conversation = await getOrCreateActiveConversation(user.id);

  return <CaddieChat conversationId={conversation.id} initialSeed={seed} />;
}
