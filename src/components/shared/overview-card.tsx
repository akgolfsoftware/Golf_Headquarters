import { Eyebrow, Tag } from "@/components/athletic/golfdata";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type OverviewCardProps = {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  primaryLine?: React.ReactNode;
  secondaryLine?: React.ReactNode;
  badge?: {
    label: string;
    variant?: "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok";
  };
  className?: string;
};

/**
 * Standard drill-in card for dashboards.
 * Følger PlanleggeOverview-mønsteret.
 *
 * Bruk i OverviewShell.
 *
 * Eksempel:
 * <OverviewCard
 *   href="/admin/plans"
 *   icon={CalendarRange}
 *   eyebrow="Treningsplaner"
 *   title="14 aktive planer"
 *   primaryLine="6 utkast"
 *   secondaryLine="Sist endret 21. mai"
 *   badge={{ label: "3 nye", variant: "lime" }}
 * />
 */
// Oversetter kortets gamle badge-vokabular til golfdata Tag-varianter.
// (warn får warning-tokens via style — Tag mangler warn-variant, DS-gap meldt.)
const BADGE_TIL_TAG = {
  primary: "signal",
  lime: "signal",
  neutral: "neutral",
  warn: "outline",
  urgent: "down",
  ok: "up",
} as const;

export function OverviewCard({
  href,
  icon: IconComponent,
  eyebrow,
  title,
  primaryLine,
  secondaryLine,
  badge,
  className,
}: OverviewCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 md:p-6",
        "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <IconComponent
            size={18}
            strokeWidth={1.75}
            className="text-primary"
            aria-hidden
          />
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <Tag
              variant={BADGE_TIL_TAG[badge.variant ?? "primary"]}
              style={badge.variant === "warn" ? { color: "var(--warning)", borderColor: "var(--warning-border)" } : undefined}
            >
              {badge.label}
            </Tag>
          )}
          <ArrowUpRight
            size={16}
            strokeWidth={1.75}
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Eyebrow as="span">{eyebrow}</Eyebrow>
        <h3 className="font-display text-xl font-semibold leading-tight">
          {title}
        </h3>
      </div>

      {(primaryLine || secondaryLine) && (
        <div className="border-t border-border pt-2 space-y-1">
          {primaryLine && (
            <div className="text-sm text-foreground">{primaryLine}</div>
          )}
          {secondaryLine && (
            <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              {secondaryLine}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
