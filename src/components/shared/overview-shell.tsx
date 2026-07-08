import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

type OverviewShellProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard dashboard-hub shell.
 *
 * Layout: hero (eyebrow + ikon + tittel + subtitle + actions) + children (cards-grid).
 *
 * Bruk på alle 12 toppnivå-dashboards.
 *
 * Eksempel:
 * <OverviewShell
 *   eyebrow="COACHHQ · COACH"
 *   icon={CalendarRange}
 *   title={<>Bygg <em>planer</em></>}
 *   subtitle="Treningsplaner, plan-maler, teknisk plan og drill-bibliotek."
 *   actions={<Button>+ Ny plan</Button>}
 * >
 *   <DrillCardsGrid />
 * </OverviewShell>
 */
export function OverviewShell({
  eyebrow,
  title,
  subtitle,
  icon: IconComponent,
  actions,
  children,
  className,
}: OverviewShellProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {IconComponent && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
              <IconComponent
                size={22}
                strokeWidth={1.75}
                className="text-primary"
                aria-hidden
              />
            </div>
          )}
          <div className="space-y-2">
            <AthleticEyebrow>{eyebrow}</AthleticEyebrow>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
