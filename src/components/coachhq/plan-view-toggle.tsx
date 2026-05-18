import Link from "next/link";
import { Columns3, GanttChart, PanelLeft } from "lucide-react";

/**
 * PlanViewToggle — 3-pill toggle for treningsplan-visning.
 *
 * Kanban / Tidslinje / Split. Match mønster fra calendar-view-toggle.tsx.
 * Bevarer eksisterende søke-/filter-params via `query` (q).
 */
export type PlanView = "kanban" | "tidslinje" | "split";

const OPTIONS: {
  view: PlanView;
  label: string;
  icon: typeof Columns3;
}[] = [
  { view: "kanban", label: "Kanban", icon: Columns3 },
  { view: "tidslinje", label: "Tidslinje", icon: GanttChart },
  { view: "split", label: "Split", icon: PanelLeft },
];

export function PlanViewToggle({
  active,
  q,
}: {
  active: PlanView;
  q?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Plan-visning"
      className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-xs"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.view === active;
        const params = new URLSearchParams();
        params.set("view", opt.view);
        if (q) params.set("q", q);
        const href = `/admin/plans?${params.toString()}`;
        const Icon = opt.icon;
        return (
          <Link
            key={opt.view}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "inline-flex items-center gap-1.5 rounded-sm bg-card px-4 py-1.5 font-medium text-foreground shadow-sm"
                : "inline-flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            <Icon size={13} strokeWidth={1.75} />
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
