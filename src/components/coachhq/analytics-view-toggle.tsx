import Link from "next/link";

/**
 * AnalyticsViewToggle — 3-pill toggle for treningsanalyse-visning
 * (Bento / Heatmap / Trend). Matcher mønster fra calendar-view-toggle.
 */
export type AnalyticsView = "bento" | "heatmap" | "trend";

const OPTIONS: { view: AnalyticsView; label: string }[] = [
  { view: "bento", label: "Bento" },
  { view: "heatmap", label: "Heatmap" },
  { view: "trend", label: "Trend" },
];

export function AnalyticsViewToggle({ active }: { active: AnalyticsView }) {
  return (
    <div
      role="tablist"
      aria-label="Analyse-visning"
      className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-xs"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.view === active;
        const href =
          opt.view === "bento"
            ? "/admin/analytics"
            : `/admin/analytics?view=${opt.view}`;
        return (
          <Link
            key={opt.view}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "rounded-sm bg-card px-4 py-1.5 font-medium text-foreground shadow-sm"
                : "rounded-sm px-4 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
