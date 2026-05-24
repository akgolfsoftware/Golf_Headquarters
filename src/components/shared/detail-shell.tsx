import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type DetailShellProps = {
  breadcrumb: { label: string; href?: string }[];
  backHref?: string;
  title: React.ReactNode;
  subtitle?: string;
  statusPill?: React.ReactNode;
  actions?: React.ReactNode;
  kpiRow?: React.ReactNode;
  tabs?: React.ReactNode;
  stickyActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard detalj-side shell.
 *
 * Layout: breadcrumb + hero (tittel + subtitle + status + actions) + KPI-rad + tabs + innhold + sticky actions.
 *
 * Bruk på alle ~30 detalj-sider for konsistens.
 *
 * Eksempel:
 * <DetailShell
 *   breadcrumb={[{ label: "Tren", href: "/portal/tren" }, { label: "FYS-plan", href: "/portal/tren/fys-plan" }, { label: "Vinter 2026" }]}
 *   backHref="/portal/tren/fys-plan"
 *   title="Vinter 2026 · grunntrening"
 *   subtitle="Spesialisering · 12 økter planlagt"
 *   statusPill={<AthleticBadge variant="ok">AKTIV</AthleticBadge>}
 *   kpiRow={<KPICardsRow />}
 *   tabs={<TabsBar />}
 * >
 *   <Content />
 * </DetailShell>
 */
export function DetailShell({
  breadcrumb,
  backHref,
  title,
  subtitle,
  statusPill,
  actions,
  kpiRow,
  tabs,
  stickyActions,
  children,
  className,
}: DetailShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Breadcrumb items={breadcrumb} backHref={backHref} />

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl">
              {title}
            </h1>
            {statusPill}
          </div>
          {subtitle && (
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>

      {kpiRow && <div>{kpiRow}</div>}

      {tabs && <div className="border-b border-border pb-2">{tabs}</div>}

      <div>{children}</div>

      {stickyActions && (
        <div className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-background/80 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex items-center justify-between gap-3">
            {stickyActions}
          </div>
        </div>
      )}
    </div>
  );
}
