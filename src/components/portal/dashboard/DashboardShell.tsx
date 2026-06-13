"use client";

import type { DashboardData } from "@/app/portal/actions";
import { cn } from "@/lib/utils";

export type DashboardShellProps = {
  data: DashboardData;
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({ data, children, className }: DashboardShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl", className)}>
      <div className="mb-4 md:mb-6">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Uke {data.weekNumber}
        </span>
      </div>
      {children}
    </div>
  );
}
