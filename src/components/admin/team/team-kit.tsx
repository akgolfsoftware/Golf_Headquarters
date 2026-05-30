"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceDot, type PresenceState } from "@/components/athletic/presence-dot";
import { RoleBadge, PeriodeTag, type CoachRole, type PeriodeKind } from "@/components/athletic/agency-tags";
import { PyrDistBar, type PyrDist } from "@/components/athletic/data/pyr-dist-bar";

/* ── Team-roster ───────────────────────────────────────────────────────── */

export type TeamMember = {
  id: string;
  initials: string;
  name: string;
  email: string;
  presence: PresenceState;
  roles: CoachRole[];
  scope: string;
  lastSeen: string;
  avatarClass?: string;
};

export function TeamRosterList({
  members,
  onMenu,
  className,
}: {
  members: TeamMember[];
  onMenu?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {members.map((m) => (
        <div key={m.id} className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-4 px-4 py-3">
          <span className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full font-display text-xs font-bold", m.avatarClass ?? "bg-secondary text-foreground")}>
            {m.initials}
            <PresenceDot state={m.presence} overlay ringClassName="ring-card" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-foreground">{m.name}</span>
              {m.roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span className="truncate">{m.email}</span>
              <span className="text-border">·</span>
              <span className="truncate uppercase tracking-[0.06em]">{m.scope}</span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{m.lastSeen}</span>
          <button
            type="button"
            onClick={() => onMenu?.(m.id)}
            aria-label="Medlemsmeny"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Plan-mal-kort ─────────────────────────────────────────────────────── */

export type PlanMal = {
  id: string;
  name: string;
  periode: PeriodeKind;
  dist: PyrDist;
  stats: string;
};

export function PlanMalCard({ mal, onClick, className }: { mal: PlanMal; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4 text-left transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-sm font-bold leading-tight tracking-[-0.01em] text-foreground">{mal.name}</span>
        <PeriodeTag kind={mal.periode} />
      </div>
      <PyrDistBar dist={mal.dist} />
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{mal.stats}</span>
    </button>
  );
}

export function NewPlanMalCard({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-accent/60 bg-accent/[0.04] p-4 text-primary transition-colors hover:bg-accent/10",
        className,
      )}
    >
      <Plus className="h-5 w-5" strokeWidth={1.5} />
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]">Ny plan-mal</span>
    </button>
  );
}
