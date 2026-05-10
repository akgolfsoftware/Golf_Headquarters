// Loading-skeleton for /portal og alle sub-routes uten egen loading.tsx.

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      <Skel h="h-20" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} h="h-24" />
        ))}
      </div>
      <Skel h="h-48" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skel key={i} h="h-32" />
        ))}
      </div>
    </div>
  );
}

function Skel({ h }: { h: string }) {
  return (
    <div
      className={`${h} animate-pulse rounded-lg border border-border bg-muted/40`}
      aria-hidden
    />
  );
}
