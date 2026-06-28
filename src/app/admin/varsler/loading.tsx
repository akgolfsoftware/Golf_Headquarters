import { Skeleton } from "@/components/athletic";

export default function VarslerLoading() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
      {[0, 1, 2].map((g) => (
        <div key={g} className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
