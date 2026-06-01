/**
 * AgencyOS — Innboks (/admin/innboks). Skjerm 6 i Runde 4.
 *
 * 3-kolonne kommunikasjons-cockpit:
 *   COL 1 — Trådliste (filter-pills Alle/Uleste/Spillere/Foresatte + trådrader
 *           med hastegrads-fargeprikk rød/gul/grønn)
 *   COL 2 — Samtale (meldingsbobler: innkommende forest-100, utgående lime) +
 *           composer (textarea + send → eksisterende sendMelding-action)
 *   COL 3 — Kontekst (spillerkort + neste time + 3 KPI + hurtig-aksjoner)
 *
 * Server component-skall. Filter-state og composer er isolert i client-
 * underkomponenter. Ingen hardkodet hex, ingen emoji (kun lucide-react).
 * 3-kolonne-grid via delt SplitInboxShell-primitive (samme som /admin/messages).
 */

import { SplitInboxShell } from "@/components/admin/split-inbox-shell";
import { InboxThreadList } from "./inbox-thread-list";
import { InboxConversation } from "./inbox-conversation";
import { InboxContext } from "./inbox-context";
import { InboxEmpty, InboxNoSelection } from "./inbox-empty";

export type ThreadDot = "red" | "yellow" | "green";

export type InboxThread = {
  id: string;
  playerId: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  preview: string;
  when: string;
  unread: boolean;
  dot: ThreadDot;
  hasGuardian: boolean;
};

export type InboxMessage = {
  id: string;
  direction: "in" | "out";
  author: string;
  text: string;
  time: string;
  /** Dato-skille over første melding på en ny dag. Tom = ikke vis skille. */
  dayLabel: string;
};

export type ContextKpi = {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
};

export type InboxContextData = {
  playerId: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  meta: string;
  nextSession: { when: string; title: string } | null;
  kpis: ContextKpi[];
};

export type InboxConversationData = {
  threadId: string;
  headerWhen: string;
  messages: InboxMessage[];
  context: InboxContextData;
};

export type InboxScreenProps = {
  coachName: string;
  coachInitials: string;
  threadCount: number;
  unreadCount: number;
  threads: InboxThread[];
  activeThreadId: string | null;
  conversation: InboxConversationData | null;
};

export function InboxScreen({
  threadCount,
  unreadCount,
  threads,
  activeThreadId,
  conversation,
}: InboxScreenProps) {
  // Tom innboks — ingen tråder i det hele tatt.
  if (threadCount === 0) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <Header unreadCount={0} />
        <InboxEmpty />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <Header unreadCount={unreadCount} />

      <SplitInboxShell
        activeKey={conversation ? conversation.threadId : null}
        backHref="/admin/innboks"
        left={
          <InboxThreadList
            threads={threads}
            activeThreadId={activeThreadId}
            unreadCount={unreadCount}
          />
        }
        center={
          conversation ? (
            <InboxConversation
              threadId={conversation.threadId}
              playerName={conversation.context.name}
              playerId={conversation.context.playerId}
              headerWhen={conversation.headerWhen}
              messages={conversation.messages}
            />
          ) : (
            <InboxNoSelection />
          )
        }
        right={
          conversation ? (
            <InboxContext data={conversation.context} />
          ) : (
            <div className="hidden border-l border-border bg-secondary/40 lg:block" />
          )
        }
      />
    </div>
  );
}

function Header({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        Innboks
      </h1>
      <div className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {unreadCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            {unreadCount} {unreadCount === 1 ? "ULEST" : "ULESTE"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            ALT BESVART
          </span>
        )}
      </div>
    </div>
  );
}
