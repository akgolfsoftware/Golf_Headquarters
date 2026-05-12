import {
  SkeletonCard,
  SkeletonHero,
  SkeletonKpi,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function ElevDetaljLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonCard height="h-64" />
      <SkeletonList rows={5} />
    </div>
  );
}
