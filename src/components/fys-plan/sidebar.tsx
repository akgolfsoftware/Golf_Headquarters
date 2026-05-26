import { CalendarDays, ListChecks, Plus } from "lucide-react";
import type { TechPlanStatus } from "@/generated/prisma/client";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type FysPlanSidebarProps = {
  navn: string;
  status: TechPlanStatus;
  startDato: Date;
  sluttDato: Date | null;
  ukerCount: number;
  okterTotalCount: number;
  okterFullfortCount: number;
  onLeggTilUke?: () => void;
  onNyOkt?: () => void;
};

/**
 * Høyre-kolonne sammendrag for en fysisk plan.
 * Inneholder plan-meta, progress-bar og quick-actions.
 */
export function FysPlanSidebar({
  navn,
  status,
  startDato,
  sluttDato,
  ukerCount,
  okterTotalCount,
  okterFullfortCount,
  onLeggTilUke,
  onNyOkt,
}: FysPlanSidebarProps) {
  const progressPct = okterTotalCount > 0
    ? Math.round((okterFullfortCount / okterTotalCount) * 100)
    : 0;

  return (
    <aside className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Plan
        </p>
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
          {navn}
        </h3>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <MetaRow
          icon={<CalendarDays size={14} strokeWidth={1.5} />}
          label="Periode"
          value={formatPeriode(startDato, sluttDato)}
        />
        <MetaRow
          icon={<ListChecks size={14} strokeWidth={1.5} />}
          label="Uker"
          value={`${ukerCount}`}
        />
        <MetaRow
          icon={<ListChecks size={14} strokeWidth={1.5} />}
          label="Økter"
          value={`${okterTotalCount}`}
        />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Fullført
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {okterFullfortCount} / {okterTotalCount}
          </p>
        </div>
        <ProgressBar value={progressPct} variant="primary" />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Handlinger
        </p>
        <button
          type="button"
          onClick={onLeggTilUke}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium",
            "transition-colors hover:bg-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          )}
        >
          <Plus size={14} strokeWidth={1.75} aria-hidden />
          Legg til uke
        </button>
        <button
          type="button"
          onClick={onNyOkt}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
            "transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          )}
        >
          <Plus size={14} strokeWidth={1.75} aria-hidden />
          Ny økt
        </button>
      </div>
    </aside>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-mono text-[11px] uppercase tracking-[0.06em]">
          {label}
        </span>
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: TechPlanStatus }) {
  const cfg = {
    DRAFT: { label: "Utkast", cls: "bg-muted text-muted-foreground" },
    ACTIVE: { label: "Aktiv", cls: "bg-primary text-primary-foreground" },
    ARCHIVED: { label: "Arkivert", cls: "bg-secondary text-secondary-foreground" },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

function formatPeriode(start: Date, slutt: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString("nb-NO", opts);
  if (!slutt) return `${startStr} →`;
  const sluttStr = slutt.toLocaleDateString("nb-NO", opts);
  return `${startStr} → ${sluttStr}`;
}
