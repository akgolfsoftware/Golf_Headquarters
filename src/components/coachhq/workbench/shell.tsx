/**
 * CoachWorkbenchShell — layout-wrapper for Coach Workbench.
 *
 * Binder sammen alle Foundation-komponenter (TopBar, Hero, KeyMetrics, Tabs)
 * pluss inject-slot for caddie-chat (Spor B) og tab-innhold (Spor C/D).
 *
 * Pure presentational — alle slots fylles av koordinator.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type CoachWorkbenchShellProps = {
  topBar: ReactNode;
  hero: ReactNode;
  metrics: ReactNode;
  caddieChat: ReactNode;
  tabs: ReactNode;
  tabContent: ReactNode;
  className?: string;
};

// ---------- Komponent ----------

export function CoachWorkbenchShell({
  topBar,
  hero,
  metrics,
  caddieChat,
  tabs,
  tabContent,
  className,
}: CoachWorkbenchShellProps) {
  return (
    <div
      className={cn("mx-auto max-w-7xl space-y-6 p-4 md:p-6", className)}
    >
      {topBar}
      {hero}
      {metrics}
      {caddieChat}
      <div className="border-b border-border">{tabs}</div>
      <div>{tabContent}</div>
    </div>
  );
}
