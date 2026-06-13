"use client";

import Link from "next/link";
import { Trophy, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NextTournament } from "@/app/portal/actions";

export type TournamentCountdownProps = {
  tournament: NextTournament | null;
  className?: string;
};

function formatDateRange(start: Date, end: Date | null): string {
  const s = start.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
  if (!end) return s;
  const e = end.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
  return `${s} – ${e}`;
}

export function TournamentCountdown({ tournament, className }: TournamentCountdownProps) {
  if (!tournament) {
    return (
      <div className={cn("rounded-2xl bg-foreground p-5 text-background shadow-md sm:p-6", className)}>
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-accent" strokeWidth={1.75} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
            Neste turnering
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-bold">Ingen turnering planlagt</h3>
        <p className="mt-1 text-sm text-background/70">Legg til din neste turnering i Workbench.</p>
        <Link
          href="/portal/tren/turneringer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.08em] text-accent-foreground transition hover:brightness-105 sm:w-auto"
        >
          Legg til turnering
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl bg-foreground p-5 text-background shadow-md sm:p-6", className)}>
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-accent" strokeWidth={1.75} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          Neste turnering
        </span>
      </div>

      <h3 className="mt-2 font-display text-2xl font-bold">{tournament.name}</h3>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-background/70">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} strokeWidth={1.75} />
          {formatDateRange(tournament.startDate, tournament.endDate)}
        </span>
        {tournament.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.75} />
            {tournament.location}
          </span>
        )}
      </div>

      <div className="my-5 border-y border-background/15 py-5">
        <span className="font-display text-6xl font-bold leading-[0.85] tabular-nums text-accent md:text-7xl">
          {tournament.daysLeft}
        </span>
        <span className="ml-2 font-mono text-xs uppercase tracking-[0.12em] text-background/60">
          dager igjen
        </span>
      </div>

      <Link
        href={tournament.href}
        className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.08em] text-accent-foreground transition hover:brightness-105 sm:w-auto"
      >
        Se turnering
      </Link>
    </div>
  );
}
