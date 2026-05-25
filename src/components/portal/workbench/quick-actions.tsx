/**
 * QuickActions — utvidet snarvei-rad for Player Workbench.
 *
 * Tar 6-8 actions og legger dem i et 4-kolonne grid (2 på mobile).
 * Hver action har Lucide-ikon, label og href. `highlight: true` gir
 * primary-tonet styling for hoved-CTAen.
 *
 * Referanse: Spor C i Sprint 1 (Player Workbench v2).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Flag,
  Play,
  CalendarPlus,
  ClipboardCheck,
  Video,
  MessageSquare,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type QuickAction = {
  label: string;
  href: string;
  icon: ReactNode;
  highlight?: boolean;
};

export type QuickActionsProps = {
  actions?: QuickAction[];
  className?: string;
};

// ---------- Default actions ----------

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Logg runde",
    href: "/portal/mal/runder/ny",
    icon: <Flag className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Start økt",
    href: "/portal/tren/ny-okt",
    icon: <Play className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Ny booking",
    href: "/portal/booking/ny",
    icon: <CalendarPlus className="h-5 w-5" aria-hidden="true" />,
    highlight: true,
  },
  {
    label: "Ny test",
    href: "/portal/tren/tester/ny",
    icon: <ClipboardCheck className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Last opp video",
    href: "/portal/coach/melding/ny",
    icon: <Video className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Spør coach",
    href: "/portal/coach/melding/ny",
    icon: <MessageSquare className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Se kalender",
    href: "/portal/kalender",
    icon: <Calendar className="h-5 w-5" aria-hidden="true" />,
  },
  {
    label: "Innstillinger",
    href: "/portal/meg/innstillinger",
    icon: <Settings className="h-5 w-5" aria-hidden="true" />,
  },
];

// ---------- Komponent ----------

export function QuickActions({
  actions = DEFAULT_QUICK_ACTIONS,
  className,
}: QuickActionsProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className
      )}
      aria-labelledby="quick-actions-heading"
    >
      <h2
        id="quick-actions-heading"
        className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
      >
        Snarveier
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={`${action.label}-${action.href}`}
            href={action.href}
            className={cn(
              "flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition",
              action.highlight
                ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                : "border-border bg-card text-foreground hover:border-primary hover:bg-secondary/50"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                action.highlight
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              )}
              aria-hidden="true"
            >
              {action.icon}
            </span>
            <span className="text-xs font-medium leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
