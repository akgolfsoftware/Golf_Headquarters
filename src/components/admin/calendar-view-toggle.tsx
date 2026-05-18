import Link from "next/link";

/**
 * ViewToggle — 3-pill toggle for kalender-visning (Dag / Uke / Måned).
 * Brukes i toolbar på /admin/calendar og /admin/calendar/maned.
 */
export type CalendarView = "day" | "week" | "month";

const OPTIONS: { view: CalendarView; label: string; href: string }[] = [
  { view: "day", label: "Dag", href: "/admin/calendar?view=day" },
  { view: "week", label: "Uke", href: "/admin/calendar?view=week" },
  { view: "month", label: "Måned", href: "/admin/calendar/maned" },
];

export function CalendarViewToggle({ active }: { active: CalendarView }) {
  return (
    <div
      role="tablist"
      aria-label="Kalender-visning"
      className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-xs"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.view === active;
        return (
          <Link
            key={opt.view}
            href={opt.href}
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
