/**
 * v2-forhåndsvisning — PlayerHQ AI-coach (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), CoachAIV2 rendrer chat-flaten.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/coach/ai/page.tsx): Pro-gating, siste AI-sesjon, ?ny=1 for ny.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachAIV2, type CoachAIData } from "@/components/portal/v2/CoachAIV2";
import type { ChatMelding } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export default async function V2CoachAiPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ ny?: string }>;
}) {
  const sp = await searchParams;
  const startNy = sp?.ny === "1";
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });

  const sisteSesjon = startNy
    ? null
    : await prisma.coachingSession.findFirst({
        where: { userId: user.id, kind: "AI" },
        orderBy: { updatedAt: "desc" },
      });

  const initialMessages: ChatMelding[] =
    sisteSesjon && Array.isArray(sisteSesjon.messages)
      ? (sisteSesjon.messages as unknown[]).filter(
          (m): m is ChatMelding =>
            typeof m === "object" &&
            m !== null &&
            "role" in m &&
            "content" in m &&
            ((m as { role: string }).role === "user" ||
              (m as { role: string }).role === "assistant"),
        )
      : [];

  const initialer = user.name
    ? user.name.split(" ").map((d) => d[0]).slice(0, 2).join("").toUpperCase()
    : "DU";
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  const data: CoachAIData = {
    tier: user.tier,
    fornavn,
    initialer,
    sessionId: sisteSesjon?.id ?? null,
    initialMessages,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <CoachAIV2 data={data} />
    </V2Shell>
  );
}
