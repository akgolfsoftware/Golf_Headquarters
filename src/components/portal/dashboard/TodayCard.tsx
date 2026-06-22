"use client";

import Link from "next/link";
import { Play, Clock, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AthleticCard } from "@/components/athletic";
import type { TodaySession } from "@/app/portal/actions";

const PYRAMIDE_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Golfslag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

const PYRAMIDE_PILL: Record<string, string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-warning/10 text-warning",
  SLAG: "bg-info/10 text-info",
  SPILL: "bg-accent/30 text-accent-foreground",
  TURN: "bg-destructive/10 text-destructive",
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}

export type TodayCardProps = {
  session: TodaySession | null;
  className?: string;
};

export function TodayCard({ session, className }: TodayCardProps) {
  if (!session) {
    return (
      <AthleticCard label="Dagens økt" className={cn("h-full", className)}>
        <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Calendar className="text-muted-foreground" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">Ingen økt planlagt i dag</p>
            <p className="text-sm text-muted-foreground">Legg til en økt i Workbench.</p>
          </div>
          <Link href="/portal/planlegge">
            <Button variant="secondary" size="sm">Planlegg økt</Button>
          </Link>
        </div>
      </AthleticCard>
    );
  }

  const isActive = session.status === "IN_PROGRESS";
  const isDone = session.status === "COMPLETED";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-md md:p-6",
        className,
      )}
    >
      <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent opacity-15 blur-xl" />

      <div className="relative z-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent/20 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            Dagens økt
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary-foreground/75">
            {STATUS_LABEL[session.status] ?? session.status}
          </span>
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]",
              PYRAMIDE_PILL[session.pyramidArea] ?? "bg-background/10 text-background",
            )}
          >
            {session.pyramidArea}
          </span>
        </div>

        <h2 className="font-display text-xl font-bold leading-tight md:text-2xl">{session.title}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs tabular-nums text-primary-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} strokeWidth={1.5} />
            {formatTime(session.startTime)} – {formatTime(session.endTime)} · {session.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target size={15} strokeWidth={1.5} />
            {PYRAMIDE_LABEL[session.pyramidArea] ?? session.pyramidArea}
          </span>
        </div>

        {session.drills.length > 0 && (
          <p className="mt-4 line-clamp-2 text-sm text-primary-foreground/85">
            {session.drills.map((d) => d.name).join(" · ")}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={session.href}>
            <Button variant="lime" size="md" className={cn("gap-2", isDone && "opacity-80")} disabled={isDone}>
              <Play size={16} fill="currentColor" />
              {isDone ? "Fullført" : isActive ? "Fortsett økt" : "Start dagens økt"}
            </Button>
          </Link>
          <Link href="/portal/planlegge">
            <Button variant="ghost-dark" size="md">Se i planen</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
