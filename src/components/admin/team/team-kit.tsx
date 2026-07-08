"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { PresenceDot, type PresenceState } from "@/components/athletic/presence-dot";
import { Tag } from "@/components/athletic/golfdata";

/* CBAC-roller og AK-perioder som golfdata Tag-komposisjoner (aksefarger via tokens). */
export type CoachRole = "EIER" | "HEAD_COACH" | "COACH" | "FYS" | "ASSISTENT" | "BILLING";
export type PeriodeKind = "GRUNN" | "SPES" | "TURN" | "SKADE" | "TEST";

const ROLLE_META: Record<CoachRole, { label: string; variant: "signal" | "neutral" | "outline" | "up"; stil?: React.CSSProperties }> = {
  EIER: { label: "Eier", variant: "signal" },
  HEAD_COACH: { label: "Head coach", variant: "outline" },
  COACH: { label: "Coach", variant: "neutral" },
  FYS: { label: "Fys", variant: "neutral", stil: { background: "var(--axis-fys-soft)", color: "var(--axis-fys-text)" } },
  ASSISTENT: { label: "Assistent", variant: "neutral" },
  BILLING: { label: "Billing", variant: "outline", stil: { color: "var(--warning)", borderColor: "var(--warning-border)" } },
};

function RolleTag({ role }: { role: CoachRole }) {
  const m = ROLLE_META[role];
  return <Tag size="sm" variant={m.variant} style={m.stil}>{m.label}</Tag>;
}

const PERIODE_META: Record<PeriodeKind, { label: string; stil: React.CSSProperties }> = {
  GRUNN: { label: "Grunntrening", stil: { background: "var(--axis-fys-soft)", color: "var(--axis-fys-text)" } },
  SPES: { label: "Spesiell", stil: { background: "var(--axis-tek-soft)", color: "var(--axis-tek-text)" } },
  TURN: { label: "Turnering", stil: { background: "var(--axis-turn-soft)", color: "var(--axis-turn-text)" } },
  SKADE: { label: "Skade", stil: { background: "color-mix(in srgb, var(--destructive) 12%, transparent)", color: "var(--destructive)" } },
  TEST: { label: "Test", stil: { background: "var(--axis-slag-soft)", color: "var(--axis-slag-text)" } },
};

function PeriodePill({ kind }: { kind: PeriodeKind }) {
  const m = PERIODE_META[kind];
  return <Tag size="sm" variant="neutral" style={m.stil}>{m.label}</Tag>;
}
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
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
                <RolleTag key={r} role={r} />
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
        <PeriodePill kind={mal.periode} />
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
