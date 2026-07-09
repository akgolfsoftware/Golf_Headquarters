import {
  SkeletonCard,
  SkeletonHero,
} from "@/components/shared/loading-skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} height="h-40" />
        ))}
      </div>
    </div>
  );
}
