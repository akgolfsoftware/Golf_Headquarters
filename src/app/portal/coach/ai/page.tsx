import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AiChat } from "./chat";
import type { ChatMelding } from "@/lib/anthropic";

export default async function AiCoachPage() {
  const user = await requirePortalUser();
  if (user.tier === "GRATIS") {
    return (
      <p className="text-sm text-muted-foreground">
        AI-coach krever Pro-abonnement.
      </p>
    );
  }

  // Finn aktiv eller siste AI-sesjon, eller la chat opprette ny
  const sisteSesjon = await prisma.coachingSession.findFirst({
    where: { userId: user.id, kind: "AI" },
    orderBy: { updatedAt: "desc" },
  });

  const initialMessages: ChatMelding[] = sisteSesjon
    ? (Array.isArray(sisteSesjon.messages)
        ? (sisteSesjon.messages as unknown[])
            .filter(
              (m): m is ChatMelding =>
                typeof m === "object" &&
                m !== null &&
                "role" in m &&
                "content" in m &&
                ((m as { role: string }).role === "user" ||
                  (m as { role: string }).role === "assistant"),
            )
        : [])
    : [];

  return (
    <AiChat
      sessionId={sisteSesjon?.id ?? null}
      initialMessages={initialMessages}
    />
  );
}
