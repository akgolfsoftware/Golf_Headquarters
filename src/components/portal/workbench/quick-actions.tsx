/**
 * QuickActions — utvidet snarvei-rad for Player Workbench.
 *
 * Tar 6-8 actions og legger dem i et 4-kolonne grid (2 på mobile).
 * Hver action har Lucide-ikon, label og href. `highlight: true` gir
 * primary-tonet styling for hoved-CTAen.
 *
 * Athletic editorial: større ikon-bokser, subtile hover-løft og mer
 * dramatisk typografi for label. Highlight-action får dark moment.
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
    label: "Kalender",
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
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4", className)}>
      {actions.map((action) => (
        <Link
          key={`${action.label}-${action.href}`}
          href={action.href}
          className={cn(
            "group flex min-h-[100px] flex-col items-center justify-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-md",
            action.highlight
              ? "border-foreground/15 bg-foreground text-background shadow-md hover:bg-foreground/95"
              : "border-border bg-card text-foreground hover:border-foreground/20",
          )}
        >
          <span
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-transform group-hover:scale-110",
              action.highlight
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background",
            )}
            aria-hidden="true"
          >
            {action.icon}
          </span>
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-[0.10em] leading-tight",
              action.highlight ? "text-background" : "text-foreground",
            )}
          >
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
