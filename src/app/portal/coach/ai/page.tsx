import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AiChat } from "./chat";
import { ChatToolbar } from "./chat-toolbar";
import type { ChatMelding } from "@/lib/anthropic";

export default async function AiCoachPage({
  searchParams,
}: {
  searchParams: Promise<{ ny?: string }>;
}) {
  const sp = await searchParams;
  const startNy = sp?.ny === "1";
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "PARENT"],
  });

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[720px] space-y-6 px-6 py-8">
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · AI-coach
          </span>
          <h1 className="font-display text-3xl font-semibold italic leading-tight -tracking-[0.01em]">
            Krever <em className="italic font-medium text-primary">Pro</em>
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-coach er en del av Pro-abonnementet.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Link
            href="/portal/meg/abonnement"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  // Finn aktiv eller siste AI-sesjon, eller la chat opprette ny
  const sisteSesjon = startNy
    ? null
    : await prisma.coachingSession.findFirst({
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

  // TODO: hent reell kontekst-info (antall dager, økter, runder) når data finnes
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
    <div className="grid min-h-[calc(100vh-64px)] grid-rows-[auto_1fr] bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-8 py-3.5">
        <div className="flex items-center gap-3.5">
          <div className="relative grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-bold text-[14px]">{initialer}</span>
            <span className="absolute -right-1 -bottom-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-card bg-accent text-accent-foreground">
              <Sparkles size={10} strokeWidth={1.5} fill="currentColor" />
            </span>
          </div>
          <div>
            <div className="text-[16px] font-semibold leading-none">
              AI om{" "}
              <em className="font-display font-semibold italic text-primary">
                {fornavn}
              </em>
            </div>
            <div className="mt-1 font-mono text-[12px] tabular-nums text-muted-foreground">
              {/* TODO: erstatt med ekte kontekst-stats */}
              Personlig kontekst basert på profil og siste aktivitet
            </div>
          </div>
        </div>
        <ChatToolbar messages={initialMessages} />
      </header>

      <AiChat
        sessionId={sisteSesjon?.id ?? null}
        initialMessages={initialMessages}
        userInitials={initialer}
      />
    </div>
  );
}
