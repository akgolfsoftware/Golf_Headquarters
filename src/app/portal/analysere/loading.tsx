import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 p-6">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard height="h-64" />
        <SkeletonCard height="h-64" />
      </div>
      <SkeletonList rows={5} />
    </div>
  );
}
