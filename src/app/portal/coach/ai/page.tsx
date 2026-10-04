// PH22CoachKi — PH22CaddieChat — Precision Athletics. Data og handlinger er beholdt.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PH22CaddieChat } from "@/components/portal/precision/PH22CaddieChat";
import type { PH22CaddieMelding } from "@/lib/portal-caddie/ph22-caddie-data";
import type { ChatMelding } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export default async function CoachAiPage({
  searchParams,
}: {
  searchParams: Promise<{ ny?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const startNy = sp?.ny === "1";
  const stateOverride = sp?.state as "data" | "tom" | "laster" | "feil" | undefined;

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });

  const sisteSesjon = startNy
    ? null
    : await prisma.coachingSession.findFirst({
        where: { userId: user.id, kind: "AI" },
        orderBy: { updatedAt: "desc" },
      });

  const rawMessages: ChatMelding[] =
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

  const initialMessages: PH22CaddieMelding[] = rawMessages.map((m, idx) => ({
    id: `m-${idx}`,
    role: m.role,
    content: m.content,
    timestamp: "12:00",
  }));

  const initialer = user.name
    ? user.name
        .split(" ")
        .map((d) => d[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DU";
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  return (
    <PlayerHQSkall innboksHref="/portal/coach" uleste={0}>
      <PH22CaddieChat
        tier={user.tier}
        fornavn={fornavn}
        initialer={initialer}
        sessionId={sisteSesjon?.id ?? null}
        initialMessages={initialMessages}
        userRole={user.role}
        stateOverride={stateOverride}
      />
    </PlayerHQSkall>
  );
}
