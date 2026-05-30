import {
  Crown,
  Shield,
  User,
  Activity,
  Users,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── CBAC-rolle-badge ──────────────────────────────────────────────────── */

export type CoachRole =
  | "EIER"
  | "HEAD_COACH"
  | "COACH"
  | "FYS"
  | "ASSISTENT"
  | "BILLING";

const roleMeta: Record<CoachRole, { label: string; icon: LucideIcon; cls: string }> = {
  EIER: { label: "Eier", icon: Crown, cls: "bg-accent text-primary" },
  HEAD_COACH: { label: "Head coach", icon: Shield, cls: "bg-primary/10 text-primary" },
  COACH: { label: "Coach", icon: User, cls: "bg-secondary text-secondary-foreground" },
  FYS: { label: "Fys", icon: Activity, cls: "bg-pyr-fys-track text-success-foreground" },
  ASSISTENT: { label: "Assistent", icon: Users, cls: "bg-secondary text-muted-foreground" },
  BILLING: { label: "Billing", icon: CreditCard, cls: "bg-warning/15 text-warning-foreground" },
};

export function RoleBadge({ role, className }: { role: CoachRole; className?: string }) {
  const m = roleMeta[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
        m.cls,
        className,
      )}
    >
      <m.icon className="h-2.5 w-2.5" strokeWidth={1.5} />
      {m.label}
    </span>
  );
}

/* ── Periode-tag ───────────────────────────────────────────────────────── */

export type PeriodeKind = "GRUNN" | "SPES" | "TURN" | "SKADE" | "TEST";

const periodeMeta: Record<PeriodeKind, { label: string; cls: string }> = {
  GRUNN: { label: "Grunntrening", cls: "bg-pyr-fys-track text-success-foreground" },
  SPES: { label: "Spesiell", cls: "bg-pyr-tek-track text-warning-foreground" },
  TURN: { label: "Turnering", cls: "bg-pyr-turn-track text-destructive-foreground" },
  SKADE: { label: "Skade", cls: "bg-destructive/10 text-destructive" },
  TEST: { label: "Test", cls: "bg-pyr-slag-track text-info-foreground" },
};

export function PeriodeTag({ kind, className }: { kind: PeriodeKind; className?: string }) {
  const m = periodeMeta[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
        m.cls,
        className,
      )}
    >
      {m.label}
    </span>
  );
}

/* ── Severity-dot ──────────────────────────────────────────────────────── */

export type Severity = "hi" | "md" | "lo" | "ok";

const severityCls: Record<Severity, string> = {
  hi: "bg-destructive",
  md: "bg-warning",
  lo: "bg-muted-foreground",
  ok: "bg-success",
};

export function SeverityDot({ level, className }: { level: Severity; className?: string }) {
  return (
    <span
      aria-label={`Prioritet: ${level}`}
      className={cn("inline-block h-1.5 w-1.5 rounded-full", severityCls[level], className)}
    />
  );
}
