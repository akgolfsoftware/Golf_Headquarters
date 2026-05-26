/**
 * ParticipantsList — viser deltakerne av en delt TrainingSessionV2.
 *
 * Server-komponent. Henter selv ikke data — tar ferdig listede deltakere
 * som props. Skal kunne brukes både fra session-detalj og workbench.
 *
 * Statuser:
 *  - INVITED: invitasjon sendt, ikke svart
 *  - ACCEPTED / ATTENDED: bekreftet med
 *  - MAYBE: tentativ
 *  - DECLINED / NO_SHOW: takket nei / dukket ikke opp
 */

import { Check, Clock, HelpCircle, X } from "lucide-react";
import type { ParticipationStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

export type ParticipantItem = {
  participantId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  status: ParticipationStatus;
};

export type ParticipantsListProps = {
  participants: ParticipantItem[];
  emptyLabel?: string;
  className?: string;
};

const STATUS_LABEL: Record<ParticipationStatus, string> = {
  INVITED: "Invitert",
  ACCEPTED: "Bekreftet",
  DECLINED: "Avslo",
  MAYBE: "Kanskje",
  ATTENDED: "Deltok",
  NO_SHOW: "Uteble",
};

const STATUS_PILL: Record<ParticipationStatus, string> = {
  INVITED: "bg-secondary text-muted-foreground border-border",
  ACCEPTED: "bg-primary/10 text-primary border-primary/20",
  DECLINED: "bg-destructive/10 text-destructive border-destructive/20",
  MAYBE: "bg-accent/20 text-accent-foreground border-accent/40",
  ATTENDED: "bg-primary/10 text-primary border-primary/20",
  NO_SHOW: "bg-muted text-muted-foreground border-border",
};

function StatusIcon({ status }: { status: ParticipationStatus }) {
  switch (status) {
    case "ACCEPTED":
    case "ATTENDED":
      return <Check size={11} strokeWidth={2.5} aria-hidden />;
    case "DECLINED":
    case "NO_SHOW":
      return <X size={11} strokeWidth={2.5} aria-hidden />;
    case "MAYBE":
      return <HelpCircle size={11} strokeWidth={2} aria-hidden />;
    case "INVITED":
    default:
      return <Clock size={11} strokeWidth={2} aria-hidden />;
  }
}

export function ParticipantsList({
  participants,
  emptyLabel = "Ingen deltakere ennå.",
  className,
}: ParticipantsListProps) {
  if (participants.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border bg-card/40 px-6 py-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {participants.map((p) => (
        <li
          key={p.participantId}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: avatarBg(p.user.name) }}
            aria-hidden
          >
            {initialsFromName(p.user.name)}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {p.user.name}
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]",
              STATUS_PILL[p.status],
            )}
          >
            <StatusIcon status={p.status} />
            {STATUS_LABEL[p.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
