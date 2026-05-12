import { PageHeader } from "@/components/shared/page-header";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AiChat } from "./chat";
import type { ChatMelding } from "@/lib/anthropic";

export default async function AiCoachPage() {
  const user = await requirePortalUser();
  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · AI-coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="AI-coach er en del av Pro-abonnementet."
        />
      </div>
    );
  }

  // Finn aktiv eller siste AI-sesjon, eller la chat opprette ny
  const sisteSesjon = await prisma.coachingSession.findFirst({
    where: { userId: user.id, kind: "AI" },
    orderBy: { updatedAt: "desc" },
  });

  const initialMessages: ChatMelding[] = sisteSesjon
    ? Array.isArray(sisteSesjon.messages)
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
      : []
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · AI-coach"
        titleLead="Spør om"
        titleItalic="hva som helst"
        sub="Personlig analyse basert på din profil, plan og siste runder. AI-coachen kjenner deg."
      />
      <AiChat
        sessionId={sisteSesjon?.id ?? null}
        initialMessages={initialMessages}
      />
    </div>
  );
}
