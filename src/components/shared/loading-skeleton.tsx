/**
 * LoadingSkeleton — delte skeleton-mønstre for Suspense-fallbacks.
 *
 * Bruker semantiske tokens (bg-secondary) og animate-pulse.
 * Komponenter: <SkeletonHero />, <SkeletonCard />, <SkeletonList />,
 *              <SkeletonTable />, <SkeletonKpi />.
 */

export function SkeletonHero() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
      <div className="h-9 w-72 animate-pulse rounded bg-secondary" />
      <div className="h-4 w-96 animate-pulse rounded bg-secondary/60" />
    </div>
  );
}

export function SkeletonKpi({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = "h-32" }: { height?: string }) {
  return (
    <div
      className={`${height} animate-pulse rounded-lg border border-border bg-card`}
    />
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-border bg-card p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 8,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid gap-3 border-b border-border p-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-secondary/60"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-3 border-b border-border last:border-0 p-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 animate-pulse rounded bg-secondary/40"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
