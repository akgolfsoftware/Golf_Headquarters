"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export type DataStateProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeletonRows?: number;
  className?: string;
};

function SkeletonRows({ rows, className }: { rows: number; className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={cn("h-3", i % 3 === 0 ? "w-2/3" : i % 3 === 1 ? "w-3/4" : "w-1/2")} />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, className }: { message?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
    >
      <AlertCircle size={24} strokeWidth={1.5} className="text-destructive/70" />
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">Noe gikk galt</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

export function DataState({
  isLoading = false,
  isEmpty = false,
  isError = false,
  errorMessage,
  children,
  emptyIcon,
  emptyTitle = "Ingen data",
  emptyDescription,
  emptyAction,
  skeletonRows = 3,
  className,
}: DataStateProps) {
  if (isLoading) {
    return <SkeletonRows rows={skeletonRows} className={className} />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} className={className} />;
  }

  if (isEmpty && emptyIcon) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
}
