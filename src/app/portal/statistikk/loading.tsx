import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function StatistikkLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={3} />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
