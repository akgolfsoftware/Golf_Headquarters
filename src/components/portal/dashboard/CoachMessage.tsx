"use client";

import Link from "next/link";
import { MessageSquare, User } from "lucide-react";
import { AthleticCard } from "@/components/athletic";
import type { CoachMessageItem } from "@/app/portal/actions";

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

type CoachMessageProps = {
  message: CoachMessageItem | null;
  className?: string;
};

export function CoachMessage({ message, className }: CoachMessageProps) {
  return (
    <AthleticCard
      label="Fra coach"
      action={
        <Link href="/portal/coach/melding" className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
          Meldinger →
        </Link>
      }
      className={className}
    >
      {message ? (
        <Link
          href={message.href}
          className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-display text-xs font-bold">{message.coachInitials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {message.coachName}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{formatDate(message.createdAt)}</span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{message.preview}</p>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted">
            <MessageSquare size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Ingen meldinger fra coach ennå.</p>
          <Link href="/portal/coach/melding/ny">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
              <User size={16} /> Send melding
            </span>
          </Link>
        </div>
      )}
    </AthleticCard>
  );
}
