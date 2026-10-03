/**
 * PlayerHQ · Caddie-chat (/portal/coach/ai) — Precision Athletics PH-22
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-22.jsx).
 * Innlogging, Pro-sperre, siste AI-sesjon og ?ny=1 som før; visningen er PH22Caddie.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH22Caddie } from "@/components/portal/precision/PH22Caddie";
import type { ChatMelding } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · PlayerHQ" };

export default async function CoachAiPage({
  searchParams,
}: {
  searchParams: Promise<{ ny?: string }>;
}) {
  const sp = await searchParams;
  const startNy = sp?.ny === "1";
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });

  const [sisteSesjon, dash] = await Promise.all([
    startNy
      ? Promise.resolve(null)
      : prisma.coachingSession.findFirst({
          where: { userId: user.id, kind: "AI" },
          orderBy: { updatedAt: "desc" },
        }),
    getUnreadNotifications(user.id, 1).catch(() => null),
  ]);

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

  return (
    <PlayerHQSkall innboksHref="/portal/coach/melding" uleste={dash?.count ?? 0}>
      <PH22Caddie
        erGratis={user.tier === "GRATIS"}
        sessionId={sisteSesjon?.id ?? null}
        initialMessages={initialMessages}
        skrivTilHref="/portal/coach/melding"
      />
    </PlayerHQSkall>
  );
}
