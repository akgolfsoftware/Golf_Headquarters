import Link from "next/link";
import { Inbox } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SplitInboxShell } from "@/components/admin/split-inbox-shell";
import { MessagesInbox } from "./_components/messages-inbox";
import { Conversation } from "./_components/conversation";
import { ContextPanel } from "./_components/context-panel";

type ChatMelding = { role?: string; content?: string; ts?: string };

type Search = { thread?: string; filter?: string };

function initialer(navn: string): string {
  return navn
    .split(/\s+/)
    .map((d) => d[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminMessages({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const aktivtFilter = (params.filter ?? "alle") as "alle" | "ulest" | "merkede";

  const alleTråder = await prisma.coachingSession.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          tier: true,
          createdAt: true,
        },
      },
      coach: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Vi viser kun DIRECT-tråder i innboksen — AI-samtaler vises på elev-siden.
  const tråder = alleTråder.filter((t) => t.kind === "DIRECT");

  const beriket = tråder.map((t) => {
    const meldinger = Array.isArray(t.messages)
      ? (t.messages as ChatMelding[])
      : [];
    const siste = meldinger[meldinger.length - 1];
    const sistFraSpiller = siste?.role === "user";
    return {
      id: t.id,
      userId: t.user.id,
      userName: t.user.name,
      userInitials: initialer(t.user.name),
      userTier: t.user.tier as string,
      preview: siste?.content ?? "Ingen meldinger ennå",
      sisteRolle: siste?.role ?? null,
      tidspunkt: t.updatedAt,
      meldingerAntall: meldinger.length,
      ulest: sistFraSpiller, // forenklet: ulest hvis siste melding ikke er fra coach
      fromMe: siste?.role === "coach",
    };
  });

  const antallUlest = beriket.filter((t) => t.ulest).length;
  const antallTotal = beriket.length;

  // Filtrer etter aktivt filter
  const filtrerte =
    aktivtFilter === "ulest"
      ? beriket.filter((t) => t.ulest)
      : beriket;

  // Finn aktiv tråd — fra query-param eller første i listen
  const aktivId = params.thread ?? filtrerte[0]?.id ?? null;
  const aktivTråd = aktivId
    ? alleTråder.find((t) => t.id === aktivId)
    : null;

  const aktivMeldinger: ChatMelding[] = aktivTråd
    ? Array.isArray(aktivTråd.messages)
      ? (aktivTråd.messages as ChatMelding[])
      : []
    : [];

  // Context-data for høyrepanel
  const aktivSpiller = aktivTråd?.user ?? null;
  const aktivSpillerHcp = aktivSpiller
    ? await prisma.user.findUnique({
        where: { id: aktivSpiller.id },
        select: { hcp: true, homeClub: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Meldinger"
        titleLead="Min"
        titleItalic="innboks"
        sub={
          antallTotal > 0
            ? `${antallTotal} ${antallTotal === 1 ? "samtale" : "samtaler"}${antallUlest > 0 ? ` · ${antallUlest} ${antallUlest === 1 ? "ulest" : "uleste"}` : ""}`
            : "Ingen samtaler ennå"
        }
      />

      {antallTotal === 0 ? (
        <EmptyState
          icon={Inbox}
          titleItalic="Tomt"
          titleTrail="i innboksen"
          sub="Når spillere eller foreldre sender meldinger, dukker de opp her. Du kan også starte en tråd fra en elev-profil."
          cta={
            <Link
              href="/admin/spillere"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Til spillerlisten
            </Link>
          }
        />
      ) : (
        <SplitInboxShell
          activeKey={aktivTråd && aktivSpiller ? aktivTråd.id : null}
          backHref="/admin/messages"
          left={
            <MessagesInbox
              tråder={filtrerte}
              aktivId={aktivId}
              aktivtFilter={aktivtFilter}
              antallAlle={beriket.length}
              antallUlest={antallUlest}
            />
          }
          center={
            aktivTråd && aktivSpiller ? (
              <Conversation
                threadId={aktivTråd.id}
                spillerNavn={aktivSpiller.name}
                spillerInitialer={initialer(aktivSpiller.name)}
                spillerId={aktivSpiller.id}
                spillerTier={aktivSpiller.tier as string}
                meldinger={aktivMeldinger}
                meId={me.id}
                meName={me.name}
                meInitialer={initialer(me.name)}
              />
            ) : (
              <div className="flex items-center justify-center border-l border-border bg-background">
                <p className="text-sm text-muted-foreground">
                  Velg en samtale fra listen
                </p>
              </div>
            )
          }
          right={
            aktivTråd && aktivSpiller ? (
              <ContextPanel
                spiller={{
                  id: aktivSpiller.id,
                  navn: aktivSpiller.name,
                  initialer: initialer(aktivSpiller.name),
                  tier: aktivSpiller.tier as string,
                  hcp: aktivSpillerHcp?.hcp ?? null,
                  homeClub: aktivSpillerHcp?.homeClub ?? null,
                  medlemsSiden: aktivSpiller.createdAt,
                }}
                meldingerAntall={aktivMeldinger.length}
                sistOppdatert={aktivTråd.updatedAt}
              />
            ) : (
              <div className="border-l border-border bg-secondary/40" />
            )
          }
        />
      )}
    </div>
  );
}
