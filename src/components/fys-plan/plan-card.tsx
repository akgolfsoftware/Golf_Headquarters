import Link from "next/link";
import { Dumbbell, ChevronRight } from "lucide-react";
import type { TechPlanStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type FysPlanCardProps = {
  id: string;
  navn: string;
  status: TechPlanStatus;
  startDato: Date;
  sluttDato: Date | null;
  ukerCount: number;
  okterCount: number;
};

/**
 * Kort for en fysisk treningsplan i plan-listen.
 *
 * Anatomi:
 * - Top: Dumbbell-ikon + status-badge
 * - Tittel: plan-navn (Familjen Grotesk bold)
 * - Meta: periode (start → slutt)
 * - Bottom: uker/økter-tellinger + chevron
 *
 * Klikkbart → /portal/tren/fys-plan/[id]
 */
export function FysPlanCard({
  id,
  navn,
  status,
  startDato,
  sluttDato,
  ukerCount,
  okterCount,
}: FysPlanCardProps) {
  return (
    <Link
      href={`/portal/tren/fys-plan/${id}`}
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all",
        "hover:border-primary hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-foreground">
          <Dumbbell size={18} strokeWidth={1.5} aria-hidden />
        </div>
        <StatusPill status={status} />
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
          {navn}
        </h3>
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
          {formatPeriode(startDato, sluttDato)}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex gap-4 text-sm">
          <Stat label="Uker" value={ukerCount} />
          <Stat label="Økter" value={okterCount} />
        </div>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: TechPlanStatus }) {
  const cfg = {
    DRAFT: { label: "Utkast", cls: "bg-muted text-muted-foreground" },
    ACTIVE: { label: "Aktiv", cls: "bg-primary text-primary-foreground" },
    ARCHIVED: { label: "Arkivert", cls: "bg-secondary text-secondary-foreground" },
  }[status];

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

function formatPeriode(start: Date, slutt: Date | null): string {
  const startStr = start.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!slutt) return `Fra ${startStr}`;
  const sluttStr = slutt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} → ${sluttStr}`;
}
