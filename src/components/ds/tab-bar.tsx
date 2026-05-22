/**
 * <TabBar> — lime-accent tabs med URL-state (?tab=X)
 *
 * Plan-IA: brukes i alle hovedseksjoner (Planlegge/Gjennomføre/Analysere/Coach
 * + CoachHQ-tilsvarende). Pille-knapper med count-badge per Q1-CSS-spec.
 */

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  count?: number;
  badge?: "lime" | "warn" | "danger";
};

type TabBarProps = {
  tabs: TabItem[];
  defaultTab?: string;
  paramName?: string;
  className?: string;
};

export function TabBar({
  tabs,
  defaultTab,
  paramName = "tab",
  className,
}: TabBarProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeId = params.get(paramName) ?? defaultTab ?? tabs[0]?.id;

  return (
    <nav
      role="tablist"
      aria-label="Seksjons-tabs"
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border bg-card px-1 py-2",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const href = `${pathname}?${paramName}=${tab.id}`;
        return (
          <Link
            key={tab.id}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "text-xs",
              isActive
                ? "border-2 border-[var(--color-accent-deep)] bg-[var(--color-tab-active-bg)] px-[13px] py-[7px] text-[var(--color-tab-active-text)]"
                : "border-border bg-card text-foreground hover:bg-[var(--color-tint,#F4F2EC)]",
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "font-mono rounded-full px-1.5 py-px text-[10px] font-medium tabular-nums",
                  isActive
                    ? "bg-white/50 text-[var(--color-tab-active-text)]"
                    : "bg-[var(--color-tint,#F4F2EC)] text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
